/**
 * Type exports
 *
 * Shared types and Grafana output types.
 * Component prop types are exported from components/index.js.
 */

// Display configuration types (units, thresholds, legends, colors, mappings)
export type {
  ThresholdColor,
  ThresholdStyle,
  LegendPlacement,
  LegendDisplayMode,
  LegendCalc,
  LegendConfig,
  Unit,
  ColorMode,
  FixedColorMode,
  ContinuousColorMode,
  PaletteColorMode,
  ColorSeriesBy,
  ThresholdSpec,
  VariableSort,
  ValueMapping,
  ValueMappingValue,
  ValueMappingRange,
  ValueMappingRegex,
  ValueMappingSpecial,
} from './display.js';

// Base panel types (shared by all panels)
export type {
  BasePanelProps,
  FieldConfigProps,
  OverrideConfig,
  TableDataLink,
  TableColumnOverride,
  Transformation,
} from './panel-base.js';

// Panel defaults
export type {
  FieldDefaults,
  PanelOptionDefaults,
  PanelDefaults,
  PanelType,
  PanelTypeDefaults,
  ExtendedPanelDefaults,
} from './defaults.js';

// Grafana JSON output types (the structure we generate)
export type {
  GrafanaDashboard,
  GrafanaPanel,
  GrafanaTarget,
  GrafanaVariable,
  GrafanaAnnotation,
  GrafanaLink,
  GrafanaGridPos,
  GrafanaThreshold,
  GrafanaThresholds,
  GrafanaFieldConfig,
  GrafanaOverride,
} from './grafana-json.js';

// Common Grafana-aligned types (enums, axis, viz options, field config)
export type {
  // Enums
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
  // Axis
  ScaleDistributionConfig,
  AxisConfig,
  // Viz options
  VizTooltipOptions,
  ReduceDataOptions,
  HideSeriesConfig,
  TextFormattingOptions,
  SingleStatBaseOptions,
  // Field config
  StackingConfig,
  LineStyleConfig,
  GraphThresholdsStyleConfig,
  GraphFieldConfig,
} from './common/index.js';
