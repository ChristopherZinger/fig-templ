<script lang="ts">
  import { page } from "$app/state"

  let { data } = $props()

  $effect(() => {
    console.log("data", data)
  })

  let id = page.params.id
  let iframeRef: HTMLIFrameElement | undefined

  $effect(() => {
    if (!iframeRef || !iframeRef.contentDocument) {
      return
    }
    iframeRef.contentDocument.body.innerHTML = data.htmlString
  })
</script>

<svelte:head>
  <title>Template</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-1">
  Template Details <span class="text-accent">{id}</span>
</h1>

<div class="py-4">
  <a href="/account" class="btn btn-primary">Back</a>
</div>

<div class="flex flex-row flex-1">
  <div class="flex-1 min-h-full">
    <iframe
      bind:this={iframeRef}
      title="iframe"
      style={`width: 100%; height: 100%;`}
    ></iframe>
  </div>
</div>
