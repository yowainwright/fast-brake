import { test, expect, describe } from 'bun:test';
import { tokenize, getCodeTokens } from '../../src/tokenizer';

describe('Tokenizer', () => {
  describe('basic tokenization', () => {
    test('should tokenize simple variable declaration', () => {
      const code = 'var x = 10;';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(5);
      expect(tokens[0]).toMatchObject({ type: 'keyword', value: 'var' });
      expect(tokens[1]).toMatchObject({ type: 'identifier', value: 'x' });
      expect(tokens[2]).toMatchObject({ type: 'operator', value: '=' });
      expect(tokens[3]).toMatchObject({ type: 'number', value: '10' });
      expect(tokens[4]).toMatchObject({ type: 'operator', value: ';' });
    });

    test('should tokenize arrow function', () => {
      const code = '() => {}';
      const tokens = tokenize(code);
      
      const arrowToken = tokens.find(t => t.value === '=>');
      expect(arrowToken).toBeDefined();
      expect(arrowToken?.type).toBe('operator');
    });

    test('should tokenize template literal', () => {
      const code = '`Hello ${name}!`';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('template');
      expect(tokens[0].value).toBe('`Hello ${name}!`');
    });
  });

  describe('string handling', () => {
    test('should tokenize single-quoted string', () => {
      const code = "'hello world'";
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('string');
      expect(tokens[0].value).toBe("'hello world'");
    });

    test('should tokenize double-quoted string', () => {
      const code = '"hello world"';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('string');
      expect(tokens[0].value).toBe('"hello world"');
    });

    test('should handle escaped quotes in strings', () => {
      const code = '"He said \\"Hello\\""';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('string');
    });

    test('should handle template literal with expressions', () => {
      const code = '`Value: ${x + y}`';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('template');
    });
  });

  describe('comment handling', () => {
    test('should tokenize line comment', () => {
      const code = '// This is a comment\nvar x = 10;';
      const tokens = tokenize(code);
      
      const comment = tokens.find(t => t.type === 'comment');
      expect(comment).toBeDefined();
      expect(comment?.value).toBe('// This is a comment');
    });

    test('should tokenize block comment', () => {
      const code = '/* Multi\nline\ncomment */\nvar x = 10;';
      const tokens = tokenize(code);
      
      const comment = tokens.find(t => t.type === 'comment');
      expect(comment).toBeDefined();
      expect(comment?.value).toContain('/* Multi');
    });

    test('should handle nested block comments', () => {
      const code = '/* /* nested */ comment */';
      const tokens = tokenize(code);
      
      expect(tokens.length).toBe(4);
      expect(tokens[0].type).toBe('comment');
      expect(tokens[0].value).toBe('/* /* nested */');
    });
  });

  describe('number tokenization', () => {
    test('should tokenize integers', () => {
      const code = '42';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ type: 'number', value: '42' });
    });

    test('should tokenize decimals', () => {
      const code = '3.14159';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ type: 'number', value: '3.14159' });
    });

    test('should tokenize scientific notation', () => {
      const code = '1.5e10';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ type: 'number', value: '1.5e10' });
    });

  });

  describe('operator tokenization', () => {
    test('should tokenize two-character operators', () => {
      const code = '++a && b || c == d';
      const tokens = tokenize(code);
      
      expect(tokens.find(t => t.value === '++')).toBeDefined();
      expect(tokens.find(t => t.value === '&&')).toBeDefined();
      expect(tokens.find(t => t.value === '||')).toBeDefined();
      expect(tokens.find(t => t.value === '==')).toBeDefined();
    });

    test('should tokenize three-character operators', () => {
      const code = 'a === b !== c >>> d';
      const tokens = tokenize(code);
      
      expect(tokens.find(t => t.value === '===')).toBeDefined();
      expect(tokens.find(t => t.value === '!==')).toBeDefined();
      expect(tokens.find(t => t.value === '>>>')).toBeDefined();
    });

    test('should tokenize optional chaining', () => {
      const code = 'obj?.prop';
      const tokens = tokenize(code);
      
      expect(tokens.find(t => t.value === '?.')).toBeDefined();
    });

    test('should tokenize nullish coalescing', () => {
      const code = 'a ?? b';
      const tokens = tokenize(code);
      
      expect(tokens.find(t => t.value === '??')).toBeDefined();
    });

    test('should tokenize logical assignment operators', () => {
      const code = 'a ||= b &&= c ??= d';
      const tokens = tokenize(code);
      
      expect(tokens.find(t => t.value === '||=')).toBeDefined();
      expect(tokens.find(t => t.value === '&&=')).toBeDefined();
      expect(tokens.find(t => t.value === '??=')).toBeDefined();
    });

    test('should tokenize spread operator', () => {
      const code = '...rest';
      const tokens = tokenize(code);
      
      expect(tokens.find(t => t.value === '...')).toBeDefined();
    });

    test('should tokenize exponentiation operator', () => {
      const code = '2 ** 3';
      const tokens = tokenize(code);
      
      expect(tokens.find(t => t.value === '**')).toBeDefined();
    });
  });

  describe('keyword recognition', () => {
    test('should recognize ES keywords', () => {
      const keywords = ['async', 'await', 'class', 'const', 'let', 'function', 
                       'return', 'if', 'else', 'for', 'while', 'try', 'catch'];
      
      for (const keyword of keywords) {
        const tokens = tokenize(keyword);
        expect(tokens[0].type).toBe('keyword');
        expect(tokens[0].value).toBe(keyword);
      }
    });

    test('should distinguish keywords from identifiers', () => {
      const code = 'className async2 letter';
      const tokens = tokenize(code);
      
      expect(tokens[0].type).toBe('identifier');
      expect(tokens[1].type).toBe('identifier');
      expect(tokens[2].type).toBe('identifier');
    });
  });

  describe('regex detection', () => {
    test('should tokenize simple regex', () => {
      const code = '/test/g';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('regex');
      expect(tokens[0].value).toBe('/test/g');
    });

    test('should tokenize regex with escapes', () => {
      const code = '/\\d+\\.\\d+/';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('regex');
    });

    test('should tokenize regex with character class', () => {
      const code = '/[a-zA-Z0-9]+/';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('regex');
    });

    test('should distinguish division from regex', () => {
      const code = 'a / b / c';
      const tokens = tokenize(code);
      
      const divisionOps = tokens.filter(t => t.value === '/');
      expect(divisionOps).toHaveLength(2);
      expect(divisionOps[0].type).toBe('operator');
    });
  });

  describe('getCodeTokens', () => {
    test('should filter out comments', () => {
      const code = '// comment\nvar x = 10; /* block comment */';
      const codeTokens = getCodeTokens(code);
      
      const comments = codeTokens.filter(t => t.type === 'comment');
      expect(comments).toHaveLength(0);
    });

    test('should filter out strings', () => {
      const code = 'var msg = "hello"; console.log(msg);';
      const codeTokens = getCodeTokens(code);
      
      const strings = codeTokens.filter(t => t.type === 'string');
      expect(strings).toHaveLength(0);
    });

    test('should filter out template literals', () => {
      const code = 'var msg = `hello ${name}`; console.log(msg);';
      const codeTokens = getCodeTokens(code);
      
      const templates = codeTokens.filter(t => t.type === 'template');
      expect(templates).toHaveLength(0);
    });

    test('should keep code tokens', () => {
      const code = 'const x = 10; // comment';
      const codeTokens = getCodeTokens(code);
      
      expect(codeTokens.find(t => t.value === 'const')).toBeDefined();
      expect(codeTokens.find(t => t.value === 'x')).toBeDefined();
      expect(codeTokens.find(t => t.value === '10')).toBeDefined();
    });
  });

  describe('position tracking', () => {
    test('should track line and column positions', () => {
      const code = 'var x = 10;\nlet y = 20;';
      const tokens = tokenize(code);
      
      const varToken = tokens.find(t => t.value === 'var');
      expect(varToken?.line).toBe(1);
      expect(varToken?.column).toBe(1);
      
      const letToken = tokens.find(t => t.value === 'let');
      expect(letToken?.line).toBe(2);
      expect(letToken?.column).toBe(1);
    });

    test('should track start and end positions', () => {
      const code = 'const';
      const tokens = tokenize(code);
      
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(5);
    });
  });

  describe('edge cases', () => {
    test('should handle empty input', () => {
      const tokens = tokenize('');
      expect(tokens).toHaveLength(0);
    });

    test('should handle whitespace-only input', () => {
      const tokens = tokenize('   \n\t  ');
      expect(tokens).toHaveLength(0);
    });

    test('should handle unterminated string gracefully', () => {
      const code = '"unterminated';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('string');
    });

    test('should handle unterminated comment gracefully', () => {
      const code = '/* unterminated comment';
      const tokens = tokenize(code);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('comment');
    });

  });
});