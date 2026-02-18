import { derived, writable } from "svelte/store";
import { get } from "svelte/store";
import type { AxisOptions, ChartSizeOptions, LineCharOptions } from "../types";

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

const _chartStore = derived(
  [_chartSizeStore, xAxisStore, yAxisStore],
  ([size, xAxis, yAxis]) =>
    ({
      ...size,
      xAxis,
      yAxis,
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
};
