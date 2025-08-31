export * from "./types";
export * from "./loader";

import type { Plugin, PluginSpec, PluginMatch } from "../types";

export function createPlugin(config: {
  name: string;
  description: string;
  orderedRules: string[];
  matches: Record<
    string,
    {
      rule: string;
      strings?: string[];
      patterns?: Array<{
        pattern: string;
        identifier?: string;
      }>;
    }
  >;
}): Plugin {
  const spec: PluginSpec = {
    orderedRules: config.orderedRules,
    matches: {},
  };

  for (const [matchName, match] of Object.entries(config.matches)) {
    const pluginMatch: PluginMatch = {
      rule: match.rule,
    };

    if (match.strings) {
      pluginMatch.strings = match.strings;
    }

    if (match.patterns) {
      pluginMatch.patterns = match.patterns.map((p) => ({
        pattern: p.pattern,
        identifier: p.identifier,
      }));
    }

    spec.matches[matchName] = pluginMatch;
  }

  return {
    name: config.name,
    description: config.description,
    spec,
  };
}
