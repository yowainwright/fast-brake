import { Plugin } from "./types";

const pluginCache = new Map<string, Plugin>();

export function registerPlugin(name: string, plugin: Plugin): void {
  pluginCache.set(name, plugin);
}

export async function loadPlugin(name: string): Promise<Plugin | null> {
  if (pluginCache.has(name)) {
    return pluginCache.get(name)!;
  }
  return null;
}

export function clearPluginCache(): void {
  pluginCache.clear();
}
