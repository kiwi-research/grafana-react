/**
 * Grafana-aligned enum types
 *
 * These types match the enums defined in @grafana/schema for compatibility
 * with Grafana's panel configuration options.
 *
 * @see https://github.com/grafana/grafana/blob/main/packages/grafana-schema/src/common/common.gen.ts
 */

/** Visualization orientation */
export type VizOrientation = 'auto' | 'horizontal' | 'vertical';

/** Tooltip display mode */
export type TooltipDisplayMode = 'single' | 'multi' | 'none';

/** Sort order for tooltips and legends */
export type SortOrder = 'none' | 'asc' | 'desc';

/** Visibility mode for points, values, etc. */
export type VisibilityMode = 'auto' | 'always' | 'never';

/** Axis placement options */
export type AxisPlacement =
  | 'auto'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'hidden';

/** Axis color mode */
export type AxisColorMode = 'text' | 'series';

/** Line interpolation style */
export type LineInterpolation =
  | 'linear'
  | 'smooth'
  | 'stepBefore'
  | 'stepAfter';

/** Bar alignment relative to time point (-1 = before, 0 = center, 1 = after) */
export type BarAlignment = -1 | 0 | 1;

/** Scale distribution type for axes */
export type ScaleDistributionType = 'linear' | 'log' | 'ordinal' | 'symlog';

/** Stacking mode for series */
export type StackingMode = 'none' | 'normal' | 'percent';

/** Graph gradient mode */
export type GraphGradientMode = 'none' | 'opacity' | 'hue' | 'scheme';

/** Big value justify mode (for stat panel) */
export type BigValueJustifyMode = 'auto' | 'center';

/** Percent change color mode (for stat panel) */
export type PercentChangeColorMode = 'standard' | 'inverted' | 'same_as_value';

/** Bar gauge sizing mode */
export type BarGaugeSizing = 'auto' | 'manual';

/** Bar gauge display mode */
export type BarGaugeDisplayMode = 'basic' | 'gradient' | 'lcd';

/** Bar gauge value mode */
export type BarGaugeValueMode = 'color' | 'text' | 'hidden';

/** Bar gauge name placement */
export type BarGaugeNamePlacement = 'auto' | 'top' | 'left';

/** Table cell height */
export type TableCellHeight = 'sm' | 'md' | 'lg';

/** Pie chart type */
export type PieChartType = 'pie' | 'donut';

/** Pie chart label options */
export type PieChartLabels = 'name' | 'value' | 'percent';

/** Line style fill type */
export type LineStyleFill = 'solid' | 'dash' | 'dot';
