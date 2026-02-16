<script lang="ts">
  import * as d3 from "d3";

  type LineData = number[];

  type AxisOptions = {
    ticks?: number; // undefined = 'auto'
  };

  type Options = {
    xAxis: null | AxisOptions;
    yAxis: null | AxisOptions;
    width: number;
    height: number;
    padding: number;
  };

  export let data: LineData[]; // y values
  export let options: Options;

  let parentNode: HTMLElement | undefined = undefined;

  $: onParentNodeChange(parentNode, data, options);
  function onParentNodeChange(
    parentNode: HTMLElement | undefined,
    data: LineData[],
    options: Options,
  ) {
    if (!parentNode) {
      console.error("Parent node not found");
      return;
    }
    parentNode.innerHTML = "";

    const { width, height, padding } = options;
    const minX = 0;
    const maxX = Math.max(data.reduce((max, d) => Math.max(max, d.length), 0));

    const minY = Math.max(...data.flat());
    const maxY = Math.min(...data.flat());

    const _parentNode = d3.select(parentNode);

    const svg = _parentNode
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const x = d3.scaleLinear([padding, width - padding]).domain([minX, maxX]);
    const y = d3.scaleLinear([padding, height - padding]).domain([minY, maxY]);

    if (options.xAxis) {
      const xAxis = d3.axisBottom(x);
      if (options.xAxis.ticks !== undefined) {
        xAxis.ticks(options.xAxis.ticks);
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
  }
</script>

<div bind:this={parentNode}>
  <div class="chart"></div>
</div>
