import json
import boto3
from botocore.config import Config

ssm_client = boto3.client('ssm')
timeout = 300

def lambda_handler(event, context):
    print("event:",event)
    # download file from s3
    
    # init conda env
    response = ssm_client.send_command(
        InstanceIds=['i-0996750c9d594b6e6'],
        DocumentName='AWS-RunShellScript',
        Parameters={'commands': ['cd & . ~/.profile & cd Wav2Lip & conda activate wav2lip']}
    
    
)

    return {
    'statusCode': 200,
    'body': 'Success'
  }
