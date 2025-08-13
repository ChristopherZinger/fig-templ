<script lang="ts">
  import { onMount } from "svelte";

  function onClick() {
    console.log("Click", parent);
    parent.postMessage({ pluginMessage: "hello" }, "*");
  }

  window.addEventListener("message", (event) => {
    console.log("Message Received in UI", event);
  });

  onMount(() => {
    parent.onmessage = (event) => {
      console.log("UI", event);
    };
  });
</script>

<main>
  <h1>Templetto</h1>

  <button onclick={onClick}>Close</button>
</main>
