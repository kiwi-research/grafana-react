/**
 * Annotation - Alert annotation markers
 *
 * Annotations display markers on panels when alerts fire.
 *
 * @example
 * <Annotation name="Alerts" color="light-red" title="{{alertname}}">
 *   ALERTS{alertstate="firing"}
 * </Annotation>
 */

import { createComponent } from '../base.js';

export interface AnnotationProps {
  /** Annotation name */
  name: string;
  /** Marker color */
  color?: string;
  /** Title format using {{label}} syntax */
  title?: string;
  /** Tag keys to include */
  tags?: string;
  /** Hide annotation from view */
  hide?: boolean;
  /** Enable annotation */
  enabled?: boolean;
  /** PromQL expression as child */
  children?: string;
}

export const Annotation = createComponent<AnnotationProps>('annotation');
