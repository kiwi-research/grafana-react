/**
 * Pie chart panel - pie/donut charts
 *
 * Use for showing parts of a whole.
 *
 * @example
 * <PieChart
 *   title="Traffic by Service"
 *   pieType="donut"
 *   labels={['name', 'percent']}
 * >
 *   sum by (service) (http_requests_total)
 * </PieChart>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type {
  Unit,
  LegendConfig,
  LegendPlacement,
  ColorMode,
} from '../../../../types/display.js';

export interface PieChartProps extends BasePanelProps {
  /** Display unit */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** Pie chart type */
  pieType?: 'pie' | 'donut';
  /** Show legend */
  legend?: LegendConfig | LegendPlacement | false;
  /** Labels to show */
  labels?: ('name' | 'value' | 'percent')[];
  /** Color mode */
  colorMode?: ColorMode;
  /** Reduce calculation */
  reduceCalc?: 'lastNotNull' | 'mean' | 'sum' | 'max' | 'min';
}

export const PieChart = createComponent<PieChartProps>('piechart');
