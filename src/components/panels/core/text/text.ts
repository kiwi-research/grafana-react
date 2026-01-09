/**
 * Text panel - markdown/HTML content display
 *
 * Use for documentation, instructions, or static content.
 *
 * @example
 * <Text title="Instructions" mode="markdown" content="## Welcome\n\nThis dashboard shows..." />
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface TextProps extends BasePanelProps {
  /** Text content mode */
  mode?: 'markdown' | 'html' | 'code';
  /** Text content */
  content?: string;
}

export const Text = createComponent<TextProps>('text');
