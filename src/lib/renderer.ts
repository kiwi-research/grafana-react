/**
 * Grafana React Renderer
 *
 * Converts a React element tree to Grafana dashboard JSON.
 */

import React from 'react';
import {
  getComponentType,
  type DashboardProps,
  type RowProps,
  type ContainerProps,
  type DefaultsProps,
  type VariableProps,
  type AnnotationProps,
  type LinkProps,
  type QueryProps,
  type StatProps,
  type TimeseriesProps,
  type BarGaugeProps,
  type HeatmapProps,
  type GaugeProps,
  type TableProps,
  type TextProps,
  // Chart panels
  type BarChartProps,
  type PieChartProps,
  type HistogramProps,
  type StateTimelineProps,
  type StatusHistoryProps,
  type CandlestickProps,
  type TrendProps,
  type XYChartProps,
  // Data display panels
  type LogsProps,
  type DatagridProps,
  // Specialized panels
  type NodeGraphProps,
  type TracesProps,
  type FlameGraphProps,
  type CanvasProps,
  type GeomapProps,
  // Widget panels
  type DashboardListProps,
  type AlertListProps,
  type AnnotationsListProps,
  type NewsProps,
  // Plugin panels
  type PluginPanelProps,
  type BusinessVariablePanelProps,
} from '../components/index.js';
import type {
  PanelDefaults,
  ExtendedPanelDefaults,
  PanelType,
} from '../types/defaults.js';
import type {
  GrafanaDashboard,
  GrafanaPanel,
  GrafanaTarget,
  GrafanaVariable,
  GrafanaAnnotation,
  GrafanaLink,
  GrafanaOverride,
} from '../types/grafana-json.js';
import type { BasePanelProps } from '../types/index.js';
import {
  getChildren,
  extractTextContent,
  parseTimeRange,
  parseTooltip,
  parseVariableHide,
  parseVariableSort,
  normalizeThresholds,
  normalizeLegend,
  normalizeTooltip,
  normalizeReduceOptions,
  normalizeLineStyle,
  normalizeScaleDistribution,
  normalizeValueMappings,
  nextRefId,
  deepMerge,
} from './utils.js';

// ============================================================================
// Render Context
// ============================================================================

interface RenderContext {
  datasource?: { uid: string; type?: string };
  panelId: number;
  currentY: number;
  currentX: number;
  rowMaxY: number; // Track the max Y in current row for wrapping
  rowPaddingLeft: number; // Left padding for current row
  rowPaddingRight: number; // Right padding for current row
  variables: GrafanaVariable[];
  annotations: GrafanaAnnotation[];
  links: GrafanaLink[];
  panels: GrafanaPanel[];
  /** Stack of defaults - later entries override earlier ones */
  defaultsStack: ExtendedPanelDefaults[];
}

function createContext(
  datasourceUid?: string,
  datasourceType: string = 'prometheus',
  defaults?: ExtendedPanelDefaults,
): RenderContext {
  return {
    datasource: datasourceUid
      ? { uid: datasourceUid, type: datasourceType }
      : undefined,
    panelId: 1,
    currentY: 0,
    currentX: 0,
    rowMaxY: 0,
    rowPaddingLeft: 0,
    rowPaddingRight: 0,
    variables: [],
    annotations: [],
    links: [],
    panels: [],
    defaultsStack: defaults ? [defaults] : [],
  };
}

/**
 * Get the current merged defaults from the defaults stack for a specific panel type.
 * Later defaults in the stack override earlier ones.
 * Per-panel-type overrides are applied last, with null values removing the default.
 */
function getCurrentDefaults(
  ctx: RenderContext,
  panelType?: PanelType,
): PanelDefaults {
  // Start with merged global defaults from stack
  const merged: PanelDefaults = {};

  for (const defaults of ctx.defaultsStack) {
    // Apply global defaults (excluding 'panels' key)
    for (const [key, value] of Object.entries(defaults)) {
      if (key !== 'panels' && value !== undefined) {
        (merged as Record<string, unknown>)[key] = value;
      }
    }
  }

  // Apply per-panel-type overrides if panel type specified
  if (panelType) {
    for (const defaults of ctx.defaultsStack) {
      const panelOverrides = defaults.panels?.[panelType];
      if (panelOverrides) {
        for (const [key, value] of Object.entries(panelOverrides)) {
          if (value === null) {
            // null means explicitly unset this default
            delete (merged as Record<string, unknown>)[key];
          } else if (value !== undefined) {
            (merged as Record<string, unknown>)[key] = value;
          }
        }
      }
    }
  }

  return merged;
}

// ============================================================================
// Target Extraction
// ============================================================================

function extractTargets(
  _ctx: RenderContext,
  children: React.ReactNode[],
  _panelProps: unknown,
): GrafanaTarget[] {
  const targets: GrafanaTarget[] = [];
  let refIdCounter = 0;

  for (const child of children) {
    // String child = direct query expression
    if (typeof child === 'string') {
      const expr = child.trim();
      if (expr) {
        targets.push({
          refId: nextRefId(refIdCounter++),
          expr,
          legendFormat: '__auto',
          range: true,
        });
      }
      continue;
    }

    // Query component
    if (React.isValidElement(child) && getComponentType(child) === 'query') {
      const queryProps = child.props as QueryProps;
      const expr = extractTextContent(queryProps.children);
      if (expr) {
        targets.push({
          refId: queryProps.refId ?? nextRefId(refIdCounter++),
          expr,
          legendFormat: queryProps.legend ?? '__auto',
          instant: queryProps.instant,
          range: !queryProps.instant,
          format: queryProps.format ?? 'time_series',
          hide: queryProps.hide,
        });
      }
    }
  }

  return targets;
}

// ============================================================================
// Panel Builders
// ============================================================================

function buildBasePanel(
  ctx: RenderContext,
  type: string,
  props: {
    title?: string;
    description?: string;
    datasource?: string;
    width?: number;
    height?: number;
    marginLeft?: number;
    repeat?: string;
    repeatDirection?: 'v' | 'h';
  },
  children: React.ReactNode[],
): GrafanaPanel {
  const id = ctx.panelId++;
  const width = props.width ?? 12;
  const height = props.height ?? 8;
  const marginLeft = props.marginLeft ?? 0;

  // Calculate available width accounting for padding
  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;

  // Check if panel (with margin) fits on current row
  const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
  if (effectiveX + marginLeft + width > availableWidth) {
    // Wrap to next row
    ctx.currentX = ctx.rowPaddingLeft;
    ctx.currentY = ctx.rowMaxY;
  }

  // Position panel with margin
  const x = ctx.currentX + marginLeft;
  const y = ctx.currentY;

  const targets = extractTargets(ctx, children, props);

  // Strip $ prefix from repeat variable if present
  const repeat = props.repeat?.replace(/^\$/, '');

  // Use panel's explicit datasource, fall back to dashboard datasource
  // Supports variables like "$datasource" or "${datasource}"
  const datasourceUid = props.datasource ?? ctx.datasource?.uid;
  const datasource = datasourceUid
    ? { uid: datasourceUid, type: ctx.datasource?.type ?? 'prometheus' }
    : undefined;

  return {
    id,
    type,
    title: props.title ?? '',
    description: props.description,
    gridPos: { x, y, w: width, h: height },
    datasource,
    targets: targets.length > 0 ? targets : undefined,
    repeat,
    repeatDirection: props.repeatDirection,
  };
}

function buildStatPanel(
  ctx: RenderContext,
  props: StatProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'stat', props, children);
  const defaults = getCurrentDefaults(ctx, 'stat');
  const baseColor = props.baseColor ?? 'green';

  // Build overrides from props
  const overrides = props.overrides
    ? buildOverrides(props.overrides, baseColor)
    : [];

  // Determine color configuration:
  // - If baseColor is explicitly set and no thresholds defined, use fixed color mode
  // - Otherwise use thresholds mode (the default Grafana behavior)
  // - If defaults.colorMode is set and not using fixed color, apply it
  const useFixedColor =
    props.baseColor !== undefined && props.thresholds === undefined;
  const colorMode = defaults.colorMode ?? 'thresholds';
  const colorConfig: { mode: string; fixedColor?: string } = useFixedColor
    ? { mode: 'fixed', fixedColor: baseColor }
    : { mode: colorMode };

  panel.fieldConfig = {
    defaults: {
      color: colorConfig,
      mappings: normalizeValueMappings(props.valueMappings),
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
      unit: props.unit,
      decimals: props.decimals,
      noValue: props.noValue,
      min: props.min,
      max: props.max,
    },
    overrides,
  };

  panel.options = {
    colorMode: props.colorMode,
    graphMode: props.graphMode,
    justifyMode: props.justifyMode,
    orientation: props.orientation,
    percentChangeColorMode: props.percentChangeColorMode,
    reduceOptions: normalizeReduceOptions(props.reduceOptions),
    showPercentChange: props.showPercentChange,
    textMode: props.textMode,
    wideLayout: props.wideLayout,
  };

  // Add transformations if provided
  if (props.transformations) {
    panel.transformations = props.transformations;
  }

  return panel;
}

function buildOverrides(
  configs: Array<{
    refId?: string;
    fieldName?: string;
    fieldRegex?: string;
    color?: string;
    colorMode?: string;
    seriesBy?: 'last' | 'min' | 'max';
    displayName?: string;
    thresholds?: unknown;
    extend?: Record<string, unknown>;
  }>,
  baseColor: string,
): GrafanaOverride[] {
  const overrides: GrafanaOverride[] = [];
  for (const override of configs) {
    const properties: { id: string; value: unknown }[] = [];
    // Build color property if color or colorMode is specified
    if (override.color || override.colorMode) {
      const colorValue: Record<string, unknown> = {
        mode: override.colorMode ?? 'fixed',
      };
      // Only include fixedColor for modes that use it (fixed, shades)
      if (override.color) {
        colorValue.fixedColor = override.color;
      }
      // Include seriesBy for continuous color modes
      if (override.seriesBy) {
        colorValue.seriesBy = override.seriesBy;
      }
      properties.push({
        id: 'color',
        value: colorValue,
      });
    }
    if (override.displayName) {
      properties.push({ id: 'displayName', value: override.displayName });
    }
    if (override.thresholds) {
      properties.push({
        id: 'thresholds',
        value: {
          mode: 'absolute',
          steps: normalizeThresholds(
            override.thresholds as Parameters<typeof normalizeThresholds>[0],
            baseColor,
          ),
        },
      });
    }

    // Process extend - merge into existing properties or add new ones
    if (override.extend) {
      for (const [propId, extendValue] of Object.entries(override.extend)) {
        const existingProp = properties.find((p) => p.id === propId);
        if (
          existingProp &&
          typeof existingProp.value === 'object' &&
          existingProp.value !== null
        ) {
          // Merge into existing property value
          deepMerge(
            existingProp.value as Record<string, unknown>,
            extendValue as Record<string, unknown>,
          );
        } else if (existingProp) {
          // Replace primitive value
          existingProp.value = extendValue;
        } else {
          // Add as new property
          properties.push({ id: propId, value: extendValue });
        }
      }
    }

    if (properties.length > 0) {
      // Determine the matcher type
      let matcher: { id: string; options: string };
      if (override.refId) {
        matcher = { id: 'byFrameRefID', options: override.refId };
      } else if (override.fieldName) {
        matcher = { id: 'byName', options: override.fieldName };
      } else if (override.fieldRegex) {
        matcher = { id: 'byRegexp', options: override.fieldRegex };
      } else {
        continue; // Skip if no matcher specified
      }
      overrides.push({ matcher, properties });
    }
  }
  return overrides;
}

function buildTimeseriesPanel(
  ctx: RenderContext,
  props: TimeseriesProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'timeseries', props, children);
  const defaults = getCurrentDefaults(ctx, 'timeseries');
  const legendProp =
    props.legend ?? (defaults.legend === false ? false : defaults.legend);
  const legend = normalizeLegend(legendProp === false ? undefined : legendProp);
  const tooltip = normalizeTooltip(props.tooltip);
  const stackMode = props.stack === true ? 'normal' : props.stack || 'none';
  const baseColor = props.baseColor ?? 'green';
  const lineStyle = normalizeLineStyle(props.lineStyle);
  const scaleDistribution = normalizeScaleDistribution(props.scaleDistribution);

  // Build overrides from props
  const overrides = props.overrides
    ? buildOverrides(props.overrides, baseColor)
    : [];

  panel.fieldConfig = {
    defaults: {
      color: {
        mode: props.colorMode ?? defaults.colorMode ?? 'palette-classic',
      },
      custom: {
        axisBorderShow:
          props.axisBorderShow ?? defaults.axisBorderShow ?? false,
        axisCenteredZero: props.centerZero ?? false,
        axisColorMode: props.axisColorMode ?? defaults.axisColorMode ?? 'text',
        axisGridShow: props.axisGridShow ?? defaults.axisGridShow,
        axisLabel: props.axisLabel ?? '',
        axisPlacement: props.axisPlacement ?? defaults.axisPlacement ?? 'auto',
        axisSoftMin: props.softMin,
        axisSoftMax: props.softMax,
        axisWidth: props.axisWidth,
        barAlignment: props.barAlignment,
        barMaxWidth: props.barMaxWidth,
        drawStyle: props.drawStyle,
        fillOpacity: props.fill ?? defaults.fill,
        gradientMode: props.gradientMode ?? defaults.gradientMode,
        hideFrom: { legend: false, tooltip: false, viz: false },
        lineInterpolation: props.lineInterpolation,
        lineStyle,
        lineWidth: props.lineWidth ?? defaults.lineWidth,
        pointSize: props.pointSize ?? defaults.pointSize,
        scaleDistribution,
        showPoints: props.showPoints ?? defaults.showPoints ?? 'auto',
        spanNulls: props.spanNulls,
        stacking: { group: 'A', mode: stackMode },
        thresholdsStyle: {
          mode: props.thresholdStyle ?? defaults.thresholdStyle ?? 'off',
        },
      },
      decimals: props.decimals,
      mappings: normalizeValueMappings(props.valueMappings),
      min: props.min,
      max: props.max,
      noValue: props.noValue,
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
      unit: props.unit,
    },
    overrides,
  };

  // Build tooltip options with defaults
  const tooltipMode = props.tooltip
    ? tooltip.mode
    : (defaults.tooltipMode ?? tooltip.mode);
  const tooltipSort = props.tooltip
    ? tooltip.sort
    : (defaults.tooltipSort ?? tooltip.sort);

  panel.options = {
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
      sortBy: legend.sortBy,
      sortDesc: legend.sortDesc,
      width: legend.width,
    },
    tooltip: {
      mode: tooltipMode,
      sort: tooltipSort,
      maxHeight: tooltip.maxHeight,
      maxWidth: tooltip.maxWidth,
    },
  };

  // Add transformations if provided
  if (props.transformations) {
    panel.transformations = props.transformations;
  }

  return panel;
}

function buildBarGaugePanel(
  ctx: RenderContext,
  props: BarGaugeProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'bargauge', props, children);
  const defaults = getCurrentDefaults(ctx, 'bargauge');

  // Build overrides from props
  const overrides = props.overrides
    ? buildOverrides(props.overrides, 'green')
    : [];

  // Normalize orientation - support both old and new formats
  let orientation = 'horizontal';
  if (props.orientation === 'vertical') {
    orientation = 'vertical';
  } else if (
    props.orientation === 'horizontal' ||
    props.orientation === 'auto'
  ) {
    orientation = props.orientation;
  }

  // Determine color mode - BarGauge typically uses thresholds but can use other modes
  const colorMode = defaults.colorMode ?? 'thresholds';

  panel.fieldConfig = {
    defaults: {
      color: { mode: colorMode },
      mappings: normalizeValueMappings(props.valueMappings),
      min: props.min,
      max: props.max,
      noValue: props.noValue,
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(
          props.thresholds,
          props.baseColor ?? 'green',
        ),
      },
      unit: props.unit,
      decimals: props.decimals,
    },
    overrides,
  };

  panel.options = {
    displayMode: props.displayMode ?? 'gradient',
    minVizHeight: props.minVizHeight ?? 16,
    minVizWidth: props.minVizWidth ?? 8,
    namePlacement: props.namePlacement ?? 'auto',
    orientation,
    reduceOptions: normalizeReduceOptions(props.reduceOptions),
    showUnfilled: props.showUnfilled ?? true,
    sizing: props.sizing ?? 'auto',
    valueMode: props.valueMode ?? 'color',
    ...(props.text && { text: props.text }),
  };

  // Add transformations if provided
  if (props.transformations) {
    panel.transformations = props.transformations;
  }

  return panel;
}

function buildHeatmapPanel(
  ctx: RenderContext,
  props: HeatmapProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'heatmap', props, children);

  // Set format to heatmap for targets
  if (panel.targets) {
    for (const target of panel.targets) {
      target.format = 'heatmap';
    }
  }

  panel.fieldConfig = {
    defaults: {
      custom: { scaleDistribution: { type: props.scale } },
    },
    overrides: [],
  };

  panel.options = {
    calculate: false,
    cellGap: 1,
    color: {
      mode: 'scheme',
      scheme: props.scheme,
      scale: props.scale,
    },
    yAxis: { unit: props.yAxisUnit },
  };

  return panel;
}

function buildGaugePanel(
  ctx: RenderContext,
  props: GaugeProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'gauge', props, children);
  const defaults = getCurrentDefaults(ctx, 'gauge');

  // Build overrides from props
  const overrides = props.overrides
    ? buildOverrides(props.overrides, 'green')
    : [];

  // Determine color mode - Gauge typically uses thresholds but can use other modes
  const colorMode = defaults.colorMode ?? 'thresholds';

  panel.fieldConfig = {
    defaults: {
      color: { mode: colorMode },
      mappings: normalizeValueMappings(props.valueMappings),
      min: props.min,
      max: props.max,
      noValue: props.noValue,
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(
          props.thresholds,
          props.baseColor ?? 'green',
        ),
      },
      unit: props.unit,
      decimals: props.decimals,
    },
    overrides,
  };

  panel.options = {
    minVizHeight: props.minVizHeight ?? 75,
    minVizWidth: props.minVizWidth ?? 75,
    orientation: props.orientation ?? 'auto',
    reduceOptions: normalizeReduceOptions(props.reduceOptions),
    showThresholdLabels: props.showThresholdLabels ?? false,
    showThresholdMarkers: props.showThresholdMarkers ?? true,
    sizing: props.sizing ?? 'auto',
    ...(props.text && { text: props.text }),
  };

  // Add transformations if provided
  if (props.transformations) {
    panel.transformations = props.transformations;
  }

  return panel;
}

function buildTablePanel(
  ctx: RenderContext,
  props: TableProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'table', props, children);
  const defaults = getCurrentDefaults(ctx, 'table');
  const baseColor = props.baseColor ?? 'green';

  // Set format to table for targets
  if (panel.targets) {
    for (const target of panel.targets) {
      target.format = 'table';
      target.instant = true;
      target.range = false;
    }
  }

  // Build column overrides
  const overrides: GrafanaOverride[] = [];
  if (props.columnOverrides) {
    for (const col of props.columnOverrides) {
      const properties: Array<{ id: string; value: unknown }> = [];
      if (col.unit) {
        properties.push({ id: 'unit', value: col.unit });
      }
      if (col.width !== undefined) {
        properties.push({ id: 'custom.width', value: col.width });
      }
      if (col.displayName) {
        properties.push({ id: 'displayName', value: col.displayName });
      }
      if (col.decimals !== undefined) {
        properties.push({ id: 'decimals', value: col.decimals });
      }
      if (col.link) {
        properties.push({
          id: 'links',
          value: [
            {
              title: col.link.title ?? '',
              url: col.link.url,
              targetBlank: col.link.targetBlank ?? false,
            },
          ],
        });
      }
      if (col.cellMode && col.cellMode !== 'auto') {
        const cellOptions: Record<string, unknown> = { type: col.cellMode };
        if (
          col.cellMode === 'gauge' ||
          col.cellMode === 'lcd-gauge' ||
          col.cellMode === 'basic-gauge'
        ) {
          if (col.min !== undefined) cellOptions.min = col.min;
          if (col.max !== undefined) cellOptions.max = col.max;
          if (col.gaugeMode) cellOptions.mode = col.gaugeMode;
        }
        properties.push({ id: 'custom.cellOptions', value: cellOptions });
      }
      // min/max as field-level properties (needed for gauge fill calculation)
      if (col.min !== undefined) {
        properties.push({ id: 'min', value: col.min });
      }
      if (col.max !== undefined) {
        properties.push({ id: 'max', value: col.max });
      }
      // Per-column thresholds override
      if (col.thresholds) {
        properties.push({
          id: 'thresholds',
          value: {
            mode: 'absolute',
            steps: normalizeThresholds(col.thresholds, 'green'),
          },
        });
      }
      // Per-column value mappings override
      if (col.valueMappings) {
        properties.push({
          id: 'mappings',
          value: normalizeValueMappings(col.valueMappings),
        });
      }
      if (properties.length > 0) {
        overrides.push({
          matcher: { id: 'byName', options: col.name },
          properties,
        });
      }
    }
  }

  // Determine color mode - Table typically uses thresholds but can use other modes
  const colorMode = defaults.colorMode ?? 'thresholds';

  panel.fieldConfig = {
    defaults: {
      color: { mode: colorMode },
      custom: { align: 'auto', cellOptions: { type: 'auto' }, inspect: false },
      decimals: props.decimals,
      mappings: normalizeValueMappings(props.valueMappings),
      noValue: props.noValue,
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
      unit: props.unit,
    },
    overrides,
  };

  panel.options = {
    cellHeight: props.cellHeight ?? 'sm',
    enablePagination: props.enablePagination ?? false,
    footer: { show: false, reducer: ['sum'], countRows: false, fields: '' },
    frameIndex: props.frameIndex ?? 0,
    showHeader: props.showHeader ?? true,
    showTypeIcons: props.showTypeIcons ?? false,
    ...(props.frozenColumns && { frozenColumns: props.frozenColumns }),
    ...(props.maxRowHeight !== undefined && {
      maxRowHeight: props.maxRowHeight,
    }),
    ...(props.sortBy && {
      sortBy: [
        { displayName: props.sortBy.field, desc: props.sortBy.desc ?? false },
      ],
    }),
  };

  // Add transformations if provided
  if (props.transformations) {
    panel.transformations = props.transformations;
  }

  return panel;
}

function buildTextPanel(
  ctx: RenderContext,
  props: TextProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'text', props, children);

  // Get content from props or children
  const content = props.content ?? extractTextContent(children);

  panel.options = {
    mode: props.mode ?? 'markdown',
    content: content ?? '',
  };

  // Text panels don't have fieldConfig or targets
  delete panel.targets;

  return panel;
}

// ============================================================================
// Chart Panel Builders
// ============================================================================

function buildBarChartPanel(
  ctx: RenderContext,
  props: BarChartProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'barchart', props, children);
  const defaults = getCurrentDefaults(ctx, 'barchart');
  const legend = normalizeLegend(props.legend);
  const baseColor = 'green';

  const overrides = props.overrides
    ? buildOverrides(props.overrides, baseColor)
    : [];

  panel.fieldConfig = {
    defaults: {
      color: {
        mode: props.colorMode ?? defaults.colorMode ?? 'palette-classic',
      },
      custom: {
        axisBorderShow: false,
        axisColorMode: 'text',
        axisPlacement: 'auto',
        fillOpacity: props.fill,
        gradientMode: props.gradientMode,
        hideFrom: { legend: false, tooltip: false, viz: false },
        lineWidth: 1,
        scaleDistribution: { type: 'linear' },
      },
      decimals: props.decimals,
      mappings: [],
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
      unit: props.unit,
    },
    overrides,
  };

  panel.options = {
    barRadius: 0,
    barWidth: props.barWidth,
    groupWidth: props.groupWidth,
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
    },
    orientation: props.orientation ?? 'auto',
    showValue: props.showValue ?? 'auto',
    stacking: props.stack ?? 'off',
    tooltip: { mode: 'multi', sort: 'asc' },
    xField: props.xField,
    xTickLabelRotation: 0,
    xTickLabelSpacing: 0,
  };

  return panel;
}

function buildPieChartPanel(
  ctx: RenderContext,
  props: PieChartProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'piechart', props, children);
  const defaults = getCurrentDefaults(ctx, 'piechart');

  panel.fieldConfig = {
    defaults: {
      color: {
        mode: props.colorMode ?? defaults.colorMode ?? 'palette-classic',
      },
      decimals: props.decimals,
      mappings: [],
      unit: props.unit,
    },
    overrides: [],
  };

  const legend = props.legend === false ? null : normalizeLegend(props.legend);

  panel.options = {
    legend: legend
      ? {
          calcs: legend.calcs,
          displayMode: legend.displayMode,
          placement: legend.placement,
          showLegend: legend.displayMode !== 'hidden',
          values: props.labels ?? [],
        }
      : { showLegend: false },
    pieType: props.pieType ?? 'pie',
    reduceOptions: {
      calcs: props.reduceCalc ? [props.reduceCalc] : [],
      fields: '',
      values: false,
    },
    tooltip: { mode: 'multi', sort: 'asc' },
  };

  return panel;
}

function buildHistogramPanel(
  ctx: RenderContext,
  props: HistogramProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'histogram', props, children);
  const legend = normalizeLegend(props.legend);

  panel.fieldConfig = {
    defaults: {
      custom: {
        fillOpacity: props.fill,
        gradientMode: props.gradientMode,
        hideFrom: { legend: false, tooltip: false, viz: false },
        lineWidth: props.lineWidth,
      },
      decimals: props.decimals,
      mappings: [],
      unit: props.unit,
    },
    overrides: [],
  };

  panel.options = {
    bucketCount: props.bucketCount,
    bucketSize: props.bucketSize,
    bucketOffset: props.bucketOffset,
    combine: props.combine ?? false,
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
    },
    tooltip: { mode: 'multi', sort: 'asc' },
  };

  return panel;
}

function buildStateTimelinePanel(
  ctx: RenderContext,
  props: StateTimelineProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'state-timeline', props, children);
  const defaults = getCurrentDefaults(ctx, 'state-timeline');
  const legend = normalizeLegend(props.legend);
  const baseColor = 'green';

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? defaults.colorMode ?? 'thresholds' },
      custom: {
        fillOpacity: props.fill,
        hideFrom: { legend: false, tooltip: false, viz: false },
        lineWidth: props.lineWidth,
      },
      mappings: [],
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
    },
    overrides: [],
  };

  panel.options = {
    alignValue: props.alignValue ?? 'left',
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
    },
    mergeValues: props.mergeValues ?? true,
    rowHeight: props.rowHeight,
    showValue: props.showValue ?? 'auto',
    tooltip: { mode: 'single', sort: 'none' },
  };

  return panel;
}

function buildStatusHistoryPanel(
  ctx: RenderContext,
  props: StatusHistoryProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'status-history', props, children);
  const defaults = getCurrentDefaults(ctx, 'status-history');
  const legend = normalizeLegend(props.legend);
  const baseColor = 'green';

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? defaults.colorMode ?? 'thresholds' },
      custom: {
        fillOpacity: props.fill,
        hideFrom: { legend: false, tooltip: false, viz: false },
        lineWidth: props.lineWidth,
      },
      mappings: [],
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
    },
    overrides: [],
  };

  panel.options = {
    colWidth: props.colWidth,
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
    },
    rowHeight: props.rowHeight,
    showValue: props.showValue ?? 'auto',
    tooltip: { mode: 'single', sort: 'none' },
  };

  return panel;
}

function buildCandlestickPanel(
  ctx: RenderContext,
  props: CandlestickProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'candlestick', props, children);
  const legend = normalizeLegend(props.legend);

  panel.fieldConfig = {
    defaults: {
      custom: {
        axisBorderShow: false,
        axisColorMode: 'text',
        axisPlacement: 'auto',
        hideFrom: { legend: false, tooltip: false, viz: false },
        scaleDistribution: { type: 'linear' },
      },
      mappings: [],
    },
    overrides: [],
  };

  panel.options = {
    candleStyle: props.candleStyle ?? 'candles',
    colorStrategy: props.colorStrategy ?? 'open-close',
    colors: {
      up: props.upColor,
      down: props.downColor,
      flat: 'gray',
    },
    fields: {
      open: props.openField,
      high: props.highField,
      low: props.lowField,
      close: props.closeField,
      volume: props.volumeField,
    },
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
    },
    mode: props.mode ?? 'candles',
  };

  return panel;
}

function buildTrendPanel(
  ctx: RenderContext,
  props: TrendProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'trend', props, children);
  const defaults = getCurrentDefaults(ctx, 'trend');
  const legend = normalizeLegend(props.legend);

  panel.fieldConfig = {
    defaults: {
      color: {
        mode: props.colorMode ?? defaults.colorMode ?? 'palette-classic',
      },
      custom: {
        axisBorderShow: false,
        axisColorMode: 'text',
        axisPlacement: 'auto',
        drawStyle: props.drawStyle,
        fillOpacity: props.fill,
        gradientMode: props.gradientMode,
        hideFrom: { legend: false, tooltip: false, viz: false },
        lineInterpolation: props.lineInterpolation,
        lineWidth: props.lineWidth,
        pointSize: 5,
        scaleDistribution: { type: 'linear' },
        showPoints: 'auto',
        spanNulls: false,
        stacking: { group: 'A', mode: 'none' },
      },
      decimals: props.decimals,
      mappings: [],
      unit: props.unit,
    },
    overrides: [],
  };

  panel.options = {
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
    },
    tooltip: { mode: 'multi', sort: 'asc' },
    xField: props.xField,
  };

  return panel;
}

function buildXYChartPanel(
  ctx: RenderContext,
  props: XYChartProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'xychart', props, children);
  const defaults = getCurrentDefaults(ctx, 'xychart');
  const legend = normalizeLegend(props.legend);

  panel.fieldConfig = {
    defaults: {
      color: {
        mode: props.colorMode ?? defaults.colorMode ?? 'palette-classic',
      },
      custom: {
        hideFrom: { legend: false, tooltip: false, viz: false },
      },
      decimals: props.decimals,
      mappings: [],
      unit: props.unit,
    },
    overrides: [],
  };

  panel.options = {
    dims: {
      x: props.xField,
      y: props.yField,
      size: props.sizeField,
      color: props.colorField,
    },
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
    },
    series: [
      {
        pointColor: { fixed: 'auto' },
        pointSize: {
          fixed: props.pointSize,
          min: 1,
          max: 100,
        },
        lineColor: { fixed: 'auto' },
        lineWidth: props.lineWidth,
        show: props.show ?? 'points',
      },
    ],
    seriesMapping: 'auto',
    tooltip: { mode: 'multi', sort: 'asc' },
  };

  return panel;
}

// ============================================================================
// Data Display Panel Builders
// ============================================================================

function buildLogsPanel(
  ctx: RenderContext,
  props: LogsProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'logs', props, children);

  panel.options = {
    dedupStrategy: props.dedupStrategy ?? 'none',
    enableLogDetails: props.enableLogDetails ?? true,
    prettifyLogMessage: props.prettifyLogMessage ?? false,
    showCommonLabels: false,
    showLabels: props.showLabels ?? false,
    showTime: props.showTime ?? true,
    sortOrder: props.sortOrder ?? 'Descending',
    wrapLogMessage: props.wrapLines ?? false,
  };

  return panel;
}

function buildDatagridPanel(
  ctx: RenderContext,
  props: DatagridProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'datagrid', props, children);

  panel.fieldConfig = {
    defaults: {
      custom: {},
      mappings: [],
    },
    overrides: [],
  };

  panel.options = {
    selectedSeries: props.selectedSeries ?? 0,
  };

  return panel;
}

// ============================================================================
// Specialized Panel Builders
// ============================================================================

function buildNodeGraphPanel(
  ctx: RenderContext,
  props: NodeGraphProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'nodeGraph', props, children);

  panel.options = {
    nodes: {
      mainStatUnit: '',
      secondaryStatUnit: '',
    },
    edges: {
      mainStatUnit: '',
    },
  };

  return panel;
}

function buildTracesPanel(
  ctx: RenderContext,
  props: TracesProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'traces', props, children);

  panel.options = {};

  return panel;
}

function buildFlameGraphPanel(
  ctx: RenderContext,
  props: FlameGraphProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'flamegraph', props, children);

  panel.options = {};

  return panel;
}

function buildCanvasPanel(
  ctx: RenderContext,
  props: CanvasProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'canvas', props, children);

  panel.options = {
    inlineEditing: props.inlineEditing ?? true,
    panZoom: props.panZoom ?? false,
    root: {
      elements: [],
      name: 'root',
      type: 'frame',
    },
  };

  return panel;
}

function buildGeomapPanel(
  ctx: RenderContext,
  props: GeomapProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, 'geomap', props, children);

  panel.fieldConfig = {
    defaults: {
      color: { mode: 'thresholds' },
      mappings: [],
      thresholds: {
        mode: 'absolute',
        steps: [
          { value: null, color: 'green' },
          { value: 80, color: 'red' },
        ],
      },
    },
    overrides: [],
  };

  panel.options = {
    basemap: {
      config: {},
      name: 'Layer 0',
      type: props.baseLayer ?? 'osm-standard',
    },
    controls: {
      mouseWheelZoom: true,
      showAttribution: true,
      showDebug: false,
      showMeasure: false,
      showScale: false,
      showZoom: true,
    },
    layers: [],
    tooltip: { mode: 'details' },
    view: {
      allLayers: true,
      id: props.view ?? 'fit',
      lat: 0,
      lon: 0,
      zoom: props.zoom ?? 1,
    },
  };

  return panel;
}

// ============================================================================
// Widget Panel Builders
// ============================================================================

function buildDashboardListPanel(
  ctx: RenderContext,
  props: DashboardListProps,
): GrafanaPanel {
  const id = ctx.panelId++;
  const width = props.width ?? 12;
  const height = props.height ?? 8;
  const marginLeft = props.marginLeft ?? 0;

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;

  const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
  if (effectiveX + marginLeft + width > availableWidth) {
    ctx.currentX = ctx.rowPaddingLeft;
    ctx.currentY = ctx.rowMaxY;
  }

  const x = ctx.currentX + marginLeft;
  const y = ctx.currentY;

  return {
    id,
    type: 'dashlist',
    title: props.title ?? '',
    description: props.description,
    gridPos: { x, y, w: width, h: height },
    options: {
      folderId: props.folderId,
      includeVars: props.includeVars ?? false,
      keepTime: props.includeTimeRange ?? false,
      maxItems: props.maxItems ?? 10,
      query: props.query ?? '',
      showHeadings: true,
      showRecentlyViewed: props.showRecentlyViewed ?? false,
      showSearch: props.showSearch ?? false,
      showStarred: props.showStarred ?? true,
      tags: props.tags ?? [],
    },
  };
}

function buildAlertListPanel(
  ctx: RenderContext,
  props: AlertListProps,
): GrafanaPanel {
  const id = ctx.panelId++;
  const width = props.width ?? 12;
  const height = props.height ?? 8;
  const marginLeft = props.marginLeft ?? 0;

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;

  const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
  if (effectiveX + marginLeft + width > availableWidth) {
    ctx.currentX = ctx.rowPaddingLeft;
    ctx.currentY = ctx.rowMaxY;
  }

  const x = ctx.currentX + marginLeft;
  const y = ctx.currentY;

  return {
    id,
    type: 'alertlist',
    title: props.title ?? '',
    description: props.description,
    gridPos: { x, y, w: width, h: height },
    options: {
      alertInstanceLabelFilter: props.alertNameFilter ?? '',
      alertName: '',
      dashboardAlerts: props.dashboardFilter ?? false,
      folderId: props.folderId,
      groupBy: props.groupBy ?? [],
      groupMode: 'default',
      maxItems: props.maxItems ?? 20,
      sortOrder:
        props.sortOrder === 'time'
          ? 3
          : props.sortOrder === 'importance'
            ? 2
            : 1,
      stateFilter: {
        alerting: props.stateFilter?.includes('alerting') ?? true,
        error: props.stateFilter?.includes('error') ?? true,
        noData: props.stateFilter?.includes('nodata') ?? false,
        normal: props.stateFilter?.includes('normal') ?? false,
        pending: props.stateFilter?.includes('pending') ?? true,
      },
      viewMode: props.viewMode ?? 'list',
    },
  };
}

function buildAnnotationsListPanel(
  ctx: RenderContext,
  props: AnnotationsListProps,
): GrafanaPanel {
  const id = ctx.panelId++;
  const width = props.width ?? 12;
  const height = props.height ?? 8;
  const marginLeft = props.marginLeft ?? 0;

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;

  const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
  if (effectiveX + marginLeft + width > availableWidth) {
    ctx.currentX = ctx.rowPaddingLeft;
    ctx.currentY = ctx.rowMaxY;
  }

  const x = ctx.currentX + marginLeft;
  const y = ctx.currentY;

  return {
    id,
    type: 'annolist',
    title: props.title ?? '',
    description: props.description,
    gridPos: { x, y, w: width, h: height },
    options: {
      limit: props.limit ?? 10,
      navigateBefore: '10m',
      navigateAfter: '10m',
      navigateToPanel: 'always',
      onlyFromThisDashboard: props.onlyFromThisDashboard ?? false,
      onlyInTimeRange: props.onlyInTimeRange ?? false,
      showTags: props.showTags ?? true,
      showTime: props.showTime ?? true,
      showUser: props.showUser ?? true,
      tags: props.tags ?? [],
    },
  };
}

function buildNewsPanel(ctx: RenderContext, props: NewsProps): GrafanaPanel {
  const id = ctx.panelId++;
  const width = props.width ?? 12;
  const height = props.height ?? 8;
  const marginLeft = props.marginLeft ?? 0;

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;

  const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
  if (effectiveX + marginLeft + width > availableWidth) {
    ctx.currentX = ctx.rowPaddingLeft;
    ctx.currentY = ctx.rowMaxY;
  }

  const x = ctx.currentX + marginLeft;
  const y = ctx.currentY;

  return {
    id,
    type: 'news',
    title: props.title ?? '',
    description: props.description,
    gridPos: { x, y, w: width, h: height },
    options: {
      feedUrl: props.feedUrl ?? '',
      showImage: props.showImage ?? true,
    },
  };
}

// ============================================================================
// Plugin Panel Builders
// ============================================================================

function buildPluginPanel(
  ctx: RenderContext,
  props: PluginPanelProps,
  children: React.ReactNode[],
): GrafanaPanel {
  const panel = buildBasePanel(ctx, props.type, props, children);

  if (props.pluginVersion) {
    panel.pluginVersion = props.pluginVersion;
  }

  if (props.options) {
    panel.options = props.options;
  }

  return panel;
}

function buildBusinessVariablePanel(
  ctx: RenderContext,
  props: BusinessVariablePanelProps,
): GrafanaPanel {
  const id = ctx.panelId++;
  const width = props.width ?? 6;
  const height = props.height ?? 2;
  const marginLeft = props.marginLeft ?? 0;

  // Calculate position
  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;

  const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
  if (effectiveX + marginLeft + width > availableWidth) {
    ctx.currentX = ctx.rowPaddingLeft;
    ctx.currentY = ctx.rowMaxY;
  }

  const x = ctx.currentX + marginLeft;
  const y = ctx.currentY;

  // Strip $ prefix from variable if present
  const variable = props.variable.replace(/^\$/, '');

  // Default options for Business Variable Panel
  const defaultOptions = {
    alertCustomMessage: '',
    alwaysVisibleFilter: false,
    autoScroll: false,
    browserTabNamePattern: '',
    collapsedByDefault: false,
    customValue: false,
    displayMode: props.displayMode ?? 'minimize',
    emptyValue: false,
    favorites: { enabled: false, storage: 'browser' },
    filter: props.filter ?? false,
    groupSelection: false,
    header: props.header ?? true,
    isMinimizeForTable: false,
    isMinimizeViewShowCustomIcon: false,
    isPinTabsEnabled: false,
    isUseLocalTime: false,
    minimizeOutputFormat: 'text',
    minimizeViewCustomIcon: '',
    minimizeViewNativeIcon: 'gf-movepane-right',
    padding: props.padding ?? 16,
    persistent: false,
    requestLatency: 'low',
    saveSelectedGroup: false,
    saveSelectedGroupKey: '',
    selectedValues: { showSelected: false },
    showGroupTotal: false,
    showLabel: props.showLabel ?? false,
    showName: props.showName ?? false,
    showResetButton: props.showResetButton ?? false,
    showTotal: false,
    statusSort: false,
    tableViewPosition: 'normal',
    tabsInOrder: true,
    toolbarMode: props.toolbarMode ?? 'tabs',
    variable,
    wordBreak: 'normal',
    ...props.options,
  };

  const panel: GrafanaPanel = {
    id,
    type: 'volkovlabs-variable-panel',
    title: props.title ?? '',
    description: props.description,
    gridPos: { x, y, w: width, h: height },
    fieldConfig: {
      defaults: {
        color: { mode: 'thresholds' },
        mappings: [],
        thresholds: {
          mode: 'absolute',
          steps: [
            { value: null, color: 'green' },
            { value: 80, color: 'red' },
          ],
        },
      },
      overrides: [],
    },
    options: defaultOptions,
    targets: [
      {
        refId: 'A',
        expr: '',
        format: 'time_series',
        legendFormat: '__auto',
        range: true,
      },
    ],
  };

  return panel;
}

function buildRowPanel(ctx: RenderContext, props: RowProps): GrafanaPanel {
  const id = ctx.panelId++;

  return {
    id,
    type: 'row',
    title: props.title,
    gridPos: { x: 0, y: ctx.currentY, w: 24, h: 1 },
    collapsed: props.collapsed ?? false,
    panels: [],
  };
}

// ============================================================================
// Element Processing
// ============================================================================

function processElement(element: React.ReactElement, ctx: RenderContext): void {
  const componentType = getComponentType(element);
  const props = element.props;
  const children = getChildren(element);

  switch (componentType) {
    case 'variable': {
      const varProps = props as VariableProps;
      const query = varProps.query ?? extractTextContent(varProps.children);
      ctx.variables.push({
        name: varProps.name,
        type: 'query',
        label: varProps.label,
        query: {
          query,
          refId: 'VariableQueryEditor-VariableQuery',
          qryType: 1,
        },
        definition: query,
        multi: varProps.multi,
        includeAll: varProps.includeAll ?? varProps.multi,
        allValue: varProps.allValue,
        hide: parseVariableHide(varProps.hide),
        sort: parseVariableSort(varProps.sort),
        refresh: 1,
        options: [],
        current: {} as { text: string; value: string },
      });
      break;
    }

    case 'annotation': {
      const annProps = props as AnnotationProps;
      const expr = extractTextContent(annProps.children);
      ctx.annotations.push({
        name: annProps.name,
        datasource: ctx.datasource!,
        enable: annProps.enabled !== false,
        hide: annProps.hide,
        iconColor: annProps.color ?? 'light-red',
        expr,
        titleFormat: annProps.title,
        tagKeys: annProps.tags,
      });
      break;
    }

    case 'link': {
      const linkProps = props as LinkProps;
      ctx.links.push({
        title: linkProps.title,
        url: linkProps.url,
        type: 'link',
        icon: linkProps.icon ?? 'external',
        tooltip: linkProps.tooltip,
        keepTime: linkProps.keepTime,
        includeVars: linkProps.includeVars,
        targetBlank: linkProps.newTab,
        asDropdown: false,
      });
      break;
    }

    case 'row': {
      const rowProps = props as RowProps;
      // Before starting a new row, finalize any existing row positioning
      ctx.currentY = ctx.rowMaxY;
      ctx.currentX = 0;
      ctx.rowPaddingLeft = 0;
      ctx.rowPaddingRight = 0;

      const rowPanel = buildRowPanel(ctx, rowProps);
      ctx.panels.push(rowPanel);
      ctx.currentY += 1;
      ctx.rowMaxY = ctx.currentY; // Reset row max Y

      // Apply row padding
      const paddingLeft = rowProps.paddingLeft ?? rowProps.padding ?? 0;
      const paddingRight = rowProps.paddingRight ?? rowProps.padding ?? 0;
      ctx.rowPaddingLeft = paddingLeft;
      ctx.rowPaddingRight = paddingRight;
      ctx.currentX = paddingLeft; // Start at left padding

      // Process row children
      for (const child of children) {
        if (React.isValidElement(child)) {
          processElement(child, ctx);
        }
      }

      // After processing children, finalize row position and reset padding
      ctx.currentY = ctx.rowMaxY;
      ctx.currentX = 0;
      ctx.rowPaddingLeft = 0;
      ctx.rowPaddingRight = 0;
      break;
    }

    case 'container': {
      const containerProps = props as ContainerProps;

      // Calculate container width
      let containerWidth: number;
      if (containerProps.fill) {
        // Fill remaining width (accounting for row padding)
        const availableWidth = 24 - ctx.rowPaddingRight;
        containerWidth = availableWidth - ctx.currentX;
      } else if (containerProps.width !== undefined) {
        containerWidth = containerProps.width;
      } else {
        throw new Error('Container must have either width or fill prop');
      }

      // Container's position in the grid
      const containerX = ctx.currentX;
      const containerY = ctx.currentY;

      // Track panels added by children so we can translate their positions
      const panelCountBefore = ctx.panels.length;

      // Create sub-context for container layout
      // Children will be positioned relative to (0, 0) within the container
      const savedCurrentX = ctx.currentX;
      const savedCurrentY = ctx.currentY;
      const savedRowMaxY = ctx.rowMaxY;
      const savedRowPaddingLeft = ctx.rowPaddingLeft;
      const savedRowPaddingRight = ctx.rowPaddingRight;

      // Reset position for container-relative layout
      ctx.currentX = 0;
      ctx.currentY = 0;
      ctx.rowMaxY = 0;
      ctx.rowPaddingLeft = 0;
      ctx.rowPaddingRight = 24 - containerWidth; // Constrain to container width

      // Process children within container
      for (const child of children) {
        if (React.isValidElement(child)) {
          processElement(child, ctx);
        }
      }

      // Calculate container height from children
      const containerHeight = ctx.rowMaxY;

      // Translate child panel positions to absolute grid coordinates
      for (let i = panelCountBefore; i < ctx.panels.length; i++) {
        const panel = ctx.panels[i];
        // Validate panel fits within container
        if (panel.gridPos.w > containerWidth) {
          throw new Error(
            `Panel "${panel.title}" has width ${panel.gridPos.w} which exceeds container width ${containerWidth}`,
          );
        }
        panel.gridPos.x += containerX;
        panel.gridPos.y += containerY;
      }

      // Restore context and update position after container
      ctx.currentX = savedCurrentX + containerWidth;
      ctx.currentY = savedCurrentY;
      ctx.rowMaxY = Math.max(savedRowMaxY, containerY + containerHeight);
      ctx.rowPaddingLeft = savedRowPaddingLeft;
      ctx.rowPaddingRight = savedRowPaddingRight;
      break;
    }

    case 'stat': {
      const panel = buildStatPanel(ctx, props as StatProps, children);
      addPanel(ctx, panel, props as StatProps);
      break;
    }

    case 'timeseries': {
      const panel = buildTimeseriesPanel(
        ctx,
        props as TimeseriesProps,
        children,
      );
      addPanel(ctx, panel, props as TimeseriesProps);
      break;
    }

    case 'bargauge': {
      const panel = buildBarGaugePanel(ctx, props as BarGaugeProps, children);
      addPanel(ctx, panel, props as BarGaugeProps);
      break;
    }

    case 'heatmap': {
      const panel = buildHeatmapPanel(ctx, props as HeatmapProps, children);
      addPanel(ctx, panel, props as HeatmapProps);
      break;
    }

    case 'gauge': {
      const panel = buildGaugePanel(ctx, props as GaugeProps, children);
      addPanel(ctx, panel, props as GaugeProps);
      break;
    }

    case 'table': {
      const panel = buildTablePanel(ctx, props as TableProps, children);
      addPanel(ctx, panel, props as TableProps);
      break;
    }

    case 'text': {
      const panel = buildTextPanel(ctx, props as TextProps, children);
      addPanel(ctx, panel, props as TextProps);
      break;
    }

    // Chart panels
    case 'barchart': {
      const panel = buildBarChartPanel(ctx, props as BarChartProps, children);
      addPanel(ctx, panel, props as BarChartProps);
      break;
    }

    case 'piechart': {
      const panel = buildPieChartPanel(ctx, props as PieChartProps, children);
      addPanel(ctx, panel, props as PieChartProps);
      break;
    }

    case 'histogram': {
      const panel = buildHistogramPanel(ctx, props as HistogramProps, children);
      addPanel(ctx, panel, props as HistogramProps);
      break;
    }

    case 'state-timeline': {
      const panel = buildStateTimelinePanel(
        ctx,
        props as StateTimelineProps,
        children,
      );
      addPanel(ctx, panel, props as StateTimelineProps);
      break;
    }

    case 'status-history': {
      const panel = buildStatusHistoryPanel(
        ctx,
        props as StatusHistoryProps,
        children,
      );
      addPanel(ctx, panel, props as StatusHistoryProps);
      break;
    }

    case 'candlestick': {
      const panel = buildCandlestickPanel(
        ctx,
        props as CandlestickProps,
        children,
      );
      addPanel(ctx, panel, props as CandlestickProps);
      break;
    }

    case 'trend': {
      const panel = buildTrendPanel(ctx, props as TrendProps, children);
      addPanel(ctx, panel, props as TrendProps);
      break;
    }

    case 'xychart': {
      const panel = buildXYChartPanel(ctx, props as XYChartProps, children);
      addPanel(ctx, panel, props as XYChartProps);
      break;
    }

    // Data display panels
    case 'logs': {
      const panel = buildLogsPanel(ctx, props as LogsProps, children);
      addPanel(ctx, panel, props as LogsProps);
      break;
    }

    case 'datagrid': {
      const panel = buildDatagridPanel(ctx, props as DatagridProps, children);
      addPanel(ctx, panel, props as DatagridProps);
      break;
    }

    // Specialized panels
    case 'nodeGraph': {
      const panel = buildNodeGraphPanel(ctx, props as NodeGraphProps, children);
      addPanel(ctx, panel, props as NodeGraphProps);
      break;
    }

    case 'traces': {
      const panel = buildTracesPanel(ctx, props as TracesProps, children);
      addPanel(ctx, panel, props as TracesProps);
      break;
    }

    case 'flamegraph': {
      const panel = buildFlameGraphPanel(
        ctx,
        props as FlameGraphProps,
        children,
      );
      addPanel(ctx, panel, props as FlameGraphProps);
      break;
    }

    case 'canvas': {
      const panel = buildCanvasPanel(ctx, props as CanvasProps, children);
      addPanel(ctx, panel, props as CanvasProps);
      break;
    }

    case 'geomap': {
      const panel = buildGeomapPanel(ctx, props as GeomapProps, children);
      addPanel(ctx, panel, props as GeomapProps);
      break;
    }

    // Widget panels
    case 'dashlist': {
      const panel = buildDashboardListPanel(ctx, props as DashboardListProps);
      addPanel(ctx, panel, props as DashboardListProps);
      break;
    }

    case 'alertlist': {
      const panel = buildAlertListPanel(ctx, props as AlertListProps);
      addPanel(ctx, panel, props as AlertListProps);
      break;
    }

    case 'annolist': {
      const panel = buildAnnotationsListPanel(
        ctx,
        props as AnnotationsListProps,
      );
      addPanel(ctx, panel, props as AnnotationsListProps);
      break;
    }

    case 'news': {
      const panel = buildNewsPanel(ctx, props as NewsProps);
      addPanel(ctx, panel, props as NewsProps);
      break;
    }

    case 'plugin': {
      const panel = buildPluginPanel(ctx, props as PluginPanelProps, children);
      addPanel(ctx, panel, props as PluginPanelProps);
      break;
    }

    case 'business-variable': {
      const panel = buildBusinessVariablePanel(
        ctx,
        props as BusinessVariablePanelProps,
      );
      addPanel(ctx, panel, props as BusinessVariablePanelProps);
      break;
    }

    case 'defaults': {
      const defaultsProps = props as DefaultsProps;
      // Extract just the PanelDefaults properties (exclude children)
      const { children: _children, ...defaults } = defaultsProps;
      // Push defaults onto stack
      ctx.defaultsStack.push(defaults);
      // Process children with these defaults active
      for (const child of children) {
        if (React.isValidElement(child)) {
          processElement(child, ctx);
        }
      }
      // Pop defaults when done
      ctx.defaultsStack.pop();
      break;
    }

    case 'dashboard': {
      // Dashboard is handled at top level
      break;
    }

    default: {
      // Unknown component or function component - try to call it
      const type = element.type;
      if (typeof type === 'function') {
        const result = (type as (p: unknown) => React.ReactElement)(props);
        if (React.isValidElement(result)) {
          processElement(result, ctx);
        }
      }
      // Process children anyway
      for (const child of children) {
        if (React.isValidElement(child)) {
          processElement(child, ctx);
        }
      }
    }
  }
}

function updatePosition(ctx: RenderContext, panel: GrafanaPanel): void {
  // Move X position to the right for next panel
  ctx.currentX = panel.gridPos.x + panel.gridPos.w;
  // Track the max Y in current row for wrapping
  ctx.rowMaxY = Math.max(ctx.rowMaxY, panel.gridPos.y + panel.gridPos.h);
}

/**
 * Add a panel to the context, applying any extend props and updating position.
 * This is a helper that centralizes the common panel addition pattern.
 */
function addPanel(
  ctx: RenderContext,
  panel: GrafanaPanel,
  props: BasePanelProps,
): void {
  // Apply extend prop if provided (deep merge raw JSON into panel)
  if (props.extend) {
    deepMerge(panel as unknown as Record<string, unknown>, props.extend);
  }
  ctx.panels.push(panel);
  updatePosition(ctx, panel);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Options for rendering dashboards
 */
export interface RenderOptions {
  /**
   * Global defaults applied to all panels before dashboard-level defaults.
   * Dashboard defaults override global defaults, and panel props override both.
   * Use the `panels` property for per-panel-type overrides.
   */
  defaults?: ExtendedPanelDefaults;
}

/**
 * Render a React element tree to a Grafana dashboard JSON object
 *
 * @example
 * const dashboard = render(
 *   <Dashboard uid="my-dashboard" title="My Dashboard">
 *     <Row title="Summary">
 *       <Stat title="CPU">query</Stat>
 *     </Row>
 *   </Dashboard>
 * );
 *
 * @example With global defaults
 * const dashboard = render(
 *   <MyDashboard />,
 *   { defaults: { colorMode: 'palette-pastel', axisBorderShow: true } }
 * );
 */
export function render(
  element: React.ReactElement,
  options?: RenderOptions,
): GrafanaDashboard {
  const componentType = getComponentType(element);

  // Handle function components at the root
  if (componentType === null && typeof element.type === 'function') {
    const result = (element.type as () => React.ReactElement)();
    return render(result, options);
  }

  if (componentType !== 'dashboard') {
    throw new Error('Root element must be a Dashboard component');
  }

  const props = element.props as DashboardProps;
  // Merge global defaults with dashboard defaults (dashboard overrides global)
  const mergedDefaults =
    props.defaults || options?.defaults
      ? { ...options?.defaults, ...props.defaults }
      : undefined;
  const ctx = createContext(
    props.datasource,
    props.datasourceType,
    mergedDefaults,
  );

  // Process all children
  const children = getChildren(element);
  for (const child of children) {
    if (React.isValidElement(child)) {
      processElement(child, ctx);
    }
  }

  // Build the dashboard
  const dashboard: GrafanaDashboard = {
    uid: props.uid,
    title: props.title,
    tags: props.tags,
    editable: true,
    refresh: props.refresh === 'auto' ? 'auto' : props.refresh,
    time: props.time
      ? parseTimeRange(props.time)
      : { from: 'now-1h', to: 'now' },
    timezone: props.timezone ?? 'browser',
    graphTooltip: parseTooltip(props.tooltip),
    panels: ctx.panels,
    schemaVersion: 40,
    fiscalYearStartMonth: 0,
  };

  if (ctx.variables.length > 0) {
    dashboard.templating = { list: ctx.variables };
  }

  if (ctx.annotations.length > 0) {
    dashboard.annotations = { list: ctx.annotations };
  }

  if (ctx.links.length > 0) {
    dashboard.links = ctx.links;
  }

  return dashboard;
}

/**
 * Render a React element tree to a JSON string
 *
 * @param element - The React element tree (usually a Dashboard component)
 * @param options - Render options including global defaults and formatting
 */
export function renderToString(
  element: React.ReactElement,
  options?: RenderOptions & { pretty?: boolean },
): string {
  const pretty = options?.pretty ?? true;
  const dashboard = render(element, options);
  return JSON.stringify(dashboard, null, pretty ? 2 : undefined);
}
