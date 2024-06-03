import json
import boto3
import os
import subprocess
import shlex
timeout = 300
SIGNED_URL_TIMEOUT = 60
S3_DESTINATION_BUCKET = "my-website-bucket-845524701534"
def lambda_handler(event, context):
    print("event:",event)
    
    s3_source_bucket = event['Records'][0]['s3']['bucket']['name']
    s3_source_key = event['Records'][0]['s3']['object']['key']
    s3_source_basename = os.path.splitext(os.path.basename(s3_source_key))[0]
    s3_client = boto3.client('s3')
    s3_source_signed_url = s3_client.generate_presigned_url('get_object',
        Params={'Bucket': s3_source_bucket, 'Key': s3_source_key},
        ExpiresIn=SIGNED_URL_TIMEOUT)
    ffmpeg_cmd = "/opt/bin/ffmpeg -i \"" + s3_source_signed_url + "\" -codec:a libmp3lame -qscale:a 2 -f mp3 -"
    command1 = shlex.split(ffmpeg_cmd)
    s3_destination_filename = 'result/'+ s3_source_basename + ".mp3"
    p1 = subprocess.run(command1, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    resp = s3_client.put_object(Body=p1.stdout, Bucket=S3_DESTINATION_BUCKET, Key=s3_destination_filename)
    print("resp",resp)
    return {
    'statusCode': 200,
    'body': 'Success'
    }
