/**
 * Alert list panel - displays alert rules and states
 *
 * Use for showing current alert status.
 *
 * @example
 * <AlertList
 *   title="Active Alerts"
 *   viewMode="list"
 *   stateFilter={['alerting', 'pending']}
 *   sortOrder="importance"
 * />
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface AlertListProps extends BasePanelProps {
  /** View mode */
  viewMode?: 'list' | 'stat';
  /** Group by */
  groupBy?: string[];
  /** Max items */
  maxItems?: number;
  /** Sort order */
  sortOrder?: 'alpha' | 'importance' | 'time';
  /** State filter */
  stateFilter?: ('alerting' | 'pending' | 'nodata' | 'normal' | 'error')[];
  /** Alert name filter */
  alertNameFilter?: string;
  /** Dashboard filter - only show alerts from current dashboard */
  dashboardFilter?: boolean;
  /** Folder filter */
  folderId?: number;
}

export const AlertList = createComponent<AlertListProps>('alertlist');
