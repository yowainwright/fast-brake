import {
  getDetector,
  detect as detectFeatures,
  check as checkFeatures,
  getMinimumVersion,
} from "./detector";
import { PluginManager, loadPlugin } from "./plugins";
import { VERSION_ORDER, PARSER_MAPPINGS } from "./constants";
import type { DetectionOptions, DetectedFeature } from "./detector";
import type { PluginConfig, Plugin, PluginResult } from "./plugins/types";

export function fastBrake(code: string, options: DetectionOptions): void {
  const detector = getDetector();
  const detected = detector.detect(code, options);
  const targetIndex = getVersionIndex(options.target);

  for (const feature of detected) {
    const featureIndex = getVersionIndex(feature.version);
    if (featureIndex > targetIndex) {
      const error = new Error(
        `ES feature "${feature.name}" requires ${feature.version} but target is ${options.target}` +
          (feature.line ? ` at line ${feature.line}:${feature.column}` : "") +
          (feature.snippet ? `\n  ${feature.snippet}` : ""),
      );
      (error as any).feature = feature;
      (error as any).target = options.target;
      throw error;
    }
  }
}

export function detectWithPlugins(
  code: string,
  plugins: PluginConfig[] = ["es2015"],
): PluginResult[] {
  const plugin = loadPlugin(plugins);
  return plugin.detect(code);
}

export function checkWithPlugins(
  code: string,
  plugins: PluginConfig[] = ["es2015"],
): boolean {
  const plugin = loadPlugin(plugins);
  return plugin.check(code);
}

export function detect(
  code: string,
  options?: Partial<DetectionOptions>,
): DetectedFeature[] {
  if (options && "plugins" in options) {
    const plugins = (options as any).plugins as PluginConfig[];
    const results = detectWithPlugins(code, plugins);
    return results.map(
      (r) =>
        ({
          name: r.name,
          version: "unknown",
          line: r.line,
          column: r.column,
          snippet: r.snippet,
        }) as DetectedFeature,
    );
  }

  const opts: DetectionOptions = {
    target: options?.target || "esnext",
    throwOnFirst: options?.throwOnFirst,
  };
  return detectFeatures(code, opts);
}

export function check(
  code: string,
  options: DetectionOptions | PluginConfig[],
): boolean {
  if (Array.isArray(options)) {
    return checkWithPlugins(code, options);
  }

  try {
    return checkFeatures(code, options);
  } catch {
    return false;
  }
}

export function getMinimumESVersion(code: string): string {
  return getMinimumVersion(code);
}

export function registerPlugin(name: string, plugin: Plugin): void {
  const manager = new PluginManager();
  manager.register(name, plugin);
}

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

function getVersionIndex(version: string): number {
  return VERSION_ORDER.indexOf(version);
}

export type { DetectionOptions, DetectedFeature } from "./detector";
export type { BrowserVersions, Feature, SchemaJson } from "./types";
export type {
  Plugin,
  PluginConfig,
  PluginResult,
  PluginContext,
} from "./plugins/types";

export {
  ES_VERSIONS,
  MDN_URLS,
  FEATURE_PATTERNS,
  PARSER_MAPPINGS,
  VERSION_ORDER,
} from "./constants";

export * as plugins from "./plugins";

export function getParserMapping(
  feature: string,
  parser: string,
): string | string[] | undefined {
  return PARSER_MAPPINGS[parser]?.[feature];
}

export function toAcornNode(feature: string): string | string[] | undefined {
  return PARSER_MAPPINGS.ACORN?.[feature];
}

export function toEsCheckFeature(
  feature: string,
): string | string[] | undefined {
  return PARSER_MAPPINGS.ES_CHECK?.[feature];
}

export default fastBrake;
