import { test, expect, describe } from 'bun:test';
import { Detector, getDetector, detect, check, getMinimumVersion } from './detector';
import type { DetectionOptions } from './types';

describe('Detector', () => {
  describe('quickScan', () => {
    test('should detect arrow functions', () => {
      const detector = new Detector();
      const features = detector.quickScan('const fn = () => {}');
      
      const arrowFunc = features.find(f => f.name === 'arrow_functions');
      expect(arrowFunc).toBeDefined();
      expect(arrowFunc?.version).toBe('es2015');
    });

    test('should detect template literals', () => {
      const detector = new Detector();
      const features = detector.quickScan('const str = `hello ${name}`');
      
      const template = features.find(f => f.name === 'template_literals');
      expect(template).toBeDefined();
      expect(template?.version).toBe('es2015');
    });

    test('should detect async/await', () => {
      const detector = new Detector();
      const features = detector.quickScan('async function test() { await promise; }');
      
      const asyncAwait = features.find(f => f.name === 'async_await');
      expect(asyncAwait).toBeDefined();
      expect(asyncAwait?.version).toBe('es2017');
    });

    test('should detect optional chaining', () => {
      const detector = new Detector();
      const features = detector.quickScan('obj?.prop?.method()');
      
      const optChaining = features.find(f => f.name === 'optional_chaining');
      expect(optChaining).toBeDefined();
      expect(optChaining?.version).toBe('es2020');
    });

    test('should detect nullish coalescing', () => {
      const detector = new Detector();
      const features = detector.quickScan('const value = a ?? b');
      
      const nullish = features.find(f => f.name === 'nullish_coalescing');
      expect(nullish).toBeDefined();
      expect(nullish?.version).toBe('es2020');
    });

    test('should detect BigInt literals', () => {
      const detector = new Detector();
      const features = detector.quickScan('const big = 123n');
      
      const bigint = features.find(f => f.name === 'bigint');
      expect(bigint).toBeDefined();
      expect(bigint?.version).toBe('es2020');
    });

    test('should detect logical assignment', () => {
      const detector = new Detector();
      const features = detector.quickScan('a ||= b; c &&= d; e ??= f');
      
      const logical = features.find(f => f.name === 'logical_assignment');
      expect(logical).toBeDefined();
      expect(logical?.version).toBe('es2021');
    });

    test('should detect private fields', () => {
      const detector = new Detector();
      const features = detector.quickScan('class C { #private = 1; }');
      
      const privateField = features.find(f => f.name === 'class_fields');
      expect(privateField).toBeDefined();
      expect(privateField?.version).toBe('es2022');
    });

    test('should detect static blocks', () => {
      const detector = new Detector();
      const features = detector.quickScan('class C { static { } }');
      
      const staticBlock = features.find(f => f.name === 'static_blocks');
      expect(staticBlock).toBeDefined();
      expect(staticBlock?.version).toBe('es2022');
    });

    test('should include line and column info', () => {
      const detector = new Detector();
      const code = '\n\n  const fn = () => {}';
      const features = detector.quickScan(code);
      
      const arrowFunc = features.find(f => f.name === 'arrow_functions');
      expect(arrowFunc?.line).toBe(3);
      expect(arrowFunc?.column).toBeGreaterThan(0);
    });

    test('should include code snippet', () => {
      const detector = new Detector();
      const features = detector.quickScan('const fn = () => {}');
      
      const arrowFunc = features.find(f => f.name === 'arrow_functions');
      expect(arrowFunc?.snippet).toBe('const fn = () => {}');
    });
  });

  describe('accurateScan', () => {
    test('should validate arrow functions', () => {
      const detector = new Detector();
      const quickFeatures = detector.quickScan('const fn = () => {}');
      const validated = detector.accurateScan('const fn = () => {}', quickFeatures);
      
      expect(validated.find(f => f.name === 'arrow_functions')).toBeDefined();
    });

    test('should detect imports from tokens', () => {
      const detector = new Detector();
      const quickFeatures = detector.quickScan('import { x } from "mod"');
      const validated = detector.accurateScan('import { x } from "mod"', quickFeatures);
      
      expect(validated.find(f => f.name === 'import')).toBeDefined();
    });

    test('should detect exports from tokens', () => {
      const detector = new Detector();
      const quickFeatures = detector.quickScan('export default class {}');
      const validated = detector.accurateScan('export default class {}', quickFeatures);
      
      expect(validated.find(f => f.name === 'export')).toBeDefined();
    });

    test('should detect generators from tokens', () => {
      const detector = new Detector();
      const quickFeatures = detector.quickScan('function* gen() {}');
      const validated = detector.accurateScan('function* gen() {}', quickFeatures);
      
      expect(validated.find(f => f.name === 'generators')).toBeDefined();
    });

    test('should filter out false positives in strings', () => {
      const detector = new Detector();
      const code = '"const arrow = () => {}"';
      const quickFeatures = detector.quickScan(code);
      const validated = detector.accurateScan(code, quickFeatures);
      
      // Quick scan might find it, but accurate scan should filter it
      expect(validated.find(f => f.name === 'arrow_functions')).toBeUndefined();
    });
  });

  describe('detect method', () => {
    test('should use quick mode when specified', () => {
      const detector = new Detector();
      const options: DetectionOptions = { target: 'es5', quick: true };
      const features = detector.detect('() => {}', options);
      
      expect(features.length).toBeGreaterThan(0);
    });

    test('should use accurate mode by default', () => {
      const detector = new Detector();
      const options: DetectionOptions = { target: 'es5' };
      const features = detector.detect('() => {}', options);
      
      expect(features.find(f => f.name === 'arrow_functions')).toBeDefined();
    });

    test('should detect multiple features', () => {
      const detector = new Detector();
      const code = 'const fn = async () => { await x?.y ?? z }';
      const features = detector.detect(code, { target: 'esnext' });
      
      expect(features.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('check method', () => {
    test('should return true for compatible code', () => {
      const detector = new Detector();
      const es5Code = 'function test() { return 42; }';
      
      expect(detector.check(es5Code, { target: 'es5' })).toBe(true);
      expect(detector.check(es5Code, { target: 'es2015' })).toBe(true);
      expect(detector.check(es5Code, { target: 'esnext' })).toBe(true);
    });

    test('should return false for incompatible code', () => {
      const detector = new Detector();
      const es2015Code = '() => {}';
      
      expect(detector.check(es2015Code, { target: 'es5' })).toBe(false);
    });

    test('should throw on first incompatible feature when specified', () => {
      const detector = new Detector();
      const code = 'const x = () => {}';
      
      expect(() => {
        detector.check(code, { target: 'es5', throwOnFirst: true });
      }).toThrow();
    });

    test('should include line info in error', () => {
      const detector = new Detector();
      const code = '\n\nconst x = () => {}';
      
      try {
        detector.check(code, { target: 'es5', throwOnFirst: true });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('line');
      }
    });
  });

  describe('getMinimumVersion', () => {
    test('should return es5 for ES5 code', () => {
      const detector = new Detector();
      const code = 'function test() { return 42; }';
      
      expect(detector.getMinimumVersion(code)).toBe('es5');
    });

    test('should return es2015 for arrow functions', () => {
      const detector = new Detector();
      const code = '() => {}';
      
      expect(detector.getMinimumVersion(code)).toBe('es2015');
    });

    test('should return es2017 for async/await', () => {
      const detector = new Detector();
      const code = 'async function test() { await promise; }';
      
      expect(detector.getMinimumVersion(code)).toBe('es2017');
    });

    test('should return es2020 for optional chaining', () => {
      const detector = new Detector();
      const code = 'obj?.prop';
      
      expect(detector.getMinimumVersion(code)).toBe('es2020');
    });

    test('should return es2022 for private fields', () => {
      const detector = new Detector();
      const code = 'class C { #private = 1; }';
      
      expect(detector.getMinimumVersion(code)).toBe('es2022');
    });

    test('should return highest version for mixed features', () => {
      const detector = new Detector();
      const code = 'const x = () => {}; class C { #private = 1; }';
      
      expect(detector.getMinimumVersion(code)).toBe('es2022');
    });

    test('should use quick mode when specified', () => {
      const detector = new Detector();
      const code = '() => {}';
      
      const version = detector.getMinimumVersion(code, { quick: true });
      expect(version).toBe('es2015');
    });
  });

  describe('singleton instance', () => {
    test('should return same instance', () => {
      const instance1 = getDetector();
      const instance2 = getDetector();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('convenience functions', () => {
    test('detect function should work', () => {
      const features = detect('() => {}', { target: 'es5' });
      expect(features.length).toBeGreaterThan(0);
    });

    test('check function should work', () => {
      const isValid = check('function test() {}', { target: 'es5' });
      expect(isValid).toBe(true);
    });

    test('getMinimumVersion function should work', () => {
      const version = getMinimumVersion('() => {}');
      expect(version).toBe('es2015');
    });
  });

  describe('ES2016 features', () => {
    test('should detect exponentiation operator', () => {
      const detector = new Detector();
      const features = detector.quickScan('2 ** 3');
      
      const exp = features.find(f => f.name === 'exponentiation');
      expect(exp).toBeDefined();
      expect(exp?.version).toBe('es2016');
    });
  });

  describe('ES2018 features', () => {
    test('should detect async iteration', () => {
      const detector = new Detector();
      const features = detector.quickScan('for await (const x of y) {}');
      
      const asyncIter = features.find(f => f.name === 'async_iteration');
      expect(asyncIter).toBeDefined();
      expect(asyncIter?.version).toBe('es2018');
    });

    test('should detect rest spread properties', () => {
      const detector = new Detector();
      const features = detector.quickScan('const {...rest} = obj');
      
      const restSpread = features.find(f => f.name === 'rest_spread_properties');
      expect(restSpread).toBeDefined();
      expect(restSpread?.version).toBe('es2018');
    });
  });

  describe('ES2019 features', () => {
    test('should detect Array.flat', () => {
      const detector = new Detector();
      const features = detector.quickScan('arr.flat()');
      
      const flat = features.find(f => f.name === 'array_flat');
      expect(flat).toBeDefined();
      expect(flat?.version).toBe('es2019');
    });

    test('should detect Array.flatMap', () => {
      const detector = new Detector();
      const features = detector.quickScan('arr.flatMap(x => x)');
      
      const flatMap = features.find(f => f.name === 'array_flat');
      expect(flatMap).toBeDefined();
      expect(flatMap?.version).toBe('es2019');
    });
  });

  describe('ES2021 features', () => {
    test('should detect numeric separators', () => {
      const detector = new Detector();
      const features = detector.quickScan('const n = 1_000_000');
      
      const numSep = features.find(f => f.name === 'numeric_separators');
      expect(numSep).toBeDefined();
      expect(numSep?.version).toBe('es2021');
    });

    test('should detect String.replaceAll', () => {
      const detector = new Detector();
      const features = detector.quickScan('str.replaceAll("a", "b")');
      
      const replaceAll = features.find(f => f.name === 'string_replaceAll');
      expect(replaceAll).toBeDefined();
      expect(replaceAll?.version).toBe('es2021');
    });

    test('should detect Promise.any', () => {
      const detector = new Detector();
      const features = detector.quickScan('Promise.any([p1, p2])');
      
      const promiseAny = features.find(f => f.name === 'promise_any');
      expect(promiseAny).toBeDefined();
      expect(promiseAny?.version).toBe('es2021');
    });
  });

  describe('ES2022 features', () => {
    test('should detect Array.at', () => {
      const detector = new Detector();
      const features = detector.quickScan('arr.at(-1)');
      
      const arrayAt = features.find(f => f.name === 'array_at');
      expect(arrayAt).toBeDefined();
      expect(arrayAt?.version).toBe('es2022');
    });

    test('should detect Object.hasOwn', () => {
      const detector = new Detector();
      const features = detector.quickScan('Object.hasOwn(obj, "prop")');
      
      const hasOwn = features.find(f => f.name === 'object_hasOwn');
      expect(hasOwn).toBeDefined();
      expect(hasOwn?.version).toBe('es2022');
    });

    test('should detect top-level await', () => {
      const detector = new Detector();
      const features = detector.quickScan('await fetch("/api")');
      
      const topAwait = features.find(f => f.name === 'top_level_await');
      expect(topAwait).toBeDefined();
      expect(topAwait?.version).toBe('es2022');
    });
  });
});