<script lang="ts">
  import LineChart from "./lib/components/charts/LineChart.svelte";
  import { data } from "./lib/components/charts/lineData";
  let options = {
    xAxis: { ticks: 5 },
    yAxis: { ticks: 5 },
    width: 500,
    height: 500,
    padding: 50,
  };
</script>
<div class="app">
  <main>
    <LineD3 data={[_data]} {options} />
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
