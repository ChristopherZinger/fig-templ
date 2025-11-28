<script lang="ts">
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../../lib/utils/plugin-api-endpoint";
  import { URLS } from "../../lib/utils/shared/urls";
  import Button from "../Button.svelte";

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
    const _templates = await response.json();
    templates = _templates.sort(
      (a: { createdAt: Date }, b: { createdAt: Date }) => {
        if (!a.createdAt) {
          return 1;
        }
        if (!b.createdAt) {
          return -1;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    );
  }
  $: loadTemplates(orgId);
</script>

<div class="view">
  <div class="header">
    <h1>Your Templates</h1>
    <div>
      <Button
        onClick={() => {
          window.open(`${URLS.webapp}/account`, "_blank");
        }}>View In App</Button
      >
    </div>
  </div>
  {#if templates === undefined}
    <div>Loading...</div>
  {:else if templates === null || templates.length === 0}
    <div>No templates</div>
  {:else}
    <div>
      <div class="template-row">
        <div class="header">ID</div>
        <div class="header">Name</div>
        <div class="header">Created At</div>
        {#each templates as template}
          <div>{template.id}</div>
          <div>{template.name || "Untitled"}</div>

          <div>
            {#if template.createdAt}
              {new Date(template.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .template-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
    font-size: 12px;
  }

  .template-row .header {
    font-weight: bold;
  }

  .template-row * {
    padding: 4px;
  }
</style>
