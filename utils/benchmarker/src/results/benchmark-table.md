## Performance Comparison

| Parser | Method | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|--------|-----------|---------|----------|----------|
| fast-brake (all + browser) | All ES + browserlist | 0.001 | 771109 | 44.1x | all + browser |
| fast-brake (es2015 only) | Single ES2015 plugin | 0.001 | 731797 | 41.8x | es2015 check |
| fast-brake (all ES) | All ES versions plugin | 0.002 | 631048 | 36.1x | all versions |
| fast-brake (es5 only) | Single ES5 plugin | 0.002 | 478116 | 27.3x | es5 check |
| meriyah | Fast ES parser | 0.015 | 66758 | 3.8x | parsed |
| cherow | Fast parser | 0.017 | 57947 | 3.3x | parsed |
| esprima | ECMAScript parser | 0.021 | 48011 | 2.7x | parsed |
| acorn | Lightweight parser | 0.026 | 38716 | 2.2x | parsed |
| espree | ESLint parser | 0.033 | 30531 | 1.7x | parsed |
| @babel/parser | Full AST parser | 0.050 | 20179 | 1.2x | parsed |
| fast-brake | Pattern matching | 0.057 | 17503 | 1.0x | es2015 |


*Benchmarked on 8/29/2025*