import type { DetectedFeature, LocEnrichedFeature } from "../../types";
import { Detector } from "../../detector";

export function enrichWithLoc(
  code: string,
  feature: DetectedFeature,
): LocEnrichedFeature | null {
  if (!feature.line || !feature.column || !feature.snippet) return null;

  const line = feature.line;
  const column = feature.column;
  const snippet = feature.snippet;

  const snippetIndex = feature.index ?? code.indexOf(snippet);
  if (snippetIndex === -1) return null;

  const length = snippet.length;
  const updatedColumn = column + length;

  return {
    ...feature,
    loc: {
      start: {
        line,
        column,
      },
      end: {
        line,
        column: updatedColumn,
      },
      offset: snippetIndex,
      length,
    },
  };
}

export function enrichFeaturesWithLoc(
  code: string,
  features: DetectedFeature[],
): LocEnrichedFeature[] {
  const enriched: LocEnrichedFeature[] = [];

  for (const feature of features) {
    const enrichedFeature = enrichWithLoc(code, feature);
    if (enrichedFeature) {
      enriched.push(enrichedFeature);
    }
  }

  return enriched;
}

export function findFeatureWithLoc(
  code: string,
  featureName: string,
  targetLine?: number,
): LocEnrichedFeature | null {
  const detector = new Detector();
  const result = detector.detectDetailed(code);

  const hasNoMatch = !result.hasMatch || !result.firstMatch;
  if (hasNoMatch) return null;

  const feature: DetectedFeature = {
    name: result.firstMatch.name,
    version: result.firstMatch.version,
    line: targetLine,
    column: 0,
    snippet: result.firstMatch.match,
    index: result.firstMatch.index,
  };

  const isWrongFeature = feature.name !== featureName;
  const isWrongLine = targetLine && feature.line !== targetLine;

  if (isWrongFeature || isWrongLine) {
    return null;
  }

  return enrichWithLoc(code, feature);
}
