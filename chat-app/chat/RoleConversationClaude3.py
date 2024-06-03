import json
from RoleConversationBase import RoleConversationBase
class RoleConversationClaude3(RoleConversationBase):
    def __init__(self, prompt_template, reference_character, additional_info, player_name,bedrock_client,chat_example,isClaude3):
        self.reference_character = reference_character
        self.additional_info = additional_info
        self.player_name = player_name
        self.history = []
        self.round = 0
        self.template = prompt_template\
                        .replace('{{REFERENCE_CHARACTER}}', reference_character)\
                        .replace('{{ADDITIONAL_INFO}}', additional_info)\
                        .replace('{{PLAYER_NAME}}', player_name)\
                        .replace('{{CHATEXAMPLE}}',chat_example)
        self.br_r_client = bedrock_client
        # self.modelId = "anthropic.claude-3-haiku-20240307-v1:0"
        self.modelId = "anthropic.claude-3-sonnet-20240229-v1:0"
        self.isClaude3 = isClaude3

    def _gen_user_input(self, user_input):
        print("type of user_input",type(user_input))
        _user_input_string = json.dumps(user_input)
        _user_input_json = json.loads(_user_input_string)
        print("type of _user_input_json", type(_user_input_json))
        lastObjectText = _user_input_json[len(_user_input_json) - 1]["content"][0]["text"];
        print("type of lastObjectText",type(lastObjectText))
        print("lastObjectText:", lastObjectText)
        _json = {
            "player_name": self.player_name,
            "player_message": lastObjectText,
            "reference_character": self.reference_character,
            "additional_info": self.additional_info
        }

        return json.dumps(_json)

    def _get_history(self,user_input):
        print("type of user_input",type(user_input))
        _user_input_string = json.dumps(user_input)
        _user_input_json = json.loads(_user_input_string)
        print("len of _user_input_json",len(_user_input_json))
        for i, obj in enumerate(_user_input_json[:len(_user_input_json)-1], start=1):
            self.history.append("\n".join([
                f"{obj['role']}: ",
                obj['content'][0]['text']
            ]))
        print("self.history",self.history)
        return self.history

    def _add_to_history(self, user_input_json, resp_body):
        self.history.append("\n".join([
            f"{self.player_name}: ",
            json.dumps(user_input_json),
            f"{self.reference_character}: ",
            resp_body
        ]))

    def print_round_with_slash(self):
        print("=" * 30 + 'Round: ' + str(self.round) + '=' * 30)
    
    def generatPayLoad(self,prompt):
        if self.isClaude3:
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2048,
                "temperature":0.9,
                "top_p": 0.9,
                "top_k": 250,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt,
                            }
                        ],
                    }
                ],
            }
        else :   
            body = {
                "prompt": prompt,
                "temperature":1,
                "top_p": 0.999,
                "top_k": 250,
                "max_tokens_to_sample": 300,
                "stop_sequences": ["\n\nHuman:"]
            }
        return body
    
    def parseResponseBody(self,resp):
        resp_body = resp['body'].read().decode('utf8')
        print("resp_body", resp_body)
        resp_body = json.loads(resp_body)['content'][0]['text']
        return resp_body
    