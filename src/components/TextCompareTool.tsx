import { useState } from 'preact/hooks';
import { compareTexts } from '../core/compare';
import type {
  ComparisonResult,
  ComparisonRow,
  InlineSegment,
} from '../core/compare';
import {
  serializeComparisonReport,
  serializeUnifiedDiff,
} from '../core/export';
import type { ComparisonExportOptions } from '../core/export';

const INITIAL_RESULT_MESSAGE = 'Add text above and press Compare to see the differences.';
const DIFF_FILENAME = 'private-text-compare.diff';
const REPORT_FILENAME = 'private-text-compare-report.txt';

const ROW_META: Record<
  ComparisonRow['kind'],
  { label: string; symbol: string }
> = {
  unchanged: { label: 'Unchanged', symbol: '=' },
  changed: { label: 'Changed', symbol: '~' },
  added: { label: 'Added', symbol: '+' },
  removed: { label: 'Removed', symbol: '−' },
};

interface LineCellProps {
  side: 'Original' | 'Changed';
  lineNumber?: number;
  text?: string;
  segments?: InlineSegment[];
  emptyLabel: string;
}

function downloadText(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function InlineText({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        const key = `${segment.kind}-${index}`;

        if (segment.kind === 'removed') {
          return (
            <del key={key} data-inline-kind="removed" class="diff-inline diff-inline--removed">
              {segment.text}
            </del>
          );
        }

        if (segment.kind === 'added') {
          return (
            <ins key={key} data-inline-kind="added" class="diff-inline diff-inline--added">
              {segment.text}
            </ins>
          );
        }

        return <span key={key}>{segment.text}</span>;
      })}
    </>
  );
}

function LineCell({ side, lineNumber, text, segments, emptyLabel }: LineCellProps) {
  const sideClass = side === 'Original' ? 'original' : 'changed';

  return (
    <div class={`diff-cell diff-cell--${sideClass}${text === undefined ? ' diff-cell--empty' : ''}`}>
      <div class="diff-line-meta">
        <span class="diff-mobile-side">{side}</span>
        {lineNumber !== undefined ? (
          <span aria-label={`${side} line ${lineNumber}`} class="diff-line-number">
            {lineNumber}
          </span>
        ) : (
          <span aria-hidden="true" class="diff-line-number diff-line-number--empty">—</span>
        )}
      </div>
      {text !== undefined ? (
        <pre class="diff-text">{segments ? <InlineText segments={segments} /> : text}</pre>
      ) : (
        <div class="diff-empty" aria-label={emptyLabel}>
          <span class="sr-only">{emptyLabel}</span>
        </div>
      )}
    </div>
  );
}

function ComparisonRowView({ row }: { row: ComparisonRow }) {
  const originalLineNumber = row.kind === 'added' ? undefined : row.originalLineNumber;
  const changedLineNumber = row.kind === 'removed' ? undefined : row.changedLineNumber;
  const originalText = row.kind === 'added' ? undefined : row.originalText;
  const changedText = row.kind === 'removed' ? undefined : row.changedText;
  const meta = ROW_META[row.kind];

  return (
    <article
      data-row-kind={row.kind}
      class={`diff-row diff-row--${row.kind}`}
      aria-label={`${meta.label} comparison row`}
    >
      <div class="diff-row-status" aria-hidden="true">
        <span class="diff-row-symbol">{meta.symbol}</span>
        <span class="diff-row-status-text">{meta.label}</span>
      </div>
      <LineCell
        side="Original"
        lineNumber={originalLineNumber}
        text={originalText}
        segments={row.kind === 'changed' ? row.originalSegments : undefined}
        emptyLabel="No corresponding original line"
      />
      <LineCell
        side="Changed"
        lineNumber={changedLineNumber}
        text={changedText}
        segments={row.kind === 'changed' ? row.changedSegments : undefined}
        emptyLabel="No corresponding changed line"
      />
    </article>
  );
}

function ResultStats({ result }: { result: ComparisonResult }) {
  return (
    <div class="result-stats" aria-label="Comparison statistics">
      <span><strong>{result.stats.unchangedLineCount}</strong> unchanged</span>
      <span class="stat-changed"><strong>{result.stats.changedRowCount}</strong> changed</span>
      <span class="stat-added"><strong>{result.stats.addedLineCount}</strong> added</span>
      <span class="stat-removed"><strong>{result.stats.removedLineCount}</strong> removed</span>
    </div>
  );
}

export default function TextCompareTool() {
  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreSurroundingWhitespace, setIgnoreSurroundingWhitespace] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [resultOptions, setResultOptions] = useState<ComparisonExportOptions | null>(null);
  const [stale, setStale] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState(INITIAL_RESULT_MESSAGE);

  const markResultStale = () => {
    if (result !== null && !stale) {
      setStale(true);
      setCopied(false);
      setAnnouncement('Inputs changed — compare again to refresh the result.');
    }
  };

  const runComparison = () => {
    const options: ComparisonExportOptions = {
      ignoreCase,
      ignoreSurroundingWhitespace,
    };
    const nextResult = compareTexts(originalText, changedText, options);
    setResult(nextResult);
    setResultOptions(options);
    setStale(false);
    setCopied(false);
    setAnnouncement(
      `Comparison complete. ${nextResult.stats.changedRowCount} changed, ${nextResult.stats.addedLineCount} added, and ${nextResult.stats.removedLineCount} removed lines.`,
    );
  };

  const swapInputs = () => {
    setOriginalText(changedText);
    setChangedText(originalText);
    setResult(null);
    setResultOptions(null);
    setStale(false);
    setCopied(false);
    setAnnouncement('Inputs swapped. Press Compare to generate a new result.');
  };

  const clearComparison = () => {
    setOriginalText('');
    setChangedText('');
    setResult(null);
    setResultOptions(null);
    setStale(false);
    setCopied(false);
    setAnnouncement(INITIAL_RESULT_MESSAGE);
  };

  const copyDiff = async () => {
    if (result === null || stale) return;

    try {
      await navigator.clipboard.writeText(serializeUnifiedDiff(result));
      setCopied(true);
      setAnnouncement('Unified diff copied to clipboard.');
    } catch {
      setCopied(false);
      setAnnouncement('Clipboard access was blocked. Download the .diff file instead.');
    }
  };

  const downloadDiff = () => {
    if (result === null || stale) return;
    downloadText(
      serializeUnifiedDiff(result),
      DIFF_FILENAME,
      'text/x-diff;charset=utf-8',
    );
    setAnnouncement('Unified diff downloaded.');
  };

  const downloadReport = () => {
    if (result === null || resultOptions === null || stale) return;
    downloadText(
      serializeComparisonReport(result, resultOptions),
      REPORT_FILENAME,
      'text/plain;charset=utf-8',
    );
    setAnnouncement('Text report downloaded.');
  };

  return (
    <div class="compare-tool">
      <section class="compare-workspace" aria-labelledby="comparison-workspace-heading">
        <h2 id="comparison-workspace-heading" class="sr-only">Text comparison workspace</h2>

        <div class="editor-grid">
          <div class="editor-pane">
            <div class="editor-heading">
              <label for="original-text">Original</label>
              <span aria-hidden="true">A</span>
            </div>
            <textarea
              id="original-text"
              value={originalText}
              onInput={(event) => {
                setOriginalText(event.currentTarget.value);
                markResultStale();
              }}
              placeholder="Paste the original text here…"
              spellcheck={false}
              class="editor-textarea"
            />
          </div>

          <div class="editor-pane">
            <div class="editor-heading">
              <label for="changed-text">Changed</label>
              <span aria-hidden="true">B</span>
            </div>
            <textarea
              id="changed-text"
              value={changedText}
              onInput={(event) => {
                setChangedText(event.currentTarget.value);
                markResultStale();
              }}
              placeholder="Paste the changed text here…"
              spellcheck={false}
              class="editor-textarea"
            />
          </div>
        </div>

        <div class="workspace-toolbar">
          <fieldset class="comparison-options">
            <legend class="sr-only">Comparison options</legend>
            <label class="option-control">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(event) => {
                  setIgnoreCase(event.currentTarget.checked);
                  markResultStale();
                }}
              />
              <span>Ignore case</span>
            </label>
            <label class="option-control">
              <input
                type="checkbox"
                checked={ignoreSurroundingWhitespace}
                onChange={(event) => {
                  setIgnoreSurroundingWhitespace(event.currentTarget.checked);
                  markResultStale();
                }}
              />
              <span>Ignore surrounding whitespace</span>
            </label>
          </fieldset>

          <div class="workspace-actions" aria-label="Comparison actions">
            <button type="button" onClick={swapInputs} class="button button--secondary">Swap</button>
            <button type="button" onClick={clearComparison} class="button button--secondary">Clear</button>
            <button type="button" onClick={runComparison} class="button button--primary">Compare</button>
          </div>
        </div>
      </section>

      <section
        class="results-panel"
        aria-labelledby="comparison-results-heading"
        data-result-state={result === null ? 'empty' : stale ? 'stale' : 'current'}
      >
        <header class="results-header">
          <div class="results-heading-row">
            <div>
              <p class="section-kicker">Diff</p>
              <h2 id="comparison-results-heading">Comparison result</h2>
            </div>
            {result !== null ? <ResultStats result={result} /> : null}
          </div>

          <p role="status" aria-live="polite" aria-atomic="true" class="result-status">
            {announcement}
          </p>

          {result !== null ? (
            <div class="result-meta-row">
              <div class="result-meta-summary">
                <p class="result-line-counts">
                  Original: {result.stats.originalLineCount} lines · Changed: {result.stats.changedLineCount} lines
                </p>
                <div class="result-legend" aria-label="Result legend">
                  <span><b>~</b> Changed</span>
                  <span><b>+</b> Added</span>
                  <span><b>−</b> Removed</span>
                </div>
              </div>
              <div class="result-actions" aria-label="Result export actions">
                <button
                  type="button"
                  class="result-action-button"
                  disabled={stale}
                  onClick={copyDiff}
                >
                  {copied ? 'Copied' : 'Copy diff'}
                </button>
                <button
                  type="button"
                  class="result-action-button"
                  disabled={stale}
                  onClick={downloadDiff}
                >
                  Download .diff
                </button>
                <button
                  type="button"
                  class="result-action-button"
                  disabled={stale}
                  onClick={downloadReport}
                >
                  Download .txt
                </button>
              </div>
            </div>
          ) : null}
        </header>

        {stale ? (
          <div class="stale-notice">Inputs changed — compare again to refresh the result.</div>
        ) : null}

        {result === null ? (
          <div class="result-empty">{INITIAL_RESULT_MESSAGE}</div>
        ) : result.rows.length === 0 ? (
          <div class="result-empty">No lines to compare.</div>
        ) : (
          <div class="diff-editor" aria-label="Line comparison rows">
            <div class="diff-column-headings" aria-hidden="true">
              <span />
              <span>Original</span>
              <span>Changed</span>
            </div>
            <div class="diff-rows">
              {result.rows.map((row, index) => (
                <ComparisonRowView row={row} key={`${row.kind}-${index}`} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
