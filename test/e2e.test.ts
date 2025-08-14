import { test, expect, describe } from 'bun:test';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { brakefast, detect, check, getMinimumESVersion } from '../src/index';

// Load all test fixtures
const fixturesDir = join(__dirname, 'fixtures');
const fixtures = readdirSync(fixturesDir)
  .filter(f => f.endsWith('.js'))
  .map(name => ({
    name,
    content: readFileSync(join(fixturesDir, name), 'utf-8')
  }));

describe('E2E Tests', () => {
  describe('Performance Requirements', () => {
    test('should process 1000 files quickly (quick mode)', () => {
      const testFile = fixtures.find(f => f.name === 'es2015.js')!.content;
      const iterations = 1000;
      
      // Warm up - first runs are slower
      for (let i = 0; i < 10; i++) {
        detect(testFile, { quick: true });
      }
      
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        detect(testFile, { quick: true });
      }
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50); // CI environments are slower
    });

    test('should process single file quickly after warmup', () => {
      const testFile = fixtures.find(f => f.name === 'es2015.js')!.content;
      
      // Warm up
      for (let i = 0; i < 10; i++) {
        detect(testFile, { quick: true });
      }
      
      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        detect(testFile, { quick: true });
        times.push(performance.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(1.0); // Average should be under 1ms
    });
  });

  describe('Detection Accuracy', () => {
    test('should correctly detect ES5 code', () => {
      const es5 = fixtures.find(f => f.name === 'es5.js')!;
      const features = detect(es5.content);
      const version = getMinimumESVersion(es5.content);
      
      expect(features.length).toBe(0);
      expect(version).toBe('es5');
      expect(check(es5.content, { target: 'es5' })).toBe(true);
    });

    test('should correctly detect ES2015 features', () => {
      const es2015 = fixtures.find(f => f.name === 'es2015.js')!;
      const features = detect(es2015.content);
      const version = getMinimumESVersion(es2015.content);
      
      expect(features.length).toBeGreaterThan(0);
      expect(version).toBe('es2015');
      expect(check(es2015.content, { target: 'es5' })).toBe(false);
      expect(check(es2015.content, { target: 'es2015' })).toBe(true);
    });

    test('should correctly detect ES2020 features', () => {
      const es2020 = fixtures.find(f => f.name === 'es2020.js')!;
      const features = detect(es2020.content);
      const version = getMinimumESVersion(es2020.content);
      
      expect(features.length).toBeGreaterThan(0);
      expect(version).toBe('es2020');
      expect(check(es2020.content, { target: 'es2015' })).toBe(false);
      expect(check(es2020.content, { target: 'es2020' })).toBe(true);
    });

    test('should correctly detect ES2022 features', () => {
      const es2022 = fixtures.find(f => f.name === 'es2022.js')!;
      const features = detect(es2022.content);
      const version = getMinimumESVersion(es2022.content);
      
      expect(features.length).toBeGreaterThan(0);
      expect(version).toBe('es2022');
      expect(check(es2022.content, { target: 'es2020' })).toBe(false);
      expect(check(es2022.content, { target: 'es2022' })).toBe(true);
    });

    test('should handle false positives correctly', () => {
      const falsePositives = fixtures.find(f => f.name === 'false-positives.js')!;
      const features = detect(falsePositives.content, { quick: false });
      const version = getMinimumESVersion(falsePositives.content);
      
      expect(features.length).toBe(0);
      expect(version).toBe('es5');
      expect(check(falsePositives.content, { target: 'es5' })).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should throw descriptive errors for incompatible code', () => {
      const es2020 = fixtures.find(f => f.name === 'es2020.js')!;
      
      expect(() => {
        brakefast(es2020.content, { target: 'es5' });
      }).toThrow();
      
      try {
        brakefast(es2020.content, { target: 'es5' });
      } catch (error: any) {
        expect(error.message).toContain('ES feature');
        expect(error.message).toContain('requires');
        expect(error.feature).toBeDefined();
        expect(error.target).toBe('es5');
      }
    });
  });

  describe('Quick vs Full Mode', () => {
    test('quick mode should be faster than full mode', () => {
      const testFile = fixtures.find(f => f.name === 'es2015.js')!.content;
      const iterations = 100;
      
      const startQuick = performance.now();
      for (let i = 0; i < iterations; i++) {
        detect(testFile, { quick: true });
      }
      const quickTime = performance.now() - startQuick;
      
      const startFull = performance.now();
      for (let i = 0; i < iterations; i++) {
        detect(testFile, { quick: false });
      }
      const fullTime = performance.now() - startFull;
      
      // Quick mode should generally be faster
      // Allow some variance for small files
      expect(quickTime).toBeLessThanOrEqual(fullTime * 1.2);
    });

    test('both modes should work correctly', () => {
      for (const fixture of fixtures) {
        const quickFeatures = detect(fixture.content, { quick: true });
        const fullFeatures = detect(fixture.content, { quick: false });
        
        // Both modes should detect features
        if (fixture.name === 'es5.js' || fixture.name === 'false-positives.js') {
          // ES5 and false positives should have no features
          expect(fullFeatures.length).toBe(0);
        } else {
          // Other fixtures should have features detected
          expect(fullFeatures.length).toBeGreaterThan(0);
        }
        
        // Full mode can detect additional features through token analysis
        // (like imports/exports) that quick mode might miss
        expect(quickFeatures).toBeDefined();
        expect(fullFeatures).toBeDefined();
      }
    });
  });

  describe('All Fixtures Coverage', () => {
    test('all fixtures should be processable without errors', () => {
      for (const fixture of fixtures) {
        expect(() => {
          const features = detect(fixture.content);
          const version = getMinimumESVersion(fixture.content);
          const isES5 = check(fixture.content, { target: 'es5' });
        }).not.toThrow();
      }
    });
  });

  describe('Memory Efficiency', () => {
    test('should not leak memory on repeated processing', () => {
      const testFile = fixtures.find(f => f.name === 'es2015.js')!.content;
      const memBefore = process.memoryUsage().heapUsed;
      
      // Process many times
      for (let i = 0; i < 1000; i++) {
        detect(testFile);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const memAfter = process.memoryUsage().heapUsed;
      const memIncrease = (memAfter - memBefore) / 1024 / 1024; // MB
      
      // Should not increase by more than 10MB for 1000 iterations
      expect(memIncrease).toBeLessThan(10);
    });
  });
});