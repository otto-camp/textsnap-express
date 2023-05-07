import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { createWorker } from "tesseract.js";

const app = express();

const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/", upload.single("image"), (req: Request, res: Response) => {
  console.log(req.file);
  if (req.file) {
    getText(req.file.path)
      .then((text) => {
        res.send(text);
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  }
  // res.status(404).send("file is broken.");
});

app.listen(5000, () =>
  console.log("Server listening on http://localhost:5000")
);

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

        await worker.terminate();
      })();
    } catch (error) {
      reject(error);
    }
  });
}
