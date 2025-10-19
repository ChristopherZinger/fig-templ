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
  import { URLS } from "./lib/utils/shared/urls";
  import OrgSelector from "./components/OrgSelector.svelte";

  $: session = $sessionTokenStore;
  const unsub = getMessageEventListener(handleSessionTokenMessages);

  async function onSessionTokenChange(session: string | null | undefined) {
    if (!session) {
      orgs = undefined;
      selectedOrgId = undefined;
      return;
    }

    try {
      const response = await fetch(`${URLS.server}/plugin/get-organizations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `BEARER ${session}`,
        },
      });
      if (!response.ok) {
        throw new Error("failed_to_get_organizations");
      }
      const _orgs = await response.json();
      if (_orgs && _orgs.length > 0) {
        orgs = _orgs;
        selectedOrgId = _orgs[0].id;
      }
    } catch (error) {
      console.error("failed_to_get_organizations", error);
    }
  }
  $: onSessionTokenChange(session);

  let orgs: { id: string; name: string }[] | undefined = undefined;
  let selectedOrgId: string | undefined;
  function onSelect(orgId: string) {
    if (orgs && orgs.find((org) => org.id === orgId)) {
      selectedOrgId = orgId;
    }
  }

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
    {#if orgs && selectedOrgId}
      <OrgSelector {orgs} {selectedOrgId} {onSelect} />
    {/if}

    <TemplatePreview />

    <LogoutButton />
  {/if}
</main>
