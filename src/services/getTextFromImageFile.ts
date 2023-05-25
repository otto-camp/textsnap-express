import fs from "fs";
import { createWorker } from "tesseract.js";

export async function getTextFromImageFile(imagePath: string, lang: string): Promise<string> {
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
