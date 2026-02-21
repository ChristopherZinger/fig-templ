import { derived, writable } from "svelte/store";
import { get } from "svelte/store";
import type { AxisOptions, ChartSizeOptions, LineCharOptions, PathOptions } from "../types";

const DEFAULT_AXIS_OPTIONS: AxisOptions = {
  ticks: undefined,
};

const getAxisStore = () => {
  const _axisStore = writable<AxisOptions | null>(DEFAULT_AXIS_OPTIONS);
  return {
    subscribe: _axisStore.subscribe,
    setTicks: (numberOfTicks: number | undefined | null) => {
      _axisStore.update((v) => ({ ...v, ticks: numberOfTicks }));
    },
    setVisibility: (visible: boolean) => {
      const isVisible = !!get(_axisStore);
      if (isVisible) {
        _axisStore.set(null);
        return;
      }
      _axisStore.set(DEFAULT_AXIS_OPTIONS);
    },
  };
};
const xAxisStore = getAxisStore();
const yAxisStore = getAxisStore();

const _chartSizeStore = writable<ChartSizeOptions>({
  width: 500,
  height: 500,
  padding: 50,
});
const chartSizeStore = {
  subscribe: _chartSizeStore.subscribe,
  setWidth: (width: number) => {
    _chartSizeStore.update((v) => ({ ...v, width }));
  },
  setHeight: (height: number) => {
    _chartSizeStore.update((v) => ({ ...v, height }));
  },
  setPadding: (padding: number) => {
    _chartSizeStore.update((v) => ({ ...v, padding }));
  },
};

const _pathOptionsStore = writable<PathOptions>({
  stroke: 1.5,
  color: "steelblue",
});
const pathOptionsStore = {
  subscribe: _pathOptionsStore.subscribe,
  setStroke: (stroke: number) => {
    _pathOptionsStore.update((v) => ({ ...v, stroke }));
  },
  setColor: (color: string) => {
    _pathOptionsStore.update((v) => ({ ...v, color }));
  },
};

const _chartStore = derived(
  [_chartSizeStore, xAxisStore, yAxisStore, pathOptionsStore],
  ([size, xAxis, yAxis, lineOptions]) =>
    ({
      ...size,
      xAxis,
      yAxis,
      path: lineOptions,
    }) satisfies LineCharOptions,
);

export const chartStore = {
  subscribe: _chartStore.subscribe,
  setAxisVisibility: (axis: "x" | "y", visible: boolean) => {
    const store = get(_chartStore);
    if (axis === "x") {
      xAxisStore.setVisibility(visible);
    } else {
      yAxisStore.setVisibility(visible);
    }
  },
  setTicks: (axis: "x" | "y", ticks?: number | undefined | null) => {
    if (axis === "x") {
      xAxisStore.setTicks(ticks);
    } else {
      yAxisStore.setTicks(ticks);
    }
  },
  setWidth: chartSizeStore.setWidth,
  setHeight: chartSizeStore.setHeight,
  setPadding: chartSizeStore.setPadding,
  setPathStroke: pathOptionsStore.setStroke,
  setPathColor: pathOptionsStore.setColor,
};

const _chartHtmlStore = writable<string | null>(null);
export const chartHtmlStore = {
  subscribe: _chartHtmlStore.subscribe,
  setChartHtml: (chartHtml: string | null) => {
    _chartHtmlStore.set(chartHtml);
  },
};
