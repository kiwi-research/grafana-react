/**
 * Business Variable panel - dashboard variable display and interaction
 *
 * Use for displaying and interacting with dashboard variables in various layouts.
 *
 * @example
 * <BusinessVariablePanel
 *   title="Filters"
 *   displayMode="table"
 *   variable="instance"
 *   showAllOption
 * />
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

/** TreeView level configuration */
export interface TreeViewLevel {
  /** Variable name for this level */
  name: string;
}

/** Group/tab configuration for TreeView */
export interface VariableGroup {
  /** Group name */
  name: string;
  /** Variable to display in this group */
  variable: string;
  /** Allow multi-level selection */
  allowMultiLevelSelection?: boolean;
}

export interface BusinessVariablePanelProps extends Omit<
  BasePanelProps,
  'children'
> {
  /** Variable name to control (without $ prefix) */
  variable: string;
  /** Display mode layout */
  displayMode?: 'table' | 'minimize' | 'button' | 'slider';
  /** Toolbar mode for tabs/buttons display */
  toolbarMode?: 'tabs' | 'buttons';
  /** Show panel header */
  header?: boolean;
  /** Show variable label */
  showLabel?: boolean;
  /** Show variable name */
  showName?: boolean;
  /** Show reset button */
  showResetButton?: boolean;
  /** Enable filtering/search */
  filter?: boolean;
  /** Padding in pixels */
  padding?: number;
  /** Show "All" option */
  showAllOption?: boolean;
  /** Allow empty values */
  allowEmptyValue?: boolean;
  /** Allow custom values */
  allowCustomValue?: boolean;
  /** Enable sticky positioning */
  sticky?: boolean;
  /** Enable favorites functionality */
  favorites?: boolean;
  /** Store favorites in data source (requires Grafana 11.5+) */
  favoritesStorage?: 'browser' | 'datasource';
  /** Always show search (prevent hiding) */
  alwaysVisibleSearch?: boolean;
  /** Enable persistent mode (store in local storage) */
  persistent?: boolean;
  /** Show total and selected counts */
  showCounts?: boolean;
  /** TreeView levels configuration */
  treeViewLevels?: TreeViewLevel[];
  /** Groups/tabs configuration */
  groups?: VariableGroup[];
  /** Selected group ID for tab preservation across dashboards */
  selectedGroupId?: string;
  /** Enable status display from data source thresholds */
  showStatus?: boolean;
  /** Redirect to another dashboard on selection */
  redirectDashboard?: string;
  /** Latency request delay in milliseconds */
  latencyRequest?: number;
  /** Wrap values in TreeView */
  treeViewWrap?: boolean;
  /** Custom icon for minimized panel */
  minimizedIcon?: string;
  /** Additional options (passed directly to plugin) */
  options?: Record<string, unknown>;
}

export const BusinessVariablePanel =
  createComponent<BusinessVariablePanelProps>('business-variable');
