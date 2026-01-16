/**
 * Timeseries panel - line/bar charts over time
 *
 * The primary visualization for time-based metrics.
 *
 * @example
 * <Timeseries
 *   title="Request Rate"
 *   unit="reqps"
 *   stack="normal"
 *   legend={{ placement: 'right', calcs: ['mean', 'max'] }}
 * >
 *   sum(rate(http_requests_total[$__rate_interval]))
 * </Timeseries>
 *
 * @example
 * // With axis and tooltip configuration
 * <Timeseries
 *   title="Latency"
 *   unit="ms"
 *   axisPlacement="left"
 *   axisLabel="Response Time"
 *   tooltip={{ mode: 'multi', sort: 'desc' }}
 *   showPoints="always"
 *   pointSize={4}
 * >
 *   histogram_quantile(0.99, rate(http_duration_bucket[$__rate_interval]))
 * </Timeseries>
 */

import { createComponent } from '../../../base.js';
import type {
  BasePanelProps,
  FieldConfigProps,
  OverrideConfig,
  Transformation,
} from '../../../../types/panel-base.js';
import type {
  ThresholdStyle,
  LegendConfig,
  LegendPlacement,
  ColorMode,
} from '../../../../types/display.js';
import type {
  VizTooltipOptions,
  TooltipDisplayMode,
  VisibilityMode,
  BarAlignment,
  LineStyleConfig,
  LineStyleFill,
  AxisPlacement,
  AxisColorMode,
  ScaleDistributionConfig,
  GraphGradientMode,
  LineInterpolation,
} from '../../../../types/common/index.js';

export interface TimeseriesProps extends BasePanelProps, FieldConfigProps {
  /** Minimum axis value */
  min?: number;
  /** Maximum axis value */
  max?: number;
  /** Soft minimum (can be exceeded by data) */
  softMin?: number;
  /** Soft maximum (can be exceeded by data) */
  softMax?: number;
  /** Threshold display style */
  thresholdStyle?: ThresholdStyle;
  /** Stacking mode */
  stack?: 'normal' | 'percent' | boolean;
  /** Fill opacity (0-100) */
  fill?: number;
  /** Gradient mode for fill area */
  gradientMode?: GraphGradientMode;
  /** Line width */
  lineWidth?: number;
  /** Drawing style */
  drawStyle?: 'line' | 'bars' | 'points';
  /** Line interpolation mode */
  lineInterpolation?: LineInterpolation;
  /** Center axis at zero */
  centerZero?: boolean;
  /** Legend configuration */
  legend?: LegendConfig | LegendPlacement;
  /** Color mode */
  colorMode?: ColorMode;
  /** Field overrides for query-specific styling */
  overrides?: OverrideConfig[];
  /** Data transformations */
  transformations?: Transformation[];

  // New Grafana-aligned options

  /** Tooltip configuration */
  tooltip?: VizTooltipOptions | TooltipDisplayMode;
  /** Show points on lines */
  showPoints?: VisibilityMode;
  /** Point size in pixels */
  pointSize?: number;
  /** Bar alignment relative to time point (when drawStyle is 'bars') */
  barAlignment?: BarAlignment;
  /** Maximum bar width in pixels */
  barMaxWidth?: number;
  /** Line style (solid, dash, dot, or custom config) */
  lineStyle?: LineStyleFill | LineStyleConfig;
  /** Connect null values (true, false, or threshold in ms) */
  spanNulls?: boolean | number;
  /** Axis placement */
  axisPlacement?: AxisPlacement;
  /** Axis label text */
  axisLabel?: string;
  /** Axis width in pixels */
  axisWidth?: number;
  /** Show axis grid lines */
  axisGridShow?: boolean;
  /** Show axis border */
  axisBorderShow?: boolean;
  /** Axis color mode */
  axisColorMode?: AxisColorMode;
  /** Scale distribution configuration */
  scaleDistribution?: ScaleDistributionConfig;
}

export const Timeseries = createComponent<TimeseriesProps>('timeseries');
