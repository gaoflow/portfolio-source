# Bing Gao — Engineering Portfolio

Personal engineering portfolio focused on external aerodynamics, CFD methodology, numerical validation, and simulation tooling.

## Site

- Astro 7
- Tailwind CSS 4
- KaTeX
- Static output in `site/dist`

## Run

```bash
cd site
npm ci
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

## Content

Project articles live in:

```text
site/src/content/projects/
```

## Verification

```bash
python3 scripts/verify_numerical_projects.py --portfolio-only
cd site
npm run build
python3 scripts/check_static_links.py dist
python3 scripts/check_cv_locales.py dist
```
