import { describe, expect, test } from 'vitest';
import { compareTexts } from '../compare';
import {
  serializeComparisonReport,
  serializeUnifiedDiff,
} from './serialize';

const strictOptions = {
  ignoreCase: false,
  ignoreSurroundingWhitespace: false,
};

describe('serializeUnifiedDiff', () => {
  test('serializes one changed row', () => {
    const result = compareTexts('old', 'new');
    expect(serializeUnifiedDiff(result)).toBe(
      '--- original.txt\n+++ changed.txt\n@@ -1,1 +1,1 @@\n-old\n+new\n',
    );
  });

  test('serializes one added row', () => {
    const result = compareTexts('', 'added');
    expect(serializeUnifiedDiff(result)).toBe(
      '--- original.txt\n+++ changed.txt\n@@ -0,0 +1,1 @@\n+added\n',
    );
  });

  test('serializes one removed row', () => {
    const result = compareTexts('removed', '');
    expect(serializeUnifiedDiff(result)).toBe(
      '--- original.txt\n+++ changed.txt\n@@ -1,1 +0,0 @@\n-removed\n',
    );
  });

  test('serializes mixed changed added and removed rows from engine semantics', () => {
    const result = compareTexts('one\ntwo\nthree\nfour', 'ONE\ntwo\nextra');
    const output = serializeUnifiedDiff(result);
    expect(output).toContain('-one\n+ONE');
    expect(output).toContain(' two');
    expect(output).toContain('-three');
    expect(output).toContain('-four');
    expect(output).toContain('+extra');
  });

  test('includes three semantic context rows before and after a difference', () => {
    const original = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].join('\n');
    const changed = ['a', 'b', 'c', 'D', 'e', 'f', 'g', 'h'].join('\n');
    const output = serializeUnifiedDiff(compareTexts(original, changed));
    expect(output).toContain('@@ -1,7 +1,7 @@');
    expect(output).toContain(' a\n b\n c\n-d\n+D\n e\n f\n g\n');
    expect(output).not.toContain(' h\n');
  });

  test('splits distant changes into separate hunks', () => {
    const original = Array.from({ length: 14 }, (_, index) => `line ${index + 1}`);
    const changed = [...original];
    changed[1] = 'changed 2';
    changed[12] = 'changed 13';
    const output = serializeUnifiedDiff(compareTexts(original.join('\n'), changed.join('\n')));
    expect(output.match(/^@@ /gm)).toHaveLength(2);
  });

  test('merges nearby context windows into one hunk when they touch', () => {
    const original = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`);
    const changed = [...original];
    changed[1] = 'changed 2';
    changed[8] = 'changed 9';
    const output = serializeUnifiedDiff(compareTexts(original.join('\n'), changed.join('\n')));
    expect(output.match(/^@@ /gm)).toHaveLength(1);
  });

  test('uses original and changed consumption counts for hunk ranges', () => {
    const result = compareTexts('keep\nremove one\nremove two\ntail', 'keep\nadd\ntail');
    expect(serializeUnifiedDiff(result)).toContain('@@ -1,4 +1,3 @@');
  });

  test('uses zero original count for insertion into an empty original region', () => {
    const result = compareTexts('', 'first\nsecond');
    expect(serializeUnifiedDiff(result)).toContain('@@ -0,0 +1,2 @@');
  });

  test('uses zero changed count for deletion into an empty changed region', () => {
    const result = compareTexts('first\nsecond', '');
    expect(serializeUnifiedDiff(result)).toContain('@@ -1,2 +0,0 @@');
  });

  test('returns only fixed headers for both semantically empty inputs', () => {
    expect(serializeUnifiedDiff(compareTexts('', ''))).toBe(
      '--- original.txt\n+++ changed.txt\n',
    );
  });

  test('returns only fixed headers for identical text', () => {
    expect(serializeUnifiedDiff(compareTexts('same\ntext', 'same\ntext'))).toBe(
      '--- original.txt\n+++ changed.txt\n',
    );
  });

  test('respects ignore-case semantic unchanged rows', () => {
    const result = compareTexts('Hello', 'hello', { ignoreCase: true });
    expect(serializeUnifiedDiff(result)).toBe('--- original.txt\n+++ changed.txt\n');
  });

  test('respects ignore-surrounding-whitespace semantic unchanged rows', () => {
    const result = compareTexts('  hello\t', 'hello', { ignoreSurroundingWhitespace: true });
    expect(serializeUnifiedDiff(result)).toBe('--- original.txt\n+++ changed.txt\n');
  });

  test('preserves spaces and tabs inside serialized lines', () => {
    const result = compareTexts('\told  value', '\tnew  value');
    expect(serializeUnifiedDiff(result)).toContain('-\told  value\n+\tnew  value\n');
  });

  test('preserves Unicode and emoji', () => {
    const result = compareTexts('café 😀', 'café 🚀');
    expect(serializeUnifiedDiff(result)).toContain('-café 😀\n+café 🚀\n');
  });

  test('normalizes input line endings through the comparison result and emits LF only', () => {
    const result = compareTexts('one\r\ntwo', 'one\r\nTWO');
    const output = serializeUnifiedDiff(result);
    expect(output).not.toContain('\r');
    expect(output).toContain(' one\n-two\n+TWO\n');
  });

  test('always ends diff output with a final LF', () => {
    expect(serializeUnifiedDiff(compareTexts('a', 'b')).endsWith('\n')).toBe(true);
    expect(serializeUnifiedDiff(compareTexts('a', 'a')).endsWith('\n')).toBe(true);
  });

  test('preserves the comparison engine trailing-newline line model without markers', () => {
    const output = serializeUnifiedDiff(compareTexts('a', 'a\n'));
    expect(output).toContain(' a\n+\n');
    expect(output).not.toContain('No newline at end of file');
  });

  test('uses original-side raw text for unchanged semantic context', () => {
    const result = compareTexts('  keep  \nold', 'keep\nnew', {
      ignoreSurroundingWhitespace: true,
    });
    expect(serializeUnifiedDiff(result)).toContain('   keep  \n-old\n+new\n');
  });
});

describe('serializeComparisonReport', () => {
  test('uses the stable report heading and all summary counts', () => {
    const result = compareTexts('one\ntwo\nthree\nfour', 'ONE\ntwo\nextra');
    const report = serializeComparisonReport(result, strictOptions);
    expect(report.startsWith('Private Text Compare report\n===========================\n')).toBe(true);
    expect(report).toContain('Original lines: 4\n');
    expect(report).toContain('Changed lines: 3\n');
    expect(report).toContain('Unchanged lines: 1\n');
    expect(report).toContain('Changed rows: 2\n');
    expect(report).toContain('Added lines: 0\n');
    expect(report).toContain('Removed lines: 1\n');
  });

  test('reports option values deterministically as on and off', () => {
    const result = compareTexts('a', 'b');
    expect(serializeComparisonReport(result, {
      ignoreCase: true,
      ignoreSurroundingWhitespace: false,
    })).toContain('Ignore case: on\nIgnore surrounding whitespace: off\n');
  });

  test('serializes changed rows with original and changed line labels', () => {
    const report = serializeComparisonReport(compareTexts('old', 'new'), strictOptions);
    expect(report).toContain('Differences\n- Original 1: old\n+ Changed 1: new\n');
  });

  test('serializes added rows', () => {
    const report = serializeComparisonReport(compareTexts('', 'new'), strictOptions);
    expect(report).toContain('Differences\n+ Changed 1: new\n');
  });

  test('serializes removed rows', () => {
    const report = serializeComparisonReport(compareTexts('old', ''), strictOptions);
    expect(report).toContain('Differences\n- Original 1: old\n');
  });

  test('omits unchanged rows from Differences', () => {
    const report = serializeComparisonReport(compareTexts('keep\nold', 'keep\nnew'), strictOptions);
    expect(report).not.toContain('Original 1: keep');
    expect(report).not.toContain('Changed 1: keep');
  });

  test('uses the exact no-difference message while retaining summary and options', () => {
    const report = serializeComparisonReport(compareTexts('same', 'same'), strictOptions);
    expect(report).toContain('Summary\nOriginal lines: 1\nChanged lines: 1\n');
    expect(report).toContain('Comparison options\nIgnore case: off\nIgnore surrounding whitespace: off\n');
    expect(report).toContain('Differences\nNo differences under the selected comparison options.\n');
  });

  test('preserves Unicode and emoji in report differences', () => {
    const report = serializeComparisonReport(compareTexts('café 😀', 'café 🚀'), strictOptions);
    expect(report).toContain('- Original 1: café 😀\n+ Changed 1: café 🚀\n');
  });

  test('preserves whitespace inside report difference text', () => {
    const report = serializeComparisonReport(compareTexts('\told  ', '\tnew  '), strictOptions);
    expect(report).toContain('- Original 1: \told  \n+ Changed 1: \tnew  \n');
  });

  test('is deterministic, LF-only, timestamp-free, and ends with LF', () => {
    const result = compareTexts('old', 'new');
    const first = serializeComparisonReport(result, strictOptions);
    const second = serializeComparisonReport(result, strictOptions);
    expect(first).toBe(second);
    expect(first).not.toContain('\r');
    expect(first).not.toMatch(/generated|timestamp|https?:\/\//i);
    expect(first.endsWith('\n')).toBe(true);
  });

  test('reports ignore semantics while preserving no-difference outcome', () => {
    const result = compareTexts('Hello', 'hello', { ignoreCase: true });
    const report = serializeComparisonReport(result, {
      ignoreCase: true,
      ignoreSurroundingWhitespace: false,
    });
    expect(report).toContain('Ignore case: on');
    expect(report).toContain('No differences under the selected comparison options.');
  });
});
