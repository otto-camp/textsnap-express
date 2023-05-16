import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { createScheduler, createWorker } from "tesseract.js";
import fs from "fs";

const app = express();
const port = (process.env.PORT as any) || 3000;
app.use(cors());
app.listen(port, "0.0.0.0", () => console.log("Server listening"));

const upload = multer({ dest: "uploads/" });

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.post("/", upload.single("image"), (req: Request, res: Response) => {
  if (req.file) {
    getText(req.file.path, "eng")
      .then((text) => {
        res.send(text);
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  } else {
    res.status(404).send("file is broken.");
  }
});

async function getText(imagePath: string, lang: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const worker = await createWorker();
    try {
      (async () => {
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        const {
          data: { text },
        } = await worker.recognize(imagePath);
        resolve(text);
        if (imagePath) {
          fs.unlink(imagePath, (err) => {
            if (err) console.error(err);
          });
        }
        await worker.terminate();
      })();
    } catch (error) {
      reject(error);
    }
  });
}
