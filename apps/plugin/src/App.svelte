<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TemplatePreview from "./components/TemplatePreview.svelte";

  async function goToLogin() {
    console.log("before", location.origin);
    location.href = "http://localhost:5173/login-plugin";
  }

  let session: null | string | undefined;
  function onSessionMessage(event: MessageEvent) {
    const { type, data } = event.data.pluginMessage;
    if (type === "session") {
      console.log("got_session_message", data);
      session = data.session;
    }
  }
  window.addEventListener("message", onSessionMessage);

  function requestSessionCookie() {
    parent.postMessage(
      { pluginMessage: { type: "request_session_cookie" } },
      "*"
    );
  }

  onMount(() => {
    requestSessionCookie();
  });

  onDestroy(() => {
    window.removeEventListener("message", onSessionMessage);
  });
</script>

<main>
  <h1>Templetto</h1>

  {#if session === undefined}
    <p>Loading...</p>
  {:else if session === null}
    <div style="padding: 20px;">
      <button onclick={goToLogin}>Login</button>
    </div>
  {:else}
    <TemplatePreview />
  {/if}
</main>
