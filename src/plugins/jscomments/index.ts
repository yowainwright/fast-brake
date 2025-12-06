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
  blankContent: boolean = false,
): { result: string; index: number } {
  const chars: string[] = [quote];
  let index = i + 1;
  const len = code.length;

  while (index < len) {
    const ch = code[index];
    const isEscape = ch === "\\";

    if (isEscape) {
      index++;
      const hasNext = index < len;
      if (!hasNext) continue;

      const next = code[index];
      const isEscapedNewline = next === "\n";

      if (blankContent) {
        chars.push(isEscapedNewline ? "\n" : " ");
      } else {
        chars.push(ch, next);
      }
      index++;
      continue;
    }

    const isClosingQuote = ch === quote;
    if (isClosingQuote) {
      chars.push(quote);
      index++;
      break;
    }

    if (blankContent) {
      const isNewline = ch === "\n";
      chars.push(isNewline ? "\n" : " ");
    } else {
      chars.push(ch);
    }
    index++;
  }

  return { result: chars.join(""), index };
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
  const chars: string[] = ["/"];
  let index = i + 1;
  const len = code.length;

  while (index < len) {
    const ch = code[index];
    chars.push(ch);

    const isEscape = ch === "\\";
    if (isEscape) {
      index++;
      const hasNext = index < len;
      if (hasNext) {
        chars.push(code[index]);
        index++;
      }
      continue;
    }

    const isRegexEnd = ch === "/";
    if (isRegexEnd) {
      index++;
      while (index < len && isRegexFlag(code[index])) {
        chars.push(code[index]);
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

  return { result: chars.join(""), index };
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

export function stripComments(
  code: string,
  blankStrings: boolean = false,
): string {
  const chars: string[] = [];
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
      chars.push("\n");
      i = newlineIndex + 1;
      continue;
    }

    const isBlockComment = char === "/" && nextChar === "*";
    if (isBlockComment) {
      const endIndex = code.indexOf("*/", i + 2);
      const hasEnd = endIndex !== -1;
      if (!hasEnd) break;
      const comment = code.substring(i, endIndex + 2);
      const newlineCount = countNewlines(comment);
      for (let n = 0; n < newlineCount; n++) {
        chars.push("\n");
      }
      i = endIndex + 2;
      continue;
    }

    const isQuote = char === '"' || char === "'";
    if (isQuote) {
      const skip = skipString(code, i, char, blankStrings);
      chars.push(skip.result);
      i = skip.index;
      continue;
    }

    const isBacktick = char === "`";
    if (isBacktick) {
      const skip = skipString(code, i, "`", blankStrings);
      chars.push(skip.result);
      i = skip.index;
      continue;
    }

    const isSlash = char === "/";
    const isRegex = isSlash && isRegexContext(code, i);
    if (isRegex) {
      const skip = skipRegex(code, i);
      chars.push(skip.result);
      i = skip.index;
      continue;
    }

    chars.push(char);
    i++;
  }

  return chars.join("");
}

export function stripCommentsAndStrings(code: string): string {
  return stripComments(code, true);
}

/**
 * Preprocessor function for stripping JavaScript comments
 * Use with DetectionOptions.preprocessors
 */
export function jscommentsPreprocessor(code: string): string {
  return stripComments(code);
}

/**
 * Preprocessor function that strips both comments AND string contents
 * This prevents false positives from patterns inside strings
 * Use this to fix issues like:
 * - "image_123" triggering numeric separator detection
 * - "**" triggering exponentiation detection
 * - "?." inside strings triggering optional chaining detection
 */
export function safePreprocessor(code: string): string {
  return stripCommentsAndStrings(code);
}

export default jscommentsPreprocessor;
