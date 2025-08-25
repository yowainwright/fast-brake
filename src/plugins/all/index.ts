import { Plugin } from "../types";
import { QUICK_PATTERNS, FEATURE_VERSIONS } from "./constants";

export const allPlugin: Plugin = {
  name: "es-all",
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `ES feature "${name}" detected (${FEATURE_VERSIONS[name]})`,
    severity: "info" as const,
  })),
  validate: (_context, matches) => matches,
};

export const esAll = allPlugin;
export const all = allPlugin;
