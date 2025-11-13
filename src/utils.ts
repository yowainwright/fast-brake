const regexCache = new Map<string, RegExp>();
const MAX_CACHE_SIZE = 50;

export function getCachedRegex(pattern: string, flags: string = ""): RegExp {
  const key = `${pattern}:::${flags}`;

  if (!regexCache.has(key)) {
    const regex = new RegExp(pattern, flags);
    regexCache.set(key, regex);

    if (regexCache.size > MAX_CACHE_SIZE) {
      const firstKey = regexCache.keys().next().value;
      if (firstKey !== undefined) regexCache.delete(firstKey);
    }
  }

  const regex = regexCache.get(key)!;
  regex.lastIndex = 0;
  return regex;
}
