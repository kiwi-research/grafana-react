# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-01-09

### Added

- Initial release
- Core components: `Dashboard`, `Row`, `Variable`, `Annotation`, `Link`, `Query`, `Override`
- Panel components:
  - Core: `Stat`, `Timeseries`, `Table`, `BarGauge`, `Heatmap`, `Gauge`, `Text`
  - Charts: `BarChart`, `PieChart`, `Histogram`, `StateTimeline`, `StatusHistory`, `Candlestick`, `Trend`, `XYChart`
  - Data display: `Logs`, `Datagrid`
  - Specialized: `NodeGraph`, `Traces`, `FlameGraph`, `Canvas`, `Geomap`
  - Widgets: `DashboardList`, `AlertList`, `AnnotationsList`, `News`
  - Plugins: `PluginPanel`, `BusinessVariablePanel`
- CLI with `build`, `build-all`, `validate`, and `watch` commands
- `render()` and `renderToString()` functions for programmatic use
- Full TypeScript support with comprehensive type exports
- Automatic panel positioning with row wrapping
- Threshold normalization (object syntax: `{ 70: 'yellow', 90: 'red' }`)
- Legend configuration (string shorthand or object)
- Tooltip configuration
- Row padding support

[Unreleased]: https://github.com/kiwi-research/grafana-react/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/kiwi-research/grafana-react/releases/tag/v0.0.1
