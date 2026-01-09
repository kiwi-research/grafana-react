/**
 * Query - Panel query target
 *
 * Use this when you need multiple queries with different legends,
 * formats, or other settings. For single queries, you can just
 * pass the expression as a string child of the panel.
 *
 * @example
 * <Timeseries title="CPU">
 *   <Query refId="user" legend="User" color="blue">
 *     sum(rate(cpu_user[$__rate_interval]))
 *   </Query>
 *   <Query refId="system" legend="System" color="red">
 *     sum(rate(cpu_system[$__rate_interval]))
 *   </Query>
 * </Timeseries>
 */

import type { ReactNode } from 'react';
import { createComponent } from '../base.js';

export interface QueryProps {
  /** Query reference ID (auto-generated if not provided) */
  refId?: string;
  /** Legend format string */
  legend?: string;
  /** Use instant query (point-in-time) */
  instant?: boolean;
  /** Query format */
  format?: 'time_series' | 'table' | 'heatmap';
  /** Hide query from visualization */
  hide?: boolean;
  /** PromQL expression as child */
  children?: ReactNode;
}

export const Query = createComponent<QueryProps>('query');
