<script lang="ts">
  export let htmlString: string | undefined | null;
  export let previewInfo:
    | {
        width: number;
        height: number;
      }
    | undefined
    | null;
  export let imgHashToBlob: Record<string, Blob>;

  function setBgImages(imgHashToBlob: Record<string, Blob>) {
    if (!contentDoc) {
      console.error("expected_iframeRef_contentDocument");
      return;
    }

    for (const [hash, blob] of Object.entries(imgHashToBlob)) {
      const elements = contentDoc.querySelectorAll(
        `[data-image-hash="${hash}"]`
      );

      const blobUrl = URL.createObjectURL(blob);

      elements.forEach((element) => {
        if ("style" in element) {
          (element as unknown as HTMLElement).style.setProperty(
            "background-image",
            `url(${blobUrl})`
          );
        }
      });
    }
  }
  $: setBgImages(imgHashToBlob);

  let iframeRef: HTMLIFrameElement | undefined;
  $: contentDoc = iframeRef?.contentDocument;
  function setContentDocInnerHtml(
    htmlString: string | undefined | null,
    contentDoc: Document | undefined | null
  ) {
    if (!contentDoc) {
      console.error("expected_iframeRef_contentDocument");
      return;
    }
    if (!htmlString) {
      contentDoc.body.innerHTML = "";
      return;
    }

    contentDoc.body.innerHTML = htmlString || "";
    setBgImages(imgHashToBlob);
  }
  $: setContentDocInnerHtml(htmlString, contentDoc);

  function getIframeTransformScale(
    previewInfo: { width: number; height: number } | null | undefined
  ): number {
    const MAX_PREVIEW_WIDTH_PX = 800;
    if (previewInfo) {
      const w = previewInfo.width;
      if (w > MAX_PREVIEW_WIDTH_PX) {
        const scale = MAX_PREVIEW_WIDTH_PX / w;
        return scale;
      }
    }
    return 1;
  }

  $: iframeScale = getIframeTransformScale(previewInfo);
  $: iframeWrapperWidth = previewInfo
    ? `${previewInfo.width * iframeScale}px`
    : "100px";
  $: iframeWrapperHeight = previewInfo
    ? `${previewInfo.height * iframeScale}px`
    : "100px";
</script>

<div class="iframe-container">
  <div
    class="iframe-wrapper"
    class:hidden={!previewInfo}
    style={`width: ${iframeWrapperWidth}; height: ${iframeWrapperHeight};`}
  >
    <iframe
      bind:this={iframeRef}
      title="iframe"
      style={`width: ${previewInfo?.width || 100}px; height: ${previewInfo?.height || 100}px; transform: scale(${iframeScale}); transform-origin: top left;`}
    ></iframe>
  </div>
</div>

{#if !previewInfo}
  <div class="message-container">
    {#if previewInfo === undefined}
      <div>Loading...</div>
    {/if}
    {#if previewInfo === null}
      <div>Select a frame and click "Show Preview" to see the preview</div>
    {/if}
  </div>
{/if}

<style>
  .message-container {
    display: flex;
    padding: 40px 0;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
  }

  .iframe-container {
    overflow-x: hidden;
    overflow-y: auto;
    text-align: center;
    padding: 20px 0;
  }

  .iframe-wrapper {
    display: inline-block;
    position: relative;
    overflow: hidden;
  }

  iframe {
    border: none;
    padding: 0;
    margin: 0;
  }

  .hidden {
    display: none;
  }
</style>
