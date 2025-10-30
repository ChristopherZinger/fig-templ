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
  async function onClickSaveTemplate() {
    if (!htmlString) {
      console.error("expected_htmlString");
      return;
    }
    try {
      const response = await callTemplettoApi({
        action: TemplettoApiActions.CreateTemplate,
        body: { templateHtml: htmlString, orgId },
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
  <div>
    <button onclick={onClickShowPreview}>Show Preview</button>
  </div>

  <div>
    <button disabled={!htmlString} onclick={onClickSaveTemplate}
      >Save Template</button
    >
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
  .iframe-container {
    margin: 20px 0;
  }
  .iframe-container iframe {
    background-color: white;
  }

  .hidden {
    display: none;
  }
</style>
