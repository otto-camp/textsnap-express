import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { createWorker } from "tesseract.js";
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
    getText(req.file.path)
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

async function getText(imagePath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const worker = await createWorker();
      (async () => {
        await worker.loadLanguage("eng+tur");
        await worker.initialize("eng+tur");
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
