<script lang="ts">
  import OrgSelector from "../OrgSelector.svelte";
  import SidebarItem from "./SidebarItem.svelte";

  export let orgInfos: { id: string; name: string }[] | null | undefined =
    undefined;
  export let selectedOrgId: string | undefined | null;
  export let onSelect: (orgId: string) => void;

  $: isLoading = orgInfos === undefined && selectedOrgId === undefined;
</script>

<SidebarItem>
  <svelte:fragment slot="header">
    <div>Team</div>
    {#if orgInfos && selectedOrgId}
      <OrgSelector {orgInfos} {selectedOrgId} {onSelect} />
    {:else if isLoading}
      <div>Loading...</div>
    {/if}
  </svelte:fragment>
</SidebarItem>
