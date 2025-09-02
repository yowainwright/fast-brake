import React from "react";
import CodeBlockSpotlight from "./CodeBlockSpotlight";

// Plugin interface example
export function PluginInterfaceExample() {
  const code = `interface Plugin {
  // Regex patterns for feature detection
  patterns: Record<string, RegExp>;
  
  // Main detection method
  detect(code: string): PluginResult[];
  
  // Check compatibility
  check(code: string): boolean;
  
  // Optional metadata
  name?: string;
  version?: string;
  description?: string;
}

// Plugin result structure
interface PluginResult {
  feature: string;
  version: string;
  line?: number;
  column?: number;
  snippet?: string;
}`;

  const sections = [
    {
      id: "patterns",
      label: "patterns",
      lines: [2, 3] as [number, number],
      description: "Regex patterns for detecting features",
    },
    {
      id: "detect",
      label: "detect()",
      lines: [5, 6] as [number, number],
      description: "Main detection method",
    },
    {
      id: "check",
      label: "check()",
      lines: [8, 9] as [number, number],
      description: "Compatibility checking",
    },
    {
      id: "metadata",
      label: "metadata",
      lines: [11, 14] as [number, number],
      description: "Optional plugin metadata",
    },
    {
      id: "result",
      label: "PluginResult",
      lines: [17, 23] as [number, number],
      description: "Result structure",
    },
  ];

  return (
    <CodeBlockSpotlight
      code={code}
      language="typescript"
      sections={sections}
      title="Plugin Interface Schema"
      autoRotateInterval={4000}
    />
  );
}

// ES2015 Plugin example
export function ES2015PluginExample() {
  const code = `export const es2015Plugin: Plugin = {
  name: 'es2015',
  version: '1.0.0',
  description: 'Detects ES2015 (ES6) features',
  
  patterns: {
    arrow_functions: /=>/,
    template_literals: /\`/,
    const_declaration: /\\bconst\\s+/,
    let_declaration: /\\blet\\s+/,
    class_declaration: /\\bclass\\s+\\w+/,
    destructuring: /(?:const|let|var)\\s*[[{]/,
    spread_operator: /\\.\\.\\.\\w+/,
    default_parameters: /function.*\\(.*=.*\\)/,
  },
  
  detect(code: string): PluginResult[] {
    const results: PluginResult[] = [];
    
    for (const [feature, pattern] of Object.entries(this.patterns)) {
      const matches = code.matchAll(new RegExp(pattern, 'g'));
      
      for (const match of matches) {
        results.push({
          feature,
          version: 'es2015',
          line: getLineNumber(code, match.index!),
          column: match.index!,
          snippet: match[0]
        });
      }
    }
    
    return results;
  },
  
  check(code: string): boolean {
    return Object.values(this.patterns).some(pattern => 
      pattern.test(code)
    );
  }
};`;

  const sections = [
    {
      id: "metadata",
      label: "Metadata",
      lines: [2, 4] as [number, number],
      description: "Plugin identification",
    },
    {
      id: "patterns",
      label: "Pattern Registry",
      lines: [6, 15] as [number, number],
      description: "ES2015 feature patterns",
    },
    {
      id: "detect",
      label: "Detection Logic",
      lines: [17, 33] as [number, number],
      description: "Feature detection implementation",
    },
    {
      id: "check",
      label: "Quick Check",
      lines: [35, 39] as [number, number],
      description: "Fast compatibility check",
    },
  ];

  return (
    <CodeBlockSpotlight
      code={code}
      language="typescript"
      sections={sections}
      title="ES2015 Plugin Implementation"
      autoRotateInterval={5000}
    />
  );
}

// Custom plugin example
export function CustomPluginExample() {
  const code = `// Custom React Hooks Plugin
export const reactHooksPlugin: Plugin = {
  name: 'react-hooks',
  version: '1.0.0',
  description: 'Detects React Hook usage patterns',
  
  patterns: {
    // Core hooks
    useState: /\\buseState\\s*\\(/,
    useEffect: /\\buseEffect\\s*\\(/,
    useContext: /\\buseContext\\s*\\(/,
    useReducer: /\\buseReducer\\s*\\(/,
    useCallback: /\\buseCallback\\s*\\(/,
    useMemo: /\\buseMemo\\s*\\(/,
    useRef: /\\buseRef\\s*\\(/,
    
    // Custom hook pattern
    customHook: /\\buse[A-Z][a-zA-Z]*\\s*\\(/,
    
    // Hook rules violations
    conditionalHook: /if\\s*\\([^)]*\\)[^{]*{[^}]*use[A-Z]/,
    loopHook: /(?:for|while)\\s*\\([^)]*\\)[^{]*{[^}]*use[A-Z]/,
  },
  
  detect(code: string): PluginResult[] {
    const results: PluginResult[] = [];
    const lines = code.split('\\n');
    
    // Detect hooks with context
    for (const [feature, pattern] of Object.entries(this.patterns)) {
      const matches = code.matchAll(new RegExp(pattern, 'g'));
      
      for (const match of matches) {
        const lineNum = getLineNumber(code, match.index!);
        const isViolation = feature.includes('conditional') || 
                          feature.includes('loop');
        
        results.push({
          feature,
          version: isViolation ? 'error' : 'react-16.8',
          line: lineNum,
          column: match.index!,
          snippet: lines[lineNum - 1].trim(),
          severity: isViolation ? 'error' : 'info'
        });
      }
    }
    
    return results;
  },
  
  check(code: string): boolean {
    // Check for any React hooks
    return /\\buse[A-Z]/.test(code);
  }
};`;

  const sections = [
    {
      id: "core-hooks",
      label: "Core Hooks",
      lines: [8, 15] as [number, number],
      description: "Built-in React hooks",
    },
    {
      id: "custom-pattern",
      label: "Custom Hooks",
      lines: [17, 18] as [number, number],
      description: "Custom hook detection",
    },
    {
      id: "violations",
      label: "Rule Violations",
      lines: [20, 22] as [number, number],
      description: "Hook rules violations",
    },
    {
      id: "detection",
      label: "Detection Logic",
      lines: [25, 46] as [number, number],
      description: "Advanced detection with context",
    },
  ];

  return (
    <CodeBlockSpotlight
      code={code}
      language="typescript"
      sections={sections}
      title="Custom React Hooks Plugin"
      autoRotateInterval={4500}
    />
  );
}
