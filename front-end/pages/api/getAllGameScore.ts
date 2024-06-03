import { getAllGameScore } from "@/service/common-service";
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

  try {
    const result = await getAllGameScore();
    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json(error);
  }
}
