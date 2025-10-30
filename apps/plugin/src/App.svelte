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
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "./lib/utils/plugin-api-endpoint";

  $: session = $sessionTokenStore;
  const unsub = getMessageEventListener(handleSessionTokenMessages);

  async function onSessionTokenChange(session: string | null | undefined) {
    if (!session) {
      orgs = undefined;
      selectedOrgId = undefined;
      return;
    }

    try {
      const response = await callTemplettoApi({
        action: TemplettoApiActions.getOrganizations,
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

  let templates: { id: string; name: string }[] | null | undefined = undefined;
  async function onSelectedOrgIdChange({
    orgId,
    session,
  }: {
    orgId: string | undefined;
    session: string | null | undefined;
  }) {
    templates = undefined;
    if (!orgId || !session) {
      templates = null;
      return;
    }

    try {
      const response = await callTemplettoApi({
        action: TemplettoApiActions.getTemplates,
        queryParams: { orgId },
      });
      if (!response.ok) {
        console.error("failed_to_get_templates", response);
        templates = null;
      }
      const _templates = await response.json();
      templates = _templates;
    } catch (error) {
      console.error("failed_to_get_templates", error);
    }
  }
  $: onSelectedOrgIdChange({ orgId: selectedOrgId, session });

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
      <br />
    {/if}

    {#if templates}
      {#if templates.length > 0}
        <div>
          {#each templates as template}
            <div>{template.name}</div>
          {/each}
        </div>
      {:else}
        <p>No templates found</p>
      {/if}
    {/if}

    {#if selectedOrgId}
      <TemplatePreview orgId={selectedOrgId} />
    {/if}

    <LogoutButton />
  {/if}
</main>
