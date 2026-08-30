# Publishing strategy

This repository keeps two kinds of work separate:

- `main`: the public GitHub branch. It contains only the deployable portfolio surface.
- `work`: the private working branch. It may contain research, design notes, experiments, private source material, and other work that is not meant for public GitHub.

## What belongs on `main`

Only publish what the public site and repository should expose:

- `site/` — the deployable Astro site and its public content.
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

1. Do normal work and commits on `work`.
2. When content is ready to publish, create a public commit on `main` containing only the approved public files.
3. Push only `main` to GitHub.
4. Do not commit daily private work directly on `main`.

## Rules

- Do not push `work` to the public GitHub repository.
- Do not include private tooling, private notes, or non-public source content in `main`.
- Do not rewrite history on `main` once it is shared unless there is a clear release reason.
- Every public update should be reviewed as a deployment decision, not as a routine work commit.

## Current branch layout

- `main` — public, pushed to `origin/main`.
- `work` — private working history, kept locally.
