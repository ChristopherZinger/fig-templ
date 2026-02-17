<script lang="ts">
  import { chartStore } from "../../stores/chart-store";
</script>

<div>
  <label for="ticks-x-axis">X Axis</label>
  <input
    id="ticks-x-axis"
    type="checkbox"
    checked={$chartStore.xAxis !== null}
    on:change={() => {
      chartStore.setAxisVisibility("x", !$chartStore.xAxis);
    }}
  />
</div>

<div>
  <label for="ticks-y-axis">Y Axis</label>
  <input
    id="ticks-y-axis"
    type="checkbox"
    checked={$chartStore.yAxis !== null}
    on:change={() => {
      chartStore.setAxisVisibility("y", !$chartStore.yAxis);
    }}
  />
</div>
