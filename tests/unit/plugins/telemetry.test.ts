import { describe, test, expect } from "bun:test";
import {
  telemetryPlugin,
  strictTelemetryPlugin,
  noTelemetryPlugin,
} from "../../../src/plugins/telemetry";

describe("Telemetry Plugin", () => {
  test("should export telemetryPlugin", () => {
    expect(telemetryPlugin).toBeDefined();
    expect(telemetryPlugin.name).toBe("telemetry");
    expect(telemetryPlugin.description).toBeDefined();
    expect(telemetryPlugin.spec).toBeDefined();
    expect(telemetryPlugin.spec.orderedRules).toBeDefined();
    expect(telemetryPlugin.spec.matches).toBeDefined();
  });

  test("should export strictTelemetryPlugin", () => {
    expect(strictTelemetryPlugin).toBeDefined();
    expect(strictTelemetryPlugin.name).toBe("telemetry-strict");
    expect(strictTelemetryPlugin.description).toBeDefined();
    expect(strictTelemetryPlugin.spec).toBeDefined();
  });

  test("noTelemetryPlugin should be same as strictTelemetryPlugin", () => {
    expect(noTelemetryPlugin).toBe(strictTelemetryPlugin);
  });

  test("should have mixed rules in base plugin", () => {
    const matches = telemetryPlugin.spec.matches;
    const rules = new Set(Object.values(matches).map((m) => m.rule));

    expect(rules.has("warning")).toBe(true);
    expect(rules.has("info")).toBe(true);
  });

  test("should have error rule in strict plugin", () => {
    const matches = strictTelemetryPlugin.spec.matches;
    const allError = Object.values(matches).every((m) => m.rule === "error");
    expect(allError).toBe(true);
  });

  test("should detect Google Analytics", () => {
    const gaMatch = telemetryPlugin.spec.matches.google_analytics;
    expect(gaMatch).toBeDefined();
    expect(gaMatch.strings || gaMatch.patterns).toBeDefined();
  });

  test("should detect Facebook Pixel", () => {
    const fbMatch = telemetryPlugin.spec.matches.facebook_pixel;
    expect(fbMatch).toBeDefined();
    expect(fbMatch.strings || fbMatch.patterns).toBeDefined();
  });

  test("should detect Sentry", () => {
    const sentryMatch = telemetryPlugin.spec.matches.sentry;
    expect(sentryMatch).toBeDefined();
    expect(sentryMatch.strings || sentryMatch.patterns).toBeDefined();
    expect(sentryMatch.rule).toBe("info");
  });

  test("should detect custom tracking", () => {
    const customMatch = telemetryPlugin.spec.matches.custom_tracking;
    expect(customMatch).toBeDefined();
    expect(customMatch.patterns).toBeDefined();
  });

  test("should have proper match structure", () => {
    for (const [name, match] of Object.entries(telemetryPlugin.spec.matches)) {
      expect(match.rule).toBeDefined();
      expect(match.strings || match.patterns).toBeDefined();
    }
  });

  test("should have telemetry patterns", () => {
    const matches = telemetryPlugin.spec.matches;
    expect(Object.keys(matches).length).toBeGreaterThan(0);

    for (const match of Object.values(matches)) {
      if (match.patterns) {
        for (const pattern of match.patterns) {
          expect(pattern.pattern).toBeDefined();
        }
      }
    }
  });

  test("should detect various analytics providers", () => {
    const providers = [
      "google_analytics",
      "google_tag_manager",
      "facebook_pixel",
      "mixpanel",
      "segment",
      "amplitude",
      "hotjar",
      "posthog",
      "plausible",
      "matomo",
      "heap",
      "fullstory",
      "logrocket",
    ];

    for (const provider of providers) {
      const match = telemetryPlugin.spec.matches[provider];
      expect(match).toBeDefined();
    }
  });

  test("should detect error tracking providers", () => {
    const errorTrackers = [
      "sentry",
      "datadog",
      "new_relic",
      "rollbar",
      "bugsnag",
    ];

    for (const tracker of errorTrackers) {
      const match = telemetryPlugin.spec.matches[tracker];
      expect(match).toBeDefined();
      expect(match.rule).toBe("info");
    }
  });
});
