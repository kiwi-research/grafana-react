/**
 * CLI integration tests
 *
 * These tests verify the CLI's basic functionality.
 * Note: Full dashboard compilation tests are limited because Node.js
 * cannot dynamically import .tsx files without a TypeScript loader.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync, spawnSync } from 'node:child_process';
import * as path from 'node:path';

// Path to the built CLI
const CLI_PATH = path.resolve(import.meta.dirname, '../../build/cli/index.js');

describe('CLI integration', () => {
  it('shows help with --help flag', () => {
    const result = execSync(`node ${CLI_PATH} --help`, {
      encoding: 'utf8',
    });

    assert.ok(result.includes('grafana-react'));
    assert.ok(result.includes('build'));
    assert.ok(result.includes('validate'));
    assert.ok(result.includes('watch'));
    assert.ok(result.includes('build-all'));
  });

  it('shows help with no arguments', () => {
    const result = execSync(`node ${CLI_PATH}`, {
      encoding: 'utf8',
    });

    assert.ok(result.includes('Usage:'));
  });

  it('shows version with --version flag', () => {
    const result = execSync(`node ${CLI_PATH} --version`, {
      encoding: 'utf8',
    });

    assert.ok(result.includes('grafana-react v'));
  });

  it('shows version with -v flag', () => {
    const result = execSync(`node ${CLI_PATH} -v`, {
      encoding: 'utf8',
    });

    assert.ok(result.includes('grafana-react v'));
  });

  it('exits with error for missing input file on build', () => {
    const result = spawnSync('node', [CLI_PATH, 'build'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 1);
    assert.ok(result.stderr.includes('Missing input file'));
  });

  it('exits with error for missing input directory on build-all', () => {
    const result = spawnSync('node', [CLI_PATH, 'build-all'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 1);
    assert.ok(result.stderr.includes('Missing input directory'));
  });

  it('exits with error for missing input file on validate', () => {
    const result = spawnSync('node', [CLI_PATH, 'validate'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 1);
    assert.ok(result.stderr.includes('Missing input file'));
  });

  it('exits with error for non-existent file', () => {
    const result = spawnSync(
      'node',
      [CLI_PATH, 'build', '/nonexistent/file.tsx'],
      {
        encoding: 'utf8',
      },
    );

    assert.strictEqual(result.status, 1);
    assert.ok(result.stderr.includes('File not found'));
  });

  it('exits with error for unknown command', () => {
    const result = spawnSync('node', [CLI_PATH, 'unknown-command'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 1);
    assert.ok(result.stderr.includes('Unknown command'));
  });
});
