<script lang="ts">
  import { getHscriptFromAppNode } from "./app-node-to-hscript";

  let iframeRef: HTMLIFrameElement | undefined;

  function onClickShowPreview() {
    parent.postMessage({ pluginMessage: "hello" }, "*");
  }

  let hsNode: HTMLElement | undefined | null = null;
  function onHsNodeChange(
    hsNode: HTMLElement | undefined | null,
    iframeRef: HTMLIFrameElement | undefined
  ) {
    if (!iframeRef?.contentDocument) {
      console.error("iframeRef.contentDocument is null");
      return;
    }
    if (!hsNode) {
      iframeRef.contentDocument.body.innerHTML = "loading...";
      return;
    }
    iframeRef.contentDocument.body.innerHTML = hsNode.outerHTML;
  }
  $: onHsNodeChange(hsNode, iframeRef);

  window.addEventListener("message", (event) => {
    switch (event.data.pluginMessage.type) {
      case "frame_nodes": {
        const root = event.data.pluginMessage.data.node;
        const rootNode = getHscriptFromAppNode(root);

        hsNode = rootNode;

        console.log(rootNode.outerHTML);
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
    {#if hsNode !== null}
      <iframe bind:this={iframeRef} title="iframe"></iframe>
    {/if}
  </div>
</main>

<style>
  .iframe-container {
    margin: 20px 0;
  }

  iframe {
    width: 300px;
    height: 900px;
    border: 1px solid #ccc;
    border-radius: 3px;
    width: 100%;
    background-color: white;
  }
</style>
