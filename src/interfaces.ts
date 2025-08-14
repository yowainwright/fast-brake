export type Exec = (runner: string, cmds: Array<string>) => Promise<any>;

export interface BrakefastJSON {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  name: string;
  version: string;
  scripts?: Record<string, string>;
  workspaces?: string[];
  brakefast?: {
    cache?: CacheConfig;
    performance?: PerformanceConfig;
  };
}

export interface CacheConfig {
  enabled?: boolean;
  directory?: string;
  maxSize?: number;
  ttl?: number;
}

export interface PerformanceConfig {
  parallel?: boolean;
  maxConcurrency?: number;
  timeout?: number;
}

export interface BuildCache {
  [key: string]: {
    hash: string;
    timestamp: number;
    dependencies: string[];
    buildTime: number;
  };
}

export interface Options {
  debug?: boolean;
  exec?: Exec;
  isTesting?: boolean;
  isTestingCLI?: boolean;
  path?: string;
  out?: string;
  root?: string;
  cache?: boolean;
  parallel?: boolean;
  maxConcurrency?: number;
}

export interface BuildAnalysis {
  packageName: string;
  buildTime: number;
  dependencies: string[];
  cached: boolean;
  cacheHit?: boolean;
}

export interface LoggerOptions {
  file: string;
  isLogging?: boolean;
}

export type ConsoleMethod = "debug" | "error" | "info";
type ConsoleMethodFunc = (...args: unknown[]) => void;
export type ConsoleObject = { [K in ConsoleMethod]: ConsoleMethodFunc };
