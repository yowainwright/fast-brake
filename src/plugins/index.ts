export * from "./types";
export * from "./manager";
export * from "./loader";

// Only export functions that enable tree-shaking
// Don't import plugins directly here

import { PluginManager } from "./manager";
import { PluginConfig, Plugin, PluginResult } from "./types";

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

export function loadPlugin(plugins: PluginConfig[]): PluginManager {
  const manager = new PluginManager();
  manager.load(plugins);
  return manager;
}

export function detect(
  code: string,
  plugins: PluginConfig[] = ["es2015"],
): PluginResult[] {
  const plugin = loadPlugin(plugins);
  return plugin.detect(code);
}

export function check(
  code: string,
  plugins: PluginConfig[] = ["es2015"],
): boolean {
  const plugin = loadPlugin(plugins);
  return plugin.check(code);
}

export function getMinimumESVersion(code: string): string {
  const plugin = loadPlugin(["detect"]);
  const results = plugin.detect(code);

  if (results.length > 0 && results[0].message) {
    const match = results[0].message.match(
      /Minimum ES version required: (\w+)/,
    );
    if (match) {
      return match[1];
    }
  }

  return "es2015";
}

// For users who want to import specific plugins directly
// These will be tree-shaken if not used
export type { Plugin as PluginType } from "./types";
