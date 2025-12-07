<script lang="ts">
  import CopyIcon from "$lib/icons/CopyIcon.svelte"
  import TrashIcon from "$lib/icons/TrashIcon.svelte"
  import { onDestroy } from "svelte"

  interface Props {
    token: {
      token: string
      createdAt: Date
      expiresAt: Date
    }
    onCopyToken: (token: string) => void
    onDeleteToken: (tokenId: string) => void
  }
  let { token, onCopyToken, onDeleteToken }: Props = $props()

  const hiddenTokenPlaceholder = "********"
  let visibleToken = $state(hiddenTokenPlaceholder)

  let timeout: NodeJS.Timeout | undefined
  function handleRevealToken() {
    visibleToken = token.token
    timeout && clearTimeout(timeout)
    timeout = setTimeout(() => {
      visibleToken = hiddenTokenPlaceholder
    }, 3000)
  }

  onDestroy(() => {
    timeout && clearTimeout(timeout)
  })
</script>

<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex gap-4 text-sm text-base-content/70 mb-3">
          <div>
            <span class="font-medium">Created:</span>
            {token.createdAt.toLocaleDateString("en", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div>
            <span class="font-medium">Expires:</span>
            {token.expiresAt.toLocaleDateString("en", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div class="flex items-center gap-2 mb-3">
          <code
            class="bg-base-200 px-3 py-2 rounded text-sm font-mono flex-1 max-w-md truncate"
          >
            {visibleToken}
          </code>
          <button
            class="btn btn-ghost btn-sm btn-square"
            onclick={() => onCopyToken(token.token)}
            title="Copy token"
          >
            <CopyIcon />
          </button>
          <button
            class="btn btn-ghost btn-sm"
            onclick={handleRevealToken}
            title="Reveal token"
          >
            reveal
          </button>
        </div>
      </div>
      <button
        class="btn btn-ghost btn-sm text-error"
        onclick={() => onDeleteToken(token.token)}
      >
        <TrashIcon /> Delete
      </button>
    </div>
  </div>
</div>
