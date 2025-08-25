import { Plugin } from "../types";
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";

export const es2016Plugin: Plugin = {
  name: "es-version-es2016",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `Feature "${name}" requires ${FEATURE_VERSIONS[name]} but target is es2016`,
    severity: "error" as const,
  })),
  validate: (_context, matches) => {
    const targetIndex = VERSION_ORDER.indexOf("es2016");

    return matches.filter((match) => {
      const featureVersion = FEATURE_VERSIONS[match.name];
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      return featureIndex > targetIndex;
    });
  },
};

export const es7Plugin = es2016Plugin;
export const es7 = es2016Plugin;
export const es2016 = es2016Plugin;
