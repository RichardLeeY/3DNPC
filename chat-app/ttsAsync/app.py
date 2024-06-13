import json
import boto3
from botocore.config import Config
import base64
from scipy.io.wavfile import write as write_wav
import numpy as np
from os import environ
endpoint = environ.get('TTS_SAGEMAKER_ENDPOINT')
s3_client = boto3.client('s3')
timeout = 300

# Create a custom configuration with the timeout
config = Config(
    read_timeout=timeout,
    connect_timeout=timeout,
    retries={'max_attempts': 0}
)
runtime = boto3.client('runtime.sagemaker',config=config)
def lambda_handler(event, context):
    print("event:",event)
    filename = event["filename"]
    bucket_name = event["bucketname"]
    input_data = {"voice_preset":event["voiceid"],"text":event["text"]}
    payload = json.dumps(input_data).encode('utf-8')
    response = runtime.invoke_endpoint(EndpointName=endpoint,
                                   ContentType='application/json',
                                   Body=payload)
    response_body = response["Body"].read()
    json_obj = json.loads(response_body)
    wav = json_obj["output"]
    # input_data = {"voice_preset":"v2/en_speaker_9","text":message}
    # result = runtime.invoke_endpoint(EndpointName=endpoint, ContentType='application/json', Body=json.dumps(input_data))
    # print(result)
    # dict_result = json.loads(result['Body'].read())
    # print(dict_result['output'])
    
    
    wav_array = np.array(wav,dtype='float64')
    
    # print("wave_array:",wav_array)
    print("start of generate audio ---------------------")
    sample_rate = 24000
    # new_sample_rate = 8000
    # num_samples = round(len(wav_array) * float(new_sample_rate) / sample_rate)
    # print("num_samples:", num_samples)
    # new_audio_data = np.interp(np.arange(0, num_samples, dtype=np.float32) / new_sample_rate,
    #                        np.linspace(0, len(wav_array) / sample_rate, len(wav_array), dtype=np.float32),
    #                        wav_array)
    wav_file = filename+".wav"
    write_wav("/tmp/"+wav_file, sample_rate, wav_array)
   
    
    s3_client.upload_file("/tmp/"+wav_file,bucket_name, "npc/"+wav_file)
    print("end of generate audio ---------------------")
    return {
    'statusCode': 200,
    'body': 'Success'
  }
