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
### Back-end
2. Deploy backend serverless rest api
```
cd chat-app
sam sync --watch --stack-name chat-app
```
In about 5 minutes,when the stack deployment accomplished . You can get API key and API gateway endpoint from the cloudformation stack outputs tab.

### Front-end
3. Edit the front-end .env file, set the "random authentication key" and  backend serverless rest api host/key in the .env file.
```
cd front-end
vim .env
```
NEXT_PUBLIC_API_KEY="random authentication key"
API_KEY="random authentication key"

4. Deploy front-end service
```
cd front-end
npm install # install dependencies
npm run build
npm run dev # local debug
npm run start # start service in current command line
sudo pm2 start npm -- start # start service by pm2
```


## Acknowledgments

This project was made possible with the help of the following AWS services:
- Amazon Polly
- Amazon Bedrock Claude Haiku
- Amazon SageMaker Endpoint
- Amazon Lambda
- Amazon API Gateway
- Amazon EC2

## Dependencies

### Front-end
- Next.js（ https://github.com/vercel/next.js ）
- ant-design（ https://github.com/ant-design/ant-design ）
- Three.js（ https://threejs.org/ ）

### Back-end


## Contents

```
├── chat-app  // back-end 
│   ├── assets
│   ├── chat
│   │   └── prompts
│   ├── events
│   ├── layers
│   │   ├── boto3-layer
│   │   ├── sagemaker-layer
│   │   └── scipy-layer
│   ├── tests
│   │   ├── integration
│   │   └── unit
│   ├── ttsAsync
│   └── wav2mp3Func
├── front-end  // front-end
│   ├── app    // Pages
│   │   ├── chat-page
│   │   └── npc-list
│   ├── components  // UI Components
│   │   ├── animation-skinning-morph
│   │   ├── chat-component
│   │   ├── dream-girl
│   │   ├── mum
│   │   └── richard
│   ├── pages  // Nextjs API（Backend-for-Frontend）
│   │   └── api
│   ├── public  // images & glb file
│   │   └── models
│   ├── service  // Backend-for-Frontend to back-end 
│   ├── tempAudio  // Temp audio data
│   └── tools
└── images   // Readme images
```