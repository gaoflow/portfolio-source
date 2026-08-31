#!/usr/bin/env python3
"""Fail when the static build emits inconsistent crawl, canonical, or schema signals."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

ORIGIN = "https://binggao.dev"
INDEXNOW_KEY = "c68a268aff5d62140ef3185062c68b9d"
FORBIDDEN_HOSTS = ("localhost", "127.0.0.1", "192.168.")
TOPIC_LINK_PATTERN = re.compile(r'<a\b[^>]+href=["\']/topics/[^"\']+["\']', re.I)


class SeoParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title_parts: list[str] = []
        self.in_title = False
        self.meta: list[dict[str, str | None]] = []
        self.links: list[dict[str, str | None]] = []
        self.h1_count = 0
        self.json_ld: list[str] = []
        self.current_json_ld: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            self.meta.append(values)
        elif tag == "link":
            self.links.append(values)
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "script" and values.get("type") == "application/ld+json":
            self.current_json_ld = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self.current_json_ld is not None:
            self.json_ld.append("".join(self.current_json_ld))
            self.current_json_ld = None

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self.current_json_ld is not None:
            self.current_json_ld.append(data)


def meta_content(parser: SeoParser, *, name: str | None = None, property_name: str | None = None) -> str:
    for item in parser.meta:
        if name and item.get("name") == name:
            return item.get("content") or ""
        if property_name and item.get("property") == property_name:
            return item.get("content") or ""
    return ""


def link_href(parser: SeoParser, relation: str) -> str:
    return next((item.get("href") or "" for item in parser.links if item.get("rel") == relation), "")


def schema_types(payload: object) -> set[str]:
    if not isinstance(payload, dict):
        return set()
    graph = payload.get("@graph", [payload])
    if not isinstance(graph, list):
        return set()
    return {
        item["@type"]
        for item in graph
        if isinstance(item, dict) and isinstance(item.get("@type"), str)
    }


def static_target(root: Path, url: str) -> Path:
    path = urlsplit(url).path
    if path == "/":
        return root / "index.html"
    candidate = root / path.lstrip("/")
    if path.endswith("/"):
        return candidate / "index.html"
    return candidate


def local_asset_target(root: Path, url: str) -> Path | None:
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"} or parsed.netloc != urlsplit(ORIGIN).netloc:
        return None
    path = parsed.path
    if not path or path.endswith("/"):
        return None
    return root / path.lstrip("/")


def main() -> int:
    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument("root", type=Path, help="Static build directory, e.g. site/dist")
    args = argument_parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        argument_parser.error(f"build directory does not exist: {root}")

    failures: list[str] = []
    titles: list[str] = []
    canonicals: list[str] = []
    article_pages = 0
    pages = sorted(root.rglob("*.html"))

    for page in pages:
        source = page.read_text(encoding="utf-8")
        relative = page.relative_to(root)
        if any(host in source for host in FORBIDDEN_HOSTS):
            failures.append(f"{relative}: contains a local host reference")

        parser = SeoParser()
        parser.feed(source)
        redirect = any(item.get("http-equiv", "").lower() == "refresh" for item in parser.meta)
        if relative == Path("404.html") or redirect:
            if meta_content(parser, name="robots") != "noindex, follow" and not redirect:
                failures.append(f"{relative}: non-indexable page lacks noindex, follow")
            continue

        title = "".join(parser.title_parts).strip()
        description = meta_content(parser, name="description")
        canonical = link_href(parser, "canonical")
        open_graph_url = meta_content(parser, property_name="og:url")
        open_graph_image = meta_content(parser, property_name="og:image")
        if not title:
            failures.append(f"{relative}: missing title")
        if not description:
            failures.append(f"{relative}: missing meta description")
        if parser.h1_count != 1:
            failures.append(f"{relative}: expected one h1, found {parser.h1_count}")
        if not canonical.startswith(f"{ORIGIN}/"):
            failures.append(f"{relative}: invalid canonical {canonical!r}")
        if open_graph_url != canonical:
            failures.append(f"{relative}: og:url does not match canonical")
        if not open_graph_image.startswith(f"{ORIGIN}/"):
            failures.append(f"{relative}: invalid og:image {open_graph_image!r}")
        else:
            image_target = local_asset_target(root, open_graph_image)
            if image_target is None or not image_target.is_file():
                failures.append(f"{relative}: og:image has no local build target {open_graph_image!r}")

        twitter_image = meta_content(parser, name="twitter:image")
        if twitter_image:
            twitter_target = local_asset_target(root, twitter_image)
            if twitter_target is None or not twitter_target.is_file():
                failures.append(f"{relative}: twitter:image has no local build target {twitter_image!r}")

        page_schema_types: set[str] = set()
        for raw_payload in parser.json_ld:
            try:
                page_schema_types.update(schema_types(json.loads(raw_payload)))
            except json.JSONDecodeError as error:
                failures.append(f"{relative}: invalid JSON-LD: {error}")
        if not page_schema_types:
            failures.append(f"{relative}: missing structured data")

        if relative == Path("index.html") or relative.parts[:1] == ("projects",):
            if 'aria-label="Project topics"' in source or "aria-label='Project topics'" in source:
                failures.append(f"{relative}: topic tag navigation must stay hidden")
            if TOPIC_LINK_PATTERN.search(source):
                failures.append(f"{relative}: visible topic links must stay hidden")

        if relative.parts[:1] == ("projects",) and relative != Path("projects/index.html"):
            article_pages += 1
            if "Article" not in page_schema_types:
                failures.append(f"{relative}: missing Article structured data")
            if meta_content(parser, property_name="og:type") != "article":
                failures.append(f"{relative}: project og:type is not article")
            if not meta_content(parser, property_name="article:published_time"):
                failures.append(f"{relative}: missing article:published_time")
            if not meta_content(parser, property_name="article:modified_time"):
                failures.append(f"{relative}: missing article:modified_time")

        titles.append(title)
        canonicals.append(canonical)

    for label, values in (("title", titles), ("canonical", canonicals)):
        duplicates = sorted(value for value, count in Counter(values).items() if value and count > 1)
        if duplicates:
            failures.append(f"duplicate {label} values: {duplicates}")

    sitemap_path = root / "sitemap.xml"
    if not sitemap_path.exists():
        failures.append("missing sitemap.xml")
    else:
        sitemap_text = sitemap_path.read_text(encoding="utf-8")
        if any(host in sitemap_text for host in FORBIDDEN_HOSTS):
            failures.append("sitemap.xml contains a local host reference")
        tree = ElementTree.parse(sitemap_path)
        locations = [node.text or "" for node in tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        if len(locations) != len(set(locations)):
            failures.append("sitemap.xml contains duplicate URLs")
        for location in locations:
            if not location.startswith(f"{ORIGIN}/"):
                failures.append(f"sitemap.xml contains invalid URL {location!r}")
                continue
            target = static_target(root, location)
            if not target.exists():
                failures.append(f"sitemap.xml URL {location} has no static target")

    robots_path = root / "robots.txt"
    if not robots_path.exists():
        failures.append("missing robots.txt")
    else:
        robots = robots_path.read_text(encoding="utf-8")
        expected_lines = {
            "User-agent: OAI-SearchBot",
            "User-agent: Claude-SearchBot",
            "User-agent: PerplexityBot",
            f"Sitemap: {ORIGIN}/sitemap.xml",
        }
        for line in sorted(expected_lines):
            if line not in robots:
                failures.append(f"robots.txt missing {line!r}")
        if any(host in robots for host in FORBIDDEN_HOSTS):
            failures.append("robots.txt contains a local host reference")

    llms_path = root / "llms.txt"
    if not llms_path.exists():
        failures.append("missing llms.txt")
    else:
        llms = llms_path.read_text(encoding="utf-8")
        if not llms.startswith("# Bing Gao — Engineering Portfolio"):
            failures.append("llms.txt has an invalid heading")
        project_links = re.findall(rf"\]\({re.escape(ORIGIN)}/projects/[^/]+/\):", llms)
        if len(project_links) != article_pages:
            failures.append("llms.txt project count does not match rendered Article pages")
        if any(host in llms for host in FORBIDDEN_HOSTS):
            failures.append("llms.txt contains a local host reference")
    indexnow_key_path = root / f"{INDEXNOW_KEY}.txt"
    if not indexnow_key_path.exists():
        failures.append(f"missing {indexnow_key_path.name}")
    elif indexnow_key_path.read_text(encoding="utf-8").strip() != INDEXNOW_KEY:
        failures.append(f"{indexnow_key_path.name} does not contain the configured key")


    if failures:
        print("SEO check failed:")
        print("\n".join(f"- {failure}" for failure in failures))
        return 1

    print(f"SEO check passed: {len(pages)} HTML pages, {article_pages} Article pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
