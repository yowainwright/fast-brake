// Type definitions for brakefast

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

export interface DetectedFeature {
  name: string;
  version: string;
  line?: number;
  column?: number;
  snippet?: string;
}

export interface DetectionOptions {
  target: string;
  quick?: boolean;
  throwOnFirst?: boolean;
}

export interface Token {
  type: string;
  value: string;
  start: number;
  end: number;
  line: number;
  column: number;
}

export enum TokenState {
  NORMAL = 0,
  STRING_SINGLE = 1,
  STRING_DOUBLE = 2,
  TEMPLATE = 3,
  COMMENT_LINE = 4,
  COMMENT_BLOCK = 5,
  REGEX = 6
}