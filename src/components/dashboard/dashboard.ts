/**
 * Dashboard - Root container for Grafana dashboards
 *
 * @example
 * <Dashboard uid="my-dashboard" title="My Dashboard" tags={['tag1']}>
 *   <Variable name="instance" />
 *   <Row title="Summary">...</Row>
 * </Dashboard>
 */

import type { ReactNode } from 'react';
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
  /** Dashboard children */
  children?: ReactNode;
}

export const Dashboard = createComponent<DashboardProps>('dashboard');
