<script lang="ts">
  import h from "hyperscript";

  function onClick() {
    parent.postMessage({ pluginMessage: "hello" }, "*");
  }

  window.addEventListener("message", (event) => {
    switch (event.data.pluginMessage.type) {
      case "frame_nodes": {
        const figNodes = event.data.pluginMessage.data.nodes;

        const hNodes = figNodes.map((node) => {
          return h("div", "", {
            x: node.x,
            y: node.y,
          });
        });

        console.log({ hNodes });
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

  <button onclick={onClick}>Close</button>
</main>
