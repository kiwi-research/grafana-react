/**
 * Bar chart panel - categorical bar charts
 *
 * Use for comparing discrete categories.
 *
 * @example
 * <BarChart
 *   title="Requests by Endpoint"
 *   orientation="horizontal"
 *   stack="normal"
 * >
 *   sum by (endpoint) (http_requests_total)
 * </BarChart>
 */

import { createComponent } from '../../../base.js';
import type {
  BasePanelProps,
  OverrideConfig,
} from '../../../../types/panel-base.js';
import type {
  Unit,
  ThresholdSpec,
  LegendConfig,
  LegendPlacement,
  ColorMode,
} from '../../../../types/display.js';

export interface BarChartProps extends BasePanelProps {
  /** Display unit */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** Threshold configuration */
  thresholds?: ThresholdSpec;
  /** X Axis field */
  xField?: string;
  /** Orientation */
  orientation?: 'auto' | 'horizontal' | 'vertical';
  /** Stacking mode */
  stack?: 'off' | 'normal' | 'percent';
  /** Show values on bars */
  showValue?: 'auto' | 'always' | 'never';
  /** Bar width percentage (0-1) */
  barWidth?: number;
  /** Group width percentage (0-1) */
  groupWidth?: number;
  /** Fill opacity (0-100) */
  fill?: number;
  /** Gradient mode for bars */
  gradientMode?: 'none' | 'opacity' | 'hue' | 'scheme';
  /** Legend configuration */
  legend?: LegendConfig | LegendPlacement;
  /** Color mode */
  colorMode?: ColorMode;
  /** Field overrides */
  overrides?: OverrideConfig[];
}

export const BarChart = createComponent<BarChartProps>('barchart');
