/**
 * Common types used across components
 */

/** Standard Grafana color names */
export type ThresholdColor =
  | 'green'
  | 'yellow'
  | 'red'
  | 'orange'
  | 'blue'
  | 'transparent'
  | 'text';

/** Threshold display style on timeseries */
export type ThresholdStyle =
  | 'off'
  | 'line'
  | 'area'
  | 'dashed'
  | 'line+area'
  | 'dashed+area';

/** Legend placement options */
export type LegendPlacement = 'right' | 'bottom';

/** Legend display modes */
export type LegendDisplayMode = 'table' | 'list' | 'hidden';

/** Legend calculation types */
export type LegendCalc =
  | 'mean'
  | 'max'
  | 'min'
  | 'sum'
  | 'last'
  | 'lastNotNull'
  | 'first'
  | 'count';

/** Legend configuration */
export interface LegendConfig {
  placement?: LegendPlacement;
  displayMode?: LegendDisplayMode;
  calcs?: LegendCalc[];
  sortBy?: string;
  sortDesc?: boolean;
  /** Width of legend in pixels (only applies when placement is 'right') */
  width?: number;
}

/** Common Grafana units */
export type Unit =
  // Percentages
  | 'percent'
  | 'percentunit'
  // Data
  | 'bytes'
  | 'decbytes'
  | 'bits'
  // Time
  | 's'
  | 'ms'
  | 'ns'
  | 'dtdurations'
  | 'dthms'
  // Throughput
  | 'Bps'
  | 'binBps'
  | 'bps'
  // Rates
  | 'reqps'
  | 'iops'
  | 'ops'
  | 'pps'
  // Other
  | 'short'
  | 'none'
  // Allow custom strings
  | string;

/** Color modes that require a fixed color value */
export type FixedColorMode = 'fixed' | 'shades';

/**
 * Continuous (gradient) color schemes - color derived from value.
 * Known modes are listed for autocomplete; the template literal allows custom modes.
 */
export type ContinuousColorMode =
  | 'continuous-GrYlRd'
  | 'continuous-RdYlGr'
  | 'continuous-BlYlRd'
  | 'continuous-YlRd'
  | 'continuous-BlPu'
  | 'continuous-YlBl'
  | 'continuous-blues'
  | 'continuous-reds'
  | 'continuous-greens'
  | 'continuous-purples'
  | `continuous-${string}`; // Escape hatch for custom continuous modes

/**
 * Color modes that don't require additional configuration.
 * Known modes are listed for autocomplete; the template literal allows custom palettes.
 */
export type PaletteColorMode =
  | 'thresholds'
  | 'palette-classic'
  | 'palette-classic-by-name'
  | `palette-${string}`; // Escape hatch for custom palette modes

/** All color modes for panels */
export type ColorMode = FixedColorMode | ContinuousColorMode | PaletteColorMode;

/**
 * Determines which value from a series is used to calculate the color
 * when using continuous/gradient color modes.
 */
export type ColorSeriesBy = 'last' | 'min' | 'max';

/** Threshold specification formats */
export type ThresholdSpec =
  // Object format: { 70: 'yellow', 90: 'red' }
  | Record<number, ThresholdColor | string>
  // Tuple format: [[70, 'yellow'], [90, 'red']]
  | [number, ThresholdColor | string][];

/** Variable sort options */
export type VariableSort =
  | 'disabled'
  | 'alpha'
  | 'alpha-desc'
  | 'num'
  | 'num-desc'
  | 'alpha-ci'
  | 'alpha-ci-desc';

// ============================================================================
// Value Mappings
// ============================================================================

/** Value mapping for exact value matches */
export interface ValueMappingValue {
  type: 'value';
  /** The value to match */
  value: number | string | boolean;
  /** Text to display when matched */
  text: string;
  /** Optional color override */
  color?: string;
  /** Optional index for ordering */
  index?: number;
}

/** Value mapping for range of values */
export interface ValueMappingRange {
  type: 'range';
  /** Start of range (inclusive) */
  from: number;
  /** End of range (inclusive) */
  to: number;
  /** Text to display when matched */
  text: string;
  /** Optional color override */
  color?: string;
  /** Optional index for ordering */
  index?: number;
}

/** Value mapping for regex pattern matches */
export interface ValueMappingRegex {
  type: 'regex';
  /** Regex pattern to match */
  pattern: string;
  /** Text to display when matched */
  text: string;
  /** Optional color override */
  color?: string;
  /** Optional index for ordering */
  index?: number;
}

/** Value mapping for special values (null, NaN, etc) */
export interface ValueMappingSpecial {
  type: 'special';
  /** Special value type to match */
  match: 'null' | 'nan' | 'null+nan' | 'true' | 'false' | 'empty';
  /** Text to display when matched */
  text: string;
  /** Optional color override */
  color?: string;
  /** Optional index for ordering */
  index?: number;
}

/** Union of all value mapping types */
export type ValueMapping =
  | ValueMappingValue
  | ValueMappingRange
  | ValueMappingRegex
  | ValueMappingSpecial;
