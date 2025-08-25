import { Plugin } from "../types";
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";

export const es2019Plugin: Plugin = {
  name: "es-version-es2019",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `Feature "${name}" requires ${FEATURE_VERSIONS[name]} but target is es2019`,
    severity: "error" as const,
  })),
  validate: (_context, matches) => {
    const targetIndex = VERSION_ORDER.indexOf("es2019");

    return matches.filter((match) => {
      const featureVersion = FEATURE_VERSIONS[match.name];
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      return featureIndex > targetIndex;
    });
  },
};

export const es10Plugin = es2019Plugin;
export const es10 = es2019Plugin;
export const es2019 = es2019Plugin;
