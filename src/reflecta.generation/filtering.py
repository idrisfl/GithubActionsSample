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
import warnings
import queue
import random
import sys
import base64
from tqdm import tqdm

def format_excel(df, json_input):
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
reqEnvVars = ['AZURE_STORAGE_ACCOUNT_NAME', 'FILTERING_QUEUE_NAME','AZURE_STORAGE_QUEUE_NAME', 'AZURE_CONTAINER_NAME']
for envVar in reqEnvVars:
    if not os.getenv(envVar):
        print(f"Please set the {envVar} environment variable.")
        sys.exit()

warnings.filterwarnings("ignore")
pandas.set_option('display.max_rows', 1000)
pandas.set_option('display.max_colwidth', 1000)

connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
storage_account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
container_name = os.getenv('AZURE_CONTAINER_NAME')
q_name = os.getenv('FILTERING_QUEUE_NAME')
rq_name = os.getenv('AZURE_STORAGE_QUEUE_NAME')

storage_account_url=f"https://{storage_account_name}.blob.core.windows.net"
q_url = f"https://{storage_account_name}.queue.core.windows.net/{q_name}"
try:
    print("Reflecta UC2 - Pattern Summarization Runner")
    queue_client = QueueClient.from_connection_string(conn_str=connect_str, queue_name=q_name)
    #queue_client = QueueClient.from_queue_url(queue_url=q_url, credential=DefaultAzureCredential(managed_identity_client_id=os.getenv('AZURE_CLIENT_ID'), logging_enable=True))
    response_queue_client = QueueClient.from_connection_string(conn_str=connect_str, queue_name=rq_name)
    #response_queue_client = QueueClient.from_queue_url(queue_url=q_url, credential=DefaultAzureCredential(managed_identity_client_id=os.getenv('AZURE_CLIENT_ID'), logging_enable=True))
    #transport = RequestsTransport(read_timeout=300)  # Set the timeout to 300 seconds

    blob_service_client = BlobServiceClient.from_connection_string(connect_str)
    # blob_service_client = BlobServiceClient(account_url=storage_account_url, credential=DefaultAzureCredential(managed_identity_client_id=os.getenv('AZURE_CLIENT_ID'), logging_enable=True))
    container_client = blob_service_client.get_container_client(container_name)
except Exception as e:
    print(f"An error occurred: {e}")

print("Loading document vectors...")

# Wait for a message
waitMsg = "Waiting for questions from the queue..."
print(waitMsg)
while True:
    try:
        last_message = None

        blob_client = container_client.get_blob_client("output_folder/output_latest.pkl")

        if blob_client.exists():
            filename = os.path.basename(blob_client.blob_name)
            with open(os.path.join(os.getcwd(), 'filtering', filename), "wb") as f:
                download_stream = blob_client.download_blob()
                f.write(download_stream.readall())
            data_description = pandas.read_pickle(os.path.join(os.getcwd(), 'filtering', filename))

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
            date = datetime.now(timezone.utc)
            last_message = msg
            #decoded_message = base64.b64decode(msg.content).decode('utf-8')  # decode the base64 string
            decoded_message = msg.content

            print("Processing question: " + decoded_message)

            json_message = json.loads(decoded_message)

            res_filename = date.strftime("%Y-%m-%d-%H-%M-%S") + ".json"

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
                "queryId": date.strftime("%Y-%m-%d-%H-%M-%S"),
                "filters": {"incidentTimeFrame": {"from": from_date,
                                                    "to": to_date
                                                    },
                            "gbus": gbus,
                            "lifeSavingRules": life_saving_rules,
                            "onlyHipo": json_message['onlyHipo']
                            },
                "pickleUploaded": json_file['uploadedDate'],
                "status": "in progress"
            }

            res_json = json.dumps(res, indent=4)

            # Create the 'responses' folder if it does not already exist
            '''if not os.path.exists("responses"):
                os.makedirs("responses")
            with open("responses/" + res_filename, "w") as f:
                f.write(res_json)'''

            #response_queue_client.send_message(res_json)

            blob_client = container_client.get_blob_client("responses/" + res_filename)
            blob_client.upload_blob(res_json, overwrite=True)

            data_description = format_excel(data_description, json_message)

            if not data_description.empty:
                num_incidents = len(data_description)
                if num_incidents < 300:
                    print("Number of incidents: " + str(num_incidents))
                    message_dict = json.loads(msg.content)
                    message_dict['date'] = date.isoformat()
                    message_with_date = json.dumps(message_dict)
                    
                    response_queue_client.send_message(message_with_date)
                    
                   
                else:  
                    print("Number of incidents exceeds 300")
                    message = f"{num_incidents} incidents were found matching your filters, which exceeds the maximum number of processable incidents (300). Please narrow down your selection of incidents by refining your filters."
                    res = {
                        "title": json_message['title'],
                        "createdBy": json_message['createdBy'],
                        "createdDate": date.isoformat(),
                        "query": json_message['prompt'],
                        "systemCompletion": "Generation of this report failed due to the following issue: " + message,
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
                        "errorDetails": message
                    }


                    #response_queue_client.send_message(res_json)

            else:
                print("DataFrame is empty. No incidents available matching filters.")
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
                    "errorDetails": "No incidents matching the provided filters were found. Please adjust the filters to increase the number of incidents (ex: select longer time spans)."
                }


                #response_queue_client.send_message(res_json)
            res_json = json.dumps(res, indent=4)
            print(res_json + "\n\n")

            blob_client = container_client.get_blob_client("responses/" + res_filename)
            blob_client.upload_blob(res_json, overwrite=True)     

            queue_client.delete_message(msg)
            print()
            print(waitMsg)
        
        # wait 1 sec
        time.sleep(2)

    except Exception as e:
        print(f"An error occurred: {str(e)}")
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

            #response_queue_client.send_message(res_json)

            blob_client = container_client.get_blob_client("responses/" + res_filename)
            blob_client.upload_blob(res_json, overwrite=True)
            
            try:
                queue_client.delete_message(last_message)
            except ResourceNotFoundError:
                print("The specified message does not exist.")
        print(waitMsg)
