export * from "./types";
export * from "./loader";

import { Plugin, PluginResult } from "./types";

export function createPlugin(config: {
  name: string;
  patterns: Array<{
    name: string;
    pattern: RegExp | string;
    message?: string;
    severity?: "error" | "warning" | "info";
  }>;
  validate?: (context: any, matches: PluginResult[]) => PluginResult[];
}): Plugin {
  return {
    name: config.name,
    patterns: config.patterns.map((p) => ({
      name: p.name,
      pattern:
        typeof p.pattern === "string" ? new RegExp(p.pattern) : p.pattern,
      message: p.message,
      severity: p.severity,
    })),
    validate: config.validate,
  };
}

export type { Plugin as PluginType } from "./types";
