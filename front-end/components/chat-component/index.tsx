"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Input, Button, Alert, message as antdMsg, Flex, Progress } from "antd";
import { useSearchParams } from "next/navigation";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 740px;
  background-color: rgba(240, 240, 240, 0.8);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 695px;
`;

const MessageItem = styled.div<{ isUser: string }>`
  background-color: ${(props: any) =>
    props && props.isUser === "user" ? "#DCF8C6" : "#E8F8F5"};
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  max-width: 300px;
  align-self: ${(props: any) =>
    props && props.isUser === "user" ? "flex-end" : "flex-start"};
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  border-radius: 4px;
`;

const InputButtonWrapper = styled.div`
  position: relative;
  display: flex;
`;

interface Message {
  role: "user" | "Robot";
  content?: any;
}

const EMOTION_ACTION: any = {
  Robot: {
    upset: {
      states: "Walking",
      emotes: "Punch",
      expressions: { key: "2", value: 1 },
    },
    smile: {
      states: "Walking",
      emotes: "ThumbsUp",
      expressions: undefined,
    },
    exciting: {
      states: "Dance",
      emotes: "Wave",
      expressions: { key: "1", value: 1 },
    },
    angry: {
      states: "Running",
      emotes: "Punch",
      expressions: { key: "0", value: 1 },
    },
    confused: {
      states: "Idle",
      emotes: "No",
      expressions: { key: "0", value: 1 },
    },
    dead: {
      states: "Death",
      emotes: "No",
      expressions: undefined,
    },
  },
  dancinggirl: {
    upset: {
      states: "shakeFist",
    },
    smile: {
      states: "happy",
    },
    exciting: {
      states: "dance",
    },
    angry: {
      states: "angry",
    },
    confused: {
      states: "sad",
    },
    dead: {
      states: "idle",
    },
  },
  girl: {
    upset: {
      states: "Armature.001|a-person-feel-e|default",
    },
    smile: {
      states: "happy",
    },
    exciting: {
      states: "dancing",
    },
    angry: {
      states: "angry",
    },
    confused: {
      states: "sadIdle",
    },
    dead: {
      states: "angry",
    },
  },
  itman: {
    upset: {
      states: "pistol",
    },
    smile: {
      states: "victory",
    },
    exciting: {
      states: "strongGesture",
    },
    angry: {
      states: "sadWalk",
    },
    confused: {
      states: "clench",
    },
    dead: {
      states: "idle",
    },
  },
  mum: {
    upset: {
      states: "Acknowledge",
    },
    smile: {
      states: "headNodeYes",
    },
    exciting: {
      states: "excited",
    },
    angry: {
      states: "AngryPoint",
    },
    confused: {
      states: "shakingHead",
    },
    dead: {
      states: "breakdance",
    },
  },
};

const CHAT_BACKGROUND: any = {
  Robot: [
    { role: "user", content: [{ type: "text", text: "hi" }] },
    {
      role: "Robot",
      content: [
        {
          type: "text",
          text: "背景: 你弄丢了我的最新款的特斯拉电池，那是可以让我一个月不用充电的玩意。我现在对你很失望。",
        },
      ],
    },
  ] as Message[],
  girl: [
    { role: "user", content: [{ type: "text", text: "hi" }] },
    {
      role: "girl",
      content: [
        {
          type: "text",
          text: "背景: 十五年后, 你已经长大结婚, 但依然无法忘记曾经中学时期喜欢的女孩, 你跟她见了一面, 她变得很优秀, 你搞不清楚现在的感情是喜欢还是欣赏, 你坦诚的把自己的想法告诉了女朋友, 并准备面临她的雷霆。",
        },
      ],
    },
  ] as Message[],
  itman: [
    { role: "user", content: [{ type: "text", text: "hi" }] },
    {
      role: "itman",
      content: [
        {
          type: "text",
          text: "背景: A boss who: - Lacks patience and understanding - Is quick to anger and loses emotional control - Lacks communication and expression skills - Particularly enjoys having others flatter him. 对象是老板，玩家（你）按照老板的需求做了一个分析表，老板看不懂，无能狂怒了。",
        },
      ],
    },
  ] as Message[],
  mum: [
    { role: "user", content: [{ type: "text", text: "hi" }] },
    {
      role: "itman",
      content: [
        {
          type: "text",
          text: "背景: 一天, 家里的小儿子, 把0分试卷拿回了家, 他的母亲非常生气, 在责小儿子不应该天天沉迷游戏, 应该把更多的时间放到学习上。",
        },
      ],
    },
  ] as Message[],
};

const ChatComponent = (props: any) => {
  const { gameId, fadeToAction, expressionFolder, voiceId } = props;
  const [messages, setMessages] = useState<Message[]>(
    (CHAT_BACKGROUND[gameId] as Message[]) || []
  );
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scoreData, setScoreData] = useState(0);
  const [messageApi, contextHolder] = antdMsg.useMessage();

  const mediaRecorder = useRef(null as any);
  const audioChunks = useRef([] as any);
  const audioRefs: any = useRef<(HTMLAudioElement | null)[]>([] as any[]);
  const messageListRef: any = useRef(null);
  const mediaStream: any = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();
  const lang = searchParams?.get("lang") || "zh-CN";

  useEffect(() => {
    return () => {
      if (mediaStream.current) {
        mediaStream.current
          .getTracks()
          .forEach((track: { stop: () => any }) => track.stop());
      }
    };
  }, []);

  useLayoutEffect(() => {
    setIsMobile(window.screen.width < 750);
    // audioRef.current = new Audio();
    return () => {
      // audioRef.current.pause();
      // audioRef.current.src = "";
    };
  }, []);

  const handleDataAvailable = (event: { data: { size: number } }) => {
    if (event.data.size > 0) {
      audioChunks.current.push(event.data);
    }
  };

  const startRecording = async () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        mediaStream.current = stream;
        recorder.ondataavailable = handleDataAvailable;
        recorder.start();
        setIsRecording(true);
      })
      .catch((err) => console.error("Error accessing microphone:", err));
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    mediaStream.current
      .getTracks()
      .forEach((track: { stop: () => any }) => track.stop());
    setIsRecording(false);
    handleFinalData();
  };
  const handleFinalData = () => {
    mediaRecorder.current.ondataavailable = (event: {
      data: { size: number };
    }) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
      sendAudioToServer();
    };
  };

  const sendAudioToServer = async () => {
    setIsLoading(true);
    const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");
    const boundary =
      "----WebKitFormBoundary" + Math.random().toString(36).substr(2);
    try {
      const response = await axios.post("/api/wisper", audioBlob, {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          apikey: process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (response.data && response.data.result && response.data.result.text) {
        await sendVoiceMessage(response.data.result.text[0]);
      }
    } catch (error) {
      console.error("Error sending audio to server:", error);
      setIsLoading(false);
    }

    audioChunks.current = [];
  };

  const sendVoiceMessage = async (voiceInput: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: [{ type: "text", text: voiceInput }],
      },
    ]);

    await requestMsg(voiceInput);

    setIsLoading(false);
  };

  const getOldMsgList = (msgList: any[]) => {
    msgList.pop();
    return msgList;
  };

  const requestMsg = async (requestData: string) => {
    try {
      const sendMsg = messages.map((item) => {
        return {
          role: item.role,
          content: [
            {
              type: item.content[0].type,
              text: item.content[0].text,
            },
          ],
        };
      });
      const response = await axios.post(
        "/api/chatMsg",
        {
          messages: [
            ...sendMsg,
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: requestData,
                },
              ],
            },
          ],
          gameid: gameId,
          languageId: lang,
          voiceId: voiceId,
        },
        {
          headers: { apikey: process.env.NEXT_PUBLIC_API_KEY },
        }
      );
      if (response.data.message && response.data.message === "error") {
        setMessages((prevMessages) => [...getOldMsgList(prevMessages)]);

        setIsLoading(false);
        return;
      }
      if (
        !response.data ||
        !response.data.message ||
        !response.data.message.content
      ) {
        return;
      }
      const contentResult = changeResult(
        response.data.message.content[0].content
      );
      setRobotStatus(contentResult);
      console.log("contentResult", contentResult);
      let showText = "";
      if (contentResult && contentResult.hint_lang) {
        showText = contentResult.hint_lang;
      }
      if (contentResult && contentResult.answer) {
        showText = contentResult.answer;
      }
      if (contentResult && contentResult.scene) {
        showText = contentResult.scene;
      }
      const addMsg: any = {
        role: gameId,
        content: [
          {
            type: "text",
            text: showText,
          },
        ],
      };
      if (contentResult.answer) {
        addMsg.content[0].audiolink =
          response.data.message.content[0].audiolink;
      }
      setMessages((prevMessages) => [...prevMessages, addMsg]);
      const latestAudioRef = audioRefs.current[audioRefs.current.length - 1];
      if (latestAudioRef && latestAudioRef.play && contentResult.answer) {
        // const audioBlob = new Blob(
        //   [response.data.message.content[0].audiolink],
        //   { type: "audio/mpeg" }
        // );
        // const audioUrl = URL.createObjectURL(audioBlob);
        // if (!latestAudioRef.current) {
        //   latestAudioRef.current = new Audio();
        // }
        // latestAudioRef.current.src = audioUrl;
        // audioRefs.current.src = response.data.message.content[0].audiolink;
        // latestAudioRef.play();
      }
    } catch (error) {
      console.error("Error sending text to server:", error);
    }
  };

  const sendTextMessage = async () => {
    if (!inputValue || !inputValue.trim() || isLoading) {
      return;
    }
    setIsLoading(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "user",
        content: [{ type: "text", text: inputValue }],
      },
    ]);

    await requestMsg(inputValue);

    setInputValue("");
    setIsLoading(false);
  };

  const setRobotStatus = (contentObj: any) => {
    const tempScoreData = scoreData;
    !!contentObj.delta_score &&
      setScoreData(scoreData + contentObj.delta_score);
    if (tempScoreData + contentObj.delta_score > 50) {
      messageApi.success("恭喜您！已成功把小R哄好了");
      alert("恭喜您！已成功把小R哄好了");
      sendResultMsg("success");
      return contentObj;
    } else if (tempScoreData + contentObj.delta_score < -50) {
      messageApi.error("失败了，他走了");
      if (contentObj && contentObj.emotion) {
        setEmotionAction("dead");
      }
      sendResultMsg("failed");
      alert("失败了，他走了");

      return contentObj;
    }

    if (contentObj && contentObj.emotion) {
      setEmotionAction(contentObj.emotion);
    }
  };

  const sendResultMsg = async (status: string) => {
    const result = await axios.post(
      "/api/sendResultMsg",
      { gameId, gameResult: status },
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return;
  };

  const changeResult = (content: string) => {
    let result = content
      .trim()
      .replaceAll("<result>", "")
      .replaceAll("</result>", "")
      .replaceAll("\n", "");
    try {
      const resultObj = JSON.parse(result);
      console.log("resultObj", resultObj);
      return resultObj;
    } catch (error) {}

    return result;
  };

  const setEmotionAction = (emotion: any) => {
    try {
      const tempEmotion = EMOTION_ACTION[gameId][emotion]
        ? EMOTION_ACTION[gameId][emotion]
        : EMOTION_ACTION[gameId].upset;
      console.log("tempEmotion", tempEmotion);
      if (emotion === "dead") {
        fadeToAction(tempEmotion.states, 0.5);
        return;
      }
      tempEmotion.emotes && fadeToAction(tempEmotion.emotes, 0.5);
      setTimeout(() => {
        tempEmotion.emotes && fadeToAction(tempEmotion.emotes, 0.5);
        setTimeout(() => {
          fadeToAction(tempEmotion.states, 0.5);
        }, 3000);
      }, 2200);
      if (tempEmotion.expressions) {
        const customerEvent = new CustomEvent("expressionFolder", {
          detail: {
            key: tempEmotion.expressions.key,
            value: tempEmotion.expressions.value,
            isZero: false,
          },
        });
        window.dispatchEvent(customerEvent);
      } else {
        const customerEvent = new CustomEvent("expressionFolder", {
          detail: {
            isZero: true,
          },
        });
        window.dispatchEvent(customerEvent);
      }
      return;
    } catch (error) {
      console.error("setEmotionAction Error", error);
      return;
    }
  };

  const scrollToBottom = () => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight + 110;
    }
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === "Enter") {
      sendTextMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ChatContainer>
      {contextHolder}
      <Flex gap="small" vertical>
        <Progress
          format={(percent, successPercent) => {
            return Math.round(((scoreData + 50) / 150) * 100) + "分";
          }}
          percent={Math.round(((scoreData + 50) / 150) * 100)}
          status="active"
        />
      </Flex>
      <MessageList ref={messageListRef} className="msg-list">
        {messages.map((message, index) => (
          <Alert
            key={message.role + index}
            message={
              <>
                <p>{message.content[0].text}</p>
                {message.content[0].audiolink ? (
                  <audio
                    ref={(ref) => {
                      audioRefs.current[index] = ref;
                    }}
                    controls
                    style={{ width: "220px", height: "30px" }}
                    autoPlay
                    // crossOrigin="use-credentials"
                  >
                    <source
                      src={message.content[0].audiolink}
                      type="audio/mpeg"
                    />
                  </audio>
                ) : (
                  <></>
                )}
              </>
            }
            type={message.role === "user" ? "success" : "info"}
            style={{
              maxWidth: "300px",
              marginBottom: "10px",
              padding: "10px",
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
            }}
          />
        ))}
      </MessageList>
      <InputContainer>
        {isMobile && (
          <>
            <Input
              type="text"
              value={inputValue}
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => setInputValue(e.target.value)}
              placeholder="Enter text..."
              onKeyDown={handleKeyDown}
              disabled={scoreData < -50 || scoreData > 100}
              className="chat-input"
            />
            <br></br>
            <Button
              onClick={sendTextMessage}
              type="primary"
              size="large"
              style={{ marginLeft: "10px" }}
              disabled={scoreData < -50 || scoreData > 100}
            >
              Send
            </Button>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="large"
              style={{ marginLeft: "10px" }}
              disabled={scoreData < -50 || scoreData > 100}
            >
              {isRecording ? "Stop" : "Record"}
            </Button>
            {isLoading && <LoadingOverlay>Loading...</LoadingOverlay>}
          </>
        )}
        {!isMobile && (
          <InputButtonWrapper>
            <Input
              type="text"
              value={inputValue}
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => setInputValue(e.target.value)}
              placeholder="Enter text..."
              onKeyDown={handleKeyDown}
              disabled={scoreData < -50 || scoreData > 100}
              className="chat-input"
            />
            <Button
              onClick={sendTextMessage}
              type="primary"
              size="large"
              style={{ marginLeft: "10px" }}
              disabled={scoreData < -50 || scoreData > 100}
            >
              Send
            </Button>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="large"
              style={{ marginLeft: "10px" }}
              disabled={scoreData < -50 || scoreData > 100}
            >
              {isRecording ? "Stop" : "Record"}
            </Button>
            {isLoading && <LoadingOverlay>Loading...</LoadingOverlay>}
          </InputButtonWrapper>
        )}
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatComponent;
