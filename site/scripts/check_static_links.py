#!/usr/bin/env python3
"""Fail when a generated HTML page points at a missing local file or route."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree

SKIP_SCHEMES = {"data", "http", "https", "mailto", "tel", "javascript"}


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self.missing_alt: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "img" and not values.get("alt"):
            self.missing_alt.append(values.get("src") or "(missing src)")
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

def validate_feed_links(root: Path, path: Path, failures: list[str]) -> None:
    if not path.exists():
        failures.append(f"missing {path.name}")
        return
    tree = ElementTree.parse(path)
    tags = {"sitemap.xml": "{http://www.sitemaps.org/schemas/sitemap/0.9}loc", "rss.xml": "channel/item/link"}
    for node in tree.findall(f".//{tags[path.name]}"):
        if not node.text:
            continue
        parsed = urlsplit(node.text)
        target = local_target(root, root / "index.html", parsed.path)
        if target is not None and not target.exists():
            failures.append(f"{path.name}: {node.text} -> missing {target.relative_to(root)}")


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
        source = page.read_text(encoding="utf-8")
        links = LinkParser()
        links.feed(source)
        relative = page.relative_to(root)
        for src in links.missing_alt:
            failures.append(f"{relative}: <img> {src} has no alt text")
        leaked_prefixes = ("/Users/", "~/Downloads", "/home/", "C:\\\\Users\\\\", "/var/folders/")
        if any(prefix in source for prefix in leaked_prefixes):
            failures.append(f"{relative}: leaked absolute/private local path")
        if "Sample project — replace with yours" in source or "Sample data" in source:
            failures.append(f"{relative}: obsolete sample UI remains")
        for tag, value in links.links:
            target = local_target(root, page, value)
            if target is not None and not target.exists():
                failures.append(f"{relative}: <{tag}> {value} -> missing {target.relative_to(root)}")
    validate_feed_links(root, root / "sitemap.xml", failures)
    validate_feed_links(root, root / "rss.xml", failures)

    if failures:
        print("Static-link check failed:")
        print("\n".join(f"- {failure}" for failure in failures))
        return 1

    print(f"Static-link check passed: {len(pages)} HTML pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
