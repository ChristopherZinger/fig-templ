<script lang="ts">
  import h from "hyperscript";
  import type { AppNode } from "./types";

  function onClick() {
    parent.postMessage({ pluginMessage: "hello" }, "*");
  }

  function getHscriptFromAppNode(node: AppNode): HTMLElement {
    return h(
      "div",
      ...node.children.map(getHscriptFromAppNode),
      node.type === "TEXT" ? node.innerText : "",
      {
        style: node.style.css,
      }
    );
  }

  window.addEventListener("message", (event) => {
    switch (event.data.pluginMessage.type) {
      case "frame_nodes": {
        const root = event.data.pluginMessage.data.node;

        const rootNode = getHscriptFromAppNode(root);

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
