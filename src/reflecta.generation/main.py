from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os, uuid
from azure.identity import DefaultAzureCredential, ManagedIdentityCredential
from azure.storage.queue import QueueServiceClient, QueueClient, QueueMessage
from azure.core.exceptions import ResourceNotFoundError
from azure.core.pipeline.transport import RequestsTransport
import time
from datetime import datetime, timezone
import re
import json
import concurrent.futures
import pandas
import requests
import tiktoken
import pymongo
import openai
from openai.embeddings_utils import get_embedding, cosine_similarity
import multiprocessing
from multiprocessing import Pool, Manager
import warnings
import queue
import random
import sys
import traceback
from tqdm import tqdm

def config_openai():
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_API_BASE = os.getenv('OPENAI_API_BASE')

    openai.api_type = "azure"
    openai.api_key = os.getenv('OPENAI_API_KEY')
    openai.api_base = os.getenv('OPENAI_API_BASE')
    openai.api_version = "2023-03-15-preview"

# Modify the signature to be able to pass a function as a parameter
def call_with_retry(function=None, max_retries=10):
    for i in range(max_retries):
        try:
            return function()
        except Exception as e:
            print(f"Retrying: {e}")
            if i < max_retries - 1:  # i is zero indexed
                sleep_time = 2 ** i  # exponential backoff
                time.sleep(sleep_time)
            else:
                raise e  # re-throw the last exception if all retries failed

def search_docs(df, user_query):
    # df2 is top 100 of df
    # df2 = df.head(100)
    df2 = df
    embedding = get_embedding(user_query, engine="ada-2")
    df2["cosine_similarity"] = df2.ada_v2.apply(lambda x: cosine_similarity(x, embedding))
    res = (df2.sort_values("cosine_similarity", ascending=False))
    return res

def criteria_match(document_content, extracted_criteria):
    # prompt = f"\
    # Tell me if the incident described in the text delimited by the triple quotes ```{document_content}``` matches the below set of criteria: \n {extracted_criteria} \
    # Answer ONLY with either 'Yes' or 'No' and nothing else."
    with open('prompt_criteria_match.txt', 'r') as file:
        prompt = file.read()
        prompt = prompt.replace('{document_content}', document_content)
        prompt = prompt.replace('{extracted_criteria}', extracted_criteria)

    # If the call fails, retry it using an exponential delay between retries
    # max_retries = 10
    # for i in range(max_retries):
    #     try:
    #         matching = openai.ChatCompletion.create(
    #             # engine="reflecta-gpt35-turbo-deployment",
    #             engine="reflecta-gpt4-8k-deployment",
    #             messages = [{"role": "system", "content":prompt}],
    #             temperature=0.1
    #         )
    #         return matching
    #     except Exception as e:
    #         if i < max_retries - 1:  # i is zero indexed
    #             sleep_time = 2 ** i  # exponential backoff
    #             time.sleep(sleep_time)
    #         else:
    #             raise e  # re-throw the last exception if all retries failed
        matching = call_with_retry(lambda: openai.ChatCompletion.create(
                    engine="reflecta-gpt4-8k-deployment",
                    messages = [{"role": "system", "content":prompt}],
                    temperature=0.1
                ), max_retries=10)

    return matching

def process_incident(similar_incidents, selected_incidents, extracted_criteria, oxdotQueue, i):
    success = False
    while not success:
        try:
            # Sleep for a random amount of time to avoid hitting the API rate limit
            sleep_time = random.uniform(0.01, 0.05)
            time.sleep(sleep_time)
            document_content = similar_incidents.iloc[i]['Event Description']
            matching = criteria_match(document_content, extracted_criteria)
            oxDot = ""
            if("yes" in matching['choices'][0]['message']['content'].lower()):
                # Add the event to selected_incidents
                selected_incidents.put(similar_incidents.iloc[i])
                oxDot = "O"
            else:
                oxDot = "."
            success = True
        except Exception as e:
            # print(f"Exception: {str(e)}")
            oxDot = "X"
            time.sleep(0.5)
    print(f"{oxDot} ({oxdotQueue.qsize()} / {len(similar_incidents)})")
    # Create anonymous object with document id and oxDot value
    oxDotDict = {"id": similar_incidents.iloc[i]['ID'], "oxDot": oxDot, "matching": matching}
    oxdotQueue.put(oxDotDict)
    sys.stdout.flush()

def process(json_message, json_file, date):

    cost_1000_completion_gpt432 = float(os.getenv('COST_COMPLETION_GPT432'))
    cost_1000_completion_gpt48 = float(os.getenv('COST_COMPLETION_GPT48'))
    cost_1000_prompt_gpt432 = float(os.getenv('COST_PROMPT_GPT432'))
    cost_1000_prompt_gpt48 = float(os.getenv('COST_PROMPT_GPT48'))

    question = json_message['prompt']
    
    start_time = time.time()
    # Read file 'prompt_criteria.txt' into prompt as a string
    with open('prompt_criteria.txt', 'r') as file:
        prompt = file.read()
        prompt = prompt.replace('{question}', question)

    criteria = call_with_retry(lambda: openai.ChatCompletion.create(
        engine="reflecta-gpt4-8k-deployment", # engine = "deployment_name".
        messages = [{"role": "system", "content":prompt}],
                    temperature=0.1
                ), max_retries=10)


    print(f"Generating criteria...")
    
    tokens_prompt_gpt48 = criteria['usage']['prompt_tokens']
    tokens_completion_gpt48 = criteria['usage']['completion_tokens']


    extracted_criteria = criteria['choices'][0]['message']['content']    
    print(extracted_criteria)

    print(f"Sorting incidents using these criteria...")
    similar_incidents = search_docs(data_description, extracted_criteria)
    similar_incidents = similar_incidents.reset_index()
    similar_incidents.drop('index', axis=1, inplace=True)

    limit_tokens = 30000
    # list_indices = []
    concatenated_text = ""
    print(f"Matching incidents with criteria...")
    selected_incidents = queue.Queue()
    oxdotQueue = queue.Queue()
    total_tokens = 0
    
    ## Unstable parallel version
    # degree_of_parallelism = 2
    # with concurrent.futures.ThreadPoolExecutor(max_workers=degree_of_parallelism) as executor:
    #     for i in range(len(similar_incidents)):
    #         executor.submit(process_incident, similar_incidents, selected_incidents, extracted_criteria, oxdotQueue, i)

    # foreach on similar_incidents run process_incident
    for i in range(len(similar_incidents)):
        process_incident(similar_incidents, selected_incidents, extracted_criteria, oxdotQueue, i)

    # Take all values of oxDotQueue and put them in a dictionary
    oxDotDict = {}
    while (oxdotQueue.qsize() > 0):
        oxDot = oxdotQueue.get()
        oxDotDict[oxDot['id']] = [oxDot['oxDot'], oxDot['matching']]

    # get the list of ids of similar_incidents in order
    similar_incidents_ids = similar_incidents['ID'].tolist()
    # create a list of oxDot values in order
    oxDotList = []
    comp_tokens_prompt = 0
    comp_tokens_completion = 0
  
    for i in range(len(similar_incidents_ids)):
        oxDotList.append(oxDotDict[similar_incidents_ids[i]][0])
        
        comp_tokens_prompt += oxDotDict[similar_incidents_ids[i]][1]['usage']['prompt_tokens']
        comp_tokens_completion += oxDotDict[similar_incidents_ids[i]][1]['usage']['completion_tokens']
  
    # print the content of oxDotList to a string
    oxDotString = "".join(oxDotList)
    print(oxDotString)

    tokens_prompt_gpt48 += comp_tokens_prompt
    tokens_completion_gpt48 += comp_tokens_completion
 

    total_tokens = 0
    selected_incidents_ids = []
    skipped_incidents_ids = []
    concatenated_text = "["
    while (selected_incidents.qsize() > 0):
        selected_incident = selected_incidents.get()
        # Adds the incident to the list of selected incidents if the total number of tokens is below the limit
        # n_tokens = selected_incident['n_tokens']
        text_to_add = "\n{\n \"Incident ID\": \""+ str(selected_incident['ID']) + "\", \"Incident Description\": \"" + selected_incident['Event Description'].replace("\"", "'") + "\"}\n},\n"
        n_tokens = len(tokenizer.encode(text_to_add))

        if (total_tokens + n_tokens >= limit_tokens):
            skipped_incidents_ids.append(selected_incident['ID'])
        else:
            selected_incidents_ids.append(selected_incident['ID'])
            # concatenated_text += "\n-----\n" + selected_incident['Event Description'] + "\n-----\n"
            concatenated_text += text_to_add
            total_tokens = total_tokens + n_tokens

    # If there is a trailing comma, remove it
    if (concatenated_text[-2:] == ",\n"):
        concatenated_text = concatenated_text[:-2]   
    concatenated_text += "]"

    if len(selected_incidents_ids) == 0:
        summary = "No incidents were found matching the criteria."

    else:
        # Summary
        with open('prompt_summary.txt', 'r') as file:
            prompt = file.read().replace('\n', '')
            prompt = prompt.replace('{question}', question)
            prompt = prompt.replace('{concatenated_text}', concatenated_text)

        # print(prompt)

        print("\nGenerating answer...")
        summary = openai.ChatCompletion.create(
            engine="reflecta-gpt4-32k-deployment", # engine = "deployment_name".
            messages = [{"role": "system", "content":prompt}]
        )

   
    tokens_prompt_gpt432 = summary['usage']['prompt_tokens']
    tokens_completion_gpt432 = summary['usage']['completion_tokens']
    
    
    end_time = time.time()
    elapsed_time = end_time - start_time

    # Get all the rows where ID is in the list selected_ids
    df_selected_incidents = data_description.loc[data_description['ID'].isin(selected_incidents_ids)]
    # only keep the ID and Title columns
    df_selected_incidents = df_selected_incidents[['ID', 'QR_Title_EN']]
    df_selected_incidents = df_selected_incidents.rename(columns={'ID': 'id', 'QR_Title_EN': 'title'})
    # Create a list l as a list of object from the [ID, Title] columns of data_description_hipo. Use ID and Title as the keys.
    selected_incidents = df_selected_incidents.to_dict('records')
    
    # Get all the rows where ID is in the list selected_ids
    df_skipped_incidents = data_description.loc[data_description['ID'].isin(skipped_incidents_ids)]
    # only keep the ID and Title columns
    df_skipped_incidents = df_skipped_incidents[['ID', 'QR_Title_EN']]
    df_skipped_incidents = df_skipped_incidents.rename(columns={'ID': 'id', 'QR_Title_EN': 'title'})
    # Create a list l as a list of object from the [ID, Title] columns of data_description_hipo. Use ID and Title as the keys.
    skipped_incidents = df_skipped_incidents.to_dict('records')
    
    queryId = date.strftime("%Y-%m-%d-%H-%M-%S")

    cost_prompt_gpt48 = tokens_prompt_gpt48/1000 * cost_1000_prompt_gpt48
    cost_completion_gpt48 = tokens_completion_gpt48/1000 * cost_1000_completion_gpt48
    cost_prompt_gpt432 = tokens_prompt_gpt432/1000 * cost_1000_prompt_gpt432
    cost_completion_gpt432 = tokens_completion_gpt432/1000 * cost_1000_completion_gpt432

    from_date = data_description['Event Date'].min().isoformat()
    to_date = data_description['Event Date'].max().isoformat()

    incident_time_frame = json_message.get('incidentTimeFrame')
    if incident_time_frame is not None:
        from_date = incident_time_frame.get('from')
        to_date = incident_time_frame.get('to')

    life_saving_rules = json_message.get('lifeSavingRules')
    if life_saving_rules is None:
        life_saving_rules = []

    gbus = json_message.get('gbus')
    if gbus is None:
        gbus = []

    res = {
        "title": json_message['title'],
        "createdBy": json_message['createdBy'],
        "createdDate": date.isoformat(),
        "query": question,
        "systemCompletion": summary['choices'][0]['message']['content'],
        "relatedIncidents": selected_incidents,
        "skippedIncidents": skipped_incidents,
        "runCosts": {
            "models": [
            {
                "model": "gpt4-8k",
                "usage": {
                "promptTokens": tokens_prompt_gpt48,
                "completionTokens": tokens_completion_gpt48,
                "totalTokens": tokens_prompt_gpt48 + tokens_completion_gpt48,
                "promptCosts": cost_prompt_gpt48,
                "completionCosts": cost_completion_gpt48,
                "totalCosts": cost_prompt_gpt48 + cost_completion_gpt48
                }
            },
            {
                "model": "gpt4-32k",
                "usage": {
                "promptTokens": tokens_prompt_gpt432,
                "completionTokens": tokens_completion_gpt432,
                "totalTokens": tokens_prompt_gpt432 + tokens_completion_gpt432,
                "promptCosts": cost_prompt_gpt432,
                "completionCosts": cost_completion_gpt432,
                "totalCosts": cost_prompt_gpt432 + cost_completion_gpt432
                }
            }
            ],
            "totalCost": round(cost_prompt_gpt48 + cost_completion_gpt48 + cost_prompt_gpt432 + cost_completion_gpt432,2),
        },
        "runTimeSeconds": elapsed_time,
        "criteria": extracted_criteria,
        "oxDotMap": oxDotString,
        "queryId": queryId,
        "filters": {"incidentTimeFrame": {"from": from_date,
                                             "to": to_date
                                            },
                    "gbus": gbus,
                    "lifeSavingRules": life_saving_rules,
                    "onlyHipo": json_message['onlyHipo']
                    },
        "pickleUploaded": json_file['uploadedDate'],
        "status": "success"
    }
    return res

def apply_ui_filters(df, json_input):
    incident_time_frame = json_input.get('incidentTimeFrame')
    if incident_time_frame is not None:
        from_date = datetime.fromisoformat(json_input['incidentTimeFrame']['from'])
        from_date = from_date.replace(tzinfo=None)
        to_date = datetime.fromisoformat(json_input['incidentTimeFrame']['to'])
        to_date = to_date.replace(tzinfo=None)
        
        df = df[(df['Event Date'] >= from_date) & (df['Event Date'] <= to_date)]

    if json_input['gbus']:
        df = df[df['GBU'].isin(json_input['gbus'])]

    if json_input['lifeSavingRules']:
        df = df[df['Life Saving Rule'].isin(json_input['lifeSavingRules'])]

    if json_input.get('onlyHipo') is True:
        df = df[df['HIPO'] == True]

    return df

# MAIN
# Checks that required environment variables are set
reqEnvVars = ['OPENAI_API_KEY', 'OPENAI_API_BASE', 'AZURE_STORAGE_CONNECTION_STRING', 'AZURE_STORAGE_ACCOUNT_NAME', 'AZURE_STORAGE_QUEUE_NAME', 'AZURE_CONTAINER_NAME']
for envVar in reqEnvVars:
    if not os.getenv(envVar):
        print(f"Please set the {envVar} environment variable.")
        sys.exit()

config_openai()
warnings.filterwarnings("ignore")
pandas.set_option('display.max_rows', 1000)
pandas.set_option('display.max_colwidth', 1000)

tokenizer = tiktoken.get_encoding("cl100k_base")

connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
storage_account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
container_name = os.getenv('AZURE_CONTAINER_NAME')
q_name = os.getenv('AZURE_STORAGE_QUEUE_NAME')
#rq_name = os.getenv('AZURE_STORAGE_RESPONSE_QUEUE_NAME')

storage_account_url=f"https://{storage_account_name}.blob.core.windows.net"
q_url = f"https://{storage_account_name}.queue.core.windows.net/{q_name}"
try:
    print(f"Reflecta UC2 - Pattern Summarization Runner")
    print(f"Using Azure Storage Queue: {q_name}")
    print(f"Using Azure OpenAI endpoint: {openai.api_base}")
    queue_client = QueueClient.from_connection_string(conn_str=connect_str, queue_name=q_name)
    #queue_client = QueueClient.from_queue_url(queue_url=q_url, credential=DefaultAzureCredential(managed_identity_client_id=os.getenv('AZURE_CLIENT_ID'), logging_enable=True))
    #response_queue_client = QueueClient.from_connection_string(conn_str=connect_str, queue_name=rq_name)
    # transport = RequestsTransport(read_timeout=3000)  # Set the timeout to 300 seconds

    blob_service_client = BlobServiceClient.from_connection_string(connect_str)
    #blob_service_client = BlobServiceClient(account_url=storage_account_url, credential=DefaultAzureCredential(managed_identity_client_id=os.getenv('AZURE_CLIENT_ID'), logging_enable=True))
    container_client = blob_service_client.get_container_client(container_name)
except Exception as e:
    print(f"An error occurred: {e}")

print("Loading document vectors...")

# Wait for a message
waitMsg = "Waiting for questions from the queue..."
print(waitMsg)
while True:
    last_message = None

    try:

        blob_client = container_client.get_blob_client("output_folder/output_latest.pkl")

        if blob_client.exists():
            filename = os.path.basename(blob_client.blob_name)
            with open(os.path.join(os.getcwd(), filename), "wb") as f:
                download_stream = blob_client.download_blob()
                f.write(download_stream.readall())
            data_description = pandas.read_pickle(os.path.join(os.getcwd(), filename))

        # Load json
        json_blob_client = container_client.get_blob_client("output_folder/output_latest.json")

        if json_blob_client.exists():
            json_filename = os.path.basename(json_blob_client.blob_name)
            with open(os.path.join(os.getcwd(), json_filename), "wb") as json_file:
                json_download_stream = json_blob_client.download_blob()
                json_file.write(json_download_stream.readall())
            json_file = json.load(open(os.path.join(os.getcwd(), json_filename)))
            
        messages = queue_client.receive_messages(max_messages=1)
        for msg in messages:
            last_message = msg
            #decoded_message = base64.b64decode(msg.content).decode('utf-8')  # decode the base64 string
            decoded_message = msg.content

            print("Processing question: " + decoded_message)

            json_message = json.loads(decoded_message)
            date = datetime.fromisoformat(json_message['date'])

            res_filename = date.strftime("%Y-%m-%d-%H-%M-%S") + ".json"

            from_date = data_description['Event Date'].min().isoformat()
            to_date = data_description['Event Date'].max().isoformat()

            incident_time_frame = json_message.get('incidentTimeFrame')
            if incident_time_frame is not None:
                from_date = incident_time_frame.get('from')
                to_date = incident_time_frame.get('to')

            total_incident_count = len(data_description)
            data_description = apply_ui_filters(data_description, json_message)
            print(f"Count of incidents retained after UI filtering: {len(data_description)} / {total_incident_count}")

            try:
                res = process(json_message, json_file, date)
            except TypeError as e:
                if str(e) == "string indices must be integers":
                    from_date = data_description['Event Date'].min().isoformat()
                    to_date = data_description['Event Date'].max().isoformat()

                    incident_time_frame = json_message.get('incidentTimeFrame')
                    if incident_time_frame is not None:
                        from_date = incident_time_frame.get('from')
                        to_date = incident_time_frame.get('to')

                    life_saving_rules = json_message.get('lifeSavingRules')
                    if life_saving_rules is None:
                        life_saving_rules = []

                    gbus = json_message.get('gbus')
                    if gbus is None:
                        gbus = []
                    res = {
                        "title": json_message['title'],
                        "createdBy": json_message['createdBy'],
                        "createdDate": date.isoformat(),
                        "query": json_message['prompt'],
                        "systemCompletion": "Generation of this report failed due to the following issue: No incidents matching the provided filters were found. Please adjust the filters to increase the number of incidents (ex: select longer time spans).",
                        "queryId": date.strftime("%Y-%m-%d-%H-%M-%S"),
                        "filters": {"incidentTimeFrame": {"from": from_date,
                                                            "to": to_date
                                                            },
                                    "gbus": gbus,
                                    "lifeSavingRules": life_saving_rules,
                                    "onlyHipo": json_message['onlyHipo']
                                    },
                        "pickleUploaded": json_file['uploadedDate'],
                        "status": "warning",
                        "errorDetails": "No incidents matching relevant criterias for the provided prompt were found."
                    }
                else:
                    raise

            res_json = json.dumps(res, indent=4)
            print(res_json + "\n\n")

            blob_client = container_client.get_blob_client("responses/" + res_filename)
            blob_client.upload_blob(res_json, overwrite=True)

            queue_client.delete_message(msg)
            print()
            print(waitMsg)


        # wait 2 sec
        time.sleep(2)

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        traceback.print_exc()
        print()

        if last_message:
            json_message = json.loads(last_message.content)

            title = ""
            created_by = ""
            query = ""
            gbus = []
            life_saving_rules = []
            only_hipo = False

            if 'title' in json_message and json_message['title'] is not None:
                title = json_message['title']
            if 'createdBy' in json_message and json_message['createdBy'] is not None:
                created_by = json_message['createdBy']
            if 'prompt' in json_message and json_message['prompt'] is not None:
                query = json_message['prompt']
            if 'gbus' in json_message and json_message['gbus'] is not None:
                gbus = json_message['gbus']
            if 'lifeSavingRules' in json_message and json_message['lifeSavingRules'] is not None:
                life_saving_rules = json_message['lifeSavingRules']
            if 'onlyHipo' in json_message and json_message['onlyHipo'] is not None:
                only_hipo = json_message['onlyHipo']

            res = {
                "title": title,
                "createdBy": created_by,
                "createdDate": date.isoformat(),
                "query": query,
                "queryId": date.strftime("%Y-%m-%d-%H-%M-%S"),
                "filters": {"incidentTimeFrame": {"from": from_date,
                                                    "to": to_date
                                                    },
                            "gbus": gbus,
                            "lifeSavingRules": life_saving_rules,
                            "onlyHipo": only_hipo
                            },
                "pickleUploaded": json_file['uploadedDate'],
                "status": "error",
                "errorDetails": str(e)
            }

            res_json = json.dumps(res, indent=4)

            blob_client = container_client.get_blob_client("responses/" + res_filename)
            blob_client.upload_blob(res_json, overwrite=True)
            
            try:
                queue_client.delete_message(last_message)
            except ResourceNotFoundError:
                print("The specified message does not exist.")
        print(waitMsg)
