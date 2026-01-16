/**
 * Dashboard - Root container for Grafana dashboards
 *
 * @example Basic dashboard
 * <Dashboard uid="my-dashboard" title="My Dashboard" tags={['tag1']}>
 *   <Variable name="instance" />
 *   <Row title="Summary">...</Row>
 * </Dashboard>
 *
 * @example With panel defaults
 * <Dashboard
 *   uid="my-dashboard"
 *   title="My Dashboard"
 *   defaults={{ colorMode: 'continuous-BlPu', axisBorderShow: true }}
 * >
 *   <Timeseries title="Panel 1" />
 * </Dashboard>
 */

import type { ReactNode } from 'react';
import type { PanelDefaults } from '../../types/defaults.js';
import { createComponent } from '../base.js';

export interface DashboardProps {
  /** Unique identifier for the dashboard */
  uid: string;
  /** Dashboard title */
  title: string;
  /** Dashboard tags for filtering */
  tags?: string[];
  /** Default datasource UID for all panels */
  datasource?: string;
  /** Datasource type (e.g., 'prometheus', 'victoriametrics-metrics-datasource'). Defaults to 'prometheus' */
  datasourceType?: string;
  /** Auto-refresh interval (e.g., '5s', '1m', 'auto') */
  refresh?: string | 'auto' | false;
  /** Default time range (e.g., '1h', '6h', '24h') */
  time?: string;
  /** Timezone setting */
  timezone?: 'browser' | 'utc';
  /** Tooltip sharing mode */
  tooltip?: 'shared' | 'single' | 'hidden';
  /**
   * Default panel configuration applied to all panels.
   * Individual panel props override these defaults.
   * Equivalent to wrapping children in `<Defaults {...defaults}>`
   */
  defaults?: PanelDefaults;
  /** Dashboard children */
  children?: ReactNode;
}

export const Dashboard = createComponent<DashboardProps>('dashboard');
