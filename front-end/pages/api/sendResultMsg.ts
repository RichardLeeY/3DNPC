import { sendResultMsg } from "@/service/common-service";
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
  if (!req.body) {
    res.status(400).json("Param Error");
    return;
  }
  try {
    const result = await sendResultMsg(req.body.gameId, req.body.gameResult);
    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json(error);
  }
}
