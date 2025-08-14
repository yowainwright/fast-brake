// Constants for ES feature detection

export const ES_VERSIONS = {
  es5: { chrome: 5, firefox: 4, safari: 5 },
  es2015: { chrome: 51, firefox: 54, safari: 10 },
  es2016: { chrome: 52, firefox: 55, safari: 10.1 },
  es2017: { chrome: 58, firefox: 53, safari: 11 },
  es2018: { chrome: 64, firefox: 58, safari: 12 },
  es2019: { chrome: 73, firefox: 62, safari: 12.1 },
  es2020: { chrome: 80, firefox: 74, safari: 13.1 },
  es2021: { chrome: 85, firefox: 79, safari: 14.1 },
  es2022: { chrome: 94, firefox: 93, safari: 15.4 }
};

export const VERSION_ORDER = [
  'es5', 'es2015', 'es2016', 'es2017', 'es2018', 
  'es2019', 'es2020', 'es2021', 'es2022', 'esnext'
];

export const MDN_URLS = [
  'https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins.json',
  'https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/statements.json',
  'https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/expressions.json',
  'https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/operators.json',
  'https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/grammar.json'
];

export const FEATURE_PATTERNS: Record<string, RegExp> = {
  'arrow_functions': /=>/,
  'template_literals': /`/,
  'async_function': /\basync\s+function/,
  'async_arrow_function': /\basync\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/,
  'await': /\bawait\s/,
  'class': /\bclass\s+[a-zA-Z_$]/,
  'const': /\bconst\s+[a-zA-Z_$]/,
  'let': /\blet\s+[a-zA-Z_$]/,
  'spread_syntax': /\.\.\./,
  'rest_parameters': /\.\.\.[a-zA-Z_$]/,
  'for_of': /\bfor\s*\([^)]*\bof\b/,
  'for_await_of': /\bfor\s+await\s*\([^)]*\bof\b/,
  'destructuring': /(?:const|let|var)\s*[[{]/,
  'optional_chaining': /\?\./,
  'nullish_coalescing': /\?\?/,
  'bigint': /\b\d+n\b/,
  'numeric_separators': /\b\d[\d_]+\d\b/,
  'private_fields': /#[a-zA-Z_$]/,
  'static_fields': /\bstatic\s+[a-zA-Z_$]/,
  'logical_assignment': /(?:\|\|=|&&=|\?\?=)/,
  'promise': /\bnew\s+Promise\b/,
  'generator': /function\s*\*/,
  'yield': /\byield\s/,
  'symbol': /Symbol\s*\(/,
  'proxy': /\bnew\s+Proxy\b/,
  'reflect': /Reflect\./,
  'map': /\bnew\s+Map\b/,
  'set': /\bnew\s+Set\b/,
  'weakmap': /\bnew\s+WeakMap\b/,
  'weakset': /\bnew\s+WeakSet\b/,
  'array_includes': /\.includes\s*\(/,
  'array_flat': /\.flat\s*\(/,
  'array_flatMap': /\.flatMap\s*\(/,
  'object_entries': /Object\.entries\s*\(/,
  'object_values': /Object\.values\s*\(/,
  'object_fromEntries': /Object\.fromEntries\s*\(/,
  'string_padStart': /\.padStart\s*\(/,
  'string_padEnd': /\.padEnd\s*\(/,
  'string_trimStart': /\.trimStart\s*\(/,
  'string_trimEnd': /\.trimEnd\s*\(/,
  'string_matchAll': /\.matchAll\s*\(/,
  'string_replaceAll': /\.replaceAll\s*\(/,
  'promise_finally': /\.finally\s*\(/,
  'promise_allSettled': /Promise\.allSettled\s*\(/,
  'promise_any': /Promise\.any\s*\(/,
  'import': /\bimport\s/,
  'export': /\bexport\s/,
  'import_meta': /\bimport\.meta\b/,
  'dynamic_import': /\bimport\s*\(/,
  'globalThis': /\bglobalThis\b/,
  'array_at': /\.at\s*\(/,
  'string_at': /\.at\s*\(/,
  'object_hasOwn': /Object\.hasOwn\s*\(/,
  'class_private_methods': /#[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/,
  'class_static_blocks': /\bstatic\s*\{/,
  'top_level_await': /^[^{]*\bawait\s/m
};

// Quick detection patterns compiled at startup
export const QUICK_PATTERNS: Record<string, RegExp> = {
  // ES2015 (ES6)
  arrow_functions: /=>/,
  template_literals: /`/,
  classes: /\bclass\s+[a-zA-Z_$]/,
  let_const: /\b(?:let|const)\s+/,
  spread_rest: /\.\.\./,
  for_of: /\bfor\s*\([^)]*\bof\b/,
  destructuring: /(?:const|let|var)\s*[[{]/,
  default_params: /function[^(]*\([^)]*=[^)]*\)/,
  
  // ES2016
  exponentiation: /\*\*/,
  
  // ES2017
  async_await: /\b(?:async\s+function|async\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>|await\s)/,
  
  // ES2018
  async_iteration: /\bfor\s+await\s*\(/,
  rest_spread_properties: /\{[^}]*\.\.\.[^.]/,  // Object rest/spread only
  
  // ES2019
  array_flat: /\.(?:flat|flatMap)\s*\(/,
  
  // ES2020
  optional_chaining: /\?\./,
  nullish_coalescing: /\?\?/,
  bigint: /\b\d+n\b/,
  promise_allSettled: /Promise\.allSettled\s*\(/,
  globalThis: /\bglobalThis\b/,
  
  // ES2021
  logical_assignment: /(?:\|\|=|&&=|\?\?=)/,
  numeric_separators: /\b\d+_\d+/,
  string_replaceAll: /\.replaceAll\s*\(/,
  promise_any: /Promise\.any\s*\(/,
  
  // ES2022
  class_fields: /#[a-zA-Z_$]/,
  private_fields: /#[a-zA-Z_$]/,
  static_blocks: /\bstatic\s*\{/,
  array_at: /\.at\s*\(/,
  object_hasOwn: /Object\.hasOwn\s*\(/,
  top_level_await: /^[^{]*\bawait\s/m
};

// ES version requirements for each feature
export const FEATURE_VERSIONS: Record<string, string> = {
  arrow_functions: 'es2015',
  template_literals: 'es2015',
  classes: 'es2015',
  let_const: 'es2015',
  spread_rest: 'es2015',
  for_of: 'es2015',
  destructuring: 'es2015',
  default_params: 'es2015',
  exponentiation: 'es2016',
  async_await: 'es2017',
  async_iteration: 'es2018',
  rest_spread_properties: 'es2018',
  array_flat: 'es2019',
  optional_chaining: 'es2020',
  nullish_coalescing: 'es2020',
  bigint: 'es2020',
  promise_allSettled: 'es2020',
  globalThis: 'es2020',
  logical_assignment: 'es2021',
  numeric_separators: 'es2021',
  string_replaceAll: 'es2021',
  promise_any: 'es2021',
  class_fields: 'es2022',
  private_fields: 'es2022',
  static_blocks: 'es2022',
  array_at: 'es2022',
  object_hasOwn: 'es2022',
  top_level_await: 'es2022'
};