import { Plugin, PluginConfig, PluginResult, PluginContext } from "./types";
import { loadPlugin, loadBrowserlistPlugin } from "./loader";

export class PluginManager {
  private plugins: Plugin[] = [];
  private pluginRegistry: Map<string, Plugin> = new Map();
  private combinedPattern: RegExp | null = null;
  private patternToPlugin: Map<string, { plugin: Plugin; pattern: any }> =
    new Map();

  constructor() {
    // No pre-registration needed - plugins loaded on demand
  }

  register(name: string, plugin: Plugin): void {
    this.pluginRegistry.set(name, plugin);
  }

  async load(configs: PluginConfig[]): Promise<void> {
    this.plugins = [];

    // Default to detect plugin if no configs provided
    const configsToLoad = configs.length === 0 ? ["detect"] : configs;

    for (const config of configsToLoad) {
      let plugin: Plugin | null = null;

      if (typeof config === "string") {
        if (this.pluginRegistry.has(config)) {
          plugin = this.pluginRegistry.get(config)!;
        } else if (config.startsWith("browser:")) {
          const browserlist = config.substring(8);
          plugin = await loadBrowserlistPlugin(browserlist);
        } else {
          plugin = await loadPlugin(config);
        }
      } else if (Array.isArray(config)) {
        const [name, options] = config;

        let basePlugin: Plugin | null = null;
        if (this.pluginRegistry.has(name)) {
          basePlugin = this.pluginRegistry.get(name)!;
        } else if (name === "browserlist") {
          basePlugin = await loadBrowserlistPlugin(
            options.browsers || "defaults",
          );
        } else {
          basePlugin = await loadPlugin(name);
        }

        if (basePlugin) {
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
    return Array.from(this.pluginRegistry.keys());
  }
}

let managerInstance: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!managerInstance) {
    managerInstance = new PluginManager();
  }
  return managerInstance;
}
