<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import TemplatePreview from "./components/TemplatePreview.svelte";
  import { UiMsg } from "./lib/utils/shared/messages";
  import {
    handleSessionTokenMessages,
    sendToMainThread,
  } from "./lib/utils/messages";
  import { sessionTokenStore } from "./lib/stores/sessionTokenStore";
  import { getMessageEventListener } from "./lib/utils/window-ev-listener-utils";
  import LoginButton from "./components/LoginButton.svelte";
  import LogoutButton from "./components/LogoutButton.svelte";

  $: session = $sessionTokenStore;
  const unsub = getMessageEventListener(handleSessionTokenMessages);

  onMount(() => {
    sendToMainThread(UiMsg.RequestSessionCookie);
  });

  onDestroy(() => {
    unsub();
  });
</script>

<main>
  <h1>Templetto</h1>

  {#if session === undefined}
    <p>Loading...</p>
  {:else if session === null}
    <LoginButton />
  {:else}
    <TemplatePreview />

    <LogoutButton />
  {/if}
</main>
