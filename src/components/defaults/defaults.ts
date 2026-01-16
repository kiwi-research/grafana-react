/**
 * Defaults - Set default panel configuration for child panels
 *
 * Use this component to apply consistent defaults to all panels within its scope.
 * Defaults can be nested - inner defaults merge with and override outer defaults.
 *
 * @example Set defaults for all panels in a section
 * <Defaults colorMode="continuous-BlPu" axisBorderShow={true}>
 *   <Timeseries title="Panel 1" />
 *   <Timeseries title="Panel 2" colorMode="fixed" color="red" />
 * </Defaults>
 *
 * @example Nested defaults
 * <Defaults colorMode="palette-classic">
 *   <Timeseries title="Uses palette-classic" />
 *   <Defaults axisBorderShow={true}>
 *     <Timeseries title="Uses palette-classic AND axisBorderShow" />
 *   </Defaults>
 * </Defaults>
 */

import type { ReactNode } from 'react';
import type { PanelDefaults } from '../../types/defaults.js';
import { createComponent } from '../base.js';

export interface DefaultsProps extends PanelDefaults {
  /** Child components that will inherit these defaults */
  children?: ReactNode;
}

export const Defaults = createComponent<DefaultsProps>('defaults');
