import { Plugin } from "../types";
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";

export const es2025Plugin: Plugin = {
  name: "es-version-es2025",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `Feature "${name}" requires ${FEATURE_VERSIONS[name]} but target is es2025`,
    severity: "error" as const,
  })),
  validate: (_context, matches) => {
    const targetIndex = VERSION_ORDER.indexOf("es2025");

    return matches.filter((match) => {
      const featureVersion = FEATURE_VERSIONS[match.name];
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      return featureIndex > targetIndex;
    });
  },
};

export const es16Plugin = es2025Plugin;
export const es16 = es2025Plugin;
export const es2025 = es2025Plugin;
