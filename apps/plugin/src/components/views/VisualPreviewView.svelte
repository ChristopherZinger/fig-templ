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

  function setBgImages(blobStore: Record<string, Blob>) {
    if (!contentDoc) {
      console.error("expected_iframeRef_contentDocument");
      return;
    }

    for (const [hash, blob] of Object.entries(blobStore)) {
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
</script>

<div class="iframe-container">
  <iframe
    bind:this={iframeRef}
    class:hidden={!previewInfo}
    title="iframe"
    style={`width: ${previewInfo?.width || "100px"}; height: ${previewInfo?.height || "100px"};`}
  ></iframe>
  {#if !previewInfo}
    <div class="info-container">
      {#if previewInfo === undefined}
        <div>Loading...</div>
      {/if}
      {#if previewInfo === null}
        <div>Select a frame and click "Show Preview" to see the preview</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .iframe-container {
    display: flex;
    padding: 40px 0;
    justify-content: center;
    flex: 1;
  }

  .iframe-container iframe {
    background-color: white;
    border: none;
  }

  .info-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .hidden {
    display: none;
  }
</style>
