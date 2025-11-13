import { readFileSync } from "fs";
import { TINY_FILE_SIZE, COMPLEXITY_INDICATORS } from "./constants";
import { loadPlugin } from "./plugins/loader";
import { getCachedRegex } from "./utils";
import { safePreprocessor } from "./plugins/jscomments";
import type {
  DetectionMode,
  DetectionMatch,
  DetectionResult,
  Plugin,
  DetectionOptions,
} from "./types";

export class Detector {
  private compiledPatterns: Map<string, string>;
  private featureStrings: Record<string, string[]>;
  private featureExcludes: Record<string, string[]>;
  private plugin: Plugin | null = null;
  private initialized = false;

  constructor() {
    this.compiledPatterns = new Map();
    this.featureStrings = {};
    this.featureExcludes = {};
  }

  async initialize(plugin?: Plugin): Promise<void> {
    if (this.initialized) return;

    if (plugin) {
      this.plugin = plugin;
    } else {
      this.plugin = await loadPlugin("esversion");
    }

    if (this.plugin) {
      this.loadPlugin(this.plugin);
      this.initialized = true;
    }
  }

  private loadPlugin(plugin: Plugin): void {
    this.compiledPatterns.clear();
    this.featureStrings = {};
    this.featureExcludes = {};

    for (const [matchName, match] of Object.entries(plugin.spec.matches)) {
      if ("strings" in match && match.strings) {
        this.featureStrings[matchName] = match.strings;
      }
      if ("patterns" in match && match.patterns) {
        for (const patternObj of match.patterns) {
          this.compiledPatterns.set(matchName, patternObj.pattern);
        }
      }
      if ("exclude" in match && match.exclude) {
        this.featureExcludes[matchName] = match.exclude;
      }
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

  detectBoolean(code: string): boolean {
    if (this.checkStrings(code)) return true;
    if (!this.shouldRunPatternDetection(code)) return false;
    return this.checkPatterns(code);
  }

  detectFast(code: string): DetectionResult {
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

  detectDetailed(code: string): DetectionResult {
    const stringMatch = this.findFirstStringMatch(code);
    if (stringMatch) {
      return {
        hasMatch: true,
        mode: "detailed",
        firstMatch: stringMatch,
      };
    }

    const shouldCheckPatterns = this.shouldRunPatternDetection(code);
    if (!shouldCheckPatterns) {
      return {
        hasMatch: false,
        mode: "detailed",
      };
    }

    const patternMatch = this.findFirstPatternMatch(code);
    if (patternMatch) {
      return {
        hasMatch: true,
        mode: "detailed",
        firstMatch: patternMatch,
      };
    }

    return {
      hasMatch: false,
      mode: "detailed",
    };
  }

  detect(code: string, mode: DetectionMode = "fast"): DetectionResult {
    switch (mode) {
      case "boolean":
        const hasMatch = this.detectBoolean(code);
        return { hasMatch, mode: "boolean" };
      case "fast":
        return this.detectFast(code);
      case "detailed":
        return this.detectDetailed(code);
    }
  }

  detectFile(filePath: string, mode: DetectionMode = "fast"): DetectionResult {
    try {
      const code = readFileSync(filePath, "utf-8");
      return this.detect(code, mode);
    } catch {
      return { hasMatch: false, mode };
    }
  }

  private checkStrings(code: string): boolean {
    return Object.values(this.featureStrings).some((patterns) =>
      patterns.some((pattern) => code.indexOf(pattern) !== -1),
    );
  }

  private checkPatterns(code: string): boolean {
    const patterns = Array.from(this.compiledPatterns.values());
    return patterns.some((patternStr) => {
      const pattern = getCachedRegex(patternStr);
      return pattern.test(code);
    });
  }

  private isExcluded(
    code: string,
    index: number,
    featureName: string,
  ): boolean {
    const excludes = this.featureExcludes[featureName];
    if (!excludes || excludes.length === 0) return false;

    const contextStart = Math.max(0, index - 20);
    const contextBefore = code.substring(contextStart, index);

    return excludes.some((exclude) => contextBefore.endsWith(exclude));
  }

  private findFirstValidIndex(
    code: string,
    pattern: string,
    featureName: string,
  ): number {
    let pos = 0;
    const indices: number[] = [];

    while ((pos = code.indexOf(pattern, pos)) !== -1) {
      indices.push(pos);
      pos += 1;
    }

    const validIndex = indices.find(
      (idx) => !this.isExcluded(code, idx, featureName),
    );
    return validIndex !== undefined ? validIndex : -1;
  }

  private checkPatternMatch(
    code: string,
    featureName: string,
    pattern: string,
  ): DetectionMatch | null {
    const index = this.findFirstValidIndex(code, pattern, featureName);
    if (index === -1) return null;

    return this.buildDetectionMatch(featureName, pattern, index);
  }

  private findFirstStringMatch(code: string): DetectionMatch | null {
    const allPatterns = Object.entries(this.featureStrings).flatMap(
      ([featureName, patterns]) =>
        patterns.map((pattern) => ({ featureName, pattern })),
    );

    const matches = allPatterns.map(({ featureName, pattern }) =>
      this.checkPatternMatch(code, featureName, pattern),
    );

    return matches.find((match) => match !== null) ?? null;
  }

  private findFirstPatternMatch(code: string): DetectionMatch | null {
    const entries = Array.from(this.compiledPatterns.entries());

    const validMatch = entries
      .map(([featureName, patternStr]) => {
        const pattern = getCachedRegex(patternStr);
        const match = pattern.exec(code);
        if (!match) return null;

        return this.buildDetectionMatch(featureName, match[0], match.index);
      })
      .find((result) => result !== null);

    return validMatch ?? null;
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
    const preprocessors = options.preprocessors || [safePreprocessor];
    const processedCode = preprocessors.reduce((acc, fn) => fn(acc), code);

    const orderedRules = options.orderedRules;
    if (!orderedRules || !this.plugin) {
      const result = this.detectFast(processedCode);
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

    this.plugin = filteredPlugin;
    this.loadPlugin(filteredPlugin);

    const result = this.detectFast(processedCode);

    this.plugin = originalPlugin;
    this.loadPlugin(originalPlugin);

    return !result.hasMatch;
  }
}
