<script lang="ts">
  import TemplateListItem from "./TemplateListItem.svelte"

  interface Props {
    templates: {
      id: string
      name?: string
      createdAt?: Date
      downloadUrl: string
    }[]
    onClickDelete: (templateId: string) => Promise<void>
  }

  let { templates, onClickDelete }: Props = $props()

  function onClickDownload(downloadUrl: string) {
    const a = document.createElement("a")
    a.setAttribute("href", downloadUrl)
    a.setAttribute("download", "templetto.html")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
</script>

{#if templates.length === 0}
  <div class="alert alert-info">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-current shrink-0 w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <span
      >No templates found in your organization. Create one in the Figma plugin
      to get started.</span
    >
  </div>
{:else}
  <div class="overflow-x-auto">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Created At</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each templates as template}
          <TemplateListItem {template} {onClickDelete} {onClickDownload} />
        {/each}
      </tbody>
    </table>
  </div>
{/if}
