/**
 * Field configuration types
 *
 * Types for configuring how data fields are displayed in graph panels.
 *
 * @see https://github.com/grafana/grafana/blob/main/packages/grafana-schema/src/common/common.gen.ts
 */

import type {
  StackingMode,
  GraphGradientMode,
  LineInterpolation,
  BarAlignment,
  VisibilityMode,
  LineStyleFill,
} from './enums.js';
import type { AxisConfig } from './axis.js';
import type { HideSeriesConfig } from './viz-options.js';
import type { ThresholdStyle } from '../display.js';

/**
 * Stacking configuration
 *
 * Controls how series are stacked.
 *
 * @example
 * // Normal stacking
 * { mode: 'normal' }
 *
 * @example
 * // Percent stacking with group
 * { mode: 'percent', group: 'A' }
 */
export interface StackingConfig {
  /** Stacking mode */
  mode: StackingMode;
  /** Stack group identifier */
  group?: string;
}

/**
 * Line style configuration
 *
 * Controls the appearance of lines.
 *
 * @example
 * // Solid line
 * { fill: 'solid' }
 *
 * @example
 * // Dashed line with custom pattern
 * { fill: 'dash', dash: [10, 10] }
 */
export interface LineStyleConfig {
  /** Line fill style */
  fill?: LineStyleFill;
  /** Dash pattern array [dash, gap, dash, gap, ...] */
  dash?: number[];
}

/**
 * Graph thresholds style configuration
 *
 * Controls how thresholds are displayed on graphs.
 */
export interface GraphThresholdsStyleConfig {
  /** Threshold display mode */
  mode: ThresholdStyle;
}

/**
 * Graph field configuration
 *
 * Comprehensive configuration for graph panel fields (timeseries, barchart, etc.)
 * This extends AxisConfig to include all axis options.
 *
 * @example
 * // Line graph with area fill
 * {
 *   drawStyle: 'line',
 *   lineWidth: 2,
 *   fillOpacity: 20,
 *   gradientMode: 'opacity'
 * }
 *
 * @example
 * // Bar chart with stacking
 * {
 *   drawStyle: 'bars',
 *   barAlignment: 0,
 *   stacking: { mode: 'normal' }
 * }
 */
export interface GraphFieldConfig extends AxisConfig {
  /** Draw style for the series */
  drawStyle?: 'line' | 'bars' | 'points';
  /** Gradient mode for fill */
  gradientMode?: GraphGradientMode;
  /** Threshold display style */
  thresholdsStyle?: GraphThresholdsStyleConfig;
  /** Line color override */
  lineColor?: string;
  /** Line width in pixels */
  lineWidth?: number;
  /** Line interpolation style */
  lineInterpolation?: LineInterpolation;
  /** Line style (solid, dash, dot) */
  lineStyle?: LineStyleConfig;
  /** Fill color override */
  fillColor?: string;
  /** Fill opacity (0-100) */
  fillOpacity?: number;
  /** Show points on lines */
  showPoints?: VisibilityMode;
  /** Point size in pixels */
  pointSize?: number;
  /** Point color override */
  pointColor?: string;
  /** Stacking configuration */
  stacking?: StackingConfig;
  /** Hide series from legend/tooltip/viz */
  hideFrom?: HideSeriesConfig;
  /** Bar alignment relative to time point */
  barAlignment?: BarAlignment;
  /** Maximum bar width in pixels */
  barMaxWidth?: number;
  /** Bar width factor (0-1) */
  barWidthFactor?: number;
  /** Connect null values (true, false, or threshold in ms) */
  spanNulls?: boolean | number;
  /** Insert nulls when time gap exceeds threshold (true, false, or threshold in ms) */
  insertNulls?: boolean | number;
  /** Transform values */
  transform?: 'constant' | 'negative-Y';
}
