<script lang="ts">
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../../lib/utils/plugin-api-endpoint";

  export let orgId: string | undefined | null;

  let templates:
    | { id: string; name?: string; createdAt?: Date }[]
    | undefined
    | null = undefined;
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
      <div>
        {template.id.slice(0, 4)}
        {template.name || "Untitled"}

        {#if template.createdAt}
          ({new Date(template.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })})
        {/if}
      </div>
    {/each}
  {/if}
</div>
