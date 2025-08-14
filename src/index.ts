// Main API for brakefast ES feature detection
import { getDetector, detect as detectFeatures, check as checkFeatures, getMinimumVersion } from './detector';
import type { DetectionOptions, DetectedFeature } from './detector';

// Main function - throws on incompatible features
export function brakefast(code: string, options: DetectionOptions): void {
  const detector = getDetector();
  const detected = detector.detect(code, options);
  const targetIndex = getVersionIndex(options.target);
  
  for (const feature of detected) {
    const featureIndex = getVersionIndex(feature.version);
    if (featureIndex > targetIndex) {
      const error = new Error(
        `ES feature "${feature.name}" requires ${feature.version} but target is ${options.target}` +
        (feature.line ? ` at line ${feature.line}:${feature.column}` : '') +
        (feature.snippet ? `\n  ${feature.snippet}` : '')
      );
      (error as any).feature = feature;
      (error as any).target = options.target;
      throw error;
    }
  }
}

// Detect - returns array of detected features
export function detect(code: string, options?: Partial<DetectionOptions>): DetectedFeature[] {
  const opts: DetectionOptions = {
    target: options?.target || 'esnext',
    quick: options?.quick,
    throwOnFirst: options?.throwOnFirst
  };
  return detectFeatures(code, opts);
}

// Check - returns boolean
export function check(code: string, options: DetectionOptions): boolean {
  try {
    return checkFeatures(code, options);
  } catch {
    return false;
  }
}

// Get minimum ES version required
export function getMinimumESVersion(code: string, options?: { quick?: boolean }): string {
  return getMinimumVersion(code, options);
}

// Helper function
function getVersionIndex(version: string): number {
  const versions = ['es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'esnext'];
  return versions.indexOf(version);
}

// Export types
export type { DetectionOptions, DetectedFeature } from './detector';

// Default export
export default brakefast;
