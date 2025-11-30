<script lang="ts">
  import InfoCircleIcon from "$lib/icons/InfoCircleIcon.svelte"
  import KeyIcon from "$lib/icons/KeyIcon.svelte"
  import PlusIcon from "$lib/icons/PlusIcon.svelte"
  import { onMount } from "svelte"
  import TokenListItem from "./TokenListItem.svelte"
  import {
    fetchDeleteApiToken,
    fetchGetApiTokens,
    fetchPutApiToken,
  } from "../../api/api-calls"

  let { data } = $props()

  type Token = {
    createdAt: Date
    expiresAt: Date
    orgId: string
    token: string
    userId: string
  }
  let tokens: Token[] | null | undefined = $state(null)

  onMount(async () => {
    await fetchTokens()
  })

  async function fetchTokens() {
    tokens = undefined
    try {
      tokens = await fetchGetApiTokens()
    } catch (error) {
      console.error("failed_to_fetch_api_tokens", error)
      tokens = null
    }
  }

  async function handleCreateToken() {
    await fetchPutApiToken()
    await fetchTokens()
  }

  async function handleDeleteToken(tokenId: string) {
    await fetchDeleteApiToken(tokenId)
    await fetchTokens()
  }

  async function handleCopyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token)
    } catch (err) {
      console.error("Failed to copy token:", err)
    }
  }
</script>

<svelte:head>
  <title>API Tokens</title>
</svelte:head>

<div class="max-w-6xl">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold mb-1">API Tokens</h1>
      <p class="text-sm text-base-content/70">
        Manage your API tokens for secure access to your account
      </p>
    </div>
    <button
      class="btn btn-primary"
      onclick={handleCreateToken}
      disabled={tokens && tokens.length >= data.maxNumTokens}
    >
      <PlusIcon /> Create Token
    </button>
  </div>

  <div class="alert alert-info mb-6">
    <InfoCircleIcon />
    <span>Keep your tokens secure and never share them publicly.</span>
  </div>

  {#if tokens && tokens.length >= data.maxNumTokens}
    <div class="alert alert-error mb-6">
      <span>You have reached the maximum number of tokens.</span>
    </div>
  {/if}

  {#if tokens === undefined}
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body items-center text-center py-12">Loading</div>
    </div>
  {:else if tokens === null}
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body items-center text-center py-12">
        Something went wrong. Sorry.
      </div>
    </div>
  {:else if tokens.length > 0}
    <div class="space-y-4">
      {#each tokens as token}
        <TokenListItem
          {token}
          onCopyToken={handleCopyToken}
          onDeleteToken={handleDeleteToken}
        />
      {/each}
    </div>
  {:else}
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body items-center text-center py-12">
        <KeyIcon />
        <h3 class="text-xl font-semibold mb-2">No API tokens yet</h3>
        <p class="text-base-content/70 mb-4">
          Create your first API token to get started
        </p>
        <button class="btn btn-primary" onclick={handleCreateToken}>
          Create Your First Token
        </button>
      </div>
    </div>
  {/if}
</div>
