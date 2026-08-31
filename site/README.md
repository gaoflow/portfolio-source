# Bing Gao — Engineering Portfolio

This directory contains the Astro source for [binggao.dev](https://binggao.dev/), an engineering portfolio covering external aerodynamics, CFD methodology, thermal-fluid modelling, numerical validation, CAD, and simulation tooling.

## Development

```bash
npm ci
npm run dev
```

Build and preview the static output:

```bash
npm run build
npm run preview
```

## Content

- English project case studies: `src/content/projects/`
- Chinese source documents retained in the public repository but not deployed: `src/content/projects-cn/`
- Interactive demonstrations: `public/labs/`

## Verification

```bash
npm run verify:seo
npm run verify:all
```

The full gate needs Pillow 12.3.0 for the image audit (`python3 -m pip install Pillow==12.3.0`).

`verify:all` includes the static build, SEO signals, local links, rendered-content checks, CV locale checks, UI checks, and image-asset validation.

## Publishing

```bash
npm run deploy:production
```

The production wrapper captures the live sitemap before deployment and submits new or `lastmod`-changed URLs, plus the home/CV hubs, to IndexNow.
