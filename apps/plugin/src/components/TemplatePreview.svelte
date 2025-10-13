<script lang="ts">
  import { onDestroy } from "svelte";
  import { getHtmlDocumentFromAppNode } from "../app-node-to-hscript";
  import type { AppNode } from "../types";

  type TemplateInfo = [AppNode, { fontNames: string[] }];

  let templateInfo: null | undefined | TemplateInfo = null;
  let iframeRef: HTMLIFrameElement | undefined;

  function onClickShowPreview() {
    templateInfo = undefined;
    parent.postMessage({ pluginMessage: { type: "hello" } }, "*");
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
    iframeRef.contentDocument.body.innerHTML = html.outerHTML;
  }
  $: onTemplateInfoChange(templateInfo);

  function onMessage(event: MessageEvent) {
    const { type, data } = event.data.pluginMessage;
    if (type === "frame_nodes") {
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
  <button onclick={onClickShowPreview}>Show Preview</button>

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
