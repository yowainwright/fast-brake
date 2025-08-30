import { Plugin } from "./types";

const pluginCache = new Map<string, Plugin>();

export function registerPlugin(name: string, plugin: Plugin): void {
  pluginCache.set(name, plugin);
}

export async function loadPlugin(name: string): Promise<Plugin | null> {
  if (pluginCache.has(name)) {
    return pluginCache.get(name)!;
  }

  try {
    let plugin: Plugin | null = null;

    if (name.startsWith("es") || name === "all") {
      const module = await import("./esversion");
      plugin = module.getESVersionPlugin(name);
    } else if (name === "detect") {
      const module = await import("./detect");
      plugin = module.detectPlugin;
    } else if (name.includes("telemetry")) {
      const module = await import("./telemetry");
      plugin =
        name === "telemetry"
          ? module.telemetryPlugin
          : name === "telemetry-strict"
            ? module.strictTelemetryPlugin
            : name === "no-telemetry"
              ? module.noTelemetryPlugin
              : null;
    }

    if (plugin) {
      pluginCache.set(name, plugin);
      return plugin;
    }

    return null;
  } catch (error) {
    console.error(`Failed to load plugin ${name}:`, error);
    return null;
  }
}

export async function loadBrowserlistPlugin(
  browserlist: string,
): Promise<Plugin> {
  const { createBrowserlistPlugin } = await import("./browserlist");
  return createBrowserlistPlugin(browserlist);
}

export function clearPluginCache(): void {
  pluginCache.clear();
}
