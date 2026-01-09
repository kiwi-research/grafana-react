# Grafana Schema Reference

How to find Grafana's official TypeScript interfaces for panels and configuration options.

## Where Grafana Defines Schemas

Grafana uses **CUE schemas** as the source of truth, which are code-generated into TypeScript.

### Panel-Specific Options

Each panel type has its schema in:

```
public/app/plugins/panel/<panel-type>/panelcfg.gen.ts
```

Examples:

- [timeseries/panelcfg.gen.ts](https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/timeseries/panelcfg.gen.ts)
- [stat/panelcfg.gen.ts](https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/stat/panelcfg.gen.ts)
- [table/panelcfg.gen.ts](https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/table/panelcfg.gen.ts)
- [gauge/panelcfg.gen.ts](https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/gauge/panelcfg.gen.ts)
- [bargauge/panelcfg.gen.ts](https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/bargauge/panelcfg.gen.ts)

### Common/Shared Types

Shared types (legends, tooltips, axes, field config) are in:

```
packages/grafana-schema/src/common/common.gen.ts
```

Key interfaces:

- `VizLegendOptions` - Legend display, placement, calcs
- `VizTooltipOptions` - Tooltip mode, sort, dimensions
- `GraphFieldConfig` - Line/bar/point styling, axis config, stacking
- `ReduceDataOptions` - Data reduction (calcs, fields, values)

### NPM Package

You can also explore types via the `@grafana/schema` package:

```bash
pnpm add -D @grafana/schema
```

Then use your IDE to explore exported types.

## Panel Types Available

Core panels in Grafana:

- alertlist, annolist, barchart, bargauge, candlestick, canvas
- dashlist, datagrid, flamegraph, gauge, geomap, heatmap
- histogram, logs, news, nodeGraph, piechart, stat
- state-timeline, status-history, table, text, timeseries
- traces, trend, xychart

## Adding New Props

When adding props from Grafana's schema:

1. Find the panel's `panelcfg.gen.ts` file
2. Check `common.gen.ts` for shared types the panel extends
3. Add the prop to the component's interface in `src/components/panels/`
4. Update the renderer in `src/lib/renderer.ts` to map the prop to JSON
5. Add normalization helpers to `src/lib/utils.ts` if needed
6. Run `pnpm build && pnpm test` to verify
