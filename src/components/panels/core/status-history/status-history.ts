/**
 * Status history panel - grid of status values over time
 *
 * Use for showing status patterns across multiple series.
 *
 * @example
 * <StatusHistory
 *   title="Node Health"
 *   showValue="always"
 *   thresholds={{ 0: 'red', 1: 'green' }}
 * >
 *   up{job="node"}
 * </StatusHistory>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type {
  ThresholdSpec,
  LegendConfig,
  LegendPlacement,
  ColorMode,
} from '../../../../types/display.js';

export interface StatusHistoryProps extends BasePanelProps {
  /** Show values */
  showValue?: 'auto' | 'always' | 'never';
  /** Row height (0-1) */
  rowHeight?: number;
  /** Column width (0-1) */
  colWidth?: number;
  /** Line width */
  lineWidth?: number;
  /** Fill opacity (0-100) */
  fill?: number;
  /** Legend configuration */
  legend?: LegendConfig | LegendPlacement;
  /** Color mode */
  colorMode?: ColorMode;
  /** Threshold configuration for state colors */
  thresholds?: ThresholdSpec;
}

export const StatusHistory =
  createComponent<StatusHistoryProps>('status-history');
