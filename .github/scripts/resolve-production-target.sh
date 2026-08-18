#!/usr/bin/env bash
set -euo pipefail

: "${EVENT_NAME:=}"
: "${EVENT_SHA:=}"
: "${EVENT_ACTOR:=}"
: "${EVENT_REF_TYPE:=}"
: "${EVENT_REF:=}"
: "${DISPATCH_TARGET_SHA:=}"

fail() {
  echo "$1" >&2
  exit 1
}

[[ "$EVENT_ACTOR" == "AltamashM7" ]] || fail "Production release actor is not approved."
[[ "$EVENT_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "Event SHA must be a full lowercase 40-character Git SHA."

case "$EVENT_NAME" in
  workflow_dispatch)
    [[ "$DISPATCH_TARGET_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "workflow_dispatch target_sha must be a full lowercase 40-character Git SHA."
    [[ "$DISPATCH_TARGET_SHA" == "$EVENT_SHA" ]] || fail "workflow_dispatch target_sha does not match the event SHA."
    printf '%s\n' "$DISPATCH_TARGET_SHA"
    ;;

  create)
    [[ "$EVENT_REF_TYPE" == "branch" ]] || fail "Production release create event must create a branch."
    if [[ "$EVENT_REF" =~ ^release/production/([0-9a-f]{40})-r([1-9][0-9]*)$ ]]; then
      TARGET_SHA="${BASH_REMATCH[1]}"
    else
      fail "Production release branch name is invalid."
    fi
    [[ "$TARGET_SHA" == "$EVENT_SHA" ]] || fail "Production release branch SHA does not match the event SHA."
    printf '%s\n' "$TARGET_SHA"
    ;;

  *)
    fail "Unsupported production release event."
    ;;
esac
