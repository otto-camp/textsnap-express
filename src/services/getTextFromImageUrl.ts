import { createWorker } from "tesseract.js";

export async function getTextFromImageUrl(
  imageUrl: string,
  lang: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const worker = await createWorker();
    try {
      (async () => {
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        const {
          data: { text },
        } = await worker.recognize(imageUrl);
        resolve(text);
        await worker.terminate();
      })();
    } catch (error) {
      reject(error);
    }
  });
}
