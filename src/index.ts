import { Detector } from "./detector";
import type {
  DetectionOptions,
  DetectedFeature,
  FastBrakeOptions,
  FastBrakeAPI,
} from "./types";

const detector = new Detector();
let detectorInitialized = false;

async function ensureInitialized(): Promise<void> {
  if (!detectorInitialized) {
    await detector.initialize();
    detectorInitialized = true;
  }
}

export function fastBrake(options: FastBrakeOptions): Promise<FastBrakeAPI>;
export function fastBrake(code: string): Promise<DetectedFeature[]>;

export async function fastBrake(
  codeOrOptions: string | FastBrakeOptions,
): Promise<DetectedFeature[] | FastBrakeAPI> {
  if (typeof codeOrOptions === "string") {
    await ensureInitialized();
    const result = detector.detectFast(codeOrOptions);
    if (!result.hasMatch || !result.firstMatch) {
      return [];
    }
    return [{ name: result.firstMatch.name, version: result.firstMatch.rule }];
  }

  const options = codeOrOptions;
  const instanceDetector = new Detector();

  if (options.plugins && options.plugins.length > 0) {
    await instanceDetector.initialize(options.plugins[0]);
  } else {
    await instanceDetector.initialize();
  }

  return {
    detect: async (code: string) => {
      const result = instanceDetector.detectFast(code);
      if (!result.hasMatch || !result.firstMatch) {
        return [];
      }
      return [
        { name: result.firstMatch.name, version: result.firstMatch.rule },
      ];
    },
    check: async (code: string, checkOptions: DetectionOptions) => {
      try {
        return instanceDetector.check(code, checkOptions);
      } catch {
        return false;
      }
    },
  };
}

export async function detect(code: string): Promise<DetectedFeature[]> {
  await ensureInitialized();
  const result = detector.detectFast(code);
  if (result.firstMatch) {
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

export type {
  DetectionOptions,
  DetectedFeature,
  BrowserVersions,
  Feature,
  SchemaJson,
  FastBrakeOptions,
  FastBrakeAPI,
  FastBrakeSyncAPI,
  Extension,
  ExtensionInput,
  ExtensionOutput,
} from "./types";

export { Detector } from "./detector";
export { Scanner } from "./scanner";
export { FastBrakeCache } from "./cache";

export { fastBrakeSync } from "./sync";

export default fastBrake;
