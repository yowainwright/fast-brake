import type { Plugin } from "../../types";
import telemetrySchema from "./schema.json";

export const telemetryPlugin: Plugin = telemetrySchema as Plugin;

export const strictTelemetryPlugin: Plugin = {
  name: "telemetry-strict",
  description: "Strict telemetry detection (all as errors)",
  spec: {
    orderedRules: ["error"],
    matches: Object.entries(telemetrySchema.spec.matches).reduce(
      (acc, [key, match]) => {
        acc[key] = { ...match, rule: "error" };
        return acc;
      },
      {} as any,
    ),
  },
};

export const noTelemetryPlugin = strictTelemetryPlugin;

export default telemetryPlugin;
