import { describe, test, expect } from "bun:test";
import {
  telemetryPlugin,
  strictTelemetryPlugin,
  noTelemetryPlugin,
} from "../../../src/plugins/telemetry";
import { TELEMETRY_PATTERNS } from "../../../src/plugins/telemetry/constants";

describe("Telemetry Plugin", () => {
  test("should export telemetryPlugin", () => {
    expect(telemetryPlugin).toBeDefined();
    expect(telemetryPlugin.name).toBe("telemetry");
    expect(telemetryPlugin.patterns).toBeDefined();
    expect(telemetryPlugin.patterns.length).toBeGreaterThan(0);
  });

  test("should export strictTelemetryPlugin", () => {
    expect(strictTelemetryPlugin).toBeDefined();
    expect(strictTelemetryPlugin.name).toBe("telemetry-strict");
    expect(strictTelemetryPlugin.patterns).toBeDefined();
  });

  test("noTelemetryPlugin should be same as strictTelemetryPlugin", () => {
    expect(noTelemetryPlugin).toBe(strictTelemetryPlugin);
  });

  test("should have mixed severities in base plugin", () => {
    const warnings = telemetryPlugin.patterns.filter(
      (p) => p.severity === "warning",
    );
    const infos = telemetryPlugin.patterns.filter((p) => p.severity === "info");

    expect(warnings.length).toBeGreaterThan(0);
    expect(infos.length).toBeGreaterThan(0);
  });

  test("should have error severity in strict plugin", () => {
    const errors = strictTelemetryPlugin.patterns.filter(
      (p) => p.severity === "error",
    );
    expect(errors.length).toBe(strictTelemetryPlugin.patterns.length);
  });

  test("should detect Google Analytics", () => {
    const gaPattern = telemetryPlugin.patterns.find(
      (p) => p.name === "google_analytics",
    );
    expect(gaPattern).toBeDefined();
    expect(gaPattern?.pattern.test('gtag("config", "GA_ID")')).toBe(true);
    expect(gaPattern?.pattern.test('ga("send", "pageview")')).toBe(true);
  });

  test("should detect Facebook Pixel", () => {
    const fbPattern = telemetryPlugin.patterns.find(
      (p) => p.name === "facebook_pixel",
    );
    expect(fbPattern).toBeDefined();
    expect(fbPattern?.pattern.test('fbq("track", "PageView")')).toBe(true);
  });

  test("should detect Sentry", () => {
    const sentryPattern = telemetryPlugin.patterns.find(
      (p) => p.name === "sentry",
    );
    expect(sentryPattern).toBeDefined();
    expect(sentryPattern?.pattern.test('Sentry.init({ dsn: "..." })')).toBe(
      true,
    );
    expect(sentryPattern?.pattern.test("Sentry.captureException(error)")).toBe(
      true,
    );
    expect(sentryPattern?.message).toContain("Sentry");
    expect(sentryPattern?.severity).toBe("info"); // Error tracking is info level
  });

  test("should detect custom tracking", () => {
    const customPattern = telemetryPlugin.patterns.find(
      (p) => p.name === "custom_tracking",
    );
    expect(customPattern).toBeDefined();
    expect(customPattern?.pattern.test("analytics.send(data)")).toBe(true);
    expect(customPattern?.pattern.test("telemetry.push(event)")).toBe(true);
    expect(customPattern?.pattern.test("metrics.record(value)")).toBe(true);
  });

  test("should have proper pattern messages", () => {
    for (const pattern of telemetryPlugin.patterns) {
      expect(pattern.message).toBeDefined();
      expect(pattern.message.length).toBeGreaterThan(0);
      expect(pattern.message).toContain("detected");
    }
  });

  test("should export constants", () => {
    expect(TELEMETRY_PATTERNS).toBeDefined();
    expect(TELEMETRY_PATTERNS.length).toBeGreaterThan(0);
    expect(TELEMETRY_PATTERNS[0].name).toBeDefined();
    expect(TELEMETRY_PATTERNS[0].pattern).toBeDefined();
    expect(TELEMETRY_PATTERNS[0].message).toBeDefined();
    expect(TELEMETRY_PATTERNS[0].severity).toBeDefined();
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of telemetryPlugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
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
      const pattern = telemetryPlugin.patterns.find((p) => p.name === provider);
      expect(pattern).toBeDefined();
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
      const pattern = telemetryPlugin.patterns.find((p) => p.name === tracker);
      expect(pattern).toBeDefined();
      expect(pattern?.severity).toBe("info");
    }
  });
});
