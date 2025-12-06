<script lang="ts">
  import { goto } from "$app/navigation"

  interface Props {
    template: {
      id: string
      name?: string
      createdAt?: Date
      downloadUrl: string
    }
    onClickDelete: (templateId: string) => Promise<void>
    onClickDownload: (downloadUrl: string) => void
  }

  let {
    template,
    onClickDelete: _onClickDelete,
    onClickDownload,
  }: Props = $props()

  function formatDate(date: Date | undefined): string {
    const d = date && new Date(date)
    if (!d || isNaN(d.getTime())) {
      return "N/A"
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  }

  let isConfirmingDelete = $state(false)
  let isDeleting = $state(false)
  let isDeleted = $state(false)

  async function onClickConfirmDelete(templateId: string) {
    isDeleting = true
    try {
      await _onClickDelete(templateId)
      isDeleted = true
    } catch (err) {
      console.error("failed_to_delete_template", err)
    } finally {
      isConfirmingDelete = false
      isDeleting = false
    }
  }
</script>

<tr class="cursor-pointer">
  <td
    class="font-mono text-sm"
    onclick={() => goto(`/account/template/${template.id}`)}>{template.id}</td
  >
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
  <td>
    {#if isConfirmingDelete === false}
      <button
        onclick={() => {
          isConfirmingDelete = true
        }}
        class="btn btn-outline btn-sm text-error"
      >
        Delete
      </button>
    {:else}
      <button
        onclick={() => onClickConfirmDelete(template.id)}
        class="btn btn-error btn-sm"
        disabled={isDeleting}
      >
        Confirm
      </button>
    {/if}
  </td>
</tr>
