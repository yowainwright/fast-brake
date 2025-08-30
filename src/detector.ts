import {
  FEATURE_STRINGS,
  FEATURE_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "./constants";
import type { DetectedFeature, DetectionOptions } from "./types";
import { loadPlugin, registerPlugin } from "./plugins/loader";
import type {
  Plugin,
  PluginConfig,
  PluginPattern,
  PluginContext,
  PluginResult,
} from "./plugins/types";
export type { DetectedFeature, DetectionOptions } from "./types";

export class Detector {
  private compiledPatterns: Map<string, RegExp>;
  private featureStrings: Record<string, string[]>;
  private patternCache: Map<string, RegExp>;
  private plugins: Plugin[] = [];

  constructor() {
    this.compiledPatterns = new Map();
    this.patternCache = new Map();

    for (const [name, pattern] of Object.entries(FEATURE_PATTERNS)) {
      const cacheKey = `builtin:${name}`;
      this.compiledPatterns.set(name, pattern);
      this.patternCache.set(cacheKey, pattern);
    }
    this.featureStrings = FEATURE_STRINGS;
  }

  private createValidateFunction(
    basePlugin: Plugin,
    options: Record<string, unknown>,
  ) {
    if (!basePlugin.validate) return undefined;

    return (ctx: PluginContext, matches: PluginResult[]) =>
      basePlugin.validate!(
        { ...ctx, options: { ...ctx.options, ...options } },
        matches,
      );
  }

  private async loadPluginWithOptions(
    name: string,
    options: Record<string, unknown>,
  ): Promise<Plugin | null> {
    const basePlugin = await loadPlugin(name);

    if (!basePlugin) return null;

    const validate = this.createValidateFunction(basePlugin, options);

    return {
      ...basePlugin,
      name: `${basePlugin.name}-configured`,
      validate,
    };
  }

  private async resolvePlugin(config: PluginConfig): Promise<Plugin | null> {
    if (!config) return null;

    const isPluginObject =
      typeof config === "object" && "name" in config && "patterns" in config;
    const isStringConfig = typeof config === "string";
    const isArrayConfig = Array.isArray(config);

    if (isPluginObject) {
      return config as Plugin;
    }

    if (isStringConfig) {
      return await loadPlugin(config);
    }

    if (!isArrayConfig) return null;

    const [name, options] = config;
    return await this.loadPluginWithOptions(name, options);
  }

  private createPatternCacheEntries(
    plugins: Plugin[],
  ): Array<[string, RegExp]> {
    return plugins.flatMap((plugin) =>
      plugin.patterns.map(
        (pattern) =>
          [`plugin:${plugin.name}:${pattern.name}`, pattern.pattern] as [
            string,
            RegExp,
          ],
      ),
    );
  }

  private cachePluginPatterns(plugins: Plugin[]): void {
    const entries = this.createPatternCacheEntries(plugins);

    for (const [key, pattern] of entries) {
      this.patternCache.set(key, pattern);
    }
  }

  async loadPlugins(configs: PluginConfig[]): Promise<void> {
    const resolvedPlugins = await Promise.all(
      configs.map((config) => this.resolvePlugin(config)),
    );

    this.plugins = resolvedPlugins.filter(
      (plugin): plugin is Plugin => plugin !== null,
    );
    this.cachePluginPatterns(this.plugins);
  }

  registerPlugin(name: string, plugin: Plugin): void {
    registerPlugin(name, plugin);
  }

  private detectPluginPattern(
    code: string,
    plugin: Plugin,
    pattern: PluginPattern,
  ): DetectedFeature | null {
    const cacheKey = `plugin:${plugin.name}:${pattern.name}`;
    const cachedPattern = this.patternCache.get(cacheKey);

    if (!cachedPattern) return null;

    cachedPattern.lastIndex = 0;
    if (!cachedPattern.test(code)) return null;

    return {
      name: pattern.name,
      version: FEATURE_VERSIONS[pattern.name] || "unknown",
    };
  }

  private detectWithPlugin(code: string, plugin: Plugin): DetectedFeature[] {
    const matches = plugin.patterns
      .map((pattern) => this.detectPluginPattern(code, plugin, pattern))
      .filter((match): match is DetectedFeature => match !== null);

    return matches;
  }

  private scanWithPlugins(code: string): DetectedFeature[] {
    if (this.plugins.length === 0) return [];

    return this.plugins.flatMap((plugin) =>
      this.detectWithPlugin(code, plugin),
    );
  }

  scan(code: string, options?: Partial<DetectionOptions>): DetectedFeature[] {
    const detected: DetectedFeature[] = [];

    for (const [featureName, patterns] of Object.entries(this.featureStrings)) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;

      const hasFeature = patterns.some((pattern) => code.includes(pattern));
      if (hasFeature) {
        const feature: DetectedFeature = {
          name: featureName,
          version: featureVersion,
        };

        detected.push(feature);

        if (options?.throwOnFirst) {
          return detected;
        }
      }
    }

    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;

      pattern.lastIndex = 0;
      if (pattern.test(code)) {
        const feature: DetectedFeature = {
          name: featureName,
          version: featureVersion,
        };

        detected.push(feature);

        if (options?.throwOnFirst) {
          return detected;
        }
      }
    }

    const pluginDetected = this.scanWithPlugins(code);

    return [...detected, ...pluginDetected];
  }

  detect(code: string, options: DetectionOptions): DetectedFeature[] {
    return this.scan(code, options);
  }

  check(code: string, options: DetectionOptions): boolean {
    const targetIndex = VERSION_ORDER.indexOf(options.target);

    for (const [featureName, patterns] of Object.entries(this.featureStrings)) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;

      const featureIndex = VERSION_ORDER.indexOf(featureVersion);

      if (featureIndex > targetIndex) {
        const hasFeature = patterns.some((pattern) => code.includes(pattern));
        if (hasFeature) {
          if (options.throwOnFirst) {
            throw new Error(
              `Feature "${featureName}" requires ${featureVersion} but target is ${options.target}`,
            );
          }
          return false;
        }
      }
    }

    for (const [featureName, pattern] of this.compiledPatterns.entries()) {
      const featureVersion = FEATURE_VERSIONS[featureName];
      if (!featureVersion) continue;

      const featureIndex = VERSION_ORDER.indexOf(featureVersion);

      if (featureIndex > targetIndex) {
        pattern.lastIndex = 0;
        if (pattern.test(code)) {
          if (options.throwOnFirst) {
            throw new Error(
              `Feature "${featureName}" requires ${featureVersion} but target is ${options.target}`,
            );
          }
          return false;
        }
      }
    }

    return true;
  }

  getMinimumVersion(code: string): string {
    const detected = this.detect(code, {
      target: "esnext",
    });

    if (detected.length === 0) {
      return "es2015";
    }

    let minVersion = "es2015";
    let minIndex = VERSION_ORDER.indexOf("es2015");

    for (const feature of detected) {
      const featureIndex = VERSION_ORDER.indexOf(feature.version);
      if (featureIndex > minIndex) {
        minIndex = featureIndex;
        minVersion = feature.version;
      }
    }

    return minVersion;
  }
}

let detectorInstance: Detector | null = null;

export function getDetector(): Detector {
  if (!detectorInstance) {
    detectorInstance = new Detector();
  }
  return detectorInstance;
}

export function detect(
  code: string,
  options: DetectionOptions,
): DetectedFeature[] {
  return getDetector().detect(code, options);
}

export function check(code: string, options: DetectionOptions): boolean {
  return getDetector().check(code, options);
}

export function getMinimumVersion(code: string): string {
  return getDetector().getMinimumVersion(code);
}
