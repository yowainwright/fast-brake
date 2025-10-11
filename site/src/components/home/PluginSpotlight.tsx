import React, { useState, useEffect, useRef } from "react";

interface SpotlightSection {
  id: string;
  label: string;
  schemaLines: [number, number];
  exampleLines: [number, number];
  description?: string;
}

interface PluginSpotlightProps {
  className?: string;
}

const sections: SpotlightSection[] = [
  {
    id: "name",
    label: "name",
    schemaLines: [2, 2],
    exampleLines: [2, 2],
    description: "Plugin identifier",
  },
  {
    id: "description",
    label: "description",
    schemaLines: [3, 3],
    exampleLines: [3, 3],
    description: "Plugin purpose",
  },
  {
    id: "rules",
    label: "orderedRules",
    schemaLines: [8, 8],
    exampleLines: [5, 5],
    description: "Rule execution order",
  },
  {
    id: "matches",
    label: "matches",
    schemaLines: [9, 9],
    exampleLines: [6, 14],
    description: "Pattern definitions",
  },
  {
    id: "strings",
    label: "strings",
    schemaLines: [14, 14],
    exampleLines: [9, 9],
    description: "Quick string matching",
  },
  {
    id: "patterns",
    label: "patterns",
    schemaLines: [15, 15],
    exampleLines: [10, 13],
    description: "Regex pattern matching",
  },
];

const pluginSchemaCode = `interface Plugin {
  name: string;
  description: string;
  spec: PluginSpec;
}

interface PluginSpec {
  orderedRules: string[];
  matches: Record<string, PluginMatch>;
}

interface PluginMatch {
  rule: string;
  strings?: string[];
  patterns?: PluginPattern[];
}`;

const examplePluginCode = `const telemetryPlugin = {
  name: "telemetry-detector",
  description: "Detects telemetry usage",
  spec: {
    orderedRules: ["analytics"],
    matches: {
      "google_analytics": {
        rule: "analytics",
        strings: ["gtag", "ga("],
        patterns: [{
          pattern: "gtag\\\\('config'",
          identifier: "gtag_config"
        }]
      }
    }
  }
};`;

function highlightToken(token: string, isString: boolean = false): JSX.Element {
  if (["interface", "const", "string", "Record"].includes(token)) {
    return (
      <span className="text-purple-600 dark:text-purple-400 font-semibold">
        {token}
      </span>
    );
  }
  if (
    ["Plugin", "PluginSpec", "PluginMatch", "PluginPattern"].includes(token)
  ) {
    return <span className="text-blue-600 dark:text-blue-400">{token}</span>;
  }
  if (
    [
      "name",
      "description",
      "spec",
      "orderedRules",
      "matches",
      "rule",
      "strings",
      "patterns",
      "pattern",
      "identifier",
    ].includes(token.replace(":", ""))
  ) {
    return (
      <span className="text-orange-600 dark:text-orange-400">{token}</span>
    );
  }
  if (
    isString ||
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    return <span className="text-green-600 dark:text-green-400">{token}</span>;
  }
  if (["[", "]", "{", "}"].includes(token)) {
    return (
      <span className="text-gray-600 dark:text-gray-400 font-bold">
        {token}
      </span>
    );
  }
  return <span className="text-base-content">{token}</span>;
}

function highlightLine(line: string): JSX.Element {
  const tokens: JSX.Element[] = [];
  let current = "";
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (!inString && (char === '"' || char === "'")) {
      if (current) {
        tokens.push(highlightToken(current));
        current = "";
      }
      inString = true;
      stringChar = char;
      current = char;
    } else if (inString && char === stringChar && line[i - 1] !== "\\") {
      current += char;
      tokens.push(highlightToken(current, true));
      current = "";
      inString = false;
      stringChar = "";
    } else if (!inString && /[\s:;,<>{}[\]()]/.test(char)) {
      if (current) {
        tokens.push(highlightToken(current));
        current = "";
      }
      tokens.push(
        <span key={`sep-${i}`} className="text-base-content/60">
          {char}
        </span>,
      );
    } else {
      current += char;
    }
  }

  if (current) {
    tokens.push(highlightToken(current, inString));
  }

  return <>{tokens}</>;
}

function CodeBlock({
  code,
  title,
  activeSection,
  lines,
}: {
  code: string;
  title: string;
  activeSection: SpotlightSection | undefined;
  lines: "schemaLines" | "exampleLines";
}) {
  const codeLines = code.split("\n");
  const activeLines = activeSection ? activeSection[lines] : null;

  return (
    <div className="bg-base-200 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: activeLines
            ? `radial-gradient(600px circle at 50% ${
                ((activeLines[0] + activeLines[1]) / 2 / codeLines.length) * 100
              }%, rgba(255, 140, 0, 0.25), transparent 40%)`
            : "none",
          transition: "all 0.5s ease-out",
        }}
      />

      <h3 className="text-xl font-bold mb-4 font-outfit relative z-10">
        {title}
      </h3>

      <pre className="text-sm overflow-x-auto relative z-10">
        <code className="language-typescript">
          {codeLines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted =
              activeLines &&
              lineNum >= activeLines[0] &&
              lineNum <= activeLines[1];
            const isEmpty = line.trim() === "";

            return (
              <div
                key={i}
                className={`
                  transition-all duration-500 ease-out font-mono
                  ${
                    isHighlighted
                      ? "bg-orange-500/20 border-l-4 border-orange-500 pl-3 -ml-1"
                      : isEmpty
                        ? ""
                        : "opacity-50"
                  }
                `}
                style={{
                  minHeight: "1.5em",
                }}
              >
                {isEmpty ? "\u00A0" : highlightLine(line)}
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

export default function PluginSpotlight({
  className = "",
}: PluginSpotlightProps) {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [isManual, setIsManual] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isManual) {
      intervalRef.current = setInterval(() => {
        setActiveSection((current) => {
          const idx = sections.findIndex((s) => s.id === current);
          return sections[(idx + 1) % sections.length].id;
        });
      }, 3000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isManual]);

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    setIsManual(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeout(() => setIsManual(false), 10000);
  };

  const active = sections.find((s) => s.id === activeSection);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className={`
              px-4 py-2 rounded-md text-sm font-mono transition-all duration-300
              ${
                activeSection === section.id
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 scale-105"
                  : "bg-base-300 hover:bg-base-100 text-base-content/70 hover:text-base-content border border-base-300"
              }
            `}
            title={section.description}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CodeBlock
          code={pluginSchemaCode}
          title="Plugin Schema"
          activeSection={active}
          lines="schemaLines"
        />

        <CodeBlock
          code={examplePluginCode}
          title="Example Plugin"
          activeSection={active}
          lines="exampleLines"
        />
      </div>
    </div>
  );
}
