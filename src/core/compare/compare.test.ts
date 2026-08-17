import { describe, expect, it } from 'vitest';
import { compareTexts } from './compare';
import type { ChangedRow, ComparisonRow } from './types';

function rowKinds(rows: ComparisonRow[]): string[] {
  return rows.map((row) => row.kind);
}

function changedRows(rows: ComparisonRow[]): ChangedRow[] {
  return rows.filter((row): row is ChangedRow => row.kind === 'changed');
}

function reconstructed(segments: ChangedRow['originalSegments']): string {
  return segments.map((segment) => segment.text).join('');
}

describe('compareTexts', () => {
  it('treats two empty strings as zero lines', () => {
    const result = compareTexts('', '');
    expect(result.rows).toEqual([]);
    expect(result.stats).toEqual({
      originalLineCount: 0,
      changedLineCount: 0,
      unchangedLineCount: 0,
      changedRowCount: 0,
      addedLineCount: 0,
      removedLineCount: 0,
    });
  });

  it('keeps identical one-line input unchanged with 1-based line numbers', () => {
    const result = compareTexts('alpha', 'alpha');
    expect(result.rows).toEqual([
      {
        kind: 'unchanged',
        originalLineNumber: 1,
        changedLineNumber: 1,
        originalText: 'alpha',
        changedText: 'alpha',
      },
    ]);
  });

  it('keeps identical multiline input unchanged', () => {
    const result = compareTexts('alpha\nbeta\ngamma', 'alpha\nbeta\ngamma');
    expect(rowKinds(result.rows)).toEqual(['unchanged', 'unchanged', 'unchanged']);
    expect(result.stats.unchangedLineCount).toBe(3);
  });

  it('emits a pure added line', () => {
    const result = compareTexts('alpha', 'alpha\nbeta');
    expect(rowKinds(result.rows)).toEqual(['unchanged', 'added']);
    expect(result.rows[1]).toEqual({ kind: 'added', changedLineNumber: 2, changedText: 'beta' });
  });

  it('emits a pure removed line', () => {
    const result = compareTexts('alpha\nbeta', 'alpha');
    expect(rowKinds(result.rows)).toEqual(['unchanged', 'removed']);
    expect(result.rows[1]).toEqual({ kind: 'removed', originalLineNumber: 2, originalText: 'beta' });
  });

  it('pairs a one-line replacement into a changed row', () => {
    const result = compareTexts('old', 'new');
    expect(rowKinds(result.rows)).toEqual(['changed']);
    expect(result.rows[0]).toMatchObject({
      originalLineNumber: 1,
      changedLineNumber: 1,
      originalText: 'old',
      changedText: 'new',
    });
  });

  it('produces word-level changed-line segments', () => {
    const row = changedRows(compareTexts('hello brave world', 'hello bright world').rows)[0];
    expect(row.originalSegments).toEqual([
      { kind: 'equal', text: 'hello ' },
      { kind: 'removed', text: 'brave' },
      { kind: 'equal', text: ' world' },
    ]);
    expect(row.changedSegments).toEqual([
      { kind: 'equal', text: 'hello ' },
      { kind: 'added', text: 'bright' },
      { kind: 'equal', text: ' world' },
    ]);
  });

  it('represents punctuation changes inline', () => {
    const row = changedRows(compareTexts('Hello, world!', 'Hello: world?').rows)[0];
    expect(row.originalSegments.some((segment) => segment.kind === 'removed' && segment.text.includes(','))).toBe(true);
    expect(row.changedSegments.some((segment) => segment.kind === 'added' && segment.text.includes(':'))).toBe(true);
  });

  it('pairs multiple adjacent replacement lines positionally', () => {
    const result = compareTexts('one\ntwo\nthree', 'ONE\nTWO\nthree');
    expect(rowKinds(result.rows)).toEqual(['changed', 'changed', 'unchanged']);
    expect(result.rows.slice(0, 2).map((row) => [
      'originalLineNumber' in row ? row.originalLineNumber : undefined,
      'changedLineNumber' in row ? row.changedLineNumber : undefined,
    ])).toEqual([[1, 1], [2, 2]]);
  });

  it('emits changed plus added rows for a longer replacement block', () => {
    const result = compareTexts('old\ntail', 'new\nextra\ntail');
    expect(rowKinds(result.rows)).toEqual(['changed', 'added', 'unchanged']);
    expect(result.rows[1]).toEqual({ kind: 'added', changedLineNumber: 2, changedText: 'extra' });
  });

  it('emits changed plus removed rows for a shorter replacement block', () => {
    const result = compareTexts('old\nextra\ntail', 'new\ntail');
    expect(rowKinds(result.rows)).toEqual(['changed', 'removed', 'unchanged']);
    expect(result.rows[1]).toEqual({ kind: 'removed', originalLineNumber: 2, originalText: 'extra' });
  });

  it('keeps deterministic line numbering around repeated lines', () => {
    const result = compareTexts('same\nrepeat\nrepeat\nend', 'same\nrepeat\nchanged\nend');
    expect(result.rows).toMatchObject([
      { kind: 'unchanged', originalLineNumber: 1, changedLineNumber: 1 },
      { kind: 'unchanged', originalLineNumber: 2, changedLineNumber: 2 },
      { kind: 'changed', originalLineNumber: 3, changedLineNumber: 3 },
      { kind: 'unchanged', originalLineNumber: 4, changedLineNumber: 4 },
    ]);
  });

  it('detects case-only differences by default', () => {
    expect(rowKinds(compareTexts('Hello', 'hello').rows)).toEqual(['changed']);
  });

  it('ignores case-only differences when ignoreCase is enabled while preserving raw text', () => {
    const result = compareTexts('Hello', 'hello', { ignoreCase: true });
    expect(result.rows).toEqual([
      {
        kind: 'unchanged',
        originalLineNumber: 1,
        changedLineNumber: 1,
        originalText: 'Hello',
        changedText: 'hello',
      },
    ]);
  });

  it('detects surrounding whitespace differences by default', () => {
    expect(rowKinds(compareTexts('  hello  ', 'hello').rows)).toEqual(['changed']);
  });

  it('ignores leading and trailing whitespace when requested while retaining both raw lines', () => {
    const result = compareTexts('  hello  ', 'hello', { ignoreSurroundingWhitespace: true });
    expect(result.rows[0]).toEqual({
      kind: 'unchanged',
      originalLineNumber: 1,
      changedLineNumber: 1,
      originalText: '  hello  ',
      changedText: 'hello',
    });
  });

  it('does not ignore internal whitespace differences', () => {
    const result = compareTexts('hello   world', 'hello world', { ignoreSurroundingWhitespace: true });
    expect(rowKinds(result.rows)).toEqual(['changed']);
  });

  it('applies ignoreCase and ignoreSurroundingWhitespace together', () => {
    const result = compareTexts('  HELLO  ', 'hello', {
      ignoreCase: true,
      ignoreSurroundingWhitespace: true,
    });
    expect(rowKinds(result.rows)).toEqual(['unchanged']);
    expect(result.rows[0]).toMatchObject({ originalText: '  HELLO  ', changedText: 'hello' });
  });

  it('does not highlight ignored surrounding whitespace on otherwise changed lines', () => {
    const row = changedRows(
      compareTexts('  hello old  ', 'hello new', { ignoreSurroundingWhitespace: true }).rows,
    )[0];
    expect(row.originalSegments[0]).toEqual({ kind: 'equal', text: '  ' });
    expect(row.originalSegments.at(-1)).toEqual({ kind: 'equal', text: '  ' });
    expect(row.originalSegments.filter((segment) => segment.kind === 'removed').map((segment) => segment.text).join('')).toBe('old');
  });

  it('applies ignoreCase to inline comparison without highlighting case-only tokens', () => {
    const row = changedRows(compareTexts('Hello old', 'hello new', { ignoreCase: true }).rows)[0];
    expect(row.originalSegments.some((segment) => segment.kind === 'removed' && /hello/i.test(segment.text))).toBe(false);
    expect(row.changedSegments.some((segment) => segment.kind === 'added' && /hello/i.test(segment.text))).toBe(false);
  });

  it('normalizes CRLF and LF line endings', () => {
    const result = compareTexts('alpha\r\nbeta', 'alpha\nbeta');
    expect(rowKinds(result.rows)).toEqual(['unchanged', 'unchanged']);
  });

  it('normalizes standalone CR line endings', () => {
    const result = compareTexts('alpha\rbeta', 'alpha\nbeta');
    expect(rowKinds(result.rows)).toEqual(['unchanged', 'unchanged']);
  });

  it('preserves trailing newline semantics as a trailing blank line', () => {
    const result = compareTexts('a\n', 'a');
    expect(result.stats.originalLineCount).toBe(2);
    expect(result.stats.changedLineCount).toBe(1);
    expect(rowKinds(result.rows)).toEqual(['unchanged', 'removed']);
    expect(result.rows[1]).toEqual({ kind: 'removed', originalLineNumber: 2, originalText: '' });
  });

  it('reconstructs both raw sides exactly for every changed row', () => {
    const result = compareTexts('  Hello, old world!  \nsecond old', ' hello: new world?\nsecond new', {
      ignoreCase: true,
      ignoreSurroundingWhitespace: true,
    });
    for (const row of changedRows(result.rows)) {
      expect(reconstructed(row.originalSegments)).toBe(row.originalText);
      expect(reconstructed(row.changedSegments)).toBe(row.changedText);
    }
  });

  it('keeps statistics consistent with emitted row kinds', () => {
    const result = compareTexts('same\nold\nremoved', 'same\nnew\nadded\nextra');
    const counts = result.rows.reduce(
      (accumulator, row) => ({ ...accumulator, [row.kind]: accumulator[row.kind] + 1 }),
      { unchanged: 0, changed: 0, added: 0, removed: 0 },
    );
    expect(result.stats).toEqual({
      originalLineCount: 3,
      changedLineCount: 4,
      unchangedLineCount: counts.unchanged,
      changedRowCount: counts.changed,
      addedLineCount: counts.added,
      removedLineCount: counts.removed,
    });
  });

  it('preserves raw differences on ignored-but-unchanged multiline rows', () => {
    const result = compareTexts(' Alpha \nBETA', 'alpha\nbeta ', {
      ignoreCase: true,
      ignoreSurroundingWhitespace: true,
    });
    expect(result.rows).toMatchObject([
      { kind: 'unchanged', originalText: ' Alpha ', changedText: 'alpha' },
      { kind: 'unchanged', originalText: 'BETA', changedText: 'beta ' },
    ]);
  });

  it('handles Unicode and emoji text without corruption', () => {
    const result = compareTexts('Hello 👋 world\nمرحبا', 'Hello 👋 brave world\nمرحبا');
    const row = changedRows(result.rows)[0];
    expect(row.originalText).toBe('Hello 👋 world');
    expect(row.changedText).toBe('Hello 👋 brave world');
    expect(reconstructed(row.originalSegments)).toBe(row.originalText);
    expect(reconstructed(row.changedSegments)).toBe(row.changedText);
    expect(result.rows[1]).toMatchObject({ kind: 'unchanged', originalText: 'مرحبا', changedText: 'مرحبا' });
  });
});
