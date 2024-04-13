import os
import re
import json
import time
import pandas 
import requests
import tiktoken
import sys
import openai
from openai.embeddings_utils import get_embedding, cosine_similarity
from multiprocessing import Pool, Manager
import warnings
from tqdm import tqdm
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import datetime
import numpy as np
from tenacity import retry, stop_after_attempt
from azure.core.pipeline.transport import RequestsTransport
from azure.identity import DefaultAzureCredential, ManagedIdentityCredential

def config_openai():
    openai.api_type = "azure"
    openai.api_key = os.getenv('OPENAI_API_KEY')
    openai.api_base = os.getenv('OPENAI_API_BASE')
    openai.api_version = "2023-03-15-preview"


    url = openai.api_base + "/openai/deployments?api-version=2022-12-01"
    req = requests.get(url, headers={"api-key": openai.api_key})


# s is input text
def normalize_text(s, sep_token = " \n "):
    s = re.sub(r'\s+',  ' ', s).strip()
    s = re.sub(r". ,","",s)
    # remove all instances of multiple spaces
    s = s.replace("..",".")
    s = s.replace(". .",".")
    s = s.replace("\n", "")
    s = s.strip()
    return s

@retry(stop=stop_after_attempt(3))
def get_embedding_with_retry(x, engine):
    return get_embedding(x, engine)

def process(data, outputFilename):
    tokenizer = tiktoken.get_encoding("cl100k_base")
    outputFilename = outputFilename+".pkl"
    data_description = data[['ID', 'Event Date', 'QR_Title_EN', 'QR_ReportingEntity:GBU', 'QR_EventDescription_EN', 'HIPO', 'Life Saving Rule']]
    data_description.rename(columns = {'QR_EventDescription_EN':'Event Description'}, inplace=True)
    data_description.rename(columns = {'QR_ReportingEntity:GBU':'GBU'}, inplace=True)
    pandas.options.mode.chained_assignment = None #https://pandas.pydata.org/pandas-docs/stable/user_guide/indexing.html#evaluation-order-mattersdata_description['Title']= data_description['Title'].apply(lambda x : normalize_text(str(x)))
    tqdm.pandas()

    data_description['Event Description'] = data_description['Event Description'].apply(lambda x : normalize_text(str(x)))
    # data_description['Event Description'] = data_description['Event Description'].apply(lambda x : ' '.join([word for word in x.split() if word not in (stop)]))
    data_description['n_tokens'] = data_description['Event Description'].apply(lambda x: len(tokenizer.encode(x)))

    # print number of rows in data_description
    print(f"Before {len(data_description)} row(s)")
    data_description = data_description[data_description.n_tokens<8192]
    print(f"After n_tokens < 8192 {len(data_description)} row(s)")

    print(f"Generating embeddings...")
    # data_description['ada_v2'] = data_description['Event Description'].progress_apply(lambda x : get_embedding(x, engine = 'ada-2'))
    data_description['ada_v2'] = data_description['Event Description'].progress_apply(lambda x : get_embedding_with_retry(x, engine = 'ada-2'))

    # step_cost = 0
    # for i in range(len(data_description_2023)):
    #     step_cost = step_cost + get_running_cost_east_us('ada', data_description_2023['Event Description'][i], "...")

    # print(f"Embedding using ada-002 is ${step_cost}")

    data_description.to_pickle(outputFilename)

    # upload the output file to Azure Blob Storage
    output_blob_client = container_client.get_blob_client("output_folder/" + outputFilename)
    with open(outputFilename, "rb") as output_file:
        output_blob_client.upload_blob(output_file, overwrite=True) 
       
    output_blob_client = container_client.get_blob_client("output_folder/output_latest.pkl")   
    with open(outputFilename, "rb") as output_file:
        output_blob_client.upload_blob(output_file, overwrite=True) 

    os.remove(outputFilename)

def convert(o):
    if isinstance(o, np.int64): 
        return int(o)  
    raise TypeError

def get_json_info(blob_client, df, blob_name, outputFilename):

    blob = blob_client.get_blob_properties()
    metadata = blob.metadata
    date_uploaded = blob.last_modified.isoformat()
    user_uploaded = metadata.get("uploadedBy")

    num_incidents = len(df)
    # get the most recent incident
    most_recent_incident = df.sort_values('Event Date', ascending=False).iloc[0]
    recent_incident_date = most_recent_incident['Event Date']
    recent_incident_id = most_recent_incident['ID']
    recent_incident_title = most_recent_incident['QR_Title_EN']

    info_dict = {
        "uploadedDate": date_uploaded,
        "uploadedBy": user_uploaded,
        "originalFileName": blob_name,
        "numberOfIncidents": num_incidents,
        "mostRecentIncident": {
            "incidentId": recent_incident_id,
            "description": recent_incident_title,
            "date": recent_incident_date.isoformat()
        },
        "pickle": outputFilename+".pkl"
    }
    # convert to JSON
    json_data = json.dumps(info_dict, default=convert)

    output_filename = outputFilename+".json"
    
    json_blob_client = container_client.get_blob_client("output_folder/" + output_filename)

    with open(output_filename, "w") as json_file:
        json_file.write(json_data)

    with open(output_filename, "rb") as json_file:
        json_blob_client.upload_blob(json_file, overwrite=True)

    json_blob_client = container_client.get_blob_client("output_folder/output_latest.json")   
    with open(output_filename, "rb") as output_file:
        json_blob_client.upload_blob(output_file, overwrite=True) 

    os.remove(output_filename)

def move_file(blob_service_client, container_name, source_folder, destination_folder, file_name):
    source_blob_client = blob_service_client.get_blob_client(container=container_name, blob=f"{source_folder}/{file_name}")
    destination_blob_client = blob_service_client.get_blob_client(container=container_name, blob=f"{destination_folder}/{file_name}")

    destination_blob_client.start_copy_from_url(source_blob_client.url)

    source_blob_client.delete_blob()


warnings.filterwarnings("ignore")
pandas.set_option('display.max_rows',1000)
pandas.set_option('display.max_colwidth', 1000)

reqEnvVars = ['OPENAI_API_KEY', 'OPENAI_API_BASE', 'AZURE_STORAGE_ACCOUNT_NAME', 'AZURE_CONTAINER_NAME']
for envVar in reqEnvVars:
    if not os.getenv(envVar):
        print(f"Please set the {envVar} environment variable.")
        sys.exit()

config_openai()

connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
storage_account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
container_name = os.getenv('AZURE_CONTAINER_NAME')

storage_account_url=f"https://{storage_account_name}.blob.core.windows.net"
# transport = RequestsTransport(read_timeout=300)  # Set the timeout to 300 seconds
try:
    print(f"Connecting to Azure Blob Storage account '{storage_account_name}'...")
    blob_service_client = BlobServiceClient.from_connection_string(connect_str)
    #blob_service_client = BlobServiceClient(account_url=storage_account_url, transport=transport, credential=DefaultAzureCredential(managed_identity_client_id=os.getenv('AZURE_CLIENT_ID'), logging_enable=True))

    container_client = blob_service_client.get_container_client(container_name)
except Exception as e:
    print(f"An error occurred: {e}")

print(f'waiting for document...')
while True:
    try:
        blob_list = container_client.list_blobs(name_starts_with="input_folder/")
        for blob in blob_list:
            blob_client = container_client.get_blob_client(blob.name)

            blob = blob_client.get_blob_properties()

            status_blob_name = "status.json"
            status_blob_client = container_client.get_blob_client(status_blob_name)

            blob_name = os.path.basename(blob.name)
            metadata = blob.metadata
            user_uploaded = metadata.get("uploadedBy")
            date_uploaded = blob.last_modified.strftime('%d %b %Y')

            
            
            if user_uploaded:

                if blob.size != 0:

                    if os.path.splitext(blob_name)[1] in ['.xls', '.xlsx']:

                        status_blob_name = "status.json"
                        status_blob_client = container_client.get_blob_client(status_blob_name)


                        inprogress_text = f"Database update (**{blob_name}**, uploaded by **{user_uploaded}**) in progress..."
                        inprogress_json = {"status": "in progress", "message": inprogress_text}
                        inprogress_json_data = json.dumps(inprogress_json, default=convert)
                        with open("status.json", "w") as inprogress_file:
                            inprogress_file.write(inprogress_json_data)
                        with open("status.json", "rb") as inprogress_file:
                            status_blob_client.upload_blob(inprogress_file, overwrite=True)

                        
                        #download the xlsx file
                        local_file_path = os.path.join(os.getcwd(), blob_name)
                        with open(local_file_path, "wb") as local_file:
                            blob_client.download_blob().readinto(local_file)

                        data = pandas.read_excel(local_file_path)

                        required_columns = ['ID', 'Event Date', 'QR_Title_EN', 'QR_ReportingEntity:GBU', 'QR_EventDescription_EN', 'HIPO', 'Life Saving Rule']

                        # Check if all required columns are in the DataFrame
                        if set(required_columns).issubset(data.columns):

                            #process the xlsx file
                            print(f"Reading '{blob_name}'...")
                            outputFilename = f"output_{blob.last_modified.strftime('%Y%m%d_%H%M%S')}"
                            process(data, outputFilename)

                            #get the needed info in JSON format
                            get_json_info(blob_client, data, blob_name,outputFilename)

                            # delete the local files


                            # upload success text file
                            success_text = f"New database **{blob_name}** successfully uploaded by **{user_uploaded}** on **{date_uploaded}**."
                            success_json = {"status": "success", "message": success_text}
                            success_json_data = json.dumps(success_json, default=convert)
                            with open("status.json", "w") as success_file:
                                success_file.write(success_json_data)
                            with open("status.json", "rb") as success_file:
                                status_blob_client.upload_blob(success_file, overwrite=True)

                            move_file(blob_service_client, container_name, "input_folder", "database_folder", blob_name)
                            


                        else:
                            print(f"File '{blob_name}' is missing one or more required columns: {required_columns}. Skipping...")
                            # upload failed text file
                            failed_text = f"Database file **{blob_name}** upload by **{user_uploaded}** on **{date_uploaded}** was not successful.  File **{blob_name}** is missing one or more required columns: {required_columns}. Skipping... "
                            failed_json = {"status": "error", "message": failed_text}
                            failed_json_data = json.dumps(failed_json, default=convert)
                            with open("status.json", "w") as failed_file:
                                failed_file.write(failed_json_data)
                            with open("status.json", "rb") as failed_file:
                                status_blob_client.upload_blob(failed_file, overwrite=True)

                            move_file(blob_service_client, container_name, "input_folder", "error_folder", blob_name)
                            
                        os.remove(local_file_path)

                    else:
                        print(f"File '{blob_name}' is not an Excel file. Skipping...")
            
                        # upload failed text file
                        failed_text = f"Database file **{blob_name}** upload by **{user_uploaded}** on **{date_uploaded}** was not successful.  File **{blob_name}** is not an Excel file. Skipping..."
                        failed_json = {"status": "error", "message": failed_text}
                        failed_json_data = json.dumps(failed_json, default=convert)
                        with open("status.json", "w") as failed_file:
                            failed_file.write(failed_json_data)
                        with open("status.json", "rb") as failed_file:
                            status_blob_client.upload_blob(failed_file, overwrite=True)

                        move_file(blob_service_client, container_name, "input_folder", "error_folder", blob_name)
                else :
                    print(f"File '{blob_name}' is empty. Skipping...")

                    # upload failed text file
                    failed_text = f"Database file **{blob_name}** upload by **{user_uploaded}** on **{date_uploaded}** was not successful. \nFile **{blob_name}** is empty. Skipping..."
                    failed_json = {"status": "error", "message": failed_text}
                    failed_json_data = json.dumps(failed_json, default=convert)
                    with open("status.json", "w") as failed_file:
                        failed_file.write(failed_json_data)
                    with open("status.json", "rb") as failed_file:
                        status_blob_client.upload_blob(failed_file, overwrite=True)

                    move_file(blob_service_client, container_name, "input_folder", "error_folder", blob_name)

            else: 
                failed_text = f" The field username is missing or empty."
                print(failed_text)
                failed_json = {"status": "error", "message": failed_text}
                failed_json_data = json.dumps(failed_json, default=convert)
                with open(status_blob_name, "w") as failed_file:
                    failed_file.write(failed_json_data)
                with open(status_blob_name, "rb") as failed_file:
                    status_blob_client.upload_blob(failed_file, overwrite=True)
                move_file(blob_service_client, container_name, "input_folder", "error_folder", blob_name)

            os.remove("status.json")
            print(f'waiting for document...')
                    
            
        # sleep for a certain duration before checking for new blobs again
        time.sleep(20)  
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")

        #get a BlobClient object for the blob

        blob_list = container_client.list_blobs(name_starts_with="input_folder/")
        for blob in blob_list:
            blob_client = container_client.get_blob_client(blob.name)

            blob = blob_client.get_blob_properties()

            status_blob_name = "status.json"
            status_blob_client = container_client.get_blob_client(status_blob_name)

            blob_name = os.path.basename(blob.name)
            metadata = blob.metadata
            user_uploaded = metadata.get("uploadedBy")
            date_uploaded = blob.last_modified.strftime('%d %b %Y')
        

            failed_blob_name = "status.txt"
            failed_blob_client = container_client.get_blob_client(failed_blob_name)

            failed_text = f"Database file **{blob_name}** upload by **{user_uploaded}** on **{date_uploaded}** was not successful.  An error occurred: {str(e)}"
            failed_json = {"status": "error", "message": failed_text}
            failed_json_data = json.dumps(failed_json, default=convert)
            with open("status.json", "w") as failed_file:
                failed_file.write(failed_json_data)
            with open("status.json", "rb") as failed_file:
                status_blob_client.upload_blob(failed_file, overwrite=True)

            move_file(blob_service_client, container_name, "input_folder", "error_folder", blob_name)

            break
        os.remove("status.json")

        print(f'waiting for document...')
        continue
