import { Plugin } from "../types";
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";

export const es2020Plugin: Plugin = {
  name: "es-version-es2020",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `Feature "${name}" requires ${FEATURE_VERSIONS[name]} but target is es2020`,
    severity: "error" as const,
  })),
  validate: (_context, matches) => {
    const targetIndex = VERSION_ORDER.indexOf("es2020");

    return matches.filter((match) => {
      const featureVersion = FEATURE_VERSIONS[match.name];
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      return featureIndex > targetIndex;
    });
  },
};

export const es11Plugin = es2020Plugin;
export const es11 = es2020Plugin;
export const es2020 = es2020Plugin;
