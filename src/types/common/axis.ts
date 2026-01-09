/**
 * Axis configuration types
 *
 * Types for configuring axes in graph panels.
 *
 * @see https://github.com/grafana/grafana/blob/main/packages/grafana-schema/src/common/common.gen.ts
 */

import type {
  AxisPlacement,
  AxisColorMode,
  ScaleDistributionType,
} from './enums.js';

/**
 * Scale distribution configuration
 *
 * Controls how values are distributed along an axis.
 *
 * @example
 * // Linear scale (default)
 * { type: 'linear' }
 *
 * @example
 * // Logarithmic scale base 10
 * { type: 'log', log: 10 }
 *
 * @example
 * // Symmetric log scale
 * { type: 'symlog', linearThreshold: 1 }
 */
export interface ScaleDistributionConfig {
  /** Scale type */
  type: ScaleDistributionType;
  /** Log base when type is 'log' (default: 2) */
  log?: number;
  /** Linear threshold for symlog scale */
  linearThreshold?: number;
}

/**
 * Axis configuration
 *
 * Common axis options used by graph panels (timeseries, barchart, etc.)
 *
 * @example
 * // Left axis with label
 * {
 *   axisPlacement: 'left',
 *   axisLabel: 'Requests/sec',
 *   axisWidth: 80
 * }
 *
 * @example
 * // Centered at zero with soft limits
 * {
 *   axisCenteredZero: true,
 *   axisSoftMin: -100,
 *   axisSoftMax: 100
 * }
 */
export interface AxisConfig {
  /** Axis placement relative to the graph */
  axisPlacement?: AxisPlacement;
  /** Axis label text */
  axisLabel?: string;
  /** Axis width in pixels */
  axisWidth?: number;
  /** Soft minimum (can be exceeded by data) */
  axisSoftMin?: number;
  /** Soft maximum (can be exceeded by data) */
  axisSoftMax?: number;
  /** Axis color mode */
  axisColorMode?: AxisColorMode;
  /** Show axis grid lines */
  axisGridShow?: boolean;
  /** Show axis border */
  axisBorderShow?: boolean;
  /** Center axis at zero */
  axisCenteredZero?: boolean;
  /** Scale distribution configuration */
  scaleDistribution?: ScaleDistributionConfig;
}
