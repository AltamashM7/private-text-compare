import type { ComparisonResult, ComparisonRow } from '../compare';

const CONTEXT_ROWS = 3;
const DIFF_HEADER = '--- original.txt\n+++ changed.txt\n';

export interface ComparisonExportOptions {
  ignoreCase: boolean;
  ignoreSurroundingWhitespace: boolean;
}

interface RowPosition {
  original: number;
  changed: number;
}

interface HunkWindow {
  start: number;
  end: number;
}

function isDifferent(row: ComparisonRow): boolean {
  return row.kind !== 'unchanged';
}

function originalConsumption(row: ComparisonRow): number {
  return row.kind === 'added' ? 0 : 1;
}

function changedConsumption(row: ComparisonRow): number {
  return row.kind === 'removed' ? 0 : 1;
}

function rowPositions(rows: ComparisonRow[]): RowPosition[] {
  const positions: RowPosition[] = [];
  let original = 1;
  let changed = 1;

  for (const row of rows) {
    positions.push({ original, changed });
    original += originalConsumption(row);
    changed += changedConsumption(row);
  }

  return positions;
}

function hunkWindows(rows: ComparisonRow[]): HunkWindow[] {
  const windows: HunkWindow[] = [];

  rows.forEach((row, index) => {
    if (!isDifferent(row)) return;

    const next: HunkWindow = {
      start: Math.max(0, index - CONTEXT_ROWS),
      end: Math.min(rows.length - 1, index + CONTEXT_ROWS),
    };
    const previous = windows.at(-1);

    if (previous && next.start <= previous.end + 1) {
      previous.end = Math.max(previous.end, next.end);
    } else {
      windows.push(next);
    }
  });

  return windows;
}

function hunkRange(
  rows: ComparisonRow[],
  positions: RowPosition[],
  window: HunkWindow,
): { originalStart: number; originalCount: number; changedStart: number; changedCount: number } {
  const slice = rows.slice(window.start, window.end + 1);
  const originalCount = slice.reduce((count, row) => count + originalConsumption(row), 0);
  const changedCount = slice.reduce((count, row) => count + changedConsumption(row), 0);
  const position = positions[window.start] ?? { original: 1, changed: 1 };

  return {
    originalStart: originalCount === 0 ? Math.max(0, position.original - 1) : position.original,
    originalCount,
    changedStart: changedCount === 0 ? Math.max(0, position.changed - 1) : position.changed,
    changedCount,
  };
}

function serializeDiffRow(row: ComparisonRow): string[] {
  switch (row.kind) {
    case 'unchanged':
      return [` ${row.originalText}`];
    case 'changed':
      return [`-${row.originalText}`, `+${row.changedText}`];
    case 'removed':
      return [`-${row.originalText}`];
    case 'added':
      return [`+${row.changedText}`];
  }
}

export function serializeUnifiedDiff(result: ComparisonResult): string {
  const windows = hunkWindows(result.rows);
  if (windows.length === 0) return DIFF_HEADER;

  const positions = rowPositions(result.rows);
  const hunks = windows.map((window) => {
    const range = hunkRange(result.rows, positions, window);
    const heading = `@@ -${range.originalStart},${range.originalCount} +${range.changedStart},${range.changedCount} @@`;
    const body = result.rows
      .slice(window.start, window.end + 1)
      .flatMap(serializeDiffRow);
    return [heading, ...body].join('\n');
  });

  return `${DIFF_HEADER}${hunks.join('\n')}\n`;
}

function optionState(value: boolean): 'on' | 'off' {
  return value ? 'on' : 'off';
}

function serializeReportDifference(row: ComparisonRow): string[] {
  switch (row.kind) {
    case 'unchanged':
      return [];
    case 'changed':
      return [
        `- Original ${row.originalLineNumber}: ${row.originalText}`,
        `+ Changed ${row.changedLineNumber}: ${row.changedText}`,
      ];
    case 'removed':
      return [`- Original ${row.originalLineNumber}: ${row.originalText}`];
    case 'added':
      return [`+ Changed ${row.changedLineNumber}: ${row.changedText}`];
  }
}

export function serializeComparisonReport(
  result: ComparisonResult,
  options: ComparisonExportOptions,
): string {
  const differences = result.rows.flatMap(serializeReportDifference);
  const differenceLines = differences.length > 0
    ? differences
    : ['No differences under the selected comparison options.'];

  return [
    'Private Text Compare report',
    '===========================',
    '',
    'Summary',
    `Original lines: ${result.stats.originalLineCount}`,
    `Changed lines: ${result.stats.changedLineCount}`,
    `Unchanged lines: ${result.stats.unchangedLineCount}`,
    `Changed rows: ${result.stats.changedRowCount}`,
    `Added lines: ${result.stats.addedLineCount}`,
    `Removed lines: ${result.stats.removedLineCount}`,
    '',
    'Comparison options',
    `Ignore case: ${optionState(options.ignoreCase)}`,
    `Ignore surrounding whitespace: ${optionState(options.ignoreSurroundingWhitespace)}`,
    '',
    'Differences',
    ...differenceLines,
    '',
  ].join('\n');
}
