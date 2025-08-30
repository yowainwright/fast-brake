export interface BrowserVersions {
  chrome: number;
  firefox: number;
  safari: number;
}

export interface Feature {
  name: string;
  category: string;
  esVersion: string;
  pattern: string | null;
  mdn_url?: string;
  description?: string;
}

export interface SchemaJson {
  features: Feature[];
  featuresByVersion: Record<string, Feature[]>;
  patternsByVersion: Record<string, string>;
  esVersions: string[];
}

export interface Position {
  line: number;
  column: number;
}

export interface Location {
  start: Position;
  end: Position;
  offset?: number;
  length?: number;
}

export interface DetectedFeature {
  name: string;
  version: string;
  line?: number;
  column?: number;
  snippet?: string;
  loc?: Location;
}

export interface DetectionOptions {
  target: string;
  throwOnFirst?: boolean;
  ignorePatterns?: string[];
  preprocessors?: Array<(code: string) => string>;
  includeLoc?: boolean;
}
