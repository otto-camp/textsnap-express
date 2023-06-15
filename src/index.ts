import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import multer from "multer";
import http from "http";
import { Server, Socket } from "socket.io";

import { getTextFromImageFile } from "./services/getTextFromImageFile";
import { errorHandler } from "./middlewares/errorHandler";
import { getTextFromImageUrl } from "./services/getTextFromImageUrl";

dotenv.config();

const upload = multer({ dest: "uploads/" });
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = (process.env.PORT as any) || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cors(), bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.post("/:lang/image", upload.single("image"), (req: Request, res: Response) => {
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
});

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
    res.status(404).send("file is broken.");
  }
});

app.use(errorHandler);

io.on("connection", (socket: Socket) => {
  console.log("A client connected");

  socket.on("imageRequest", (data) => {
    const { lang, file } = data;
    
    if (file) {
      getTextFromImageFile(file, lang)
        .then((text) => {
          socket.emit("imageResponse", text);
        })
        .catch((error) => {
          socket.emit("imageError", error);
        });
    } else {
      socket.emit("imageError", "file is broken.");
    }
  });

  socket.on("imageUrlRequest", (data) => {
    const { lang, url } = data;
    
    if (url) {
      getTextFromImageUrl(url, lang)
        .then((text) => {
          socket.emit("imageUrlResponse", text);
        })
        .catch((error) => {
          socket.emit("imageUrlError", error);
        });
    } else {
      socket.emit("imageUrlError", "url is broken.");
    }
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log("Server listening on port", port);
});
