/**
 * Variable - Dashboard template variable
 *
 * Variables allow users to filter dashboard data dynamically.
 *
 * @example
 * <Variable name="instance" label="Instance" multi>
 *   label_values(up, instance)
 * </Variable>
 */

import { createComponent } from '../base.js';
import type { VariableSort } from '../../types/display.js';

export interface VariableProps {
  /** Variable name (used in queries as $name) */
  name: string;
  /** Display label */
  label?: string;
  /** Query expression (alternative to children) */
  query?: string;
  /** Allow multiple selections */
  multi?: boolean;
  /** Include "All" option */
  includeAll?: boolean;
  /** Custom value for "All" option */
  allValue?: string;
  /** Hide variable from UI (true = hide completely, 'label' = hide label only) */
  hide?: boolean | 'label';
  /** Sort order for values */
  sort?: VariableSort;
  /** Query expression as child */
  children?: string;
}

export const Variable = createComponent<VariableProps>('variable');
