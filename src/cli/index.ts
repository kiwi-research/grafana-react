#!/usr/bin/env node
/**
 * Grafana React CLI
 *
 * Build Grafana dashboards from React/TSX files.
 *
 * Usage:
 *   grafana-react build <input> [output]     Build a single dashboard
 *   grafana-react build-all <dir> [outdir]   Build all dashboards in a directory
 *   grafana-react validate <input>           Validate a dashboard without output
 *   grafana-react watch <dir> [outdir]       Watch and rebuild on changes
 */

// Register tsx loader for TypeScript/TSX support
try {
  const { register } = await import('tsx/esm/api');
  register();
} catch {
  console.error(`Error: The grafana-react CLI requires 'tsx' to be installed.

Install it with:
  npm install tsx@4

Or install all peer dependencies:
  npm install react@19 tsx@4
`);
  process.exit(1);
}

import * as fs from 'node:fs';
import * as path from 'node:path';
import React from 'react';
import { renderToString } from '../lib/renderer.js';
import type { RenderOptions } from '../lib/renderer.js';
import type { PanelDefaults } from '../types/defaults.js';

// ============================================================================
// CLI Helpers
// ============================================================================

function printUsage(): void {
  console.log(`
grafana-react - Build Grafana dashboards from React/TSX files

Usage:
  grafana-react build <input.tsx> [output.json]
    Build a single dashboard from a TSX file.
    If output is not specified, prints to stdout.

  grafana-react build-all <input-dir> [output-dir]
    Build all *.dashboard.tsx files in a directory.
    Output files are named *.gen.json in the output directory.

  grafana-react validate <input.tsx>
    Validate a dashboard file without generating output.

  grafana-react watch <input-dir> [output-dir]
    Watch for changes and rebuild automatically.

Options:
  --help, -h              Show this help message
  --version, -v           Show version
  --defaults <file.json>  Apply panel defaults from JSON file

Examples:
  grafana-react build dashboards/node.dashboard.tsx
  grafana-react build dashboards/node.dashboard.tsx output/node.json
  grafana-react build --defaults defaults.json dashboards/node.dashboard.tsx
  grafana-react build-all dashboards/ output/
  grafana-react validate dashboards/node.dashboard.tsx
`);
}

function printVersion(): void {
  const pkgPath = new URL('../../package.json', import.meta.url);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(`grafana-react v${pkg.version}`);
}

function error(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function success(message: string): void {
  console.log(`\u2713 ${message}`);
}

// ============================================================================
// Build Functions
// ============================================================================

async function loadDashboard(inputFile: string): Promise<React.ReactElement> {
  const absolutePath = path.resolve(inputFile);

  if (!fs.existsSync(absolutePath)) {
    error(`File not found: ${absolutePath}`);
  }

  const ext = path.extname(absolutePath);
  if (ext !== '.tsx' && ext !== '.ts') {
    error(`Expected .tsx or .ts file, got ${ext}`);
  }

  // Import the module (tsx loader handles TSX transformation)
  const module = (await import(absolutePath)) as Record<string, unknown>;

  // Find the dashboard component
  const Component =
    module.default ??
    module.Dashboard ??
    Object.values(module).find(
      (exp) =>
        typeof exp === 'function' &&
        /dashboard/i.test((exp as { name?: string }).name ?? ''),
    );

  if (!Component) {
    error(
      'No dashboard component found. Export as default or named "Dashboard"',
    );
  }

  return React.createElement(Component as React.FC);
}

async function buildOne(
  inputFile: string,
  outputFile: string | undefined,
  options?: RenderOptions,
): Promise<void> {
  const element = await loadDashboard(inputFile);
  const json = renderToString(element, options);

  if (outputFile) {
    const absoluteOutput = path.resolve(outputFile);
    const outputDir = path.dirname(absoluteOutput);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(absoluteOutput, json + '\n');
    success(`Built ${path.relative(process.cwd(), absoluteOutput)}`);
  } else {
    console.log(json);
  }
}

async function buildAll(
  inputDir: string,
  outputDir: string | undefined,
  options?: RenderOptions,
): Promise<void> {
  const absoluteInput = path.resolve(inputDir);

  if (!fs.existsSync(absoluteInput)) {
    error(`Directory not found: ${absoluteInput}`);
  }

  const files = findDashboardFiles(absoluteInput);

  if (files.length === 0) {
    console.log('No dashboard files found (*.dashboard.tsx)');
    return;
  }

  console.log(`Found ${files.length} dashboard file(s)`);

  const resolvedOutputDir = outputDir ? path.resolve(outputDir) : absoluteInput;

  for (const file of files) {
    const relativePath = path.relative(absoluteInput, file);
    const outputName = relativePath.replace(/\.dashboard\.tsx$/, '.gen.json');
    const outputPath = path.join(resolvedOutputDir, outputName);

    try {
      const element = await loadDashboard(file);
      const json = renderToString(element, options);

      const outputFileDir = path.dirname(outputPath);
      if (!fs.existsSync(outputFileDir)) {
        fs.mkdirSync(outputFileDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, json + '\n');
      success(`${relativePath} -> ${path.relative(process.cwd(), outputPath)}`);
    } catch (err) {
      console.error(`\u2717 ${relativePath}: ${(err as Error).message}`);
    }
  }
}

async function validate(inputFile: string): Promise<void> {
  const element = await loadDashboard(inputFile);

  // Just render to validate - don't output
  renderToString(element);
  success(`Valid: ${path.relative(process.cwd(), inputFile)}`);
}

async function watch(
  inputDir: string,
  outputDir: string | undefined,
  options?: RenderOptions,
): Promise<void> {
  const absoluteInput = path.resolve(inputDir);
  const resolvedOutputDir = outputDir ? path.resolve(outputDir) : absoluteInput;

  console.log(`Watching ${absoluteInput} for changes...`);

  // Initial build
  await buildAll(inputDir, outputDir, options);

  // Watch for changes
  const { watch: fsWatch } = await import('node:fs');

  fsWatch(absoluteInput, { recursive: true }, async (_eventType, filename) => {
    if (!filename?.endsWith('.dashboard.tsx')) return;

    const filePath = path.join(absoluteInput, filename);
    const relativePath = path.relative(absoluteInput, filePath);
    const outputName = relativePath.replace(/\.dashboard\.tsx$/, '.gen.json');
    const outputPath = path.join(resolvedOutputDir, outputName);

    console.log(`\nRebuilding ${filename}...`);

    try {
      // Clear module cache for hot reload
      const absolutePath = path.resolve(filePath);
      delete require.cache?.[absolutePath];

      const element = await loadDashboard(filePath);
      const json = renderToString(element, options);

      const outputFileDir = path.dirname(outputPath);
      if (!fs.existsSync(outputFileDir)) {
        fs.mkdirSync(outputFileDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, json + '\n');
      success(`${relativePath} -> ${path.relative(process.cwd(), outputPath)}`);
    } catch (err) {
      console.error(`\u2717 ${relativePath}: ${(err as Error).message}`);
    }
  });

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\nStopping watch...');
    process.exit(0);
  });
}

// ============================================================================
// File Discovery
// ============================================================================

function findDashboardFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.dashboard.tsx')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files.sort();
}

// ============================================================================
// Defaults Loading
// ============================================================================

function loadDefaults(defaultsFile: string): PanelDefaults {
  const absolutePath = path.resolve(defaultsFile);

  if (!fs.existsSync(absolutePath)) {
    error(`Defaults file not found: ${absolutePath}`);
  }

  try {
    const content = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(content) as PanelDefaults;
  } catch (err) {
    error(`Failed to parse defaults file: ${(err as Error).message}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    printVersion();
    process.exit(0);
  }

  // Parse --defaults option
  let renderOptions: RenderOptions | undefined;
  const defaultsIndex = args.indexOf('--defaults');
  if (defaultsIndex !== -1) {
    if (!args[defaultsIndex + 1]) {
      error('--defaults requires a file path argument');
    }
    const defaults = loadDefaults(args[defaultsIndex + 1]);
    renderOptions = { defaults };
    // Remove --defaults and its argument from args
    args.splice(defaultsIndex, 2);
  }

  const command = args[0];

  switch (command) {
    case 'build':
      if (!args[1]) {
        error(
          'Missing input file. Usage: grafana-react build <input.tsx> [output.json]',
        );
      }
      await buildOne(args[1], args[2], renderOptions);
      break;

    case 'build-all':
      if (!args[1]) {
        error(
          'Missing input directory. Usage: grafana-react build-all <input-dir> [output-dir]',
        );
      }
      await buildAll(args[1], args[2], renderOptions);
      break;

    case 'validate':
      if (!args[1]) {
        error('Missing input file. Usage: grafana-react validate <input.tsx>');
      }
      await validate(args[1]);
      break;

    case 'watch':
      if (!args[1]) {
        error(
          'Missing input directory. Usage: grafana-react watch <input-dir> [output-dir]',
        );
      }
      await watch(args[1], args[2], renderOptions);
      break;

    default:
      // Treat as build command if it's a file path
      if (args[0].endsWith('.tsx') || args[0].endsWith('.ts')) {
        await buildOne(args[0], args[1], renderOptions);
      } else {
        error(`Unknown command: ${command}. Use --help for usage.`);
      }
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
