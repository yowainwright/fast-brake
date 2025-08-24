import { Plugin, PluginPattern } from "./types";

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

const POST_ES2015_PATTERNS: PluginPattern[] = [
  // ES2016
  {
    name: "exponentiation",
    pattern: /\*\*/,
    message: "Exponentiation operator requires ES2016",
    severity: "warning",
  },

  // ES2017
  {
    name: "async_await",
    pattern:
      /\b(?:async\s+function|async\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>|await\s)/,
    message: "Async/await requires ES2017",
    severity: "warning",
  },

  // ES2018
  {
    name: "async_iteration",
    pattern: /\bfor\s+await\s*\(/,
    message: "Async iteration requires ES2018",
    severity: "warning",
  },
  {
    name: "rest_spread_properties",
    pattern: /\{[^}]*\.\.\.[^.]/,
    message: "Object rest/spread requires ES2018",
    severity: "warning",
  },

  // ES2019
  {
    name: "array_flat",
    pattern: /\.(?:flat|flatMap)\s*\(/,
    message: "Array.flat/flatMap requires ES2019",
    severity: "warning",
  },

  // ES2020
  {
    name: "optional_chaining",
    pattern: /\?\./,
    message: "Optional chaining requires ES2020",
    severity: "warning",
  },
  {
    name: "nullish_coalescing",
    pattern: /\?\?/,
    message: "Nullish coalescing requires ES2020",
    severity: "warning",
  },
  {
    name: "bigint",
    pattern: /\b\d+n\b/,
    message: "BigInt requires ES2020",
    severity: "warning",
  },
  {
    name: "promise_allSettled",
    pattern: /Promise\.allSettled\s*\(/,
    message: "Promise.allSettled requires ES2020",
    severity: "warning",
  },
  {
    name: "globalThis",
    pattern: /\bglobalThis\b/,
    message: "globalThis requires ES2020",
    severity: "warning",
  },

  // ES2021
  {
    name: "logical_assignment",
    pattern: /(?:\|\|=|&&=|\?\?=)/,
    message: "Logical assignment operators require ES2021",
    severity: "warning",
  },
  {
    name: "numeric_separators",
    pattern: /\b\d+_\d+/,
    message: "Numeric separators require ES2021",
    severity: "warning",
  },
  {
    name: "string_replaceAll",
    pattern: /\.replaceAll\s*\(/,
    message: "String.replaceAll requires ES2021",
    severity: "warning",
  },
  {
    name: "promise_any",
    pattern: /Promise\.any\s*\(/,
    message: "Promise.any requires ES2021",
    severity: "warning",
  },

  // ES2022
  {
    name: "class_fields",
    pattern: /#[a-zA-Z_$]/,
    message: "Private class fields require ES2022",
    severity: "warning",
  },
  {
    name: "static_blocks",
    pattern: /\bstatic\s*\{/,
    message: "Static initialization blocks require ES2022",
    severity: "warning",
  },
  {
    name: "array_at",
    pattern: /\.at\s*\(/,
    message: "Array.at requires ES2022",
    severity: "warning",
  },
  {
    name: "object_hasOwn",
    pattern: /Object\.hasOwn\s*\(/,
    message: "Object.hasOwn requires ES2022",
    severity: "warning",
  },
  {
    name: "top_level_await",
    pattern: /^[^{]*\bawait\s/m,
    message: "Top-level await requires ES2022",
    severity: "warning",
  },

  // ES2023
  {
    name: "array_findLast",
    pattern: /\.findLast(?:Index)?\s*\(/,
    message: "Array.findLast/findLastIndex requires ES2023",
    severity: "info",
  },
  {
    name: "array_immutable",
    pattern: /\.(?:toReversed|toSorted|toSpliced|with)\s*\(/,
    message: "Immutable array methods require ES2023",
    severity: "info",
  },
  {
    name: "hashbang",
    pattern: /^#!/,
    message: "Hashbang requires ES2023",
    severity: "info",
  },

  // ES2024
  {
    name: "regexp_v_flag",
    pattern: /\/[^/]*\/[gimsuvy]*v[gimsuvy]*/,
    message: "RegExp v flag requires ES2024",
    severity: "info",
  },
  {
    name: "array_fromAsync",
    pattern: /Array\.fromAsync\s*\(/,
    message: "Array.fromAsync requires ES2024",
    severity: "info",
  },
  {
    name: "promise_withResolvers",
    pattern: /Promise\.withResolvers\s*\(/,
    message: "Promise.withResolvers requires ES2024",
    severity: "info",
  },
  {
    name: "object_groupBy",
    pattern: /(?:Object|Map)\.groupBy\s*\(/,
    message: "Object/Map.groupBy requires ES2024",
    severity: "info",
  },

  // ES2025
  {
    name: "temporal",
    pattern: /Temporal\./,
    message: "Temporal API requires ES2025",
    severity: "info",
  },
  {
    name: "set_methods",
    pattern:
      /\.(?:intersection|union|difference|symmetricDifference|isSubsetOf|isSupersetOf|isDisjointFrom)\s*\(/,
    message: "Set methods require ES2025",
    severity: "info",
  },
];

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
