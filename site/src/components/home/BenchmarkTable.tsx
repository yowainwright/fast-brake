import React from 'react';

interface BenchmarkResult {
  parser: string;
  method?: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

const es2015BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.014,
    "opsPerSec": 72812,
    "relative": 1,
    "accuracy": "es2015"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.016,
    "opsPerSec": 61003,
    "relative": 0.8,
    "accuracy": "parsed"
  },
  {
    "parser": "cherow",
    "method": "Fast AST",
    "timeMs": 0.018,
    "opsPerSec": 54067,
    "relative": 0.7,
    "accuracy": "parsed"
  },
  {
    "parser": "esprima",
    "method": "Standard AST",
    "timeMs": 0.026,
    "opsPerSec": 38320,
    "relative": 0.5,
    "accuracy": "parse error"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.039,
    "opsPerSec": 25786,
    "relative": 0.4,
    "accuracy": "parse error"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.052,
    "opsPerSec": 19152,
    "relative": 0.3,
    "accuracy": "parsed"
  },
  {
    "parser": "espree",
    "method": "ESLint AST",
    "timeMs": 0.059,
    "opsPerSec": 17036,
    "relative": 0.2,
    "accuracy": "parse error"
  },
  {
    "parser": "fast-brake (full)",
    "method": "Full analysis",
    "timeMs": 0.086,
    "opsPerSec": 11606,
    "relative": 0.2,
    "accuracy": "es2015"
  }
];

export function BenchmarkTable() {
  const fastBrakeQuick = es2015BenchmarkData.find(r => r.parser === 'fast-brake (pattern)');
  const fastBrakeFull = es2015BenchmarkData.find(r => r.parser === 'fast-brake (full)');
  const babel = es2015BenchmarkData.find(r => r.parser === '@babel/parser');
  
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
          {es2015BenchmarkData.slice(0, 5).map((result, idx) => (
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
              <td className={`px-6 py-4 font-semibold ${getSpeedColor(result.relative)}`}>
                {result.relative >= 1 ? `${result.relative.toFixed(1)}x` : `${result.relative.toFixed(1)}x`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        *Benchmarked on 8/22/2025 with ES2015 test files on Apple M4
      </p>
    </div>
  );
}

export default BenchmarkTable;
