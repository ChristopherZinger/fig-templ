<script lang="ts">
  import { goto } from "$app/navigation"
  import { getHumanFriendlyDate } from "$lib/utils/date"

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
  <td>{getHumanFriendlyDate(template.createdAt)}</td>
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
