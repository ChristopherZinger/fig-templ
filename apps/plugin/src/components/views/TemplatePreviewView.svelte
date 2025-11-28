<script lang="ts">
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../../lib/utils/plugin-api-endpoint";
  import CodePreviewView from "./CodePreviewView.svelte";
  import PreviewModeSelector from "../PreviewModeSelector.svelte";
  import VisualPreviewView from "./VisualPreviewView.svelte";
  import { sessionTokenStore } from "../../lib/stores/sessionTokenStore";
  import Button from "../Button.svelte";
  import PreviewBuildLogs from "./PreviewBuildLogs.svelte";
  import { SelectedViewMode } from "../../lib/utils/shared/preview-tabs";

  export let orgId: string | undefined | null;
  export let htmlString: string | undefined | null;
  export let imgHashToBlob: Record<string, Blob>;
  export let previewInfo:
    | {
        width: number;
        height: number;
      }
    | undefined
    | null;
  export let htmlBuildLogs: {
    severity: "error" | "warning" | "info";
    message: string;
  }[] = [];

  let selectedViewMode: SelectedViewMode = SelectedViewMode.preview;
  let templateNameInput: string = "My HTML Template";

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

  $: if (htmlBuildLogs.length > 0 && htmlString === null) {
    selectedViewMode = SelectedViewMode.warnings;
  }
</script>

<main>
  <div class="header">
    <PreviewModeSelector
      {selectedViewMode}
      viewModes={Object.values(SelectedViewMode).map((mode) => ({
        label: mode,
        value: mode,
      }))}
      onSelectMode={(mode) => {
        selectedViewMode = mode;
      }}
      numWarnings={htmlBuildLogs.length}
    />
    {#if $sessionTokenStore}
      <div class="save-template-container">
        <div>
          <label for="template-name">Template Name</label>
          <input
            type="text"
            id="template-name"
            bind:value={templateNameInput}
          />
        </div>
        <Button
          isDisabled={!htmlString ||
            !orgId ||
            isSavingTemplate ||
            !templateNameInput}
          onClick={() => {
            if (htmlString && orgId) {
              onClickSaveTemplate({
                name: `${templateNameInput}`,
                htmlString,
                orgId,
              });
            }
          }}
          style={{
            padding: "8px 16px",
          }}
        >
          Save Template
        </Button>
      </div>
    {/if}
  </div>

  <div class="content">
    {#if selectedViewMode === "preview"}
      <VisualPreviewView {htmlString} {imgHashToBlob} {previewInfo} />
    {:else if selectedViewMode === "code"}
      <CodePreviewView {htmlString} />
    {:else if selectedViewMode === "warnings"}
      <PreviewBuildLogs {htmlBuildLogs} />
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

  .save-template-container {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  .save-template-container input {
    font-size: 12px;
    padding: 8px;
    border: 1px solid oldlace;
    border-radius: 8px;
  }

  .save-template-container label {
    font-size: 12px;
  }
</style>
