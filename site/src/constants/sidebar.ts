import { resolveDocsUrl } from "../utils/urlResolver";

const SIDEBAR = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        href: resolveDocsUrl("introduction"),
      },
      {
        title: "Setup",
        href: resolveDocsUrl("setup"),
      },
      {
        title: "Examples",
        href: resolveDocsUrl("examples"),
      },
    ],
  },
  {
    title: "Plugins",
    items: [
      {
        title: "Learn the Plugin System",
        href: resolveDocsUrl("plugins"),
      },
      {
        title: "ES Version",
        href: resolveDocsUrl("plugins/esversion"),
      },
      {
        title: "Telemetry",
        href: resolveDocsUrl("plugins/telemetry"),
      },
      {
        title: "Browserlist",
        href: resolveDocsUrl("plugins/browserlist"),
      },
      {
        title: "Detect",
        href: resolveDocsUrl("plugins/detect"),
      },
      {
        title: "Making Custom Plugins",
        href: resolveDocsUrl("plugins/custom"),
      },
    ],
  },
  {
    title: "Extensions",
    items: [
      {
        title: "Learn the Extension System",
        href: resolveDocsUrl("extensions"),
      },
      {
        title: "Making Custom Extensions",
        href: resolveDocsUrl("extensions/custom"),
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Advanced Features",
        href: resolveDocsUrl("advanced-features"),
      },
      {
        title: "Architecture",
        href: resolveDocsUrl("architecture"),
      },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        title: "API Reference",
        href: resolveDocsUrl("api-reference"),
      },
      {
        title: "Troubleshooting & FAQ",
        href: resolveDocsUrl("troubleshooting"),
      },
    ],
  },
];

export default SIDEBAR;
