<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { UiMsg } from "./lib/utils/shared/messages";
  import {
    handleSessionTokenMessages,
    sendToMainThread,
  } from "./lib/utils/messages";
  import { sessionTokenStore } from "./lib/stores/sessionTokenStore";
  import { getMessageEventListener } from "./lib/utils/window-ev-listener-utils";
  import LoginButton from "./components/LoginButton.svelte";
  import HomePage from "./components/HomePage.svelte";
  import { featuresStore } from "./lib/stores/enabledFeaturesStore";

  $: session = $sessionTokenStore;
  const unsub = getMessageEventListener(handleSessionTokenMessages);

  onMount(() => {
    if ($featuresStore.apiCalls) {
      sendToMainThread(UiMsg.RequestSessionCookie);
    }
  });

  onDestroy(() => {
    unsub();
  });
</script>

<main>
  {#if $featuresStore.apiCalls && session === undefined}
    <p>Loading...</p>
  {:else if $featuresStore.apiCalls && session === null}
    <LoginButton />
  {:else}
    <HomePage />
  {/if}
</main>
