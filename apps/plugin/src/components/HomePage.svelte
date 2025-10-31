<script lang="ts">
  import { onMount } from "svelte";
  import BaseLayout from "./BaseLayout.svelte";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../lib/utils/plugin-api-endpoint";
  import OrgSelectorItem from "./sidebar/OrgSelectorItem.svelte";
  import LogoutButton from "./LogoutButton.svelte";
  import TemplateListItem from "./sidebar/TemplateListItem.svelte";
  import TemplatesView from "./views/TemplatesView.svelte";

  let organizations: { id: string; name: string }[] | null | undefined =
    undefined;
  let selectedOrgId: string | undefined | null = undefined;
  async function loadOrganizations() {
    const response = await callTemplettoApi({
      action: TemplettoApiActions.getOrganizations,
    });
    if (!response.ok) {
      console.error("failed_to_get_organizations", response);
      return null;
    }
    const _organizations = await response.json();
    if (_organizations && _organizations.length > 0) {
      organizations = _organizations;
      selectedOrgId = _organizations[0].id;
      return;
    }
    organizations = null;
    selectedOrgId = null;
  }

  onMount(async () => {
    await loadOrganizations();
  });

  let view: View = "preview";
  const views = ["templates", "preview"] as const;
  type View = (typeof views)[number];
</script>

<BaseLayout>
  <div slot="sidebar" class="sidebar">
    <div class="panel">
      <OrgSelectorItem
        orgInfos={organizations}
        {selectedOrgId}
        onSelect={(orgId) => {
          selectedOrgId = orgId;
        }}
      />
      <TemplateListItem onClick={() => (view = "templates")} />
    </div>
    <LogoutButton />
  </div>

  <div slot="content" class="content">
    {#if view === "templates"}
      <TemplatesView orgId={selectedOrgId} />
    {:else if view === "preview"}
      <div>preview</div>
    {/if}
  </div>
</BaseLayout>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }

  .panel {
    display: flex;
    flex-direction: column;
  }
</style>
