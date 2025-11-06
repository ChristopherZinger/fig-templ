<script lang="ts">
  export let onSelect: (frameId: string) => void;
  export let selectedFrameId: string | undefined;
  export let frameInfos: { id: string; name: string }[] = [];
  export let onClickOnSelectElement: () => void;
</script>

<div
  onclick={onClickOnSelectElement}
  role="button"
  tabindex="0"
  onkeydown={onClickOnSelectElement}
  class="frame-selector-container"
>
  <label for="frame-selector">Select Frame</label>
  <select
    id="frame-selector"
    onchange={(ev) => {
      if (
        ev.target &&
        "value" in ev.target &&
        typeof ev.target.value === "string"
      ) {
        onSelect(ev.target.value);
      }
    }}
  >
    {#each frameInfos as frame}
      <option selected={selectedFrameId === frame.id} value={frame.id}>
        {frame.name}
      </option>
    {/each}
  </select>
</div>

<style>
  .frame-selector-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  label {
    font-size: 10px;
  }
  select {
    outline: none;
    border: none;
    padding: 4px;
    border-radius: 4px;
  }
</style>
