import { Plugin } from "../types";
import { TELEMETRY_PATTERNS } from "./constants";

export const telemetryPlugin: Plugin = {
  name: "telemetry",
  patterns: TELEMETRY_PATTERNS,
};

export const strictTelemetryPlugin: Plugin = {
  name: "telemetry-strict",
  patterns: TELEMETRY_PATTERNS.map((p) => ({
    ...p,
    severity: "error" as const,
  })),
};

export const noTelemetryPlugin = strictTelemetryPlugin;

export { TELEMETRY_PATTERNS } from "./constants";
