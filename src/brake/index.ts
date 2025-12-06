import type { DetectionMatch } from "../types";
import type { BrakeStage, BrakeConfig } from "./types";
import { BRAKE_PRESETS } from "./constants";
import { resolveValidator, getContext } from "./validators";

export function resolveBrakeConfig(config: BrakeConfig): BrakeStage[] {
  const isPresetName = typeof config === "string";
  if (isPresetName) {
    return BRAKE_PRESETS[config];
  }
  return config;
}

function validateStage(
  stage: BrakeStage,
  context: string,
  match: DetectionMatch,
  code: string,
  excludes: string[],
): boolean {
  return stage.validators.every((validatorRef) => {
    const validator = resolveValidator(validatorRef);
    return validator.validate({ context, match, code, excludes });
  });
}

export function runBrakePipeline(
  stages: BrakeStage[],
  match: DetectionMatch,
  code: string,
  excludes: string[],
): boolean {
  const matchIndex = match.index ?? 0;

  return stages.every((stage) => {
    const context = getContext(code, matchIndex, stage.chars);
    return validateStage(stage, context, match, code, excludes);
  });
}

export * from "./types";
export * from "./constants";
export * from "./validators";
