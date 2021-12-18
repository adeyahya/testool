import { scanImageData } from "zbar.wasm";

const convertBase64ToBlob = (base64Image: string) => {
  // Split into two parts
  const parts = base64Image.split(";base64,");

  // Hold the content type
  const imageType = parts[0].split(":")[1];

  // Decode Base64 string
  const decodedData = atob(parts[1]);

  // Create UNIT8ARRAY of size same as row data length
  const uInt8Array = new Uint8Array(decodedData.length);

  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    uInt8Array[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([uInt8Array], { type: imageType });
};

const clickHandler = async () => {
  const capturedImage = await chrome.tabs.captureVisibleTab();

  const tabId = await getTabId();
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId as number },
      func: () => {
        return { width: globalThis.innerWidth, height: globalThis.innerHeight };
      },
    },
    async (result) => {
      const blob = convertBase64ToBlob(capturedImage);
      const image = await createImageBitmap(blob);
      if (result?.[0]?.result?.width) {
        const width = result[0].result.width;
        const height = result[0].result.height;
        // @ts-ignore
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const res = await scanImageData(imageData);
        const strRes = res.map((r) => r.decode());

        chrome.scripting.executeScript({
          target: { tabId: tabId as number },
          func: (data) => {
            data.forEach((item: string) => {
              console.log(item);
            });
          },
          args: [strRes as any] as any,
        });
      }
    }
  );
};

async function getTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs.length > 0 ? tabs[0].id : null;
}

chrome.action.onClicked.addListener(clickHandler);
