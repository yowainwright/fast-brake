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

    // Map plugin names to their directories and exports
    if (
      name === "es5" ||
      name === "es2015" ||
      name === "es2015-baseline" ||
      name === "es2015-strict" ||
      name === "es6"
    ) {
      const module = await import("./es2015");
      plugin =
        name === "es5"
          ? module.es5Plugin
          : name === "es2015"
            ? module.es2015VersionPlugin
            : name === "es2015-baseline"
              ? module.es2015Plugin
              : name === "es2015-strict"
                ? module.es2015StrictPlugin
                : module.es6Plugin;
    } else if (name.startsWith("es20") || name.match(/^es\d+$/)) {
      // Handle ES version plugins dynamically
      const versionMap: Record<string, string> = {
        es7: "es2016",
        es8: "es2017",
        es9: "es2018",
        es10: "es2019",
        es11: "es2020",
        es12: "es2021",
        es13: "es2022",
        es14: "es2023",
        es15: "es2024",
        es16: "es2025",
      };

      const moduleName = versionMap[name] || name;
      const module = await import(`./${moduleName}`);
      plugin = module[`${name}Plugin`] || module[`${moduleName}Plugin`];
    } else if (name === "all") {
      const module = await import("./all");
      plugin = module.allPlugin;
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
