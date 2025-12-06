import type { BrakeStage, BrakePresetName } from "./types";

export const BRAKE_FAST_RECKLESS: BrakeStage[] = [
  { chars: 0, validators: ["exclude"] },
];

export const BRAKE_FAST: BrakeStage[] = [
  { chars: 50, validators: ["exclude"] },
];

export const BRAKE_BALANCED: BrakeStage[] = [
  { chars: 50, validators: ["exclude"] },
  { chars: 100, validators: ["exclude", "context"] },
];

export const BRAKE_ACCURATE: BrakeStage[] = [
  { chars: 50, validators: ["exclude"] },
  { chars: 100, validators: ["exclude", "context"] },
  { chars: "line", validators: ["exclude", "context"] },
];

export const BRAKE_PRESETS: Record<BrakePresetName, BrakeStage[]> = {
  brakeFastReckless: BRAKE_FAST_RECKLESS,
  fast: BRAKE_FAST,
  balanced: BRAKE_BALANCED,
  accurate: BRAKE_ACCURATE,
};

export const DEFAULT_BRAKE_PRESET: BrakePresetName = "balanced";
