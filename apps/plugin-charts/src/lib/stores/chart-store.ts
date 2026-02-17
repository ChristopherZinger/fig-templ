import { writable } from "svelte/store";
import { get } from "svelte/store";
import type { LineCharOptions } from "../types";

const DEFAULT_LINE_CHART_OPTIONS: LineCharOptions = {
  xAxis: { ticks: 5 },
  yAxis: { ticks: 5 },
  width: 500,
  height: 500,
  padding: 50,
};

const _chartStore = writable<LineCharOptions>(DEFAULT_LINE_CHART_OPTIONS);

export const chartStore = {
  subscribe: _chartStore.subscribe,
  setAxisVisibility: (axis: "x" | "y", visible: boolean) => {
    const store = get(_chartStore);
    _chartStore.set({
      ...DEFAULT_LINE_CHART_OPTIONS,
      xAxis:
        axis === "x"
          ? visible
            ? DEFAULT_LINE_CHART_OPTIONS.xAxis
            : null
          : store.xAxis,
      yAxis:
        axis === "y"
          ? visible
            ? DEFAULT_LINE_CHART_OPTIONS.yAxis
            : null
          : store.yAxis,
    });
  },
  setWidth: (width: number) => {
    _chartStore.set({
      ...DEFAULT_LINE_CHART_OPTIONS,
      width,
    });
  },
  setHeight: (height: number) => {
    _chartStore.set({
      ...DEFAULT_LINE_CHART_OPTIONS,
      height,
    });
  },
  setPadding: (padding: number) => {
    _chartStore.set({
      ...DEFAULT_LINE_CHART_OPTIONS,
      padding,
    });
  },
};
