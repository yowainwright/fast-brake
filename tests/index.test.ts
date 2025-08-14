import { describe, it, expect } from "bun:test";
import { LOG_PREFIX } from "../src/constants";

describe("Brakefast", () => {
  it("should have the correct log prefix", () => {
    expect(LOG_PREFIX).toBe("🚀 ⚡ Brakefast:");
  });

  it("should be a placeholder test", () => {
    expect(true).toBe(true);
  });
});
