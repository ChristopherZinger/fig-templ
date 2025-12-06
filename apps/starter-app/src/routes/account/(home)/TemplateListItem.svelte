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

  let downloadButton: HTMLElement | undefined = $state(undefined)
  let deleteButton: HTMLElement | undefined = $state(undefined)
  let confirmDeleteButton: HTMLElement | undefined = $state(undefined)
  function onClickOnItem(ev: MouseEvent) {
    const noClickNodes = [downloadButton, deleteButton, confirmDeleteButton]

    console.log("[", ev.composedPath(), noClickNodes)

    if (ev.composedPath().some((node) => noClickNodes.includes(node))) {
      return
    }
    goto(`/account/template/${template.id}`)
  }
</script>

<tr class="cursor-pointer" onclick={onClickOnItem}>
  <td class="font-mono text-sm"> </td><td
    >{template.name || "Unnamed Template"}</td
  >
  <td>{getHumanFriendlyDate(template.createdAt || "")}</td>
  <td>
    <button
      onclick={() => onClickDownload(template.downloadUrl)}
      class="btn btn-outline btn-sm"
      bind:this={downloadButton}
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
        bind:this={deleteButton}
      >
        Delete
      </button>
    {:else}
      <button
        onclick={() => onClickConfirmDelete(template.id)}
        class="btn btn-error btn-sm"
        disabled={isDeleting}
        bind:this={confirmDeleteButton}
      >
        Confirm
      </button>
    {/if}
  </td>
</tr>
