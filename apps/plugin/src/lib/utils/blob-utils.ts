export async function getBase64ForImgBlob(blob: Blob): Promise<string> {
  return new Promise((res) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64data = reader.result as string;
      res(base64data);
    };
    reader.readAsDataURL(blob);
  });
}
