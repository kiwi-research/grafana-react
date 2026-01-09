/**
 * Utility functions for rendering
 */

import React from 'react';
import type {
  ThresholdSpec,
  ThresholdColor,
  LegendConfig,
  LegendPlacement,
  VariableSort,
  VizTooltipOptions,
  TooltipDisplayMode,
  ReduceDataOptions,
  LineStyleConfig,
  LineStyleFill,
  ScaleDistributionConfig,
} from '../types/index.js';
import type { GrafanaThreshold } from '../types/grafana-json.js';

/**
 * Get children from a React element as an array
 */
export function getChildren(element: React.ReactElement): React.ReactNode[] {
  const children = element.props?.children;
  if (!children) return [];
  return React.Children.toArray(children);
}

/**
 * Extract text content from React children
 */
export function extractTextContent(children: React.ReactNode): string {
  const texts: string[] = [];
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      texts.push(child);
    } else if (typeof child === 'number') {
      texts.push(String(child));
    }
  });
  return texts.join('').trim();
}

/**
 * Convert time shorthand to Grafana time range
 * '1h' -> { from: 'now-1h', to: 'now' }
 */
export function parseTimeRange(time: string): { from: string; to: string } {
  return { from: `now-${time}`, to: 'now' };
}

/**
 * Convert tooltip mode to Grafana graphTooltip value
 */
export function parseTooltip(
  tooltip: 'shared' | 'single' | 'hidden' | undefined,
): 0 | 1 | 2 {
  switch (tooltip) {
    case 'shared':
      return 2;
    case 'single':
      return 1;
    case 'hidden':
    default:
      return 0;
  }
}

/**
 * Convert hide option to Grafana variable hide value
 */
export function parseVariableHide(
  hide: boolean | 'label' | undefined,
): 0 | 1 | 2 {
  if (hide === true) return 2;
  if (hide === 'label') return 1;
  return 0;
}

/**
 * Convert sort option to Grafana variable sort value
 */
export function parseVariableSort(sort: VariableSort | undefined): number {
  switch (sort) {
    case 'alpha':
      return 1;
    case 'alpha-desc':
      return 2;
    case 'num':
      return 3;
    case 'num-desc':
      return 4;
    case 'alpha-ci':
      return 5;
    case 'alpha-ci-desc':
      return 6;
    case 'disabled':
    default:
      return 0;
  }
}

/**
 * Normalize color name to Grafana color value
 */
export function normalizeColor(color: ThresholdColor | string): string {
  const colorMap: Record<string, string> = {
    yellow: '#EAB839',
    y: '#EAB839',
    green: 'green',
    g: 'green',
    red: 'red',
    r: 'red',
    orange: 'orange',
    o: 'orange',
    blue: 'blue',
    b: 'blue',
    transparent: 'transparent',
    t: 'transparent',
    text: 'text',
  };
  return colorMap[color] ?? color;
}

/**
 * Convert threshold specification to Grafana threshold format
 * @param spec Threshold specification
 * @param baseColor Base color for the first threshold step (default: 'green')
 */
export function normalizeThresholds(
  spec: ThresholdSpec | undefined,
  baseColor: string = 'green',
): GrafanaThreshold[] {
  const normalizedBase = normalizeColor(baseColor);

  if (!spec) {
    return [{ value: null, color: normalizedBase }];
  }

  // Handle object format: { 70: 'yellow', 90: 'red' }
  if (!Array.isArray(spec) && typeof spec === 'object') {
    const thresholds: GrafanaThreshold[] = [
      { value: null, color: normalizedBase },
    ];
    const entries = Object.entries(spec)
      .map(([k, v]) => [Number(k), v] as [number, string])
      .sort((a, b) => a[0] - b[0]);

    for (const [value, color] of entries) {
      thresholds.push({ value, color: normalizeColor(color) });
    }
    return thresholds;
  }

  // Handle array format: [[70, 'yellow'], [90, 'red']]
  if (Array.isArray(spec)) {
    const thresholds: GrafanaThreshold[] = [
      { value: null, color: normalizedBase },
    ];
    for (const item of spec as [number, ThresholdColor][]) {
      thresholds.push({ value: item[0], color: normalizeColor(item[1]) });
    }
    return thresholds;
  }

  return [{ value: null, color: normalizedBase }];
}

/**
 * Normalize legend configuration
 */
export function normalizeLegend(
  legend: LegendConfig | LegendPlacement | undefined,
): LegendConfig {
  if (!legend) {
    return { placement: 'bottom', displayMode: 'list', calcs: [] };
  }
  if (typeof legend === 'string') {
    return { placement: legend, displayMode: 'table', calcs: ['mean', 'max'] };
  }
  return {
    placement: legend.placement ?? 'bottom',
    displayMode: legend.displayMode ?? 'table',
    calcs: legend.calcs ?? [],
    sortBy: legend.sortBy,
    sortDesc: legend.sortDesc,
  };
}

/**
 * Generate next reference ID (A, B, C, ... Z, AA, AB, ...)
 */
export function nextRefId(counter: number): string {
  if (counter < 26) {
    return String.fromCharCode(65 + counter);
  }
  const first = Math.floor(counter / 26) - 1;
  const second = counter % 26;
  return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
}

/**
 * Normalize tooltip configuration
 * Accepts either a TooltipDisplayMode string or full VizTooltipOptions object
 */
export function normalizeTooltip(
  tooltip: VizTooltipOptions | TooltipDisplayMode | undefined,
): VizTooltipOptions {
  if (!tooltip) {
    return { mode: 'multi', sort: 'none' };
  }
  if (typeof tooltip === 'string') {
    return { mode: tooltip, sort: 'none' };
  }
  return {
    mode: tooltip.mode ?? 'multi',
    sort: tooltip.sort ?? 'none',
    maxHeight: tooltip.maxHeight,
    maxWidth: tooltip.maxWidth,
  };
}

/**
 * Normalize reduce options for single-stat style panels
 */
export function normalizeReduceOptions(
  options: ReduceDataOptions | undefined,
): ReduceDataOptions {
  if (!options) {
    // Grafana default is empty calcs array
    return { calcs: [], fields: '', values: false };
  }
  return {
    calcs: options.calcs ?? [],
    fields: options.fields ?? '',
    values: options.values ?? false,
    limit: options.limit,
  };
}

/**
 * Normalize line style configuration
 * Accepts either a LineStyleFill string or full LineStyleConfig object
 */
export function normalizeLineStyle(
  style: LineStyleFill | LineStyleConfig | undefined,
): LineStyleConfig | undefined {
  if (!style) {
    return undefined;
  }
  if (typeof style === 'string') {
    return { fill: style };
  }
  return {
    fill: style.fill,
    dash: style.dash,
  };
}

/**
 * Normalize scale distribution configuration
 */
export function normalizeScaleDistribution(
  config: ScaleDistributionConfig | undefined,
): ScaleDistributionConfig {
  if (!config) {
    return { type: 'linear' };
  }
  return {
    type: config.type ?? 'linear',
    log: config.log,
    linearThreshold: config.linearThreshold,
  };
}
