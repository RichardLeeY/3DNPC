"use client";
import React, { useEffect, useState } from "react";
import { Layout, Space, Card } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
const { Meta } = Card;
import "../globals.css";
import ChatPage from "../chat-page/page";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Modal, Radio } from "antd";
import type { RadioChangeEvent } from "antd";

const colorConfig: any = {
  red: "#FF4244",
  green: "#3cb372",
  def: "",
};

const NpcList: React.FC = () => {
  const [init, setInit] = useState(false);
  const [robotShowTxt, setRobotShowTxt] = useState("Win: 0 Win rate: 0%");
  const [girlShowTxt, setGirlShowTxt] = useState("Win: 0 Win rate: 0%");
  const [girlMumTxt, setMumShowTxt] = useState("Win: 0 Win rate: 0%");
  const [itmanShowTxt, setITManShowTxt] = useState("Win: 0 Win rate: 0%");

  const [robotColor, setRobotColor] = useState("def");
  const [girlColor, setGirlColor] = useState("def");
  const [girlMumColor, setMumColor] = useState("def");
  const [itmanColor, setITManColor] = useState("def");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [langValue, setLangValue] = useState("zh-CN");

  const router = useRouter();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
    getGameScore();
  }, []);

  const jumpToPage = (pageName: string) => {
    router.push("/chat-page?lang=" + langValue + "&pageType=" + pageName);
  };

  const getGameScore = async () => {
    const robotResult = await axios.get("/api/getAllGameScore", {
      headers: {
        apikey: process.env.NEXT_PUBLIC_API_KEY,
      },
    });

    if (robotResult && robotResult.data) {
      if (
        robotResult.data[0] &&
        Array.isArray(robotResult.data[0]) &&
        robotResult.data[0][0]
      ) {
        const tempData = robotResult.data[0][0];
        setRobotColor(
          tempData.success_times / (tempData.times || 1) > 0.5 ? "green" : "red"
        );
        setRobotShowTxt(
          `Win: ${tempData.success_times} Win rate:${Math.round(
            (tempData.success_times / (tempData.times || 1)) * 100
          )} %`
        );
      }
      if (
        robotResult.data[1] &&
        Array.isArray(robotResult.data[1]) &&
        robotResult.data[1][0]
      ) {
        const tempData = robotResult.data[1][0];
        setGirlColor(
          tempData.success_times / (tempData.times || 1) > 0.5 ? "green" : "red"
        );
        setGirlShowTxt(
          `Win: ${tempData.success_times} Win rate:${Math.round(
            (tempData.success_times / (tempData.times || 1)) * 100
          )} %`
        );
      }
      if (
        robotResult.data[2] &&
        Array.isArray(robotResult.data[2]) &&
        robotResult.data[2][0]
      ) {
        const tempData = robotResult.data[2][0];
        setITManColor(
          tempData.success_times / (tempData.times || 1) > 0.5 ? "green" : "red"
        );
        setITManShowTxt(
          `Win: ${tempData.success_times} Win rate:${Math.round(
            (tempData.success_times / (tempData.times || 1)) * 100
          )} %`
        );
      }
      if (
        robotResult.data[3] &&
        Array.isArray(robotResult.data[3]) &&
        robotResult.data[3][0]
      ) {
        const tempData = robotResult.data[3][0];
        setMumColor(
          tempData.success_times / (tempData.times || 1) > 0.5 ? "green" : "red"
        );
        setMumShowTxt(
          `Win: ${tempData.success_times} Win rate:${Math.round(
            (tempData.success_times / (tempData.times || 1)) * 100
          )} %`
        );
      }
    }
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const radioOnChange = (e: RadioChangeEvent) => {
    setLangValue(e.target.value);
  };

  return (
    init && (
      <Layout>
        <Modal
          title="Language select/语言选择"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Radio.Group onChange={radioOnChange} value={langValue}>
            <Radio value={"zh-CN"}>中文</Radio>
            <Radio value={"en"}>English</Radio>
          </Radio.Group>
        </Modal>
        <Particles
          id="tsparticles"
          options={{
            particles: {
              destroy: {
                mode: "split",
                split: {
                  count: 1,
                  factor: {
                    value: {
                      min: 2,
                      max: 4,
                    },
                  },
                  rate: {
                    value: 100,
                  },
                  particles: {
                    life: {
                      count: 1,
                      duration: {
                        value: {
                          min: 2,
                          max: 3,
                        },
                      },
                    },
                    move: {
                      speed: {
                        min: 10,
                        max: 15,
                      },
                    },
                  },
                },
              },
              number: {
                value: 80,
              },
              color: {
                value: [
                  "#3998D0",
                  "#2EB6AF",
                  "#A9BD33",
                  "#FEC73B",
                  "#F89930",
                  "#F45623",
                  "#D62E32",
                  "#EB586E",
                  "#9952CF",
                ],
              },
              shape: {
                type: "circle",
              },
              opacity: {
                value: 0.8,
              },
              size: {
                value: {
                  min: 3,
                  max: 15,
                },
              },
              collisions: {
                enable: true,
                mode: "bounce",
              },
              move: {
                enable: true,
                speed: 4,
                outModes: "bounce",
              },
            },
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "pop",
                },
              },
            },
            background: {
              color: "#000000",
            },
          }}
        />

        <img alt="moon" src="/logo-moon.svg" className="demo-logo" />
        <Content
          style={{
            padding: "0 6px",
            position: "absolute",
            backgroundColor: "transparent",
            color: "#fff",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          className="list-content"
        >
          <Space size={[24, 16]} wrap>
            <Card
              className="npc-card"
              hoverable
              style={{ width: 240 }}
              cover={<ChatPage isShowList={true} cardType="robot" />}
              onClick={() => jumpToPage("robot")}
            >
              <Meta
                title="Robot pet Wall-AWS"
                description={
                  <span
                    style={{
                      color: colorConfig[robotColor] || "",
                      fontSize: "18px",
                    }}
                  >
                    {robotShowTxt}
                  </span>
                }
              />
            </Card>
            <Card
              className="npc-card"
              hoverable
              style={{ width: 240 }}
              cover={<ChatPage isShowList={true} cardType="richard" />}
              onClick={() => jumpToPage("richard")}
            >
              <Meta
                title="IT Man"
                description={
                  <span
                    style={{
                      color: colorConfig[itmanColor] || "",
                      fontSize: "18px",
                    }}
                  >
                    {itmanShowTxt}
                  </span>
                }
              />
            </Card>

            <Card
              className="npc-card"
              hoverable
              style={{ width: 240 }}
              cover={<ChatPage isShowList={true} cardType="dream-girl" />}
              onClick={() => jumpToPage("dream-girl")}
            >
              <Meta
                title="Dream Girl"
                description={
                  <span
                    style={{
                      color: colorConfig[girlColor] || "",
                      fontSize: "18px",
                    }}
                  >
                    {girlShowTxt}
                  </span>
                }
              />
            </Card>
            <Card
              className="npc-card"
              hoverable
              style={{ width: 240 }}
              cover={<ChatPage isShowList={true} cardType="mum" />}
              onClick={() => jumpToPage("mum")}
            >
              <Meta
                title="Mum"
                description={
                  <span
                    style={{
                      color: colorConfig[girlMumColor] || "",
                      fontSize: "18px",
                    }}
                  >
                    {girlMumTxt}
                  </span>
                }
              />
            </Card>
          </Space>
        </Content>
        <Footer
          style={{
            position: "fixed",
            bottom: 0,
            backgroundColor: "transparent",
            color: "#fff",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          亚马逊云科技 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    )
  );
};

export default NpcList;
