/**
 * Flame graph panel - profiling visualization
 *
 * Use for displaying CPU/memory profiling data.
 *
 * @example
 * <FlameGraph title="CPU Profile" displayMode="flamegraph">
 *   profile_data
 * </FlameGraph>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface FlameGraphProps extends BasePanelProps {
  /** Display mode */
  displayMode?: 'flamegraph' | 'table' | 'both';
}

export const FlameGraph = createComponent<FlameGraphProps>('flamegraph');
