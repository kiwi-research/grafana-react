/**
 * Container - Layout grouping component
 *
 * Containers create a nested grid within a row. Elements inside
 * lay out left-to-right and wrap to the next row when they don't fit,
 * just like the main grid. The container's height is calculated from
 * its contents.
 *
 * @example Fixed width container
 * <Row title="Summary">
 *   <Container width={2}>
 *     <Stat height={2}>A</Stat>
 *     <Stat height={2}>B</Stat>
 *   </Container>
 *   <Stat width={3} height={4}>C</Stat>
 * </Row>
 *
 * @example Fill remaining width
 * <Row title="Summary">
 *   <Container width={2}>
 *     <Stat height={2}>A</Stat>
 *   </Container>
 *   <Container fill>
 *     <Stat width={6}>B</Stat>
 *     <Stat width={6}>C</Stat>
 *   </Container>
 * </Row>
 */

import type { ReactNode } from 'react';
import { createComponent } from '../base.js';

export interface ContainerProps {
  /** Fixed width in grid units (1-24). Mutually exclusive with fill. */
  width?: number;
  /** Fill remaining row width. Mutually exclusive with width. */
  fill?: boolean;
  /** Container children (panels) */
  children?: ReactNode;
}

export const Container = createComponent<ContainerProps>('container');
