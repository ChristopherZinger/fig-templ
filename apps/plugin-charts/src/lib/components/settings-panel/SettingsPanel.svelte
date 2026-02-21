<script lang="ts">
  import ChartStyleSettings from "./ChartStyleSettings.svelte";

  export let selectedNavItem: "chart" | "style" | "data" | null;

  let dialogEl: HTMLDialogElement | undefined = undefined;
</script>

<dialog id="dialog" bind:this={dialogEl} open={selectedNavItem !== null}>
  {#if selectedNavItem === "chart"}
    <dv>chart settings</dv>
  {:else if selectedNavItem === "style"}
    <ChartStyleSettings />
  {:else if selectedNavItem === "data"}
    <dv>data settings</dv>
  {/if}
</dialog>

<style>
  #dialog {
    left: 45px;
    top: 0;
    background: var(--col-bg);
    height: 100%;
    width: 300px;
    max-height: none; /* override UA stylesheet constraint */
    max-width: none; /* override UA stylesheet constraint */
    overflow-y: scroll;
    overflow-x: hidden;
    border: none;
    outline: none;
    padding: 5px;
    box-sizing: border-box;
    border-radius: 10px;
    color: var(--col-text);
    font-size: 12px;
  }

  #dialog::backdrop {
    display: none;
  }
</style>
