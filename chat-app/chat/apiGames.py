import boto3
import json
from decimal import Decimal
class games:
    def __init__(self):
        
        self.dynamodb = boto3.resource('dynamodb')
    def _get_gameByID(self,gameid):
        table = self.dynamodb.Table('GameMetadata')
        response = table.get_item(
            Key={
                'gameid': gameid
            }
        )
        if response['Item']:
            item = response['Item']
            converted_item = {
                'times': int(item['times']) if isinstance(item['times'], Decimal) else item['times'],
                'fail_times': int(item['fail_times']) if isinstance(item['fail_times'], Decimal) else item['fail_times'],
                'success_times': int(item['success_times']) if isinstance(item['success_times'], Decimal) else item['success_times'],
                'gameid': item['gameid']
            }

        return converted_item
    def getGameByID(self,gameid):
        print("begin invoke....")
        
        response_body = self._get_gameByID(gameid)
        response_body = [response_body]
        return response_body
    def getAllGames(self):
        print("begin invoke....")
        table = self.dynamodb.Table('GameMetadata')
        response = table.scan()
        items = response['Items']
        converted_items = []
        for item in items:
            converted_item = {
                'times': int(item['times']) if isinstance(item['times'], Decimal) else item['times'],
                'fail_times': int(item['fail_times']) if isinstance(item['fail_times'], Decimal) else item['fail_times'],
                'success_times': int(item['success_times']) if isinstance(item['success_times'], Decimal) else item['success_times'],
                'gameid': item['gameid']
            }
            converted_items.append(converted_item)
        print("converted_items:",converted_items)
        return converted_items
    def updateGame(self,gameid,type):
        table = self.dynamodb.Table('GameMetadata')
        update_expression = 'SET times = times + :incr'
        expression_attribute_values = {':incr': 1}
        if type == 1:
            update_expression += ', success_times = success_times + :incr'
        elif type == 0:
            update_expression += ', fail_times = fail_times + :incr'
        response = table.update_item(
            Key={
                'gameid': gameid
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="UPDATED_NEW"
        )
        response_body = self._get_gameByID(gameid)
        return response_body