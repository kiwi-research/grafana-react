# Value Mappings

## Current Implementation

Value mappings are implemented via the `valueMappings` prop on panels that extend `FieldConfigProps`.

### Supported Panels

The following panels support `valueMappings` through `FieldConfigProps`:

- Stat
- Gauge
- Bar Gauge
- Table
- Timeseries

### FieldConfigProps

We created a shared `FieldConfigProps` interface in `types/panel-base.ts` that panels extend:

```typescript
interface FieldConfigProps {
  unit?: Unit;
  decimals?: number;
  thresholds?: ThresholdSpec;
  baseColor?: 'green' | 'transparent' | 'text' | string;
  valueMappings?: ValueMapping[];
  noValue?: string;
}

interface StatProps extends BasePanelProps, FieldConfigProps {
  // Stat-specific props
}
```

This consolidates common field configuration props that were previously duplicated across panels.

### Prop Name

We use `valueMappings` (not `mappings`) because:

- Grafana's UI calls this feature "Value mappings"
- More descriptive than just `mappings`
- Distinguishes from other mapping concepts

### JSON Output

The prop maps to `fieldConfig.defaults.mappings` in Grafana's JSON format.

### Types

```typescript
// In types/display.ts
type ValueMapping =
  | ValueMappingValue // Exact value match
  | ValueMappingRange // Range of values
  | ValueMappingRegex // Regex pattern match
  | ValueMappingSpecial; // Special values (null, NaN, etc)
```

## Future Considerations

### Additional Panels

The following panels have `mappings: []` in their fieldConfig and could be updated to extend `FieldConfigProps`:

- State Timeline
- Status History
- Pie Chart
- Bar Chart
- Histogram
- Candlestick
- Trend
- XY Chart
- Logs
- Datagrid

### Partial Field Config

Some panels may only need a subset of `FieldConfigProps`. If needed, use `Pick<>`:

```typescript
interface SomeProps
  extends BasePanelProps, Pick<FieldConfigProps, 'unit' | 'valueMappings'> {
  // Panel-specific props
}
```
