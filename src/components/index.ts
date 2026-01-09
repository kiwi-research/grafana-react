/**
 * Component exports
 *
 * All components and their prop types are exported from here.
 */

// Base utilities
export { COMPONENT_TYPE, getComponentType, createComponent } from './base.js';
export type { ComponentType } from './base.js';

// Structure components
export { Dashboard, type DashboardProps } from './dashboard/dashboard.js';
export { Row, type RowProps } from './row/row.js';
export { Variable, type VariableProps } from './variable/variable.js';
export { Annotation, type AnnotationProps } from './annotation/annotation.js';
export { Link, type LinkProps } from './link/link.js';

// Query components
export { Query, type QueryProps } from './query/query.js';
export { Override, type OverrideProps } from './override/override.js';

// Generic plugin panel
export {
  PluginPanel,
  type PluginPanelProps,
} from './plugin-panel/plugin-panel.js';

// Core panels
export { Stat, type StatProps } from './panels/core/stat/stat.js';
export {
  Timeseries,
  type TimeseriesProps,
} from './panels/core/timeseries/timeseries.js';
export { Table, type TableProps } from './panels/core/table/table.js';
export {
  BarGauge,
  type BarGaugeProps,
} from './panels/core/bar-gauge/bar-gauge.js';
export { Heatmap, type HeatmapProps } from './panels/core/heatmap/heatmap.js';
export { Gauge, type GaugeProps } from './panels/core/gauge/gauge.js';
export { Text, type TextProps } from './panels/core/text/text.js';

// Chart panels
export {
  BarChart,
  type BarChartProps,
} from './panels/core/bar-chart/bar-chart.js';
export {
  PieChart,
  type PieChartProps,
} from './panels/core/pie-chart/pie-chart.js';
export {
  Histogram,
  type HistogramProps,
} from './panels/core/histogram/histogram.js';
export {
  StateTimeline,
  type StateTimelineProps,
} from './panels/core/state-timeline/state-timeline.js';
export {
  StatusHistory,
  type StatusHistoryProps,
} from './panels/core/status-history/status-history.js';
export {
  Candlestick,
  type CandlestickProps,
} from './panels/core/candlestick/candlestick.js';
export { Trend, type TrendProps } from './panels/core/trend/trend.js';
export { XYChart, type XYChartProps } from './panels/core/xy-chart/xy-chart.js';

// Data display panels
export { Logs, type LogsProps } from './panels/core/logs/logs.js';
export {
  Datagrid,
  type DatagridProps,
} from './panels/core/datagrid/datagrid.js';

// Specialized panels
export {
  NodeGraph,
  type NodeGraphProps,
} from './panels/core/node-graph/node-graph.js';
export { Traces, type TracesProps } from './panels/core/traces/traces.js';
export {
  FlameGraph,
  type FlameGraphProps,
} from './panels/core/flame-graph/flame-graph.js';
export { Canvas, type CanvasProps } from './panels/core/canvas/canvas.js';
export { Geomap, type GeomapProps } from './panels/core/geomap/geomap.js';

// Widget panels
export {
  DashboardList,
  type DashboardListProps,
} from './panels/core/dashboard-list/dashboard-list.js';
export {
  AlertList,
  type AlertListProps,
} from './panels/core/alert-list/alert-list.js';
export {
  AnnotationsList,
  type AnnotationsListProps,
} from './panels/core/annotations-list/annotations-list.js';
export { News, type NewsProps } from './panels/core/news/news.js';

// Plugin panels
export {
  BusinessVariablePanel,
  type BusinessVariablePanelProps,
  type TreeViewLevel,
  type VariableGroup,
} from './panels/plugins/business-variable-panel/business-variable-panel.js';

// Re-export React Fragment for convenience
import { Fragment } from 'react';
export { Fragment };
