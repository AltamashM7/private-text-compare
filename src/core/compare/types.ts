export interface CompareOptions {
  ignoreCase?: boolean;
  ignoreSurroundingWhitespace?: boolean;
}

export type InlineSegmentKind = 'equal' | 'removed' | 'added';

export interface InlineSegment {
  kind: InlineSegmentKind;
  text: string;
}

export interface UnchangedRow {
  kind: 'unchanged';
  originalLineNumber: number;
  changedLineNumber: number;
  originalText: string;
  changedText: string;
}

export interface ChangedRow {
  kind: 'changed';
  originalLineNumber: number;
  changedLineNumber: number;
  originalText: string;
  changedText: string;
  originalSegments: InlineSegment[];
  changedSegments: InlineSegment[];
}

export interface RemovedRow {
  kind: 'removed';
  originalLineNumber: number;
  originalText: string;
}

export interface AddedRow {
  kind: 'added';
  changedLineNumber: number;
  changedText: string;
}

export type ComparisonRow = UnchangedRow | ChangedRow | RemovedRow | AddedRow;

export interface ComparisonStats {
  originalLineCount: number;
  changedLineCount: number;
  unchangedLineCount: number;
  changedRowCount: number;
  addedLineCount: number;
  removedLineCount: number;
}

export interface ComparisonResult {
  rows: ComparisonRow[];
  stats: ComparisonStats;
}
