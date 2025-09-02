#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../../../");

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

// Generate enhanced markdown table for README
function generateReadmeTable(results: BenchmarkResult[]): string {
  const fastBrakeQuick = results.find(
    (r) => r.parser === "fast-brake (pattern)",
  );
  const fastBrakeFull = results.find((r) => r.parser === "fast-brake (full)");
  const babel = results.find((r) => r.parser === "@babel/parser");

  let md =
    "| Metric | fast-brake (Quick) | fast-brake (Full) | @babel/parser | acorn |\n";
  md +=
    "|--------|-------------------|-------------------|---------------|-------|\n";

  // Time metrics
  md += `| **Time (ms)** | ${fastBrakeQuick?.timeMs || "-"} | ${fastBrakeFull?.timeMs || "-"} | `;
  md += `${babel?.timeMs || "-"} | ${results.find((r) => r.parser === "acorn")?.timeMs || "-"} |\n`;

  // Ops/sec metrics
  md += `| **Ops/sec** | ${fastBrakeQuick?.opsPerSec.toLocaleString() || "-"} | `;
  md += `${fastBrakeFull?.opsPerSec.toLocaleString() || "-"} | `;
  md += `${babel?.opsPerSec.toLocaleString() || "-"} | `;
  md += `${results.find((r) => r.parser === "acorn")?.opsPerSec.toLocaleString() || "-"} |\n`;

  // Relative speed
  const babelSpeed = babel?.timeMs || 1;
  const quickRelative = babelSpeed / (fastBrakeQuick?.timeMs || 1);
  const fullRelative = babelSpeed / (fastBrakeFull?.timeMs || 1);

  md += `| **Relative Speed** | **${quickRelative.toFixed(1)}x faster** | `;
  md += `${fullRelative.toFixed(1)}x faster | 1.0x | `;
  md += `${(babelSpeed / (results.find((r) => r.parser === "acorn")?.timeMs || 1)).toFixed(1)}x |\n`;

  return md;
}

// Update README.md file
function updateReadme(benchmarkData: BenchmarkResult[]): boolean {
  const readmePath = join(rootDir, "README.md");

  if (!existsSync(readmePath)) {
    console.log(pc.red("❌ README.md not found!"));
    return false;
  }

  const readme = readFileSync(readmePath, "utf-8");
  const table = generateReadmeTable(benchmarkData);

  // Find the performance benchmarks section
  const startMarker = "## Performance Benchmarks";
  const endMarker = "### When to use Quick vs Full mode";

  const startIndex = readme.indexOf(startMarker);
  const endIndex = readme.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.log(
      pc.yellow("⚠️  Could not find performance section markers in README"),
    );
    return false;
  }

  // Build the new performance section
  const newSection = `${startMarker}

Tested on a MacBook Pro M1 with typical JavaScript files:

${table}

*Benchmarked on ${new Date().toLocaleDateString()}*

`;

  // Replace the section
  const newReadme =
    readme.substring(0, startIndex) + newSection + readme.substring(endIndex);

  writeFileSync(readmePath, newReadme);
  return true;
}

// Create React component for the site
function createReactComponent(benchmarkData: BenchmarkResult[]): void {
  const componentPath = join(
    rootDir,
    "site/src/components/home/BenchmarkTable.tsx",
  );

  const component = `import React from 'react';

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

// Auto-generated benchmark data
const benchmarkData: BenchmarkResult[] = ${JSON.stringify(benchmarkData, null, 2)};

export function BenchmarkTable() {
  const fastBrakeQuick = benchmarkData.find(r => r.parser === 'fast-brake (pattern)');
  const fastBrakeFull = benchmarkData.find(r => r.parser === 'fast-brake (full)');
  const babel = benchmarkData.find(r => r.parser === '@babel/parser');
  
  const getSpeedColor = (relative: number) => {
    if (relative >= 2) return 'text-green-500 dark:text-green-400';
    if (relative >= 1) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3">Parser</th>
            <th className="px-6 py-3">Method</th>
            <th className="px-6 py-3">Time (ms)</th>
            <th className="px-6 py-3">Ops/sec</th>
            <th className="px-6 py-3">Relative</th>
          </tr>
        </thead>
        <tbody>
          {benchmarkData.slice(0, 5).map((result, idx) => (
            <tr key={idx} className="border-b dark:border-gray-700">
              <td className="px-6 py-4 font-medium">
                {result.parser.includes('fast-brake') && (
                  <span className="text-blue-600 dark:text-blue-400">
                    {result.parser}
                  </span>
                )}
                {!result.parser.includes('fast-brake') && result.parser}
              </td>
              <td className="px-6 py-4">{result.method}</td>
              <td className="px-6 py-4">{result.timeMs.toFixed(3)}</td>
              <td className="px-6 py-4">{result.opsPerSec.toLocaleString()}</td>
              <td className={\`px-6 py-4 font-semibold \${getSpeedColor(result.relative)}\`}>
                {result.relative >= 1 ? \`\${result.relative.toFixed(1)}x\` : \`\${result.relative.toFixed(1)}x\`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        *Benchmarked on ${new Date().toLocaleDateString()} with ES2015 test files
      </p>
    </div>
  );
}

export default BenchmarkTable;
`;

  writeFileSync(componentPath, component);
  console.log(pc.green("✓ React component created"));
}

// Create MDX component for docs
function createMdxComponent(benchmarkData: BenchmarkResult[]): void {
  const mdxPath = join(rootDir, "site/src/components/docs/BenchmarkData.tsx");

  const component = `import React from 'react';

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

// Auto-generated benchmark data
const benchmarkData: BenchmarkResult[] = ${JSON.stringify(benchmarkData, null, 2)};

export function BenchmarkData() {
  return (
    <div className="not-prose">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            <th className="text-left py-2">Parser</th>
            <th className="text-left py-2">Time (ms)</th>
            <th className="text-left py-2">Ops/sec</th>
            <th className="text-left py-2">Speed</th>
          </tr>
        </thead>
        <tbody>
          {benchmarkData.map((result, idx) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2">
                <span className={result.parser.includes('fast-brake') ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}>
                  {result.parser}
                </span>
              </td>
              <td className="py-2">{result.timeMs.toFixed(3)}</td>
              <td className="py-2">{result.opsPerSec.toLocaleString()}</td>
              <td className="py-2">
                <span className={result.relative >= 1 ? 'font-semibold text-green-600 dark:text-green-400' : 'text-gray-500'}>
                  {result.relative.toFixed(1)}x
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BenchmarkData;
`;

  writeFileSync(mdxPath, component);
  console.log(pc.green("✓ MDX component created"));
}

// Main function
async function main() {
  console.log(pc.bold(pc.cyan("🚀 Updating Benchmarks Across Project\n")));

  // Load benchmark data
  const dataPath = join(__dirname, "results/benchmark-table.json");

  if (!existsSync(dataPath)) {
    console.log(pc.red("❌ No benchmark data found!"));
    console.log(
      pc.yellow(
        '   Run "bun run benchmark && bun run benchmark:table" first.\n',
      ),
    );
    process.exit(1);
  }

  const benchmarkData: BenchmarkResult[] = JSON.parse(
    readFileSync(dataPath, "utf-8"),
  );

  // Update README
  console.log(pc.gray("Updating README.md..."));
  if (updateReadme(benchmarkData)) {
    console.log(pc.green("✓ README.md updated"));
  }

  // Create React component
  console.log(pc.gray("Creating React component..."));
  createReactComponent(benchmarkData);

  // Create MDX component
  console.log(pc.gray("Creating MDX component..."));
  createMdxComponent(benchmarkData);

  console.log(pc.green("\n✅ All benchmarks updated successfully!"));
  console.log(pc.gray("\nUpdated files:"));
  console.log(pc.gray("  • README.md"));
  console.log(pc.gray("  • site/src/components/home/BenchmarkTable.tsx"));
  console.log(pc.gray("  • site/src/components/docs/BenchmarkData.tsx"));

  console.log(pc.cyan("\n📝 Next steps:"));
  console.log(pc.gray("  1. Import BenchmarkTable in your homepage"));
  console.log(pc.gray("  2. Import BenchmarkData in your docs"));
  console.log(pc.gray('  3. Run "bun run dev" to see the changes'));
}

main().catch(console.error);
