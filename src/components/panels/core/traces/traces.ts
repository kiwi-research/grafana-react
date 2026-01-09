/**
 * Traces panel - distributed tracing visualization
 *
 * Use for displaying trace data from Jaeger, Tempo, etc.
 *
 * @example
 * <Traces title="Request Traces" spanNameFilter="api-*">
 *   trace_data
 * </Traces>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface TracesProps extends BasePanelProps {
  /** Span name filter */
  spanNameFilter?: string;
  /** Service name filter */
  serviceNameFilter?: string;
}

export const Traces = createComponent<TracesProps>('traces');
