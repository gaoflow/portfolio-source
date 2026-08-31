#!/usr/bin/env python3
"""Submit every canonical sitemap URL to the IndexNow endpoint."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from xml.etree import ElementTree

ENDPOINT = "https://api.indexnow.org/indexnow"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("sitemap", type=Path)
    parser.add_argument("key")
    parser.add_argument(
        "--previous-sitemap",
        type=Path,
        help="Only submit URLs that are new or whose sitemap lastmod changed; submit all URLs when omitted.",
    )
    parser.add_argument(
        "--always-url",
        action="append",
        default=[],
        help="Always submit this URL when using --previous-sitemap (repeatable).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the URL set without making a network request.",
    )
    args = parser.parse_args()

    def sitemap_entries(path: Path) -> dict[str, str]:
        tree = ElementTree.parse(path)
        entries: dict[str, str] = {}
        for url_node in tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}url"):
            loc_node = url_node.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
            lastmod_node = url_node.find("{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod")
            if loc_node is not None and loc_node.text:
                entries[loc_node.text] = lastmod_node.text if lastmod_node is not None and lastmod_node.text else ""
        return entries

    current_entries = sitemap_entries(args.sitemap)
    current_urls = list(current_entries)
    if not current_entries:
        parser.error("sitemap contains no URLs")

    urls = current_urls
    if args.previous_sitemap:
        if args.previous_sitemap.exists():
            previous_entries = sitemap_entries(args.previous_sitemap)
            urls = [
                url for url, lastmod in current_entries.items()
                if previous_entries.get(url) != lastmod
            ]
        else:
            print(f"Previous sitemap not found; submitting all {len(current_urls)} current URLs")

        missing_always = [url for url in args.always_url if url not in current_entries]
        if missing_always:
            parser.error(f"always URL not found in current sitemap: {missing_always[0]}")
        urls.extend(url for url in args.always_url if url not in urls)

    if not urls:
        print("IndexNow: no new or changed URLs to submit")
        return 0

    host = urlsplit(urls[0]).netloc
    if not host or any(urlsplit(url).netloc != host for url in urls):
        parser.error("all sitemap URLs must use one host")

    if args.dry_run:
        print(f"IndexNow dry run: {len(urls)} URLs for {host}")
        print("\n".join(urls))
        return 0

    payload = {
        "host": host,
        "key": args.key,
        "keyLocation": f"https://{host}/{args.key}.txt",
        "urlList": urls,
    }
    request = Request(
        ENDPOINT,
        data=json.dumps(payload).encode(),
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urlopen(request, timeout=30) as response:
            status = response.status
    except HTTPError as error:
        status = error.code
        detail = error.read().decode(errors="replace")
        print(f"IndexNow submission failed: HTTP {status}: {detail}")
        return 1

    if status not in {200, 202}:
        print(f"IndexNow submission failed: unexpected HTTP {status}")
        return 1

    print(f"IndexNow accepted {len(urls)} URLs for {host}: HTTP {status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
