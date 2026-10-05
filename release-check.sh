#!/usr/bin/env sh
set -eu
for f in ./*.js; do node --check "$f" >/dev/null; done
node ./qa-global-scope.js
echo "✅ DATA TYCOON release checks passed."
