
import { Tokenizer } from './tokenizer';
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from './constants';
import type { DetectedFeature, DetectionOptions } from './types';
export type { DetectedFeature, DetectionOptions } from './types';

export class Detector {
  private compiledPatterns: Map<string, RegExp>;
  private es2015Pattern: RegExp;
  
  constructor() {
    this.compiledPatterns = new Map();
    for (const [name, pattern] of Object.entries(QUICK_PATTERNS)) {
      this.compiledPatterns.set(name, pattern);
    }
    
    this.es2015Pattern = /=>|`|\bclass\s|\b(?:let|const)\s|\.\.\.|\basync\s|\bawait\s/g;
  }
  
  quickScan(code: string, options?: Partial<DetectionOptions>): DetectedFeature[] {
    const detected: DetectedFeature[] = [];
    const targetIndex = options?.target ? VERSION_ORDER.indexOf(options.target) : -1;
    const shouldCheckCompatibility = options?.target && options.target !== 'esnext';
    
    if (options?.target === 'es5') {
      this.es2015Pattern.lastIndex = 0;
      const match = this.es2015Pattern.exec(code);
      if (match) {
        const featureName = match[0] === '=>' ? 'arrow_functions' :
                           match[0] === '`' ? 'template_literals' :
                           match[0].includes('class') ? 'classes' :
                           match[0].includes('let') || match[0].includes('const') ? 'let_const' :
                           match[0] === '...' ? 'spread_rest' :
                           match[0].includes('async') || match[0].includes('await') ? 'async_await' : 'unknown';
        
        const upToMatch = code.substring(0, match.index);
        const lineNum = (upToMatch.match(/\n/g) || []).length + 1;
        const lastNewline = upToMatch.lastIndexOf('\n');
        const column = match.index - lastNewline;
        
        const lineStart = lastNewline + 1;
        const lineEnd = code.indexOf('\n', match.index);
        const endPos = lineEnd === -1 ? code.length : lineEnd;
        const maxSnippetEnd = Math.min(lineStart + 50, endPos);
        const rawSnippet = code.substring(lineStart, maxSnippetEnd);
        const cleanSnippet = rawSnippet.replace(/\n/g, ' ');
        const snippet = cleanSnippet.trim();
        
        detected.push({
          name: featureName,
          version: 'es2015',
          line: lineNum,
          column: column,
          snippet: snippet
        });
        
        if (options?.throwOnFirst) {
          return detected;
        }
      }
      return detected;
    }
    
    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      
      const isAlreadySupported = shouldCheckCompatibility && targetIndex >= 0 && featureIndex <= targetIndex;
      if (isAlreadySupported) {
        continue;
      }
      
      pattern.lastIndex = 0;
      const match = pattern.exec(code);
      if (match) {
        const upToMatch = code.substring(0, match.index);
        const lineNum = (upToMatch.match(/\n/g) || []).length + 1;
        const lastNewline = upToMatch.lastIndexOf('\n');
        const column = match.index - lastNewline;
        
        const lineStart = lastNewline + 1;
        const lineEnd = code.indexOf('\n', match.index);
        const endPos = lineEnd === -1 ? code.length : lineEnd;
        const maxSnippetEnd = Math.min(lineStart + 50, endPos);
        const rawSnippet = code.substring(lineStart, maxSnippetEnd);
        const cleanSnippet = rawSnippet.replace(/\n/g, ' ');
        const snippet = cleanSnippet.trim();
        
        detected.push({
          name: featureName,
          version: featureVersion,
          line: lineNum,
          column: column,
          snippet: snippet
        });
        
        if (options?.throwOnFirst) {
          return detected;
        }
      }
    }
    
    return detected;
  }
  
  accurateScan(code: string, quickFeatures: DetectedFeature[]): DetectedFeature[] {
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();
    const codeTokens = tokenizer.getCodeTokens();
    
    const tokenValueSet = new Set(codeTokens.map(t => t.value));
    const hasTemplates = tokens.some(t => t.type === 'template');
    
    const validated: DetectedFeature[] = [];
    
    for (const feature of quickFeatures) {
      if (this.validateFeatureFast(feature, codeTokens, tokenValueSet, hasTemplates)) {
        validated.push(feature);
      }
    }
    
    const additionalFeatures = this.detectFromTokens(codeTokens);
    validated.push(...additionalFeatures);
    
    return validated;
  }
  
  private validateFeatureFast(feature: DetectedFeature, codeTokens: any[], tokenValues: Set<string>, hasTemplates: boolean): boolean {
    switch (feature.name) {
      case 'arrow_functions':
        return tokenValues.has('=>');
      case 'spread_rest':
        return tokenValues.has('...');
      case 'template_literals':
        return hasTemplates;
      case 'async_await':
        return tokenValues.has('async') || tokenValues.has('await');
      case 'classes':
        return tokenValues.has('class');
      case 'let_const':
        return tokenValues.has('let') || tokenValues.has('const');
      case 'optional_chaining':
        return tokenValues.has('?.');
      case 'nullish_coalescing':
        return tokenValues.has('??');
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
        if (!tokenValues.has('at')) return false;
        for (let i = 0; i < codeTokens.length - 2; i++) {
          if (codeTokens[i].value === '.' && codeTokens[i + 1].value === 'at' && codeTokens[i + 2].value === '(') {
            return true;
          }
        }
        return false;
      case 'object_hasOwn':
        if (!tokenValues.has('Object') || !tokenValues.has('hasOwn')) return false;
        for (let i = 0; i < codeTokens.length - 3; i++) {
          if (codeTokens[i].value === 'Object' && codeTokens[i + 1].value === '.' &&
              codeTokens[i + 2].value === 'hasOwn' && codeTokens[i + 3].value === '(') {
            return true;
          }
        }
        return false;
      case 'for_of':
        return tokenValues.has('of');
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
    const quickFeatures = this.quickScan(code, options);
    
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
