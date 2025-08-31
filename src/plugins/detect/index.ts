import type { Plugin } from "../../types";
import detectSchema from "./schema.json";

export const detectPlugin: Plugin = {
  name: "es-detect",
  description:
    "Detects minimum ES version required by checking from newest to oldest",
  spec: {
    orderedRules: [...detectSchema.spec.orderedRules].reverse(),
    matches: detectSchema.spec.matches,
  },
};

export const detect = detectPlugin;
export const esDetect = detectPlugin;

export default detectPlugin;
