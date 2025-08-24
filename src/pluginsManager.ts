import {
  Plugin,
  PluginConfig,
  PluginResult,
  PluginContext,
} from "./plugins/types";
import { getESVersionPlugin } from "./plugins/esversion";
import { es2015Plugin, es2015StrictPlugin } from "./plugins/es2015";
import { telemetryPlugin, strictTelemetryPlugin } from "./plugins/telemetry";
import { createBrowserlistPlugin } from "./plugins/browserlist";

export class PluginManager {
  private plugins: Plugin[] = [];
  private pluginRegistry: Map<string, Plugin> = new Map();
  private combinedPattern: RegExp | null = null;
  private patternToPlugin: Map<string, { plugin: Plugin; pattern: any }> =
    new Map();

  constructor() {
    this.registerBuiltInPlugins();
  }

  private registerBuiltInPlugins() {
    this.pluginRegistry.set("es2015", es2015Plugin);
    this.pluginRegistry.set("es2015-strict", es2015StrictPlugin);
    this.pluginRegistry.set("telemetry", telemetryPlugin);
    this.pluginRegistry.set("telemetry-strict", strictTelemetryPlugin);
  }

  register(name: string, plugin: Plugin): void {
    this.pluginRegistry.set(name, plugin);
  }

  load(configs: PluginConfig[]): void {
    this.plugins = [];

    for (const config of configs) {
      let plugin: Plugin | null = null;

      if (typeof config === "string") {
        if (this.pluginRegistry.has(config)) {
          plugin = this.pluginRegistry.get(config)!;
        } else if (config.startsWith("browser:")) {
          const browserlist = config.substring(8);
          plugin = createBrowserlistPlugin(browserlist);
        } else {
          plugin = getESVersionPlugin(config);
        }
      } else if (Array.isArray(config)) {
        const [name, options] = config;

        if (this.pluginRegistry.has(name)) {
          const basePlugin = this.pluginRegistry.get(name)!;
          plugin = {
            ...basePlugin,
            name: `${basePlugin.name}-configured`,
            validate: basePlugin.validate
              ? (ctx, matches) =>
                  basePlugin.validate!(
                    { ...ctx, options: { ...ctx.options, ...options } },
                    matches,
                  )
              : undefined,
          };
        } else if (name === "browserlist") {
          plugin = createBrowserlistPlugin(options.browsers || "defaults");
        }
      } else if ("name" in config && "patterns" in config) {
        plugin = config as Plugin;
      }

      if (plugin) {
        this.plugins.push(plugin);
      } else {
        console.warn(`Plugin not found: ${config}`);
      }
    }

    this.buildCombinedPattern();
  }

  private buildCombinedPattern() {
    const allPatterns: string[] = [];

    for (const plugin of this.plugins) {
      for (const pattern of plugin.patterns) {
        const patternStr = pattern.pattern.source;
        const key = `${plugin.name}:${patternStr}`;

        if (!this.patternToPlugin.has(key)) {
          allPatterns.push(`(${patternStr})`);
          this.patternToPlugin.set(key, { plugin, pattern });
        }
      }
    }

    if (allPatterns.length > 0) {
      this.combinedPattern = new RegExp(allPatterns.join("|"), "gm");
    }
  }

  detect(code: string, options?: Record<string, any>): PluginResult[] {
    if (!this.combinedPattern || this.plugins.length === 0) return [];

    const results: PluginResult[] = [];
    const context: PluginContext = { code, options: options || {} };
    const matchesByPlugin = new Map<Plugin, PluginResult[]>();

    this.combinedPattern.lastIndex = 0;

    let match;
    while ((match = this.combinedPattern.exec(code)) !== null) {
      let matchedPlugin: Plugin | undefined;
      let matchedPattern: any;

      for (const plugin of this.plugins) {
        for (const pattern of plugin.patterns) {
          const testRegex = new RegExp(pattern.pattern.source);
          if (testRegex.test(match[0])) {
            matchedPlugin = plugin;
            matchedPattern = pattern;
            break;
          }
        }
        if (matchedPlugin) break;
      }

      if (matchedPlugin && matchedPattern) {
        const upToMatch = code.substring(0, match.index);
        const lineNum = (upToMatch.match(/\n/g) || []).length + 1;
        const lastNewline = upToMatch.lastIndexOf("\n");
        const column = match.index - lastNewline;

        const result: PluginResult = {
          name: matchedPattern.name,
          line: lineNum,
          column: column,
          snippet: code
            .substring(match.index, Math.min(match.index + 50, code.length))
            .replace(/\n/g, " ")
            .trim(),
          message: matchedPattern.message || `Detected: ${matchedPattern.name}`,
          severity: matchedPattern.severity || "info",
          plugin: matchedPlugin.name,
        };

        if (!matchesByPlugin.has(matchedPlugin)) {
          matchesByPlugin.set(matchedPlugin, []);
        }
        matchesByPlugin.get(matchedPlugin)!.push(result);
      }
    }

    for (const [plugin, matches] of matchesByPlugin) {
      const validated = plugin.validate
        ? plugin.validate(context, matches)
        : matches;
      results.push(...validated);
    }

    return results;
  }

  check(code: string, options?: Record<string, any>): boolean {
    const results = this.detect(code, options);
    return results.filter((r) => r.severity === "error").length === 0;
  }

  getErrors(code: string, options?: Record<string, any>): PluginResult[] {
    return this.detect(code, options).filter((r) => r.severity === "error");
  }

  getWarnings(code: string, options?: Record<string, any>): PluginResult[] {
    return this.detect(code, options).filter((r) => r.severity === "warning");
  }

  getLoadedPlugins(): string[] {
    return this.plugins.map((p) => p.name);
  }

  getAvailablePlugins(): string[] {
    return [
      ...Array.from(this.pluginRegistry.keys()),
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
      "all",
      "detect",
      "browserlist",
    ];
  }
}

let managerInstance: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!managerInstance) {
    managerInstance = new PluginManager();
  }
  return managerInstance;
}
