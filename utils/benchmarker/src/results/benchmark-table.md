## Performance Comparison

| Parser | Method | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|--------|-----------|---------|----------|----------|
| fast-brake (pattern) | Pattern matching + tokenization | 0.010 | 101684 | 1.0x | es5 |
| meriyah | Fast ES parser | 0.015 | 68927 | 0.7x | parsed |
| cherow | Fast parser | 0.018 | 54544 | 0.5x | parsed |
| fast-brake (all ES) | All ES versions plugin | 0.023 | 42774 | 0.4x | all versions |
| esprima | ECMAScript parser | 0.024 | 41681 | 0.4x | parsed |
| fast-brake (es2015 only) | Single ES2015 plugin | 0.025 | 40767 | 0.4x | es2015 check |
| fast-brake (es5 only) | Single ES5 plugin | 0.025 | 39223 | 0.4x | es5 check |
| acorn | Lightweight parser | 0.026 | 38770 | 0.4x | parsed |
| espree | ESLint parser | 0.034 | 29303 | 0.3x | parsed |
| @babel/parser | Full AST parser | 0.047 | 21439 | 0.2x | parsed |
| fast-brake (all + browser) | All ES + browserlist | 0.051 | 19460 | 0.2x | all + browser |
| fast-brake (full) | Full analysis mode | 0.055 | 18018 | 0.2x | es5 |


*Benchmarked on 8/23/2025*