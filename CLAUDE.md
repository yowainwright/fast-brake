# Claude Code Guidelines for fast-brake

This document provides coding guidelines and best practices for working with the fast-brake codebase.

## Code Style Principles

### 1. Immutability

Prefer immutable data structures and avoid mutating variables.

**Good:**
```typescript
const filteredMatches = Object.entries(matches).reduce((acc, [name, match]) => {
  const shouldInclude = ruleIndex > targetIndex;
  return shouldInclude ? { ...acc, [name]: match } : acc;
}, {});
```

**Avoid:**
```typescript
const filteredMatches = {};
for (const [name, match] of Object.entries(matches)) {
  if (ruleIndex > targetIndex) {
    filteredMatches[name] = match; // Mutation
  }
}
```

### 2. Array Methods Over Loops

Use array prototype methods (`map`, `filter`, `reduce`, `some`, `find`, etc.) instead of `for` loops when possible.

**Good:**
```typescript
private checkStrings(code: string): boolean {
  return Object.values(this.featureStrings).some(patterns =>
    patterns.some(pattern => fastIndexOf(code, pattern) !== -1)
  );
}
```

**Avoid:**
```typescript
private checkStrings(code: string): boolean {
  for (const patterns of Object.values(this.featureStrings)) {
    for (const pattern of patterns) {
      if (fastIndexOf(code, pattern) !== -1) {
        return true;
      }
    }
  }
  return false;
}
```

### 3. Clear Boolean Checks

Extract complex conditions into named boolean variables for clarity.

**Good:**
```typescript
const hasPlugin = this.plugin !== null;
if (!hasPlugin) {
  return defaultValue;
}
```

**Avoid:**
```typescript
if (!this.plugin) {
  return defaultValue;
}
```

### 4. No Complex Logic in Object Assignments

Keep object property values simple and move complex logic outside.

**Good:**
```typescript
const rule = this.getPluginRule(featureName);
const hasRule = rule !== null;

return {
  name: featureName,
  match: matchStr,
  rule,
};
```

**Avoid:**
```typescript
return {
  name: featureName,
  match: matchStr,
  rule: this.plugin ? this.getPluginRule(featureName) : featureName,
};
```

### 5. Minimize Regex Usage

Avoid regex when simple string operations suffice. Use character comparisons and `indexOf` for better performance.

**Good:**
```typescript
export function isWordChar(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_" ||
    ch === "$"
  );
}
```

**Avoid:**
```typescript
export function isWordChar(ch: string): boolean {
  return /\w/.test(ch);
}
```

### 6. Early Returns

Use early returns to reduce nesting and improve readability.

**Good:**
```typescript
detectBoolean(code: string): boolean {
  const hasStringMatch = this.checkStrings(code);
  if (hasStringMatch) return true;

  const shouldCheckPatterns = this.shouldRunPatternDetection(code);
  if (!shouldCheckPatterns) return false;

  return this.checkPatterns(code);
}
```

**Avoid:**
```typescript
detectBoolean(code: string): boolean {
  const hasStringMatch = this.checkStrings(code);
  if (hasStringMatch) {
    return true;
  } else {
    const shouldCheckPatterns = this.shouldRunPatternDetection(code);
    if (shouldCheckPatterns) {
      return this.checkPatterns(code);
    } else {
      return false;
    }
  }
}
```

### 7. Function Extraction

Extract duplicate code into reusable functions.

**Good:**
```typescript
private buildDetectionMatch(
  featureName: string,
  matchStr: string,
  index: number,
): DetectionMatch | null {
  // Shared logic
}
```

**Avoid:**
Duplicating the same object construction logic across multiple methods.

## Performance Guidelines

### 1. String Operations

- Use `indexOf()` over regex for simple string matching
- Use index-based scanning to avoid repeated string slicing
- Cache computed values when appropriate

### 2. Comment Stripping

The `stripComments()` utility:
- Preserves line numbers by replacing comments with newlines
- Handles strings, template literals, and regex to avoid false positives
- Uses zero regex for maximum performance

## Testing

### Unit Tests

- All new functions should have comprehensive unit tests
- Use fixture files for complex test scenarios
- Test edge cases (empty strings, unclosed comments, etc.)

### Integration Tests

E2E tests should validate against real-world codebases:
- lodash
- ramda
- es-toolkit

## Documentation

- Avoid comments in implementation code unless truly necessary
- Use clear variable and function names that self-document
- Update CLAUDE.md when adding new patterns or guidelines
