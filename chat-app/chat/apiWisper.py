import boto3
import json
class apiWisper:
    def __init__(self,asr_endpoint):
        self.endpoint = asr_endpoint
        self.runtime = boto3.Session().client('sagemaker-runtime')
    def wisper(self,wavfile):
        print("begin invoke....")
        response = self.runtime.invoke_endpoint(EndpointName=self.endpoint,
                                   ContentType='audio/wav',
                                   Body=wavfile)
        response_body = response['Body']
        response_bytes = response_body.read()
        response_str = response_bytes.decode('utf-8')
        response_data = json.loads(response_str)
        return response_data