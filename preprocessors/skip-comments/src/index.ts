/**
 * @fast-brake/skip-comments
 *
 * Fast detection of whether a position in JavaScript code is inside
 * a comment or string literal - without preprocessing the entire file.
 *
 * This is significantly faster than stripping comments/strings when
 * you only need to check a few positions (e.g., validating regex matches).
 */

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

/**
 * Checks if the given index is inside any type of comment (line or block).
 *
 * @param code - The full source code
 * @param index - The position to check
 * @returns true if the position is inside a comment
 *
 * @example
 * ```ts
 * const code = '// this is a comment\nconst x = 1;';
 * isInsideComment(code, 5);  // true (inside // comment)
 * isInsideComment(code, 25); // false (inside code)
 * ```
 */
export function isInsideComment(code: string, index: number): boolean {
  const context = getContextAtIndex(code, index);
  return context === "comment";
}

/**
 * Checks if the given index is inside a string literal (single, double, or template).
 *
 * @param code - The full source code
 * @param index - The position to check
 * @returns true if the position is inside a string literal
 *
 * @example
 * ```ts
 * const code = 'const x = "hello => world";';
 * isInsideString(code, 15); // true (inside string)
 * isInsideString(code, 5);  // false (inside code)
 * ```
 */
export function isInsideString(code: string, index: number): boolean {
  const context = getContextAtIndex(code, index);
  return context === "string";
}

/**
 * Checks if the given index is inside either a comment or a string literal.
 * This is a convenience function that combines both checks.
 *
 * @param code - The full source code
 * @param index - The position to check
 * @returns true if the position is inside a comment or string
 *
 * @example
 * ```ts
 * const code = '// comment\nconst x = "string";';
 * isInsideCommentOrString(code, 5);  // true (comment)
 * isInsideCommentOrString(code, 22); // true (string)
 * isInsideCommentOrString(code, 15); // false (code)
 * ```
 */
export function isInsideCommentOrString(code: string, index: number): boolean {
  return isInsideComment(code, index) || isInsideString(code, index);
}

/**
 * Result of checking a match position.
 */
export interface SkipCheckResult {
  /** Whether the position should be skipped (is inside comment or string) */
  skip: boolean;
  /** Reason for skipping, if applicable */
  reason?: "comment" | "string";
}

/**
 * Checks if a match at the given index should be skipped because it's
 * inside a comment or string literal. Returns detailed information.
 *
 * Uses a state machine that properly handles the interaction between
 * comments and strings (e.g., // inside a string is not a comment,
 * and " inside a comment is not a string start).
 *
 * @param code - The full source code
 * @param index - The position to check
 * @returns Object with skip status and reason
 *
 * @example
 * ```ts
 * const code = '// arrow => function\nconst fn = () => {};';
 * const result = shouldSkipMatch(code, 10);
 * // { skip: true, reason: 'comment' }
 * ```
 */
export function shouldSkipMatch(code: string, index: number): SkipCheckResult {
  const context = getContextAtIndex(code, index);

  if (context === "string") {
    return { skip: true, reason: "string" };
  }

  if (context === "comment") {
    return { skip: true, reason: "comment" };
  }

  return { skip: false };
}
