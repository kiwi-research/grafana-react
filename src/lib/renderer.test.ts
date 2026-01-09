/**
 * Tests for the renderer
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { render, renderToString } from './renderer.js';
import {
  Dashboard,
  Row,
  Stat,
  Timeseries,
  Table,
  Gauge,
  BarGauge,
  Variable,
  Annotation,
  Link,
  Query,
} from '../components/index.js';

describe('render', () => {
  it('renders a minimal dashboard', () => {
    const element = React.createElement(Dashboard, {
      uid: 'test-dashboard',
      title: 'Test Dashboard',
    });

    const result = render(element);

    assert.strictEqual(result.uid, 'test-dashboard');
    assert.strictEqual(result.title, 'Test Dashboard');
    assert.strictEqual(result.schemaVersion, 40);
    assert.deepStrictEqual(result.panels, []);
  });

  it('renders dashboard with tags and settings', () => {
    const element = React.createElement(Dashboard, {
      uid: 'test',
      title: 'Test',
      tags: ['tag1', 'tag2'],
      time: '6h',
      timezone: 'utc',
      tooltip: 'shared',
    });

    const result = render(element);

    assert.deepStrictEqual(result.tags, ['tag1', 'tag2']);
    assert.deepStrictEqual(result.time, { from: 'now-6h', to: 'now' });
    assert.strictEqual(result.timezone, 'utc');
    assert.strictEqual(result.graphTooltip, 2);
  });

  it('renders variables', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Variable,
        { name: 'instance', label: 'Instance', multi: true },
        'label_values(up, instance)',
      ),
    );

    const result = render(element);

    assert.strictEqual(result.templating?.list.length, 1);
    const variable = result.templating!.list[0];
    assert.strictEqual(variable.name, 'instance');
    assert.strictEqual(variable.label, 'Instance');
    assert.strictEqual(variable.multi, true);
    assert.strictEqual(variable.includeAll, true);
    assert.deepStrictEqual(variable.query, {
      query: 'label_values(up, instance)',
      refId: 'VariableQueryEditor-VariableQuery',
      qryType: 1,
    });
  });

  it('renders annotations', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Annotation,
        { name: 'Alerts', color: 'light-red', title: '{{alertname}}' },
        'ALERTS{alertstate="firing"}',
      ),
    );

    const result = render(element);

    assert.strictEqual(result.annotations?.list.length, 1);
    const annotation = result.annotations!.list[0];
    assert.strictEqual(annotation.name, 'Alerts');
    assert.strictEqual(annotation.iconColor, 'light-red');
    assert.strictEqual(annotation.expr, 'ALERTS{alertstate="firing"}');
  });

  it('renders links', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test' },
      React.createElement(Link, {
        title: 'Docs',
        url: 'https://example.com',
        icon: 'external',
        keepTime: true,
      }),
    );

    const result = render(element);

    assert.strictEqual(result.links?.length, 1);
    const link = result.links![0];
    assert.strictEqual(link.title, 'Docs');
    assert.strictEqual(link.url, 'https://example.com');
    assert.strictEqual(link.icon, 'external');
    assert.strictEqual(link.keepTime, true);
  });

  it('renders rows with panels', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Summary' },
        React.createElement(
          Stat,
          { title: 'CPU %', unit: 'percent' },
          '100 - avg(cpu_idle)',
        ),
      ),
    );

    const result = render(element);

    assert.strictEqual(result.panels.length, 2);

    const row = result.panels[0];
    assert.strictEqual(row.type, 'row');
    assert.strictEqual(row.title, 'Summary');

    const stat = result.panels[1];
    assert.strictEqual(stat.type, 'stat');
    assert.strictEqual(stat.title, 'CPU %');
    assert.strictEqual(stat.targets?.[0].expr, '100 - avg(cpu_idle)');
  });

  it('renders stat panel with thresholds', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Memory',
          unit: 'percent',
          thresholds: { 70: 'yellow', 90: 'red' },
          colorMode: 'background',
        },
        'memory_usage_percent',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];

    assert.strictEqual(panel.fieldConfig?.defaults.unit, 'percent');
    assert.deepStrictEqual(panel.fieldConfig?.defaults.thresholds?.steps, [
      { value: null, color: 'green' },
      { value: 70, color: '#EAB839' },
      { value: 90, color: 'red' },
    ]);
  });

  it('renders timeseries with multiple queries', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        { title: 'CPU', stack: true, legend: 'right' },
        React.createElement(
          Query,
          { refId: 'user', legend: 'User' },
          'cpu_user',
        ),
        React.createElement(
          Query,
          { refId: 'system', legend: 'System' },
          'cpu_system',
        ),
      ),
    );

    const result = render(element);
    const panel = result.panels[0];

    assert.strictEqual(panel.targets?.length, 2);
    assert.strictEqual(panel.targets?.[0].refId, 'user');
    assert.strictEqual(panel.targets?.[0].legendFormat, 'User');
    assert.strictEqual(panel.targets?.[1].refId, 'system');
    assert.strictEqual(panel.targets?.[1].legendFormat, 'System');
  });

  it('renders timeseries with stacking and thresholds', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        {
          title: 'Usage',
          stack: 'normal',
          fill: 50,
          thresholds: { 75: 'yellow', 85: 'red' },
          thresholdStyle: 'dashed+area',
        },
        'usage_metric',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];

    const custom = panel.fieldConfig?.defaults.custom as
      | Record<string, unknown>
      | undefined;
    assert.strictEqual(
      (custom?.['stacking'] as { mode: string } | undefined)?.mode,
      'normal',
    );
    assert.strictEqual(custom?.['fillOpacity'], 50);
    assert.strictEqual(
      (custom?.['thresholdsStyle'] as { mode: string } | undefined)?.mode,
      'dashed+area',
    );
  });

  it('handles function components', () => {
    const MyDashboard = () =>
      React.createElement(
        Dashboard,
        { uid: 'my-dashboard', title: 'My Dashboard' },
        React.createElement(Stat, { title: 'Test' }, 'metric'),
      );

    const result = render(React.createElement(MyDashboard));

    assert.strictEqual(result.uid, 'my-dashboard');
    assert.strictEqual(result.panels.length, 1);
  });

  it('throws for non-dashboard root', () => {
    const element = React.createElement(Stat, { title: 'Test' }, 'metric');

    assert.throws(() => render(element), /Root element must be a Dashboard/);
  });
});

describe('renderToString', () => {
  it('returns formatted JSON string', () => {
    const element = React.createElement(Dashboard, {
      uid: 'test',
      title: 'Test',
    });

    const result = renderToString(element);

    assert.ok(result.includes('"uid": "test"'));
    assert.ok(result.includes('\n')); // Pretty printed
  });

  it('returns minified JSON when pretty=false', () => {
    const element = React.createElement(Dashboard, {
      uid: 'test',
      title: 'Test',
    });

    const result = renderToString(element, false);

    assert.ok(!result.includes('\n'));
  });
});

describe('Table panel', () => {
  it('renders basic table', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(Table, { title: 'Status' }, 'up'),
    );

    const result = render(element);
    const panel = result.panels[0];

    assert.strictEqual(panel.type, 'table');
    assert.strictEqual(panel.title, 'Status');
    assert.strictEqual(panel.targets?.[0].format, 'table');
    assert.strictEqual(panel.targets?.[0].instant, true);
  });

  it('renders with table options', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Table,
        {
          title: 'Status',
          cellHeight: 'md',
          enablePagination: true,
          showHeader: false,
          frozenColumns: { left: 1 },
        },
        'up',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const options = panel.options as Record<string, unknown>;

    assert.strictEqual(options.cellHeight, 'md');
    assert.strictEqual(options.enablePagination, true);
    assert.strictEqual(options.showHeader, false);
    assert.strictEqual(options.frameIndex, 0);
  });
});

describe('Gauge panel', () => {
  it('renders basic gauge with thresholds', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Gauge,
        {
          title: 'CPU',
          unit: 'percent',
          min: 0,
          max: 100,
          thresholds: { 70: 'yellow', 90: 'red' },
        },
        'cpu_usage',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];

    assert.strictEqual(panel.type, 'gauge');
    assert.strictEqual(panel.fieldConfig?.defaults.unit, 'percent');
    assert.strictEqual(panel.fieldConfig?.defaults.min, 0);
    assert.strictEqual(panel.fieldConfig?.defaults.max, 100);
    assert.deepStrictEqual(panel.fieldConfig?.defaults.thresholds?.steps, [
      { value: null, color: 'green' },
      { value: 70, color: '#EAB839' },
      { value: 90, color: 'red' },
    ]);
  });

  it('renders with viz options', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Gauge,
        {
          title: 'CPU',
          minVizWidth: 100,
          minVizHeight: 100,
          sizing: 'manual',
          orientation: 'horizontal',
        },
        'cpu_usage',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const options = panel.options as Record<string, unknown>;

    assert.strictEqual(options.minVizWidth, 100);
    assert.strictEqual(options.minVizHeight, 100);
    assert.strictEqual(options.sizing, 'manual');
    assert.strictEqual(options.orientation, 'horizontal');
  });
});

describe('BarGauge panel', () => {
  it('renders basic bar gauge', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        BarGauge,
        {
          title: 'Memory',
          displayMode: 'gradient',
          min: 0,
          max: 100,
        },
        'memory_usage',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const options = panel.options as Record<string, unknown>;

    assert.strictEqual(panel.type, 'bargauge');
    assert.strictEqual(options.displayMode, 'gradient');
  });

  it('renders with advanced options', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        BarGauge,
        {
          title: 'Memory',
          showUnfilled: true,
          minVizWidth: 50,
          minVizHeight: 20,
          valueMode: 'text',
          namePlacement: 'left',
        },
        'memory_usage',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const options = panel.options as Record<string, unknown>;

    assert.strictEqual(options.showUnfilled, true);
    assert.strictEqual(options.minVizWidth, 50);
    assert.strictEqual(options.minVizHeight, 20);
    assert.strictEqual(options.valueMode, 'text');
    assert.strictEqual(options.namePlacement, 'left');
  });
});

describe('Stat panel new props', () => {
  it('renders stat with percent change options', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Users',
          showPercentChange: true,
          percentChangeColorMode: 'inverted',
        },
        'user_count',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const options = panel.options as Record<string, unknown>;

    assert.strictEqual(options.showPercentChange, true);
    assert.strictEqual(options.percentChangeColorMode, 'inverted');
  });

  it('renders stat with layout options', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Users',
          justifyMode: 'center',
          wideLayout: false,
          orientation: 'horizontal',
        },
        'user_count',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const options = panel.options as Record<string, unknown>;

    assert.strictEqual(options.justifyMode, 'center');
    assert.strictEqual(options.wideLayout, false);
    assert.strictEqual(options.orientation, 'horizontal');
  });
});

describe('Timeseries panel new props', () => {
  it('renders with tooltip config object', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        {
          title: 'RPS',
          tooltip: { mode: 'single', sort: 'desc', maxHeight: 300 },
        },
        'rate(requests[5m])',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const options = panel.options as Record<string, unknown>;
    const tooltip = options.tooltip as Record<string, unknown>;

    assert.strictEqual(tooltip.mode, 'single');
    assert.strictEqual(tooltip.sort, 'desc');
    assert.strictEqual(tooltip.maxHeight, 300);
  });

  it('renders with point options', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        {
          title: 'RPS',
          showPoints: 'always',
          pointSize: 8,
        },
        'rate(requests[5m])',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const custom = panel.fieldConfig?.defaults.custom as Record<
      string,
      unknown
    >;

    assert.strictEqual(custom?.showPoints, 'always');
    assert.strictEqual(custom?.pointSize, 8);
  });

  it('renders with axis config', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        {
          title: 'RPS',
          axisPlacement: 'left',
          axisLabel: 'Requests/sec',
          axisWidth: 60,
        },
        'rate(requests[5m])',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const custom = panel.fieldConfig?.defaults.custom as Record<
      string,
      unknown
    >;

    assert.strictEqual(custom?.axisPlacement, 'left');
    assert.strictEqual(custom?.axisLabel, 'Requests/sec');
    assert.strictEqual(custom?.axisWidth, 60);
  });

  it('renders with line style and span nulls', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        {
          title: 'RPS',
          lineStyle: 'dash',
          spanNulls: true,
        },
        'rate(requests[5m])',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const custom = panel.fieldConfig?.defaults.custom as Record<
      string,
      unknown
    >;

    assert.deepStrictEqual(custom?.lineStyle, { fill: 'dash' });
    assert.strictEqual(custom?.spanNulls, true);
  });
});

// ============================================================================
// Panel Positioning and Wrapping Tests
// ============================================================================

describe('Panel positioning', () => {
  it('places panels horizontally side by side', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(Stat, { title: 'A', width: 6 }, 'metric_a'),
      React.createElement(Stat, { title: 'B', width: 6 }, 'metric_b'),
      React.createElement(Stat, { title: 'C', width: 6 }, 'metric_c'),
    );

    const result = render(element);

    assert.strictEqual(result.panels[0].gridPos.x, 0);
    assert.strictEqual(result.panels[0].gridPos.y, 0);
    assert.strictEqual(result.panels[1].gridPos.x, 6);
    assert.strictEqual(result.panels[1].gridPos.y, 0);
    assert.strictEqual(result.panels[2].gridPos.x, 12);
    assert.strictEqual(result.panels[2].gridPos.y, 0);
  });

  it('wraps to next row when panel does not fit', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(Stat, { title: 'A', width: 12 }, 'metric_a'),
      React.createElement(Stat, { title: 'B', width: 12 }, 'metric_b'),
      React.createElement(Stat, { title: 'C', width: 12 }, 'metric_c'),
    );

    const result = render(element);

    // First panel at (0, 0)
    assert.strictEqual(result.panels[0].gridPos.x, 0);
    assert.strictEqual(result.panels[0].gridPos.y, 0);
    // Second panel at (12, 0) - fits on same row
    assert.strictEqual(result.panels[1].gridPos.x, 12);
    assert.strictEqual(result.panels[1].gridPos.y, 0);
    // Third panel wraps to (0, 8)
    assert.strictEqual(result.panels[2].gridPos.x, 0);
    assert.strictEqual(result.panels[2].gridPos.y, 8); // default height is 8
  });

  it('uses explicit x/y positions when provided', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        { title: 'A', width: 6, x: 10, y: 5 },
        'metric_a',
      ),
    );

    const result = render(element);

    assert.strictEqual(result.panels[0].gridPos.x, 10);
    assert.strictEqual(result.panels[0].gridPos.y, 5);
  });

  it('handles panels with different heights', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        { title: 'A', width: 12, height: 4 },
        'metric_a',
      ),
      React.createElement(
        Stat,
        { title: 'B', width: 12, height: 10 },
        'metric_b',
      ),
      React.createElement(Stat, { title: 'C', width: 24 }, 'metric_c'),
    );

    const result = render(element);

    // A at (0, 0) with height 4
    assert.strictEqual(result.panels[0].gridPos.x, 0);
    assert.strictEqual(result.panels[0].gridPos.y, 0);
    assert.strictEqual(result.panels[0].gridPos.h, 4);

    // B at (12, 0) with height 10
    assert.strictEqual(result.panels[1].gridPos.x, 12);
    assert.strictEqual(result.panels[1].gridPos.y, 0);
    assert.strictEqual(result.panels[1].gridPos.h, 10);

    // C wraps to y=10 (max height of previous row)
    assert.strictEqual(result.panels[2].gridPos.x, 0);
    assert.strictEqual(result.panels[2].gridPos.y, 10);
  });

  it('uses default width of 12 and height of 8', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(Stat, { title: 'A' }, 'metric'),
    );

    const result = render(element);

    assert.strictEqual(result.panels[0].gridPos.w, 12);
    assert.strictEqual(result.panels[0].gridPos.h, 8);
  });

  it('fills entire row with width 24', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(Stat, { title: 'A', width: 24 }, 'metric_a'),
      React.createElement(Stat, { title: 'B', width: 6 }, 'metric_b'),
    );

    const result = render(element);

    assert.strictEqual(result.panels[0].gridPos.x, 0);
    assert.strictEqual(result.panels[0].gridPos.w, 24);
    // B should wrap to next row
    assert.strictEqual(result.panels[1].gridPos.x, 0);
    assert.strictEqual(result.panels[1].gridPos.y, 8);
  });
});

describe('Row positioning', () => {
  it('places row panel at full width', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(Row, { title: 'Section A' }),
    );

    const result = render(element);
    const row = result.panels[0];

    assert.strictEqual(row.type, 'row');
    assert.strictEqual(row.gridPos.x, 0);
    assert.strictEqual(row.gridPos.w, 24);
    assert.strictEqual(row.gridPos.h, 1);
  });

  it('positions panels after row correctly', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Section' },
        React.createElement(Stat, { title: 'A', width: 12 }, 'metric'),
      ),
    );

    const result = render(element);

    // Row at y=0
    assert.strictEqual(result.panels[0].type, 'row');
    assert.strictEqual(result.panels[0].gridPos.y, 0);

    // Panel at y=1 (after row)
    assert.strictEqual(result.panels[1].type, 'stat');
    assert.strictEqual(result.panels[1].gridPos.y, 1);
    assert.strictEqual(result.panels[1].gridPos.x, 0);
  });

  it('stacks multiple rows correctly', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row 1' },
        React.createElement(Stat, { title: 'A', height: 6 }, 'metric_a'),
      ),
      React.createElement(
        Row,
        { title: 'Row 2' },
        React.createElement(Stat, { title: 'B', height: 4 }, 'metric_b'),
      ),
    );

    const result = render(element);

    // Row 1 at y=0
    assert.strictEqual(result.panels[0].gridPos.y, 0);
    // Panel A at y=1
    assert.strictEqual(result.panels[1].gridPos.y, 1);
    // Row 2 at y=7 (1 + 6 = 7)
    assert.strictEqual(result.panels[2].gridPos.y, 7);
    // Panel B at y=8
    assert.strictEqual(result.panels[3].gridPos.y, 8);
  });

  it('applies row padding to child panels', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Padded Row', padding: 2 },
        React.createElement(Stat, { title: 'A', width: 10 }, 'metric_a'),
        React.createElement(Stat, { title: 'B', width: 10 }, 'metric_b'),
      ),
    );

    const result = render(element);

    // First panel starts at x=2 (left padding)
    assert.strictEqual(result.panels[1].gridPos.x, 2);
    // Second panel at x=12
    assert.strictEqual(result.panels[2].gridPos.x, 12);
  });

  it('wraps panels within row accounting for padding', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Padded Row', paddingLeft: 2, paddingRight: 2 },
        // Available width = 24 - 2 - 2 = 20
        React.createElement(Stat, { title: 'A', width: 10 }, 'metric_a'),
        React.createElement(Stat, { title: 'B', width: 10 }, 'metric_b'),
        React.createElement(Stat, { title: 'C', width: 10 }, 'metric_c'),
      ),
    );

    const result = render(element);

    // A at x=2
    assert.strictEqual(result.panels[1].gridPos.x, 2);
    assert.strictEqual(result.panels[1].gridPos.y, 1);

    // B at x=12 (2 + 10)
    assert.strictEqual(result.panels[2].gridPos.x, 12);
    assert.strictEqual(result.panels[2].gridPos.y, 1);

    // C wraps to next line at x=2
    assert.strictEqual(result.panels[3].gridPos.x, 2);
    assert.strictEqual(result.panels[3].gridPos.y, 9); // 1 + 8 = 9
  });

  it('resets padding after row ends', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Padded Row', padding: 4 },
        React.createElement(Stat, { title: 'A', width: 8 }, 'metric_a'),
      ),
      React.createElement(Stat, { title: 'B', width: 8 }, 'metric_b'),
    );

    const result = render(element);

    // A inside padded row at x=4
    assert.strictEqual(result.panels[1].gridPos.x, 4);

    // B outside row should be at x=0 (no padding)
    assert.strictEqual(result.panels[2].gridPos.x, 0);
  });
});

describe('Panel IDs', () => {
  it('assigns sequential panel IDs', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(Stat, { title: 'A' }, 'metric_a'),
      React.createElement(Stat, { title: 'B' }, 'metric_b'),
      React.createElement(Stat, { title: 'C' }, 'metric_c'),
    );

    const result = render(element);

    assert.strictEqual(result.panels[0].id, 1);
    assert.strictEqual(result.panels[1].id, 2);
    assert.strictEqual(result.panels[2].id, 3);
  });

  it('includes row panels in ID sequence', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row' },
        React.createElement(Stat, { title: 'A' }, 'metric'),
      ),
    );

    const result = render(element);

    assert.strictEqual(result.panels[0].id, 1); // row
    assert.strictEqual(result.panels[1].id, 2); // stat
  });
});
