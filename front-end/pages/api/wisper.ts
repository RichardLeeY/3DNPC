import { wisperGetText } from "@/service/common-service";
import { API_KEY } from "@/tools/const";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
export const config = {
  runtime: "nodejs",
  api: {
    bodyParser: false,
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.headers || !req.headers.apikey || req.headers.apikey !== API_KEY) {
    res.status(401).json("No Auth");
    return;
  }
  console.log("req.body", req);

  try {
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }
    if (!buffers || buffers.length === 0) {
      res.status(400).json("Param Error");
      return;
    }
    const audioFile = Buffer.concat(buffers);
    console.log("audioFile", audioFile);
    const tempDir = path.join(process.cwd(), "tempAudio");

    // 确保 temp 文件夹存在
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filePath = path.join(
      tempDir,
      "audio" + new Date().valueOf() + ".wav"
    );
    await fs.promises.writeFile(filePath, audioFile);

    const fileData = await fs.promises.readFile(filePath);
    const result = await wisperGetText(fileData);
    // 删除临时文件
    await fs.promises.unlink(filePath);

    res.status(200).json({ result });
  } catch (error: any) {
    console.log("error", error);
    res.status(error.httpCode || 500).json(error);
  }
}
