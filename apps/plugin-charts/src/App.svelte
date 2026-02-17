<script lang="ts">
  import LineChart from "./lib/components/charts/LineChart.svelte";
  import { data } from "./lib/components/charts/lineData";
  import Nav from "./lib/components/Nav.svelte";
  import { chartStore } from "./lib/stores/chart-store";
</script>

<div class="app">
  <Nav />

  <main>
    <LineChart data={[data]} options={$chartStore} />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: row;
    height: calc(100vh - 10px);
    width: calc(100vw - 10px);
    overflow: hidden;
    padding: 5px;
    background-color: white;
  }

  main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
</style>
