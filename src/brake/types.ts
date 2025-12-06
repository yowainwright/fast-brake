import type { DetectionMatch } from "../types";

export type BrakeChars = number | "line" | "full";

export type ValidatorName = "exclude" | "context";

export interface ValidatorContext {
  context: string;
  match?: DetectionMatch;
  code?: string;
  excludes?: string[];
}

export interface BrakeValidator {
  name: string;
  validate: (ctx: ValidatorContext) => boolean;
}

export type ValidatorRef = ValidatorName | BrakeValidator;

export interface BrakeStage {
  chars: BrakeChars;
  validators: ValidatorRef[];
}

export type BrakePresetName = "brakeFastReckless" | "fast" | "balanced" | "accurate";

export type BrakeConfig = BrakePresetName | BrakeStage[];
