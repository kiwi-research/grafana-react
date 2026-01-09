/**
 * Row - Panel grouping component
 *
 * Rows create collapsible sections in the dashboard.
 *
 * @example
 * <Row title="CPU Metrics">
 *   <Stat title="CPU %" />
 *   <Timeseries title="CPU Over Time" />
 * </Row>
 */

import type { ReactNode } from 'react';
import { createComponent } from '../base.js';

export interface RowProps {
  /** Row title */
  title: string;
  /** Whether the row is collapsed by default */
  collapsed?: boolean;
  /** Padding on left side of row (grid units, 0-23) */
  paddingLeft?: number;
  /** Padding on right side of row (grid units, 0-23) */
  paddingRight?: number;
  /** Shorthand for equal padding on both sides */
  padding?: number;
  /** Row children (panels) */
  children?: ReactNode;
}

export const Row = createComponent<RowProps>('row');
