import type { Plugin } from "../types";

const pluginCache = new Map<string, Plugin>();

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
  } catch {
    try {
      const module = await import(`./${name}/index`);
      const loadedPlugin = module.default || module[name + "Plugin"] || module;
      pluginCache.set(name, loadedPlugin);
      return loadedPlugin;
    } catch {
      return null;
    }
  }
}

export function clearPluginCache(): void {
  pluginCache.clear();
}
