export interface PluginPattern {
  name: string;
  pattern: RegExp;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface PluginResult {
  name: string;
  line?: number;
  column?: number;
  snippet?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  plugin: string;
}

export interface PluginContext {
  code: string;
  options?: Record<string, any>;
}

export interface Plugin {
  name: string;
  patterns: PluginPattern[];
  validate?: (context: PluginContext, matches: PluginResult[]) => PluginResult[];
  transform?: (pattern: PluginPattern) => PluginPattern;
}

export type PluginConfig = string | Plugin | [string, Record<string, any>];