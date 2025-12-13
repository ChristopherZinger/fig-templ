<script lang="ts">
  let ConfirmationModal: HTMLDialogElement | undefined
  let inputValue = ""
  function onShowConfirmationModal() {
    ConfirmationModal?.showModal()
  }
  function onClickCancel() {
    ConfirmationModal?.close()
  }
</script>

<svelte:head>
  <title>Profile Settings</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Profile Settings</h1>

<div class="max-w-2xl">
  <div class="card bg-base-100 shadow-sm border border-base-300">
    <div class="card-body">
      <h2 class="card-title text-error">Danger Zone</h2>

      <div class="divider my-2"></div>

      <div class="space-y-4">
        <div>
          <h3 class="font-semibold text-lg mb-2">Delete Account</h3>
          <p class="text-base-content/70 mb-4">
            Once you delete your account, there is no going back. This action
            will permanently remove:
          </p>
          <ul
            class="list-disc list-inside text-base-content/70 space-y-1 mb-6 ml-2"
          >
            <li>Your account and profile information</li>
            <li>All your templates</li>
            <li>All generated PDFs</li>
            <li>API tokens and access</li>
            <li>All other related data</li>
          </ul>
        </div>

        <button class="btn btn-error" onclick={onShowConfirmationModal}>
          Delete My Account
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Confirmation Modal -->
<dialog id="delete_account_modal" class="modal" bind:this={ConfirmationModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">Are you absolutely sure?</h3>

    <div class="alert alert-error mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>This action cannot be undone!</span>
    </div>

    <p class="mb-4">
      This will permanently delete your account and all associated data
      including:
    </p>
    <ul class="list-disc list-inside text-sm space-y-1 mb-6 ml-2">
      <li>All templates</li>
      <li>All generated PDFs</li>
      <li>API tokens</li>
      <li>All other account data</li>
    </ul>

    <p class="font-semibold mb-4">
      Type <code class="bg-base-200 px-2 py-1 rounded">DELETE</code> to confirm:
    </p>

    <input
      type="text"
      placeholder="Type DELETE here"
      class="input input-bordered w-full mb-6"
      bind:value={inputValue}
    />

    <div class="modal-action">
      <form method="POST" class="flex gap-2">
        <button type="button" class="btn" onclick={onClickCancel}>Cancel</button
        >
        <button
          type="submit"
          class="btn btn-error"
          disabled={inputValue !== "DELETE"}
        >
          Confirm Deletion
        </button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
