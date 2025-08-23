
import { TokenState } from './types';
import type { Token } from './types';
export { TokenState } from './types';

export class Tokenizer {
  private code: string;
  private pos: number;
  private line: number;
  private column: number;
  private state: TokenState;
  private tokens: Token[];

  constructor(code: string) {
    this.code = code;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.state = TokenState.NORMAL;
    this.tokens = [];
  }

  private advance(): string {
    const char = this.code[this.pos];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
    return char;
  }

  private peek(offset: number = 0): string {
    return this.code[this.pos + offset];
  }

  private skipWhitespace(): void {
    while (this.pos < this.code.length && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  private scanString(quote: string): string {
    const start = this.pos;
    this.advance(); // skip opening quote
    
    while (this.pos < this.code.length) {
      const char = this.peek();
      if (char === '\\') {
        this.advance(); // skip escape
        this.advance(); // skip escaped char
      } else if (char === quote) {
        this.advance(); // skip closing quote
        break;
      } else {
        this.advance();
      }
    }
    
    return this.code.slice(start, this.pos);
  }

  private scanTemplate(): string {
    const start = this.pos;
    this.advance(); // skip opening backtick
    
    while (this.pos < this.code.length) {
      const char = this.peek();
      if (char === '\\') {
        this.advance();
        this.advance();
      } else if (char === '$' && this.peek(1) === '{') {
        this.advance(); // $
        this.advance(); // {
        let depth = 1;
        while (depth > 0 && this.pos < this.code.length) {
          const c = this.advance();
          if (c === '{') depth++;
          else if (c === '}') depth--;
        }
      } else if (char === '`') {
        this.advance();
        break;
      } else {
        this.advance();
      }
    }
    
    return this.code.slice(start, this.pos);
  }

  private scanLineComment(): string {
    const start = this.pos;
    while (this.pos < this.code.length && this.peek() !== '\n') {
      this.advance();
    }
    return this.code.slice(start, this.pos);
  }

  private scanBlockComment(): string {
    const start = this.pos;
    this.advance(); // skip /
    this.advance(); // skip *
    
    while (this.pos < this.code.length) {
      if (this.peek() === '*' && this.peek(1) === '/') {
        this.advance(); // skip *
        this.advance(); // skip /
        break;
      }
      this.advance();
    }
    
    return this.code.slice(start, this.pos);
  }

  private scanRegex(): string {
    const start = this.pos;
    this.advance(); // skip opening /
    
    let inClass = false;
    while (this.pos < this.code.length) {
      const char = this.peek();
      if (char === '\\') {
        this.advance();
        this.advance();
      } else if (char === '[') {
        inClass = true;
        this.advance();
      } else if (char === ']' && inClass) {
        inClass = false;
        this.advance();
      } else if (char === '/' && !inClass) {
        this.advance();
        while (this.pos < this.code.length && /[gimsuvy]/.test(this.peek())) {
          this.advance();
        }
        break;
      } else {
        this.advance();
      }
    }
    
    return this.code.slice(start, this.pos);
  }

  private isRegexContext(): boolean {
    const prevTokens = this.tokens.slice(-2);
    if (prevTokens.length === 0) return true;
    
    const lastToken = prevTokens[prevTokens.length - 1];
    const regexPreceding = /^(?:=|\(|\[|\{|,|;|!|:|&|\||\^|~|\?|return|throw|new|in|of|typeof|void|delete|instanceof)$/;
    
    return regexPreceding.test(lastToken.value);
  }

  private scanIdentifier(): string {
    const start = this.pos;
    while (this.pos < this.code.length && /[a-zA-Z0-9_$]/.test(this.peek())) {
      this.advance();
    }
    return this.code.slice(start, this.pos);
  }

  private scanNumber(): string {
    const start = this.pos;
    
    if (this.peek() === '0') {
      const next = this.peek(1);
      if (next === 'x' || next === 'X') {
        this.advance();
        this.advance();
        while (this.pos < this.code.length && /[0-9a-fA-F_]/.test(this.peek())) {
          this.advance();
        }
        return this.code.slice(start, this.pos);
      } else if (next === 'o' || next === 'O') {
        this.advance();
        this.advance();
        while (this.pos < this.code.length && /[0-7_]/.test(this.peek())) {
          this.advance();
        }
        return this.code.slice(start, this.pos);
      } else if (next === 'b' || next === 'B') {
        this.advance();
        this.advance();
        while (this.pos < this.code.length && /[01_]/.test(this.peek())) {
          this.advance();
        }
        return this.code.slice(start, this.pos);
      }
    }
    
    while (this.pos < this.code.length && /[0-9_]/.test(this.peek())) {
      this.advance();
    }
    
    if (this.peek() === '.' && /[0-9]/.test(this.peek(1))) {
      this.advance();
      while (this.pos < this.code.length && /[0-9_]/.test(this.peek())) {
        this.advance();
      }
    }
    
    if ((this.peek() === 'e' || this.peek() === 'E')) {
      this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        this.advance();
      }
      while (this.pos < this.code.length && /[0-9_]/.test(this.peek())) {
        this.advance();
      }
    }
    
    if (this.peek() === 'n') {
      this.advance();
    }
    
    return this.code.slice(start, this.pos);
  }

  private scanOperator(): string {
    const start = this.pos;
    const char = this.peek();
    const next = this.peek(1);
    const next2 = this.peek(2);
    
    if ((char === '>' && next === '>' && next2 === '>') ||
        (char === '<' && next === '<' && next2 === '=') ||
        (char === '>' && next === '>' && next2 === '=') ||
        (char === '=' && next === '=' && next2 === '=') ||
        (char === '!' && next === '=' && next2 === '=') ||
        (char === '>' && next === '>' && next2 === '>') ||
        (char === '.' && next === '.' && next2 === '.') ||
        (char === '&' && next === '&' && next2 === '=') ||
        (char === '|' && next === '|' && next2 === '=') ||
        (char === '?' && next === '?' && next2 === '=')) {
      this.advance();
      this.advance();
      this.advance();
    }
    else if ((char === '=' && next === '>') ||
             (char === '+' && next === '+') ||
             (char === '-' && next === '-') ||
             (char === '=' && next === '=') ||
             (char === '!' && next === '=') ||
             (char === '<' && next === '=') ||
             (char === '>' && next === '=') ||
             (char === '<' && next === '<') ||
             (char === '>' && next === '>') ||
             (char === '&' && next === '&') ||
             (char === '|' && next === '|') ||
             (char === '?' && next === '?') ||
             (char === '?' && next === '.') ||
             (char === '+' && next === '=') ||
             (char === '-' && next === '=') ||
             (char === '*' && next === '=') ||
             (char === '/' && next === '=') ||
             (char === '%' && next === '=') ||
             (char === '&' && next === '=') ||
             (char === '|' && next === '=') ||
             (char === '^' && next === '=') ||
             (char === '*' && next === '*')) {
      this.advance();
      this.advance();
    }
    else {
      this.advance();
    }
    
    return this.code.slice(start, this.pos);
  }

  tokenize(): Token[] {
    while (this.pos < this.code.length) {
      this.skipWhitespace();
      if (this.pos >= this.code.length) break;
      
      const start = this.pos;
      const line = this.line;
      const column = this.column;
      const char = this.peek();
      const next = this.peek(1);
      
      let type = 'unknown';
      let value = '';
      
      if (char === '/' && next === '/') {
        type = 'comment';
        value = this.scanLineComment();
      } else if (char === '/' && next === '*') {
        type = 'comment';
        value = this.scanBlockComment();
      }
      else if (char === '"') {
        type = 'string';
        value = this.scanString('"');
      } else if (char === "'") {
        type = 'string';
        value = this.scanString("'");
      }
      else if (char === '`') {
        type = 'template';
        value = this.scanTemplate();
      }
      else if (/[0-9]/.test(char)) {
        type = 'number';
        value = this.scanNumber();
      }
      else if (/[a-zA-Z_$]/.test(char)) {
        type = 'identifier';
        value = this.scanIdentifier();
        
        if (isKeyword(value)) {
          type = 'keyword';
        }
      }
      else if (char === '/' && this.isRegexContext()) {
        type = 'regex';
        value = this.scanRegex();
      }
      else {
        type = 'operator';
        value = this.scanOperator();
      }
      
      this.tokens.push({
        type,
        value,
        start,
        end: this.pos,
        line,
        column
      });
    }
    
    return this.tokens;
  }

  getCodeTokens(): Token[] {
    return this.tokens.filter(t => 
      t.type !== 'comment' && 
      t.type !== 'string' && 
      t.type !== 'template'
    );
  }
}

function isKeyword(word: string): boolean {
  const keywords = new Set([
    'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends',
    'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
    'new', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw',
    'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'
  ]);
  return keywords.has(word);
}

export function tokenize(code: string): Token[] {
  const tokenizer = new Tokenizer(code);
  return tokenizer.tokenize();
}

export function getCodeTokens(code: string): Token[] {
  const tokenizer = new Tokenizer(code);
  tokenizer.tokenize();
  return tokenizer.getCodeTokens();
}
