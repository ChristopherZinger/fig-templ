<script lang="ts">
  import type { AppNode } from "../../types";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../../lib/utils/plugin-api-endpoint";
  import { featuresStore } from "../../lib/stores/enabledFeaturesStore";

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
      console.log("create_template_response", await response.json());
    } catch (error) {
      console.error("failed_to_save_template", error);
    } finally {
      isSavingTemplate = false;
    }
  }
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
    margin: 20px 0;
  }
  .iframe-container iframe {
    background-color: white;
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
