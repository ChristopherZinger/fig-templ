<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import TemplateList from "./TemplateList.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("home")
  let { data } = $props()
  let { templates } = data
  let showStats = false
</script>

<svelte:head>
  <title>Account</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-1">Dashboard</h1>

{#if showStats}
  <div class="my-6">
    <h1 class="text-xl font-bold mb-1">Stats</h1>
    <div
      class="stats shadow-sm stats-vertical sm:stats-horizontal sm:w-[840px]"
    >
      <div class="stat place-items-center">
        <div class="stat-title">Templates</div>
        <div class="stat-value">{templates.length}</div>
        <div class="stat-desc">↗︎ 546 (2%)</div>
      </div>

      <div class="stat place-items-center">
        <div class="stat-title">Downloads</div>
        <div class="stat-value">31K</div>
        <div class="stat-desc">↗︎ 546 (2%)</div>
      </div>
    </div>
  </div>
  <div class="my-6">
    <h1 class="text-xl font-bold mb-1">API</h1>
    <div
      class="stats shadow-sm stats-vertical sm:stats-horizontal sm:w-[840px]"
    >
      <div class="stat place-items-center">
        <div class="stat-title">API Calls this month</div>
        <div class="stat-value">1,200</div>
        <div class="stat-desc">/ 10,000 in your plan</div>
      </div>

      <div class="stat place-items-center">
        <div class="stat-title">Reponse time</div>
        <div class="stat-value">53ms</div>
        <div class="stat-desc">avg.</div>
      </div>
      <div class="stat place-items-center">
        <div class="stat-title">Success rate</div>
        <div class="stat-value">99.9%</div>
        <div class="stat-desc">avg.</div>
      </div>
    </div>
  </div>
{/if}
<div class="my-6">
  <h1 class="text-xl font-bold mb-3">Recent Templates</h1>
  <TemplateList {templates} limit={20} showViewAll={true} />
</div>
