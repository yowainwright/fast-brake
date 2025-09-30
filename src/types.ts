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
  orderedRules?: string[];
}
export interface LocEnrichedFeature extends DetectedFeature {
  loc: Location;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export interface ScanOptions {
  extensions?: string[];
  ignorePatterns?: string[];
  maxDepth?: number;
  earlyExit?: boolean;
  limit?: number;
}

export interface ScanResult {
  path: string;
  type: "file" | "directory";
  extension?: string;
}

export interface ScanContext {
  results: ScanResult[];
  maxDepth: number;
  earlyExit: boolean;
  limit?: number;
  shouldStop: boolean;
}

export type DetectionMode = "boolean" | "fast" | "detailed";

export interface DetectionMatch {
  name: string;
  match: string;
  spec: string;
  rule: string;
  index?: number;
}

export interface DetectionResult {
  hasMatch: boolean;
  mode: DetectionMode;
  firstMatch?: DetectionMatch;
}

export interface PluginPattern {
  pattern: string;
  identifier?: string;
}

export interface PluginMatch {
  rule: string;
  strings?: string[];
  patterns?: PluginPattern[];
  exclude?: string[];
}

export interface PluginSpec {
  orderedRules: string[];
  matches: Record<string, PluginMatch>;
}

export interface Plugin {
  name: string;
  description: string;
  spec: PluginSpec;
}

export interface Extension {
  name: string;
  description: string;
  process: (input: ExtensionInput) => ExtensionOutput;
  spec?: Record<string, unknown>;
}

export interface ExtensionInput {
  code: string;
  result: {
    name: string;
    match: string;
    spec: Record<string, unknown>;
    rule: string;
    index?: number;
  };
}

export interface ExtensionOutput {
  name: string;
  match: string;
  spec: Record<string, unknown>;
  rule: string;
  index?: number;
}

export interface FastBrakeOptions {
  plugins?: Plugin[];
  extensions?: Extension[];
}

export interface FastBrakeAPI {
  detect: (code: string) => Promise<DetectedFeature[]>;
  check: (code: string, options: DetectionOptions) => Promise<boolean>;
}

export interface FastBrakeSyncAPI {
  detect: (code: string) => DetectedFeature[];
  check: (code: string, options: DetectionOptions) => boolean;
}
