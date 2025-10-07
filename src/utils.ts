const regexCache = new Map<string, RegExp>();
const MAX_CACHE_SIZE = 50;

export function getCachedRegex(pattern: string, flags: string = ""): RegExp {
  const key = `${pattern}:::${flags}`;
  const hasKey = regexCache.has(key);

  if (!hasKey) {
    const regex = new RegExp(pattern, flags);
    regexCache.set(key, regex);

    const exceedsMaxSize = regexCache.size > MAX_CACHE_SIZE;
    if (exceedsMaxSize) {
      const firstKey = regexCache.keys().next().value;
      const hasFirstKey = firstKey !== undefined;
      if (hasFirstKey) regexCache.delete(firstKey);
    }
  }

  const regex = regexCache.get(key)!;
  regex.lastIndex = 0;
  return regex;
}

export function fastIndexOf(
  text: string,
  pattern: string,
  startIndex: number = 0,
): number {
  return text.indexOf(pattern, startIndex);
}
