import { test, expect, describe } from 'bun:test';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Benchmarker', () => {
  test('benchmark script exists', () => {
    const scriptPath = join(__dirname, '../src/benchmark.ts');
    expect(existsSync(scriptPath)).toBe(true);
  });

  test('generate-table script exists', () => {
    const scriptPath = join(__dirname, '../src/generate-table.ts');
    expect(existsSync(scriptPath)).toBe(true);
  });

  test('package.json has benchmark scripts', () => {
    const pkg = require('../package.json');
    expect(pkg.scripts.benchmark).toBeDefined();
    expect(pkg.scripts['benchmark:table']).toBeDefined();
  });

  test('has required dependencies', () => {
    const pkg = require('../package.json');
    // Check for key benchmark dependencies
    expect(pkg.dependencies['@babel/parser']).toBeDefined();
    expect(pkg.dependencies['acorn']).toBeDefined();
    expect(pkg.dependencies['esprima']).toBeDefined();
    expect(pkg.dependencies['fast-brake']).toBe('workspace:*');
  });

  test('has CLI table dependencies for output', () => {
    const pkg = require('../package.json');
    expect(pkg.dependencies['cli-table3']).toBeDefined();
    expect(pkg.dependencies['picocolors']).toBeDefined();
  });
});