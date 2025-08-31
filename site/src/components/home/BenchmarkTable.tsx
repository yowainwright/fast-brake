import React from 'react';

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

// Auto-generated benchmark data from latest run
const benchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake",
    "method": "Pattern matching",
    "timeMs": 0.002,
    "opsPerSec": 552385,
    "relative": 1,
    "accuracy": "es2015"
  },
  {
    "parser": "fast-brake (detect)",
    "method": "Auto-detection",
    "timeMs": 0.007,
    "opsPerSec": 139003,
    "relative": 0.3,
    "accuracy": "es2015"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.021,
    "opsPerSec": 47350,
    "relative": 0.1,
    "accuracy": "parsed"
  },
  {
    "parser": "esprima",
    "method": "Standard AST",
    "timeMs": 0.026,
    "opsPerSec": 37952,
    "relative": 0.1,
    "accuracy": "parse error"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.054,
    "opsPerSec": 18598,
    "relative": 0.03,
    "accuracy": "parse error"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.059,
    "opsPerSec": 16919,
    "relative": 0.03,
    "accuracy": "parsed"
  }
];

export function BenchmarkTable() {
  const getSpeedColor = (relative: number) => {
    if (relative >= 0.5) return 'text-green-500 dark:text-green-400';
    if (relative >= 0.1) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const formatOps = (ops: number) => {
    return ops.toLocaleString('en-US');
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
            <th className="px-6 py-3">Speed</th>
          </tr>
        </thead>
        <tbody>
          {benchmarkData.map((result, idx) => (
            <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 font-medium">
                {result.parser.includes('fast-brake') ? (
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {result.parser}
                  </span>
                ) : (
                  <span>{result.parser}</span>
                )}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                {result.method}
              </td>
              <td className="px-6 py-4">{result.timeMs.toFixed(3)}</td>
              <td className="px-6 py-4 font-mono">{formatOps(result.opsPerSec)}</td>
              <td className={`px-6 py-4 font-semibold ${getSpeedColor(result.relative)}`}>
                {result.relative >= 1 ? 
                  <span className="font-bold">{result.relative.toFixed(1)}x baseline</span> :
                  result.relative >= 0.1 ? 
                    `${result.relative.toFixed(1)}x` :
                    `${result.relative.toFixed(2)}x`
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>* Benchmarked on MacBook Pro M1 with ES2015 test files</p>
        <p>* fast-brake is <strong className="text-green-600 dark:text-green-400">30x faster</strong> than @babel/parser</p>
        <p>* Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
    </div>
  );
}

export default BenchmarkTable;
