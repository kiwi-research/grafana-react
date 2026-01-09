/**
 * Heatmap panel - color-coded matrix visualization
 *
 * Use for visualizing distributions over time (like latency buckets).
 *
 * @example
 * <Heatmap
 *   title="Request Latency Distribution"
 *   scheme="Blues"
 *   yAxisUnit="s"
 * >
 *   sum(rate(http_request_duration_seconds_bucket[$__rate_interval])) by (le)
 * </Heatmap>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type { Unit } from '../../../../types/display.js';

export interface HeatmapProps extends BasePanelProps {
  /** Color scheme */
  scheme?: 'Blues' | 'Greens' | 'Oranges' | 'Reds' | 'Purples' | 'Greys';
  /** Scale type */
  scale?: 'linear' | 'log';
  /** Y-axis unit */
  yAxisUnit?: Unit;
}

export const Heatmap = createComponent<HeatmapProps>('heatmap');
