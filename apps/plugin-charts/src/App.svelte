<script lang="ts">
  import LineChart from "./lib/components/charts/LineChart.svelte";
  import { data } from "./lib/components/charts/lineData";
  import Nav from "./lib/components/nav/Nav.svelte";
  import { chartHtmlStore, chartStore } from "./lib/stores/chart-store";

  let selectedNavItem: "chart" | "style" | "data" | null = null;

  // TODO: both plugin use this - make a module for this
  function sendToMainThread(
    msg: string,
    payload: Record<string, unknown> | null,
  ): void {
    parent.postMessage({ pluginMessage: { type: msg, data: payload } }, "*");
  }

  function createChart() {
    const svgHtmlStr = $chartHtmlStore;
    if (!svgHtmlStr) {
      console.error("cant_create_chart_no_svg_html_string");
      return;
    }
    sendToMainThread("create_chart", { chartHtmlSting: svgHtmlStr });
  }
</script>

<div class="app">
  <Nav onHover={(navItem) => (selectedNavItem = navItem)} {selectedNavItem} />

  <main>
    <LineChart data={[data]} options={$chartStore} />

    <div>
      <button onclick={createChart}>Create</button>
    </div>
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
