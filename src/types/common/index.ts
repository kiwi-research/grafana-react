/**
 * Common types export
 *
 * Grafana-aligned types for panel configuration.
 * These types match the structures defined in @grafana/schema.
 */

// Enums
export type {
  VizOrientation,
  TooltipDisplayMode,
  SortOrder,
  VisibilityMode,
  AxisPlacement,
  AxisColorMode,
  LineInterpolation,
  BarAlignment,
  ScaleDistributionType,
  StackingMode,
  GraphGradientMode,
  BigValueJustifyMode,
  PercentChangeColorMode,
  BarGaugeSizing,
  BarGaugeDisplayMode,
  BarGaugeValueMode,
  BarGaugeNamePlacement,
  TableCellHeight,
  PieChartType,
  PieChartLabels,
  LineStyleFill,
} from './enums.js';

// Axis configuration
export type { ScaleDistributionConfig, AxisConfig } from './axis.js';

// Visualization options
export type {
  VizTooltipOptions,
  ReduceDataOptions,
  HideSeriesConfig,
  TextFormattingOptions,
  SingleStatBaseOptions,
} from './viz-options.js';

// Field configuration
export type {
  StackingConfig,
  LineStyleConfig,
  GraphThresholdsStyleConfig,
  GraphFieldConfig,
} from './field-config.js';
