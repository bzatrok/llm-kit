#!/usr/bin/env bash
# Screenshot a scrubbed explainer: bash shots.sh page.html [--walk] [t ...]
# ?t=<t> freezes the timeline at t. --walk shoots every step's reading frame through ?walk=<i>, which renders
# each earlier reading frame first, the way Next does, so caches keyed on the driving quantity get exercised.
# Every run also loads the page at three window sizes and prints SCROLLS when the page overflows the viewport.
set -euo pipefail
page="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; shift
walk=0; [ "${1:-}" = "--walk" ] && { walk=1; shift; }
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$chrome" ] || chrome="$(command -v chromium || command -v google-chrome)"
out="$(mktemp -d "${TMPDIR:-/tmp}/ve3d.XXXXXX")"
run() { "$chrome" --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --virtual-time-budget=4000 "$@" 2>/dev/null; }
shot() { run --window-size=1440,900 --screenshot="$out/$2.png" "file://$page?$1" >/dev/null; echo "$out/$2.png"; }
if [ $walk = 1 ]; then
  n=$(grep -o 'data-step="[0-9]*"' "$page" | wc -l | tr -d ' ')
  for ((i = 0; i < n; i++)); do shot "walk=$i" "walk-$i"; done
fi
[ $# -gt 0 ] || [ $walk = 1 ] || set -- 0 0.2 0.38 0.5 0.66 0.84 0.95
for t in "$@"; do
  [[ $t =~ ^(0(\.[0-9]+)?|1(\.0+)?)$ ]] || { echo "skip $t: t must be a number from 0 to 1" >&2; continue; }
  shot "t=$t" "ve3d-$t"
done
# The page writes data-overflow="<scrollHeight - innerHeight>" on <html> after layout.
for size in 1280,720 1440,900 1920,1080; do
  ov=$(run --window-size=$size --dump-dom "file://$page" | grep -o 'data-overflow="[0-9]*"' | head -1 | tr -dc 0-9 || true)
  if [ -z "$ov" ]; then echo "no data-overflow at ${size/,/x}: the page must set document.documentElement.dataset.overflow after layout"
  elif [ "$ov" -gt 0 ]; then echo "SCROLLS ${ov}px at ${size/,/x}"; else echo "fits ${size/,/x}"; fi
done
