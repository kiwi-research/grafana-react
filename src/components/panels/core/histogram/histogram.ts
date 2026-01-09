/**
 * Histogram panel - distribution visualization
 *
 * Use for showing data distribution patterns.
 *
 * @example
 * <Histogram
 *   title="Response Time Distribution"
 *   bucketCount={20}
 *   unit="ms"
 * >
 *   http_response_time_ms
 * </Histogram>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type {
  Unit,
  LegendConfig,
  LegendPlacement,
} from '../../../../types/display.js';

export interface HistogramProps extends BasePanelProps {
  /** Display unit */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** Number of buckets */
  bucketCount?: number;
  /** Bucket size (overrides bucketCount) */
  bucketSize?: number;
  /** Bucket offset */
  bucketOffset?: number;
  /** Combine series */
  combine?: boolean;
  /** Fill opacity (0-100) */
  fill?: number;
  /** Line width */
  lineWidth?: number;
  /** Legend configuration */
  legend?: LegendConfig | LegendPlacement;
  /** Gradient mode */
  gradientMode?: 'none' | 'opacity' | 'hue' | 'scheme';
}

export const Histogram = createComponent<HistogramProps>('histogram');
