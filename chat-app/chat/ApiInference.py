import boto3
import json
from promptManager import PromptManager
from scipy.io.wavfile import write as write_wav
import asyncio
import xml.etree.ElementTree as ET
from RoleConversationClaude3 import RoleConversationClaude3
import os
from botocore.exceptions import ClientError




class ApiInference:
    def __init__(self,bucket_name,domain_name):
        self.expiration = 3600
        self.bucket_name = bucket_name
        self.domain_name = domain_name
        self.bedrock_run = boto3.client(service_name='bedrock-runtime')
        self.runtime = boto3.Session().client('sagemaker-runtime')
        self.s3_client = boto3.client('s3')
        self.lambda_client = boto3.client('lambda')
        
    def _generate_audio_bark(self,message,filename,voice_id):
        func_name = os.environ.get("ttsFunction")
        payload = {"text": message,
                   "filename": filename,
                   "bucketname": self.bucket_name,
                   "voiceid": voice_id}
        self.lambda_client.invoke(FunctionName=func_name,
                             InvocationType='Event',
                             Payload=json.dumps(payload))
    
        #invoke a sagemaker inference endpoint
        

    def _generate_audio_polly(self,message,filename,voice_id):
        polly_client = boto3.client('polly')
        response = polly_client.synthesize_speech(VoiceId=voice_id, OutputFormat='mp3', Text=message,Engine='generative')
        localfilename = "/tmp/"+filename+".mp3"
        if "AudioStream" in response:
            with open(localfilename, 'wb') as f:
                f.write(response['AudioStream'].read())
        self.s3_client.upload_file(localfilename, self.bucket_name,"npc/"+filename+".mp3")
    
    def infer_tts(self,chat_text,filename,isPolly,voice_id):
        """
        调用语音合成接口，将文本转换为语音
        """
        # 将文本转换为语音
        # response = await asyncio.to_thread(generate_audio_polly,
        #                                     chat_text,
        #                                     "speech1.wav")
        # # 获取语音数据
        # data = response['Body'].read()
        if chat_text is None or chat_text == "":
            return
        if isPolly:
            self._generate_audio_polly(chat_text, filename,voice_id)
        else :
            self._generate_audio_bark(chat_text, filename,voice_id)
    
    def generateAudioName(self,requestContext):
        return requestContext['requestId']
    def generateS3URL(self,isPolly,filename):
        
        
        if isPolly:
            object_key = 'npc/'+filename+".mp3"
        else:
            object_key = 'result/'+filename+".mp3"
        url = "https://" + self.domain_name + "/" + object_key
        return url
        
    def getMetadata(self,gameid):
        metadata = {
            "robot":{
                "role":"Robot",
                "prompt":"Honghong",
                "default_voice_id":"v2/zh_speaker_0",
                "default_polly_id":"Matthew"
            },
            "girl":{
                "role":"DreamGirl",
                "prompt":"girl",
                "default_voice_id":"v2/zh_speaker_4",
                "default_polly_id":"Ruth"
            },
            "itman":{
                "role":"ITMan",
                "prompt":"ITMan",
                "default_voice_id":"v2/zh_speaker_2",
                "default_polly_id":"Matthew"
            },
            "mum":{
                "role":"Mum",
                "prompt":"Mum",
                "default_voice_id":"v2/zh_speaker_5",
                "default_polly_id":"Amy"
            }
        }
        return metadata[gameid]
        
        
    def inference(self,event):
        print("event.body:",event['body'])
        event_body = json.loads(event['body'])
        gameid = event_body["gameid"]
        gameid = gameid.lower()
        voice_id = ""
        gameData = self.getMetadata(gameid)
        
        
        if 'languageId' in event_body:
            language_id = event_body['languageId']
        else:
            language_id = "zh-CN"
        if language_id == "zh-CN":
            if 'voiceId' in event_body:
                voice_id = event_body['voiceId']
            else:
                voice_id = gameData['default_voice_id']
        else :
            voice_id = gameData['default_polly_id']
        ref_character = gameData['role']
        ref_character_info = ""
        pm = PromptManager(gameData['prompt'],language_id)
        player_name = "Tom"
        mt = RoleConversationClaude3(pm.getPrompt(),ref_character, ref_character_info, player_name,self.bedrock_run,"",True)
        print("event",event)

        resp = mt.chat(event_body["messages"])
        
        print("resp",resp)
        if language_id != "zh-CN":
            isPolly = True
        else:
            isPolly = False
            
         # tts with bark
        #isPolly = True # tts with polly
        filename = self.generateAudioName(event['requestContext'])
        filename = gameid + "-" + filename
        url = self.generateS3URL(isPolly,filename)
        body = {
            "gameid":gameid,
            "message": {
                        "role": gameData['role'],
                        "content": [
                            {
                                "type": "text",
                                "content": resp,
                                "audiolink": url
                            }
                        ]}
            }
        print("resp",resp)
        # loop = asyncio.new_event_loop()
        # asyncio.set_event_loop(loop)

        # try:
        #     # Run the infer_tts coroutine in the background
        #     loop.create_task(infer_tts(filename))
        # finally:
        #     # Close the event loop
        #     loop.close()

        # return {
        #     "statusCode": 200,
        #     "body": body,
        # }
        root = ET.fromstring(resp)
        resp_json = json.loads(root.text)
        print("resp_json", resp_json)
        if 'answer' not in resp_json :
            return body
        self.infer_tts(resp_json['answer'],filename,isPolly,voice_id)
        return body
