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

  test('can import and use fast-brake', () => {
    // Test that fast-brake can be imported and used
    const { detect, getMinimumESVersion } = require('fast-brake');
    
    const testCode = 'const arrow = () => {};';
    const features = detect(testCode);
    const version = getMinimumESVersion(testCode);
    
    expect(features).toBeDefined();
    expect(features.length).toBeGreaterThan(0);
    expect(version).toBe('es2015');
  });

  test('has CLI table dependencies for output', () => {
    const pkg = require('../package.json');
    expect(pkg.dependencies['cli-table3']).toBeDefined();
    expect(pkg.dependencies['picocolors']).toBeDefined();
  });
});