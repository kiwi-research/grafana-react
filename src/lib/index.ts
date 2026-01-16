/**
 * Library exports
 */

export { render, renderToString, type RenderOptions } from './renderer.js';

export {
  getChildren,
  extractTextContent,
  parseTimeRange,
  parseTooltip,
  parseVariableHide,
  parseVariableSort,
  normalizeColor,
  normalizeThresholds,
  normalizeLegend,
  nextRefId,
} from './utils.js';
