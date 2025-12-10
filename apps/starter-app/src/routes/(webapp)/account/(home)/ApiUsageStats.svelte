<script lang="ts">
  import { RATE_LIMIT_SETTINGS } from "@templetto/settings"

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
      <div class="stat-desc">Max: {RATE_LIMIT_SETTINGS.numTemplatesPerOrg}</div>
    </div>

    <div class="stat place-items-center">
      <div class="stat-title">Num PDFs stored</div>
      <div class="stat-value">{numPdfsGenerated}</div>
      <div class="stat-desc">Max: {RATE_LIMIT_SETTINGS.numArtifactsPerOrg}</div>
    </div>

    <div class="stat place-items-center">
      <div class="stat-title">API Calls This Month</div>
      <div class="stat-value">{numApiCalls}</div>
      <div class="stat-desc">
        Max: {RATE_LIMIT_SETTINGS.numPdfsGeneratedPerMonthPerOrg}
      </div>
    </div>
  </div>
</div>
