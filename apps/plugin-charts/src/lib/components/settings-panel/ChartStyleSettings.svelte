<script lang="ts">
  import { get } from "svelte/store";
  import { chartStore } from "../../stores/chart-store";
  import Checkbox from "../inputs/Checkbox.svelte";
  import NumberInput from "../inputs/NumberInput.svelte";
  import ColorPicker from "./ColorPicker.svelte";

  function onUnitMouseDown({ clientX: initialMouseX }: MouseEvent) {
    const initialStroke = get(chartStore).path.stroke;

    const mouseMoveHandler = ({ clientX: mouseX }: MouseEvent) => {
      const deltaX = Math.round((mouseX - initialMouseX) / 10) / 10;
      const newStrokeWeight =
        Math.round(Math.max(0, deltaX + initialStroke) * 100) / 100;
      chartStore.setPathStroke(newStrokeWeight);
    };
    addEventListener("mousemove", mouseMoveHandler);

    const unsubMouseMove = () => {
      removeEventListener("mousemove", mouseMoveHandler);
      removeEventListener("mouseup", unsubMouseMove);
    };
    addEventListener("mouseup", unsubMouseMove);
  }
</script>

<div>
  <div class="section-title">Line</div>
  <div>
    <label for="path-stroke" class="row-input">
      <div>Stroke</div>
      <NumberInput
        id="path-stroke"
        min={0}
        step={0.2}
        value={$chartStore.path.stroke}
        unit="px"
        onChange={(value) => chartStore.setPathStroke(value)}
        {onUnitMouseDown}
      />
    </label>

    <label for="path-color" class="row-input">
      <div>Color</div>
      <ColorPicker
        id="path-color"
        value={$chartStore.path.color}
        onChange={(value) => chartStore.setPathColor(value)}
      />
    </label>
  </div>
</div>

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

  .row-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
  }
</style>
