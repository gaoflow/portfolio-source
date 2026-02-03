#!/usr/bin/env python3
"""Fail when a generated HTML page points at a missing local file or route."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

SKIP_SCHEMES = {"data", "http", "https", "mailto", "tel", "javascript"}


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if value and name in {"href", "src"}:
                self.links.append((tag, value))


def local_target(root: Path, page: Path, value: str) -> Path | None:
    parsed = urlsplit(value)
    if parsed.scheme in SKIP_SCHEMES or parsed.netloc or not parsed.path:
        return None

    path = unquote(parsed.path)
    if path.startswith("/"):
        candidate = root / path.lstrip("/")
    else:
        candidate = page.parent / path

    if path.endswith("/"):
        return candidate / "index.html"
    if candidate.suffix:
        return candidate
    if candidate.is_file():
        return candidate
    return candidate / "index.html"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path, help="Static build directory, e.g. site/dist")
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        parser.error(f"build directory does not exist: {root}")

    failures: list[str] = []
    pages = sorted(root.rglob("*.html"))
    for page in pages:
        links = LinkParser()
        links.feed(page.read_text(encoding="utf-8"))
        for tag, value in links.links:
            target = local_target(root, page, value)
            if target is not None and not target.exists():
                failures.append(f"{page.relative_to(root)}: <{tag}> {value} -> missing {target.relative_to(root)}")

    if failures:
        print("Static-link check failed:")
        print("\n".join(f"- {failure}" for failure in failures))
        return 1

    print(f"Static-link check passed: {len(pages)} HTML pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
