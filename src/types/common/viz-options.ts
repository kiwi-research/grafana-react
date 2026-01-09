/**
 * Visualization options types
 *
 * Types for configuring tooltips, legends, and data reduction.
 *
 * @see https://github.com/grafana/grafana/blob/main/packages/grafana-schema/src/common/common.gen.ts
 */

import type { TooltipDisplayMode, SortOrder, VizOrientation } from './enums.js';
import type { LegendCalc } from '../display.js';

/**
 * Tooltip configuration
 *
 * Controls how tooltips are displayed on hover.
 *
 * @example
 * // Single series tooltip
 * { mode: 'single', sort: 'none' }
 *
 * @example
 * // Multi-series tooltip sorted descending
 * { mode: 'multi', sort: 'desc', maxHeight: 300 }
 */
export interface VizTooltipOptions {
  /** Tooltip display mode */
  mode: TooltipDisplayMode;
  /** Sort order for values in tooltip (defaults to 'none') */
  sort?: SortOrder;
  /** Maximum tooltip height in pixels */
  maxHeight?: number;
  /** Maximum tooltip width in pixels */
  maxWidth?: number;
}

/**
 * Data reduction options
 *
 * Controls how multiple values are reduced to a single value.
 *
 * @example
 * // Show last non-null value
 * { calcs: ['lastNotNull'] }
 *
 * @example
 * // Show mean and max
 * { calcs: ['mean', 'max'] }
 */
export interface ReduceDataOptions {
  /** Calculations to perform (e.g., 'mean', 'max', 'last') */
  calcs: (LegendCalc | string)[];
  /** Field name or regex to match */
  fields?: string;
  /** Reduce all values, not just series */
  values?: boolean;
  /** Limit number of values */
  limit?: number;
}

/**
 * Hide series configuration
 *
 * Controls where a series is hidden from display.
 *
 * @example
 * // Hide from legend only
 * { legend: true, tooltip: false, viz: false }
 */
export interface HideSeriesConfig {
  /** Hide from legend */
  legend: boolean;
  /** Hide from tooltip */
  tooltip: boolean;
  /** Hide from visualization */
  viz: boolean;
}

/**
 * Text formatting options
 *
 * Font size options for single-stat style panels.
 */
export interface TextFormattingOptions {
  /** Title font size in pixels */
  titleSize?: number;
  /** Value font size in pixels */
  valueSize?: number;
}

/**
 * Single stat base options
 *
 * Base options shared by stat, gauge, and bar gauge panels.
 */
export interface SingleStatBaseOptions extends TextFormattingOptions {
  /** Data reduction options */
  reduceOptions?: ReduceDataOptions;
  /** Orientation of the visualization */
  orientation?: VizOrientation;
}
