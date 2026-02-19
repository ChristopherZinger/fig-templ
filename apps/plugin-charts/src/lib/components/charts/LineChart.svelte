<script lang="ts">
  import * as d3 from "d3";
  import type { LineChartData, LineCharOptions } from "../../types";
  import { chartHtmlStore } from "../../stores/chart-store";

  export let data: LineChartData[];
  export let options: LineCharOptions;

  let parentNode: HTMLElement | undefined = undefined;
  function onChartHtmlChange(
    parentNode: HTMLElement | undefined,
    chartHtml: string | null,
  ) {
    if (!parentNode) {
      console.error("parent_node_not_found");
      return;
    }
    if (!chartHtml) {
      parentNode.innerHTML = "<div>No chart data / options</div>";
      return;
    }
    parentNode.innerHTML = chartHtml;
  }

  function onParentNodeChange(data: LineChartData[], options: LineCharOptions) {
    if (!parentNode) {
      console.error("Parent node not found");
      chartHtmlStore.setChartHtml(null);
      return;
    }
    parentNode.innerHTML = "";

    const { width, height, padding } = options;
    const minX = 0;
    const maxX = Math.max(data.reduce((max, d) => Math.max(max, d.length), 0));

    const minY = Math.max(...data.flat());
    const maxY = Math.min(...data.flat());

    const svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const svgNode = svg.node();
    if (!svgNode) {
      console.error("svg_node_not_found");
      chartHtmlStore.setChartHtml(null);
      return;
    }

    const x = d3.scaleLinear([padding, width - padding]).domain([minX, maxX]);
    const y = d3.scaleLinear([padding, height - padding]).domain([minY, maxY]);

    if (options.xAxis) {
      const xAxis = d3.axisBottom(x);
      if (options.xAxis.ticks !== undefined) {
        xAxis.ticks(options.xAxis.ticks);
      }
      if (options.xAxis.ticks === null) {
        xAxis.ticks([]);
      }
      svg
        .append("g")
        .attr("transform", `translate(0,${height - padding})`)
        .attr("color", "black")
        .call(xAxis);
    }

    if (options.yAxis) {
      const yAxis = d3.axisLeft(y);
      if (options.yAxis.ticks !== undefined) {
        yAxis.ticks(options.yAxis.ticks);
      }
      if (options.yAxis.ticks === null) {
        yAxis.ticks([]);
      }
      svg
        .append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .attr("color", "black")
        .call(yAxis);
    }

    const line = d3
      .line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d));

    for (const d of data) {
      svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line(d));
    }

    chartHtmlStore.setChartHtml(svgNode.outerHTML);
  }

  $: {
    onParentNodeChange(data, options);
    onChartHtmlChange(parentNode, $chartHtmlStore);
  }
</script>

<div bind:this={parentNode}>
  <div class="chart"></div>
</div>
