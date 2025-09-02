import { THROW_PATTERNS } from "./constants";
import { ThrowInfo, ExtensionInput, ExtensionOutput } from "./types";

function extractErrorType(match: string): string | undefined {
  const errorMatch = match.match(THROW_PATTERNS.ERROR_CONSTRUCTOR);
  return errorMatch ? errorMatch[1] : undefined;
}

function extractErrorMessage(match: string): string | undefined {
  const messageMatch = match.match(THROW_PATTERNS.ERROR_MESSAGE);
  return messageMatch ? messageMatch[1] : undefined;
}

function determineThrowType(
  match: string,
  code: string,
  index: number,
): string {
  const hasPromiseReject = THROW_PATTERNS.PROMISE_REJECT.test(match);
  const hasErrorConstructor = THROW_PATTERNS.ERROR_CONSTRUCTOR.test(match);
  const hasNewError = THROW_PATTERNS.NEW_ERROR_CHECK.test(match);

  if (hasPromiseReject) {
    return "promise-rejection";
  }

  const beforeMatch = code.substring(Math.max(0, index - 100), index);
  const isInCatchContext = THROW_PATTERNS.CATCH_CONTEXT.test(beforeMatch);

  if (isInCatchContext && !hasNewError) {
    return "error-rethrow";
  }

  const hasIfInMatch = match.includes("if") && match.includes("throw");
  if (hasIfInMatch) {
    return "conditional-throw";
  }

  if (hasErrorConstructor) {
    return "error-throw";
  }

  return "throw-statement";
}

function isInTryCatch(code: string, index: number): boolean {
  const beforeMatch = code.substring(0, index);

  const lastTry = beforeMatch.lastIndexOf("try");
  if (lastTry === -1) return false;

  const lastCatch = beforeMatch.lastIndexOf("catch");
  const hasCatchAfterTry = lastCatch > lastTry;

  const openBraces = (beforeMatch.substring(lastTry).match(/\{/g) || []).length;
  const closeBraces = (beforeMatch.substring(lastTry).match(/\}/g) || [])
    .length;
  const isInsideTryBlock = openBraces > closeBraces;

  return isInsideTryBlock || hasCatchAfterTry;
}

function isAsync(code: string, index: number): boolean {
  const beforeMatch = code.substring(0, index);

  const lastAsync = beforeMatch.lastIndexOf("async");
  if (lastAsync === -1) return false;

  const lastFunction = beforeMatch.lastIndexOf("function", index);
  const lastArrow = beforeMatch.lastIndexOf("=>", index);
  const lastFunctionDef = Math.max(lastFunction, lastArrow);

  const isAsyncNearFunction =
    lastAsync > lastFunctionDef - 20 && lastAsync < index;

  return isAsyncNearFunction;
}

function processThrowExtension(input: ExtensionInput): ExtensionOutput {
  const { code, result } = input;
  const { match, index = 0 } = result;

  const throwInfo: ThrowInfo = {
    type: determineThrowType(match, code, index),
    errorType: extractErrorType(match),
    message: extractErrorMessage(match),
    isAsync: isAsync(code, index),
    isCaught: isInTryCatch(code, index),
  };

  return {
    ...result,
    spec: {
      ...result.spec,
      throw: throwInfo,
    },
  };
}

export const throwExtension = {
  name: "throw",
  description: "Analyzes throw statements and error handling patterns in code",
  spec: {
    code: "throw new Error('Invalid operation');",
    result: {
      name: "throw-statement",
      match: "throw new Error('Invalid operation')",
      spec: {
        throw: {
          type: "error-throw",
          errorType: "Error",
          message: "Invalid operation",
          isAsync: false,
          isCaught: false,
        },
      },
      rule: "throw-statement-pattern",
      index: 0,
    },
  },
  process: processThrowExtension,
};
