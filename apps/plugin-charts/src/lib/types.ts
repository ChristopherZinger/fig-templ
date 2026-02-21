type ChartType = "line";

export type LineChartData = number[];
export type LineCharOptions = {
  xAxis: AxisOptions | null;
  yAxis: AxisOptions | null;
  path: PathOptions;
} & ChartSizeOptions 


export type AxisOptions = {
  ticks?: number | undefined | null; // undefined = 'auto'; null = hide
};

export type ChartSizeOptions = {
  width: number;
  height: number;
  padding: number;
};

export type PathOptions = {
  stroke: number;
  color: string;
}