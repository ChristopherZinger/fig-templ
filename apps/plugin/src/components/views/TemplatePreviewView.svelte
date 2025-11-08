<script lang="ts">
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../../lib/utils/plugin-api-endpoint";
  import { featuresStore } from "../../lib/stores/enabledFeaturesStore";
  import CodePreviewView from "./CodePreviewView.svelte";
  import PreviewModeSelector from "../PreviewModeSelector.svelte";
  import VisualPreviewView from "./VisualPreviewView.svelte";

  export let orgId: string | undefined | null;
  export let htmlString: string | undefined;
  export let imgHashToBlob: Record<string, Blob>;
  export let previewInfo:
    | {
        width: number;
        height: number;
      }
    | undefined
    | null;

  let viewMode: "preview" | "code" = "preview";

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
</script>

<main>
  <div class="header">
    <PreviewModeSelector
      {viewMode}
      onSelectMode={(mode) => {
        viewMode = mode;
      }}
    />
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

  <div class="content">
    {#if viewMode === "preview"}
      <VisualPreviewView {htmlString} {imgHashToBlob} {previewInfo} />
    {:else}
      <CodePreviewView {htmlString} />
    {/if}
  </div>
</main>

<style>
  main {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--light-gray);
    padding: 0px 0.7rem;
    max-height: 50px;
    height: 50px;
  }

  .content {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
</style>
