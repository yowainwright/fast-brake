## Performance Comparison

| Parser | Method | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|--------|-----------|---------|----------|----------|
| meriyah | Fast ES parser | 0.015 | 66826 | 1.5x | parsed |
| cherow | Fast parser | 0.021 | 46727 | 1.0x | parsed |
| fast-brake | Pattern matching | 0.022 | 46015 | 1.0x | none |
| fast-brake (preprocess) | With comment stripping | 0.027 | 36695 | 0.8x | none |
| esprima | ECMAScript parser | 0.029 | 34508 | 0.7x | parsed |
| acorn | Lightweight parser | 0.036 | 27914 | 0.6x | parsed |
| espree | ESLint parser | 0.044 | 22752 | 0.5x | parsed |
| @babel/parser | Full AST parser | 0.073 | 13764 | 0.3x | parsed |


*Benchmarked on 12/6/2025*