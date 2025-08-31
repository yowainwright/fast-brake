import { VERSION_ORDER } from "../../constants";
import type {
  DetectedFeature,
  DetectionResult,
  DetectionMatch,
} from "../../types";

export class FeatureError extends Error {
  feature: DetectionMatch;
  target: string;

  constructor(feature: DetectionMatch, target: string) {
    super(
      `ES feature "${feature.name}" requires ${feature.version} but target is ${target}`,
    );
    this.feature = feature;
    this.target = target;
    this.name = "FeatureError";
  }
}

/**
 * Throws an error if the detected feature is incompatible with the target ES version
 *
 * @example
 * import { Detector } from 'fast-brake';
 * import { throwIfIncompatible } from 'fast-brake/extensions/throw-error';
 *
 * const detector = new Detector();
 * const result = detector.detect('const x = () => {}');
 *
 * // Throws FeatureError if arrow functions aren't supported in ES5
 * throwIfIncompatible(result, 'es5');
 */
export function throwIfIncompatible(
  result: DetectionResult,
  target: string,
): void {
  if (!result.hasMatch || !result.firstMatch) {
    return;
  }

  const targetIndex = VERSION_ORDER.indexOf(target);
  const featureIndex = VERSION_ORDER.indexOf(result.firstMatch.version);
  const isCompatible = featureIndex <= targetIndex;

  if (!isCompatible) {
    throw new FeatureError(result.firstMatch, target);
  }
}
