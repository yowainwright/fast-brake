import { Plugin } from "../types";
import {
  POST_ES2015_PATTERNS,
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "./constants";

/**
 * ES2015 (ES6) baseline plugin
 * Checks for features that require versions NEWER than ES2015
 *
 * ES2015 is the modern baseline - it includes:
 * - Arrow functions, classes, let/const, template literals
 * - Promises, destructuring, spread/rest, for...of
 * - Symbols, Map/Set, generators
 *
 * This plugin detects features from ES2016 and later
 */

export const es2015Plugin: Plugin = {
  name: "es2015-baseline",
  patterns: POST_ES2015_PATTERNS,
};

export const es2015StrictPlugin: Plugin = {
  name: "es2015-strict",
  patterns: POST_ES2015_PATTERNS.map((p) => ({
    ...p,
    severity: "error" as const,
  })),
};

// ES5 plugin - detects ANY ES2015+ features
export const es5Plugin: Plugin = {
  name: "es5",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `Feature "${name}" requires ${FEATURE_VERSIONS[name]} but target is es5`,
    severity: "error" as const,
  })),
  validate: (_context, matches) => {
    // ES5 doesn't support any modern features
    return matches.filter((match) => {
      const featureVersion = FEATURE_VERSIONS[match.name];
      // Filter anything that's not ES5
      return featureVersion !== "es5";
    });
  },
};

// ES2015 version plugin - detects features newer than ES2015
export const es2015VersionPlugin: Plugin = {
  name: "es-version-es2015",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `Feature "${name}" requires ${FEATURE_VERSIONS[name]} but target is es2015`,
    severity: "error" as const,
  })),
  validate: (_context, matches) => {
    const targetIndex = VERSION_ORDER.indexOf("es2015");

    return matches.filter((match) => {
      const featureVersion = FEATURE_VERSIONS[match.name];
      const featureIndex = VERSION_ORDER.indexOf(featureVersion);
      return featureIndex > targetIndex;
    });
  },
};

// Aliases
export const es6Plugin = es2015VersionPlugin;
export const es6 = es2015VersionPlugin;
export const es5 = es5Plugin;
export const es2015 = es2015VersionPlugin;

export { POST_ES2015_PATTERNS } from "./constants";
