import { Plugin, PluginPattern } from './types';
import { QUICK_PATTERNS, FEATURE_VERSIONS, VERSION_ORDER } from '../constants';

export function createESVersionPlugin(targetVersion: string = 'es5'): Plugin {
  const patterns: PluginPattern[] = [];
  
  for (const [featureName, pattern] of Object.entries(QUICK_PATTERNS)) {
    const version = FEATURE_VERSIONS[featureName];
    patterns.push({
      name: featureName,
      pattern: pattern,
      message: `Feature "${featureName}" requires ${version} but target is ${targetVersion}`,
      severity: 'error'
    });
  }
  
  return {
    name: `es-version-${targetVersion}`,
    patterns,
    validate: (_context, matches) => {
      const targetIndex = VERSION_ORDER.indexOf(targetVersion);
      
      return matches.filter(match => {
        const featureVersion = FEATURE_VERSIONS[match.name];
        const featureIndex = VERSION_ORDER.indexOf(featureVersion);
        return featureIndex > targetIndex;
      });
    }
  };
}

export const es5 = createESVersionPlugin('es5');
export const es2015 = createESVersionPlugin('es2015');
export const es2016 = createESVersionPlugin('es2016');
export const es2017 = createESVersionPlugin('es2017');
export const es2018 = createESVersionPlugin('es2018');
export const es2019 = createESVersionPlugin('es2019');
export const es2020 = createESVersionPlugin('es2020');
export const es2021 = createESVersionPlugin('es2021');
export const es2022 = createESVersionPlugin('es2022');
export const es2023 = createESVersionPlugin('es2023');
export const es2024 = createESVersionPlugin('es2024');
export const es2025 = createESVersionPlugin('es2025');

export const es6 = es2015;
export const es7 = es2016;
export const es8 = es2017;
export const es9 = es2018;
export const es10 = es2019;
export const es11 = es2020;
export const es12 = es2021;
export const es13 = es2022;
export const es14 = es2023;
export const es15 = es2024;
export const es16 = es2025;

export const esAll: Plugin = {
  name: 'es-all',
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `ES feature "${name}" detected (${FEATURE_VERSIONS[name]})`,
    severity: 'info' as const
  })),
  validate: (_context, matches) => matches
};

export const esDetect: Plugin = {
  name: 'es-detect',
  patterns: Object.entries(QUICK_PATTERNS).map(([name, pattern]) => ({
    name,
    pattern,
    message: `${FEATURE_VERSIONS[name]} feature: ${name}`,
    severity: 'info' as const
  })),
  validate: (_context, matches) => {
    let highestVersion = 'es5';
    let highestIndex = 0;
    
    for (const match of matches) {
      const version = FEATURE_VERSIONS[match.name];
      const index = VERSION_ORDER.indexOf(version);
      if (index > highestIndex) {
        highestIndex = index;
        highestVersion = version;
      }
    }
    
    if (matches.length > 0) {
      return [{
        ...matches[0],
        name: 'minimum_version',
        message: `Minimum ES version required: ${highestVersion}`,
        severity: 'info'
      }];
    }
    return [];
  }
};

export function getESVersionPlugin(version: string): Plugin {
  const plugins: Record<string, Plugin> = {
    es5, es2015, es2016, es2017, es2018, es2019, 
    es2020, es2021, es2022, es2023, es2024, es2025,
    es6, es7, es8, es9, es10, es11, es12, es13, es14, es15, es16,
    all: esAll,
    detect: esDetect
  };
  
  return plugins[version] || es5;
}