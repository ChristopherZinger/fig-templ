<script lang="ts">
  import { page } from "$app/state"
  import { getHumanFriendlyDate } from "$lib/utils/date.js"
  import CodePreview from "./CodePreview.svelte"

  let { data } = $props()
  let { htmlString, templateDoc } = data

  let id = page.params.id
  let iframeRef = $state<HTMLIFrameElement | undefined>()

  let activeTab = $state<"preview" | "code" | "artifacts">("preview")

  $effect(() => {
    if (!iframeRef || !iframeRef.contentDocument) {
      return
    }
    iframeRef.contentDocument.body.innerHTML = htmlString
  })
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
      <div class="flex flex-1 items-center justify-center">
        <p class="text-gray-500">Artifacts content will be displayed here</p>
      </div>
    {/if}
  </div>
</div>
