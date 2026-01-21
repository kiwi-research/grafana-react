/**
 * Base panel prop types shared across all panels
 */

import type { ReactNode } from 'react';
import type {
  ColorSeriesBy,
  ContinuousColorMode,
  FixedColorMode,
  PaletteColorMode,
  ThresholdSpec,
  Unit,
  ValueMapping,
} from './display.js';

export interface BasePanelProps {
  /** Panel title */
  title: string;
  /** Panel description */
  description?: string;
  /** Override datasource for this panel (defaults to dashboard datasource) */
  datasource?: string;
  /** Panel width in grid units (1-24) */
  width?: number;
  /** Panel height in grid units */
  height?: number;
  /** Left margin in grid units - adds empty space before the panel */
  marginLeft?: number;
  /** Variable to repeat panel for */
  repeat?: string;
  /** Repeat direction */
  repeatDirection?: 'v' | 'h';
  /** Panel children (queries or query strings) */
  children?: ReactNode;
  /**
   * Raw JSON to deep-merge into the panel output.
   * Use this escape hatch for Grafana features not yet supported by typed props,
   * or for custom Grafana fork extensions.
   *
   * @example
   * // Add custom color extension
   * extend={{ fieldConfig: { defaults: { color: { reverse: true } } } }}
   *
   * @example
   * // Add unsupported panel option
   * extend={{ options: { someNewOption: 'value' } }}
   */
  extend?: Record<string, unknown>;
}

/**
 * Field configuration props shared by panels that display field values.
 *
 * These map to Grafana's fieldConfig.defaults in the JSON output.
 * Includes standard options (unit, decimals, noValue), thresholds, and value mappings.
 */
export interface FieldConfigProps {
  /** Display unit */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** Threshold configuration */
  thresholds?: ThresholdSpec;
  /** Base threshold color (default: 'green') */
  baseColor?: 'green' | 'transparent' | 'text' | string;
  /** Value mappings to transform values to text/colors */
  valueMappings?: ValueMapping[];
  /** Value to show when no data */
  noValue?: string;
}

/** Base override properties shared across all color modes */
interface OverrideConfigBase {
  /** Match by query refId */
  refId?: string;
  /** Match by exact field name */
  fieldName?: string;
  /** Match by field name regex */
  fieldRegex?: string;
  /** Override display name */
  displayName?: string;
  /** Override thresholds */
  thresholds?: ThresholdSpec;
  /**
   * Raw properties to merge into this override.
   * Use for Grafana features not yet supported by typed props.
   *
   * @example
   * // Add reverse to a continuous color mode
   * { colorMode: "continuous-PuBl", extend: { color: { reverse: true } } }
   */
  extend?: Record<string, unknown>;
}

/** Override with fixed/shades color mode - requires color */
interface OverrideColorFixed extends OverrideConfigBase {
  /** Color mode that uses a fixed color value */
  colorMode: FixedColorMode;
  /** The color to use */
  color: string;
  seriesBy?: never;
}

/** Override with continuous color mode - supports seriesBy */
interface OverrideColorContinuous extends OverrideConfigBase {
  /** Continuous gradient color mode */
  colorMode: ContinuousColorMode;
  color?: never;
  /** Which value from the series determines the color position on the gradient */
  seriesBy?: ColorSeriesBy;
}

/** Override with palette/thresholds color mode - no additional config */
interface OverrideColorPalette extends OverrideConfigBase {
  /** Palette or thresholds color mode */
  colorMode: PaletteColorMode;
  color?: never;
  seriesBy?: never;
}

/** Override with just a color (implies fixed mode) */
interface OverrideColorImplicitFixed extends OverrideConfigBase {
  colorMode?: never;
  /** The color to use (implies colorMode: 'fixed') */
  color: string;
  seriesBy?: never;
}

/** Override without any color configuration */
interface OverrideNoColor extends OverrideConfigBase {
  colorMode?: never;
  color?: never;
  seriesBy?: never;
}

/**
 * Override configuration for field-specific styling.
 * Color properties form a discriminated union based on colorMode.
 */
export type OverrideConfig =
  | OverrideColorFixed
  | OverrideColorContinuous
  | OverrideColorPalette
  | OverrideColorImplicitFixed
  | OverrideNoColor;

/** Data link configuration for table cells */
export interface TableDataLink {
  /** Link title (shown on hover) */
  title?: string;
  /** URL template - supports ${__data.fields.fieldName} and ${__value.text} */
  url: string;
  /** Open in new tab */
  targetBlank?: boolean;
}

/** Table column override configuration */
export interface TableColumnOverride {
  /** Column name to match */
  name: string;
  /** Display unit */
  unit?: string;
  /** Column width in pixels */
  width?: number;
  /** Override display name for column header */
  displayName?: string;
  /** Data link for cell values */
  link?: TableDataLink;
  /** Number of decimal places */
  decimals?: number;
  /** Cell display mode */
  cellMode?:
    | 'auto'
    | 'color-text'
    | 'color-background'
    | 'gauge'
    | 'lcd-gauge'
    | 'basic-gauge';
  /** For gauge cellMode: display mode (basic=solid color, gradient=threshold gradient, lcd=segmented) */
  gaugeMode?: 'basic' | 'gradient' | 'lcd';
  /** For gauge mode: minimum value */
  min?: number;
  /** For gauge mode: maximum value */
  max?: number;
  /** Per-column thresholds (overrides table-level thresholds) */
  thresholds?: ThresholdSpec;
  /** Per-column value mappings (overrides table-level value mappings) */
  valueMappings?: ValueMapping[];
}

/** Transformation configuration */
export interface Transformation {
  /** Transformation type ID */
  id: string;
  /** Transformation options */
  options: Record<string, unknown>;
}

/** Utility props for field overrides */
export interface OverrideProps {
  /** Field matcher */
  match: { field?: string; regex?: string; refId?: string };
  /** Properties to override */
  properties: Record<string, unknown>;
  children?: ReactNode;
}
