/**
 * Grafana JSON output types
 *
 * These types represent the final Grafana dashboard JSON structure.
 */

export interface GrafanaGridPos {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GrafanaTarget {
  refId: string;
  expr: string;
  legendFormat?: string;
  instant?: boolean;
  range?: boolean;
  format?: 'time_series' | 'table' | 'heatmap';
  hide?: boolean;
}

export interface GrafanaThreshold {
  value: number | null;
  color: string;
}

export interface GrafanaThresholds {
  mode: 'absolute' | 'percentage';
  steps: GrafanaThreshold[];
}

export interface GrafanaFieldConfig {
  defaults: {
    color?: { mode: string; fixedColor?: string };
    custom?: Record<string, unknown>;
    mappings?: unknown[];
    thresholds?: GrafanaThresholds;
    unit?: string;
    decimals?: number;
    min?: number;
    max?: number;
    noValue?: string;
  };
  overrides?: GrafanaOverride[];
}

export interface GrafanaOverride {
  matcher: { id: string; options: string };
  properties: Array<{ id: string; value: unknown }>;
}

export interface GrafanaPanel {
  id: number;
  type: string;
  title: string;
  description?: string;
  gridPos: GrafanaGridPos;
  datasource?: { uid: string; type?: string };
  targets?: GrafanaTarget[];
  fieldConfig?: GrafanaFieldConfig;
  options?: Record<string, unknown>;
  transformations?: unknown[];
  repeat?: string;
  repeatDirection?: 'v' | 'h';
  collapsed?: boolean;
  panels?: GrafanaPanel[];
  /** Plugin version (for plugin panels) */
  pluginVersion?: string;
}

export interface GrafanaVariable {
  name: string;
  type: 'query' | 'constant' | 'custom' | 'datasource' | 'textbox';
  label?: string;
  query?: string | { query: string; refId?: string; qryType?: number };
  definition?: string;
  current?: { text: string | string[]; value: string | string[] };
  options?: unknown[];
  multi?: boolean;
  includeAll?: boolean;
  allValue?: string;
  refresh?: number;
  sort?: number;
  hide?: number;
  regex?: string;
}

export interface GrafanaAnnotation {
  name: string;
  datasource: { uid: string; type?: string };
  enable: boolean;
  hide?: boolean;
  iconColor: string;
  expr?: string;
  titleFormat?: string;
  tagKeys?: string;
}

export interface GrafanaLink {
  title: string;
  url: string;
  type: 'link' | 'dashboards';
  icon?: string;
  tooltip?: string;
  keepTime?: boolean;
  includeVars?: boolean;
  targetBlank?: boolean;
  tags?: string[];
  asDropdown?: boolean;
}

export interface GrafanaDashboard {
  uid: string;
  title: string;
  tags?: string[];
  editable?: boolean;
  refresh?: string | false;
  time?: { from: string; to: string };
  timezone?: 'browser' | 'utc' | string;
  graphTooltip?: 0 | 1 | 2;
  panels: GrafanaPanel[];
  templating?: { list: GrafanaVariable[] };
  annotations?: { list: GrafanaAnnotation[] };
  links?: GrafanaLink[];
  schemaVersion?: number;
  fiscalYearStartMonth?: number;
}
