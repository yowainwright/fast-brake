import { Detector } from "./detector";
import type {
  DetectedFeature,
  DetectionOptions,
  FastBrakeOptions,
  FastBrakeSyncAPI,
} from "./types";

export function fastBrakeSync(
  options: FastBrakeOptions = {},
): FastBrakeSyncAPI {
  const detector = new Detector();

  if (options.plugins && options.plugins.length > 0) {
    const plugin = options.plugins[0];
    detector["plugin"] = plugin;
    detector["loadPlugin"](plugin);
    detector["initialized"] = true;
  }

  const extensions = options.extensions || [];

  return {
    detect: (code: string) => {
      const result = detector.detectFast(code);
      if (!result.hasMatch || !result.firstMatch) {
        return [];
      }

      let detectedFeature: DetectedFeature = {
        name: result.firstMatch.name,
        version: result.firstMatch.rule,
      };

      for (const extension of extensions) {
        const extResult = extension.process({
          code,
          result: {
            name: result.firstMatch.name,
            match: result.firstMatch.match,
            spec: {},
            rule: result.firstMatch.rule,
            index: result.firstMatch.index,
          },
        });
        if (extResult.spec) {
          Object.assign(detectedFeature, extResult.spec);
        }
      }

      return [detectedFeature];
    },
    check: (code: string, checkOptions: DetectionOptions) => {
      try {
        const opts = { ...checkOptions };
        if (detector["plugin"]?.spec?.orderedRules) {
          opts.orderedRules = detector["plugin"].spec.orderedRules;
        }
        return detector.check(code, opts);
      } catch {
        return false;
      }
    },
  };
}
