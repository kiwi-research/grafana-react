/**
 * Documentation Generator
 *
 * Generates MDX documentation from TypeScript source code JSDoc comments.
 * Uses ts-morph to parse TypeScript files and extract:
 * - Module JSDoc (description, @example blocks)
 * - Interface properties with JSDoc comments
 * - Type references and defaults
 */

import {
  Project,
  SourceFile,
  InterfaceDeclaration,
  SyntaxKind,
} from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

// Paths relative to docs directory
const DOCS_DIR = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.resolve(DOCS_DIR, '../src');
const OUTPUT_DIR = path.resolve(DOCS_DIR, 'src/content/docs');

// Base path for the docs site (must match astro.config.mjs)
const BASE_PATH = '/grafana-react';

// Component mappings: source file -> output MDX file
interface ComponentMapping {
  source: string;
  output: string;
  title?: string; // Override title from JSDoc
  category?: 'structure' | 'query' | 'panels';
}

const COMPONENT_MAPPINGS: ComponentMapping[] = [
  // Structure components
  {
    source: 'components/dashboard/dashboard.ts',
    output: 'components/_generated/structure/dashboard.mdx',
    category: 'structure',
  },
  {
    source: 'components/row/row.ts',
    output: 'components/_generated/structure/row.mdx',
    category: 'structure',
  },
  {
    source: 'components/variable/variable.ts',
    output: 'components/_generated/structure/variable.mdx',
    category: 'structure',
  },
  {
    source: 'components/annotation/annotation.ts',
    output: 'components/_generated/structure/annotation.mdx',
    category: 'structure',
  },
  {
    source: 'components/link/link.ts',
    output: 'components/_generated/structure/link.mdx',
    category: 'structure',
  },

  // Query components
  {
    source: 'components/query/query.ts',
    output: 'components/_generated/query/query.mdx',
    category: 'query',
  },
  {
    source: 'components/override/override.ts',
    output: 'components/_generated/query/override.mdx',
    category: 'query',
  },

  // Plugin panel wrapper
  {
    source: 'components/plugin-panel/plugin-panel.ts',
    output: 'components/_generated/panels/plugin-panel.mdx',
    category: 'panels',
  },

  // Core panels
  {
    source: 'components/panels/core/stat/stat.ts',
    output: 'components/_generated/panels/stat.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/timeseries/timeseries.ts',
    output: 'components/_generated/panels/timeseries.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/table/table.ts',
    output: 'components/_generated/panels/table.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/bar-gauge/bar-gauge.ts',
    output: 'components/_generated/panels/bar-gauge.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/heatmap/heatmap.ts',
    output: 'components/_generated/panels/heatmap.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/gauge/gauge.ts',
    output: 'components/_generated/panels/gauge.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/text/text.ts',
    output: 'components/_generated/panels/text.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/bar-chart/bar-chart.ts',
    output: 'components/_generated/panels/bar-chart.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/pie-chart/pie-chart.ts',
    output: 'components/_generated/panels/pie-chart.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/histogram/histogram.ts',
    output: 'components/_generated/panels/histogram.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/state-timeline/state-timeline.ts',
    output: 'components/_generated/panels/state-timeline.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/status-history/status-history.ts',
    output: 'components/_generated/panels/status-history.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/candlestick/candlestick.ts',
    output: 'components/_generated/panels/candlestick.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/trend/trend.ts',
    output: 'components/_generated/panels/trend.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/xy-chart/xy-chart.ts',
    output: 'components/_generated/panels/xy-chart.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/logs/logs.ts',
    output: 'components/_generated/panels/logs.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/datagrid/datagrid.ts',
    output: 'components/_generated/panels/datagrid.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/node-graph/node-graph.ts',
    output: 'components/_generated/panels/node-graph.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/traces/traces.ts',
    output: 'components/_generated/panels/traces.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/flame-graph/flame-graph.ts',
    output: 'components/_generated/panels/flame-graph.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/canvas/canvas.ts',
    output: 'components/_generated/panels/canvas.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/geomap/geomap.ts',
    output: 'components/_generated/panels/geomap.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/dashboard-list/dashboard-list.ts',
    output: 'components/_generated/panels/dashboard-list.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/alert-list/alert-list.ts',
    output: 'components/_generated/panels/alert-list.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/annotations-list/annotations-list.ts',
    output: 'components/_generated/panels/annotations-list.mdx',
    category: 'panels',
  },
  {
    source: 'components/panels/core/news/news.ts',
    output: 'components/_generated/panels/news.mdx',
    category: 'panels',
  },

  // Plugin panels
  {
    source:
      'components/panels/plugins/business-variable-panel/business-variable-panel.ts',
    output: 'components/_generated/panels/business-variable-panel.mdx',
    category: 'panels',
  },
];

// Type mappings: source file -> interfaces to document
interface TypeMapping {
  source: string;
  interfaces: string[];
}

const TYPE_MAPPINGS: TypeMapping[] = [
  {
    source: 'types/panel-base.ts',
    interfaces: [
      'BasePanelProps',
      'OverrideConfig',
      'TableColumnOverride',
      'Transformation',
    ],
  },
  {
    source: 'types/display.ts',
    interfaces: ['LegendConfig'],
  },
  {
    source: 'types/common/axis.ts',
    interfaces: ['ScaleDistributionConfig', 'AxisConfig'],
  },
  {
    source: 'types/common/viz-options.ts',
    interfaces: [
      'VizTooltipOptions',
      'ReduceDataOptions',
      'HideSeriesConfig',
      'SingleStatBaseOptions',
    ],
  },
  {
    source: 'types/common/field-config.ts',
    interfaces: [
      'StackingConfig',
      'LineStyleConfig',
      'GraphThresholdsStyleConfig',
      'GraphFieldConfig',
    ],
  },
];

interface ParsedTypeInfo {
  name: string;
  description: string;
  props: ParsedProp[];
  extendsType?: string;
  sourcePath: string;
}

interface ParsedExample {
  title?: string;
  code: string;
}

interface ParsedProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

interface ParsedComponent {
  name: string;
  description: string;
  bodyText: string[];
  examples: ParsedExample[];
  props: ParsedProp[];
  extendsType?: string;
}

/**
 * Parse JSDoc examples from a JSDoc comment
 */
function parseExamples(jsDocText: string): ParsedExample[] {
  const examples: ParsedExample[] = [];
  const exampleRegex =
    /@example(?:\s+([^\n*]+))?\s*\n([\s\S]*?)(?=@\w+|\*\/|$)/g;

  let match;
  while ((match = exampleRegex.exec(jsDocText)) !== null) {
    const title = match[1]?.trim();
    let code = match[2]
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '')) // Remove JSDoc * prefix
      .filter((line) => !line.match(/^\s*\/\s*$/)) // Remove trailing / from closing */
      .join('\n')
      .trim();

    // Remove leading/trailing empty lines and trailing /
    code = code
      .replace(/^\s*\n/, '')
      .replace(/\n\s*$/, '')
      .replace(/\s*\/\s*$/, '');

    if (code) {
      examples.push({ title, code });
    }
  }

  return examples;
}

/**
 * Parse description from JSDoc (text before any @ tags)
 */
function parseDescription(jsDocText: string): {
  title: string;
  body: string[];
} {
  // Remove the opening /** and closing */
  let text = jsDocText.replace(/^\/\*\*\s*/, '').replace(/\s*\*\/$/, '');

  // Remove line-starting * and collect lines, stopping at first @ tag
  const allLines = text
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''));

  // Find first @ tag and only use lines before it
  const lines: string[] = [];
  for (const line of allLines) {
    if (line.trim().startsWith('@')) {
      break; // Stop at first @ tag
    }
    lines.push(line);
  }

  // First line is the title (component name - description)
  const titleLine = lines[0]?.trim() || '';

  // Extract just the description part after the component name
  const titleMatch = titleLine.match(/^(\w+)\s*[-–—]\s*(.+)$/);
  const title = titleMatch ? titleMatch[2].trim() : titleLine;

  // Rest is body text (skip empty lines at start)
  const bodyLines = lines.slice(1);
  const body: string[] = [];
  let currentParagraph = '';

  for (const line of bodyLines) {
    if (line.trim() === '') {
      if (currentParagraph) {
        body.push(currentParagraph.trim());
        currentParagraph = '';
      }
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + line.trim();
    }
  }
  if (currentParagraph) {
    body.push(currentParagraph.trim());
  }

  return { title, body };
}

/**
 * Parse default value from JSDoc description
 * Pattern: (default: 'value') or (default: value)
 */
function parseDefaultValue(description: string): {
  cleanDescription: string;
  defaultValue?: string;
} {
  const defaultMatch = description.match(
    /\(default:\s*['"]?([^'")\s]+)['"]?\)/i,
  );
  if (defaultMatch) {
    return {
      cleanDescription: description.replace(defaultMatch[0], '').trim(),
      defaultValue: defaultMatch[1],
    };
  }
  return { cleanDescription: description };
}

/**
 * Format TypeScript type for display in markdown
 */
function formatType(typeText: string): string {
  // Escape pipe characters for markdown tables
  return typeText.replace(/\|/g, '\\|');
}

/**
 * Escape curly braces for MDX safety
 * MDX interprets { } as JSX expressions, so we need to escape them
 */
function escapeForMdx(text: string): string {
  // Replace {{ with escaped version for MDX
  // Using inline code for text containing curly braces
  if (text.includes('{{') || text.includes('}}')) {
    return text.replace(/\{\{/g, '`{{').replace(/\}\}/g, '}}`');
  }
  return text;
}

/**
 * Parse interface properties
 */
function parseInterfaceProps(
  interfaceDecl: InterfaceDeclaration,
  project: Project,
): { props: ParsedProp[]; extendsType?: string } {
  const props: ParsedProp[] = [];
  let extendsType: string | undefined;

  // Check for extends clause
  const heritage = interfaceDecl.getExtends();
  if (heritage.length > 0) {
    extendsType = heritage[0].getText();
  }

  // Parse own properties
  for (const prop of interfaceDecl.getProperties()) {
    const name = prop.getName();

    // Skip private props (starting with _)
    if (name.startsWith('_')) continue;

    const typeNode = prop.getTypeNode();
    let typeText = typeNode?.getText() || prop.getType().getText();

    // Simplify complex types
    if (typeText.length > 60) {
      // Check if it's a union type
      if (typeText.includes('|')) {
        const parts = typeText.split('|').map((p) => p.trim());
        if (parts.length > 4) {
          typeText = parts.slice(0, 3).join(' | ') + ' | ...';
        }
      } else if (
        typeText.startsWith('Record<') ||
        typeText.startsWith('Omit<')
      ) {
        // Keep as-is for common utility types
      } else {
        typeText = 'object';
      }
    }

    const required = !prop.hasQuestionToken();

    // Get JSDoc comment
    const jsDocs = prop.getJsDocs();
    let description = '';
    if (jsDocs.length > 0) {
      description = jsDocs[0].getDescription().trim();
    }

    const { cleanDescription, defaultValue } = parseDefaultValue(description);

    props.push({
      name,
      type: formatType(typeText),
      required,
      description: escapeForMdx(cleanDescription),
      defaultValue,
    });
  }

  return { props, extendsType };
}

/**
 * Parse a component source file
 */
function parseComponentFile(
  sourceFile: SourceFile,
  project: Project,
): ParsedComponent | null {
  // Find the main Props interface (ends with Props)
  const interfaces = sourceFile.getInterfaces();
  const propsInterface = interfaces.find((i) => i.getName().endsWith('Props'));

  if (!propsInterface) {
    console.warn(`No Props interface found in ${sourceFile.getFilePath()}`);
    return null;
  }

  // Get module-level JSDoc (first JSDoc comment in file)
  const firstStatement = sourceFile.getStatements()[0];
  const leadingComments = firstStatement?.getLeadingCommentRanges() || [];
  let moduleJsDoc = '';

  for (const comment of leadingComments) {
    const text = comment.getText();
    if (text.startsWith('/**')) {
      moduleJsDoc = text;
      break;
    }
  }

  // Parse the JSDoc
  const { title, body } = parseDescription(moduleJsDoc);
  const examples = parseExamples(moduleJsDoc);
  const { props, extendsType } = parseInterfaceProps(propsInterface, project);

  // Get component name from interface (remove Props suffix)
  const componentName = propsInterface.getName().replace(/Props$/, '');

  return {
    name: componentName,
    description: title,
    bodyText: body,
    examples,
    props,
    extendsType,
  };
}

/**
 * Generate MDX content from parsed component
 */
function generateMdx(component: ParsedComponent, sourcePath: string): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push('---');
  lines.push(`title: ${component.name}`);
  lines.push(`description: ${component.description}`);
  lines.push('---');
  lines.push('');

  // Auto-generated warning
  lines.push('{/* AUTO-GENERATED - DO NOT EDIT */}');
  lines.push(`{/* Source: ${sourcePath} */}`);
  lines.push('');

  // Description
  lines.push(component.description + '.');
  lines.push('');

  // Body paragraphs
  for (const paragraph of component.bodyText) {
    lines.push(paragraph);
    lines.push('');
  }

  // Examples
  if (component.examples.length > 0) {
    for (let i = 0; i < component.examples.length; i++) {
      const example = component.examples[i];
      const heading =
        i === 0
          ? example.title || 'Usage'
          : example.title || `Example ${i + 1}`;
      lines.push(`## ${heading}`);
      lines.push('');
      lines.push('```tsx');
      lines.push(example.code);
      lines.push('```');
      lines.push('');
    }
  }

  // Props table
  if (component.props.length > 0) {
    lines.push('## Props');
    lines.push('');
    lines.push('| Prop | Type | Default | Description |');
    lines.push('|------|------|---------|-------------|');

    for (const prop of component.props) {
      const requiredMarker = prop.required ? ' *' : '';
      const defaultVal =
        prop.defaultValue || (prop.required ? 'required' : '-');
      lines.push(
        `| \`${prop.name}\`${requiredMarker} | \`${prop.type}\` | ${defaultVal} | ${prop.description} |`,
      );
    }
    lines.push('');

    // Note about required props
    const hasRequired = component.props.some((p) => p.required);
    if (hasRequired) {
      lines.push('*Props marked with * are required.*');
      lines.push('');
    }
  }

  // Inheritance note
  if (component.extendsType) {
    const baseName = component.extendsType.replace(/^Omit<(\w+),.*$/, '$1');
    lines.push(
      `*Inherits from [${baseName}](${BASE_PATH}/api/types/#${baseName.toLowerCase()})*`,
    );
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Parse a specific interface from a source file
 */
function parseInterface(
  sourceFile: SourceFile,
  interfaceName: string,
  project: Project,
  sourcePath: string,
): ParsedTypeInfo | null {
  const interfaceDecl = sourceFile.getInterface(interfaceName);
  if (!interfaceDecl) {
    console.warn(`Interface ${interfaceName} not found in ${sourcePath}`);
    return null;
  }

  // Get JSDoc from the interface
  const jsDocs = interfaceDecl.getJsDocs();
  let description = '';
  if (jsDocs.length > 0) {
    description = jsDocs[0].getDescription().trim();
    // Get just the first line/sentence for description
    const firstLine = description.split('\n')[0].trim();
    description = firstLine || description;
  }

  const { props, extendsType } = parseInterfaceProps(interfaceDecl, project);

  return {
    name: interfaceName,
    description,
    props,
    extendsType,
    sourcePath,
  };
}

/**
 * Generate the types reference MDX page
 */
function generateTypesMdx(types: ParsedTypeInfo[]): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push('---');
  lines.push('title: Types Reference');
  lines.push('description: Type definitions for grafana-react components');
  lines.push('---');
  lines.push('');

  // Auto-generated warning
  lines.push('{/* AUTO-GENERATED - DO NOT EDIT */}');
  lines.push('');

  // Introduction
  lines.push(
    'This page documents the TypeScript types used by grafana-react components.',
  );
  lines.push('');

  // Table of contents
  lines.push('## Quick Reference');
  lines.push('');
  for (const type of types) {
    lines.push(
      `- [${type.name}](#${type.name.toLowerCase()}) - ${type.description || 'Type definition'}`,
    );
  }
  lines.push('');

  // Each type as a section
  for (const type of types) {
    lines.push(`## ${type.name}`);
    lines.push('');

    if (type.description) {
      lines.push(type.description);
      lines.push('');
    }

    // Source reference
    lines.push(`*Source: \`${type.sourcePath}\`*`);
    lines.push('');

    // Inheritance note
    if (type.extendsType) {
      const baseName = type.extendsType.replace(/^Omit<(\w+),.*$/, '$1');
      // Check if it's a documented type
      const isDocumented = types.some((t) => t.name === baseName);
      if (isDocumented) {
        lines.push(`*Extends [${baseName}](#${baseName.toLowerCase()})*`);
      } else {
        lines.push(`*Extends \`${type.extendsType}\`*`);
      }
      lines.push('');
    }

    // Props table
    if (type.props.length > 0) {
      lines.push('| Property | Type | Required | Description |');
      lines.push('|----------|------|----------|-------------|');

      for (const prop of type.props) {
        const requiredVal = prop.required ? 'Yes' : 'No';
        const desc = prop.defaultValue
          ? `${prop.description} (default: ${prop.defaultValue})`
          : prop.description;
        lines.push(
          `| \`${prop.name}\` | \`${prop.type}\` | ${requiredVal} | ${desc} |`,
        );
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate types documentation
 */
async function generateTypeDocs(
  project: Project,
): Promise<{ generated: boolean; error?: string }> {
  console.log('Generating types documentation...');

  const types: ParsedTypeInfo[] = [];

  for (const mapping of TYPE_MAPPINGS) {
    const sourcePath = path.resolve(SRC_DIR, mapping.source);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Type source file not found: ${mapping.source}`);
      continue;
    }

    const sourceFile = project.addSourceFileAtPath(sourcePath);

    for (const interfaceName of mapping.interfaces) {
      const typeInfo = parseInterface(
        sourceFile,
        interfaceName,
        project,
        mapping.source,
      );
      if (typeInfo) {
        types.push(typeInfo);
      }
    }
  }

  if (types.length === 0) {
    return { generated: false, error: 'No types parsed' };
  }

  // Generate MDX
  const mdxContent = generateTypesMdx(types);
  const outputPath = path.resolve(OUTPUT_DIR, 'api/types.mdx');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, mdxContent);
  console.log(`Generated: api/types.mdx (${types.length} types)`);

  return { generated: true };
}

/**
 * Main generation function
 */
async function generateDocs(filter?: string): Promise<void> {
  console.log('Starting documentation generation...');
  console.log(`Source: ${SRC_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  // Initialize ts-morph project
  const project = new Project({
    tsConfigFilePath: path.resolve(SRC_DIR, '../tsconfig.json'),
  });

  // Filter mappings if specified
  let mappings = COMPONENT_MAPPINGS;
  if (filter) {
    mappings = mappings.filter(
      (m) => m.source.includes(filter) || m.output.includes(filter),
    );
    console.log(
      `Filtered to ${mappings.length} components matching "${filter}"`,
    );
  }

  let generated = 0;
  let errors = 0;

  for (const mapping of mappings) {
    const sourcePath = path.resolve(SRC_DIR, mapping.source);
    const outputPath = path.resolve(OUTPUT_DIR, mapping.output);

    try {
      // Check if source file exists
      if (!fs.existsSync(sourcePath)) {
        console.warn(`Source file not found: ${mapping.source}`);
        errors++;
        continue;
      }

      // Parse the source file
      const sourceFile = project.addSourceFileAtPath(sourcePath);
      const component = parseComponentFile(sourceFile, project);

      if (!component) {
        console.warn(`Could not parse component from: ${mapping.source}`);
        errors++;
        continue;
      }

      // Generate MDX content
      const mdxContent = generateMdx(component, mapping.source);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write the file
      fs.writeFileSync(outputPath, mdxContent);
      console.log(`Generated: ${mapping.output}`);
      generated++;
    } catch (error) {
      console.error(`Error processing ${mapping.source}:`, error);
      errors++;
    }
  }

  console.log('');

  // Generate types documentation (unless filtering for specific components)
  if (!filter || filter === 'types') {
    const typesResult = await generateTypeDocs(project);
    if (typesResult.generated) {
      generated++;
    } else if (typesResult.error) {
      console.error(`Types generation error: ${typesResult.error}`);
      errors++;
    }
  }

  console.log('');
  console.log(`Done! Generated ${generated} files, ${errors} errors.`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const filter = args.find((a) => !a.startsWith('--'));
const watch = args.includes('--watch');

if (watch) {
  console.log('Watch mode not yet implemented');
  process.exit(1);
}

// Run generation
generateDocs(filter).catch((error) => {
  console.error('Generation failed:', error);
  process.exit(1);
});
