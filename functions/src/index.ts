import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import Busboy from "busboy";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

admin.initializeApp();

export const transcribeAudio = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const busboy = Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();
  let filePath: string;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  busboy.on("file", (fieldname, file, info) => {
    const { filename } = info;
    filePath = path.join(tmpdir, filename);
    const writeStream = fs.createWriteStream(filePath);
    file.pipe(writeStream);
  });

  busboy.on("finish", async () => {
    try {
      if (!filePath) {
        res.status(400).send("No file uploaded");
        return;
      }

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
      });

      // Clean up temp file
      fs.unlinkSync(filePath);

      res.status(200).send({ text: transcription.text });
    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(500).send({ error: error.message });
    }
  });

  busboy.end(req.rawBody);
});
