# Publishing strategy

This repository separates public site history from private working material:

- `main`: the public GitHub branch. It keeps the full publishable history for site content, UI changes, and deployment configuration.
- `work`: the private working branch. It may contain research, design notes, experiments, private source material, and other work that is not meant for public GitHub.

## What belongs on `main`

Publish source files and history that are safe for the public repository:

- `site/` — the Astro site, public assets, English content, and Chinese source documents.
- `site/src/content/projects/` — English documents loaded by Astro and deployed as pages.
- `site/src/content/projects-cn/` — public Chinese source documents retained in Git, but not loaded by Astro and not deployed as routes.
- `README.md` — public project overview.
- `LICENSE` — public license.
- `.github/` — public CI or workflow configuration required for the public repository.

## What stays on `work`

Keep local or private material on `work` only:

- `design/` — prototypes and visual experiments.
- `docs/` — working notes, strategy, and internal process documents.
- `research/` — reference analysis and investigations.
- `projects/` — numerical projects and evidence sources not needed by the public site.
- Private automation tooling, prompts, and experiment records.
- Local PM2, debug, cache, and machine-specific configuration.

## Daily workflow

1. Commit publishable article edits, UI changes, and deployment configuration as separate commits on `main`.
2. Keep Chinese source documents under `site/src/content/projects-cn/`; do not add that directory to Astro collections or page routes.
3. Use `work` for private research, experiments, and internal tooling.
4. Push `main` without squashing or rewriting its shared history.

## Rules

- Do not push `work` to the public GitHub repository.
- Do not include private tooling, private notes, or non-public research sources in `main`.
- Chinese source documents are public repository content, not deployed website routes.
- Do not squash or rewrite shared `main` history; article, UI, and deployment commits remain individually visible.

## Current branch layout

- `main` — public site source, public Chinese documents, and publishable development history; pushed to `origin/main`.
- `work` — private research and working material; kept locally.
