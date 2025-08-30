import { FEATURE_STRINGS, FEATURE_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";
import type { DetectedFeature, DetectionOptions } from "./types";
export type { DetectedFeature, DetectionOptions } from "./types";

export class Detector {
  private compiledPatterns: Map<string, RegExp>;
  private featureStrings: Record<string, string[]>;

  constructor() {
    this.compiledPatterns = new Map();
    for (const [name, pattern] of Object.entries(FEATURE_PATTERNS)) {
      this.compiledPatterns.set(name, pattern);
    }
    this.featureStrings = FEATURE_STRINGS;
  }

  scan(code: string, options?: Partial<DetectionOptions>): DetectedFeature[] {
    const detected: DetectedFeature[] = [];

    for (const [featureName, patterns] of Object.entries(this.featureStrings)) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;

      const hasFeature = patterns.some(pattern => code.includes(pattern));
      if (hasFeature) {
        const feature: DetectedFeature = {
          name: featureName,
          version: featureVersion,
        };

        detected.push(feature);

        if (options?.throwOnFirst) {
          return detected;
        }
      }
    }

    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;

      pattern.lastIndex = 0;
      if (pattern.test(code)) {
        const feature: DetectedFeature = {
          name: featureName,
          version: featureVersion,
        };

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
    const targetIndex = VERSION_ORDER.indexOf(options.target);

    for (const [featureName, patterns] of Object.entries(this.featureStrings)) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;
      
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      
      if (featureIndex > targetIndex) {
        const hasFeature = patterns.some(pattern => code.includes(pattern));
        if (hasFeature) {
          if (options.throwOnFirst) {
            throw new Error(
              `Feature "${featureName}" requires ${featureVersion} but target is ${options.target}`,
            );
          }
          return false;
        }
      }
    }

    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;
      
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      
      if (featureIndex > targetIndex) {
        pattern.lastIndex = 0;
        if (pattern.test(code)) {
          if (options.throwOnFirst) {
            throw new Error(
              `Feature "${featureName}" requires ${featureVersion} but target is ${options.target}`,
            );
          }
          return false;
        }
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
