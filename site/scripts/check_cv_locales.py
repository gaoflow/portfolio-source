#!/usr/bin/env python3
"""Verify each online CV exposes only its selected interface language."""

import re
import sys
from html import unescape
from pathlib import Path

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else "site/dist")


def visible_text(html: str) -> str:
    html = re.sub(r"<(script|style|svg)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    return " ".join(unescape(re.sub(r"<[^>]+>", " ", html)).split())


contracts = {
    "cv/index.html": {
        "lang": "en",
        "required": ("Experience", "Selected work", "Education", "Core skills", "Community"),
        "forbidden": (
            "Aujourd’hui", "Diplôme", "Expérience", "Travaux sélectionnés", "Formation",
            "Compétences", "Communauté", "Télécharger", "Imprimer", "Étude de cas",
            "Pékin", "Chine", "Français", "Chinois", "Anglais", "Ingénierie",
            "Développement", "Défense",
        ),
    },
    "fr/cv/index.html": {
        "lang": "fr",
        "required": ("Expérience", "Travaux sélectionnés", "Formation", "Compétences clés", "Communauté"),
        "forbidden": (
            "Download PDF", "Print", "Experience", "Selected work", "Education",
            "Core skills", "Community", "Case study", "Present", "Independent study",
            "Course project", "Limit:", "Professional CV", "Code portfolio",
        ),
    },
    "cn/cv/index.html": {
        "lang": "zh-CN",
        "required": ("工作经历", "代表项目", "教育经历", "核心技能", "技术社区"),
        "forbidden": (
            "Download PDF", "Print", "Experience", "Selected work", "Education",
            "Core skills", "Community", "Case study", "Present", "Independent study",
            "Course project", "Limit:", "Professional CV", "Code portfolio",
            "Aujourd’hui", "Diplôme", "Expérience", "Formation", "Compétences",
            "Communauté", "Télécharger", "Imprimer", "Étude de cas",
        ),
    },
}

failures = []
for relative_path, contract in contracts.items():
    page = DIST / relative_path
    if not page.exists():
        failures.append(f"{relative_path}: missing page")
        continue

    html = page.read_text(encoding="utf-8")
    text = visible_text(html)
    if not re.search(rf'<html\s+lang=["\']{re.escape(contract["lang"])}["\']', html):
        failures.append(f'{relative_path}: expected html lang={contract["lang"]}')
    for phrase in contract["required"]:
        if phrase not in text:
            failures.append(f"{relative_path}: missing required text {phrase!r}")
    for phrase in contract["forbidden"]:
        if re.search(rf"(?<!\w){re.escape(phrase)}(?!\w)", text):
            failures.append(f"{relative_path}: language leak {phrase!r}")

if failures:
    print("CV locale contract failed:")
    print("\n".join(failures))
    sys.exit(1)

print(f"CV locale contract passed: {len(contracts)} pages")
