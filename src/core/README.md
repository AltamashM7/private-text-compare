# Core application boundary

`src/core/` contains framework-independent application and domain logic. It must not depend on Astro, Preact, browser DOM APIs, storage, or network services.

## Comparison engine

`compare/` exports the project-owned `compareTexts(originalText, changedText, options)` API and typed result model. The options default to strict comparison and can independently ignore case or leading/trailing whitespace on each line; internal whitespace remains meaningful. Raw text from both sides is retained even when an ignore option makes two lines equal.

CRLF and standalone CR line endings normalize to LF before line tokenization. An empty string has zero lines, while a trailing newline creates a trailing blank line.

Line matching uses JsDiff internally but does not expose JsDiff types. Adjacent remove/add blocks are treated as replacement regions and paired positionally up to the shorter block; leftovers remain removed or added rows. Changed rows contain project-owned inline segments for each side. Concatenating those segment texts is guaranteed to reproduce that side's exact raw line, including ignored surrounding whitespace.

The engine is deterministic and client-capable. It does not persist, log, transmit, or otherwise expose compared text.
