import React, { useState, useEffect, useRef } from "react";

interface CodeSection {
  id: string;
  label: string;
  lines: [number, number];
}

interface CodeBlockWithSpotlightProps {
  code: string;
  language: string;
  sections: CodeSection[];
  title: string;
}

export default function CodeBlockWithSpotlight({
  code,
  language,
  sections,
  title,
}: CodeBlockWithSpotlightProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [isManual, setIsManual] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isManual && sections.length > 1) {
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
  }, [isManual, sections]);

  const handleClick = (id: string) => {
    setActiveSection(id);
    setIsManual(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTimeout(() => setIsManual(false), 10000);
  };

  const lines = code.trim().split("\n");
  const active = sections.find((s) => s.id === activeSection);

  return (
    <div className="bg-base-200 rounded-2xl p-6 lg:p-8">
      <h3 className="text-xl font-bold mb-4 font-outfit">{title}</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className={`
              px-3 py-1 rounded-md text-sm font-mono transition-all duration-300
              ${
                activeSection === section.id
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "bg-base-300 text-base-content hover:bg-base-100"
              }
            `}
          >
            {section.label}
          </button>
        ))}
      </div>

      <pre className="text-sm overflow-x-auto -mx-6 lg:-mx-8 px-6 lg:px-8">
        <code className={`language-${language} block`}>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted =
              active &&
              lineNum >= active.lines[0] &&
              lineNum <= active.lines[1];

            return (
              <div
                key={i}
                className={`
                  transition-all duration-500 ease-in-out -mx-6 lg:-mx-8 px-6 lg:px-8
                  ${
                    isHighlighted
                      ? "bg-orange-500/15 border-x border-orange-500/50 py-0.5"
                      : "opacity-50"
                  }
                `}
              >
                {line || "\n"}
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
