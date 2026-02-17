type ChartType = "line";

export type LineChartData = number[];
export type LineCharOptions = {
  xAxis: AxisOptions | null;
  yAxis: AxisOptions | null;
  width: number;
  height: number;
  padding: number;
};

export type AxisOptions = {
  ticks?: number; // undefined = 'auto'
};
