import { test, expect, describe } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { brakefast, detect, check, getMinimumESVersion } from '../src/index';

const fixtures = {
  es5: readFileSync(join(__dirname, 'fixtures/es5.js'), 'utf-8'),
  es2015: readFileSync(join(__dirname, 'fixtures/es2015.js'), 'utf-8'),
  es2020: readFileSync(join(__dirname, 'fixtures/es2020.js'), 'utf-8'),
  es2022: readFileSync(join(__dirname, 'fixtures/es2022.js'), 'utf-8'),
  falsePositives: readFileSync(join(__dirname, 'fixtures/false-positives.js'), 'utf-8')
};

describe('brakefast', () => {
  describe('ES5 compatibility', () => {
    test('should pass ES5 code with ES5 target', () => {
      expect(() => brakefast(fixtures.es5, { target: 'es5' })).not.toThrow();
    });
    
    test('should detect no ES6+ features in ES5 code', () => {
      const features = detect(fixtures.es5);
      const es6Features = features.filter(f => f.version !== 'es5');
      expect(es6Features).toHaveLength(0);
    });
  });
  
  describe('ES2015 detection', () => {
    test('should fail ES2015 code with ES5 target', () => {
      expect(() => brakefast(fixtures.es2015, { target: 'es5' })).toThrow();
    });
    
    test('should pass ES2015 code with ES2015 target', () => {
      expect(() => brakefast(fixtures.es2015, { target: 'es2015' })).not.toThrow();
    });
    
    test('should detect ES2015 features', () => {
      const features = detect(fixtures.es2015);
      const featureNames = features.map(f => f.name);
      expect(featureNames).toContain('arrow_functions');
      expect(featureNames).toContain('classes');
      expect(featureNames).toContain('let_const');
      expect(featureNames).toContain('template_literals');
    });
  });
  
  describe('ES2020 detection', () => {
    test('should detect optional chaining', () => {
      const features = detect(fixtures.es2020);
      const optionalChaining = features.find(f => f.name === 'optional_chaining');
      expect(optionalChaining).toBeDefined();
      expect(optionalChaining?.version).toBe('es2020');
    });
    
    test('should detect nullish coalescing', () => {
      const features = detect(fixtures.es2020);
      const nullishCoalescing = features.find(f => f.name === 'nullish_coalescing');
      expect(nullishCoalescing).toBeDefined();
    });
    
    test('should detect BigInt', () => {
      const features = detect(fixtures.es2020);
      const bigint = features.find(f => f.name === 'bigint');
      expect(bigint).toBeDefined();
    });
  });
  
  describe('ES2022 detection', () => {
    test('should detect private fields', () => {
      const features = detect(fixtures.es2022);
      const privateFields = features.find(f => f.name === 'class_fields');
      expect(privateFields).toBeDefined();
      expect(privateFields?.version).toBe('es2022');
    });
    
    test('should detect static blocks', () => {
      const features = detect(fixtures.es2022);
      const staticBlocks = features.find(f => f.name === 'static_blocks');
      expect(staticBlocks).toBeDefined();
    });
    
    test('should detect Array.at', () => {
      const features = detect(fixtures.es2022);
      const arrayAt = features.find(f => f.name === 'array_at');
      expect(arrayAt).toBeDefined();
    });
  });
  
  describe('False positives', () => {
    test('should not detect features in strings', () => {
      const features = detect(fixtures.falsePositives, { quick: false });
      expect(features).toHaveLength(0);
    });
    
    test('should pass ES5 check despite ES6+ syntax in strings', () => {
      const isES5 = check(fixtures.falsePositives, { target: 'es5' });
      expect(isES5).toBe(true);
    });
  });
  
  describe('getMinimumESVersion', () => {
    test('should return es5 for ES5 code', () => {
      const version = getMinimumESVersion(fixtures.es5);
      expect(version).toBe('es5');
    });
    
    test('should return es2015 for ES2015 code', () => {
      const version = getMinimumESVersion(fixtures.es2015);
      expect(version).toBe('es2015');
    });
    
    test('should return es2020 for ES2020 code', () => {
      const version = getMinimumESVersion(fixtures.es2020);
      expect(version).toBe('es2020');
    });
    
    test('should return es2022 for ES2022 code', () => {
      const version = getMinimumESVersion(fixtures.es2022);
      expect(version).toBe('es2022');
    });
  });
  
  describe('Quick mode', () => {
    test('should be faster in quick mode', () => {
      const code = fixtures.es2022;
      
      const startQuick = Date.now();
      for (let i = 0; i < 100; i++) {
        detect(code, { quick: true });
      }
      const quickTime = Date.now() - startQuick;
      
      const startFull = Date.now();
      for (let i = 0; i < 100; i++) {
        detect(code, { quick: false });
      }
      const fullTime = Date.now() - startFull;
      
      expect(quickTime).toBeLessThan(fullTime);
    });
  });
  
  describe('Error handling', () => {
    test('should throw with feature details', () => {
      try {
        brakefast('const x = 10', { target: 'es5', throwOnFirst: true });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('let_const');
        expect(error.message).toContain('es2015');
        expect(error.message).toContain('es5');
        expect(error.feature).toBeDefined();
        expect(error.target).toBe('es5');
      }
    });
  });
});