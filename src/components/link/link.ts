/**
 * Link - Dashboard navigation link
 *
 * Links appear in the dashboard header for navigation.
 *
 * @example
 * <Link title="Docs" url="https://..." icon="external" />
 */

import { createComponent } from '../base.js';

export interface LinkProps {
  /** Link title */
  title: string;
  /** Link URL */
  url: string;
  /** Icon type */
  icon?: 'dashboard' | 'external' | 'doc';
  /** Tooltip text */
  tooltip?: string;
  /** Preserve current time range */
  keepTime?: boolean;
  /** Include dashboard variables */
  includeVars?: boolean;
  /** Open in new tab */
  newTab?: boolean;
}

export const Link = createComponent<LinkProps>('link');
