/**
 * Grafana React
 *
 * A React-based DSL for creating Grafana dashboards.
 * Components don't render to DOM - they create a virtual tree
 * that gets converted to Grafana JSON.
 *
 * @example
 * import {
 *   Dashboard,
 *   Row,
 *   Stat,
 *   Timeseries,
 *   Variable,
 *   render
 * } from 'grafana-react';
 *
 * const MyDashboard = () => (
 *   <Dashboard uid="my-dashboard" title="My Dashboard">
 *     <Variable name="instance">label_values(up, instance)</Variable>
 *     <Row title="Summary">
 *       <Stat title="CPU %" unit="percent" thresholds={{ 70: 'yellow', 90: 'red' }}>
 *         100 - avg(rate(cpu_idle[$__rate_interval])) * 100
 *       </Stat>
 *     </Row>
 *   </Dashboard>
 * );
 *
 * const json = render(<MyDashboard />);
 */

// Components and their prop types
export {
  // Structure
  Dashboard,
  Row,
  Variable,
  Annotation,
  Link,
  // Query
  Query,
  Override,
  // Core Panels
  Stat,
  Timeseries,
  Table,
  BarGauge,
  Heatmap,
  Gauge,
  Text,
  // Chart Panels
  BarChart,
  PieChart,
  Histogram,
  StateTimeline,
  StatusHistory,
  Candlestick,
  Trend,
  XYChart,
  // Data Display Panels
  Logs,
  Datagrid,
  // Specialized Panels
  NodeGraph,
  Traces,
  FlameGraph,
  Canvas,
  Geomap,
  // Widget Panels
  DashboardList,
  AlertList,
  AnnotationsList,
  News,
  // Plugin Panels
  PluginPanel,
  BusinessVariablePanel,
  // Utilities
  Fragment,
  COMPONENT_TYPE,
  getComponentType,
  createComponent,
  // Prop types
  type DashboardProps,
  type RowProps,
  type VariableProps,
  type AnnotationProps,
  type LinkProps,
  type QueryProps,
  type OverrideProps,
  type StatProps,
  type TimeseriesProps,
  type TableProps,
  type BarGaugeProps,
  type HeatmapProps,
  type GaugeProps,
  type TextProps,
  type BarChartProps,
  type PieChartProps,
  type HistogramProps,
  type StateTimelineProps,
  type StatusHistoryProps,
  type CandlestickProps,
  type TrendProps,
  type XYChartProps,
  type LogsProps,
  type DatagridProps,
  type NodeGraphProps,
  type TracesProps,
  type FlameGraphProps,
  type CanvasProps,
  type GeomapProps,
  type DashboardListProps,
  type AlertListProps,
  type AnnotationsListProps,
  type NewsProps,
  type PluginPanelProps,
  type BusinessVariablePanelProps,
  type TreeViewLevel,
  type VariableGroup,
} from './components/index.js';

// Renderer
export { render, renderToString } from './lib/index.js';

// Shared types
export type {
  // Common types
  ThresholdColor,
  ThresholdStyle,
  LegendPlacement,
  LegendDisplayMode,
  LegendCalc,
  LegendConfig,
  Unit,
  ColorMode,
  ThresholdSpec,
  VariableSort,
  // Base panel types
  BasePanelProps,
  OverrideConfig,
  TableColumnOverride,
  Transformation,
  // Grafana output types
  GrafanaDashboard,
  GrafanaPanel,
  GrafanaTarget,
  GrafanaVariable,
  GrafanaAnnotation,
  GrafanaLink,
} from './types/index.js';
