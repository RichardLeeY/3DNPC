<div align="center">
<img alt="LOGO" src="./images/clay-cartoon.png" width="300" height="300" />
  
# Game 3D model NPC Experiment Project
This repository contains the code for a voice-controlled 3D game built on AWS cloud services. The game allows players to interact with non-player characters (NPCs) and chat with them using voice commands.

[**English**](./README.md) | [**中文简体**](./README_zh_CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.


## Project Structure

The project is divided into three main directories:

1. /chat-app: This directory contains the backend code for the application.
2. /front-end: This directory contains the frontend code for the application.
3. /notebooks: This directory contains Jupyter notebooks for deploying the Bark and Whisper models used in the application.

## Prerequisites

Before running the application, ensure that you have the following prerequisites installed:

* Python (version 3.9 or higher)
* AWS CLI (configured with your AWS credentials)
* Service Application Model(SAM cli)

## Project Architecture

![Architecture](./images/HiNPC-ARC.jpg)

## Usage
1. Clone the repository:
```
git clone https://github.com/RichardLeeY/3DNPC.git
```
2. Deploy backend serverless rest api
```
cd chat-app
sam sync --watch --stack-name chat-app
```
In about 5 minutes,when the stack deployment accomplished . You can get API key and API gateway endpoint from the cloudformation stack outputs tab.


## Acknowledgments

This project was made possible with the help of the following AWS services:
- Amazon Polly
- Amazon Bedrock Claude Haiku
- Amazon SageMaker Endpoint
- Amazon Lambda
- Amazon API Gateway
