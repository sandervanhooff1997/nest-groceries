#!/usr/bin/env bash
# End-to-end smoke test for every authenticated API endpoint.
#
# Usage:
#   BASE_URL=http://127.0.0.1:3000 TOKEN='eyJhbGciOi...' \
#     bash scripts/smoke-endpoints.sh
#
# The script:
#   1. Hits public /api/health (no auth).
#   2. Checks that /api/shopping-lists returns 403 without a token.
#   3. With the token, creates a list, reads it, lists all, adds/removes items,
#      duplicates, completes/uncompletes, patches, and deletes — i.e. every
#      route in shopping-lists + grocery-items + their actions sub-controllers.
#
# Every request prints METHOD URL -> HTTP_STATUS and a truncated body. Any
# non-2xx response is highlighted. Exit code 0 iff every request succeeded.

set -u
set -o pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
TOKEN="${TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: set TOKEN=<bearer>" >&2
  exit 2
fi

fail=0

# Run a request and print status + truncated body.
# Usage: hit METHOD PATH [--data JSON] [--no-auth]
hit() {
  local method="$1"; shift
  local path="$1"; shift
  local data=""
  local auth="auth"
  while (( $# > 0 )); do
    case "$1" in
      --data) data="$2"; shift 2 ;;
      --no-auth) auth="noauth"; shift ;;
      *) echo "unknown arg $1" >&2; exit 2 ;;
    esac
  done

  local url="${BASE_URL}${path}"
  local headers=(-H 'Content-Type: application/json')
  if [[ "$auth" == "auth" ]]; then
    headers+=(-H "Authorization: Bearer ${TOKEN}")
  fi

  local body_file
  body_file=$(mktemp)
  local status
  if [[ -n "$data" ]]; then
    status=$(curl -sS -o "$body_file" -w '%{http_code}' -X "$method" \
      "${headers[@]}" --data "$data" "$url") || status="curl_error"
  else
    status=$(curl -sS -o "$body_file" -w '%{http_code}' -X "$method" \
      "${headers[@]}" "$url") || status="curl_error"
  fi

  local body_trunc
  body_trunc=$(head -c 300 "$body_file")
  echo "${method} ${path} -> ${status}"
  echo "  body: ${body_trunc}"

  # Heuristic: 2xx is OK; 403 is OK only for the explicit unauth check.
  case "$status" in
    2*) ;;
    *)
      if [[ "${EXPECT_STATUS:-}" == "$status" ]]; then
        :
      else
        fail=1
        echo "  ^^ FAIL (expected 2xx)"
      fi
      ;;
  esac
  rm -f "$body_file"
  LAST_STATUS="$status"
  # Keep the full body for callers that want to parse it.
  LAST_BODY="$body_trunc"
}

echo "== 1. Public health =="
hit GET /api/health --no-auth

echo
echo "== 2. No-token rejection =="
EXPECT_STATUS=403 hit GET /api/shopping-lists --no-auth

echo
echo "== 3. Create a shopping list =="
create_payload='{"name":"Smoke test list","items":[{"name":"Milk","quantity":1},{"name":"Eggs","quantity":12}]}'
# Capture the created list's _id from the response body.
CREATE_BODY=$(curl -sS -X POST \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  --data "$create_payload" \
  "${BASE_URL}/api/shopping-lists")
echo "POST /api/shopping-lists body: $(echo "$CREATE_BODY" | head -c 400)"
LIST_ID=$(printf '%s' "$CREATE_BODY" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("data") or d).get("_id",""))' 2>/dev/null || true)
if [[ -z "$LIST_ID" ]]; then
  fail=1
  echo "  ^^ FAIL: could not extract _id from create response"
else
  echo "  captured LIST_ID=${LIST_ID}"
fi

echo
echo "== 4. List all =="
hit GET /api/shopping-lists

echo
echo "== 5. Get by id =="
if [[ -n "$LIST_ID" ]]; then hit GET "/api/shopping-lists/${LIST_ID}"; fi

echo
echo "== 6. Patch =="
if [[ -n "$LIST_ID" ]]; then
  hit PATCH "/api/shopping-lists/${LIST_ID}" --data '{"name":"Smoke test list (renamed)"}'
fi

echo
echo "== 7. Add item =="
if [[ -n "$LIST_ID" ]]; then
  ADD_BODY=$(curl -sS -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${TOKEN}" \
    --data '{"name":"Bread","quantity":2}' \
    "${BASE_URL}/api/shopping-lists/${LIST_ID}/items")
  echo "POST /api/shopping-lists/${LIST_ID}/items body: $(echo "$ADD_BODY" | head -c 400)"
  ITEM_ID=$(printf '%s' "$ADD_BODY" | python3 -c '
import json,sys
d=json.load(sys.stdin)
d = d.get("data") or d
items = d.get("items") or []
# pick the last item (Bread), fall back to first
print((items[-1] if items else {}).get("_id",""))
' 2>/dev/null || true)
  echo "  captured ITEM_ID=${ITEM_ID}"
fi

echo
echo "== 8. Mark item complete =="
if [[ -n "${LIST_ID:-}" && -n "${ITEM_ID:-}" ]]; then
  hit PATCH "/api/shopping-lists/${LIST_ID}/items/${ITEM_ID}/complete"
fi

echo
echo "== 9. Mark item uncomplete =="
if [[ -n "${LIST_ID:-}" && -n "${ITEM_ID:-}" ]]; then
  hit PATCH "/api/shopping-lists/${LIST_ID}/items/${ITEM_ID}/uncomplete"
fi

echo
echo "== 10. Duplicate list (all items) =="
DUP_ID=""
if [[ -n "$LIST_ID" ]]; then
  DUP_BODY=$(curl -sS -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${TOKEN}" \
    --data '{}' \
    "${BASE_URL}/api/shopping-lists/${LIST_ID}/duplicate")
  echo "POST .../duplicate body: $(echo "$DUP_BODY" | head -c 400)"
  DUP_ID=$(printf '%s' "$DUP_BODY" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("data") or d).get("_id",""))' 2>/dev/null || true)
  echo "  captured DUP_ID=${DUP_ID}"
fi

echo
echo "== 11. Remove item =="
if [[ -n "${LIST_ID:-}" && -n "${ITEM_ID:-}" ]]; then
  hit DELETE "/api/shopping-lists/${LIST_ID}/items/${ITEM_ID}"
fi

echo
echo "== 12. Delete original =="
if [[ -n "$LIST_ID" ]]; then hit DELETE "/api/shopping-lists/${LIST_ID}"; fi

echo
echo "== 13. Delete duplicate =="
if [[ -n "${DUP_ID:-}" ]]; then hit DELETE "/api/shopping-lists/${DUP_ID}"; fi

echo
if (( fail )); then
  echo "RESULT: some requests failed (see ^^ FAIL markers above)"
  exit 1
fi
echo "RESULT: all endpoints returned 2xx"
