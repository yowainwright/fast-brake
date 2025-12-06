import type { Extension, ExtensionInput, ExtensionOutput } from "fast-brake";
import { parse, type Options as AcornOptions } from "acorn";

export interface AcornExtensionOptions {
  ecmaVersion?: AcornOptions["ecmaVersion"];
  sourceType?: AcornOptions["sourceType"];
}

const DEFAULT_OPTIONS: AcornExtensionOptions = {
  ecmaVersion: "latest",
  sourceType: "module",
};

function validateWithAcorn(
  code: string,
  matchIndex: number,
  options: AcornExtensionOptions,
): boolean {
  try {
    parse(code, {
      ecmaVersion: options.ecmaVersion ?? "latest",
      sourceType: options.sourceType ?? "module",
      locations: true,
    });
    return true;
  } catch {
    return false;
  }
}

function process(input: ExtensionInput): ExtensionOutput {
  const { code, result } = input;
  const matchIndex = result.index ?? 0;

  const isValid = validateWithAcorn(code, matchIndex, DEFAULT_OPTIONS);

  return {
    ...result,
    spec: {
      ...result.spec,
      astValidated: isValid,
    },
  };
}

export const acornExtension: Extension = {
  name: "fast-brake-acorn",
  description: "AST validation extension using acorn parser",
  process,
};

export function createAcornExtension(
  options: AcornExtensionOptions = {},
): Extension {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  return {
    name: "fast-brake-acorn",
    description: "AST validation extension using acorn parser",
    process: (input: ExtensionInput): ExtensionOutput => {
      const { code, result } = input;
      const matchIndex = result.index ?? 0;

      const isValid = validateWithAcorn(code, matchIndex, mergedOptions);

      return {
        ...result,
        spec: {
          ...result.spec,
          astValidated: isValid,
        },
      };
    },
  };
}

export default acornExtension;
