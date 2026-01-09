/**
 * Stat panel - single value display with optional sparkline
 *
 * Use for displaying key metrics at a glance.
 *
 * @example
 * <Stat title="CPU %" unit="percent" thresholds={{ 70: 'yellow', 90: 'red' }}>
 *   100 - avg(rate(cpu_idle[$__rate_interval])) * 100
 * </Stat>
 *
 * @example
 * // With percent change indicator
 * <Stat title="Orders" showPercentChange percentChangeColorMode="inverted">
 *   sum(orders_total)
 * </Stat>
 */

import { createComponent } from '../../../base.js';
import type {
  BasePanelProps,
  OverrideConfig,
  Transformation,
} from '../../../../types/panel-base.js';
import type { Unit, ThresholdSpec } from '../../../../types/display.js';
import type {
  VizOrientation,
  BigValueJustifyMode,
  PercentChangeColorMode,
  ReduceDataOptions,
} from '../../../../types/common/index.js';

export interface StatProps extends BasePanelProps {
  /** Display unit */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** Threshold configuration */
  thresholds?: ThresholdSpec;
  /** Base threshold color (default: 'green') */
  baseColor?: 'green' | 'transparent' | 'text' | string;
  /** Color mode for stat value */
  colorMode?: 'value' | 'background' | 'background_solid' | 'none';
  /** Show sparkline graph */
  graphMode?: 'area' | 'line' | 'none';
  /** Text display mode */
  textMode?: 'value' | 'name' | 'value_and_name' | 'none' | 'auto';
  /** Value to show when no data */
  noValue?: string;
  /** Field overrides for series-specific styling */
  overrides?: OverrideConfig[];
  /** Data transformations */
  transformations?: Transformation[];

  // New Grafana-aligned options

  /** Text alignment within the panel */
  justifyMode?: BigValueJustifyMode;
  /** Show percent change from previous value */
  showPercentChange?: boolean;
  /** Color mode for percent change indicator */
  percentChangeColorMode?: PercentChangeColorMode;
  /** Use wide layout (values side by side) */
  wideLayout?: boolean;
  /** Visualization orientation */
  orientation?: VizOrientation;
  /** Data reduction options (advanced) */
  reduceOptions?: ReduceDataOptions;
}

export const Stat = createComponent<StatProps>('stat');
