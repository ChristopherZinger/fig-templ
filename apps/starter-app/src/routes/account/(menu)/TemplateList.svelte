<script lang="ts">
  import { goto } from "$app/navigation"

  interface Props {
    templates: {
      id: string
      name?: string
      createdAt?: Date
      downloadUrl: string
    }[]
    limit?: number
    showViewAll?: boolean
  }

  let { templates, limit, showViewAll = false }: Props = $props()

  let displayedTemplates = $derived(
    limit ? templates.slice(0, limit) : templates,
  )

  function formatDate(date: Date | undefined): string {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

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
        {#each displayedTemplates as template}
          <tr
            class="cursor-pointer"
            onclick={() => goto(`/account/template/${template.id}`)}
          >
            <td class="font-mono text-sm">{template.id}</td>
            <td>{template.name || "Unnamed Template"}</td>
            <td>{formatDate(template.createdAt)}</td>
            <td>
              <button
                onclick={() => onClickDownload(template.downloadUrl)}
                class="btn btn-outline btn-sm"
              >
                Download HTML
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if showViewAll && templates.length > (limit || 0)}
    <div class="mt-4">
      <a href="/account/templates" class="btn btn-outline btn-sm">
        View All {templates.length} Templates
      </a>
    </div>
  {/if}
{/if}
