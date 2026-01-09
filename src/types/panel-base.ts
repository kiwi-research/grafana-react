/**
 * Base panel prop types shared across all panels
 */

import type { ReactNode } from 'react';
import type { ThresholdSpec } from './display.js';

export interface BasePanelProps {
  /** Panel title */
  title: string;
  /** Panel description */
  description?: string;
  /** Override datasource for this panel (defaults to dashboard datasource) */
  datasource?: string;
  /** Panel width in grid units (1-24) */
  width?: number;
  /** Panel height in grid units */
  height?: number;
  /** X position (0-23) */
  x?: number;
  /** Y position */
  y?: number;
  /** Variable to repeat panel for */
  repeat?: string;
  /** Repeat direction */
  repeatDirection?: 'v' | 'h';
  /** Panel children (queries or query strings) */
  children?: ReactNode;
}

/** Override configuration for field-specific styling */
export interface OverrideConfig {
  /** Match by query refId */
  refId?: string;
  /** Match by exact field name */
  fieldName?: string;
  /** Match by field name regex */
  fieldRegex?: string;
  /** Fixed color */
  color?: string;
  /** Color mode (shades, fixed) */
  colorMode?: 'shades' | 'fixed';
  /** Override display name */
  displayName?: string;
  /** Override thresholds */
  thresholds?: ThresholdSpec;
}

/** Table column override configuration */
export interface TableColumnOverride {
  /** Column name to match */
  name: string;
  /** Display unit */
  unit?: string;
  /** Column width in pixels */
  width?: number;
}

/** Transformation configuration */
export interface Transformation {
  /** Transformation type ID */
  id: string;
  /** Transformation options */
  options: Record<string, unknown>;
}

/** Utility props for field overrides */
export interface OverrideProps {
  /** Field matcher */
  match: { field?: string; regex?: string; refId?: string };
  /** Properties to override */
  properties: Record<string, unknown>;
  children?: ReactNode;
}
