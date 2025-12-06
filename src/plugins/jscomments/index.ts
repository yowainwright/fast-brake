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

interface StripState {
  code: string;
  index: number;
  copyStart: number;
  parts: string[];
}

function handleLineComment(state: StripState): boolean {
  const { code, index } = state;
  const char = code[index];
  const nextChar = code[index + 1];
  const isLineComment = char === "/" && nextChar === "/";
  if (!isLineComment) return false;

  state.parts.push(code.substring(state.copyStart, index));

  const newlineIndex = code.indexOf("\n", index);
  const hasNewline = newlineIndex !== -1;
  if (!hasNewline) {
    state.index = code.length;
    state.copyStart = code.length;
    return true;
  }

  state.parts.push("\n");
  state.index = newlineIndex + 1;
  state.copyStart = state.index;
  return true;
}

function handleBlockComment(state: StripState): boolean {
  const { code, index } = state;
  const char = code[index];
  const nextChar = code[index + 1];
  const isBlockComment = char === "/" && nextChar === "*";
  if (!isBlockComment) return false;

  state.parts.push(code.substring(state.copyStart, index));

  const endIndex = code.indexOf("*/", index + 2);
  const hasEnd = endIndex !== -1;
  if (!hasEnd) {
    state.index = code.length;
    state.copyStart = code.length;
    return true;
  }

  const comment = code.substring(index, endIndex + 2);
  const newlineCount = countNewlines(comment);
  for (let n = 0; n < newlineCount; n++) {
    state.parts.push("\n");
  }

  state.index = endIndex + 2;
  state.copyStart = state.index;
  return true;
}

function findStringEnd(code: string, start: number, quote: string): number {
  let i = start + 1;
  const len = code.length;

  while (i < len) {
    const ch = code[i];
    const isEscape = ch === "\\";
    if (isEscape) {
      i += 2;
      continue;
    }

    const isClosingQuote = ch === quote;
    if (isClosingQuote) {
      return i + 1;
    }

    i++;
  }

  return len;
}

function handleStringPreserve(state: StripState, quote: string): void {
  const endIndex = findStringEnd(state.code, state.index, quote);
  state.index = endIndex;
}

function handleStringBlank(state: StripState, quote: string): void {
  state.parts.push(state.code.substring(state.copyStart, state.index));

  const blanked = blankStringContents(state.code, state.index, quote);
  state.parts.push(blanked.result);
  state.index = blanked.endIndex;
  state.copyStart = state.index;
}

export function blankChar(ch: string): string {
  const isNewline = ch === "\n";
  return isNewline ? "\n" : " ";
}

export function handleEscapeInBlank(
  code: string,
  index: number,
  parts: string[],
): number {
  const nextIndex = index + 1;
  const hasNext = nextIndex < code.length;
  if (!hasNext) return nextIndex;

  const next = code[nextIndex];
  parts.push(blankChar(next));
  return nextIndex + 1;
}

export function blankStringContents(
  code: string,
  start: number,
  quote: string,
): { result: string; endIndex: number } {
  const parts: string[] = [quote];
  let i = start + 1;
  const len = code.length;

  while (i < len) {
    const ch = code[i];
    const isEscape = ch === "\\";

    if (isEscape) {
      i = handleEscapeInBlank(code, i, parts);
      continue;
    }

    const isClosingQuote = ch === quote;
    if (isClosingQuote) {
      parts.push(quote);
      return { result: parts.join(""), endIndex: i + 1 };
    }

    parts.push(blankChar(ch));
    i++;
  }

  return { result: parts.join(""), endIndex: len };
}

function handleQuote(state: StripState, blankStrings: boolean): boolean {
  const char = state.code[state.index];
  const isQuote = char === '"' || char === "'" || char === "`";
  if (!isQuote) return false;

  if (blankStrings) {
    handleStringBlank(state, char);
  } else {
    handleStringPreserve(state, char);
  }

  return true;
}

function findRegexEnd(code: string, start: number): number {
  let i = start + 1;
  const len = code.length;

  while (i < len) {
    const ch = code[i];
    const isEscape = ch === "\\";

    if (isEscape) {
      i += 2;
      continue;
    }

    const isRegexEnd = ch === "/";
    if (isRegexEnd) {
      i++;
      while (i < len && isRegexFlag(code[i])) {
        i++;
      }
      return i;
    }

    const isNewline = ch === "\n";
    if (isNewline) {
      return i + 1;
    }

    i++;
  }

  return len;
}

function handleRegex(state: StripState): boolean {
  const { code, index } = state;
  const char = code[index];
  const isSlash = char === "/";
  if (!isSlash) return false;

  const isRegex = isRegexContext(code, index);
  if (!isRegex) return false;

  state.index = findRegexEnd(code, index);
  return true;
}

export function stripComments(
  code: string,
  blankStrings: boolean = false,
): string {
  const state: StripState = {
    code,
    index: 0,
    copyStart: 0,
    parts: [],
  };

  while (state.index < code.length) {
    const handledLineComment = handleLineComment(state);
    if (handledLineComment) continue;

    const handledBlockComment = handleBlockComment(state);
    if (handledBlockComment) continue;

    const handledQuote = handleQuote(state, blankStrings);
    if (handledQuote) continue;

    const handledRegex = handleRegex(state);
    if (handledRegex) continue;

    state.index++;
  }

  state.parts.push(code.substring(state.copyStart));
  return state.parts.join("");
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
