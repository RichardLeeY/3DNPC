import json
import boto3
import ApiInference
from ApiInference import ApiInference
from  apiWisper import  apiWisper
from apiGames import games
import base64
from os import environ
# import requests


bucket_name = environ.get('BUCKET_NAME')
domain_name = environ.get('DOMAIN_NAME')
endpoint = environ.get('ASR_SAGEMAKER_ENDPOINT')
def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict

        Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """
    print("event:", event)
    path = event['path']
    http_method = event['httpMethod']
    if path == '/inference':
        
        infer = ApiInference(bucket_name,domain_name)
        resp =  infer.inference(event)
        print("resp:",resp)
        return {
            "isBase64Encoded": "true",
            'statusCode': 200,  
            'body': json.dumps(resp)
        }
    if path == '/wisper':
        audio_data_binary = base64.b64decode(event['body'])
        wisper = apiWisper(endpoint)
        response = wisper.wisper(audio_data_binary)
        print("response:", response)
        return {
            "isBase64Encoded": "true",
            'statusCode': 200,  
            'body': json.dumps(response)
        }
    if path.startswith('/games/'):
        game_id = path.split('/')[2]
        game = games()
        if http_method == 'GET':
            # Call the /games/{gameid} API and return the response
            if game_id == 'all':
                response = game.getAllGames()
            else :
                response = game.getGameByID(game_id)
            return {
                "isBase64Encoded": "true",
                'statusCode': 200,
                'body': json.dumps(response)
            }
        if http_method == 'PUT':
            body = json.loads(event['body'])
            if body['result'] == 0:
                type = 0
            else:
                type = 1
                
            response = game.updateGame(game_id,type)
            return {
                "isBase64Encoded": "true",
                'statusCode': 200,
                'body': json.dumps(response)
            }
    return {
    'statusCode': 404,
    'body': 'Path not found'
  }
