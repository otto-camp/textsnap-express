import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import multer from "multer";

import { getTextFromImageFile } from "./services/getTextFromImageFile";
import { errorHandler } from "./middlewares/errorHandler";
import { getTextFromImageUrl } from "./services/getTextFromImageUrl";

dotenv.config();

const upload = multer({ dest: "uploads/" });
const app = express();
const port = (process.env.PORT as any) || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cors(), bodyParser.json());

app.listen(port, "0.0.0.0", () =>
  console.log("Server listening on port", port)
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.post(
  "/:lang/image",
  upload.single("image"),
  (req: Request, res: Response) => {
    if (req.file) {
      getTextFromImageFile(req.file.path, req.params.lang)
        .then((text) => {
          res.send(text);
        })
        .catch((error) => {
          res.status(404).send(error);
        });
    } else {
      res.status(404).send("file is broken.");
    }
  }
);

app.post("/:lang/image-url", (req: Request, res: Response) => {
  if (req.body.url) {
    getTextFromImageUrl(req.body.url, req.params.lang)
      .then((text) => {
        res.send(text);
      })
      .catch((error) => {
        res.status(404).send(error);
      });
  } else {
    console.log(req.body);
    res.status(404).send("file is broken.");
  }
});

app.use(errorHandler);
