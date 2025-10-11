import type { Plugin } from "../../types";
import esversionPlugin from "./schema.json";
import { jscommentsPreprocessor } from "../jscomments";

export function createESVersionPlugin(targetVersion: string = "es5"): Plugin {
  const plugin = esversionPlugin as Plugin;

  const filteredMatches: Record<string, any> = {};
  const targetIndex = plugin.spec.orderedRules.indexOf(targetVersion);

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
    name: `es-version-${targetVersion}`,
    description: `Checks for features newer than ${targetVersion}`,
    spec: {
      orderedRules: plugin.spec.orderedRules,
      matches: filteredMatches,
    },
  };
}

export const es5 = createESVersionPlugin("es5");
export const es2015 = createESVersionPlugin("es2015");
export const es2016 = createESVersionPlugin("es2016");
export const es2017 = createESVersionPlugin("es2017");
export const es2018 = createESVersionPlugin("es2018");
export const es2019 = createESVersionPlugin("es2019");
export const es2020 = createESVersionPlugin("es2020");
export const es2021 = createESVersionPlugin("es2021");
export const es2022 = createESVersionPlugin("es2022");
export const es2023 = createESVersionPlugin("es2023");
export const es2024 = createESVersionPlugin("es2024");
export const es2025 = createESVersionPlugin("es2025");

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

export const esAll: Plugin = esversionPlugin as Plugin;

export const esDetect: Plugin = {
  name: "es-detect",
  description: "Detects the minimum ES version required",
  spec: esversionPlugin.spec,
};

export function getESVersionPlugin(version: string): Plugin {
  const plugins: Record<string, Plugin> = {
    es5,
    es2015,
    es2016,
    es2017,
    es2018,
    es2019,
    es2020,
    es2021,
    es2022,
    es2023,
    es2024,
    es2025,
    es6,
    es7,
    es8,
    es9,
    es10,
    es11,
    es12,
    es13,
    es14,
    es15,
    es16,
    all: esAll,
    detect: esDetect,
  };

  return plugins[version] || es5;
}

/**
 * Default preprocessors for esversion plugin
 * Includes jscomments to strip comments before detection
 */
export const defaultPreprocessors = [jscommentsPreprocessor];

export default esAll;
