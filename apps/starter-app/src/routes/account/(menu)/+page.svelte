<script lang="ts">
  import TemplateList from "./TemplateList.svelte"
  import ApiUsageStats from "./ApiUsageStats.svelte"

  let { data } = $props()
  let { templates, billableApiCallCount, numPdfsGenerated } = data
</script>

<svelte:head>
  <title>Account</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-1">Dashboard</h1>

<ApiUsageStats
  numApiCalls={billableApiCallCount}
  numTemplates={templates.length}
  {numPdfsGenerated}
/>

<div class="my-6">
  <h1 class="text-xl font-bold mb-3">Recent Templates</h1>
  <TemplateList {templates} limit={20} showViewAll={true} />
</div>
