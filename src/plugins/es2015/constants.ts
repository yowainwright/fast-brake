import { PluginPattern } from "../types";

export const QUICK_PATTERNS: Record<string, RegExp> = {
  arrow_functions: /=>/,
  template_literals: /`/,
  classes: /\bclass\s+[a-zA-Z_$]/,
  extends: /\bclass\s+\w+\s+extends\s+/,
  let_const: /\b(?:let|const)\s+/,
  spread_rest: /\.\.\./,
  for_of: /\bfor\s*\([^)]*\bof\b/,
  destructuring: /(?:const|let|var)\s*[[{]/,
  default_params: /function[^(]*\([^)]*=[^)]*\)/,
  generators: /function\s*\*|yield\s+/,
  import: /\bimport\s+(?:\*|\{|[a-zA-Z_$])/,
  export: /\bexport\s+(?:\*|\{|default|class|function|const|let|var)/,

  promise:
    /\b(?:new\s+)?Promise\b|\bPromise\s*\.\s*(?:resolve|reject|all|race)\s*\(/,
  map: /\bnew\s+Map\b/,
  set: /\bnew\s+Set\b/,
  weakmap: /\bnew\s+WeakMap\b/,
  weakset: /\bnew\s+WeakSet\b/,
  symbol: /\bSymbol\s*\(/,
  proxy: /\bnew\s+Proxy\b/,
  reflect: /\bReflect\s*\./,

  exponentiation: /\*\*/,

  async_await:
    /\b(?:async\s+function|async\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>|await\s)/,

  async_iteration: /\bfor\s+await\s*\(/,
  rest_spread_properties: /\{[^}]*\.\.\.[^.]/,

  array_flat: /\.(?:flat|flatMap)\s*\(/,

  optional_chaining: /\?\./,
  nullish_coalescing: /\?\?/,
  bigint: /\b\d+n\b/,
  promise_allSettled: /Promise\.allSettled\s*\(/,
  globalThis: /\bglobalThis\b/,

  logical_assignment: /(?:\|\|=|&&=|\?\?=)/,
  numeric_separators: /\b\d+_\d+/,
  string_replaceAll: /\.replaceAll\s*\(/,
  promise_any: /Promise\.any\s*\(/,

  class_fields: /#[a-zA-Z_$]/,
  private_fields: /#[a-zA-Z_$]/,
  static_blocks: /\bstatic\s*\{/,
  array_at: /\.at\s*\(/,
  object_hasOwn: /Object\.hasOwn\s*\(/,
  top_level_await: /^[^{]*\bawait\s/m,

  array_findLast: /\.findLast\s*\(/,
  array_findLastIndex: /\.findLastIndex\s*\(/,
  array_toReversed: /\.toReversed\s*\(/,
  array_toSorted: /\.toSorted\s*\(/,
  array_toSpliced: /\.toSpliced\s*\(/,
  array_with: /\.with\s*\(/,
  hashbang: /^#!/,

  regexp_v_flag: /\/[^/]*\/[gimsuvy]*v[gimsuvy]*/,
  array_fromAsync: /Array\.fromAsync\s*\(/,
  promise_withResolvers: /Promise\.withResolvers\s*\(/,
  object_groupBy: /Object\.groupBy\s*\(/,
  map_groupBy: /Map\.groupBy\s*\(/,

  temporal: /Temporal\./,
  regexp_duplicate_named_groups: /\(\?<([^>]+)>.*\(\?<\1>/,
  set_methods:
    /\.(?:intersection|union|difference|symmetricDifference|isSubsetOf|isSupersetOf|isDisjointFrom)\s*\(/,
};

export const FEATURE_VERSIONS: Record<string, string> = {
  arrow_functions: "es2015",
  template_literals: "es2015",
  classes: "es2015",
  extends: "es2015",
  let_const: "es2015",
  spread_rest: "es2015",
  for_of: "es2015",
  destructuring: "es2015",
  default_params: "es2015",
  generators: "es2015",
  import: "es2015",
  export: "es2015",
  promise: "es2015",
  map: "es2015",
  set: "es2015",
  weakmap: "es2015",
  weakset: "es2015",
  symbol: "es2015",
  proxy: "es2015",
  reflect: "es2015",
  exponentiation: "es2016",
  async_await: "es2017",
  async_iteration: "es2018",
  rest_spread_properties: "es2018",
  array_flat: "es2019",
  optional_chaining: "es2020",
  nullish_coalescing: "es2020",
  bigint: "es2020",
  promise_allSettled: "es2020",
  globalThis: "es2020",
  logical_assignment: "es2021",
  numeric_separators: "es2021",
  string_replaceAll: "es2021",
  promise_any: "es2021",
  class_fields: "es2022",
  private_fields: "es2022",
  static_blocks: "es2022",
  array_at: "es2022",
  object_hasOwn: "es2022",
  top_level_await: "es2022",

  array_findLast: "es2023",
  array_findLastIndex: "es2023",
  array_toReversed: "es2023",
  array_toSorted: "es2023",
  array_toSpliced: "es2023",
  array_with: "es2023",
  hashbang: "es2023",

  regexp_v_flag: "es2024",
  array_fromAsync: "es2024",
  promise_withResolvers: "es2024",
  object_groupBy: "es2024",
  map_groupBy: "es2024",

  temporal: "es2025",
  regexp_duplicate_named_groups: "es2025",
  set_methods: "es2025",
};

export const VERSION_ORDER = [
  "es5",
  "es2015",
  "es2016",
  "es2017",
  "es2018",
  "es2019",
  "es2020",
  "es2021",
  "es2022",
  "es2023",
  "es2024",
  "es2025",
  "esnext",
];

/**
 * ES2015 (ES6) baseline plugin patterns
 * Checks for features that require versions NEWER than ES2015
 */
export const POST_ES2015_PATTERNS: PluginPattern[] = [
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
