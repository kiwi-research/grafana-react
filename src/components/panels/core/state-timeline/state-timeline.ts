/**
 * State timeline panel - state changes over time
 *
 * Use for visualizing discrete state transitions.
 *
 * @example
 * <StateTimeline
 *   title="Pod Status"
 *   showValue="always"
 *   thresholds={{ 0: 'red', 1: 'green' }}
 * >
 *   kube_pod_status_ready
 * </StateTimeline>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type {
  ThresholdSpec,
  LegendConfig,
  LegendPlacement,
  ColorMode,
} from '../../../../types/display.js';

export interface StateTimelineProps extends BasePanelProps {
  /** Merge consecutive equal values */
  mergeValues?: boolean;
  /** Show values */
  showValue?: 'auto' | 'always' | 'never';
  /** Align values */
  alignValue?: 'left' | 'center' | 'right';
  /** Row height (0-1) */
  rowHeight?: number;
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

export const StateTimeline =
  createComponent<StateTimelineProps>('state-timeline');
