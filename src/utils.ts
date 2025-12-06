const MAX_CACHE_SIZE = 100;

class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value === undefined) return undefined;

    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

const regexCache = new LRUCache<string, RegExp>(MAX_CACHE_SIZE);

export function getCachedRegex(pattern: string, flags: string = ""): RegExp {
  const key = `${pattern}:::${flags}`;

  const cached = regexCache.get(key);
  if (cached) {
    cached.lastIndex = 0;
    return cached;
  }

  const regex = new RegExp(pattern, flags);
  regexCache.set(key, regex);
  return regex;
}

const ZERO_WIDTH_CHARS_PATTERN = /[\u200B\u200C\u200D\uFEFF\u00AD]/g;
const ZERO_WIDTH_CHARS_TEST = /[\u200B\u200C\u200D\uFEFF\u00AD]/;

export function normalizeZeroWidth(code: string): string {
  const hasZeroWidth = ZERO_WIDTH_CHARS_TEST.test(code);
  if (!hasZeroWidth) return code;

  ZERO_WIDTH_CHARS_PATTERN.lastIndex = 0;
  return code.replace(ZERO_WIDTH_CHARS_PATTERN, "");
}

export function clearRegexCache(): void {
  regexCache.clear();
}
