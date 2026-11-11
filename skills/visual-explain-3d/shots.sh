#!/usr/bin/env bash
# Screenshot a scrubbed explainer at fixed moments: bash shots.sh page.html [t ...]
# Each shot loads page.html?t=<t>, which freezes the timeline there. Output: /tmp/ve3d-<t>.png
set -euo pipefail
page="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; shift
times=("${@:-0 0.2 0.38 0.5 0.66 0.84 0.95}")
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$chrome" ] || chrome="$(command -v chromium || command -v google-chrome)"
for t in ${times[@]}; do
  "$chrome" --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars \
    --window-size=1280,1150 --virtual-time-budget=4000 --screenshot="/tmp/ve3d-$t.png" \
    "file://$page?t=$t" >/dev/null 2>&1
  echo "/tmp/ve3d-$t.png"
done
