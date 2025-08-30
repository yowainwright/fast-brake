import { Plugin, PluginConfig, PluginResult, PluginContext } from "./types";
import { loadPlugin, registerPlugin } from "./loader";

export class PluginManager {
  private plugins: Plugin[] = [];
  private cachedPatterns: Map<string, RegExp> = new Map();

  register(name: string, plugin: Plugin): void {
    registerPlugin(name, plugin);
  }

  async load(configs: PluginConfig[]): Promise<void> {
    this.plugins = [];
    this.cachedPatterns.clear();

    const configsToLoad = configs.length === 0 ? ["detect"] : configs;

    for (const config of configsToLoad) {
      let plugin: Plugin | null = null;

      if (typeof config === "string") {
        plugin = await loadPlugin(config);
      } else if (Array.isArray(config)) {
        const [name, options] = config;
        let basePlugin: Plugin | null = null;

        basePlugin = await loadPlugin(name);

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
        for (const pattern of plugin.patterns) {
          const key = `${plugin.name}:${pattern.name}`;
          this.cachedPatterns.set(key, pattern.pattern);
        }
      }
    }
  }

  detect(code: string, options?: Record<string, unknown>): PluginResult[] {
    if (this.plugins.length === 0) return [];

    const results: PluginResult[] = [];
    const context: PluginContext = { code, options: options || {} };

    for (const plugin of this.plugins) {
      const pluginMatches: PluginResult[] = [];

      for (const pattern of plugin.patterns) {
        const key = `${plugin.name}:${pattern.name}`;
        const regex = this.cachedPatterns.get(key) || pattern.pattern;

        regex.lastIndex = 0;
        const match = regex.exec(code);

        if (match) {
          const upToMatch = code.substring(0, match.index);
          const lineNum = (upToMatch.match(/\n/g) || []).length + 1;
          const lastNewline = upToMatch.lastIndexOf("\n");
          const column = match.index - lastNewline;

          pluginMatches.push({
            name: pattern.name,
            line: lineNum,
            column: column,
            snippet: code
              .substring(match.index, Math.min(match.index + 50, code.length))
              .replace(/\n/g, " ")
              .trim(),
            message: pattern.message || `Detected: ${pattern.name}`,
            severity: pattern.severity || "info",
            plugin: plugin.name,
          });
        }
      }

      const validated = plugin.validate
        ? plugin.validate(context, pluginMatches)
        : pluginMatches;
      results.push(...validated);
    }

    return results;
  }

  check(code: string, options?: Record<string, unknown>): boolean {
    const results = this.detect(code, options);
    return results.filter((r) => r.severity === "error").length === 0;
  }

  getErrors(code: string, options?: Record<string, unknown>): PluginResult[] {
    return this.detect(code, options).filter((r) => r.severity === "error");
  }

  getWarnings(code: string, options?: Record<string, unknown>): PluginResult[] {
    return this.detect(code, options).filter((r) => r.severity === "warning");
  }

  getLoadedPlugins(): string[] {
    return this.plugins.map((p) => p.name);
  }
}

let managerInstance: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!managerInstance) {
    managerInstance = new PluginManager();
  }
  return managerInstance;
}
