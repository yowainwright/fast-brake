import { test, expect, describe } from 'bun:test';
import { fast-brake, detect, check, getMinimumESVersion } from './index';
import type { DetectionOptions, DetectedFeature } from './types';

describe('fast-brake main API', () => {
  describe('fast-brake function', () => {
    test('should not throw for compatible ES5 code', () => {
      const code = 'function test() { return 42; }';
      expect(() => fast-brake(code, { target: 'es5' })).not.toThrow();
    });

    test('should throw for incompatible code', () => {
      const code = 'const arrow = () => {}';
      expect(() => fast-brake(code, { target: 'es5' })).toThrow();
    });

    test('should throw with detailed error message', () => {
      const code = 'const arrow = () => {}';
      try {
        fast-brake(code, { target: 'es5' });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('es5');
        expect(error.message).toContain('requires');
        expect(error.feature).toBeDefined();
        expect(error.target).toBe('es5');
      }
    });

    test('should include line and column in error', () => {
      const code = '\n\n  const arrow = () => {}';
      try {
        fast-brake(code, { target: 'es5' });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain('line');
        expect(error.feature.line).toBe(3);
      }
    });

    test('should include snippet in error', () => {
      const code = 'const arrow = () => {}';
      try {
        fast-brake(code, { target: 'es5' });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain('const arrow = () => {}');
      }
    });

    test('should respect throwOnFirst option', () => {
      const code = 'const a = () => {}; const b = async () => {};';
      try {
        fast-brake(code, { target: 'es5', throwOnFirst: true });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain('requires');
        expect(error.message).toContain('es5');
        expect(error.feature.name).not.toBe('async_await');
      }
    });

    test('should work with quick mode', () => {
      const code = 'const arrow = () => {}';
      expect(() => fast-brake(code, { target: 'es5', quick: true })).toThrow();
    });
  });

  describe('detect function', () => {
    test('should detect features with default options', () => {
      const code = 'const arrow = () => {}';
      const features = detect(code);
      
      expect(features).toBeInstanceOf(Array);
      expect(features.length).toBeGreaterThan(0);
    });

    test('should accept partial options', () => {
      const code = 'const arrow = () => {}';
      const features = detect(code, { quick: true });
      
      expect(features.length).toBeGreaterThan(0);
    });

    test('should default to esnext target', () => {
      const code = 'const arrow = () => {}';
      const features = detect(code);
      
      // Should detect features even with esnext target
      expect(features.length).toBeGreaterThan(0);
    });

    test('should return empty array for ES5 code', () => {
      const code = 'function test() { return 42; }';
      const features = detect(code);
      
      expect(features).toHaveLength(0);
    });

    test('should detect multiple features', () => {
      const code = `
        const arrow = () => {};
        class MyClass {}
        async function test() { await promise; }
      `;
      const features = detect(code);
      
      const featureNames = features.map(f => f.name);
      expect(featureNames).toContain('arrow_functions');
      expect(featureNames).toContain('classes');
      expect(featureNames).toContain('async_await');
    });

    test('should include version info', () => {
      const code = 'const arrow = () => {}';
      const features = detect(code);
      
      const arrowFeature = features.find(f => f.name === 'arrow_functions');
      expect(arrowFeature?.version).toBe('es2015');
    });

    test('should include location info', () => {
      const code = '\n\nconst arrow = () => {}';
      const features = detect(code);
      
      const arrowFeature = features.find(f => f.name === 'arrow_functions');
      expect(arrowFeature?.line).toBe(3);
    });
  });

  describe('check function', () => {
    test('should return true for compatible code', () => {
      const code = 'function test() { return 42; }';
      const result = check(code, { target: 'es5' });
      
      expect(result).toBe(true);
    });

    test('should return false for incompatible code', () => {
      const code = 'const arrow = () => {}';
      const result = check(code, { target: 'es5' });
      
      expect(result).toBe(false);
    });

    test('should not throw even with throwOnFirst', () => {
      const code = 'const arrow = () => {}';
      const result = check(code, { target: 'es5', throwOnFirst: true });
      
      expect(result).toBe(false);
    });

    test('should work with quick mode', () => {
      const code = 'const arrow = () => {}';
      const result = check(code, { target: 'es5', quick: true });
      
      expect(result).toBe(false);
    });

    test('should handle ES2015 target', () => {
      const arrowCode = 'const arrow = () => {}';
      const asyncCode = 'async function test() {}';
      
      expect(check(arrowCode, { target: 'es2015' })).toBe(true);
      expect(check(asyncCode, { target: 'es2015' })).toBe(false);
    });

    test('should handle ES2017 target', () => {
      const asyncCode = 'async function test() {}';
      const optionalCode = 'obj?.prop';
      
      expect(check(asyncCode, { target: 'es2017' })).toBe(true);
      expect(check(optionalCode, { target: 'es2017' })).toBe(false);
    });

    test('should handle ES2020 target', () => {
      const optionalCode = 'obj?.prop';
      const privateCode = 'class C { #private }';
      
      expect(check(optionalCode, { target: 'es2020' })).toBe(true);
      expect(check(privateCode, { target: 'es2020' })).toBe(false);
    });

    test('should handle esnext target', () => {
      const anyCode = `
        const arrow = () => {};
        class C { #private }
        obj?.prop ?? "default"
      `;
      
      expect(check(anyCode, { target: 'esnext' })).toBe(true);
    });
  });

  describe('getMinimumESVersion function', () => {
    test('should return es5 for ES5 code', () => {
      const code = 'function test() { return 42; }';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es5');
    });

    test('should return es2015 for arrow functions', () => {
      const code = 'const arrow = () => {}';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2015');
    });

    test('should return es2015 for template literals', () => {
      const code = 'const str = `hello ${name}`;';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2015');
    });

    test('should return es2015 for classes', () => {
      const code = 'class MyClass {}';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2015');
    });

    test('should return es2017 for async/await', () => {
      const code = 'async function test() { await promise; }';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2017');
    });

    test('should return es2020 for optional chaining', () => {
      const code = 'const value = obj?.prop;';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2020');
    });

    test('should return es2020 for nullish coalescing', () => {
      const code = 'const value = a ?? b;';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2020');
    });

    test('should return es2022 for private fields', () => {
      const code = 'class C { #private = 1; }';
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2022');
    });

    test('should return highest version for mixed features', () => {
      const code = `
        const arrow = () => {};  // ES2015
        async function test() {}  // ES2017
        class C { #private }      // ES2022
      `;
      const version = getMinimumESVersion(code);
      
      expect(version).toBe('es2022');
    });

    test('should work with quick mode', () => {
      const code = 'const arrow = () => {}';
      const version = getMinimumESVersion(code, { quick: true });
      
      expect(version).toBe('es2015');
    });

    test('should handle empty code', () => {
      const version = getMinimumESVersion('');
      expect(version).toBe('es5');
    });

    test('should handle whitespace-only code', () => {
      const version = getMinimumESVersion('   \n\t  ');
      expect(version).toBe('es5');
    });

    test('should handle comments only', () => {
      const code = '// Just a comment\n/* Block comment */';
      const version = getMinimumESVersion(code);
      expect(version).toBe('es5');
    });
  });

  describe('type exports', () => {
    test('should export DetectionOptions type', () => {
      const options: DetectionOptions = {
        target: 'es5',
        quick: true,
        throwOnFirst: true
      };
      expect(options).toBeDefined();
    });

    test('should export DetectedFeature type', () => {
      const feature: DetectedFeature = {
        name: 'test',
        version: 'es2015',
        line: 1,
        column: 1,
        snippet: 'code'
      };
      expect(feature).toBeDefined();
    });
  });

  describe('default export', () => {
    test('should have default export', async () => {
      const module = await import('./index');
      expect(module.default).toBe(fast-brake);
    });
  });

  describe('error handling', () => {
    test('should handle malformed code gracefully', () => {
      const code = 'const x = ;'; // Syntax error
      
      // Should still detect const
      const features = detect(code);
      expect(features.find(f => f.name === 'let_const')).toBeDefined();
    });

    test('should handle very long code', () => {
      const code = 'const x = () => {};'.repeat(1000);
      
      expect(() => {
        const features = detect(code, { quick: true });
        expect(features.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    test('should handle unicode in code', () => {
      const code = 'const 你好 = () => { return "世界"; }';
      
      const features = detect(code);
      expect(features.find(f => f.name === 'arrow_functions')).toBeDefined();
    });

    test('should handle mixed line endings', () => {
      const code = 'const a = 1;\r\nconst b = () => {};\rconst c = 3;';
      
      const features = detect(code);
      expect(features.find(f => f.name === 'arrow_functions')).toBeDefined();
    });
  });

  describe('performance', () => {
    test('quick mode should be faster than full mode', () => {
      const code = 'const x = () => {};'.repeat(100);
      
      const startQuick = performance.now();
      detect(code, { quick: true });
      const quickTime = performance.now() - startQuick;
      
      const startFull = performance.now();
      detect(code, { quick: false });
      const fullTime = performance.now() - startFull;
      
      expect(quickTime).toBeLessThan(fullTime);
    });

    test('should handle large files efficiently', () => {
      const code = `
        function oldStyle() { return 42; }
        var x = 10;
      `.repeat(1000);
      
      const start = performance.now();
      const version = getMinimumESVersion(code, { quick: true });
      const time = performance.now() - start;
      
      expect(version).toBe('es5');
      expect(time).toBeLessThan(100); // Should be fast
    });
  });
});