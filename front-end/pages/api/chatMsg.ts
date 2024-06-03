import { sendMsgToServer } from "@/service/common-service";
import { API_KEY } from "@/tools/const";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.headers || !req.headers.apikey || req.headers.apikey !== API_KEY) {
    res.status(401).json("No Auth");
    return;
  }
  if (!req.body || !req.body.messages) {
    res.status(400).json("Param Error");
    return;
  }
  try {
    const result = await sendMsgToServer(req.body);
    console.log("result content", result.message.content);
    // const result = { message: "success", text: "hello", type: "text" };
    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json(error);
  }
}
