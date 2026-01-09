/**
 * Annotations list panel - displays annotations
 *
 * Use for showing dashboard annotations.
 *
 * @example
 * <AnnotationsList
 *   title="Recent Annotations"
 *   onlyFromThisDashboard
 *   showUser
 *   showTime
 * />
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface AnnotationsListProps extends BasePanelProps {
  /** Query filter: all dashboards or this dashboard only */
  onlyFromThisDashboard?: boolean;
  /** Time range filter: use dashboard time range or none */
  onlyInTimeRange?: boolean;
  /** Tags to filter by */
  tags?: string[];
  /** Max items */
  limit?: number;
  /** Show user who created annotation */
  showUser?: boolean;
  /** Show time of annotation */
  showTime?: boolean;
  /** Show tags on annotation */
  showTags?: boolean;
}

export const AnnotationsList =
  createComponent<AnnotationsListProps>('annolist');
