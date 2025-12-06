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

  const plugins = options.plugins ?? [];
  const hasPlugins = plugins.length > 0;
  if (!hasPlugins) {
    throw new Error("fastBrakeSync requires at least one plugin. Pass plugins in options.");
  }

  detector.initializeSync(plugins[0]);

  const extensions = options.extensions || [];

  const applyExtensions = (
    code: string,
    firstMatch: NonNullable<ReturnType<typeof detector.detectFast>["firstMatch"]>,
  ): DetectedFeature => {
    const baseFeature: DetectedFeature = {
      name: firstMatch.name,
      version: firstMatch.rule,
    };

    return extensions.reduce((feature, extension) => {
      const extResult = extension.process({
        code,
        result: {
          name: firstMatch.name,
          match: firstMatch.match,
          spec: {},
          rule: firstMatch.rule,
          index: firstMatch.index,
        },
      });

      return extResult.spec ? { ...feature, ...extResult.spec } : feature;
    }, baseFeature);
  };

  return {
    detect: (code: string) => {
      const result = detector.detectFast(code);
      if (!result.hasMatch || !result.firstMatch) {
        return [];
      }

      return [applyExtensions(code, result.firstMatch)];
    },
    check: (code: string, checkOptions: DetectionOptions) => {
      try {
        const plugin = detector.getPlugin();
        const orderedRules = plugin?.spec?.orderedRules;
        const opts = orderedRules
          ? { ...checkOptions, orderedRules }
          : checkOptions;

        return detector.check(code, opts);
      } catch {
        return false;
      }
    },
  };
}
