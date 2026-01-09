/**
 * PluginPanel - Generic wrapper for arbitrary Grafana plugins
 *
 * Use this when you need to use a plugin that doesn't have
 * a dedicated component in this library.
 *
 * @example
 * <PluginPanel
 *   title="Custom Plugin"
 *   type="my-custom-plugin"
 *   width={6}
 *   height={4}
 *   options={{ customOption: true }}
 * />
 */

import { createComponent } from '../base.js';
import type { BasePanelProps } from '../../types/panel-base.js';

export interface PluginPanelProps extends BasePanelProps {
  /** Plugin type identifier (e.g., 'volkovlabs-variable-panel') */
  type: string;
  /** Plugin-specific options */
  options?: Record<string, unknown>;
  /** Plugin version */
  pluginVersion?: string;
}

export const PluginPanel = createComponent<PluginPanelProps>('plugin');
