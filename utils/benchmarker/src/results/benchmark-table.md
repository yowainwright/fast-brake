## Performance Comparison

| Parser | Method | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|--------|-----------|---------|----------|----------|
| fast-brake (pattern) | Pattern matching + tokenization | 0.009 | 108474 | 1.0x | es2015 |
| meriyah | Fast ES parser | 0.014 | 70579 | 0.7x | parsed |
| fast-brake (es2015 only) | Single ES2015 plugin | 0.016 | 63509 | 0.6x | es2015 check |
| cherow | Fast parser | 0.016 | 62979 | 0.6x | parsed |
| esprima | ECMAScript parser | 0.022 | 46186 | 0.4x | parsed |
| fast-brake (all ES) | All ES versions plugin | 0.022 | 46133 | 0.4x | all versions |
| fast-brake (es5 only) | Single ES5 plugin | 0.023 | 42862 | 0.4x | es5 check |
| acorn | Lightweight parser | 0.026 | 38589 | 0.4x | parsed |
| espree | ESLint parser | 0.032 | 31099 | 0.3x | parsed |
| @babel/parser | Full AST parser | 0.045 | 22137 | 0.2x | parsed |
| fast-brake (all + browser) | All ES + browserlist | 0.046 | 21759 | 0.2x | all + browser |
| fast-brake (full) | Full analysis mode | 0.050 | 20044 | 0.2x | es2015 |


*Benchmarked on 8/24/2025*