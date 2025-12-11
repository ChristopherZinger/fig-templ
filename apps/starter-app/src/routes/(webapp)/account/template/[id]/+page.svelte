<script lang="ts">
  import { page } from "$app/state"
  import {
    fetchDeleteArtifact,
    fetchGetArtifactsByTemplateId,
  } from "$lib/utils/account-api-calls"
  import { getHumanFriendlyDate } from "$lib/utils/date.js"
  import CodePreview from "./CodePreview.svelte"

  let { data } = $props()
  let { htmlString, templateDoc, artifacts } = data

  let _artifacts = $state(artifacts)

  let id = page.params.id
  let iframeRef = $state<HTMLIFrameElement | undefined>()

  let activeTab = $state<"preview" | "code" | "artifacts">("preview")

  $effect(() => {
    if (!iframeRef || !iframeRef.contentDocument) {
      return
    }
    iframeRef.contentDocument.body.innerHTML = htmlString
  })
  async function onClickDeleteArtifact(artifactId: string) {
    await fetchDeleteArtifact(artifactId)
    if (id) {
      _artifacts = (await fetchGetArtifactsByTemplateId(id)) || []
    }
  }
</script>

<svelte:head>
  <title>Template</title>
</svelte:head>

<div class="flex flex-col gap-6 min-h-full flex-1">
  <div class="flex justify-between items-center pb-6">
    <h1 class="text-2xl font-bold mb-1">
      Template Details <span class="text-accent">{id}</span>
    </h1>
    <a href="/account" class="btn btn-primary">Back</a>
  </div>

  {#if templateDoc}
    <div class="my-6">
      <div class="stats shadow-sm stats-vertical sm:stats-horizontal w-full">
        <div class="stat place-items-center">
          <div class="stat-title">Created At</div>
          <div class="stat-value text-sm">
            {getHumanFriendlyDate(templateDoc.createdAt || "")}
          </div>
        </div>

        <div class="stat place-items-center">
          <div class="stat-title">Name</div>
          <div class="stat-value text-sm">{templateDoc.name}</div>
        </div>

        <div class="stat place-items-center">
          <div class="stat-title">Artifacts Number</div>
          <div class="stat-value text-sm">dummy_100</div>
        </div>
      </div>
    </div>
  {/if}

  <div role="tablist" class="tabs tabs-bordered">
    <button
      role="tab"
      class="tab"
      class:tab-active={activeTab === "preview"}
      onclick={() => (activeTab = "preview")}
    >
      Template Preview
    </button>
    <button
      role="tab"
      class="tab"
      class:tab-active={activeTab === "code"}
      onclick={() => (activeTab = "code")}
    >
      HTML Code
    </button>
    <button
      role="tab"
      class="tab"
      class:tab-active={activeTab === "artifacts"}
      onclick={() => (activeTab = "artifacts")}
    >
      Artifacts
    </button>
  </div>

  <div class="flex flex-1 flex-col gap-4">
    {#if activeTab === "preview"}
      <div class="flex flex-1">
        <iframe bind:this={iframeRef} title="iframe" class="flex-1"></iframe>
      </div>
    {:else if activeTab === "code"}
      <CodePreview {htmlString} />
    {:else if activeTab === "artifacts"}
      {#if artifacts.length < 1}
        <div class="flex flex-1 items-center justify-center">
          <p class="text-gray-500">No artifacts found</p>
        </div>
      {:else}
        <ul class="space-y-3">
          {#each _artifacts as artifact}
            <li
              class="flex justify-between items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-end gap-1">
                <span class="text-gray-500">Created at:</span>
                <span class="font-medium">
                  {getHumanFriendlyDate(artifact.createdAt || "")}
                </span>
              </div>
              <div class="flex gap-2">
                <a
                  href={artifact.downloadUrl}
                  target="_blank"
                  class="btn btn-sm btn-primary"
                >
                  Download
                </a>
                <button
                  class="btn btn-sm btn-error"
                  onclick={() => onClickDeleteArtifact(artifact.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
</div>
