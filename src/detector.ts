import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";
import type { DetectedFeature, DetectionOptions } from "./types";
export type { DetectedFeature, DetectionOptions } from "./types";

export class Detector {
  private compiledPatterns: Map<string, RegExp>;

  constructor() {
    this.compiledPatterns = new Map();
    for (const [name, pattern] of Object.entries(QUICK_PATTERNS)) {
      this.compiledPatterns.set(name, pattern);
    }
  }

  scan(code: string, options?: Partial<DetectionOptions>): DetectedFeature[] {
    const detected: DetectedFeature[] = [];
    const includeLoc = options?.includeLoc ?? false;

    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      const featureVersion = FEATURE_VERSIONS[featureName];

      pattern.lastIndex = 0;
      const match = pattern.exec(code);
      if (match) {
        const upToMatch = code.substring(0, match.index);
        const lineNum = (upToMatch.match(/\n/g) || []).length + 1;
        const lastNewline = upToMatch.lastIndexOf("\n");
        const column = match.index - lastNewline;

        const lineStart = lastNewline + 1;
        const lineEnd = code.indexOf("\n", match.index);
        const endPos = lineEnd === -1 ? code.length : lineEnd;
        const maxSnippetEnd = Math.min(lineStart + 50, endPos);
        const rawSnippet = code.substring(lineStart, maxSnippetEnd);
        const cleanSnippet = rawSnippet.replace(/\n/g, " ");
        const snippet = cleanSnippet.trim();

        const feature: DetectedFeature = {
          name: featureName,
          version: featureVersion,
          line: lineNum,
          column: column,
          snippet: snippet,
        };

        if (includeLoc) {
          const matchEnd = match.index + match[0].length;
          const upToEnd = code.substring(0, matchEnd);
          const endLineNum = (upToEnd.match(/\n/g) || []).length + 1;
          const lastNewlineBeforeEnd = upToEnd.lastIndexOf("\n");
          const endColumn = matchEnd - lastNewlineBeforeEnd;

          feature.loc = {
            start: {
              line: lineNum,
              column: column,
            },
            end: {
              line: endLineNum,
              column: endColumn,
            },
            offset: match.index,
            length: match[0].length,
          };
        }

        detected.push(feature);

        if (options?.throwOnFirst) {
          return detected;
        }
      }
    }

    return detected;
  }

  detect(code: string, options: DetectionOptions): DetectedFeature[] {
    return this.scan(code, options);
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
              (feature.line ? ` at line ${feature.line}` : ""),
          );
        }
        return false;
      }
    }

    return true;
  }

  getMinimumVersion(code: string): string {
    const detected = this.detect(code, {
      target: "esnext",
    });

    if (detected.length === 0) {
      return "es2015";
    }

    let minVersion = "es2015";
    let minIndex = VERSION_ORDER.indexOf("es2015");

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

export function detect(
  code: string,
  options: DetectionOptions,
): DetectedFeature[] {
  return getDetector().detect(code, options);
}

export function check(code: string, options: DetectionOptions): boolean {
  return getDetector().check(code, options);
}

export function getMinimumVersion(code: string): string {
  return getDetector().getMinimumVersion(code);
}
