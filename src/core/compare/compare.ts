import { diffArrays, diffWordsWithSpace } from 'diff';
import type {
  AddedRow,
  ChangedRow,
  CompareOptions,
  ComparisonResult,
  ComparisonRow,
  InlineSegment,
  RemovedRow,
  UnchangedRow,
} from './types';

interface LineToken {
  raw: string;
}

interface NumberedLine {
  lineNumber: number;
  text: string;
}

interface ResolvedOptions {
  ignoreCase: boolean;
  ignoreSurroundingWhitespace: boolean;
}

const DEFAULT_OPTIONS: ResolvedOptions = {
  ignoreCase: false,
  ignoreSurroundingWhitespace: false,
};

function resolveOptions(options: CompareOptions): ResolvedOptions {
  return {
    ignoreCase: options.ignoreCase ?? DEFAULT_OPTIONS.ignoreCase,
    ignoreSurroundingWhitespace:
      options.ignoreSurroundingWhitespace ?? DEFAULT_OPTIONS.ignoreSurroundingWhitespace,
  };
}

function splitLines(text: string): string[] {
  if (text === '') {
    return [];
  }

  return text.replace(/\r\n?/g, '\n').split('\n');
}

function comparableLine(raw: string, options: ResolvedOptions): string {
  let value = raw;

  if (options.ignoreSurroundingWhitespace) {
    value = value.trim();
  }

  if (options.ignoreCase) {
    value = value.toLowerCase();
  }

  return value;
}

function partitionSurroundingWhitespace(text: string): {
  prefix: string;
  core: string;
  suffix: string;
} {
  const prefix = text.match(/^\s*/u)?.[0] ?? '';
  const withoutPrefix = text.slice(prefix.length);
  const suffix = withoutPrefix.match(/\s*$/u)?.[0] ?? '';
  const core = withoutPrefix.slice(0, withoutPrefix.length - suffix.length);

  return { prefix, core, suffix };
}

function pushSegment(segments: InlineSegment[], segment: InlineSegment): void {
  if (segment.text === '') {
    return;
  }

  const previous = segments.at(-1);
  if (previous?.kind === segment.kind) {
    previous.text += segment.text;
    return;
  }

  segments.push({ ...segment });
}

function sourceSideSegments(
  source: string,
  target: string,
  sourceOnlyKind: 'removed' | 'added',
  options: ResolvedOptions,
): InlineSegment[] {
  const sourceParts = options.ignoreSurroundingWhitespace
    ? partitionSurroundingWhitespace(source)
    : { prefix: '', core: source, suffix: '' };
  const targetParts = options.ignoreSurroundingWhitespace
    ? partitionSurroundingWhitespace(target)
    : { prefix: '', core: target, suffix: '' };

  const segments: InlineSegment[] = [];
  pushSegment(segments, { kind: 'equal', text: sourceParts.prefix });

  // Put the side being rendered in JsDiff's "new" position. For equal chunks,
  // JsDiff preserves the new-side spelling/casing in change.value; added chunks
  // likewise contain source-side-only text. This keeps project-owned segments
  // byte-for-byte reconstructable even when ignoreCase is enabled.
  const changes = diffWordsWithSpace(targetParts.core, sourceParts.core, {
    ignoreCase: options.ignoreCase,
  });

  for (const change of changes) {
    if (change.removed) {
      continue;
    }

    pushSegment(segments, {
      kind: change.added ? sourceOnlyKind : 'equal',
      text: change.value,
    });
  }

  pushSegment(segments, { kind: 'equal', text: sourceParts.suffix });
  return segments;
}

function changedRow(
  original: NumberedLine,
  changed: NumberedLine,
  options: ResolvedOptions,
): ChangedRow {
  return {
    kind: 'changed',
    originalLineNumber: original.lineNumber,
    changedLineNumber: changed.lineNumber,
    originalText: original.text,
    changedText: changed.text,
    originalSegments: sourceSideSegments(original.text, changed.text, 'removed', options),
    changedSegments: sourceSideSegments(changed.text, original.text, 'added', options),
  };
}

function removedRow(line: NumberedLine): RemovedRow {
  return {
    kind: 'removed',
    originalLineNumber: line.lineNumber,
    originalText: line.text,
  };
}

function addedRow(line: NumberedLine): AddedRow {
  return {
    kind: 'added',
    changedLineNumber: line.lineNumber,
    changedText: line.text,
  };
}

function unchangedRow(original: NumberedLine, changed: NumberedLine): UnchangedRow {
  return {
    kind: 'unchanged',
    originalLineNumber: original.lineNumber,
    changedLineNumber: changed.lineNumber,
    originalText: original.text,
    changedText: changed.text,
  };
}

function numbered(lines: string[], startIndex: number, count: number): NumberedLine[] {
  return lines.slice(startIndex, startIndex + count).map((text, index) => ({
    lineNumber: startIndex + index + 1,
    text,
  }));
}

export function compareTexts(
  originalText: string,
  changedText: string,
  options: CompareOptions = {},
): ComparisonResult {
  const resolvedOptions = resolveOptions(options);
  const originalLines = splitLines(originalText);
  const changedLines = splitLines(changedText);
  const originalTokens: LineToken[] = originalLines.map((raw) => ({ raw }));
  const changedTokens: LineToken[] = changedLines.map((raw) => ({ raw }));

  const changes = diffArrays(originalTokens, changedTokens, {
    comparator: (left, right) =>
      comparableLine(left.raw, resolvedOptions) === comparableLine(right.raw, resolvedOptions),
  });

  const rows: ComparisonRow[] = [];
  let originalIndex = 0;
  let changedIndex = 0;

  for (let index = 0; index < changes.length; ) {
    const change = changes[index];

    if (!change.added && !change.removed) {
      const count = change.value.length;
      for (let offset = 0; offset < count; offset += 1) {
        rows.push(
          unchangedRow(
            { lineNumber: originalIndex + offset + 1, text: originalLines[originalIndex + offset] },
            { lineNumber: changedIndex + offset + 1, text: changedLines[changedIndex + offset] },
          ),
        );
      }
      originalIndex += count;
      changedIndex += count;
      index += 1;
      continue;
    }

    const removedLines: NumberedLine[] = [];
    const addedLines: NumberedLine[] = [];

    while (index < changes.length && (changes[index].added || changes[index].removed)) {
      const adjacentChange = changes[index];
      const count = adjacentChange.value.length;

      if (adjacentChange.removed) {
        removedLines.push(...numbered(originalLines, originalIndex, count));
        originalIndex += count;
      } else {
        addedLines.push(...numbered(changedLines, changedIndex, count));
        changedIndex += count;
      }

      index += 1;
    }

    const pairCount = Math.min(removedLines.length, addedLines.length);
    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      rows.push(changedRow(removedLines[pairIndex], addedLines[pairIndex], resolvedOptions));
    }

    for (const line of removedLines.slice(pairCount)) {
      rows.push(removedRow(line));
    }

    for (const line of addedLines.slice(pairCount)) {
      rows.push(addedRow(line));
    }
  }

  return {
    rows,
    stats: {
      originalLineCount: originalLines.length,
      changedLineCount: changedLines.length,
      unchangedLineCount: rows.filter((row) => row.kind === 'unchanged').length,
      changedRowCount: rows.filter((row) => row.kind === 'changed').length,
      addedLineCount: rows.filter((row) => row.kind === 'added').length,
      removedLineCount: rows.filter((row) => row.kind === 'removed').length,
    },
  };
}
