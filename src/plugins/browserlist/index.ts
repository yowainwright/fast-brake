import type { Plugin, PluginMatch } from "../../types";
import browserlistPlugin from "./schema.json";
import { ES_VERSIONS } from "../../constants";

export interface BrowserTarget {
  name: string;
  version: number;
}

export function createBrowserlistPlugin(browsers: string | string[]): Plugin {
  const plugin = browserlistPlugin as Plugin;
  const targets = parseBrowserlist(browsers);
  const minESVersion = getMinESVersionForBrowsers(targets);

  const filteredMatches: Record<string, PluginMatch> = {};
  const targetIndex = plugin.spec.orderedRules.indexOf(minESVersion);

  if (targetIndex === -1) {
    return plugin;
  }

  for (const [matchName, match] of Object.entries(plugin.spec.matches)) {
    const ruleIndex = plugin.spec.orderedRules.indexOf(match.rule);
    if (ruleIndex > targetIndex) {
      filteredMatches[matchName] = match;
    }
  }

  return {
    name: `browserlist-${browsers}`,
    description: `Browser compatibility for: ${browsers}`,
    spec: {
      orderedRules: plugin.spec.orderedRules,
      matches: filteredMatches,
    },
  };
}

export function parseBrowserlist(browsers: string | string[]): BrowserTarget[] {
  const browserArray = Array.isArray(browsers) ? browsers : [browsers];
  const targets: BrowserTarget[] = [];

  for (const browser of browserArray) {
    const trimmed = browser.trim().toLowerCase();

    const browserMatch = trimmed.match(/^(chrome|firefox|safari|edge|ie)/);
    if (browserMatch) {
      const name = browserMatch[1];
      const rest = trimmed.slice(name.length).trim();

      const versionMatch = rest.match(/^([><=]{0,2})\s*(\d+)$/);
      if (versionMatch) {
        const version = parseInt(versionMatch[2], 10);
        targets.push({
          name,
          version,
        });
      }
    } else if (browser.includes("last")) {
      const versionMatch = browser.match(/last\s+(\d{1,2})/);
      if (versionMatch) {
        const versions = parseInt(versionMatch[1], 10);
        targets.push(
          { name: "chrome", version: 120 - versions * 4 },
          { name: "firefox", version: 119 - versions * 4 },
          { name: "safari", version: 17 - versions },
        );
      }
    } else if (browser === "defaults" || browser.includes("%")) {
      targets.push(
        { name: "chrome", version: 80 },
        { name: "firefox", version: 74 },
        { name: "safari", version: 13 },
      );
    }
  }

  return targets;
}

export function getMinESVersionForBrowsers(targets: BrowserTarget[]): string {
  let minVersion = "esnext";

  for (const target of targets) {
    for (const [version, support] of Object.entries(ES_VERSIONS)) {
      const browserSupport = (support as any)[target.name] || 999;
      if (target.version >= browserSupport) {
        continue;
      } else {
        const prevIndex = Object.keys(ES_VERSIONS).indexOf(version) - 1;
        if (prevIndex >= 0) {
          const supportedVersion = Object.keys(ES_VERSIONS)[prevIndex];
          if (
            minVersion === "esnext" ||
            Object.keys(ES_VERSIONS).indexOf(supportedVersion) <
              Object.keys(ES_VERSIONS).indexOf(minVersion)
          ) {
            minVersion = supportedVersion;
          }
        }
        break;
      }
    }
  }

  return minVersion;
}

export function isFeatureSupportedInBrowsers(
  featureVersion: string,
  targets: BrowserTarget[],
): boolean {
  const esVersionSupport =
    ES_VERSIONS[featureVersion as keyof typeof ES_VERSIONS];
  if (!esVersionSupport) return true;

  for (const target of targets) {
    const requiredVersion = (esVersionSupport as any)[target.name];
    if (requiredVersion && target.version < requiredVersion) {
      return false;
    }
  }

  return true;
}

export const modernBrowsers = createBrowserlistPlugin(["last 2 versions"]);
export const legacyBrowsers = createBrowserlistPlugin([
  "chrome 60",
  "firefox 55",
  "safari 11",
]);
export const defaultBrowsers = createBrowserlistPlugin("defaults");
