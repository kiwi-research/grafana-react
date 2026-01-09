/**
 * News panel - RSS/Atom feed display
 *
 * Use for displaying news feeds on dashboards.
 *
 * @example
 * <News
 *   title="Latest News"
 *   feedUrl="https://grafana.com/blog/index.xml"
 *   showImage
 * />
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface NewsProps extends BasePanelProps {
  /** RSS/Atom feed URL */
  feedUrl?: string;
  /** Show images */
  showImage?: boolean;
}

export const News = createComponent<NewsProps>('news');
