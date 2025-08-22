<script lang="ts">
  import { getHtmlDocumentFromAppNode } from "./app-node-to-hscript";
  import type { AppNode } from "./types";

  let fontNames: Set<string> | undefined;
  let iframeRef: HTMLIFrameElement | undefined;

  function onClickShowPreview() {
    parent.postMessage({ pluginMessage: "hello" }, "*");
  }

  let htmlOutput: HTMLElement | undefined | null = null;
  function onHtmlOutputChange(
    htmlElement: HTMLElement | undefined | null,
    iframeRef: HTMLIFrameElement | undefined
  ) {
    if (!iframeRef?.contentDocument) {
      console.error("iframeRef.contentDocument is null");
      return;
    }
    if (!htmlElement) {
      iframeRef.contentDocument.body.innerHTML = "loading...";
      return;
    }
    iframeRef.contentDocument.body.innerHTML = htmlElement.outerHTML;
  }
  $: onHtmlOutputChange(htmlOutput, iframeRef);

  let rootAppNode: undefined | AppNode | null;
  function onRootAppNodeChange(rootAppNode: AppNode | undefined | null) {
    if (!rootAppNode || !fontNames) {
      return;
    }
    htmlOutput = getHtmlDocumentFromAppNode(rootAppNode, fontNames);
  }
  $: onRootAppNodeChange(rootAppNode);

  window.addEventListener("message", (event) => {
    switch (event.data.pluginMessage.type) {
      case "frame_nodes": {
        const [_rootAppNode, { fontNames: _fontNames }] = event.data
          .pluginMessage.data.node as [
          AppNode | null,
          { fontNames?: string[] },
        ];

        rootAppNode = _rootAppNode;
        fontNames = _fontNames ? new Set(_fontNames) : new Set();
        break;
      }
      default: {
        console.log("unknown message", event);
      }
    }
  });
</script>

<main>
  <h1>Templetto</h1>

  <button onclick={onClickShowPreview}>Show Preview</button>

  <div class="iframe-container">
    <h3>Preview</h3>
    {#if !!htmlOutput}
      <iframe
        bind:this={iframeRef}
        title="iframe"
        style={`width: ${rootAppNode.style.width}; height: ${rootAppNode.style.height};`}
      ></iframe>
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
</style>
