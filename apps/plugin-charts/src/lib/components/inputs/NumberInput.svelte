<script lang="ts">
  export let value: number;
  export let onChange: (value: number) => void;
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let step: number | undefined = undefined;
  export let id: string | undefined = undefined;
  export let unit: string | undefined = undefined;
  export let onUnitMouseDown: ((pos: MouseEvent) => void) | undefined =
    undefined;
</script>

<div class="number-input">
  <input
    type="number"
    {id}
    {min}
    {max}
    {value}
    {step}
    onchange={(e) => {
      onChange(Number(e.currentTarget.value));
    }}
  />
  {#if unit}
    <span role="button" tabindex="0" onmousedown={onUnitMouseDown} class="unit">
      {unit}
    </span>
  {/if}
</div>

<style>
  .number-input {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  input {
    background-color: darkgray;
    border: none;
    outline: none;
    display: block;
    text-align: right;
    width: 50px;
    border-radius: 5px;
    font-size: 12px;
    color: var(--col-off-white);
    -moz-appearance: textfield;
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .unit {
    cursor: ew-resize;
    user-select: none;
  }
</style>
