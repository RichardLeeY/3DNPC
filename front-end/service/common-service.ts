import { API_GATEWAY_KEY, API_GATEWAY_URL } from "@/tools/const";

export const sendMsgToServer = async (data: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", API_GATEWAY_KEY);
    myHeaders.append("Content-Type", "application/json");
    const postBody = {
      gameid: data.gameid,
      messages: data.messages,
      languageId: data.languageId,
      voiceId: data.voiceId,
    };
    console.log("postBody", JSON.stringify(postBody));
    const respone = await fetch(API_GATEWAY_URL + "inference", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(postBody),
    });
    if (!respone.ok) {
      console.log("respone", respone);
      return { message: "error", text: "error" };
    }
    const result = await respone.json();
    if (
      result &&
      result.message &&
      result.message.content &&
      result.message.content.length > 0 &&
      result.message.content[0].audiolink
    ) {
      await sleep(data.languageId === "en" ? 6000 : 10000);
      await getAudioLink(result.message.content[0].audiolink);
    }

    return result;
  } catch (error) {
    console.error("SendMsgToServer Error:", error);
    return { message: "error", text: "error" };
  }
};

const getAudioLink = async (audiolink: string | URL | Request) => {
  const respone = await fetch(audiolink);
  if (respone.ok) {
    return;
  }
  await sleep(5000);
  const responeSec = await fetch(audiolink);
  if (responeSec.ok) {
    return;
  }
  await sleep(3000);
};

function sleep(ms: number | undefined) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const wisperGetText = async (data: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", API_GATEWAY_KEY);
    myHeaders.append("Content-Type", "audio/wav");
    const respone = await fetch(API_GATEWAY_URL + "wisper", {
      method: "POST",
      headers: myHeaders,
      body: data,
    });
    respone.status !== 502 && console.log("wisperGetText respone", respone);
    respone.status === 502 && console.log("wisperGetText respone 502");

    if (!respone.ok) {
      return { message: "error", text: "error" };
    }
    return await respone.json();
  } catch (error) {
    console.error("WisperGetText Error:", error);
    return { message: "error", text: "error" };
  }
};

export const getAllGameScore = async () => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", API_GATEWAY_KEY);
    myHeaders.append("Content-Type", "application/json");
    const responeRobot = fetch(API_GATEWAY_URL + "games/robot", {
      method: "GET",
      headers: myHeaders,
    });
    const responeGirl = fetch(API_GATEWAY_URL + "games/girl", {
      method: "GET",
      headers: myHeaders,
    });
    const responeItman = fetch(API_GATEWAY_URL + "games/itman", {
      method: "GET",
      headers: myHeaders,
    });
    const responeMum = fetch(API_GATEWAY_URL + "games/mum", {
      method: "GET",
      headers: myHeaders,
    });

    const responeList = await Promise.all([
      responeRobot,
      responeGirl,
      responeItman,
      responeMum,
    ]);

    const resultList = await Promise.all(
      responeList.map((item) => item.json())
    );
    return resultList;
  } catch (error) {
    console.error("WisperGetText Error:", error);
    return { message: "error", text: "error" };
  }
};

export const sendResultMsg = async (gameId: string, result: string) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", API_GATEWAY_KEY);
    myHeaders.append("Content-Type", "application/json");
    const postBody = {
      result: result === "success" ? 1 : 0,
    };
    const respone = await fetch(API_GATEWAY_URL + "games/" + gameId, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(postBody),
    });
    if (!respone.ok) {
      console.log("sendResultMsg respone", respone);
      return { message: "error", text: "error" };
    }
    return await respone.json();
  } catch (error) {
    console.error("SendResultMsg Error:", error);
    return { message: "error", text: "error" };
  }
};
