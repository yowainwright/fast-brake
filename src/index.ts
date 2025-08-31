import { Detector } from "./detector";
import type { DetectionOptions, DetectedFeature } from "./types";

const detector = new Detector();

export function fastBrake(code: string): DetectedFeature[] {
  const result = detector.detectFast(code);
  if (!result.hasMatch || !result.firstMatch) {
    return [];
  }

  // Use the rule as the version for the esversion plugin
  return [{ name: result.firstMatch.name, version: result.firstMatch.rule }];
}

export function detect(code: string): DetectedFeature[] {
  const result = detector.detectFast(code);
  if (result.firstMatch) {
    // Use the rule as the version for the esversion plugin
    return [{ name: result.firstMatch.name, version: result.firstMatch.rule }];
  }
  return [];
}

export function check(code: string, options: DetectionOptions): boolean {
  try {
    return detector.check(code, options);
  } catch {
    return false;
  }
}

export type { DetectionOptions, DetectedFeature } from "./types";
export type { BrowserVersions, Feature, SchemaJson } from "./types";

export { Detector } from "./detector";
export { Scanner } from "./scanner";
export { FastBrakeCache } from "./cache";

export default fastBrake;
