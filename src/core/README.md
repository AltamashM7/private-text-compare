# Core application boundary

Framework-independent application and domain logic belongs in `src/core/`.

Code in this directory must not depend on Astro components or Preact components. Reusable comparison logic should also avoid direct DOM dependencies so it can remain portable and testable.

Core logic will receive meaningful unit tests when that logic is first implemented. No fake domain implementation is added merely to populate this directory.
