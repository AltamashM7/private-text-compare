# Project overview

Private Text Compare is a privacy-first browser text diff tool for quickly inspecting differences between two pieces of text without creating an account or sending compared text to an application backend.

## Current product

The live product at https://textcompare.amosfot.in/ provides:
- line-aligned Original/Changed comparison;
- inline word-level detail within changed lines;
- ignore-case and ignore-surrounding-whitespace options;
- Swap, Clear, stale-result safety;
- local Copy diff, .diff export, and plain-text report export;
- responsive dark/light presentation.

Compared text and result state remain transient; only the harmless theme preference may persist.

## Search surface

The production site includes the tool homepage plus:
- /guides/compare-two-texts/
- /guides/line-vs-word-diff/

These are bounded static guides tied to real product behavior, not programmatic keyword variants. All three routes link to https://tools.amosfot.in/ and retain cross-tool discovery.

## Current release state

Current main before this documentation reconciliation is c71648799c6694765f2bd8fb1d097b32f61848d2. Guarded production run 33224830603 succeeded for that exact head; immutable Cloudflare deployment https://a62856aa.private-text-compare.pages.dev is infrastructure provenance, while the public/canonical origin is https://textcompare.amosfot.in/.

## Portfolio role

Private Text Compare is one of three live Amosfot browser utilities. The portfolio remains ad-free and analytics-free. Future product work or monetization requires separately approved scope.
