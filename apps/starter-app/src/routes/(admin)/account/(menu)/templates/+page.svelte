<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import TemplateList from "../TemplateList.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("templates")

  let { data } = $props()
  let { templates } = data
</script>

<svelte:head>
  <title>Templates</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Templates</h1>

<TemplateList {templates} />

