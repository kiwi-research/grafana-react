/**
 * Panel defaults configuration
 *
 * Defaults that can be applied across all panels in a dashboard or section.
 * Individual panel props always override these defaults.
 */

import type {
  ColorMode,
  ColorSeriesBy,
  LegendConfig,
  ThresholdStyle,
} from './display.js';

/**
 * Default field configuration options.
 * These map to Grafana's fieldConfig.defaults.
 */
export interface FieldDefaults {
  /** Default color mode for panels */
  colorMode?: ColorMode;
  /** Default axis border visibility */
  axisBorderShow?: boolean;
  /** Default axis color mode */
  axisColorMode?: 'text' | 'series';
  /** Default axis placement */
  axisPlacement?: 'auto' | 'left' | 'right' | 'hidden';
  /** Default axis grid visibility */
  axisGridShow?: boolean;
  /** Default line width */
  lineWidth?: number;
  /** Default fill opacity (0-100) */
  fill?: number;
  /** Default gradient mode */
  gradientMode?: 'none' | 'opacity' | 'hue' | 'scheme';
  /** Default point size */
  pointSize?: number;
  /** Default show points mode */
  showPoints?: 'auto' | 'always' | 'never';
  /** Default threshold display style */
  thresholdStyle?: ThresholdStyle;
  /** For continuous color modes, default value to use for color calculation */
  seriesBy?: ColorSeriesBy;
}

/**
 * Default panel options.
 * These map to Grafana's panel options.
 */
export interface PanelOptionDefaults {
  /** Default legend configuration */
  legend?: LegendConfig | false;
  /** Default tooltip mode */
  tooltipMode?: 'single' | 'multi' | 'none';
  /** Default tooltip sort order */
  tooltipSort?: 'none' | 'asc' | 'desc';
}

/**
 * Combined defaults for panels.
 * Can be set at Dashboard level or via Defaults component.
 */
export interface PanelDefaults extends FieldDefaults, PanelOptionDefaults {}

/**
 * Panel type names for per-panel-type defaults.
 */
export type PanelType =
  | 'stat'
  | 'timeseries'
  | 'table'
  | 'gauge'
  | 'bargauge'
  | 'barchart'
  | 'piechart'
  | 'histogram'
  | 'heatmap'
  | 'state-timeline'
  | 'status-history'
  | 'candlestick'
  | 'trend'
  | 'xychart'
  | 'logs'
  | 'text';

/**
 * Per-panel-type defaults.
 * Values can be set to override global defaults, or null to explicitly unset.
 */
export type PanelTypeDefaults = {
  [K in keyof PanelDefaults]?: PanelDefaults[K] | null;
};

/**
 * Extended defaults configuration with per-panel-type overrides.
 *
 * @example
 * ```json
 * {
 *   "colorMode": "palette-pastel",
 *   "axisBorderShow": true,
 *   "panels": {
 *     "stat": { "colorMode": null },
 *     "table": { "colorMode": null }
 *   }
 * }
 * ```
 */
export interface ExtendedPanelDefaults extends PanelDefaults {
  /** Per-panel-type default overrides. Use null to unset a global default. */
  panels?: Partial<Record<PanelType, PanelTypeDefaults>>;
}
