import { Plugin } from './types';
import { QUICK_PATTERNS, FEATURE_VERSIONS, ES_VERSIONS } from '../constants';

export interface BrowserTarget {
  name: string;
  version: number;
}

export function createBrowserlistPlugin(browsers: string | string[]): Plugin {
  const targets = parseBrowserlist(browsers);
  
  return {
    name: 'browserlist',
    patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
      name,
      pattern,
      message: `Feature "${name}" (${FEATURE_VERSIONS[name]}) may not be supported in: ${browsers}`,
      severity: 'error' as const
    })),
    validate: (_context, matches) => {
      return matches.filter(match => {
        const featureVersion = FEATURE_VERSIONS[match.name];
        return !isFeatureSupportedInBrowsers(featureVersion, targets);
      });
    }
  };
}

export function parseBrowserlist(browsers: string | string[]): BrowserTarget[] {
  const browserArray = Array.isArray(browsers) ? browsers : [browsers];
  const targets: BrowserTarget[] = [];
  
  for (const browser of browserArray) {
    const match = browser.match(/^(chrome|firefox|safari|edge|ie)\s*([><=]*)\s*(\d+)/i);
    if (match) {
      const [, name, , version] = match;
      targets.push({
        name: name.toLowerCase(),
        version: parseInt(version, 10)
      });
    }
    else if (browser.includes('last')) {
      const versionMatch = browser.match(/last\s+(\d+)/);
      if (versionMatch) {
        const versions = parseInt(versionMatch[1], 10);
        targets.push(
          { name: 'chrome', version: 120 - (versions * 4) },
          { name: 'firefox', version: 119 - (versions * 4) },
          { name: 'safari', version: 17 - versions }
        );
      }
    }
    else if (browser === 'defaults' || browser.includes('%')) {
      targets.push(
        { name: 'chrome', version: 80 },
        { name: 'firefox', version: 74 },
        { name: 'safari', version: 13 }
      );
    }
  }
  
  return targets;
}

export function getMinESVersionForBrowsers(targets: BrowserTarget[]): string {
  let minVersion = 'esnext';
  
  for (const target of targets) {
    for (const [version, support] of Object.entries(ES_VERSIONS)) {
      const browserSupport = (support as any)[target.name] || 999;
      if (target.version >= browserSupport) {
        continue;
      } else {
        const prevIndex = Object.keys(ES_VERSIONS).indexOf(version) - 1;
        if (prevIndex >= 0) {
          const supportedVersion = Object.keys(ES_VERSIONS)[prevIndex];
          if (minVersion === 'esnext' || Object.keys(ES_VERSIONS).indexOf(supportedVersion) < Object.keys(ES_VERSIONS).indexOf(minVersion)) {
            minVersion = supportedVersion;
          }
        }
        break;
      }
    }
  }
  
  return minVersion;
}

export function isFeatureSupportedInBrowsers(featureVersion: string, targets: BrowserTarget[]): boolean {
  const esVersionSupport = ES_VERSIONS[featureVersion as keyof typeof ES_VERSIONS];
  if (!esVersionSupport) return true;
  
  for (const target of targets) {
    const requiredVersion = (esVersionSupport as any)[target.name];
    if (requiredVersion && target.version < requiredVersion) {
      return false;
    }
  }
  
  return true;
}

export const modernBrowsers = createBrowserlistPlugin(['last 2 versions']);
export const legacyBrowsers = createBrowserlistPlugin(['chrome 60', 'firefox 55', 'safari 11']);
export const defaultBrowsers = createBrowserlistPlugin('defaults');