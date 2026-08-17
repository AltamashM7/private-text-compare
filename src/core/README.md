# Core application boundary

`src/core/` contains framework-independent application and domain logic. It must not depend on Astro, Preact, browser DOM APIs, storage, or network services.

## Comparison engine

`compare/` exports the project-owned `compareTexts(originalText, changedText, options)` API and typed result model. The options default to strict comparison and can independently ignore case or leading/trailing whitespace on each line; internal whitespace remains meaningful. Raw text from both sides is retained even when an ignore option makes two lines equal.

CRLF and standalone CR line endings normalize to LF before line tokenization. An empty string has zero lines, while a trailing newline creates a trailing blank line.

Line matching uses JsDiff internally but does not expose JsDiff types. Adjacent remove/add blocks are treated as replacement regions and paired positionally up to the shorter block; leftovers remain removed or added rows. Changed rows contain project-owned inline segments for each side. Concatenating those segment texts is guaranteed to reproduce that side's exact raw line, including ignored surrounding whitespace.

The engine is deterministic and client-capable. It does not persist, log, transmit, or otherwise expose compared text.

## Export serialization

`export/` is a framework-independent serializer layer downstream from the comparison engine. It consumes the project-owned `ComparisonResult` and returns strings; it does not import JsDiff, rerun comparison, or depend on Preact, Astro, DOM/clipboard APIs, Blob URLs, storage, or network APIs.

`serializeUnifiedDiff(result)` emits deterministic LF-only unified-style text with fixed `original.txt` / `changed.txt` headers. Semantic changed/added/removed rows become diff lines, unchanged context uses Original-side raw text, and hunks use three semantic context rows before and after differences. Overlapping or touching context windows merge; distant changes remain separate hunks. If the active comparison has no semantic differences, the output is only the two fixed headers.

`serializeComparisonReport(result, options)` emits a deterministic LF-only plain-text report containing summary counts, the comparison-option snapshot, and changed/added/removed rows only. No-difference reports retain summary/options and state that there are no differences under the selected options.

Exports intentionally preserve the active comparison semantics. If ignore-case or ignore-surrounding-whitespace causes raw lines to be semantically unchanged, serializers keep them unchanged rather than running a second strict diff. A resulting `.diff` is therefore a representation of the user's comparison result and is not guaranteed to be a byte-for-byte source-control patch when ignore options suppress raw differences.

Browser-specific copy and download handling lives outside `src/core/`. The UI may write a generated diff to the clipboard only after an explicit user action and may create local Blob downloads, but export payloads remain transient and are not persisted or transmitted.
