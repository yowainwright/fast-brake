export const IS_DEBUGGING = process.env.DEBUG === "true" || false;

export const LOG_PREFIX = "🚀 ⚡ Fast-Brake:";

export const ES_VERSIONS = {
  es5: { chrome: 5, firefox: 4, safari: 5 },
  es2015: { chrome: 51, firefox: 54, safari: 10 },
  es2016: { chrome: 52, firefox: 55, safari: 10.1 },
  es2017: { chrome: 58, firefox: 53, safari: 11 },
  es2018: { chrome: 64, firefox: 58, safari: 12 },
  es2019: { chrome: 73, firefox: 62, safari: 12.1 },
  es2020: { chrome: 80, firefox: 74, safari: 13.1 },
  es2021: { chrome: 85, firefox: 79, safari: 14.1 },
  es2022: { chrome: 94, firefox: 93, safari: 15.4 },
  es2023: { chrome: 110, firefox: 104, safari: 16.4 },
  es2024: { chrome: 120, firefox: 119, safari: 17.2 },
  es2025: { chrome: 125, firefox: 125, safari: 18 },
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

export const VERSIONS = VERSION_ORDER;

export const MODULE_ONLY_FEATURES = ["import", "export"];

export const DEFAULT_SCAN_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
];
export const DEFAULT_IGNORE_PATHS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
];

export const TINY_FILE_SIZE = 500;
export const COMPLEXITY_INDICATORS = [
  "async",
  "await",
  "class",
  "extends",
  "?.",
  "??",
  "=>",
  "...",
  "yield",
  "import",
  "export",
  "#",
];

export const MDN_URLS = [
  "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins.json",
  "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/statements.json",
  "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/expressions.json",
  "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/operators.json",
  "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/grammar.json",
];
