import type { BrakeValidator, ValidatorName, ValidatorRef } from "./types";

export const excludeValidator: BrakeValidator = {
  name: "exclude",
  validate: ({ context, excludes }) => {
    if (!excludes) return true;
    return !excludes.some((ex) => context.includes(ex));
  },
};

export const contextValidator: BrakeValidator = {
  name: "context",
  validate: ({ context, match }) => {
    if (!match) return true;
    return context.includes(match.match);
  },
};

type ContextType = "code" | "string" | "comment";

/**
 * Scans code up to the given index and determines what context it's in.
 * Properly handles the interaction between comments and strings.
 */
function getContextAtIndex(code: string, index: number): ContextType {
  const searchStart = Math.max(0, index - 5000);
  const beforeMatch = code.substring(searchStart, index);

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let i = 0;

  while (i < beforeMatch.length) {
    const ch = beforeMatch[i];
    const next = i < beforeMatch.length - 1 ? beforeMatch[i + 1] : "";

    if (inLineComment) {
      const isNewline = ch === "\n";
      if (isNewline) {
        inLineComment = false;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      const isBlockEnd = ch === "*" && next === "/";
      if (isBlockEnd) {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    const inString = inSingleQuote || inDoubleQuote || inTemplate;
    const isEscape = ch === "\\";
    if (inString && isEscape) {
      i += 2;
      continue;
    }

    const notInComment = !inBlockComment && !inLineComment;
    if (notInComment) {
      const isSingleQuote = !inDoubleQuote && !inTemplate && ch === "'";
      if (isSingleQuote) {
        inSingleQuote = !inSingleQuote;
        i++;
        continue;
      }
      const isDoubleQuote = !inSingleQuote && !inTemplate && ch === '"';
      if (isDoubleQuote) {
        inDoubleQuote = !inDoubleQuote;
        i++;
        continue;
      }
      const isBacktick = !inSingleQuote && !inDoubleQuote && ch === "`";
      if (isBacktick) {
        inTemplate = !inTemplate;
        i++;
        continue;
      }
    }

    if (!inString) {
      const isLineCommentStart = ch === "/" && next === "/";
      if (isLineCommentStart) {
        inLineComment = true;
        i += 2;
        continue;
      }
      const isBlockCommentStart = ch === "/" && next === "*";
      if (isBlockCommentStart) {
        inBlockComment = true;
        i += 2;
        continue;
      }
    }

    i++;
  }

  const inString = inSingleQuote || inDoubleQuote || inTemplate;
  if (inString) return "string";
  if (inLineComment || inBlockComment) return "comment";
  return "code";
}

export function isInsideComment(code: string, index: number): boolean {
  const context = getContextAtIndex(code, index);
  return context === "comment";
}

export const commentValidator: BrakeValidator = {
  name: "comment",
  validate: ({ code, match }) => {
    if (!match || match.index === undefined) return true;
    const insideComment = isInsideComment(code, match.index);
    return !insideComment;
  },
};

export function isInsideString(code: string, index: number): boolean {
  const context = getContextAtIndex(code, index);
  return context === "string";
}

export const stringValidator: BrakeValidator = {
  name: "string",
  validate: ({ code, match }) => {
    if (!match || match.index === undefined) return true;
    const insideString = isInsideString(code, match.index);
    return !insideString;
  },
};

export const BUILT_IN_VALIDATORS: Record<ValidatorName, BrakeValidator> = {
  exclude: excludeValidator,
  context: contextValidator,
  comment: commentValidator,
  string: stringValidator,
};

export function resolveValidator(ref: ValidatorRef): BrakeValidator {
  const isString = typeof ref === "string";
  if (isString) {
    const validator = BUILT_IN_VALIDATORS[ref];
    if (!validator) {
      throw new Error(`Unknown validator: ${ref}`);
    }
    return validator;
  }
  return ref;
}

export function getContext(
  code: string,
  index: number,
  chars: number | "line" | "full",
): string {
  const isFullContext = chars === "full";
  if (isFullContext) return code;

  const isLineContext = chars === "line";
  if (isLineContext) {
    const lineStart = code.lastIndexOf("\n", index - 1) + 1;
    const lineEnd = code.indexOf("\n", index);
    const actualEnd = lineEnd === -1 ? code.length : lineEnd;
    return code.substring(lineStart, actualEnd);
  }

  const numChars = chars as number;
  const start = Math.max(0, index - numChars);
  const end = Math.min(code.length, index + numChars);
  return code.substring(start, end);
}
