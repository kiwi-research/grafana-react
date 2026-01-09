/**
 * Base component utilities
 *
 * Provides the foundation for creating grafana-react components.
 * Components don't render to DOM - they create a virtual tree
 * that gets converted to Grafana JSON by the renderer.
 */

import type React from 'react';

/** Symbol used to identify component types */
export const COMPONENT_TYPE = Symbol('grafana-component-type');

/** All component types */
export type ComponentType =
  // Structure
  | 'dashboard'
  | 'row'
  | 'variable'
  | 'annotation'
  | 'link'
  // Query
  | 'query'
  | 'override'
  // Core panels
  | 'stat'
  | 'timeseries'
  | 'table'
  | 'bargauge'
  | 'heatmap'
  | 'gauge'
  | 'text'
  // Chart panels
  | 'barchart'
  | 'piechart'
  | 'histogram'
  | 'state-timeline'
  | 'status-history'
  | 'candlestick'
  | 'trend'
  | 'xychart'
  // Data display panels
  | 'logs'
  | 'datagrid'
  // Specialized panels
  | 'nodeGraph'
  | 'traces'
  | 'flamegraph'
  | 'canvas'
  | 'geomap'
  // Widget panels
  | 'dashlist'
  | 'alertlist'
  | 'annolist'
  | 'news'
  // Plugin panels
  | 'plugin'
  | 'business-variable';

/**
 * Create a grafana-react component with type marker
 *
 * Components created this way don't render anything - they just
 * carry their props and children for the renderer to process.
 */
export function createComponent<P extends object>(type: ComponentType) {
  const Component: React.FC<P> = () => null;
  (Component as unknown as { [COMPONENT_TYPE]: ComponentType })[
    COMPONENT_TYPE
  ] = type;
  Component.displayName = type.charAt(0).toUpperCase() + type.slice(1);
  return Component;
}

/**
 * Get the component type from a React element
 */
export function getComponentType(
  element: React.ReactElement,
): ComponentType | null {
  const type = element.type as unknown as { [COMPONENT_TYPE]?: ComponentType };
  return type?.[COMPONENT_TYPE] ?? null;
}
