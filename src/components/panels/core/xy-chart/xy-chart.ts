/**
 * XY chart panel - scatter plots and bubble charts
 *
 * Use for showing relationships between two variables.
 *
 * @example
 * <XYChart
 *   title="CPU vs Memory"
 *   xField="cpu_usage"
 *   yField="memory_usage"
 *   show="points"
 * >
 *   system_resources
 * </XYChart>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type {
  Unit,
  LegendConfig,
  LegendPlacement,
  ColorMode,
} from '../../../../types/display.js';

export interface XYChartProps extends BasePanelProps {
  /** Display unit */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** X field */
  xField?: string;
  /** Y field */
  yField?: string;
  /** Size field (for bubble charts) */
  sizeField?: string;
  /** Color field */
  colorField?: string;
  /** Show mode */
  show?: 'points' | 'lines' | 'points+lines';
  /** Point size */
  pointSize?: number;
  /** Line width */
  lineWidth?: number;
  /** Fill opacity (0-100) */
  fill?: number;
  /** Legend configuration */
  legend?: LegendConfig | LegendPlacement;
  /** Color mode */
  colorMode?: ColorMode;
}

export const XYChart = createComponent<XYChartProps>('xychart');
