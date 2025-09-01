const regexCache = new Map<string, RegExp>();
const MAX_CACHE_SIZE = 50;

export function getCachedRegex(pattern: string, flags: string = ""): RegExp {
  const key = `${pattern}:::${flags}`;

  if (!regexCache.has(key)) {
    const regex = new RegExp(pattern, flags);
    regexCache.set(key, regex);

    if (regexCache.size > MAX_CACHE_SIZE) {
      const firstKey = regexCache.keys().next().value;
      if (firstKey) regexCache.delete(firstKey);
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
  if (pattern.length === 0) return 0;
  if (pattern.length <= 10) {
    return text.indexOf(pattern, startIndex);
  }

  if (startIndex > 0) {
    const result = fastIndexOf(text.slice(startIndex), pattern, 0);
    return result === -1 ? -1 : startIndex + result;
  }

  const badCharTable = new Map<string, number>();
  const patternLength = pattern.length;

  for (let i = 0; i < patternLength - 1; i++) {
    badCharTable.set(pattern[i], patternLength - 1 - i);
  }

  let shift = 0;
  const textLength = text.length;

  while (shift <= textLength - patternLength) {
    let j = patternLength - 1;

    while (j >= 0 && pattern[j] === text[shift + j]) {
      j--;
    }

    if (j < 0) {
      return shift;
    }

    const badChar = text[shift + j];
    const badCharShift = badCharTable.get(badChar) || patternLength;
    shift += Math.max(1, j - patternLength + 1 + badCharShift);
  }

  return -1;
}

export function findAllIndices(text: string, pattern: string): number[] {
  if (pattern.length === 0) return [];

  const indices: number[] = [];
  let index = fastIndexOf(text, pattern);

  while (index !== -1) {
    indices.push(index);
    index = fastIndexOf(text, pattern, index + pattern.length);
  }

  return indices;
}
