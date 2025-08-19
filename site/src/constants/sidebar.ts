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
