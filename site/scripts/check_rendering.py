#!/usr/bin/env python3
"""Render-leak check: extract visible text from every built page and regex for
markdown syntax that should have been converted (math, code spans, links,
emphasis, images, headings). Any hit means the markdown pipeline silently
dropped a construct.

Supersedes check_math.py — that script only covered $...$.
"""
import re
import sys
from html import unescape
from pathlib import Path

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else 'site/dist')

# ordered longest-first so block math is consumed before inline
PATTERNS = [
    ('block math $$', re.compile(r'\$\$')),
    ('inline math $…$', re.compile(r'(?<![\$\w\\])\$[^\$\n]{1,200}?[^{\s\\\$]\$(?![\$\w])')),
    ('raw backtick', re.compile(r'`')),
    ('markdown image', re.compile(r'!\[[^\]]{0,120}\]\(')),
    ('markdown link', re.compile(r'\[[^\]\n]{2,120}\]\((?:/|https?://)[^)]{1,200}\)')),
    ('bold marker', re.compile(r'(?<!\w)\*\*[^\*\n]{1,120}?\*\*(?!\w)')),
    ('heading marker', re.compile(r'(?:^|\n)#{1,6}\s')),
]

def visible_text(html: str) -> str:
    # drop non-visible payloads: scripts, styles, svg, KaTeX source annotations
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.S | re.I)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.S | re.I)
    html = re.sub(r'<svg[^>]*>.*?</svg>', '', html, flags=re.S | re.I)
    html = re.sub(r'<annotation[^>]*>.*?</annotation>', '', html, flags=re.S | re.I)
    html = re.sub(r'<!--.*?-->', '', html, flags=re.S)
    return unescape(re.sub(r'<[^>]+>', ' ', html))

bad = []
pages = sorted(DIST.rglob('*.html'))
for page in pages:
    text = visible_text(page.read_text(encoding='utf-8'))
    for label, rx in PATTERNS:
        hits = rx.findall(text)
        if hits:
            sample = [h if isinstance(h, str) else h[0] for h in hits[:2]]
            bad.append(f'{page.relative_to(DIST)}: {label}: {sample}')

if bad:
    print('Render leaks found:')
    print('\n'.join(bad))
    sys.exit(1)
print(f'Render-leak check passed: {len(pages)} HTML pages')
