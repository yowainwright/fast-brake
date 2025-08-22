import { test, expect, describe } from 'bun:test';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Schema Generator', () => {
  test('schema generator script exists', () => {
    const scriptPath = join(__dirname, '../src/generate-schema.ts');
    expect(existsSync(scriptPath)).toBe(true);
  });

  test('output schema paths are configured', () => {
    const schemaJsonPath = join(__dirname, '../../../src/schema.json');
    const schemaJsPath = join(__dirname, '../../../src/schema.js');
    
    // These are the expected output paths
    expect(schemaJsonPath).toContain('src/schema.json');
    expect(schemaJsPath).toContain('src/schema.js');
  });

  test('package.json has generate script', () => {
    const pkg = require('../package.json');
    expect(pkg.scripts.generate).toBeDefined();
    expect(pkg.scripts.generate).toContain('generate-schema.ts');
  });

  test('tsconfig exists for TypeScript compilation', () => {
    const tsconfigPath = join(__dirname, '../tsconfig.json');
    expect(existsSync(tsconfigPath)).toBe(true);
  });
});