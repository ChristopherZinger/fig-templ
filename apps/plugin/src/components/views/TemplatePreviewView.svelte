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

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const contentDoc = iframe.contentDocument;
    if (!contentDoc) {
      console.error("expected_contentDocument");
      document.body.removeChild(iframe);
      return;
    }
    contentDoc.body.innerHTML = htmlString;
    for (const [hash, blob] of Object.entries(imgHashToBlob)) {
      const elements = contentDoc.querySelectorAll(
        `[data-image-hash="${hash}"]`
      );
      const base64Url = await blobToBase64(blob);
      elements.forEach((element) => {
        if ("style" in element) {
          (element as unknown as HTMLElement).style.setProperty(
            "background-image",
            `url('${base64Url}')`
          );
        }
      });
    }
    htmlStringOut = contentDoc.documentElement.outerHTML;

    document.body.removeChild(iframe);

    try {
      const response = await callTemplettoApi({
        action: TemplettoApiActions.CreateTemplate,
        body: {
          templateHtml: htmlStringOut,
          orgId,
          name,
          dimensions: {
            widthPx: previewInfo?.width,
            heightPx: previewInfo?.height,
          },
        },
      });

      if (!response.ok) {
        console.error("save_template_bad_response", response);
        return;
      }
    } catch (error) {
      console.error("failed_to_save_template", error);
    } finally {
      isSavingTemplate = false;
    }
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("failed_to_read_blob_as_base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  $: if (htmlBuildLogs.length > 0 && htmlString === null) {
    selectedViewMode = SelectedViewMode.warnings;
  }

  let htmlStringOut: string | undefined | null = undefined;
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
