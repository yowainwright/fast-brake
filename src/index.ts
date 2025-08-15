<<<<<<< Updated upstream
#!/usr/bin/env node
import { program } from "./program";

program;
=======

import { getDetector, detect as detectFeatures, check as checkFeatures, getMinimumVersion } from './detector';
import type { DetectionOptions, DetectedFeature } from './detector';
export function fast-brake(code: string, options: DetectionOptions): void {
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
export function detect(code: string, options?: Partial<DetectionOptions>): DetectedFeature[] {
  const opts: DetectionOptions = {
    target: options?.target || 'esnext',
    quick: options?.quick,
    throwOnFirst: options?.throwOnFirst
  };
  return detectFeatures(code, opts);
}
export function check(code: string, options: DetectionOptions): boolean {
  try {
    return checkFeatures(code, options);
  } catch {
    return false;
  }
}
export function getMinimumESVersion(code: string, options?: { quick?: boolean }): string {
  return getMinimumVersion(code, options);
}
function getVersionIndex(version: string): number {
  const versions = ['es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'esnext'];
  return versions.indexOf(version);
}
export type { DetectionOptions, DetectedFeature } from './detector';
export default fast-brake;
>>>>>>> Stashed changes
