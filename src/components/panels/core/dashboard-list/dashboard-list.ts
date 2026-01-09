/**
 * Dashboard list panel - displays dashboard links
 *
 * Use for creating navigation to other dashboards.
 *
 * @example
 * <DashboardList
 *   title="Related Dashboards"
 *   showSearch
 *   tags={['production']}
 *   includeTimeRange
 * />
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface DashboardListProps extends BasePanelProps {
  /** Show starred dashboards */
  showStarred?: boolean;
  /** Show recently viewed */
  showRecentlyViewed?: boolean;
  /** Show search results */
  showSearch?: boolean;
  /** Search query */
  query?: string;
  /** Max items to show */
  maxItems?: number;
  /** Tags to filter by */
  tags?: string[];
  /** Folder to filter by */
  folderId?: number;
  /** Include current time range in links */
  includeTimeRange?: boolean;
  /** Include template variables in links */
  includeVars?: boolean;
}

export const DashboardList = createComponent<DashboardListProps>('dashlist');
