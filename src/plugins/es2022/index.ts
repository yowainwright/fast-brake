import { Plugin } from "../types";
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from "./constants";

export const es2022Plugin: Plugin = {
  name: "es-version-es2022",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `Feature "${name}" requires ${FEATURE_VERSIONS[name]} but target is es2022`,
    severity: "error" as const,
  })),
  validate: (_context, matches) => {
    const targetIndex = VERSION_ORDER.indexOf("es2022");

    return matches.filter((match) => {
      const featureVersion = FEATURE_VERSIONS[match.name];
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      return featureIndex > targetIndex;
    });
  },
};

export const es13Plugin = es2022Plugin;
export const es13 = es2022Plugin;
export const es2022 = es2022Plugin;
