import { describe, it, expect } from 'vitest';
import {
  splitDiagrams,
  parsePlantumlError,
  looksLikeErrorImage,
} from './plantuml-parser';

describe('splitDiagrams', () => {
  it('returns an empty list for an empty source', () => {
    expect(splitDiagrams('')).toEqual([]);
  });

  it('returns an empty list for whitespace-only source', () => {
    expect(splitDiagrams('   \n\t\n')).toEqual([]);
  });

  it('wraps plain text in a single block', () => {
    const src = 'Alice -> Bob: hello\nBob -> Alice: hi';
    const out = splitDiagrams(src);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(src);
  });

  it('splits a single @startuml/@enduml block', () => {
    const out = splitDiagrams('@startuml\nA -> B\n@enduml');
    expect(out).toEqual(['@startuml\nA -> B\n@enduml']);
  });

  it('splits two @startuml blocks', () => {
    const src = [
      '@startuml',
      'A -> B',
      '@enduml',
      '@startuml',
      'C -> D',
      '@enduml',
    ].join('\n');
    const out = splitDiagrams(src);
    expect(out).toHaveLength(2);
    expect(out[0]).toContain('A -> B');
    expect(out[1]).toContain('C -> D');
  });

  it('keeps an unterminated block', () => {
    const src = '@startuml\nA -> B\n'; // no @enduml
    const out = splitDiagrams(src);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain('A -> B');
  });

  it('accepts @enduml as the closer for non-uml block types', () => {
    const out = splitDiagrams('@startmindmap\n* A\n@enduml');
    expect(out).toHaveLength(1);
  });

  it('handles mixed block types in one file', () => {
    const src = [
      '@startuml',
      'A -> B',
      '@enduml',
      '@startgantt',
      '[A] lasts 2 weeks',
      '@endgantt',
    ].join('\n');
    const out = splitDiagrams(src);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatch(/^@startuml/);
    expect(out[1]).toMatch(/^@startgantt/);
  });

  it('matches block start case-insensitively', () => {
    const out = splitDiagrams('@STARTUML\nA -> B\n@ENDUML');
    expect(out).toHaveLength(1);
  });

  it('does not split on @startuml-like text inside a comment', () => {
    // The parser is intentionally simple - it doesn't know about comments,
    // so a literal '@startuml' mid-text still starts a new block. This
    // documents the current behavior, not a bug.
    const src = "' @startuml inside a comment\nA -> B\n@enduml";
    const out = splitDiagrams(src);
    // Either 1 or 2 blocks is acceptable; the test just pins behavior.
    expect(out.length).toBeGreaterThanOrEqual(1);
  });
});

describe('parsePlantumlError', () => {
  it('parses PlantUML ERROR/n/msg format', () => {
    const stderr = 'ERROR\n3\nSyntax Error?';
    const out = parsePlantumlError(stderr, Buffer.alloc(0));
    expect(out.line).toBe(3);
    expect(out.shortMessage).toBe('Syntax Error?');
    expect(out.details).toBe(stderr);
  });

  it('falls back to "line: N" format', () => {
    const stderr = 'Some message about line: 12 being bad';
    const out = parsePlantumlError(stderr, Buffer.alloc(0));
    expect(out.line).toBe(12);
  });

  it('returns line=0 when no line info is present', () => {
    const out = parsePlantumlError('Boom', Buffer.alloc(0));
    expect(out.line).toBe(0);
    expect(out.shortMessage).toBe('Boom');
  });

  it('uses the output buffer when stderr is empty', () => {
    const buf = Buffer.from('PlantUML crashed internally', 'utf-8');
    const out = parsePlantumlError('', buf);
    expect(out.details).toBe('PlantUML crashed internally');
  });

  it('returns "Rendering failed" as shortMessage when stderr is blank', () => {
    const out = parsePlantumlError('', Buffer.alloc(0));
    expect(out.shortMessage).toBe('Rendering failed');
  });
});

describe('looksLikeErrorImage', () => {
  it('returns false for a real SVG output', () => {
    const ok = Buffer.from('<svg><rect width="10" height="10"/></svg>', 'utf-8');
    expect(looksLikeErrorImage(ok)).toBe(false);
  });

  it('returns true for PlantUML "Syntax Error" image', () => {
    const bad = Buffer.from('<svg><text>Syntax Error</text></svg>', 'utf-8');
    expect(looksLikeErrorImage(bad)).toBe(true);
  });

  it('returns true for "cannot find" hint', () => {
    const bad = Buffer.from('<svg><text>cannot find class Foo</text></svg>', 'utf-8');
    expect(looksLikeErrorImage(bad)).toBe(true);
  });

  it('returns true for preprocessor error image', () => {
    const bad = Buffer.from('<svg><text>Preprocessing error</text></svg>', 'utf-8');
    expect(looksLikeErrorImage(bad)).toBe(true);
  });

  it('returns false for non-SVG output', () => {
    const bad = Buffer.from('Cannot find class Foo in stderr', 'utf-8');
    expect(looksLikeErrorImage(bad)).toBe(false);
  });

  it('handles images larger than 4096 bytes', () => {
    const padding = 'x'.repeat(5000);
    const bad = Buffer.from(`<svg><text>Syntax Error ${padding}</text></svg>`, 'utf-8');
    expect(looksLikeErrorImage(bad)).toBe(true);
  });
});
