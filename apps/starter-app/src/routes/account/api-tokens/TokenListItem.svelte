<script lang="ts">
  import CopyIcon from "$lib/icons/CopyIcon.svelte"
  import TrashIcon from "$lib/icons/TrashIcon.svelte"

  interface Props {
    token: {
      token: string
      createdAt: string
      expiresAt: string
    }
    onCopyToken: (token: string) => void
    onDeleteToken: (tokenId: string) => void
  }
  let { token, onCopyToken, onDeleteToken }: Props = $props()
</script>

<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="card-title text-lg mb-2">Token 1</h3>
        <div class="flex items-center gap-2 mb-3">
          <code
            class="bg-base-200 px-3 py-2 rounded text-sm font-mono flex-1 max-w-md truncate"
          >
            {token.token}
          </code>
          <button
            class="btn btn-ghost btn-sm btn-square"
            onclick={() => onCopyToken(token.token)}
            title="Copy token"
          >
            <CopyIcon />
          </button>
        </div>
        <div class="flex gap-4 text-sm text-base-content/70">
          <div>
            <span class="font-medium">Created:</span>
            {token.createdAt}
          </div>
          <div>
            <span class="font-medium">Expires:</span>
            {token.expiresAt}
          </div>
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
