<script lang="ts">
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../../lib/utils/plugin-api-endpoint";

  export let orgId: string | undefined | null;

  let templates: { id: string }[] | undefined | null = undefined;
  async function loadTemplates(orgId: string | undefined | null) {
    if (!orgId) {
      templates = orgId === null ? null : undefined;
      return;
    }
    const response = await callTemplettoApi({
      action: TemplettoApiActions.getTemplates,
      queryParams: { orgId },
    });
    templates = await response.json();
    console.log("templates", templates);
  }
  $: loadTemplates(orgId);
</script>

<div class="view">
  {#if templates === undefined}
    <div>Loading...</div>
  {:else if templates === null}
    <div>No templates</div>
  {:else}
    {#each templates as template}
      <div>{template.id}</div>
    {/each}
  {/if}
</div>
