#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for f in *.js; do node --check "$f" >/dev/null; done
python3 - <<'PYQA'
from pathlib import Path
import re
html=Path('index.html').read_text()
for path in re.findall(r'<script src="([^"?]+)',html):
 assert Path(path).is_file(),f'Missing JS: {path}'
for path in re.findall(r'<link rel="stylesheet" href="([^"?]+)',html):
 assert Path(path).is_file(),f'Missing CSS: {path}'
assert html.count('career-simulation.js')==1
assert 'Virelio Analytics' in html
print('JS syntax, static references, brand and duplicate script checks passed')
PYQA
