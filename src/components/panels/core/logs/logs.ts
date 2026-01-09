/**
 * Logs panel - log message display
 *
 * Use for displaying and filtering log entries.
 *
 * @example
 * <Logs
 *   title="Application Logs"
 *   showTime
 *   showLabels
 *   wrapLines
 * >
 *   {job="app"}
 * </Logs>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';

export interface LogsProps extends BasePanelProps {
  /** Show timestamps */
  showTime?: boolean;
  /** Show unique labels */
  showLabels?: boolean;
  /** Wrap lines */
  wrapLines?: boolean;
  /** Prettify JSON */
  prettifyLogMessage?: boolean;
  /** Enable log details */
  enableLogDetails?: boolean;
  /** Sort order */
  sortOrder?: 'Ascending' | 'Descending';
  /** Deduplication mode */
  dedupStrategy?: 'none' | 'exact' | 'numbers' | 'signature';
}

export const Logs = createComponent<LogsProps>('logs');
