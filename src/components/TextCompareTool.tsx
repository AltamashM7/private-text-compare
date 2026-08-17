import { useState } from 'preact/hooks';
import { compareTexts } from '../core/compare';
import type {
  ComparisonResult,
  ComparisonRow,
  InlineSegment,
} from '../core/compare';

const INITIAL_RESULT_MESSAGE = 'Add text above and press Compare to see the differences.';

const ROW_STYLES: Record<ComparisonRow['kind'], string> = {
  unchanged: 'border-slate-200 bg-white',
  changed: 'border-amber-200 bg-amber-50/50',
  added: 'border-emerald-200 bg-emerald-50/50',
  removed: 'border-rose-200 bg-rose-50/50',
};

const BADGE_STYLES: Record<ComparisonRow['kind'], string> = {
  unchanged: 'border-slate-200 bg-slate-100 text-slate-700',
  changed: 'border-amber-300 bg-amber-100 text-amber-900',
  added: 'border-emerald-300 bg-emerald-100 text-emerald-900',
  removed: 'border-rose-300 bg-rose-100 text-rose-900',
};

const ROW_LABELS: Record<ComparisonRow['kind'], string> = {
  unchanged: 'Unchanged',
  changed: 'Changed',
  added: 'Added',
  removed: 'Removed',
};

interface LineCellProps {
  side: 'Original' | 'Changed';
  lineNumber?: number;
  text?: string;
  segments?: InlineSegment[];
  emptyLabel?: string;
}

function InlineText({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        const key = `${segment.kind}-${index}`;

        if (segment.kind === 'removed') {
          return (
            <del
              key={key}
              data-inline-kind="removed"
              class="bg-rose-200/80 text-rose-950 decoration-rose-700 decoration-2"
            >
              {segment.text}
            </del>
          );
        }

        if (segment.kind === 'added') {
          return (
            <ins
              key={key}
              data-inline-kind="added"
              class="bg-emerald-200/80 text-emerald-950 no-underline ring-1 ring-inset ring-emerald-300/70"
            >
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
  return (
    <div class="min-w-0 border-t border-slate-200 first:border-t-0 md:border-t-0 md:first:border-t-0 md:first:border-r">
      <div class="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
        <span>{side}</span>
        {lineNumber !== undefined ? (
          <span aria-label={`${side} line ${lineNumber}`} class="font-mono tabular-nums text-slate-500">
            Line {lineNumber}
          </span>
        ) : (
          <span aria-hidden="true" class="h-4" />
        )}
      </div>
      {text !== undefined ? (
        <pre class="diff-text min-h-12 m-0 px-3 py-3 font-mono text-sm leading-6 text-slate-900">
          {segments ? <InlineText segments={segments} /> : text}
        </pre>
      ) : (
        <div
          class="min-h-12 bg-slate-100/70 px-3 py-3"
          aria-label={emptyLabel}
        >
          <span class="sr-only">{emptyLabel}</span>
        </div>
      )}
    </div>
  );
}

function ComparisonRowView({ row }: { row: ComparisonRow }) {
  const originalLineNumber =
    row.kind === 'added' ? undefined : row.originalLineNumber;
  const changedLineNumber =
    row.kind === 'removed' ? undefined : row.changedLineNumber;
  const originalText = row.kind === 'added' ? undefined : row.originalText;
  const changedText = row.kind === 'removed' ? undefined : row.changedText;

  return (
    <article
      data-row-kind={row.kind}
      class={`overflow-hidden rounded-xl border ${ROW_STYLES[row.kind]}`}
      aria-label={`${ROW_LABELS[row.kind]} comparison row`}
    >
      <div class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-3 py-2">
        <span
          class={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${BADGE_STYLES[row.kind]}`}
        >
          {row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : row.kind === 'changed' ? '↔' : '✓'}
          <span class="ml-1.5">{ROW_LABELS[row.kind]}</span>
        </span>
      </div>
      <div class="grid md:grid-cols-2">
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
      </div>
    </article>
  );
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div class={`rounded-xl border px-3 py-2 ${tone}`}>
      <div class="text-xs font-semibold uppercase tracking-[0.1em]">{label}</div>
      <div class="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

export default function TextCompareTool() {
  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreSurroundingWhitespace, setIgnoreSurroundingWhitespace] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [stale, setStale] = useState(false);
  const [announcement, setAnnouncement] = useState(INITIAL_RESULT_MESSAGE);

  const markResultStale = () => {
    if (result !== null && !stale) {
      setStale(true);
      setAnnouncement('Inputs changed — compare again to refresh the result.');
    }
  };

  const runComparison = () => {
    const nextResult = compareTexts(originalText, changedText, {
      ignoreCase,
      ignoreSurroundingWhitespace,
    });
    setResult(nextResult);
    setStale(false);
    setAnnouncement(
      `Comparison complete. ${nextResult.stats.changedRowCount} changed, ${nextResult.stats.addedLineCount} added, and ${nextResult.stats.removedLineCount} removed lines.`,
    );
  };

  const swapInputs = () => {
    setOriginalText(changedText);
    setChangedText(originalText);
    setResult(null);
    setStale(false);
    setAnnouncement('Inputs swapped. Press Compare to generate a new result.');
  };

  const clearComparison = () => {
    setOriginalText('');
    setChangedText('');
    setResult(null);
    setStale(false);
    setAnnouncement(INITIAL_RESULT_MESSAGE);
  };

  return (
    <div class="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div class="border-b border-slate-200 px-4 py-4 sm:px-6">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-950">Compare text</h2>
            <p class="mt-1 text-sm leading-6 text-slate-600">
              Paste two versions, choose how differences should be treated, then compare when you are ready.
            </p>
          </div>
          <div class="flex flex-wrap gap-2" aria-label="Comparison actions">
            <button
              type="button"
              onClick={swapInputs}
              class="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Swap
            </button>
            <button
              type="button"
              onClick={clearComparison}
              class="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={runComparison}
              class="min-h-11 rounded-lg bg-indigo-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Compare
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="min-w-0">
            <label for="original-text" class="mb-2 block text-sm font-semibold text-slate-900">
              Original
            </label>
            <textarea
              id="original-text"
              value={originalText}
              onInput={(event) => {
                setOriginalText(event.currentTarget.value);
                markResultStale();
              }}
              placeholder="Paste the original text here…"
              spellcheck={false}
              class="min-h-52 w-full resize-y rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-3 font-mono text-sm leading-6 text-slate-950 shadow-inner shadow-slate-900/[0.02] placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-3 focus:outline-offset-1 focus:outline-indigo-200"
            />
          </div>
          <div class="min-w-0">
            <label for="changed-text" class="mb-2 block text-sm font-semibold text-slate-900">
              Changed
            </label>
            <textarea
              id="changed-text"
              value={changedText}
              onInput={(event) => {
                setChangedText(event.currentTarget.value);
                markResultStale();
              }}
              placeholder="Paste the changed text here…"
              spellcheck={false}
              class="min-h-52 w-full resize-y rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-3 font-mono text-sm leading-6 text-slate-950 shadow-inner shadow-slate-900/[0.02] placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-3 focus:outline-offset-1 focus:outline-indigo-200"
            />
          </div>
        </div>

        <fieldset class="mt-5">
          <legend class="text-sm font-semibold text-slate-900">Comparison options</legend>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-5">
            <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(event) => {
                  setIgnoreCase(event.currentTarget.checked);
                  markResultStale();
                }}
                class="h-5 w-5 rounded border-slate-300 text-indigo-700 accent-indigo-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              />
              <span>Ignore case</span>
            </label>
            <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={ignoreSurroundingWhitespace}
                onChange={(event) => {
                  setIgnoreSurroundingWhitespace(event.currentTarget.checked);
                  markResultStale();
                }}
                class="h-5 w-5 rounded border-slate-300 text-indigo-700 accent-indigo-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              />
              <span>Ignore surrounding whitespace</span>
            </label>
          </div>
        </fieldset>
      </div>

      <section
        class="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6"
        aria-labelledby="comparison-results-heading"
        data-result-state={result === null ? 'empty' : stale ? 'stale' : 'current'}
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="comparison-results-heading" class="text-lg font-semibold text-slate-950">
              Comparison result
            </h2>
            <p role="status" aria-live="polite" aria-atomic="true" class="mt-1 text-sm text-slate-600">
              {announcement}
            </p>
          </div>
          {result !== null ? (
            <div class="flex flex-wrap gap-2 text-xs font-medium text-slate-600" aria-label="Result legend">
              <span class="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-amber-900">Changed</span>
              <span class="rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-emerald-900">Added</span>
              <span class="rounded-full border border-rose-300 bg-rose-100 px-2.5 py-1 text-rose-900">Removed</span>
            </div>
          ) : null}
        </div>

        {stale ? (
          <div class="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
            Inputs changed — compare again to refresh the result.
          </div>
        ) : null}

        {result === null ? (
          <div class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
            {INITIAL_RESULT_MESSAGE}
          </div>
        ) : (
          <>
            <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatPill label="Unchanged" value={result.stats.unchangedLineCount} tone="border-slate-200 bg-white text-slate-800" />
              <StatPill label="Changed" value={result.stats.changedRowCount} tone="border-amber-200 bg-amber-50 text-amber-950" />
              <StatPill label="Added" value={result.stats.addedLineCount} tone="border-emerald-200 bg-emerald-50 text-emerald-950" />
              <StatPill label="Removed" value={result.stats.removedLineCount} tone="border-rose-200 bg-rose-50 text-rose-950" />
            </div>
            <p class="mt-2 text-xs text-slate-500">
              Original: {result.stats.originalLineCount} lines · Changed: {result.stats.changedLineCount} lines
            </p>

            {result.rows.length === 0 ? (
              <div class="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
                No lines to compare.
              </div>
            ) : (
              <div class="mt-5 space-y-3" aria-label="Line comparison rows">
                {result.rows.map((row, index) => (
                  <ComparisonRowView row={row} key={`${row.kind}-${index}`} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
