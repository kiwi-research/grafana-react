/**
 * Bar gauge panel - horizontal/vertical progress bars
 *
 * Use for showing progress towards a goal or threshold.
 *
 * @example
 * <BarGauge
 *   title="Memory Usage"
 *   unit="percent"
 *   min={0}
 *   max={100}
 *   thresholds={{ 70: 'yellow', 90: 'red' }}
 * >
 *   avg(memory_usage_percent)
 * </BarGauge>
 *
 * @example
 * // LCD-style display with name placement
 * <BarGauge
 *   title="Disk Usage"
 *   displayMode="lcd"
 *   orientation="horizontal"
 *   namePlacement="left"
 *   showUnfilled
 * >
 *   disk_used_percent
 * </BarGauge>
 */

import { createComponent } from '../../../base.js';
import type {
  BasePanelProps,
  FieldConfigProps,
  OverrideConfig,
  Transformation,
} from '../../../../types/panel-base.js';
import type {
  VizOrientation,
  BarGaugeSizing,
  BarGaugeDisplayMode,
  BarGaugeValueMode,
  BarGaugeNamePlacement,
  ReduceDataOptions,
  TextFormattingOptions,
} from '../../../../types/common/index.js';

export interface BarGaugeProps extends BasePanelProps, FieldConfigProps {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Bar orientation */
  orientation?: VizOrientation | 'horizontal' | 'vertical';
  /** Display mode (basic, gradient, or lcd) */
  displayMode?: BarGaugeDisplayMode;
  /** Field overrides for series-specific styling */
  overrides?: OverrideConfig[];
  /** Data transformations */
  transformations?: Transformation[];

  // New Grafana-aligned options

  /** Show unfilled portion of bar */
  showUnfilled?: boolean;
  /** Minimum visualization width in pixels */
  minVizWidth?: number;
  /** Minimum visualization height in pixels */
  minVizHeight?: number;
  /** Sizing mode */
  sizing?: BarGaugeSizing;
  /** Value display mode */
  valueMode?: BarGaugeValueMode;
  /** Name/label placement */
  namePlacement?: BarGaugeNamePlacement;
  /** Data reduction options (advanced) */
  reduceOptions?: ReduceDataOptions;
  /** Text formatting options */
  text?: TextFormattingOptions;
}

export const BarGauge = createComponent<BarGaugeProps>('bargauge');
