#!/usr/bin/env bash
#
# Runs the screenshot projects inside the Playwright container image.
#
# Baselines only compare equal when the renderer, fonts and GPU stack match, so
# both this script and the CI job use the same image. Running the suite with a
# bare `npx playwright test` on macOS renders with different fonts and reports
# every screenshot as changed.
#
# Pass extra Playwright flags through, e.g.:
#   ./scripts/screenshots.sh --update-snapshots
#   ./scripts/screenshots.sh --project=iphone-14

set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v$(node -p "require('./package.json').devDependencies['@playwright/test'].replace(/[^0-9.]/g, '')")-noble"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# node_modules and the npm cache live in named volumes: the host's macOS
# binaries are not runnable in the container, and reinstalling on every run is
# slow.
exec docker run --rm \
  --ipc=host \
  -v "$REPO_ROOT":/work \
  -v penny-plummet-linux-node-modules:/work/node_modules \
  -v penny-plummet-npm-cache:/root/.npm \
  -w /work \
  "$IMAGE" \
  sh -c "npm ci --silent && npx playwright test --project=iphone-14 --project=iphone-se --project=pixel-7 --project=desktop $*"
