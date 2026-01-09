/**
 * Trend panel - sparkline-style trend visualization
 *
 * Use for showing trends without time axis.
 *
 * @example
 * <Trend
 *   title="Performance Trend"
 *   drawStyle="line"
 *   fill={20}
 * >
 *   performance_score
 * </Trend>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type {
  Unit,
  LegendConfig,
  LegendPlacement,
  ColorMode,
} from '../../../../types/display.js';

export interface TrendProps extends BasePanelProps {
  /** Display unit */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** X field (numeric, increasing values) */
  xField?: string;
  /** Drawing style */
  drawStyle?: 'line' | 'bars' | 'points';
  /** Line interpolation */
  lineInterpolation?: 'linear' | 'smooth' | 'stepBefore' | 'stepAfter';
  /** Line width */
  lineWidth?: number;
  /** Fill opacity (0-100) */
  fill?: number;
  /** Gradient mode for fill area */
  gradientMode?: 'none' | 'opacity' | 'hue' | 'scheme';
  /** Legend configuration */
  legend?: LegendConfig | LegendPlacement;
  /** Color mode */
  colorMode?: ColorMode;
}

export const Trend = createComponent<TrendProps>('trend');
