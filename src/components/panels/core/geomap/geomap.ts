/**
 * Geomap panel - geographical map visualization
 *
 * Use for displaying data on a world map.
 *
 * @example
 * <Geomap title="Traffic by Region" baseLayer="carto-light" zoom={4}>
 *   geo_data
 * </Geomap>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface GeomapProps extends BasePanelProps {
  /** Initial view */
  view?: 'fit' | 'coords' | 'default';
  /** Initial zoom level */
  zoom?: number;
  /** Base layer type */
  baseLayer?: 'osm-standard' | 'esri-world' | 'carto-light' | 'carto-dark';
}

export const Geomap = createComponent<GeomapProps>('geomap');
