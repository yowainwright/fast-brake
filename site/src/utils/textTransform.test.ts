import { describe, it, expect } from 'vitest';
import { formatNavigationTitle, formatNavigationTitles } from './textTransform';

describe('formatNavigationTitle', () => {
  describe('basic functionality', () => {
    it('should handle empty or invalid input', () => {
      expect(formatNavigationTitle('')).toBe('');
      expect(formatNavigationTitle(null as any)).toBe('');
      expect(formatNavigationTitle(undefined as any)).toBe('');
    });

    it('should return text with existing spaces unchanged', () => {
      expect(formatNavigationTitle('Getting Started')).toBe('Getting Started');
      expect(formatNavigationTitle('API Reference')).toBe('API Reference');
    });

    it('should handle single words', () => {
      expect(formatNavigationTitle('Home')).toBe('Home');
      expect(formatNavigationTitle('Docs')).toBe('Docs');
    });
  });

  describe('camelCase conversion', () => {
    it('should convert simple camelCase', () => {
      expect(formatNavigationTitle('advancedFeatures')).toBe('advanced Features');
      expect(formatNavigationTitle('gettingStarted')).toBe('getting Started');
    });

    it('should convert PascalCase', () => {
      expect(formatNavigationTitle('AdvancedFeatures')).toBe('Advanced Features');
      expect(formatNavigationTitle('GettingStarted')).toBe('Getting Started');
    });
  });

  describe('acronym handling', () => {
    it('should handle API acronym correctly', () => {
      expect(formatNavigationTitle('APIReference')).toBe('API Reference');
      expect(formatNavigationTitle('myAPIReference')).toBe('my API Reference');
    });

    it('should handle FAQ acronym correctly', () => {
      expect(formatNavigationTitle('TroubleshootingFAQ')).toBe('Troubleshooting & FAQ');
      expect(formatNavigationTitle('generalFAQ')).toBe('general FAQ');
    });

    it('should handle multiple acronyms', () => {
      expect(formatNavigationTitle('APIFAQ')).toBe('API FAQ');
      expect(formatNavigationTitle('HTTPAPIReference')).toBe('HTTP API Reference');
    });
  });

  describe('default replacements', () => {
    it('should use default replacements for known cases', () => {
      expect(formatNavigationTitle('APIReference')).toBe('API Reference');
      expect(formatNavigationTitle('TroubleshootingFAQ')).toBe('Troubleshooting & FAQ');
      expect(formatNavigationTitle('AdvancedFeatures')).toBe('Advanced Features');
    });
  });

  describe('custom replacements', () => {
    it('should use custom replacements when provided', () => {
      const customReplacements = {
        'MyCustomTitle': 'My Custom Title',
        'SpecialCase': 'Special Case Title'
      };

      expect(formatNavigationTitle('MyCustomTitle', { customReplacements })).toBe('My Custom Title');
      expect(formatNavigationTitle('SpecialCase', { customReplacements })).toBe('Special Case Title');
    });

    it('should prioritize custom replacements over default logic', () => {
      const customReplacements = {
        'APIReference': 'Custom API Reference'
      };

      expect(formatNavigationTitle('APIReference', { customReplacements })).toBe('Custom API Reference');
    });
  });

  describe('preserveAcronyms option', () => {
    it('should handle acronyms when preserveAcronyms is true (default)', () => {
      expect(formatNavigationTitle('APIReference')).toBe('API Reference');
      expect(formatNavigationTitle('HTTPSConnection')).toBe('HTTPS Connection');
    });

    it('should use simple camelCase conversion when preserveAcronyms is false', () => {
      expect(formatNavigationTitle('APIReference', { preserveAcronyms: false })).toBe('A P I Reference');
      expect(formatNavigationTitle('HTTPSConnection', { preserveAcronyms: false })).toBe('H T T P S Connection');
    });
  });

  describe('edge cases', () => {
    it('should handle numbers in titles', () => {
      expect(formatNavigationTitle('version2API')).toBe('version2 API');
      expect(formatNavigationTitle('API2Reference')).toBe('API2 Reference');
    });

    it('should handle special characters', () => {
      expect(formatNavigationTitle('API-Reference')).toBe('API-Reference');
      expect(formatNavigationTitle('API_Reference')).toBe('API_Reference');
    });

    it('should clean up multiple spaces', () => {
      expect(formatNavigationTitle('MultipleSpacesTest')).toBe('Multiple Spaces Test');
    });
  });
});

describe('formatNavigationTitles', () => {
  it('should format an array of titles', () => {
    const titles = ['APIReference', 'TroubleshootingFAQ', 'AdvancedFeatures'];
    const expected = ['API Reference', 'Troubleshooting & FAQ', 'Advanced Features'];
    
    expect(formatNavigationTitles(titles)).toEqual(expected);
  });

  it('should handle empty array', () => {
    expect(formatNavigationTitles([])).toEqual([]);
  });

  it('should pass options to individual title formatting', () => {
    const titles = ['APIReference'];
    const customReplacements = { 'APIReference': 'Custom API Ref' };
    
    expect(formatNavigationTitles(titles, { customReplacements })).toEqual(['Custom API Ref']);
  });
});