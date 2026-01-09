/**
 * Table panel - tabular data display
 *
 * Use for detailed data that needs sorting/filtering.
 *
 * @example
 * <Table title="Top Pods">
 *   <Query refId="cpu" format="table" instant>
 *     topk(10, sum by (pod) (rate(cpu_usage[$__rate_interval])))
 *   </Query>
 * </Table>
 *
 * @example
 * // With pagination and cell height
 * <Table
 *   title="Events"
 *   cellHeight="md"
 *   enablePagination
 *   frozenColumns={{ left: 1 }}
 * >
 *   <Query format="table" instant>events_total</Query>
 * </Table>
 */

import { createComponent } from '../../../base.js';
import type {
  BasePanelProps,
  Transformation,
  TableColumnOverride,
} from '../../../../types/panel-base.js';
import type { Unit, ThresholdSpec } from '../../../../types/display.js';
import type { TableCellHeight } from '../../../../types/common/index.js';

export interface TableProps extends BasePanelProps {
  /** Display unit for all columns */
  unit?: Unit;
  /** Decimal places */
  decimals?: number;
  /** Threshold configuration */
  thresholds?: ThresholdSpec;
  /** Base threshold color (default: 'green') */
  baseColor?: 'green' | 'transparent' | 'text' | string;
  /** Sort configuration */
  sortBy?: { field: string; desc?: boolean };
  /** Data transformations */
  transformations?: Transformation[];
  /** Column overrides */
  columnOverrides?: TableColumnOverride[];

  // New Grafana-aligned options

  /** Cell height size */
  cellHeight?: TableCellHeight;
  /** Enable table pagination */
  enablePagination?: boolean;
  /** Show table header row */
  showHeader?: boolean;
  /** Show type icons in column headers */
  showTypeIcons?: boolean;
  /** Freeze columns (prevent horizontal scroll) */
  frozenColumns?: { left?: number; right?: number };
  /** Maximum row height in pixels (0 = auto) */
  maxRowHeight?: number;
  /** Frame index to display (when multiple frames) */
  frameIndex?: number;
}

export const Table = createComponent<TableProps>('table');
