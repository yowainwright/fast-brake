export interface TextTransformOptions {
  preserveAcronyms?: boolean;
  customReplacements?: Record<string, string>;
}

/**
 * Formats navigation titles by adding proper spacing to camelCase and concatenated words
 * @param text - The original text to transform
 * @param options - Optional configuration for transformation
 * @returns Properly spaced navigation title
 */
export function formatNavigationTitle(text: string, options?: TextTransformOptions): string {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  const { preserveAcronyms = true, customReplacements = {} } = options || {};

  // Check for custom replacements first
  if (customReplacements[text]) {
    return customReplacements[text];
  }

  // Default custom replacements for common cases
  const defaultReplacements: Record<string, string> = {
    'APIReference': 'API Reference',
    'TroubleshootingFAQ': 'Troubleshooting & FAQ',
    'AdvancedFeatures': 'Advanced Features',
  };

  if (defaultReplacements[text]) {
    return defaultReplacements[text];
  }

  // If text already has spaces, return as-is
  if (text.includes(' ')) {
    return text;
  }

  // Handle camelCase and PascalCase conversion
  let result = text;

  if (preserveAcronyms) {
    // Handle common acronyms by adding spaces around them
    result = result
      .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2') // API + Reference -> API Reference
      .replace(/([a-z])([A-Z]{2,})/g, '$1 $2')      // word + API -> word API
      .replace(/([a-z])([A-Z][a-z])/g, '$1 $2');    // word + Word -> word Word
  } else {
    // Simple camelCase to spaced conversion
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  // Clean up any double spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Formats a list of navigation titles
 * @param titles - Array of titles to transform
 * @param options - Optional configuration for transformation
 * @returns Array of properly spaced navigation titles
 */
export function formatNavigationTitles(titles: string[], options?: TextTransformOptions): string[] {
  return titles.map(title => formatNavigationTitle(title, options));
}