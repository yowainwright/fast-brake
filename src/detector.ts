import { readFileSync } from "fs";
import { TINY_FILE_SIZE, COMPLEXITY_INDICATORS } from "./constants";
import { loadPlugin } from "./plugins/loader";
import type {
  DetectionMode,
  DetectionMatch,
  DetectionResult,
  Plugin,
  DetectionOptions,
} from "./types";

export class Detector {
  private compiledPatterns: Map<string, RegExp>;
  private featureStrings: Record<string, string[]>;
  private plugin: Plugin | null = null;
  private initialized = false;

  constructor() {
    this.compiledPatterns = new Map();
    this.featureStrings = {};
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

    for (const [matchName, match] of Object.entries(plugin.spec.matches)) {
      if ("strings" in match && match.strings) {
        this.featureStrings[matchName] = match.strings;
      }
      if ("patterns" in match && match.patterns) {
        for (const patternObj of match.patterns) {
          this.compiledPatterns.set(matchName, new RegExp(patternObj.pattern));
        }
      }
    }
  }

  private getPluginRule(matchName: string): string | null {
    if (!this.plugin) return null;
    const match = this.plugin.spec.matches[matchName];
    return match ? match.rule : null;
  }

  detectBoolean(code: string): boolean {
    const hasStringMatch = this.checkStrings(code);
    if (hasStringMatch) {
      return true;
    }

    const shouldCheckPatterns = this.shouldRunPatternDetection(code);
    if (!shouldCheckPatterns) {
      return false;
    }

    const hasPatternMatch = this.checkPatterns(code);
    return hasPatternMatch;
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
    const stringMatch = this.findFirstStringMatchDetailed(code);
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

    const patternMatch = this.findFirstPatternMatchDetailed(code);
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
    for (const patterns of Object.values(this.featureStrings)) {
      const hasMatch = patterns.some((pattern) => code.includes(pattern));
      if (hasMatch) {
        return true;
      }
    }
    return false;
  }

  private checkPatterns(code: string): boolean {
    for (const pattern of this.compiledPatterns.values()) {
      pattern.lastIndex = 0;
      const matches = pattern.test(code);
      if (matches) {
        return true;
      }
    }
    return false;
  }

  private findFirstStringMatch(code: string): DetectionMatch | null {
    for (const [featureName, patterns] of Object.entries(this.featureStrings)) {
      for (const pattern of patterns) {
        const index = code.indexOf(pattern);
        if (index !== -1) {
          if (this.plugin) {
            const rule = this.getPluginRule(featureName);
            if (!rule) continue;

            return {
              name: featureName,
              match: pattern,
              spec: this.plugin.name,
              rule,
              index,
            };
          } else {
            // Legacy mode - use feature name as both spec and rule
            return {
              name: featureName,
              match: pattern,
              spec: "legacy",
              rule: featureName,
              index,
            };
          }
        }
      }
    }
    return null;
  }

  private findFirstPatternMatch(code: string): DetectionMatch | null {
    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      pattern.lastIndex = 0;
      const match = pattern.exec(code);
      if (match) {
        if (this.plugin) {
          const rule = this.getPluginRule(featureName);
          if (!rule) continue;

          return {
            name: featureName,
            match: match[0],
            spec: this.plugin.name,
            rule,
            index: match.index,
          };
        } else {
          // Legacy mode - use feature name as both spec and rule
          return {
            name: featureName,
            match: match[0],
            spec: "legacy",
            rule: featureName,
            index: match.index,
          };
        }
      }
    }
    return null;
  }

  private findFirstStringMatchDetailed(code: string): DetectionMatch | null {
    for (const [featureName, patterns] of Object.entries(this.featureStrings)) {
      for (const pattern of patterns) {
        const index = code.indexOf(pattern);
        if (index !== -1) {
          if (this.plugin) {
            const rule = this.getPluginRule(featureName);
            if (!rule) continue;

            return {
              name: featureName,
              match: pattern,
              spec: this.plugin.name,
              rule,
              index,
            };
          } else {
            // Legacy mode - use feature name as both spec and rule
            return {
              name: featureName,
              match: pattern,
              spec: "legacy",
              rule: featureName,
              index,
            };
          }
        }
      }
    }
    return null;
  }

  private findFirstPatternMatchDetailed(code: string): DetectionMatch | null {
    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      pattern.lastIndex = 0;
      const match = pattern.exec(code);
      if (match) {
        if (this.plugin) {
          const rule = this.getPluginRule(featureName);
          if (!rule) continue;

          return {
            name: featureName,
            match: match[0],
            spec: this.plugin.name,
            rule,
            index: match.index,
          };
        } else {
          // Legacy mode - use feature name as both spec and rule
          return {
            name: featureName,
            match: match[0],
            spec: "legacy",
            rule: featureName,
            index: match.index,
          };
        }
      }
    }
    return null;
  }

  private shouldRunPatternDetection(code: string): boolean {
    const isTinyFile = code.length < TINY_FILE_SIZE;
    if (isTinyFile) {
      return false;
    }

    const hasComplexity = this.hasComplexityIndicators(code);
    return hasComplexity;
  }

  private hasComplexityIndicators(code: string): boolean {
    return COMPLEXITY_INDICATORS.some((indicator) => code.includes(indicator));
  }

  check(code: string, options: DetectionOptions): boolean {
    const result = this.detectFast(code);
    if (!result.hasMatch) {
      return true;
    }

    const orderedRules = options.orderedRules;
    if (!orderedRules) {
      return !result.hasMatch;
    }

    const targetIndex = orderedRules.indexOf(options.target);
    const matchIndex = orderedRules.indexOf(result.firstMatch!.name);
    const isCompatible = matchIndex <= targetIndex;

    return isCompatible;
  }
}
