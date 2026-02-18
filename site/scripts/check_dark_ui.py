#!/usr/bin/env python3
"""Dark-UI gate: scan every built HTML page for dark-coloured inline styles
and class-free style blocks. A light-theme page must not embed dark panels
(dark iframes backdrops, inline background colours, legacy palette tokens).

Images and SVG files are covered by check_assets.py — this script covers the
DOM itself.
"""
import re
import sys
from pathlib import Path

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else 'site/dist')
LIGHT = 0.55  # inline-style backgrounds below this luminance fail

ALLOWED_SELECTORS = (
    # dark scrim inside the on-demand 3D viewer is a deliberate control
    # surface, not page chrome
    'model-viewer',
)

def lum(rgb):
    def ch(c):
        c = c / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = ch(rgb[0]), ch(rgb[1]), ch(rgb[2])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def colours_of(style: str):
    out = []
    for h in re.findall(r'#([0-9a-fA-F]{6})\b', style):
        out.append('#' + h.lower())
    for h in re.findall(r'#([0-9a-fA-F]{3})\b', style):
        out.append('#' + ''.join(c * 2 for c in h.lower()))
    for m in re.findall(r'rgba?\(([^)]*)\)', style):
        parts = [p.strip() for p in m.split(',')]
        try:
            out.append('#%02x%02x%02x' % tuple(int(float(p)) for p in parts[:3]))
        except ValueError:
            pass
    return out

bad = []
pages = sorted(DIST.rglob('*.html'))
for page in pages:
    html = page.read_text(encoding='utf-8')
    if any(sel in html for sel in ALLOWED_SELECTORS):
        # strip the allowed element before scanning
        for sel in ALLOWED_SELECTORS:
            html = re.sub(rf'<{sel}[^>]*>.*?</{sel}>', '', html, flags=re.S)
            html = re.sub(rf'<{sel}[^>]*/?>', '', html)
    for m in re.finditer(r'style="([^"]*)"', html):
        style = m.group(1)
        if 'background' not in style and 'color' not in style:
            continue
        for c in colours_of(style):
            rgb = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
            if re.search(r'background(-color)?\s*:[^;]*' + re.escape(c), style) and lum(rgb) < LIGHT:
                bad.append(f'{page.relative_to(DIST)}: dark inline background {c}')
                break

if bad:
    print('Dark UI found:')
    print('\n'.join(bad))
    sys.exit(1)
print(f'Dark-UI check passed: {len(pages)} HTML pages')
