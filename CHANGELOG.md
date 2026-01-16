# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.4] - 2026-01-16

### Added

- **Value Mappings**: Transform values to text/colors with `valueMappings` prop
  - Support for exact value, range, regex, and special value mappings
- **Defaults System**: Apply consistent configuration across panels
  - `<Defaults>` component for scoped defaults
  - `defaults` prop on `<Dashboard>` for dashboard-wide defaults
  - `--defaults` CLI flag to load defaults from JSON file
  - Per-panel-type overrides with `panels` config
- **Container Component**: Nested grid layouts within rows
  - Fixed width or fill remaining space
- **FieldConfigProps**: Shared interface for common field configuration
  - Consolidates `unit`, `decimals`, `thresholds`, `baseColor`, `valueMappings`, `noValue`
- **Extend Prop**: Escape hatch for unsupported Grafana features
  - Deep-merge raw JSON into panel output
- **Table Enhancements**:
  - Data links on columns (`link` prop)
  - Cell display modes (`cellMode`: gauge, color-text, color-background)
  - Per-column thresholds, decimals, and display names
- **Color Type Improvements**:
  - Discriminated union for `OverrideConfig` based on color mode
  - `FixedColorMode`, `ContinuousColorMode`, `PaletteColorMode` types
  - `ColorSeriesBy` for continuous color calculation
- **Panel Improvements**:
  - `marginLeft` prop for spacing before panels
  - `min`/`max` props on Stat for sparkline Y-axis
  - Legend `width` prop for right-placed legends

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

[Unreleased]: https://github.com/kiwi-research/grafana-react/compare/v0.0.4...HEAD
[0.0.4]: https://github.com/kiwi-research/grafana-react/compare/v0.0.1...v0.0.4
[0.0.1]: https://github.com/kiwi-research/grafana-react/releases/tag/v0.0.1
