#!/usr/bin/env bash
# check.sh <explainer.html> [outdir]
# Renders the <style> + <svg> of a 2D explainer once per step (transitions off), screenshots each state,
# and prints per step: visible word count, text/text overlaps, text that crosses its box edge.
# Then Read every step-N.png and look at it. The report finds collisions, not ugliness.
set -euo pipefail
f=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
out=${2:-${TMPDIR:-/tmp}/ve-check}; mkdir -p "$out"; rm -f "$out"/step-*.{html,png} "$out"/report.html
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
n=$(python3 -I - "$f" "$out" <<'EOF'
import re, sys
src = open(sys.argv[1]).read(); out = sys.argv[2]
style = (re.search(r'<style>.*?</style>', src, re.S) or [''])[0]  # a lesson may link its page styles; the graphic state block stays inline
svg = re.search(r'<svg.*?</svg>', src, re.S).group(0)
n = len(re.findall(r'class="step"', src))
state = r'''
const svg=document.querySelector('svg'), N=%d;
function show(n){ svg.dataset.step=n; svg.setAttribute('class',[...Array(N).keys()].map(i=>i<=n?'ge'+i:'').join(' ')+' at'+n);
  svg.querySelectorAll('[class]').forEach(el=>{const c=el.getAttribute('class'),from=c.match(/\bs(\d+)\b/),only=[...c.matchAll(/\bo(\d+)\b/g)].map(m=>+m[1]);
    if(from)el.style.opacity=n>=+from[1]?1:0; else if(only.length)el.style.opacity=only.includes(n)?1:0;}); }
''' % n
head = '<!doctype html><meta charset=utf-8>' + style + '<style>*{transition:none!important;animation:none!important}</style>'
for i in range(n):
    open(f'{out}/step-{i}.html', 'w').write(head + f'<figure id="graphic" style="position:static;height:auto;margin:0;padding:8px">{svg}</figure><script>{state}show({i});</script>')
report = r'''
const vis=el=>{for(let e=el;e&&e!==svg;e=e.parentNode){if(+getComputedStyle(e).opacity===0)return false;}return true;};
const R=el=>el.getBoundingClientRect(), label=el=>(el.textContent.trim().slice(0,40));
const hit=(a,b,p)=>a.left<b.right-p&&b.left<a.right-p&&a.top<b.bottom-p&&b.top<a.bottom-p;
let lines=[];
for(let n=0;n<N;n++){ show(n);
  const texts=[...svg.querySelectorAll('text')].filter(vis), rects=[...svg.querySelectorAll('rect')].filter(vis);
  const words=texts.reduce((s,t)=>s+t.textContent.trim().split(/\s+/).filter(Boolean).length,0);
  const over=[], clip=[], cross=[];
  texts.forEach((t,i)=>{const a=R(t);
    texts.slice(i+1).forEach(u=>{if(hit(a,R(u),2))over.push(label(t)+' × '+label(u));});
    const cx=(a.left+a.right)/2, cy=(a.top+a.bottom)/2;
    const box=rects.map(R).filter(b=>b.left<=cx&&cx<=b.right&&b.top<=cy&&cy<=b.bottom).sort((x,y)=>x.width*x.height-y.width*y.height)[0];
    rects.forEach(r=>{const b=R(r); if(hit(a,b,1)&&!(a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom))cross.push(label(t));});
    if(box&&(a.left<box.left+4||a.right>box.right-4))clip.push(label(t));});
  lines.push(`step ${n}: ${words} words, ${over.length} overlaps, ${clip.length} clipped, ${cross.length} crossing a box edge`+(over.length?'\n  overlap: '+over.join(' | '):'')+(clip.length?'\n  clipped: '+clip.join(' | '):'')+(cross.length?'\n  crossing: '+[...new Set(cross)].join(' | '):''));
}
document.getElementById('r').textContent=lines.join('\n');
'''
open(f'{out}/report.html', 'w').write(head + f'<figure id="graphic" style="position:static;height:auto;margin:0;padding:8px">{svg}</figure><pre id="r"></pre><script>{state}{report}</script>')
print(n)
EOF
)
for i in $(seq 0 $((n-1))); do
  "$chrome" --headless=new --disable-gpu --window-size=1000,620 --screenshot="$out/step-$i.png" --virtual-time-budget=3000 "file://$out/step-$i.html" 2>/dev/null
done
"$chrome" --headless=new --disable-gpu --dump-dom --window-size=1000,620 --virtual-time-budget=3000 "file://$out/report.html" 2>/dev/null \
  | python3 -I -c 'import sys,re,html; print(html.unescape(re.search(r"<pre id=\"r\">(.*?)</pre>", sys.stdin.read(), re.S).group(1)))'
echo "screenshots: $out/step-0.png .. step-$((n-1)).png"
