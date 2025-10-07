import React from "react";

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

const benchmarkData: BenchmarkResult[] = [
  {
    parser: "fast-brake",
    method: "AST parser",
    timeMs: 0.002,
    opsPerSec: 552385,
    relative: 1,
    accuracy: "es2015",
  },
  {
    parser: "fast-brake (detect)",
    method: "AST parser",
    timeMs: 0.007,
    opsPerSec: 139003,
    relative: 0.3,
    accuracy: "es2015",
  },
  {
    parser: "fast-brake (es5 only)",
    method: "AST parser",
    timeMs: 0.016,
    opsPerSec: 64194,
    relative: 0.1,
    accuracy: "es5 check",
  },
  {
    parser: "fast-brake (browserlist)",
    method: "AST parser",
    timeMs: 0.016,
    opsPerSec: 63239,
    relative: 0.1,
    accuracy: "browser check",
  },
  {
    parser: "cherow",
    method: "Fast AST",
    timeMs: 0.019,
    opsPerSec: 53499,
    relative: 0.1,
    accuracy: "parsed",
  },
  {
    parser: "fast-brake (es2015 only)",
    method: "AST parser",
    timeMs: 0.021,
    opsPerSec: 48691,
    relative: 0.1,
    accuracy: "es2015 check",
  },
  {
    parser: "meriyah",
    method: "Fast AST",
    timeMs: 0.021,
    opsPerSec: 47350,
    relative: 0.1,
    accuracy: "parsed",
  },
  {
    parser: "esprima",
    method: "Standard AST",
    timeMs: 0.026,
    opsPerSec: 37952,
    relative: 0.1,
    accuracy: "parse error",
  },
  {
    parser: "acorn",
    method: "Lightweight AST",
    timeMs: 0.054,
    opsPerSec: 18598,
    relative: 0,
    accuracy: "parse error",
  },
  {
    parser: "@babel/parser",
    method: "Full AST",
    timeMs: 0.059,
    opsPerSec: 16919,
    relative: 0,
    accuracy: "parsed",
  },
  {
    parser: "espree",
    method: "ESLint AST",
    timeMs: 0.064,
    opsPerSec: 15720,
    relative: 0,
    accuracy: "parse error",
  },
];

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
            <tr
              key={idx}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              <td className="py-2">
                <span
                  className={
                    result.parser.includes("fast-brake")
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : ""
                  }
                >
                  {result.parser}
                </span>
              </td>
              <td className="py-2">{result.timeMs.toFixed(3)}</td>
              <td className="py-2">{result.opsPerSec.toLocaleString()}</td>
              <td className="py-2">
                <span
                  className={
                    result.relative >= 1
                      ? "font-semibold text-green-600 dark:text-green-400"
                      : "text-gray-500"
                  }
                >
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
