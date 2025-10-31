<script lang="ts">
  import { onDestroy } from "svelte";
  import { getHtmlDocumentFromAppNode } from "../app-node-to-hscript";
  import type { AppNode } from "../types";
  import { MainThreadMsg, UiMsg } from "../lib/utils/shared/messages";
  import { sendToMainThread } from "../lib/utils/messages";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../lib/utils/plugin-api-endpoint";

  type TemplateInfo = [AppNode, { fontNames: string[] }];

  export let orgId: string;

  let templateNameInput = "";
  let templateInfo: null | undefined | TemplateInfo = null;
  let iframeRef: HTMLIFrameElement | undefined;

  function onClickShowPreview() {
    templateInfo = undefined;
    sendToMainThread(UiMsg.ShowPreview);
  }

  function onTemplateInfoChange(templateInfo: null | undefined | TemplateInfo) {
    if (!iframeRef?.contentDocument) {
      console.error("expected_iframeRef_contentDocument");
      return;
    }

    if (!templateInfo) {
      iframeRef.contentDocument.body.innerHTML = "";
      return;
    }

    const [rootAppNode, { fontNames }] = templateInfo;
    const html = getHtmlDocumentFromAppNode(rootAppNode, new Set(fontNames));
    htmlString = html.outerHTML;
    iframeRef.contentDocument.body.innerHTML = htmlString;
  }
  $: onTemplateInfoChange(templateInfo);

  let htmlString: string | undefined = undefined;
  async function onClickSaveTemplate({
    name,
    htmlString,
    orgId,
  }: {
    name: string;
    htmlString: string;
    orgId: string;
  }) {
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
    }
  }

  function onMessage(event: MessageEvent) {
    const { type, data } = event.data.pluginMessage;
    if (type === MainThreadMsg.PostFrameNodes) {
      const _templateInfo = data.node as [
        AppNode | null,
        { fontNames: string[] },
      ];
      templateInfo = _templateInfo;
    }
  }
  window.addEventListener("message", onMessage);

  onDestroy(() => {
    window.removeEventListener("message", onMessage);
  });
</script>

<main>
  <div class="header">
    <div>
      <button onclick={onClickShowPreview}>Show Preview</button>
    </div>

    <div>
      {#if htmlString}
        <div class="save-template-container">
          {#if templateNameInput && htmlString && orgId}
            <button
              disabled={!htmlString || !templateNameInput}
              onclick={() => {
                if (htmlString && templateNameInput && orgId) {
                  onClickSaveTemplate({
                    name: templateNameInput,
                    htmlString,
                    orgId,
                  });
                }
              }}
            >
              Save Template
            </button>
          {/if}

          <input type="text" bind:value={templateNameInput} />
        </div>
      {/if}
    </div>
  </div>

  <div class="iframe-container">
    <h3>Preview</h3>
    <iframe
      bind:this={iframeRef}
      class:hidden={!templateInfo}
      title="iframe"
      style={`width: ${templateInfo?.[0]?.style.width || "100px"}; height: ${templateInfo?.[0]?.style.height || "100px"};`}
    ></iframe>
    {#if templateInfo === undefined}
      <p>Loading...</p>
    {/if}
    {#if templateInfo === null}
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
    padding: 0.7rem;
    height: 50px;
    box-sizing: border-box;
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
