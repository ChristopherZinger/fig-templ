<script lang="ts">
  import { SelectedViewMode } from "../lib/utils/shared/preview-tabs";
  import Button from "./Button.svelte";

  export let selectedViewMode: SelectedViewMode;
  export let viewModes: {
    label: string;
    value: SelectedViewMode;
  }[];
  export let onSelectMode: (mode: SelectedViewMode) => void;
  export let numWarnings: number;

  $: selectableViewModes = viewModes.filter((vm) =>
    numWarnings > 0 ? true : vm.value !== SelectedViewMode.warnings
  );
</script>

<div class="view-mode-selector">
  Select Mode:
  {#each selectableViewModes as viewMode}
    <Button
      onClick={() => onSelectMode(viewMode.value)}
      variant="naked"
      isActive={viewMode.value === selectedViewMode}
    >
      {#if viewMode.value === SelectedViewMode.warnings}
        {viewMode.label} [{numWarnings}]
      {:else}
        {viewMode.label}
      {/if}
    </Button>
  {/each}
</div>

<style>
  .view-mode-selector {
    display: flex;
    gap: 10px;
    padding: 10px;
    color: white;
    font-size: 12px;
    height: 100%;
    align-items: center;
  }
</style>
