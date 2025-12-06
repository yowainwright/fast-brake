import type { Plugin, LogLevel } from "../types";

const pluginCache = new Map<string, Plugin>();

let logLevel: LogLevel = "warn";

export function setPluginLogLevel(level: LogLevel): void {
  logLevel = level;
}

function logPluginError(message: string, error?: unknown): void {
  if (logLevel === "silent") return;

  const errorDetails = error instanceof Error ? error.message : String(error);
  const fullMessage = `[fast-brake] ${message}: ${errorDetails}`;

  if (logLevel === "error") {
    console.error(fullMessage);
  } else {
    console.warn(fullMessage);
  }
}

export function registerPlugin(name: string, plugin: Plugin): void {
  pluginCache.set(name, plugin);
}

export async function loadPlugin(name: string): Promise<Plugin | null> {
  if (pluginCache.has(name)) {
    return pluginCache.get(name)!;
  }

  try {
    const plugin = await import(`./${name}/schema.json`);
    const loadedPlugin = plugin.default || plugin;
    pluginCache.set(name, loadedPlugin);
    return loadedPlugin;
  } catch (schemaError) {
    try {
      const module = await import(`./${name}/index`);
      const loadedPlugin = module.default || module[name + "Plugin"] || module;
      pluginCache.set(name, loadedPlugin);
      return loadedPlugin;
    } catch (moduleError) {
      logPluginError(`Failed to load plugin "${name}"`, moduleError);
      return null;
    }
  }
}

export function clearPluginCache(): void {
  pluginCache.clear();
}
