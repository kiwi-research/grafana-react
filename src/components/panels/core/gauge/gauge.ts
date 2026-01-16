/**
 * Gauge panel - circular gauge with thresholds
 *
 * Use for showing a single value against a range.
 *
 * @example
 * <Gauge
 *   title="CPU Load"
 *   unit="percent"
 *   min={0}
 *   max={100}
 *   thresholds={{ 70: 'yellow', 90: 'red' }}
 * >
 *   avg(system_load1)
 * </Gauge>
 *
 * @example
 * // With threshold labels and custom sizing
 * <Gauge
 *   title="Memory"
 *   unit="percent"
 *   showThresholdLabels
 *   minVizWidth={100}
 *   minVizHeight={100}
 * >
 *   avg(memory_usage_percent)
 * </Gauge>
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
  ReduceDataOptions,
  TextFormattingOptions,
} from '../../../../types/common/index.js';

export interface GaugeProps extends BasePanelProps, FieldConfigProps {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Show threshold labels on gauge */
  showThresholdLabels?: boolean;
  /** Show threshold markers on gauge */
  showThresholdMarkers?: boolean;
  /** Field overrides for series-specific styling */
  overrides?: OverrideConfig[];
  /** Data transformations */
  transformations?: Transformation[];

  // New Grafana-aligned options

  /** Minimum visualization width in pixels */
  minVizWidth?: number;
  /** Minimum visualization height in pixels */
  minVizHeight?: number;
  /** Sizing mode */
  sizing?: BarGaugeSizing;
  /** Visualization orientation */
  orientation?: VizOrientation;
  /** Data reduction options (advanced) */
  reduceOptions?: ReduceDataOptions;
  /** Text formatting options */
  text?: TextFormattingOptions;
}

export const Gauge = createComponent<GaugeProps>('gauge');
