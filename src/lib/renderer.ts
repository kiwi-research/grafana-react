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
  GrafanaDashboard,
  GrafanaPanel,
  GrafanaTarget,
  GrafanaVariable,
  GrafanaAnnotation,
  GrafanaLink,
  GrafanaOverride,
} from '../types/grafana-json.js';
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
  nextRefId,
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
}

function createContext(
  datasourceUid?: string,
  datasourceType: string = 'prometheus',
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
  };
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
    x?: number;
    y?: number;
    repeat?: string;
    repeatDirection?: 'v' | 'h';
  },
  children: React.ReactNode[],
): GrafanaPanel {
  const id = ctx.panelId++;
  const width = props.width ?? 12;
  const height = props.height ?? 8;

  // If explicit position given, use it
  // Otherwise, calculate based on current position
  let x: number;
  let y: number;

  // Calculate available width accounting for padding
  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;

  if (props.x !== undefined && props.y !== undefined) {
    x = props.x;
    y = props.y;
  } else {
    // Check if panel fits on current row (accounting for padding)
    const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
    if (effectiveX + width > availableWidth) {
      // Wrap to next row
      ctx.currentX = ctx.rowPaddingLeft;
      ctx.currentY = ctx.rowMaxY;
    }
    x = ctx.currentX;
    y = ctx.currentY;
  }

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
  const baseColor = props.baseColor ?? 'green';

  // Build overrides from props
  const overrides = props.overrides
    ? buildOverrides(props.overrides, baseColor)
    : [];

  panel.fieldConfig = {
    defaults: {
      color: { mode: 'thresholds' },
      mappings: [],
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
      unit: props.unit,
      decimals: props.decimals,
      noValue: props.noValue,
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
    colorMode?: 'shades' | 'fixed';
    displayName?: string;
    thresholds?: unknown;
  }>,
  baseColor: string,
): GrafanaOverride[] {
  const overrides: GrafanaOverride[] = [];
  for (const override of configs) {
    const properties: { id: string; value: unknown }[] = [];
    if (override.color) {
      properties.push({
        id: 'color',
        value: {
          fixedColor: override.color,
          mode: override.colorMode ?? 'fixed',
        },
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
  const legend = normalizeLegend(props.legend);
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
      color: { mode: props.colorMode ?? 'palette-classic' },
      custom: {
        axisBorderShow: props.axisBorderShow ?? false,
        axisCenteredZero: props.centerZero ?? false,
        axisColorMode: props.axisColorMode ?? 'text',
        axisGridShow: props.axisGridShow,
        axisLabel: props.axisLabel ?? '',
        axisPlacement: props.axisPlacement ?? 'auto',
        axisSoftMin: props.softMin,
        axisSoftMax: props.softMax,
        axisWidth: props.axisWidth,
        barAlignment: props.barAlignment,
        barMaxWidth: props.barMaxWidth,
        drawStyle: props.drawStyle,
        fillOpacity: props.fill,
        gradientMode: props.gradientMode,
        hideFrom: { legend: false, tooltip: false, viz: false },
        lineInterpolation: props.lineInterpolation,
        lineStyle,
        lineWidth: props.lineWidth,
        pointSize: props.pointSize,
        scaleDistribution,
        showPoints: props.showPoints ?? 'auto',
        spanNulls: props.spanNulls,
        stacking: { group: 'A', mode: stackMode },
        thresholdsStyle: { mode: props.thresholdStyle ?? 'off' },
      },
      decimals: props.decimals,
      mappings: [],
      min: props.min,
      max: props.max,
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
      unit: props.unit,
    },
    overrides,
  };

  panel.options = {
    legend: {
      calcs: legend.calcs,
      displayMode: legend.displayMode,
      placement: legend.placement,
      showLegend: legend.displayMode !== 'hidden',
      sortBy: legend.sortBy,
      sortDesc: legend.sortDesc,
    },
    tooltip: {
      mode: tooltip.mode,
      sort: tooltip.sort,
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

  panel.fieldConfig = {
    defaults: {
      color: { mode: 'thresholds' },
      mappings: [],
      min: props.min,
      max: props.max,
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds),
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

  // Build overrides from props
  const overrides = props.overrides
    ? buildOverrides(props.overrides, 'green')
    : [];

  panel.fieldConfig = {
    defaults: {
      color: { mode: 'thresholds' },
      mappings: [],
      min: props.min,
      max: props.max,
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds),
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
      if (properties.length > 0) {
        overrides.push({
          matcher: { id: 'byName', options: col.name },
          properties,
        });
      }
    }
  }

  panel.fieldConfig = {
    defaults: {
      color: { mode: 'thresholds' },
      custom: { align: 'auto', cellOptions: { type: 'auto' }, inspect: false },
      decimals: props.decimals,
      mappings: [],
      thresholds: {
        mode: 'absolute',
        steps: normalizeThresholds(props.thresholds, baseColor),
      },
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
  const legend = normalizeLegend(props.legend);
  const baseColor = 'green';

  const overrides = props.overrides
    ? buildOverrides(props.overrides, baseColor)
    : [];

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? 'palette-classic' },
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

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? 'palette-classic' },
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
  const legend = normalizeLegend(props.legend);
  const baseColor = 'green';

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? 'thresholds' },
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
  const legend = normalizeLegend(props.legend);
  const baseColor = 'green';

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? 'thresholds' },
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
  const legend = normalizeLegend(props.legend);

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? 'palette-classic' },
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
  const legend = normalizeLegend(props.legend);

  panel.fieldConfig = {
    defaults: {
      color: { mode: props.colorMode ?? 'palette-classic' },
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

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;
  let x: number;
  let y: number;

  if (props.x !== undefined && props.y !== undefined) {
    x = props.x;
    y = props.y;
  } else {
    const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
    if (effectiveX + width > availableWidth) {
      ctx.currentX = ctx.rowPaddingLeft;
      ctx.currentY = ctx.rowMaxY;
    }
    x = ctx.currentX;
    y = ctx.currentY;
  }

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

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;
  let x: number;
  let y: number;

  if (props.x !== undefined && props.y !== undefined) {
    x = props.x;
    y = props.y;
  } else {
    const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
    if (effectiveX + width > availableWidth) {
      ctx.currentX = ctx.rowPaddingLeft;
      ctx.currentY = ctx.rowMaxY;
    }
    x = ctx.currentX;
    y = ctx.currentY;
  }

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

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;
  let x: number;
  let y: number;

  if (props.x !== undefined && props.y !== undefined) {
    x = props.x;
    y = props.y;
  } else {
    const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
    if (effectiveX + width > availableWidth) {
      ctx.currentX = ctx.rowPaddingLeft;
      ctx.currentY = ctx.rowMaxY;
    }
    x = ctx.currentX;
    y = ctx.currentY;
  }

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

  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;
  let x: number;
  let y: number;

  if (props.x !== undefined && props.y !== undefined) {
    x = props.x;
    y = props.y;
  } else {
    const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
    if (effectiveX + width > availableWidth) {
      ctx.currentX = ctx.rowPaddingLeft;
      ctx.currentY = ctx.rowMaxY;
    }
    x = ctx.currentX;
    y = ctx.currentY;
  }

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

  // Calculate position
  const availableWidth = 24 - ctx.rowPaddingLeft - ctx.rowPaddingRight;
  let x: number;
  let y: number;

  if (props.x !== undefined) {
    // Use explicit x position
    x = props.x;
    y = props.y ?? ctx.currentY;
  } else {
    const effectiveX = ctx.currentX - ctx.rowPaddingLeft;
    if (effectiveX + width > availableWidth) {
      ctx.currentX = ctx.rowPaddingLeft;
      ctx.currentY = ctx.rowMaxY;
    }
    x = ctx.currentX;
    y = ctx.currentY;
  }

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

    case 'stat': {
      const panel = buildStatPanel(ctx, props as StatProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'timeseries': {
      const panel = buildTimeseriesPanel(
        ctx,
        props as TimeseriesProps,
        children,
      );
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'bargauge': {
      const panel = buildBarGaugePanel(ctx, props as BarGaugeProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'heatmap': {
      const panel = buildHeatmapPanel(ctx, props as HeatmapProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'gauge': {
      const panel = buildGaugePanel(ctx, props as GaugeProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'table': {
      const panel = buildTablePanel(ctx, props as TableProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'text': {
      const panel = buildTextPanel(ctx, props as TextProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    // Chart panels
    case 'barchart': {
      const panel = buildBarChartPanel(ctx, props as BarChartProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'piechart': {
      const panel = buildPieChartPanel(ctx, props as PieChartProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'histogram': {
      const panel = buildHistogramPanel(ctx, props as HistogramProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'state-timeline': {
      const panel = buildStateTimelinePanel(
        ctx,
        props as StateTimelineProps,
        children,
      );
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'status-history': {
      const panel = buildStatusHistoryPanel(
        ctx,
        props as StatusHistoryProps,
        children,
      );
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'candlestick': {
      const panel = buildCandlestickPanel(
        ctx,
        props as CandlestickProps,
        children,
      );
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'trend': {
      const panel = buildTrendPanel(ctx, props as TrendProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'xychart': {
      const panel = buildXYChartPanel(ctx, props as XYChartProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    // Data display panels
    case 'logs': {
      const panel = buildLogsPanel(ctx, props as LogsProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'datagrid': {
      const panel = buildDatagridPanel(ctx, props as DatagridProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    // Specialized panels
    case 'nodeGraph': {
      const panel = buildNodeGraphPanel(ctx, props as NodeGraphProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'traces': {
      const panel = buildTracesPanel(ctx, props as TracesProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'flamegraph': {
      const panel = buildFlameGraphPanel(
        ctx,
        props as FlameGraphProps,
        children,
      );
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'canvas': {
      const panel = buildCanvasPanel(ctx, props as CanvasProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'geomap': {
      const panel = buildGeomapPanel(ctx, props as GeomapProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    // Widget panels
    case 'dashlist': {
      const panel = buildDashboardListPanel(ctx, props as DashboardListProps);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'alertlist': {
      const panel = buildAlertListPanel(ctx, props as AlertListProps);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'annolist': {
      const panel = buildAnnotationsListPanel(
        ctx,
        props as AnnotationsListProps,
      );
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'news': {
      const panel = buildNewsPanel(ctx, props as NewsProps);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'plugin': {
      const panel = buildPluginPanel(ctx, props as PluginPanelProps, children);
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
      break;
    }

    case 'business-variable': {
      const panel = buildBusinessVariablePanel(
        ctx,
        props as BusinessVariablePanelProps,
      );
      ctx.panels.push(panel);
      updatePosition(ctx, panel);
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

// ============================================================================
// Public API
// ============================================================================

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
 */
export function render(element: React.ReactElement): GrafanaDashboard {
  const componentType = getComponentType(element);

  // Handle function components at the root
  if (componentType === null && typeof element.type === 'function') {
    const result = (element.type as () => React.ReactElement)();
    return render(result);
  }

  if (componentType !== 'dashboard') {
    throw new Error('Root element must be a Dashboard component');
  }

  const props = element.props as DashboardProps;
  const ctx = createContext(props.datasource, props.datasourceType);

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
 */
export function renderToString(
  element: React.ReactElement,
  pretty = true,
): string {
  const dashboard = render(element);
  return JSON.stringify(dashboard, null, pretty ? 2 : undefined);
}
