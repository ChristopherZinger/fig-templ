import { getBase64ForImgBlob } from "./blob-utils";

export async function replaceBgImgStyleUrlsWithBase64({
  htmlStringInput,
  imgHashToBlob,
}: {
  htmlStringInput: string;
  imgHashToBlob: Record<string, Blob>;
}): Promise<string | null> {
  if (!htmlStringInput) {
    console.error("expected_htmlString");
    return null;
  }

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  if (!iframe.contentDocument) {
    console.error("expected_contentDocument");
    document.body.removeChild(iframe);
    return null;
  }

  iframe.contentDocument.body.innerHTML = htmlStringInput;
  await Promise.all(
    Object.entries(imgHashToBlob).map(async ([hash, blob]) => {
      const elements = iframe.contentDocument?.querySelectorAll(
        `[data-image-hash="${hash}"]`
      );
      const imgDataUrl = await getBase64ForImgBlob(blob);
      elements?.forEach((element) => {
        if ("style" in element) {
          (element as unknown as HTMLElement).style.setProperty(
            "background-image",
            `url(${imgDataUrl})`
          );
        }
      });
    })
  );
  const htmlResult = iframe.contentDocument?.body.innerHTML;

  document.body.removeChild(iframe);

  return htmlResult;
}
