import { readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";
import { DEFAULT_SCAN_EXTENSIONS, DEFAULT_IGNORE_PATHS } from "./constants";
import type { ScanOptions, ScanResult, ScanContext } from "./types";

export class Scanner {
  scan(rootPath: string, options: ScanOptions = {}): ScanResult[] {
    const {
      extensions = DEFAULT_SCAN_EXTENSIONS,
      ignorePatterns = DEFAULT_IGNORE_PATHS,
      maxDepth = 10,
      earlyExit = false,
      limit,
    } = options;

    const pathExists = existsSync(rootPath);
    if (!pathExists) {
      return [];
    }

    const extensionSet = new Set(extensions);
    const context: ScanContext = {
      results: [],
      maxDepth,
      earlyExit,
      limit,
      shouldStop: false,
    };

    this.walkDirectory(rootPath, 0, context, ignorePatterns, extensionSet);
    return context.results;
  }

  findFirst(
    rootPath: string,
    options: ScanOptions = {},
  ): ScanResult | undefined {
    const results = this.scan(rootPath, {
      ...options,
      earlyExit: true,
      limit: 1,
    });
    return results[0];
  }

  private walkDirectory(
    dirPath: string,
    depth: number,
    context: ScanContext,
    ignorePatterns: string[],
    extensionSet: Set<string>,
  ): void {
    if (depth > context.maxDepth || context.shouldStop) return;

    const entries = this.readDirectorySafe(dirPath);
    if (!entries) return;

    this.processEntries(
      entries,
      dirPath,
      depth,
      context,
      ignorePatterns,
      extensionSet,
    );
  }

  private processEntries(
    entries: string[],
    dirPath: string,
    depth: number,
    context: ScanContext,
    ignorePatterns: string[],
    extensionSet: Set<string>,
  ): void {
    for (const entry of entries) {
      if (context.shouldStop) break;

      if (this.shouldIgnore(entry, ignorePatterns)) continue;

      const fullPath = join(dirPath, entry);
      this.processEntry(
        fullPath,
        entry,
        depth,
        context,
        ignorePatterns,
        extensionSet,
      );
    }
  }

  private processEntry(
    fullPath: string,
    name: string,
    depth: number,
    context: ScanContext,
    ignorePatterns: string[],
    extensionSet: Set<string>,
  ): void {
    const stats = this.getStatsSafe(fullPath);
    if (!stats) return;

    if (stats.isDirectory()) {
      this.walkDirectory(
        fullPath,
        depth + 1,
        context,
        ignorePatterns,
        extensionSet,
      );
      return;
    }

    if (stats.isFile()) {
      this.processFile(fullPath, name, context, extensionSet);
    }
  }

  private processFile(
    fullPath: string,
    name: string,
    context: ScanContext,
    extensionSet: Set<string>,
  ): void {
    const ext = extname(name);
    if (!extensionSet.has(ext)) return;

    context.results.push({
      path: fullPath,
      type: "file",
      extension: ext,
    });

    if (
      context.earlyExit ||
      (context.limit && context.results.length >= context.limit)
    ) {
      context.shouldStop = true;
    }
  }

  private readDirectorySafe(dirPath: string): string[] | null {
    try {
      return readdirSync(dirPath);
    } catch {
      return null;
    }
  }

  private getStatsSafe(path: string): ReturnType<typeof statSync> | null {
    try {
      return statSync(path);
    } catch {
      return null;
    }
  }

  private shouldIgnore(name: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      const isExactMatch = name === pattern;
      const isDirectoryMatch = name.startsWith(pattern + "/");

      if (isExactMatch || isDirectoryMatch) {
        return true;
      }

      if (!pattern.includes("*")) {
        continue;
      }

      const matchesGlob = this.simpleGlobMatch(name, pattern);
      if (matchesGlob) {
        return true;
      }
    }
    return false;
  }

  private simpleGlobMatch(str: string, pattern: string): boolean {
    if (pattern === "*") return true;
    if (pattern.startsWith("*.")) return str.endsWith(pattern.slice(1));
    if (pattern.endsWith("*")) return str.startsWith(pattern.slice(0, -1));
    if (pattern.startsWith("*")) return str.endsWith(pattern.slice(1));
    return false;
  }
}
