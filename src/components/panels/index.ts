/**
 * Panel components and prop types
 *
 * Each panel is in its own folder for modularity.
 */

// Core panels
export { Stat, type StatProps } from './core/stat/stat.js';
export {
  Timeseries,
  type TimeseriesProps,
} from './core/timeseries/timeseries.js';
export { Table, type TableProps } from './core/table/table.js';
export { BarGauge, type BarGaugeProps } from './core/bar-gauge/bar-gauge.js';
export { Heatmap, type HeatmapProps } from './core/heatmap/heatmap.js';
export { Gauge, type GaugeProps } from './core/gauge/gauge.js';
export { Text, type TextProps } from './core/text/text.js';

// Chart panels
export { BarChart, type BarChartProps } from './core/bar-chart/bar-chart.js';
export { PieChart, type PieChartProps } from './core/pie-chart/pie-chart.js';
export { Histogram, type HistogramProps } from './core/histogram/histogram.js';
export {
  StateTimeline,
  type StateTimelineProps,
} from './core/state-timeline/state-timeline.js';
export {
  StatusHistory,
  type StatusHistoryProps,
} from './core/status-history/status-history.js';
export {
  Candlestick,
  type CandlestickProps,
} from './core/candlestick/candlestick.js';
export { Trend, type TrendProps } from './core/trend/trend.js';
export { XYChart, type XYChartProps } from './core/xy-chart/xy-chart.js';

// Data display panels
export { Logs, type LogsProps } from './core/logs/logs.js';
export { Datagrid, type DatagridProps } from './core/datagrid/datagrid.js';

// Specialized panels
export {
  NodeGraph,
  type NodeGraphProps,
} from './core/node-graph/node-graph.js';
export { Traces, type TracesProps } from './core/traces/traces.js';
export {
  FlameGraph,
  type FlameGraphProps,
} from './core/flame-graph/flame-graph.js';
export { Canvas, type CanvasProps } from './core/canvas/canvas.js';
export { Geomap, type GeomapProps } from './core/geomap/geomap.js';

// Widget panels
export {
  DashboardList,
  type DashboardListProps,
} from './core/dashboard-list/dashboard-list.js';
export {
  AlertList,
  type AlertListProps,
} from './core/alert-list/alert-list.js';
export {
  AnnotationsList,
  type AnnotationsListProps,
} from './core/annotations-list/annotations-list.js';
export { News, type NewsProps } from './core/news/news.js';

// Plugin panels
export {
  BusinessVariablePanel,
  type BusinessVariablePanelProps,
  type TreeViewLevel,
  type VariableGroup,
} from './plugins/business-variable-panel/business-variable-panel.js';
