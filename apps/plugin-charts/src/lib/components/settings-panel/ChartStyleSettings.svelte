<script lang="ts">
  import { chartStore } from "../../stores/chart-store";
  import Checkbox from "../inputs/Checkbox.svelte";
</script>

<div>
  <div class="section-title">Y Axis</div>

  <div>
    <Checkbox
      label="X Axis"
      checked={$chartStore.xAxis !== null}
      onChange={(checked) => {
        chartStore.setAxisVisibility("x", !checked);
      }}
    />
  </div>

  <div>
    <Checkbox
      label="Ticks"
      checked={$chartStore.xAxis?.ticks !== null}
      onChange={(checked) => {
        chartStore.setTicks("x", checked ? null : undefined);
      }}
    />
  </div>
</div>

<div>
  <div class="section-title">Y Axis</div>
  <div>
    <Checkbox
      label="Y Axis"
      checked={$chartStore.yAxis !== null}
      onChange={(checked) => {
        chartStore.setAxisVisibility("y", !checked);
      }}
    />
  </div>

  <div>
    <Checkbox
      label="Ticks"
      checked={$chartStore.yAxis?.ticks !== null}
      onChange={(checked) => {
        chartStore.setTicks("y", checked ? null : undefined);
      }}
    />
  </div>
</div>

<style>
  .section-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    padding: 0 2px;
    border-bottom: 1px solid var(--col-text);
  }
</style>
