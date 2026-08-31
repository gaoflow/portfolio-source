# Bing Gao — Engineering Portfolio

Personal engineering portfolio focused on external aerodynamics, CFD methodology, numerical validation, and simulation tooling.

Live site: [binggao.dev](https://binggao.dev/)

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

English project articles deployed by Astro:

```text
site/src/content/projects/
```

Chinese source documents tracked publicly but not loaded or deployed:

```text
site/src/content/projects-cn/
```

## Verification

```bash
cd site
npm run verify:seo
```

The full release gate, including the image-asset audit, is `npm run verify:all`.

Install Pillow 12.3.0 first when running the image audit locally: `python3 -m pip install Pillow==12.3.0`.

Production publishing uses `npm run deploy:production`; it captures the live sitemap before deployment so IndexNow receives new or changed URLs and the key site hubs.
