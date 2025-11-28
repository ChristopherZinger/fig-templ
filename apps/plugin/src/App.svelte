<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { UiMsg } from "./lib/utils/shared/messages";
  import {
    handleSessionTokenMessages,
    sendToMainThread,
  } from "./lib/utils/messages";
  import { getMessageEventListener } from "./lib/utils/window-ev-listener-utils";
  import HomePage from "./components/HomePage.svelte";

  const unsub = getMessageEventListener(handleSessionTokenMessages);

  onMount(() => {
    sendToMainThread(UiMsg.RequestSessionCookie, null);
  });

  onDestroy(() => {
    unsub();
  });
</script>

<HomePage />
