<script lang="ts">
  import { chartStore } from "../stores/chart-store";

  let dialogEl: HTMLDialogElement | undefined = undefined;
</script>

<div class="nav-container">
  <nav on:mouseenter={() => dialogEl?.showModal()}>
    <div class="item">1</div>
    <div class="item">2</div>
    <div class="item">3</div>
  </nav>

  <dialog
    id="dialog"
    bind:this={dialogEl}
    on:mouseleave={() => dialogEl?.close()}
  >
    <div class="content">
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
    </div>
  </dialog>
</div>

<style>
  .nav-container {
    height: 100%;
    position: relative;
  }

  nav {
    display: flex;
    flex-direction: column;
    width: 40px;
    background-color: var(--col-bg);
    border-radius: 10px;
    height: 100%;
  }

  nav div.item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 40px;
    border: 1px solid var(--light-gray);
    color: var(--col-text);
  }

  #dialog {
    left: 45px;
    top: 0;
    background: var(--col-bg);
    height: calc(100% - 10px); /* 10px is the margin of the nav container */
    width: 300px;
    max-height: none; /* override UA stylesheet constraint */
    max-width: none; /* override UA stylesheet constraint */
    overflow-y: scroll;
    overflow-x: hidden;
    border: none;
    outline: none;
    padding: 0;
    margin: 5px;
    box-sizing: border-box;
    border-radius: 10px;
    padding: 5px;
    color: var(--col-text);
    font-size: 12px;
  }

  #dialog::backdrop {
    display: none;
  }
</style>
