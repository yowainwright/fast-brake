import { PluginPattern } from "../types";

export const TELEMETRY_PATTERNS: PluginPattern[] = [
  {
    name: "google_analytics",
    pattern: /\b(?:gtag|ga|_gaq|GoogleAnalyticsObject)\s*\(/,
    message: "Google Analytics tracking detected",
    severity: "warning",
  },
  {
    name: "google_tag_manager",
    pattern: /\b(?:dataLayer\.push|GTM-[A-Z0-9]+)\b/,
    message: "Google Tag Manager detected",
    severity: "warning",
  },
  {
    name: "facebook_pixel",
    pattern: /\b(?:fbq|_fbq|facebook\.com\/tr)\b/,
    message: "Facebook Pixel tracking detected",
    severity: "warning",
  },
  {
    name: "mixpanel",
    pattern: /\bmixpanel\.\w+\s*\(/,
    message: "Mixpanel analytics detected",
    severity: "warning",
  },
  {
    name: "segment",
    pattern: /\b(?:analytics\.track|analytics\.identify|analytics\.page)\s*\(/,
    message: "Segment analytics detected",
    severity: "warning",
  },
  {
    name: "amplitude",
    pattern: /\bamplitude\.\w+\s*\(/,
    message: "Amplitude analytics detected",
    severity: "warning",
  },
  {
    name: "hotjar",
    pattern: /\b(?:hj|_hjSettings|hotjar\.com)\b/,
    message: "Hotjar tracking detected",
    severity: "warning",
  },
  {
    name: "sentry",
    pattern: /\b(?:Sentry\.init|Sentry\.captureException|@sentry\/)/,
    message: "Sentry error tracking detected",
    severity: "info",
  },
  {
    name: "datadog",
    pattern: /\b(?:DD_RUM|datadog|ddTrace)\b/,
    message: "Datadog monitoring detected",
    severity: "info",
  },
  {
    name: "new_relic",
    pattern: /\b(?:newrelic|NREUM)\b/,
    message: "New Relic monitoring detected",
    severity: "info",
  },
  {
    name: "posthog",
    pattern: /\bposthog\.\w+\s*\(/,
    message: "PostHog analytics detected",
    severity: "warning",
  },
  {
    name: "plausible",
    pattern: /\bplausible\s*\(/,
    message: "Plausible analytics detected",
    severity: "info",
  },
  {
    name: "matomo",
    pattern: /\b(?:_paq\.push|matomo\.js|piwik\.js)\b/,
    message: "Matomo/Piwik analytics detected",
    severity: "warning",
  },
  {
    name: "heap",
    pattern: /\bheap\.\w+\s*\(/,
    message: "Heap analytics detected",
    severity: "warning",
  },
  {
    name: "fullstory",
    pattern: /\b(?:FS\.|fullstory\.com)\b/,
    message: "FullStory session recording detected",
    severity: "warning",
  },
  {
    name: "logrocket",
    pattern: /\b(?:LogRocket\.init|logrocket\.com)\b/,
    message: "LogRocket session recording detected",
    severity: "warning",
  },
  {
    name: "rollbar",
    pattern: /\b(?:Rollbar\.init|rollbar\.com)\b/,
    message: "Rollbar error tracking detected",
    severity: "info",
  },
  {
    name: "bugsnag",
    pattern: /\b(?:Bugsnag\.start|bugsnag\.com)\b/,
    message: "Bugsnag error tracking detected",
    severity: "info",
  },
  {
    name: "console_tracking",
    pattern: /console\.\w+\s*\([^)]*(?:track|analytics|telemetry|metric)/i,
    message: "Console-based tracking detected",
    severity: "info",
  },
  {
    name: "custom_tracking",
    pattern:
      /\b(?:track|telemetry|analytics|metrics?)\s*\.\s*(?:send|push|log|record)\s*\(/,
    message: "Custom tracking/telemetry detected",
    severity: "info",
  },
];
