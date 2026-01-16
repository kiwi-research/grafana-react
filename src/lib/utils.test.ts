/**
 * Tests for utility functions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseTimeRange,
  parseTooltip,
  parseVariableHide,
  parseVariableSort,
  normalizeColor,
  normalizeThresholds,
  normalizeLegend,
  normalizeTooltip,
  normalizeReduceOptions,
  normalizeLineStyle,
  normalizeScaleDistribution,
  nextRefId,
  deepMerge,
} from './utils.js';

describe('parseTimeRange', () => {
  it('converts time shorthand to Grafana format', () => {
    assert.deepStrictEqual(parseTimeRange('1h'), { from: 'now-1h', to: 'now' });
    assert.deepStrictEqual(parseTimeRange('6h'), { from: 'now-6h', to: 'now' });
    assert.deepStrictEqual(parseTimeRange('24h'), {
      from: 'now-24h',
      to: 'now',
    });
    assert.deepStrictEqual(parseTimeRange('7d'), { from: 'now-7d', to: 'now' });
  });
});

describe('parseTooltip', () => {
  it('converts tooltip mode to graphTooltip value', () => {
    assert.strictEqual(parseTooltip('shared'), 2);
    assert.strictEqual(parseTooltip('single'), 1);
    assert.strictEqual(parseTooltip('hidden'), 0);
    assert.strictEqual(parseTooltip(undefined), 0);
  });
});

describe('parseVariableHide', () => {
  it('converts hide option to Grafana value', () => {
    assert.strictEqual(parseVariableHide(true), 2);
    assert.strictEqual(parseVariableHide('label'), 1);
    assert.strictEqual(parseVariableHide(false), 0);
    assert.strictEqual(parseVariableHide(undefined), 0);
  });
});

describe('parseVariableSort', () => {
  it('converts sort option to Grafana value', () => {
    assert.strictEqual(parseVariableSort('alpha'), 1);
    assert.strictEqual(parseVariableSort('alpha-desc'), 2);
    assert.strictEqual(parseVariableSort('num'), 3);
    assert.strictEqual(parseVariableSort('num-desc'), 4);
    assert.strictEqual(parseVariableSort('alpha-ci'), 5);
    assert.strictEqual(parseVariableSort('alpha-ci-desc'), 6);
    assert.strictEqual(parseVariableSort('disabled'), 0);
    assert.strictEqual(parseVariableSort(undefined), 0);
  });
});

describe('normalizeColor', () => {
  it('normalizes standard color names', () => {
    assert.strictEqual(normalizeColor('green'), 'green');
    assert.strictEqual(normalizeColor('red'), 'red');
    assert.strictEqual(normalizeColor('blue'), 'blue');
    assert.strictEqual(normalizeColor('orange'), 'orange');
    assert.strictEqual(normalizeColor('transparent'), 'transparent');
    assert.strictEqual(normalizeColor('text'), 'text');
  });

  it('normalizes yellow to hex color', () => {
    assert.strictEqual(normalizeColor('yellow'), '#EAB839');
    assert.strictEqual(normalizeColor('y'), '#EAB839');
  });

  it('normalizes shorthand colors', () => {
    assert.strictEqual(normalizeColor('g'), 'green');
    assert.strictEqual(normalizeColor('r'), 'red');
    assert.strictEqual(normalizeColor('b'), 'blue');
    assert.strictEqual(normalizeColor('o'), 'orange');
    assert.strictEqual(normalizeColor('t'), 'transparent');
  });

  it('passes through unknown colors', () => {
    assert.strictEqual(normalizeColor('#ff0000'), '#ff0000');
    assert.strictEqual(normalizeColor('rgb(255,0,0)'), 'rgb(255,0,0)');
    assert.strictEqual(normalizeColor('light-red'), 'light-red');
  });
});

describe('normalizeThresholds', () => {
  it('returns default green threshold when undefined', () => {
    const result = normalizeThresholds(undefined);
    assert.deepStrictEqual(result, [{ value: null, color: 'green' }]);
  });

  it('normalizes object format thresholds', () => {
    const result = normalizeThresholds({ 70: 'yellow', 90: 'red' });
    assert.deepStrictEqual(result, [
      { value: null, color: 'green' },
      { value: 70, color: '#EAB839' },
      { value: 90, color: 'red' },
    ]);
  });

  it('normalizes array format thresholds', () => {
    const result = normalizeThresholds([
      [50, 'yellow'],
      [80, 'red'],
    ]);
    assert.deepStrictEqual(result, [
      { value: null, color: 'green' },
      { value: 50, color: '#EAB839' },
      { value: 80, color: 'red' },
    ]);
  });

  it('sorts object thresholds by value', () => {
    const result = normalizeThresholds({ 90: 'red', 70: 'yellow' });
    assert.strictEqual(result[1].value, 70);
    assert.strictEqual(result[2].value, 90);
  });
});

describe('normalizeLegend', () => {
  it('returns default legend when undefined', () => {
    const result = normalizeLegend(undefined);
    assert.deepStrictEqual(result, {
      placement: 'bottom',
      displayMode: 'list',
      calcs: [],
    });
  });

  it('expands string shorthand', () => {
    const result = normalizeLegend('right');
    assert.deepStrictEqual(result, {
      placement: 'right',
      displayMode: 'table',
      calcs: ['mean', 'max'],
    });
  });

  it('normalizes full config object', () => {
    const result = normalizeLegend({
      placement: 'right',
      displayMode: 'table',
      calcs: ['sum'],
      sortBy: 'Mean',
      sortDesc: true,
    });
    assert.deepStrictEqual(result, {
      placement: 'right',
      displayMode: 'table',
      calcs: ['sum'],
      sortBy: 'Mean',
      sortDesc: true,
      width: undefined,
    });
  });

  it('passes through width for right placement', () => {
    const result = normalizeLegend({
      placement: 'right',
      width: 250,
    });
    assert.strictEqual(result.placement, 'right');
    assert.strictEqual(result.width, 250);
  });
});

describe('nextRefId', () => {
  it('generates single letter IDs for 0-25', () => {
    assert.strictEqual(nextRefId(0), 'A');
    assert.strictEqual(nextRefId(1), 'B');
    assert.strictEqual(nextRefId(25), 'Z');
  });

  it('generates two letter IDs for 26+', () => {
    assert.strictEqual(nextRefId(26), 'AA');
    assert.strictEqual(nextRefId(27), 'AB');
    assert.strictEqual(nextRefId(51), 'AZ');
    assert.strictEqual(nextRefId(52), 'BA');
  });
});

describe('normalizeTooltip', () => {
  it('returns default when undefined', () => {
    const result = normalizeTooltip(undefined);
    assert.deepStrictEqual(result, { mode: 'multi', sort: 'none' });
  });

  it('expands string shorthand', () => {
    assert.deepStrictEqual(normalizeTooltip('single'), {
      mode: 'single',
      sort: 'none',
    });
    assert.deepStrictEqual(normalizeTooltip('none'), {
      mode: 'none',
      sort: 'none',
    });
  });

  it('passes through full config', () => {
    const result = normalizeTooltip({
      mode: 'multi',
      sort: 'desc',
      maxHeight: 300,
      maxWidth: 400,
    });
    assert.deepStrictEqual(result, {
      mode: 'multi',
      sort: 'desc',
      maxHeight: 300,
      maxWidth: 400,
    });
  });

  it('fills in defaults for partial config', () => {
    const result = normalizeTooltip({ mode: 'single' });
    assert.strictEqual(result.mode, 'single');
    assert.strictEqual(result.sort, 'none');
  });
});

describe('normalizeReduceOptions', () => {
  it('returns default when undefined', () => {
    const result = normalizeReduceOptions(undefined);
    assert.deepStrictEqual(result, {
      calcs: [],
      fields: '',
      values: false,
    });
  });

  it('normalizes partial config', () => {
    const result = normalizeReduceOptions({ calcs: ['mean'] });
    assert.deepStrictEqual(result.calcs, ['mean']);
    assert.strictEqual(result.fields, '');
    assert.strictEqual(result.values, false);
  });

  it('preserves all options when provided', () => {
    const result = normalizeReduceOptions({
      calcs: ['sum', 'max'],
      fields: '/^value/',
      values: true,
      limit: 10,
    });
    assert.deepStrictEqual(result, {
      calcs: ['sum', 'max'],
      fields: '/^value/',
      values: true,
      limit: 10,
    });
  });
});

describe('normalizeLineStyle', () => {
  it('returns undefined when not specified', () => {
    const result = normalizeLineStyle(undefined);
    assert.strictEqual(result, undefined);
  });

  it('expands string shorthand', () => {
    assert.deepStrictEqual(normalizeLineStyle('dash'), { fill: 'dash' });
    assert.deepStrictEqual(normalizeLineStyle('dot'), { fill: 'dot' });
    assert.deepStrictEqual(normalizeLineStyle('solid'), { fill: 'solid' });
  });

  it('passes through full config with dash array', () => {
    const result = normalizeLineStyle({ fill: 'dash', dash: [10, 10] });
    assert.deepStrictEqual(result, { fill: 'dash', dash: [10, 10] });
  });
});

describe('normalizeScaleDistribution', () => {
  it('returns linear when undefined', () => {
    const result = normalizeScaleDistribution(undefined);
    assert.strictEqual(result.type, 'linear');
  });

  it('handles log scale with base', () => {
    const result = normalizeScaleDistribution({ type: 'log', log: 10 });
    assert.strictEqual(result.type, 'log');
    assert.strictEqual(result.log, 10);
  });

  it('handles log scale with base 2', () => {
    const result = normalizeScaleDistribution({ type: 'log', log: 2 });
    assert.strictEqual(result.type, 'log');
    assert.strictEqual(result.log, 2);
  });

  it('handles symlog with linear threshold', () => {
    const result = normalizeScaleDistribution({
      type: 'symlog',
      linearThreshold: 1,
    });
    assert.strictEqual(result.type, 'symlog');
    assert.strictEqual(result.linearThreshold, 1);
  });
});

describe('deepMerge', () => {
  it('merges flat objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);

    assert.deepStrictEqual(result, { a: 1, b: 3, c: 4 });
    // Should mutate target
    assert.strictEqual(result, target);
  });

  it('deeply merges nested objects', () => {
    const target = {
      outer: {
        inner: { a: 1, b: 2 },
        other: 'keep',
      },
    };
    const source = {
      outer: {
        inner: { b: 3, c: 4 },
      },
    };
    const result = deepMerge(target, source);

    assert.deepStrictEqual(result, {
      outer: {
        inner: { a: 1, b: 3, c: 4 },
        other: 'keep',
      },
    });
  });

  it('replaces arrays instead of merging them', () => {
    const target = { arr: [1, 2, 3] };
    const source = { arr: [4, 5] };
    const result = deepMerge(target, source);

    assert.deepStrictEqual(result.arr, [4, 5]);
  });

  it('handles null values in source', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: null };
    const result = deepMerge(target, source);

    assert.strictEqual(result.b, null);
  });

  it('adds new nested objects', () => {
    const target = { existing: 'value' };
    const source = { new: { nested: { deep: true } } };
    const result = deepMerge(target, source);

    assert.deepStrictEqual(result, {
      existing: 'value',
      new: { nested: { deep: true } },
    });
  });

  it('handles empty source', () => {
    const target = { a: 1, b: 2 };
    const result = deepMerge(target, {});

    assert.deepStrictEqual(result, { a: 1, b: 2 });
  });

  it('handles empty target', () => {
    const target = {};
    const source = { a: 1, b: { c: 2 } };
    const result = deepMerge(target, source);

    assert.deepStrictEqual(result, { a: 1, b: { c: 2 } });
  });

  it('works with Grafana-like structures', () => {
    const target = {
      fieldConfig: {
        defaults: {
          color: { mode: 'thresholds' },
          unit: 'percent',
        },
      },
      options: {
        legend: { show: true },
      },
    };
    const source = {
      fieldConfig: {
        defaults: {
          color: { reverse: true },
        },
      },
    };
    const result = deepMerge(target, source);

    assert.deepStrictEqual(result, {
      fieldConfig: {
        defaults: {
          color: { mode: 'thresholds', reverse: true },
          unit: 'percent',
        },
      },
      options: {
        legend: { show: true },
      },
    });
  });
});
