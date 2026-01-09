/**
 * Node graph panel - network/relationship visualization
 *
 * Use for visualizing node relationships and connections.
 *
 * @example
 * <NodeGraph title="Service Dependencies" layout="layered">
 *   service_topology
 * </NodeGraph>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface NodeGraphProps extends BasePanelProps {
  /** Layout algorithm */
  layout?: 'layered' | 'force' | 'grid';
  /** Zoom mode */
  zoomMode?: 'cooperative' | 'greedy';
}

export const NodeGraph = createComponent<NodeGraphProps>('nodeGraph');
