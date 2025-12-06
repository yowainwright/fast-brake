import { readFileSync, statSync } from "fs";
import {
  TINY_FILE_SIZE,
  COMPLEXITY_INDICATORS,
  MAX_FILE_SIZE,
} from "./constants";
import { loadPlugin } from "./plugins/loader";
import { getCachedRegex, normalizeZeroWidth } from "./utils";
import { safePreprocessor } from "./plugins/jscomments";
import {
  resolveBrakeConfig,
  runBrakePipeline,
  DEFAULT_BRAKE_PRESET,
} from "./brake";
import type {
  DetectionMode,
  DetectionMatch,
  DetectionResult,
  DetectFastOptions,
  Plugin,
  DetectionOptions,
  Preprocessor,
  BrakeConfig,
  BrakeStage,
} from "./types";

const DEFAULT_PREPROCESSORS: Preprocessor[] = [
  normalizeZeroWidth,
  safePreprocessor,
];

export class Detector {
  private compiledPatterns: Map<string, string>;
  private featureStrings: Record<string, string[]>;
  private featureExcludes: Record<string, string[]>;
  private plugin: Plugin | null = null;
  private initialized = false;
  private allStringPatterns: Array<{ pattern: string; featureName: string }> =
    [];
  private combinedRegex: RegExp | null = null;
  private combinedStringRegex: RegExp | null = null;
  private stringPatternIndexToFeature: Map<number, { pattern: string; featureName: string }> = new Map();
  private patternIndexToFeature: Map<number, string> = new Map();
  private brakeStages: BrakeStage[];

  constructor(brakeConfig: BrakeConfig = DEFAULT_BRAKE_PRESET) {
    this.compiledPatterns = new Map();
    this.featureStrings = {};
    this.featureExcludes = {};
    this.brakeStages = resolveBrakeConfig(brakeConfig);
  }

  private assertInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "Detector not initialized. Call initialize() or initializeSync() first.",
      );
    }
  }

  private validateInput(code: unknown): asserts code is string {
    if (code === null || code === undefined) {
      throw new Error("Code input cannot be null or undefined");
    }
    if (typeof code !== "string") {
      throw new Error(`Code input must be a string, received ${typeof code}`);
    }
  }

  async initialize(plugin?: Plugin): Promise<void> {
    if (this.initialized) return;

    if (plugin) {
      this.plugin = plugin;
    } else {
      const loaded = await loadPlugin("esversion");
      if (!loaded) {
        throw new Error("Failed to load default esversion plugin");
      }
      this.plugin = loaded;
    }

    this.applyPlugin(this.plugin);
    this.initialized = true;
  }

  initializeSync(plugin: Plugin): void {
    if (this.initialized) return;

    this.plugin = plugin;
    this.applyPlugin(plugin);
    this.initialized = true;
  }

  getPlugin(): Plugin | null {
    return this.plugin;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private applyPlugin(plugin: Plugin): void {
    this.compiledPatterns.clear();
    this.featureStrings = {};
    this.featureExcludes = {};
    this.allStringPatterns = [];
    this.patternIndexToFeature.clear();
    this.stringPatternIndexToFeature.clear();

    const regexParts: string[] = [];
    const stringRegexParts: string[] = [];
    let patternIndex = 0;
    let stringPatternIndex = 0;

    Object.entries(plugin.spec.matches).forEach(([matchName, match]) => {
      if ("strings" in match && match.strings) {
        this.featureStrings[matchName] = match.strings;
        match.strings.forEach((pattern) => {
          this.allStringPatterns.push({ pattern, featureName: matchName });
          const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          stringRegexParts.push(`(${escaped})`);
          this.stringPatternIndexToFeature.set(stringPatternIndex, { pattern, featureName: matchName });
          stringPatternIndex++;
        });
      }
      if ("patterns" in match && match.patterns) {
        match.patterns.forEach((patternObj) => {
          this.compiledPatterns.set(matchName, patternObj.pattern);
          regexParts.push(`(${patternObj.pattern})`);
          this.patternIndexToFeature.set(patternIndex, matchName);
          patternIndex++;
        });
      }
      if ("exclude" in match && match.exclude) {
        this.featureExcludes[matchName] = match.exclude;
      }
    });

    this.allStringPatterns.sort((a, b) => b.pattern.length - a.pattern.length);

    if (regexParts.length > 0) {
      try {
        this.combinedRegex = new RegExp(regexParts.join("|"));
      } catch {
        this.combinedRegex = null;
      }
    } else {
      this.combinedRegex = null;
    }

    if (stringRegexParts.length > 0) {
      try {
        this.combinedStringRegex = new RegExp(stringRegexParts.join("|"));
      } catch {
        this.combinedStringRegex = null;
      }
    } else {
      this.combinedStringRegex = null;
    }
  }

  private getPluginRule(matchName: string): string | null {
    if (!this.plugin) return null;
    const match = this.plugin.spec.matches[matchName];
    return match ? match.rule : null;
  }

  private buildDetectionMatch(
    featureName: string,
    matchStr: string,
    index: number,
  ): DetectionMatch | null {
    if (!this.plugin) {
      return {
        name: featureName,
        match: matchStr,
        spec: "legacy",
        rule: featureName,
        index,
      };
    }

    const rule = this.getPluginRule(featureName);
    if (!rule) return null;

    return {
      name: featureName,
      match: matchStr,
      spec: this.plugin.name,
      rule,
      index,
    };
  }

  detectBoolean(code: string, options: DetectFastOptions = {}): boolean {
    this.assertInitialized();
    this.validateInput(code);

    const shouldSkipPreprocess = options.skipPreprocess === true;
    const processedCode = shouldSkipPreprocess ? code : this.preprocess(code);

    const hasStringMatch = this.checkStrings(processedCode);
    if (hasStringMatch) return true;

    const shouldCheckPatterns = this.shouldRunPatternDetection(processedCode);
    if (shouldCheckPatterns) {
      return this.checkPatterns(processedCode);
    }

    return false;
  }

  detectFast(code: string, options: DetectFastOptions = {}): DetectionResult {
    this.assertInitialized();
    this.validateInput(code);

    const shouldSkipPreprocess = options.skipPreprocess === true;
    const processedCode = shouldSkipPreprocess ? code : this.preprocess(code);

    const stringMatch = this.findFirstStringMatch(processedCode);
    if (stringMatch) {
      return {
        hasMatch: true,
        mode: "fast",
        firstMatch: stringMatch,
      };
    }

    const shouldCheckPatterns = this.shouldRunPatternDetection(processedCode);
    if (shouldCheckPatterns) {
      const patternMatch = this.findFirstPatternMatch(processedCode);
      if (patternMatch) {
        return {
          hasMatch: true,
          mode: "fast",
          firstMatch: patternMatch,
        };
      }
    }

    return {
      hasMatch: false,
      mode: "fast",
    };
  }

  detectDetailed(code: string, options: DetectFastOptions = {}): DetectionResult {
    this.assertInitialized();
    this.validateInput(code);

    const shouldSkipPreprocess = options.skipPreprocess === true;
    const processedCode = shouldSkipPreprocess ? code : this.preprocess(code);

    const stringMatch = this.findFirstStringMatch(processedCode);
    if (stringMatch) {
      return {
        hasMatch: true,
        mode: "detailed",
        firstMatch: stringMatch,
      };
    }

    const shouldCheckPatterns = this.shouldRunPatternDetection(processedCode);
    if (shouldCheckPatterns) {
      const patternMatch = this.findFirstPatternMatch(processedCode);
      if (patternMatch) {
        return {
          hasMatch: true,
          mode: "detailed",
          firstMatch: patternMatch,
        };
      }
    }

    return {
      hasMatch: false,
      mode: "detailed",
    };
  }

  detect(
    code: string,
    mode: DetectionMode = "fast",
    options: DetectFastOptions = {},
  ): DetectionResult {
    switch (mode) {
      case "boolean":
        const hasMatch = this.detectBoolean(code, options);
        return { hasMatch, mode: "boolean" };
      case "fast":
        return this.detectFast(code, options);
      case "detailed":
        return this.detectDetailed(code, options);
    }
  }

  detectFile(
    filePath: string,
    mode: DetectionMode = "fast",
    options: { maxFileSize?: number } = {},
  ): DetectionResult {
    this.assertInitialized();

    const maxSize = options.maxFileSize ?? MAX_FILE_SIZE;

    try {
      const stats = statSync(filePath);
      const fileTooLarge = stats.size > maxSize;
      if (fileTooLarge) {
        return {
          hasMatch: false,
          mode,
          error: `File size ${stats.size} bytes exceeds limit of ${maxSize} bytes`,
        };
      }

      const code = readFileSync(filePath, "utf-8");
      return this.detect(code, mode);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { hasMatch: false, mode, error: errorMessage };
    }
  }

  preprocess(
    code: string,
    preprocessors: Preprocessor[] = DEFAULT_PREPROCESSORS,
  ): string {
    return preprocessors.reduce((acc, fn) => fn(acc), code);
  }

  detectAll(
    code: string,
    options: { preprocess?: boolean } = {},
  ): DetectionMatch[] {
    this.assertInitialized();
    this.validateInput(code);

    const shouldPreprocess = options.preprocess !== false;
    const processedCode = shouldPreprocess ? this.preprocess(code) : code;

    const stringMatches = this.findAllStringMatches(processedCode);
    const patternMatches = this.findAllPatternMatches(processedCode);

    const seen = new Set<string>();

    return [...stringMatches, ...patternMatches]
      .filter((match) => {
        const key = `${match.name}:${match.index}`;
        const isDuplicate = seen.has(key);
        if (!isDuplicate) seen.add(key);
        return !isDuplicate;
      })
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }

  private findAllStringMatches(code: string): DetectionMatch[] {
    const indicesWithMeta = this.allStringPatterns.flatMap(
      ({ pattern, featureName }) =>
        this.findAllValidIndices(code, pattern, featureName).map((index) => ({
          featureName,
          pattern,
          index,
        })),
    );

    return indicesWithMeta
      .map(({ featureName, pattern, index }) =>
        this.buildDetectionMatch(featureName, pattern, index),
      )
      .filter((match): match is DetectionMatch => match !== null);
  }

  private findAllPatternMatches(code: string): DetectionMatch[] {
    const entries = Array.from(this.compiledPatterns.entries());

    const regexMatches = entries.flatMap(([featureName, patternStr]) => {
      const regex = getCachedRegex(patternStr, "g");
      return Array.from(code.matchAll(regex)).map((match) => ({
        featureName,
        matchText: match[0],
        index: match.index ?? 0,
      }));
    });

    return regexMatches
      .map(({ featureName, matchText, index }) =>
        this.buildDetectionMatch(featureName, matchText, index),
      )
      .filter((match): match is DetectionMatch => match !== null);
  }

  private findAllValidIndices(
    code: string,
    pattern: string,
    featureName: string,
  ): number[] {
    const indices: number[] = [];
    const excludes = this.featureExcludes[featureName] || [];
    let fromIndex = 0;

    while (true) {
      const index = code.indexOf(pattern, fromIndex);
      const notFound = index === -1;
      if (notFound) break;

      const candidateMatch = this.buildDetectionMatch(
        featureName,
        pattern,
        index,
      );
      if (candidateMatch) {
        const isValid = runBrakePipeline(
          this.brakeStages,
          candidateMatch,
          code,
          excludes,
        );
        if (isValid) {
          indices.push(index);
        }
      }
      fromIndex = index + 1;
    }

    return indices;
  }

  private checkStrings(code: string): boolean {
    if (!this.combinedStringRegex) return false;
    return this.combinedStringRegex.test(code);
  }

  private checkPatterns(code: string): boolean {
    const patterns = Array.from(this.compiledPatterns.values());
    return patterns.some((patternStr) => {
      const pattern = getCachedRegex(patternStr);
      return pattern.test(code);
    });
  }

  private findFirstStringMatch(code: string): DetectionMatch | null {
    if (!this.combinedStringRegex) return null;

    const regex = new RegExp(this.combinedStringRegex.source, "g");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(code)) !== null) {
      const groupIndex = match.slice(1).findIndex((g) => g !== undefined);
      const noGroupFound = groupIndex === -1;
      if (noGroupFound) continue;

      const patternInfo = this.stringPatternIndexToFeature.get(groupIndex);
      if (!patternInfo) continue;

      const { pattern, featureName } = patternInfo;

      const candidateMatch = this.buildDetectionMatch(
        featureName,
        pattern,
        match.index,
      );
      if (!candidateMatch) continue;

      const excludes = this.featureExcludes[featureName] || [];
      const isValid = runBrakePipeline(
        this.brakeStages,
        candidateMatch,
        code,
        excludes,
      );
      if (!isValid) continue;

      return candidateMatch;
    }

    return null;
  }

  private findFirstPatternMatch(code: string): DetectionMatch | null {
    if (!this.combinedRegex) return null;

    const regex = new RegExp(this.combinedRegex.source, "g");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(code)) !== null) {
      const groupIndex = match.slice(1).findIndex((g) => g !== undefined);
      const noGroupFound = groupIndex === -1;
      if (noGroupFound) continue;

      const featureName = this.patternIndexToFeature.get(groupIndex);
      if (!featureName) continue;

      const candidateMatch = this.buildDetectionMatch(
        featureName,
        match[0],
        match.index,
      );
      if (!candidateMatch) continue;

      const excludes = this.featureExcludes[featureName] || [];
      const isValid = runBrakePipeline(
        this.brakeStages,
        candidateMatch,
        code,
        excludes,
      );
      if (!isValid) continue;

      return candidateMatch;
    }

    return null;
  }

  private shouldRunPatternDetection(code: string): boolean {
    return this.hasComplexityIndicators(code) || code.length >= TINY_FILE_SIZE;
  }

  private hasComplexityIndicators(code: string): boolean {
    return COMPLEXITY_INDICATORS.some(
      (indicator) => code.indexOf(indicator) !== -1,
    );
  }

  check(code: string, options: DetectionOptions): boolean {
    this.assertInitialized();
    this.validateInput(code);

    const preprocessors = options.preprocessors || [safePreprocessor];
    const processedCode = preprocessors.reduce((acc, fn) => fn(acc), code);

    const orderedRules = options.orderedRules;
    if (!orderedRules || !this.plugin) {
      const result = this.detectFastInternal(processedCode);
      return !result.hasMatch;
    }

    const targetIndex = orderedRules.indexOf(options.target);
    if (targetIndex === -1) {
      return false;
    }

    const originalPlugin = this.plugin;
    const matches = this.plugin.spec.matches;
    const filteredMatches = Object.entries(matches).reduce(
      (acc, [matchName, match]) => {
        const ruleIndex = orderedRules.indexOf(match.rule);
        const shouldInclude = ruleIndex > targetIndex;
        return shouldInclude ? { ...acc, [matchName]: match } : acc;
      },
      {},
    );

    const filteredPlugin = {
      ...this.plugin,
      spec: {
        ...this.plugin.spec,
        matches: filteredMatches,
      },
    };

    try {
      this.plugin = filteredPlugin;
      this.applyPlugin(filteredPlugin);
      const result = this.detectFastInternal(processedCode);
      return !result.hasMatch;
    } finally {
      this.plugin = originalPlugin;
      this.applyPlugin(originalPlugin);
    }
  }

  private detectFastInternal(code: string): DetectionResult {
    const stringMatch = this.findFirstStringMatch(code);
    if (stringMatch) {
      return {
        hasMatch: true,
        mode: "fast",
        firstMatch: stringMatch,
      };
    }

    const shouldCheckPatterns = this.shouldRunPatternDetection(code);
    if (!shouldCheckPatterns) {
      return {
        hasMatch: false,
        mode: "fast",
      };
    }

    const patternMatch = this.findFirstPatternMatch(code);
    if (patternMatch) {
      return {
        hasMatch: true,
        mode: "fast",
        firstMatch: patternMatch,
      };
    }

    return {
      hasMatch: false,
      mode: "fast",
    };
  }
}
