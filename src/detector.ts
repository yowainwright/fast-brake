import { Tokenizer } from './tokenizer';
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from './constants';
import type { DetectedFeature, DetectionOptions } from './types';
export type { DetectedFeature, DetectionOptions } from './types';

export class Detector {
  private compiledPatterns: Map<string, RegExp>;
  
  constructor() {

    this.compiledPatterns = new Map();
    for (const [name, pattern] of Object.entries(QUICK_PATTERNS)) {
      this.compiledPatterns.set(name, pattern);
    }
  }
  

  quickScan(code: string): DetectedFeature[] {
    const detected: DetectedFeature[] = [];
    const lines = code.split('\n');
    
    for (const [featureName, pattern] of this.compiledPatterns.entries()) {

      pattern.lastIndex = 0;
      
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        const match = pattern.exec(line);
        
        if (match) {
          detected.push({
            name: featureName,
            version: FEATURE_VERSIONS[featureName],
            line: lineNum + 1,
            column: match.index + 1,
            snippet: line.trim()
          });
          break;
        }
      }
    }
    
    return detected;
  }
  

  accurateScan(code: string, quickFeatures: DetectedFeature[]): DetectedFeature[] {
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();
    const codeTokens = tokenizer.getCodeTokens();
    
    const validated: DetectedFeature[] = [];
    

    for (const feature of quickFeatures) {
      if (this.validateFeature(feature, codeTokens, tokens)) {
        validated.push(feature);
      }
    }
    

    const additionalFeatures = this.detectFromTokens(codeTokens);
    validated.push(...additionalFeatures);
    
    return validated;
  }
  

  private validateFeature(feature: DetectedFeature, codeTokens: any[], allTokens: any[]): boolean {
    switch (feature.name) {
      case 'arrow_functions':
        return codeTokens.some(t => t.value === '=>');
      case 'spread_rest':
        return codeTokens.some(t => t.value === '...');
      case 'template_literals':

        return allTokens.some(t => t.type === 'template');
      case 'async_await':
        return codeTokens.some(t => t.value === 'async' || t.value === 'await');
      case 'classes':
        return codeTokens.some(t => t.value === 'class');
      case 'let_const':
        return codeTokens.some(t => t.value === 'let' || t.value === 'const');
      case 'optional_chaining':
        return codeTokens.some(t => t.value === '?.');
      case 'nullish_coalescing':
        return codeTokens.some(t => t.value === '??');
      case 'bigint':

        return codeTokens.some(t => t.type === 'number' && t.value.endsWith('n'));
      case 'private_fields':
      case 'class_fields':

        return codeTokens.some(t => t.value.startsWith('#'));
      case 'static_blocks':

        for (let i = 0; i < codeTokens.length - 1; i++) {
          if (codeTokens[i].value === 'static' && codeTokens[i + 1].value === '{') {
            return true;
          }
        }
        return false;
      case 'array_at':

        for (let i = 0; i < codeTokens.length - 2; i++) {
          if (codeTokens[i].value === '.' && codeTokens[i + 1].value === 'at' && codeTokens[i + 2].value === '(') {
            return true;
          }
        }
        return false;
      case 'object_hasOwn':

        for (let i = 0; i < codeTokens.length - 3; i++) {
          if (codeTokens[i].value === 'Object' && codeTokens[i + 1].value === '.' &&
              codeTokens[i + 2].value === 'hasOwn' && codeTokens[i + 3].value === '(') {
            return true;
          }
        }
        return false;
      case 'for_of':
        return codeTokens.some(t => t.value === 'of');
      case 'destructuring':

        for (let i = 0; i < codeTokens.length - 1; i++) {
          if ((codeTokens[i].value === 'const' || codeTokens[i].value === 'let' || codeTokens[i].value === 'var') &&
              (codeTokens[i + 1].value === '[' || codeTokens[i + 1].value === '{')) {
            return true;
          }
        }
        return false;
      default:
        return false;
    }
  }
  

  private detectFromTokens(tokens: any[]): DetectedFeature[] {
    const detected: DetectedFeature[] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const next = tokens[i + 1];
      

      if (token.value === 'import' && next && (next.value === '(' || next.value === '{' || next.type === 'string')) {
        detected.push({
          name: 'import',
          version: 'es2015',
          line: token.line,
          column: token.column
        });
      }
      
      if (token.value === 'export') {
        detected.push({
          name: 'export',
          version: 'es2015',
          line: token.line,
          column: token.column
        });
      }
      
      if (token.value === 'function' && next && next.value === '*') {
        detected.push({
          name: 'generators',
          version: 'es2015',
          line: token.line,
          column: token.column
        });
      }
    }
    
    return detected;
  }
  

  detect(code: string, options: DetectionOptions): DetectedFeature[] {

    const quickFeatures = this.quickScan(code);
    
    if (options.quick) {
      return quickFeatures;
    }
    

    return this.accurateScan(code, quickFeatures);
  }
  

  check(code: string, options: DetectionOptions): boolean {
    const detected = this.detect(code, options);
    const targetIndex = VERSION_ORDER.indexOf(options.target);
    
    for (const feature of detected) {
      const featureIndex = VERSION_ORDER.indexOf(feature.version);
      if (featureIndex > targetIndex) {
        if (options.throwOnFirst) {
          throw new Error(
            `Feature "${feature.name}" requires ${feature.version} but target is ${options.target}` +
            (feature.line ? ` at line ${feature.line}` : '')
          );
        }
        return false;
      }
    }
    
    return true;
  }
  

  getMinimumVersion(code: string, options?: { quick?: boolean }): string {
    const detected = this.detect(code, { target: 'esnext', quick: options?.quick });
    
    let minVersion = 'es5';
    let minIndex = 0;
    
    for (const feature of detected) {
      const featureIndex = VERSION_ORDER.indexOf(feature.version);
      if (featureIndex > minIndex) {
        minIndex = featureIndex;
        minVersion = feature.version;
      }
    }
    
    return minVersion;
  }
}
let detectorInstance: Detector | null = null;

export function getDetector(): Detector {
  if (!detectorInstance) {
    detectorInstance = new Detector();
  }
  return detectorInstance;
}
export function detect(code: string, options: DetectionOptions): DetectedFeature[] {
  return getDetector().detect(code, options);
}

export function check(code: string, options: DetectionOptions): boolean {
  return getDetector().check(code, options);
}

export function getMinimumVersion(code: string, options?: { quick?: boolean }): string {
  return getDetector().getMinimumVersion(code, options);
}