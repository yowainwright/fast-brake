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
    const shouldTerminate = this.checkTermination(depth, context);
    if (shouldTerminate) {
      return;
    }

    const entries = this.readDirectorySafe(dirPath);
    if (!entries) {
      return;
    }

    this.processEntries(
      entries,
      dirPath,
      depth,
      context,
      ignorePatterns,
      extensionSet,
    );
  }

  private checkTermination(depth: number, context: ScanContext): boolean {
    return depth > context.maxDepth || context.shouldStop;
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
      if (context.shouldStop) {
        break;
      }

      const shouldProcess = this.shouldProcessEntry(entry, ignorePatterns);
      if (!shouldProcess) {
        continue;
      }

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

  private shouldProcessEntry(entry: string, ignorePatterns: string[]): boolean {
    return !this.shouldIgnore(entry, ignorePatterns);
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
    if (!stats) {
      return;
    }

    const isDirectory = stats.isDirectory();
    if (isDirectory) {
      this.walkDirectory(
        fullPath,
        depth + 1,
        context,
        ignorePatterns,
        extensionSet,
      );
      return;
    }

    const isFile = stats.isFile();
    if (!isFile) {
      return;
    }

    this.processFile(fullPath, name, context, extensionSet);
  }

  private processFile(
    fullPath: string,
    name: string,
    context: ScanContext,
    extensionSet: Set<string>,
  ): void {
    const ext = extname(name);
    const hasValidExtension = extensionSet.has(ext);

    if (!hasValidExtension) {
      return;
    }

    this.addResult(fullPath, ext, context);
    this.checkStopConditions(context);
  }

  private addResult(fullPath: string, ext: string, context: ScanContext): void {
    const newResult: ScanResult = {
      path: fullPath,
      type: "file",
      extension: ext,
    };

    context.results.push(newResult);
  }

  private checkStopConditions(context: ScanContext): void {
    const limitReached =
      context.limit && context.results.length >= context.limit;
    const shouldStop = context.earlyExit || limitReached;

    if (shouldStop) {
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

      const hasWildcard = pattern.includes("*");
      if (!hasWildcard) {
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
    const isWildcardOnly = pattern === "*";
    if (isWildcardOnly) {
      return true;
    }

    const isExtensionPattern = pattern.startsWith("*.");
    if (isExtensionPattern) {
      const ext = pattern.slice(1);
      return str.endsWith(ext);
    }

    const isPrefixPattern = pattern.endsWith("*");
    if (isPrefixPattern) {
      const prefix = pattern.slice(0, -1);
      return str.startsWith(prefix);
    }

    const isSuffixPattern = pattern.startsWith("*");
    if (isSuffixPattern) {
      const suffix = pattern.slice(1);
      return str.endsWith(suffix);
    }

    return false;
  }
}
