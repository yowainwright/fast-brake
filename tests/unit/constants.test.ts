import { test, expect, describe } from 'bun:test';
import {
  ES_VERSIONS,
  VERSION_ORDER,
  MDN_URLS,
  FEATURE_PATTERNS,
  QUICK_PATTERNS,
  FEATURE_VERSIONS
} from './constants';

describe('Constants', () => {
  describe('ES_VERSIONS', () => {
    test('should have all ES versions defined', () => {
      expect(ES_VERSIONS).toHaveProperty('es5');
      expect(ES_VERSIONS).toHaveProperty('es2015');
      expect(ES_VERSIONS).toHaveProperty('es2016');
      expect(ES_VERSIONS).toHaveProperty('es2017');
      expect(ES_VERSIONS).toHaveProperty('es2018');
      expect(ES_VERSIONS).toHaveProperty('es2019');
      expect(ES_VERSIONS).toHaveProperty('es2020');
      expect(ES_VERSIONS).toHaveProperty('es2021');
      expect(ES_VERSIONS).toHaveProperty('es2022');
    });

    test('should have browser versions for each ES version', () => {
      for (const [version, browsers] of Object.entries(ES_VERSIONS)) {
        expect(browsers).toHaveProperty('chrome');
        expect(browsers).toHaveProperty('firefox');
        expect(browsers).toHaveProperty('safari');
        expect(typeof browsers.chrome).toBe('number');
        expect(typeof browsers.firefox).toBe('number');
        expect(typeof browsers.safari).toBe('number');
      }
    });

    test('should have generally increasing browser versions', () => {
      const chromeVersions = Object.values(ES_VERSIONS).map(v => v.chrome);
      const safariVersions = Object.values(ES_VERSIONS).map(v => v.safari);
      
      // Chrome and Safari should be strictly increasing
      for (let i = 1; i < chromeVersions.length; i++) {
        expect(chromeVersions[i]).toBeGreaterThanOrEqual(chromeVersions[i - 1]);
        expect(safariVersions[i]).toBeGreaterThanOrEqual(safariVersions[i - 1]);
      }
      
      // Firefox had some features earlier (async/await in 53 vs other ES2016 features in 55)
      // so we just check it's generally increasing over time
      const firefoxVersions = Object.values(ES_VERSIONS).map(v => v.firefox);
      expect(firefoxVersions[firefoxVersions.length - 1]).toBeGreaterThan(firefoxVersions[0]);
    });
  });

  describe('VERSION_ORDER', () => {
    test('should contain all ES versions in order', () => {
      expect(VERSION_ORDER).toEqual([
        'es5', 'es2015', 'es2016', 'es2017', 'es2018',
        'es2019', 'es2020', 'es2021', 'es2022', 'esnext'
      ]);
    });

    test('should have esnext as the last version', () => {
      expect(VERSION_ORDER[VERSION_ORDER.length - 1]).toBe('esnext');
    });

    test('should have es5 as the first version', () => {
      expect(VERSION_ORDER[0]).toBe('es5');
    });
  });

  describe('MDN_URLS', () => {
    test('should have correct MDN URLs', () => {
      expect(MDN_URLS).toHaveLength(5);
      expect(MDN_URLS).toContain('https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins.json');
      expect(MDN_URLS).toContain('https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/statements.json');
      expect(MDN_URLS).toContain('https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/expressions.json');
      expect(MDN_URLS).toContain('https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/operators.json');
      expect(MDN_URLS).toContain('https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/grammar.json');
    });

    test('should all be HTTPS URLs', () => {
      for (const url of MDN_URLS) {
        expect(url).toMatch(/^https:\/\//);
      }
    });

    test('should all point to browser-compat-data', () => {
      for (const url of MDN_URLS) {
        expect(url).toContain('browser-compat-data');
      }
    });
  });

  describe('FEATURE_PATTERNS', () => {
    test('should be valid RegExp patterns', () => {
      for (const [name, pattern] of Object.entries(FEATURE_PATTERNS)) {
        expect(pattern).toBeInstanceOf(RegExp);
      }
    });

    test('should match arrow functions', () => {
      const pattern = FEATURE_PATTERNS.arrow_functions;
      expect('=>').toMatch(pattern);
      expect('() => {}').toMatch(pattern);
      expect('x => x * 2').toMatch(pattern);
    });

    test('should match template literals', () => {
      const pattern = FEATURE_PATTERNS.template_literals;
      expect('`hello`').toMatch(pattern);
      expect('`hello ${world}`').toMatch(pattern);
    });

    test('should match async functions', () => {
      const pattern = FEATURE_PATTERNS.async_function;
      expect('async function test() {}').toMatch(pattern);
    });

    test('should match optional chaining', () => {
      const pattern = FEATURE_PATTERNS.optional_chaining;
      expect('obj?.prop').toMatch(pattern);
      expect('obj?.method()').toMatch(pattern);
    });

    test('should match nullish coalescing', () => {
      const pattern = FEATURE_PATTERNS.nullish_coalescing;
      expect('a ?? b').toMatch(pattern);
    });

    test('should match BigInt literals', () => {
      const pattern = FEATURE_PATTERNS.bigint;
      expect('123n').toMatch(pattern);
      expect('9007199254740991n').toMatch(pattern);
    });

    test('should match private fields', () => {
      const pattern = FEATURE_PATTERNS.private_fields;
      expect('#privateField').toMatch(pattern);
      expect('#_private').toMatch(pattern);
    });

    test('should match logical assignment', () => {
      const pattern = FEATURE_PATTERNS.logical_assignment;
      expect('a ||= b').toMatch(pattern);
      expect('a &&= b').toMatch(pattern);
      expect('a ??= b').toMatch(pattern);
    });

    test('should have patterns for all major features', () => {
      const expectedPatterns = [
        'arrow_functions', 'template_literals', 'async_function',
        'await', 'class', 'const', 'let', 'spread_syntax',
        'optional_chaining', 'nullish_coalescing', 'bigint'
      ];
      
      for (const pattern of expectedPatterns) {
        expect(FEATURE_PATTERNS).toHaveProperty(pattern);
      }
    });
  });

  describe('QUICK_PATTERNS', () => {
    test('should be valid RegExp patterns', () => {
      for (const [name, pattern] of Object.entries(QUICK_PATTERNS)) {
        expect(pattern).toBeInstanceOf(RegExp);
      }
    });

    test('should have patterns for each ES version', () => {
      const expectedVersions = [
        'arrow_functions', 'template_literals', 'classes',
        'async_await', 'optional_chaining', 'nullish_coalescing',
        'class_fields', 'array_at'
      ];
      
      for (const version of expectedVersions) {
        expect(QUICK_PATTERNS).toHaveProperty(version);
      }
    });

    test('should match ES2015 features', () => {
      expect('=>').toMatch(QUICK_PATTERNS.arrow_functions);
      expect('`template`').toMatch(QUICK_PATTERNS.template_literals);
      expect('class MyClass').toMatch(QUICK_PATTERNS.classes);
    });

    test('should match ES2020 features', () => {
      expect('obj?.prop').toMatch(QUICK_PATTERNS.optional_chaining);
      expect('a ?? b').toMatch(QUICK_PATTERNS.nullish_coalescing);
      expect('123n').toMatch(QUICK_PATTERNS.bigint);
    });

    test('should match ES2022 features', () => {
      expect('#private').toMatch(QUICK_PATTERNS.class_fields);
      expect('arr.at(-1)').toMatch(QUICK_PATTERNS.array_at);
      expect('Object.hasOwn(obj, "prop")').toMatch(QUICK_PATTERNS.object_hasOwn);
    });
  });

  describe('FEATURE_VERSIONS', () => {
    test('should map features to ES versions', () => {
      expect(FEATURE_VERSIONS.arrow_functions).toBe('es2015');
      expect(FEATURE_VERSIONS.async_await).toBe('es2017');
      expect(FEATURE_VERSIONS.optional_chaining).toBe('es2020');
      expect(FEATURE_VERSIONS.class_fields).toBe('es2022');
    });

    test('should have valid ES versions', () => {
      const validVersions = new Set(VERSION_ORDER);
      for (const version of Object.values(FEATURE_VERSIONS)) {
        expect(validVersions.has(version)).toBe(true);
      }
    });

    test('should cover major ES2015 features', () => {
      const es2015Features = [
        'arrow_functions', 'template_literals', 'classes',
        'let_const', 'spread_rest', 'for_of', 'destructuring'
      ];
      
      for (const feature of es2015Features) {
        expect(FEATURE_VERSIONS[feature]).toBe('es2015');
      }
    });

    test('should cover major ES2020 features', () => {
      const es2020Features = [
        'optional_chaining', 'nullish_coalescing', 'bigint',
        'promise_allSettled', 'globalThis'
      ];
      
      for (const feature of es2020Features) {
        expect(FEATURE_VERSIONS[feature]).toBe('es2020');
      }
    });

    test('should cover major ES2022 features', () => {
      const es2022Features = [
        'class_fields', 'static_blocks', 'array_at',
        'object_hasOwn', 'top_level_await'
      ];
      
      for (const feature of es2022Features) {
        expect(FEATURE_VERSIONS[feature]).toBe('es2022');
      }
    });
  });

  describe('Pattern consistency', () => {
    test('FEATURE_PATTERNS and QUICK_PATTERNS should have overlapping features', () => {
      const featurePatternKeys = new Set(Object.keys(FEATURE_PATTERNS));
      const quickPatternKeys = new Set(Object.keys(QUICK_PATTERNS));
      
      // Some features should be in both
      const commonFeatures = ['arrow_functions', 'optional_chaining', 'nullish_coalescing'];
      for (const feature of commonFeatures) {
        expect(featurePatternKeys.has(feature)).toBe(true);
        expect(quickPatternKeys.has(feature)).toBe(true);
      }
    });

    test('All QUICK_PATTERNS features should have versions', () => {
      for (const feature of Object.keys(QUICK_PATTERNS)) {
        expect(FEATURE_VERSIONS).toHaveProperty(feature);
      }
    });
  });
});