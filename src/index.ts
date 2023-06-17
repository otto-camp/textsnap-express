import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import multer from "multer";

import { errorHandler } from "./middlewares/errorHandler";
import { createWorker } from "tesseract.js";
import { unlinkSync } from "fs";

dotenv.config();

const upload = multer({ dest: "uploads/" });
const app = express();
const port = (process.env.PORT as any) || 3000;


app.use(express.json({ limit: "2mb" }));
app.use(cors());

app.listen(port, "0.0.0.0", () => {
  console.log("Server listening on port", port);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.post(
  "/:lang/image",
  upload.single("image"),
  async (req: Request, res: Response) => {
    if (req.file) {
      const worker = await createWorker();
      try {
        await worker.loadLanguage(req.params.lang);
        await worker.initialize(req.params.lang);
        const {
          data: { text },
        } = await worker.recognize(req.file.path);
        res.status(200).send(text);
        await worker.terminate();
        unlinkSync(req.file.path);
      } catch (error) {
        res.status(404).send(error);
        unlinkSync(req.file.path);
      }
    } else {
      res.status(404).send("file is broken.");
    }
  }
);

app.post("/:lang/image-url", async (req: Request, res: Response) => {
  if (req.body.url) {
    const worker = await createWorker();
    try {
      await worker.loadLanguage(req.params.lang);
      await worker.initialize(req.params.lang);
      const {
        data: { text },
      } = await worker.recognize(req.body.url);
      res.status(202).send(text);
      await worker.terminate();
    } catch (error) {
      res.status(404).send(error);
    }
  } else {
    res.status(404).send("file is broken.");
  }
});

app.use(errorHandler);
