#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export GITHUB_TOKEN=ghp_yourtoken
#   export GITHUB_REPO="username/repo"   # e.g., ehfuzzz/mile-buy-club
#   ./scripts/publish-to-github.sh "Initial push"

MSG=${1:-"chore: publish"}

if ! command -v git >/dev/null 2>&1; then
  echo "git not found" >&2; exit 1
fi

if [[ -z "${GITHUB_REPO:-}" ]]; then
  echo "GITHUB_REPO is required (e.g., username/repo)" >&2; exit 1
fi

REMOTE_URL="https://github.com/${GITHUB_REPO}.git"

# Optional: token-based remote URL (uncomment if needed; not recommended to store tokens in remotes)
# if [[ -n "${GITHUB_TOKEN:-}" ]]; then
#   REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"
# fi

# Ensure remote exists
if ! git remote | grep -q '^origin$'; then
  git remote add origin "$REMOTE_URL" || true
fi

git fetch origin || true

git branch -M main

git add -A

git commit -m "$MSG" || echo "No changes to commit"

git push -u origin main

echo "✅ Published to https://github.com/${GITHUB_REPO}"
