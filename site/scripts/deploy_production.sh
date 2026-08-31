#!/usr/bin/env bash
set -euo pipefail

previous_sitemap=$(mktemp -t binggao-sitemap.XXXXXX)
cleanup() {
  rm -f "$previous_sitemap"
}
trap cleanup EXIT

# Capture the live sitemap before publishing so IndexNow receives only URLs
# introduced by this deployment. A failed fetch falls back to a full submit.
if ! curl --fail --silent --show-error --location \
  "https://binggao.dev/sitemap.xml" > "$previous_sitemap"; then
  : > "$previous_sitemap"
fi

npm run verify:all
npx --yes wrangler@4.125.0 pages deploy dist --project-name vinzzy --branch main
python3 scripts/submit_indexnow.py dist/sitemap.xml c68a268aff5d62140ef3185062c68b9d \
  --previous-sitemap "$previous_sitemap" \
  --always-url "https://binggao.dev/" \
  --always-url "https://binggao.dev/cv/"
