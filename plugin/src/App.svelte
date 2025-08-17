<script lang="ts">
  import { getHscriptFromAppNode } from "./app-node-to-hscript";

  function onClick() {
    parent.postMessage({ pluginMessage: "hello" }, "*");
  }

  window.addEventListener("message", (event) => {
    switch (event.data.pluginMessage.type) {
      case "frame_nodes": {
        const root = event.data.pluginMessage.data.node;

        const rootNode = getHscriptFromAppNode(root);

        console.log(rootNode);
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

  <button onclick={onClick}>Export Frame</button>
</main>
