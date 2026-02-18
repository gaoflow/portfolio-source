#!/usr/bin/env python3
"""Fail if any built page still contains raw $...$ / $$...$$ math source.

KaTeX (remark-math + rehype-katex) must consume every math delimiter in the
markdown. A leftover delimiter means the plugin chain silently stopped
applying — the failure mode we hit when the markdown processor changed.
"""
import re
import sys
from pathlib import Path

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else 'site/dist')
INLINE = re.compile(r'(?<![\$\\])\$[^\$\n<>]{1,200}?\$(?!\$)')
BLOCK = re.compile(r'\$\$')

bad = []
for html in sorted(DIST.rglob('*.html')):
    text = html.read_text(encoding='utf-8')
    # strip KaTeX source annotations (they legitimately contain $...$)
    text = re.sub(r'<annotation[^>]*>.*?</annotation>', '', text, flags=re.S)
    hits = INLINE.findall(text) + BLOCK.findall(text)
    if hits:
        bad.append(f'{html.relative_to(DIST)}: {hits[:3]}')

if bad:
    print('Unrendered math delimiters found:')
    print('\n'.join(bad))
    sys.exit(1)
print(f'Math-render check passed: {len(list(DIST.rglob("*.html")))} HTML pages')
