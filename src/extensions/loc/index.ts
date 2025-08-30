import type { DetectedFeature, Location } from "../../types";
import { FEATURE_STRINGS, FEATURE_PATTERNS } from "../../constants";
import { Detector } from "../../detector";

export interface LocEnrichedFeature extends DetectedFeature {
  loc: Location;
}

export function enrichWithLoc(
  code: string,
  feature: DetectedFeature,
): LocEnrichedFeature | null {
  // Find the pattern in the code
  const patterns = FEATURE_STRINGS[feature.name] || [];
  
  for (const pattern of patterns) {
    const index = code.indexOf(pattern);
    if (index !== -1) {
      // Calculate line and column
      const lines = code.substring(0, index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      
      return {
        ...feature,
        line,
        column,
        snippet: pattern,
        loc: {
          start: {
            line,
            column,
          },
          end: {
            line,
            column: column + pattern.length,
          },
          offset: index,
          length: pattern.length,
        },
      };
    }
  }
  
  // Try regex patterns if no string pattern matched
  const regexPattern = FEATURE_PATTERNS[feature.name];
  if (regexPattern) {
    const match = code.match(regexPattern);
    if (match && match.index !== undefined) {
      const snippet = match[0];
      const index = match.index;
      const lines = code.substring(0, index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      
      return {
        ...feature,
        line,
        column,
        snippet,
        loc: {
          start: {
            line,
            column,
          },
          end: {
            line,
            column: column + snippet.length,
          },
          offset: index,
          length: snippet.length,
        },
      };
    }
  }
  
  return null;
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
  const features = detector.scan(code);
  
  // Find the feature by name
  const matchingFeature = features.find(f => f.name === featureName);
  if (!matchingFeature) {
    return null;
  }
  
  // If no target line specified, return the first occurrence
  if (!targetLine) {
    return enrichWithLoc(code, matchingFeature);
  }
  
  // Find all occurrences of this feature
  const patterns = FEATURE_STRINGS[featureName] || [];
  const lines = code.split('\n');
  
  for (const pattern of patterns) {
    let currentPos = 0;
    let currentLine = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      if (lineNumber === targetLine) {
        const index = line.indexOf(pattern);
        if (index !== -1) {
          // Found on target line
          return {
            ...matchingFeature,
            line: lineNumber,
            column: index + 1,
            snippet: line,
            loc: {
              start: {
                line: lineNumber,
                column: index + 1,
              },
              end: {
                line: lineNumber,
                column: index + 1 + pattern.length,
              },
              offset: currentPos + index,
              length: pattern.length,
            },
          };
        }
      }
      currentPos += line.length + 1; // +1 for newline
    }
  }
  
  // Try regex patterns if no string pattern matched
  const regexPattern = FEATURE_PATTERNS[featureName];
  if (regexPattern) {
    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      if (lineNumber === targetLine) {
        const match = lines[i].match(regexPattern);
        if (match) {
          return {
            ...matchingFeature,
            line: lineNumber,
            column: (match.index || 0) + 1,
            snippet: lines[i],
            loc: {
              start: {
                line: lineNumber,
                column: (match.index || 0) + 1,
              },
              end: {
                line: lineNumber,
                column: (match.index || 0) + 1 + match[0].length,
              },
              offset: code.split('\n').slice(0, i).join('\n').length + (i > 0 ? 1 : 0) + (match.index || 0),
              length: match[0].length,
            },
          };
        }
      }
    }
  }
  
  return null;
}