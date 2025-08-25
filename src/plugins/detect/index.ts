import { Plugin } from "../types";
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";

export const detectPlugin: Plugin = {
  name: "es-detect",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `${FEATURE_VERSIONS[name]} feature: ${name}`,
    severity: "info" as const,
  })),
  validate: (_context, matches) => {
    let highestVersion = "es5";
    let highestIndex = 0;

    for (const match of matches) {
      const version = FEATURE_VERSIONS[match.name];
      const index = VERSION_ORDER.indexOf(version);
      if (index > highestIndex) {
        highestIndex = index;
        highestVersion = version;
      }
    }

    if (matches.length > 0) {
      return [
        {
          ...matches[0],
          name: "minimum_version",
          message: `Minimum ES version required: ${highestVersion}`,
          severity: "info",
        },
      ];
    }
    return [];
  },
};

export const esDetect = detectPlugin;
export const detect = detectPlugin;
