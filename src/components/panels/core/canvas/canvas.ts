/**
 * Canvas panel - custom visual layouts
 *
 * Use for creating custom visualizations with draggable elements.
 *
 * @example
 * <Canvas title="Custom Layout" inlineEditing panZoom>
 *   data_query
 * </Canvas>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface CanvasProps extends BasePanelProps {
  /** Inline editing enabled */
  inlineEditing?: boolean;
  /** Pan and zoom enabled */
  panZoom?: boolean;
}

export const Canvas = createComponent<CanvasProps>('canvas');
