#!/usr/bin/env python3
"""Asset luminance gate: every image the site ships must sit on a light
background. The site is a light-theme portfolio; a dark figure reads as a
black hole on the page.

- SVG: the figure background is the largest <rect> in the document
  (matplotlib emits the figure patch first; hand-written covers use a
  full-canvas rect). Require it to be light.
- PNG/JPG: sample the four corners; the median corner luminance must be
  light (corners are where a figure's page background shows).

Intentional dark artwork needs an explicit allowlist entry with a reason —
the allowlist is the documentation.
"""
import re
import sys
from collections import Counter
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    print('Pillow required: pip install Pillow', file=sys.stderr)
    sys.exit(2)

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else 'site/public/images')
LIGHT = 0.72  # relative luminance threshold (0..1)

ALLOWLIST = {
    # intentional blueprint aesthetic — the deliverable IS a blueprint
    'projects/space-rider-blueprint.png',
    'projects/space-rider/blueprint-overlay.png',
    # Blender studio render on a neutral grey backdrop — render content
    'projects/space-rider/final-vehicle.png',
    # Abaqus viewport capture — the software's viewport is dark by design
    'projects/xc48-abaqus-twin/m2-necking-deformed.png',
    # CC BY laboratory photograph — preserve the source image without retouching
    'projects/steady-conduction-1d/reference/metal-rod-conduction-experiment.jpg',
    # CC BY-SA flow-visualization photograph — preserve the source image unmodified
    'projects/potential-flow-sandbox/reference/real-cylinder-wake-low-re.jpg',
    # Event photographs — preserve the original night/stage lighting
    'projects/3dexperience-rb22/f1-photos/IMG_4739.jpg',
    'projects/3dexperience-rb22/f1-photos/IMG_4753.jpg',
    'projects/3dexperience-rb22/f1-photos/IMG_4756.jpg',
    'projects/3dexperience-rb22/f1-photos/IMG_4765.jpg',
    # Abaqus viewport captures — the software's viewport is dark by design
    'projects/abaqus-energy-absorber/wall-impact-aluminium.png',
    'projects/abaqus-energy-absorber/wall-impact-polypropylene.png',
    'projects/abaqus-energy-absorber/wall-impact-steel.png',
    'projects/abaqus-energy-absorber/wall-impact-titanium.png',
    'projects/xc48-abaqus-twin/abaqus-baseline-meshed-specimen.png',
    'projects/xc48-abaqus-twin/abaqus-m1-von-mises-result.png',
    'projects/xc48-abaqus-twin/abaqus-m2-von-mises-fracture-stage.png',
    'projects/xc48-abaqus-twin/abaqus-m3-von-mises-result.png',
    # Fluent plots and viewport captures — original solver output
    'projects/fluent-cyl-vnv/source/pipe-centerline-velocity.png',
    'projects/fluent-cyl-vnv/source/pipe-pressure-drop.png',
    'projects/fluent-cyl-vnv/source/pipe-velocity-development.png',
    'projects/fluent-cyl-vnv/source/pipe-velocity-profiles.png',
    'projects/fluent-cylinder-vortex/source/developed-vorticity.png',
    'projects/fluent-cylinder-vortex/source/steady-velocity-magnitude.png',
    'projects/fluent-cylinder-vortex/source/transverse-velocity-patch.png',
    # Reference photographs selected as project-card covers
    'projects/pipe-flow-sizing/reference/car-water-pump.jpg',
    'projects/powertrain-cycle-simulation/spa-francorchamps-aerial.jpg',
    # Official/reference spacecraft imagery and Blender renders
    'projects/space-rider/reference/esa-earth-render.jpg',
    'projects/space-rider/reference/esa-official-render.jpg',
    'projects/space-rider/reference/ixv.jpg',
    'projects/space-rider/reference/nose-pillars.jpg',
    'projects/space-rider/report/animation-ready.png',
    'projects/space-rider/report/blueprint-calibration.png',
    'projects/space-rider/report/official-blueprint.png',
    'projects/space-rider/report/tail-junction.png',
    'projects/space-rider/versions/detail-flap.jpg',
    'projects/space-rider/versions/detail-nozzle.jpg',
    'projects/space-rider/versions/detail-tail.jpg',
    'projects/space-rider/versions/detail-wings-full.jpg',
    'projects/space-rider/versions/v2-720-cinematic.jpg',
    'projects/space-rider/versions/v5-049-tail-closeup.jpg',
    'projects/space-rider/versions/v5-050-persp.jpg',
    'projects/space-rider/versions/v5-050-side.jpg',
    'projects/space-rider/versions/v5.015-wide.jpg',
    'projects/space-rider/versions/v5.027-wide.jpg',
    'projects/space-rider/versions/v5.044-wide.jpg',
    'projects/space-rider/versions/v5.046-wide.jpg',
    'projects/space-rider/versions/v5.049-wide.jpg',
}


def lum(rgb):
    def ch(c):
        c = c / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = ch(rgb[0]), ch(rgb[1]), ch(rgb[2])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def hexes(text):
    out = []
    for h in re.findall(r'#([0-9a-fA-F]{6})\b', text):
        out.append(tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)))
    for h in re.findall(r'#([0-9a-fA-F]{3})\b', text):
        out.append(tuple(int(c * 2, 16) for c in h))
    return out


def svg_bg_lum(path):
    text = path.read_text(encoding='utf-8', errors='replace')
    if 'darkreader' in text.lower():
        return 0.0  # darkreader lock means a dark background we missed
        # matplotlib paints the figure patch as a full-canvas <path> in
    # <g id="patch_1">, not a <rect> — check it first
    m = re.search(r'<g id="patch_1">\s*<path[^>]*?fill:\s*(#[0-9a-fA-F]{3,6})', text)
    if m:
        return lum(hexes(m.group(1))[0])
    vb = re.search(r'viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"', text)
    canvas = float(vb.group(1)) * float(vb.group(2)) if vb else None
    best_area, best_fill = -1.0, None
    for tag in re.findall(r'<rect\b[^>]*>', text):
        w = re.search(r'width="([\d.]+)', tag)
        h = re.search(r'height="([\d.]+)', tag)
        fill = re.search(r'style="[^"]*fill:\s*(#[0-9a-fA-F]{3,6})', tag) or re.search(
            r'\bfill="(#[0-9a-fA-F]{3,6})"', tag)
        area = (float(w.group(1)) * float(h.group(1))) if (w and h) else 0.0
        if area > best_area and fill:
            best_area, best_fill = area, fill.group(1)
    # a background rect must cover the canvas (a small filled rect is a legend
    # swatch or data mark, not a background)
    if best_fill and (canvas is None or best_area >= 0.8 * canvas):
        return lum(hexes(best_fill)[0])
    # no canvas-covering painted rect → the SVG is transparent and inherits
    # the (light) page background — not a dark asset
    return 1.0


def raster_corner_lum(path):
    with Image.open(path) as im:
        im = im.convert('RGB')
        w, h = im.size
        px = im.load()
        pts = []
        m = max(2, min(w, h) // 40)
        for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
            vals = [lum(px[min(cx + dx, w - 1), min(cy + dy, h - 1)])
                    for dx in range(m) for dy in range(m)]
            pts.append(sorted(vals)[len(vals) // 2])
        return sorted(pts)[len(pts) // 2]


bad = []
files = sorted(p for p in ROOT.rglob('*') if p.suffix.lower() in ('.svg', '.png', '.jpg', '.jpeg'))
for p in files:
    rel = str(p.relative_to(ROOT))
    if rel in ALLOWLIST:
        continue
    l = svg_bg_lum(p) if p.suffix.lower() == '.svg' else raster_corner_lum(p)
    if l < LIGHT:
        bad.append(f'{rel}: background luminance {l:.2f} < {LIGHT}')

if bad:
    print('Dark-background assets found:')
    print('\n'.join(bad))
    print(f'\nAllowlisted (intentional): {len(ALLOWLIST)}')
    sys.exit(1)
print(f'Asset luminance check passed: {len(files)} files ({len(ALLOWLIST)} allowlisted)')
