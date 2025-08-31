import { Detector } from "./detector";
import type { DetectionOptions, DetectedFeature } from "./types";

const detector = new Detector();
let detectorInitialized = false;

async function ensureInitialized(): Promise<void> {
  if (!detectorInitialized) {
    await detector.initialize();
    detectorInitialized = true;
  }
}

export async function fastBrake(code: string): Promise<DetectedFeature[]> {
  await ensureInitialized();
  const result = detector.detectFast(code);
  if (!result.hasMatch || !result.firstMatch) {
    return [];
  }

  // Use the rule as the version for the esversion plugin
  return [{ name: result.firstMatch.name, version: result.firstMatch.rule }];
}

export async function detect(code: string): Promise<DetectedFeature[]> {
  await ensureInitialized();
  const result = detector.detectFast(code);
  if (result.firstMatch) {
    // Use the rule as the version for the esversion plugin
    return [{ name: result.firstMatch.name, version: result.firstMatch.rule }];
  }
  return [];
}

export async function check(
  code: string,
  options: DetectionOptions,
): Promise<boolean> {
  await ensureInitialized();
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
