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

export const BUILT_IN_VALIDATORS: Record<ValidatorName, BrakeValidator> = {
  exclude: excludeValidator,
  context: contextValidator,
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
