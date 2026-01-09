/**
 * Override - Field override for customizing specific series
 *
 * @example
 * <Timeseries title="Metrics">
 *   <Query>...</Query>
 *   <Override match={{ field: 'error' }} properties={{ color: 'red' }} />
 * </Timeseries>
 */

import type { ReactNode } from 'react';
import { createComponent } from '../base.js';

export interface OverrideProps {
  /** Field matcher */
  match: { field?: string; regex?: string; refId?: string };
  /** Properties to override */
  properties: Record<string, unknown>;
  children?: ReactNode;
}

export const Override = createComponent<OverrideProps>('override');
