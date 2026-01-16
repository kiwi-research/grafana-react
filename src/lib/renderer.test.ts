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
  Container,
  Stat,
  Timeseries,
  Table,
  Gauge,
  BarGauge,
  Variable,
  Annotation,
  Link,
  Query,
  Defaults,
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

    const result = renderToString(element, { pretty: false });

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

  it('uses marginLeft to offset panel position', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        { title: 'A', width: 6, marginLeft: 10 },
        'metric_a',
      ),
    );

    const result = render(element);

    assert.strictEqual(result.panels[0].gridPos.x, 10);
    assert.strictEqual(result.panels[0].gridPos.y, 0);
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

describe('Container positioning', () => {
  it('places panels vertically within fixed-width container', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row' },
        React.createElement(
          Container,
          { width: 2 },
          // Each panel fills container width and stacks vertically
          React.createElement(
            Stat,
            { title: 'A', width: 2, height: 2 },
            'metric_a',
          ),
          React.createElement(
            Stat,
            { title: 'B', width: 2, height: 2 },
            'metric_b',
          ),
          React.createElement(
            Stat,
            { title: 'C', width: 2, height: 2 },
            'metric_c',
          ),
        ),
      ),
    );

    const result = render(element);

    // Row panel at index 0
    // A at (0, 1) - row starts at y=1
    assert.strictEqual(result.panels[1].gridPos.x, 0);
    assert.strictEqual(result.panels[1].gridPos.y, 1);
    // B at (0, 3) - stacked below A
    assert.strictEqual(result.panels[2].gridPos.x, 0);
    assert.strictEqual(result.panels[2].gridPos.y, 3);
    // C at (0, 5) - stacked below B
    assert.strictEqual(result.panels[3].gridPos.x, 0);
    assert.strictEqual(result.panels[3].gridPos.y, 5);
  });

  it('places container next to other panels', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row' },
        React.createElement(
          Container,
          { width: 2 },
          React.createElement(
            Stat,
            { title: 'A', width: 2, height: 2 },
            'metric_a',
          ),
          React.createElement(
            Stat,
            { title: 'B', width: 2, height: 2 },
            'metric_b',
          ),
        ),
        // Panel after container should start at x=2
        React.createElement(
          Stat,
          { title: 'C', width: 6, height: 4 },
          'metric_c',
        ),
      ),
    );

    const result = render(element);

    // A at (0, 1)
    assert.strictEqual(result.panels[1].gridPos.x, 0);
    assert.strictEqual(result.panels[1].gridPos.y, 1);
    // B at (0, 3)
    assert.strictEqual(result.panels[2].gridPos.x, 0);
    assert.strictEqual(result.panels[2].gridPos.y, 3);
    // C at (2, 1) - starts after container
    assert.strictEqual(result.panels[3].gridPos.x, 2);
    assert.strictEqual(result.panels[3].gridPos.y, 1);
  });

  it('calculates row height from container height', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row 1' },
        React.createElement(
          Container,
          { width: 2 },
          React.createElement(
            Stat,
            { title: 'A', width: 2, height: 2 },
            'metric_a',
          ),
          React.createElement(
            Stat,
            { title: 'B', width: 2, height: 2 },
            'metric_b',
          ),
          React.createElement(
            Stat,
            { title: 'C', width: 2, height: 2 },
            'metric_c',
          ),
        ),
        // This panel is shorter than the container
        React.createElement(
          Stat,
          { title: 'D', width: 6, height: 4 },
          'metric_d',
        ),
      ),
      React.createElement(
        Row,
        { title: 'Row 2' },
        React.createElement(Stat, { title: 'E', width: 6 }, 'metric_e'),
      ),
    );

    const result = render(element);

    // Container height = 6 (3 panels * 2 height each)
    // D height = 4
    // Row 1 max height = 6
    // Row 2 should start at y = 1 (row header) + 6 (container) = 7
    assert.strictEqual(result.panels[5].gridPos.y, 7); // Row 2 header
    assert.strictEqual(result.panels[6].gridPos.y, 8); // E panel
  });

  it('supports fill to take remaining width', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row' },
        React.createElement(
          Container,
          { width: 4 },
          React.createElement(
            Stat,
            { title: 'A', width: 4, height: 2 },
            'metric_a',
          ),
        ),
        React.createElement(
          Container,
          { fill: true },
          // Container has 20 units (24 - 4), so 10-width panels fit 2 per row
          React.createElement(
            Stat,
            { title: 'B', width: 10, height: 4 },
            'metric_b',
          ),
          React.createElement(
            Stat,
            { title: 'C', width: 10, height: 4 },
            'metric_c',
          ),
          React.createElement(
            Stat,
            { title: 'D', width: 10, height: 4 },
            'metric_d',
          ),
        ),
      ),
    );

    const result = render(element);

    // A at (0, 1)
    assert.strictEqual(result.panels[1].gridPos.x, 0);
    assert.strictEqual(result.panels[1].gridPos.y, 1);
    // B at (4, 1) - fill container starts at x=4
    assert.strictEqual(result.panels[2].gridPos.x, 4);
    assert.strictEqual(result.panels[2].gridPos.y, 1);
    // C at (14, 1) - next to B
    assert.strictEqual(result.panels[3].gridPos.x, 14);
    assert.strictEqual(result.panels[3].gridPos.y, 1);
    // D at (4, 5) - wraps to next row within container
    assert.strictEqual(result.panels[4].gridPos.x, 4);
    assert.strictEqual(result.panels[4].gridPos.y, 5);
  });

  it('throws error when panel exceeds container width', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row' },
        React.createElement(
          Container,
          { width: 4 },
          React.createElement(
            Stat,
            { title: 'A', width: 6, height: 2 },
            'metric_a',
          ),
        ),
      ),
    );

    assert.throws(() => render(element), /exceeds container width/);
  });

  it('throws error when container has neither width nor fill', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row' },
        React.createElement(
          Container,
          {},
          React.createElement(Stat, { title: 'A', width: 2 }, 'metric_a'),
        ),
      ),
    );

    assert.throws(() => render(element), /must have either width or fill/);
  });

  it('handles horizontal layout within container', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row' },
        React.createElement(
          Container,
          { width: 12 },
          // Two 6-width panels fit side by side
          React.createElement(
            Stat,
            { title: 'A', width: 6, height: 4 },
            'metric_a',
          ),
          React.createElement(
            Stat,
            { title: 'B', width: 6, height: 4 },
            'metric_b',
          ),
          // Third wraps to next row
          React.createElement(
            Stat,
            { title: 'C', width: 6, height: 4 },
            'metric_c',
          ),
        ),
      ),
    );

    const result = render(element);

    // A at (0, 1)
    assert.strictEqual(result.panels[1].gridPos.x, 0);
    assert.strictEqual(result.panels[1].gridPos.y, 1);
    // B at (6, 1) - same row
    assert.strictEqual(result.panels[2].gridPos.x, 6);
    assert.strictEqual(result.panels[2].gridPos.y, 1);
    // C at (0, 5) - wrapped
    assert.strictEqual(result.panels[3].gridPos.x, 0);
    assert.strictEqual(result.panels[3].gridPos.y, 5);
  });

  it('respects row padding with containers', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Row,
        { title: 'Row', padding: 2 },
        // Available width = 24 - 2 - 2 = 20
        React.createElement(
          Container,
          { width: 4 },
          React.createElement(
            Stat,
            { title: 'A', width: 4, height: 2 },
            'metric_a',
          ),
          React.createElement(
            Stat,
            { title: 'B', width: 4, height: 2 },
            'metric_b',
          ),
        ),
        React.createElement(
          Container,
          { fill: true },
          // Fill container gets remaining width: 20 - 4 = 16
          React.createElement(
            Stat,
            { title: 'C', width: 8, height: 4 },
            'metric_c',
          ),
          React.createElement(
            Stat,
            { title: 'D', width: 8, height: 4 },
            'metric_d',
          ),
          React.createElement(
            Stat,
            { title: 'E', width: 8, height: 4 },
            'metric_e',
          ),
        ),
      ),
    );

    const result = render(element);

    // A at (2, 1) - starts at left padding
    assert.strictEqual(result.panels[1].gridPos.x, 2);
    assert.strictEqual(result.panels[1].gridPos.y, 1);
    // B at (2, 3) - stacked below A
    assert.strictEqual(result.panels[2].gridPos.x, 2);
    assert.strictEqual(result.panels[2].gridPos.y, 3);
    // C at (6, 1) - fill container starts after first container
    assert.strictEqual(result.panels[3].gridPos.x, 6);
    assert.strictEqual(result.panels[3].gridPos.y, 1);
    // D at (14, 1) - next to C (6 + 8 = 14)
    assert.strictEqual(result.panels[4].gridPos.x, 14);
    assert.strictEqual(result.panels[4].gridPos.y, 1);
    // E at (6, 5) - wraps within fill container
    assert.strictEqual(result.panels[5].gridPos.x, 6);
    assert.strictEqual(result.panels[5].gridPos.y, 5);
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

// ============================================================================
// Panel Defaults Tests
// ============================================================================

describe('Panel defaults', () => {
  describe('Global defaults via render options', () => {
    it('applies global defaults to Timeseries panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Timeseries, { title: 'CPU' }, 'cpu_usage'),
      );

      const result = render(element, {
        defaults: {
          colorMode: 'palette-classic-by-name',
          axisBorderShow: true,
        },
      });

      const panel = result.panels[0];
      assert.strictEqual(
        panel.fieldConfig?.defaults.color?.mode,
        'palette-classic-by-name',
      );
      const custom = panel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      assert.strictEqual(custom?.axisBorderShow, true);
    });

    it('applies global defaults to Stat panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Stat, { title: 'Count' }, 'count_metric'),
      );

      const result = render(element, {
        defaults: { colorMode: 'palette-classic' },
      });

      const panel = result.panels[0];
      // Stat uses colorMode in fieldConfig.defaults.color.mode
      assert.strictEqual(
        panel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
    });

    it('applies global defaults to Gauge panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Gauge, { title: 'Percentage' }, 'pct_metric'),
      );

      const result = render(element, {
        defaults: { colorMode: 'palette-classic' },
      });

      const panel = result.panels[0];
      assert.strictEqual(
        panel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
    });

    it('applies global defaults to BarGauge panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(BarGauge, { title: 'Usage' }, 'usage_metric'),
      );

      const result = render(element, {
        defaults: { colorMode: 'palette-classic' },
      });

      const panel = result.panels[0];
      assert.strictEqual(
        panel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
    });

    it('applies global defaults to Table panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Table, { title: 'Data' }, 'table_metric'),
      );

      const result = render(element, {
        defaults: { colorMode: 'palette-classic' },
      });

      const panel = result.panels[0];
      assert.strictEqual(
        panel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
    });
  });

  describe('Dashboard-level defaults', () => {
    it('applies dashboard defaults to panels', () => {
      const element = React.createElement(
        Dashboard,
        {
          uid: 'test',
          title: 'Test',
          datasource: 'prometheus',
          defaults: { colorMode: 'palette-classic-by-name', lineWidth: 2 },
        },
        React.createElement(Timeseries, { title: 'CPU' }, 'cpu_usage'),
      );

      const result = render(element);

      const panel = result.panels[0];
      assert.strictEqual(
        panel.fieldConfig?.defaults.color?.mode,
        'palette-classic-by-name',
      );
      const custom = panel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      assert.strictEqual(custom?.lineWidth, 2);
    });

    it('dashboard defaults override global defaults', () => {
      const element = React.createElement(
        Dashboard,
        {
          uid: 'test',
          title: 'Test',
          datasource: 'prometheus',
          defaults: { colorMode: 'palette-classic-by-name' },
        },
        React.createElement(Timeseries, { title: 'CPU' }, 'cpu_usage'),
      );

      const result = render(element, {
        defaults: { colorMode: 'palette-classic' },
      });

      const panel = result.panels[0];
      // Dashboard default should win over global default
      assert.strictEqual(
        panel.fieldConfig?.defaults.color?.mode,
        'palette-classic-by-name',
      );
    });
  });

  describe('Defaults component', () => {
    it('applies defaults to nested panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(
          Defaults,
          { colorMode: 'palette-classic-by-name', fill: 30 },
          React.createElement(Timeseries, { title: 'CPU' }, 'cpu_usage'),
          React.createElement(Timeseries, { title: 'Memory' }, 'mem_usage'),
        ),
      );

      const result = render(element);

      for (const panel of result.panels) {
        assert.strictEqual(
          panel.fieldConfig?.defaults.color?.mode,
          'palette-classic-by-name',
        );
        const custom = panel.fieldConfig?.defaults.custom as Record<
          string,
          unknown
        >;
        assert.strictEqual(custom?.fillOpacity, 30);
      }
    });

    it('supports nested Defaults components', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(
          Defaults,
          { colorMode: 'palette-classic', fill: 20 },
          React.createElement(Timeseries, { title: 'Outer' }, 'outer_metric'),
          React.createElement(
            Defaults,
            { fill: 50 },
            React.createElement(Timeseries, { title: 'Inner' }, 'inner_metric'),
          ),
        ),
      );

      const result = render(element);

      const outerPanel = result.panels[0];
      const innerPanel = result.panels[1];

      // Outer panel gets outer defaults
      const outerCustom = outerPanel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      assert.strictEqual(outerCustom?.fillOpacity, 20);
      assert.strictEqual(
        outerPanel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );

      // Inner panel gets merged defaults (nested fill overrides outer)
      const innerCustom = innerPanel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      assert.strictEqual(innerCustom?.fillOpacity, 50);
      // But colorMode is inherited from outer
      assert.strictEqual(
        innerPanel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
    });

    it('defaults do not leak to sibling panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(
          Defaults,
          { fill: 80 },
          React.createElement(Timeseries, { title: 'Inside' }, 'inside_metric'),
        ),
        React.createElement(Timeseries, { title: 'Outside' }, 'outside_metric'),
      );

      const result = render(element);

      const insidePanel = result.panels[0];
      const outsidePanel = result.panels[1];

      const insideCustom = insidePanel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      const outsideCustom = outsidePanel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;

      assert.strictEqual(insideCustom?.fillOpacity, 80);
      // Outside panel should not have fill from Defaults
      assert.strictEqual(outsideCustom?.fillOpacity, undefined);
    });
  });

  describe('Panel props override defaults', () => {
    it('panel props override global defaults', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(
          Timeseries,
          { title: 'CPU', colorMode: 'thresholds' },
          'cpu_usage',
        ),
      );

      const result = render(element, {
        defaults: { colorMode: 'palette-classic' },
      });

      const panel = result.panels[0];
      // Panel prop should win
      assert.strictEqual(panel.fieldConfig?.defaults.color?.mode, 'thresholds');
    });

    it('panel props override dashboard defaults', () => {
      const element = React.createElement(
        Dashboard,
        {
          uid: 'test',
          title: 'Test',
          datasource: 'prometheus',
          defaults: { lineWidth: 5 },
        },
        React.createElement(
          Timeseries,
          { title: 'CPU', lineWidth: 1 },
          'cpu_usage',
        ),
      );

      const result = render(element);

      const panel = result.panels[0];
      const custom = panel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      assert.strictEqual(custom?.lineWidth, 1);
    });

    it('panel props override Defaults component', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(
          Defaults,
          { axisBorderShow: true },
          React.createElement(
            Timeseries,
            { title: 'CPU', axisBorderShow: false },
            'cpu_usage',
          ),
        ),
      );

      const result = render(element);

      const panel = result.panels[0];
      const custom = panel.fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      assert.strictEqual(custom?.axisBorderShow, false);
    });
  });

  describe('renderToString with defaults', () => {
    it('passes defaults through renderToString', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Timeseries, { title: 'CPU' }, 'cpu_usage'),
      );

      const result = renderToString(element, {
        defaults: { axisBorderShow: true },
        pretty: false,
      });

      const parsed = JSON.parse(result);
      const panel = parsed.panels[0];
      assert.strictEqual(
        panel.fieldConfig.defaults.custom.axisBorderShow,
        true,
      );
    });
  });

  describe('Per-panel-type defaults', () => {
    it('applies per-panel-type override to specific panel type', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Timeseries, { title: 'CPU' }, 'cpu_usage'),
        React.createElement(Stat, { title: 'Count' }, 'count_metric'),
      );

      const result = render(element, {
        defaults: {
          colorMode: 'palette-classic',
          panels: {
            stat: { colorMode: 'thresholds' },
          },
        },
      });

      const timeseriesPanel = result.panels[0];
      const statPanel = result.panels[1];

      // Timeseries gets global colorMode
      assert.strictEqual(
        timeseriesPanel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
      // Stat gets per-panel-type override
      assert.strictEqual(
        statPanel.fieldConfig?.defaults.color?.mode,
        'thresholds',
      );
    });

    it('null in per-panel-type override unsets global default', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Timeseries, { title: 'CPU' }, 'cpu_usage'),
        React.createElement(Stat, { title: 'Count' }, 'count_metric'),
      );

      const result = render(element, {
        defaults: {
          colorMode: 'palette-classic',
          panels: {
            stat: { colorMode: null },
          },
        },
      });

      const timeseriesPanel = result.panels[0];
      const statPanel = result.panels[1];

      // Timeseries gets global colorMode
      assert.strictEqual(
        timeseriesPanel.fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
      // Stat has colorMode unset (falls back to panel default 'thresholds')
      assert.strictEqual(
        statPanel.fieldConfig?.defaults.color?.mode,
        'thresholds',
      );
    });

    it('per-panel-type defaults work with multiple panel types', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Timeseries, { title: 'Time' }, 'time_metric'),
        React.createElement(Stat, { title: 'Stat' }, 'stat_metric'),
        React.createElement(Gauge, { title: 'Gauge' }, 'gauge_metric'),
        React.createElement(Table, { title: 'Table' }, 'table_metric'),
      );

      const result = render(element, {
        defaults: {
          colorMode: 'palette-classic',
          axisBorderShow: true,
          panels: {
            stat: { colorMode: null },
            gauge: { colorMode: null },
            table: { colorMode: null },
          },
        },
      });

      const panels = result.panels;

      // Timeseries: gets global colorMode and axisBorderShow
      assert.strictEqual(
        panels[0].fieldConfig?.defaults.color?.mode,
        'palette-classic',
      );
      const tsCustom = panels[0].fieldConfig?.defaults.custom as Record<
        string,
        unknown
      >;
      assert.strictEqual(tsCustom?.axisBorderShow, true);

      // Stat: colorMode unset (uses default 'thresholds')
      assert.strictEqual(
        panels[1].fieldConfig?.defaults.color?.mode,
        'thresholds',
      );

      // Gauge: colorMode unset (uses default 'thresholds')
      assert.strictEqual(
        panels[2].fieldConfig?.defaults.color?.mode,
        'thresholds',
      );

      // Table: colorMode unset (uses default 'thresholds')
      assert.strictEqual(
        panels[3].fieldConfig?.defaults.color?.mode,
        'thresholds',
      );
    });

    it('per-panel-type axisBorderShow only affects timeseries panels', () => {
      const element = React.createElement(
        Dashboard,
        { uid: 'test', title: 'Test', datasource: 'prometheus' },
        React.createElement(Timeseries, { title: 'Time1' }, 'metric1'),
        React.createElement(Timeseries, { title: 'Time2' }, 'metric2'),
      );

      const result = render(element, {
        defaults: {
          axisBorderShow: true,
          panels: {
            timeseries: { axisBorderShow: false },
          },
        },
      });

      // Both timeseries panels should have axisBorderShow false (per-panel-type override)
      for (const panel of result.panels) {
        const custom = panel.fieldConfig?.defaults.custom as Record<
          string,
          unknown
        >;
        assert.strictEqual(custom?.axisBorderShow, false);
      }
    });
  });
});

describe('Panel extend prop', () => {
  it('merges extend into panel fieldConfig', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'CPU',
          extend: {
            fieldConfig: {
              defaults: {
                color: { reverse: true },
              },
            },
          },
        },
        'cpu_usage',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];

    // Check that reverse was merged into color config
    const color = panel.fieldConfig?.defaults.color as Record<string, unknown>;
    assert.strictEqual(color?.reverse, true);
    // Existing color properties should still be present
    assert.strictEqual(color?.mode, 'thresholds');
  });

  it('merges extend into panel options', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        {
          title: 'Traffic',
          extend: {
            options: {
              customOption: 'custom-value',
            },
          },
        },
        'http_requests_total',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];

    // Check that custom option was merged
    const options = panel.options as Record<string, unknown>;
    assert.strictEqual(options?.customOption, 'custom-value');
    // Existing options should still be present
    assert.ok(options?.legend !== undefined);
  });

  it('extend overwrites conflicting values', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Test',
          unit: 'percent',
          extend: {
            fieldConfig: {
              defaults: {
                unit: 'bytes', // Override the unit prop
              },
            },
          },
        },
        'metric',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];

    // extend should win over props
    assert.strictEqual(panel.fieldConfig?.defaults.unit, 'bytes');
  });

  it('extend can add top-level panel properties', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Test',
          extend: {
            transparent: true,
            links: [{ title: 'Link', url: 'https://example.com' }],
          },
        },
        'metric',
      ),
    );

    const result = render(element);
    const panel = result.panels[0] as unknown as Record<string, unknown>;

    assert.strictEqual(panel.transparent, true);
    assert.deepStrictEqual(panel.links, [
      { title: 'Link', url: 'https://example.com' },
    ]);
  });

  it('extend works on different panel types', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Gauge,
        {
          title: 'Gauge',
          extend: { fieldConfig: { defaults: { color: { reverse: true } } } },
        },
        'gauge_metric',
      ),
      React.createElement(
        Table,
        {
          title: 'Table',
          extend: { options: { customTableOption: true } },
        },
        'table_metric',
      ),
      React.createElement(
        BarGauge,
        {
          title: 'BarGauge',
          extend: { fieldConfig: { defaults: { color: { reverse: true } } } },
        },
        'bargauge_metric',
      ),
    );

    const result = render(element);

    // Gauge
    const gaugeColor = result.panels[0].fieldConfig?.defaults.color as Record<
      string,
      unknown
    >;
    assert.strictEqual(gaugeColor?.reverse, true);

    // Table
    const tableOptions = result.panels[1].options as Record<string, unknown>;
    assert.strictEqual(tableOptions?.customTableOption, true);

    // BarGauge
    const barGaugeColor = result.panels[2].fieldConfig?.defaults
      .color as Record<string, unknown>;
    assert.strictEqual(barGaugeColor?.reverse, true);
  });

  it('extend does not affect panels without it', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'With Extend',
          extend: { fieldConfig: { defaults: { color: { reverse: true } } } },
        },
        'metric1',
      ),
      React.createElement(Stat, { title: 'Without Extend' }, 'metric2'),
    );

    const result = render(element);

    // First panel has reverse
    const color1 = result.panels[0].fieldConfig?.defaults.color as Record<
      string,
      unknown
    >;
    assert.strictEqual(color1?.reverse, true);

    // Second panel does not have reverse
    const color2 = result.panels[1].fieldConfig?.defaults.color as Record<
      string,
      unknown
    >;
    assert.strictEqual(color2?.reverse, undefined);
  });
});

describe('Override extend prop', () => {
  it('merges extend.color into override color property', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'CPU',
          overrides: [
            {
              fieldName: 'cpu_total',
              colorMode: 'continuous-GrYlRd',
              extend: { color: { reverse: true } },
            },
          ],
        },
        'cpu_usage',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const overrides = panel.fieldConfig?.overrides;

    assert.strictEqual(overrides?.length, 1);
    const colorProp = overrides?.[0].properties.find(
      (p: { id: string }) => p.id === 'color',
    );
    assert.ok(colorProp);
    const colorValue = colorProp.value as Record<string, unknown>;
    assert.strictEqual(colorValue.mode, 'continuous-GrYlRd');
    assert.strictEqual(colorValue.reverse, true);
  });

  it('extend.color merges with existing color properties', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Timeseries,
        {
          title: 'Traffic',
          overrides: [
            {
              fieldName: 'requests',
              colorMode: 'continuous-BlYlRd',
              seriesBy: 'max',
              extend: { color: { reverse: true, customProp: 'value' } },
            },
          ],
        },
        'http_requests',
      ),
    );

    const result = render(element);
    const panel = result.panels[0];
    const overrides = panel.fieldConfig?.overrides;
    const colorProp = overrides?.[0].properties.find(
      (p: { id: string }) => p.id === 'color',
    );
    const colorValue = colorProp?.value as Record<string, unknown>;

    // Original properties preserved
    assert.strictEqual(colorValue.mode, 'continuous-BlYlRd');
    assert.strictEqual(colorValue.seriesBy, 'max');
    // Extended properties added
    assert.strictEqual(colorValue.reverse, true);
    assert.strictEqual(colorValue.customProp, 'value');
  });

  it('extend does not affect overrides without it', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Test',
          overrides: [
            {
              fieldName: 'field1',
              colorMode: 'continuous-GrYlRd',
              extend: { color: { reverse: true } },
            },
            {
              fieldName: 'field2',
              colorMode: 'continuous-BlYlRd',
              // No extend
            },
          ],
        },
        'metric',
      ),
    );

    const result = render(element);
    const overrides = result.panels[0].fieldConfig?.overrides;

    // First override has reverse
    const color1 = overrides?.[0].properties.find(
      (p: { id: string }) => p.id === 'color',
    )?.value as Record<string, unknown>;
    assert.strictEqual(color1?.reverse, true);

    // Second override does not have reverse
    const color2 = overrides?.[1].properties.find(
      (p: { id: string }) => p.id === 'color',
    )?.value as Record<string, unknown>;
    assert.strictEqual(color2?.reverse, undefined);
  });

  it('extend can add new properties not in typed interface', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Test',
          overrides: [
            {
              fieldName: 'field1',
              colorMode: 'fixed',
              color: 'red',
              extend: {
                unit: 'bytes',
                decimals: 2,
                custom: { someOption: true },
              },
            },
          ],
        },
        'metric',
      ),
    );

    const result = render(element);
    const properties = result.panels[0].fieldConfig?.overrides?.[0].properties;

    // Should have color plus the extended properties
    assert.ok(properties?.find((p: { id: string }) => p.id === 'color'));

    const unitProp = properties?.find((p: { id: string }) => p.id === 'unit');
    assert.strictEqual(unitProp?.value, 'bytes');

    const decimalsProp = properties?.find(
      (p: { id: string }) => p.id === 'decimals',
    );
    assert.strictEqual(decimalsProp?.value, 2);

    const customProp = properties?.find(
      (p: { id: string }) => p.id === 'custom',
    );
    assert.deepStrictEqual(customProp?.value, { someOption: true });
  });

  it('extend can create override with only extended properties', () => {
    const element = React.createElement(
      Dashboard,
      { uid: 'test', title: 'Test', datasource: 'prometheus' },
      React.createElement(
        Stat,
        {
          title: 'Test',
          overrides: [
            {
              fieldName: 'field1',
              // No typed properties, only extend
              extend: {
                color: { mode: 'continuous-PuBl', reverse: true },
                unit: 'percent',
              },
            },
          ],
        },
        'metric',
      ),
    );

    const result = render(element);
    const properties = result.panels[0].fieldConfig?.overrides?.[0].properties;

    const colorProp = properties?.find((p: { id: string }) => p.id === 'color');
    const colorValue = colorProp?.value as Record<string, unknown>;
    assert.strictEqual(colorValue?.mode, 'continuous-PuBl');
    assert.strictEqual(colorValue?.reverse, true);

    const unitProp = properties?.find((p: { id: string }) => p.id === 'unit');
    assert.strictEqual(unitProp?.value, 'percent');
  });
});
