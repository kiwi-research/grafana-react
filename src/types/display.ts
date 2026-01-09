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

/** Color modes for panels */
export type ColorMode =
  | 'thresholds'
  | 'palette-classic'
  | 'palette-classic-by-name'
  | 'fixed'
  | 'continuous-GrYlRd';

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
