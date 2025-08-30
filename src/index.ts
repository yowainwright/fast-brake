import {
  getDetector,
  detect as detectFeatures,
  check as checkFeatures,
  getMinimumVersion,
} from "./detector";
import { VERSION_ORDER, PARSER_MAPPINGS } from "./constants";
import type { DetectionOptions, DetectedFeature } from "./detector";

export class FeatureError extends Error {
  feature: DetectedFeature;
  target: string;

  constructor(feature: DetectedFeature, target: string) {
    super(
      `ES feature "${feature.name}" requires ${feature.version} but target is ${target}` +
        (feature.line ? ` at line ${feature.line}:${feature.column}` : "") +
        (feature.snippet ? `\n  ${feature.snippet}` : ""),
    );
    this.feature = feature;
    this.target = target;
    this.name = "FeatureError";
  }
}

export function fastBrake(code: string, options: DetectionOptions): void {
  const detector = getDetector();
  const detected = detector.detect(code, options);
  const targetIndex = getVersionIndex(options.target);

  for (const feature of detected) {
    const featureIndex = getVersionIndex(feature.version);
    if (featureIndex > targetIndex) {
      throw new FeatureError(feature, options.target);
    }
  }
}

export function detect(
  code: string,
  options?: Partial<DetectionOptions>,
): DetectedFeature[] {
  const opts: DetectionOptions = {
    target: options?.target || "esnext",
    throwOnFirst: options?.throwOnFirst,
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

export function getMinimumESVersion(code: string): string {
  return getMinimumVersion(code);
}

function getVersionIndex(version: string): number {
  return VERSION_ORDER.indexOf(version);
}

export type { DetectionOptions, DetectedFeature } from "./detector";
export type { BrowserVersions, Feature, SchemaJson } from "./types";

export {
  ES_VERSIONS,
  MDN_URLS,
  FEATURE_PATTERNS,
  PARSER_MAPPINGS,
  VERSION_ORDER,
} from "./constants";

export function getParserMapping(
  feature: string,
  parser: string,
): string | string[] | undefined {
  return PARSER_MAPPINGS[parser]?.[feature];
}

export function toAcornNode(feature: string): string | string[] | undefined {
  return PARSER_MAPPINGS.ACORN?.[feature];
}

export function toEsCheckFeature(
  feature: string,
): string | string[] | undefined {
  return PARSER_MAPPINGS.ES_CHECK?.[feature];
}

export default fastBrake;
