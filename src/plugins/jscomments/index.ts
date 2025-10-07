export function isWhitespace(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

export function findPrevNonSpace(code: string, index: number): number {
  for (let i = index; i >= 0; i--) {
    const ch = code[i];
    const isSpace = isWhitespace(ch);
    if (!isSpace) return i;
  }
  return -1;
}

export function isWordChar(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_" ||
    ch === "$"
  );
}

export function isReturnKeyword(code: string, index: number): boolean {
  const tooShort = index < 5;
  if (tooShort) return false;

  const slice = code.substring(index - 5, index + 1);
  const matchesReturn = slice === "return";
  if (!matchesReturn) return false;

  const atStart = index === 5;
  if (atStart) return true;

  const prevChar = code[index - 6];
  const hasWordBoundary = !isWordChar(prevChar);
  return hasWordBoundary;
}

export function skipString(
  code: string,
  i: number,
  quote: string,
): { result: string; index: number } {
  let result = quote;
  let index = i + 1;
  const len = code.length;

  while (index < len) {
    const ch = code[index];
    result += ch;

    const isEscape = ch === "\\";
    if (isEscape) {
      index++;
      const hasNext = index < len;
      if (hasNext) {
        result += code[index];
        index++;
      }
      continue;
    }

    const isClosingQuote = ch === quote;
    if (isClosingQuote) {
      index++;
      break;
    }

    index++;
  }

  return { result, index };
}

export function isRegexFlag(ch: string): boolean {
  return (
    ch === "g" ||
    ch === "i" ||
    ch === "m" ||
    ch === "s" ||
    ch === "u" ||
    ch === "y"
  );
}

export function skipRegex(
  code: string,
  i: number,
): { result: string; index: number } {
  let result = "/";
  let index = i + 1;
  const len = code.length;

  while (index < len) {
    const ch = code[index];
    result += ch;

    const isEscape = ch === "\\";
    if (isEscape) {
      index++;
      const hasNext = index < len;
      if (hasNext) {
        result += code[index];
        index++;
      }
      continue;
    }

    const isRegexEnd = ch === "/";
    if (isRegexEnd) {
      index++;
      while (index < len && isRegexFlag(code[index])) {
        result += code[index];
        index++;
      }
      break;
    }

    const isNewline = ch === "\n";
    if (isNewline) {
      index++;
      break;
    }

    index++;
  }

  return { result, index };
}

export function isRegexContext(code: string, i: number): boolean {
  const atStart = i === 0;
  if (atStart) return true;

  const prevNonSpace = findPrevNonSpace(code, i - 1);
  const noPrevChar = prevNonSpace === -1;
  if (noPrevChar) return true;

  const prevChar = code[prevNonSpace];
  const isRegexPrecedingChar = "=([{:;!&|?+-%,".includes(prevChar);
  const isAfterReturn = isReturnKeyword(code, prevNonSpace);

  return isRegexPrecedingChar || isAfterReturn;
}

export function countNewlines(text: string): number {
  const parts = text.split("\n");
  return parts.length - 1;
}

export function stripComments(code: string): string {
  let result = "";
  let i = 0;
  const len = code.length;

  while (i < len) {
    const char = code[i];
    const nextChar = code[i + 1];

    const isLineComment = char === "/" && nextChar === "/";
    if (isLineComment) {
      const newlineIndex = code.indexOf("\n", i);
      const hasNewline = newlineIndex !== -1;
      if (!hasNewline) break;
      result += "\n";
      i = newlineIndex + 1;
      continue;
    }

    const isBlockComment = char === "/" && nextChar === "*";
    if (isBlockComment) {
      const endIndex = code.indexOf("*/", i + 2);
      const hasEnd = endIndex !== -1;
      if (!hasEnd) break;
      const comment = code.substring(i, endIndex + 2);
      result += "\n".repeat(countNewlines(comment));
      i = endIndex + 2;
      continue;
    }

    const isQuote = char === '"' || char === "'";
    if (isQuote) {
      const skip = skipString(code, i, char);
      result += skip.result;
      i = skip.index;
      continue;
    }

    const isBacktick = char === "`";
    if (isBacktick) {
      const skip = skipString(code, i, "`");
      result += skip.result;
      i = skip.index;
      continue;
    }

    const isSlash = char === "/";
    const isRegex = isSlash && isRegexContext(code, i);
    if (isRegex) {
      const skip = skipRegex(code, i);
      result += skip.result;
      i = skip.index;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

/**
 * Preprocessor function for stripping JavaScript comments
 * Use with DetectionOptions.preprocessors
 */
export function jscommentsPreprocessor(code: string): string {
  return stripComments(code);
}

export default jscommentsPreprocessor;
