#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOLVER="$SCRIPT_DIR/resolve-production-target.sh"
SHA_A="0123456789abcdef0123456789abcdef01234567"
SHA_B="89abcdef0123456789abcdef0123456789abcdef"

run_valid() {
  local name="$1"
  local expected="$2"
  shift 2

  local output
  if ! output="$(env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" bash "$RESOLVER")"; then
    echo "FAIL valid case: $name" >&2
    exit 1
  fi
  if [[ "$output" != "$expected" ]]; then
    echo "FAIL valid case output: $name (got '$output')" >&2
    exit 1
  fi
  echo "PASS valid: $name"
}

run_invalid() {
  local name="$1"
  shift

  if env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" bash "$RESOLVER" >/tmp/production-target.out 2>/tmp/production-target.err; then
    echo "FAIL invalid case unexpectedly succeeded: $name" >&2
    cat /tmp/production-target.out >&2 || true
    exit 1
  fi
  echo "PASS invalid: $name"
}

run_valid "workflow_dispatch exact SHA" "$SHA_A" \
  EVENT_NAME=workflow_dispatch EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF=main DISPATCH_TARGET_SHA="$SHA_A"

run_valid "create release branch r1" "$SHA_A" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A}-r1" DISPATCH_TARGET_SHA=

run_valid "create release branch r2" "$SHA_A" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A}-r2" DISPATCH_TARGET_SHA=

run_invalid "wrong actor" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=someone-else \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A}-r1" DISPATCH_TARGET_SHA=

run_invalid "tag create" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=tag EVENT_REF="release/production/${SHA_A}-r1" DISPATCH_TARGET_SHA=

run_invalid "ordinary branch" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF=feature/example DISPATCH_TARGET_SHA=

run_invalid "wrong prefix" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/prod/${SHA_A}-r1" DISPATCH_TARGET_SHA=

run_invalid "missing retry suffix" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A}" DISPATCH_TARGET_SHA=

run_invalid "r0" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A}-r0" DISPATCH_TARGET_SHA=

run_invalid "negative retry" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A}-r-1" DISPATCH_TARGET_SHA=

run_invalid "garbage retry" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A}-rabc" DISPATCH_TARGET_SHA=

run_invalid "uppercase SHA" \
  EVENT_NAME=create EVENT_SHA="${SHA_A^^}" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A^^}-r1" DISPATCH_TARGET_SHA=

run_invalid "short SHA" \
  EVENT_NAME=create EVENT_SHA="${SHA_A:0:12}" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_A:0:12}-r1" DISPATCH_TARGET_SHA=

run_invalid "branch SHA differs from EVENT_SHA" \
  EVENT_NAME=create EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF="release/production/${SHA_B}-r1" DISPATCH_TARGET_SHA=

run_invalid "workflow_dispatch input differs from EVENT_SHA" \
  EVENT_NAME=workflow_dispatch EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF=main DISPATCH_TARGET_SHA="$SHA_B"

run_invalid "unsupported event" \
  EVENT_NAME=push EVENT_SHA="$SHA_A" EVENT_ACTOR=AltamashM7 \
  EVENT_REF_TYPE=branch EVENT_REF=main DISPATCH_TARGET_SHA=

echo "Production target resolver contract tests passed."
