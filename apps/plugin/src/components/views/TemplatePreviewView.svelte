<script lang="ts">
  import type { AppNode } from "../../types";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../../lib/utils/plugin-api-endpoint";
  import { featuresStore } from "../../lib/stores/enabledFeaturesStore";
  import { MainThreadMsg } from "../../lib/utils/shared/messages";
  import { onDestroy } from "svelte";
  import { getMessageEventListener } from "../../lib/utils/window-ev-listener-utils";

  export let orgId: string | undefined | null;
  export let onClickShowPreview: () => void;
  export let htmlString: string | undefined;
  export let previewInfo:
    | {
        width: number;
        height: number;
      }
    | undefined
    | null;

  let iframeRef: HTMLIFrameElement | undefined;
  function onHtmlStringChange(htmlString: string | undefined) {
    if (!iframeRef?.contentDocument) {
      console.error("expected_iframeRef_contentDocument");
      return;
    }
    iframeRef.contentDocument.body.innerHTML = htmlString || "";
    setBgImages(blobStore);
  }
  $: onHtmlStringChange(htmlString);

  let isSavingTemplate = false;
  async function onClickSaveTemplate({
    name,
    htmlString,
    orgId,
  }: {
    name: string;
    htmlString: string;
    orgId: string;
  }) {
    isSavingTemplate = true;
    try {
      const response = await callTemplettoApi({
        action: TemplettoApiActions.CreateTemplate,
        body: { templateHtml: htmlString, orgId, name },
      });

      if (!response.ok) {
        console.error("failed_to_save_template", response);
        return;
      }
    } catch (error) {
      console.error("failed_to_save_template", error);
    } finally {
      isSavingTemplate = false;
    }
  }

  let blobStore: Record<string, Blob> = {};
  function onMessage(event: MessageEvent) {
    const { type, data } = event.data.pluginMessage;
    switch (type) {
      case MainThreadMsg.PostImageInfo:
        const { hash, bytes } = data;
        blobStore = {
          ...blobStore,
          [hash]: new Blob([bytes], { type: "image/png" }),
        };
        break;
    }
  }
  const unsub = getMessageEventListener(onMessage);

  function setBgImages(blobStore: Record<string, Blob>) {
    if (!iframeRef?.contentDocument) {
      console.error("expected_iframeRef_contentDocument");
      return;
    }

    for (const [hash, blob] of Object.entries(blobStore)) {
      const elements = iframeRef.contentDocument.querySelectorAll(
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
  $: setBgImages(blobStore);

  onDestroy(() => {
    unsub();
  });
</script>

<main>
  <div class="header">
    <div>
      <button onclick={onClickShowPreview}>Show Preview</button>
    </div>

    <div>
      <div class="save-template-container">
        {#if $featuresStore.apiCalls}
          <button
            disabled={!htmlString || !orgId || isSavingTemplate}
            onclick={() => {
              if (htmlString && orgId) {
                onClickSaveTemplate({
                  name: "index.html",
                  htmlString,
                  orgId,
                });
              }
            }}
          >
            Save Template
          </button>
        {/if}
      </div>
    </div>
  </div>

  <div class="iframe-container">
    <iframe
      bind:this={iframeRef}
      class:hidden={!previewInfo}
      title="iframe"
      style={`width: ${previewInfo?.width || "100px"}; height: ${previewInfo?.height || "100px"};`}
    ></iframe>
    {#if previewInfo === undefined}
      <p>Loading...</p>
    {/if}
    {#if previewInfo === null}
      <p>No template selected</p>
    {/if}
  </div>
</main>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--light-gray);
    padding: 0px 0.7rem;
    max-height: 50px;
    height: 50px;
  }
  .iframe-container {
    display: flex;
    padding: 40px 0;
    justify-content: center;
  }
  .iframe-container iframe {
    background-color: white;
    border: none;
  }

  .hidden {
    display: none;
  }
  .save-template-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
</style>
