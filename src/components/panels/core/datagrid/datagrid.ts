/**
 * Datagrid panel - editable data grid
 *
 * Use for displaying and editing tabular data.
 *
 * @example
 * <Datagrid title="Editable Data" selectedSeries={0}>
 *   data_query
 * </Datagrid>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface DatagridProps extends BasePanelProps {
  /** Selected series index */
  selectedSeries?: number;
}

export const Datagrid = createComponent<DatagridProps>('datagrid');
