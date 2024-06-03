import os
from typing import Any


# create a class for promptManager
class PromptManager:
    def __init__(self,role,lan):
        self.prompt = ""
        self.language = lan
        self.roleName = role

    def setPrompt(self, prompt):
        self.prompt = prompt

    def getPrompt(self):
        # load string from file
        if self.prompt != "":
            return self.prompt
        fileName = "./prompts/"+ self.roleName+"_"+self.language+".txt"
        promptFile = open(fileName, "r")
        self.prompt = promptFile.read()
        return self.prompt
