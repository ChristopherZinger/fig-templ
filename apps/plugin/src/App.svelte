<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TemplatePreview from "./components/TemplatePreview.svelte";
  import { MainThreadMsg, UiMsg } from "./lib/utils/shared/messages";

  async function goToLogin() {
    // TODO: add url to configuration (.env)
    const url = "http://localhost:5173/plugin/get-pkce-keys";
    location.href = url;
  }

  let session: null | string | undefined;
  function onSessionMessage(event: MessageEvent) {
    const { type, data } = event.data.pluginMessage;
    if (type === MainThreadMsg.PostSessionCookie) {
      console.log("got_session_message", data);
      session = data.session;
    }
  }
  window.addEventListener("message", onSessionMessage);

  function requestSessionCookie() {
    parent.postMessage(
      { pluginMessage: { type: UiMsg.RequestSessionCookie } },
      "*"
    );
  }

  async function logout() {
    parent.postMessage({ pluginMessage: { type: UiMsg.Logout } }, "*");

    try {
      const response = await fetch(`http://localhost:3000/plugin/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: session }),
      });

      if (!response.ok) {
        throw new Error("logout_request_failed");
      }
    } catch (error) {
      console.error("failed_to_logout", error);
      return;
    }
    // TODO: should this be confirmed (or posted as message) by main thread?
    // e.g. in a for of two-way binding of sorts?
    session = null;
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

    <button onclick={logout}>Logout</button>
  {/if}
</main>
