<script lang="ts">
  interface Props {
    numApiCalls: number
    numTemplates: number
    numPdfsGenerated: number
  }

  let { numApiCalls, numTemplates, numPdfsGenerated }: Props = $props()
</script>

<div class="my-6">
  <div class="stats shadow-sm stats-vertical sm:stats-horizontal w-full">
    <div class="stat place-items-center">
      <div class="stat-title">Templates</div>
      <div class="stat-value">{numTemplates}</div>
      <div class="stat-desc">Max: 100</div>
    </div>

    <div class="stat place-items-center">
      <div class="stat-title">Num PDFs stored</div>
      <div class="stat-value">{numPdfsGenerated}</div>
      <div class="stat-desc">Max: 1000</div>
    </div>

    <div class="stat place-items-center">
      <div class="stat-title">API Calls This Month</div>
      <div class="stat-value">{numApiCalls}</div>
      <div class="stat-desc">Max: 100</div>
    </div>
  </div>
</div>
