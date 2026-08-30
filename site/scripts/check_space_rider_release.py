#!/usr/bin/env python3
"""Guard the published Space Rider release/version contract."""

from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ENGLISH = ROOT / "site/src/content/projects/space-rider.md"
CHINESE = ROOT / "site/src/content/projects-cn/space-rider.md"
MODEL = ROOT / "site/public/models/space-rider-v5.050.glb"
OLD_MODEL = ROOT / "site/public/models/space-rider.glb"
IMAGE_ROOT = ROOT / "site/public/images/projects/space-rider/report"

REQUIRED_ENGLISH = (
    "model3d: /models/space-rider-v5.050.glb",
    "v5.050 is the client-accepted final source file",
    "v5.051 is the animation-ready derivative",
    "The interactive model on this page is derived directly from the client-accepted v5.050 GLB.",
)
REQUIRED_CHINESE = (
    "model3d: /models/space-rider-v5.050.glb",
    "v5.050 是客户验收的最终源文件",
    "v5.051 是动画就绪派生版",
    "本页面的交互式模型直接派生自客户验收的 v5.050 GLB。",
)
FORBIDDEN = (
    "delivered v5.051 build",
    "authored v5.051 release blend",
    "comes from the v5.051 Web PBR export",
    "最终交付的 v5.051 版本",
    "创作完成的 v5.051 发布版 blend",
    "来自 v5.051 Web PBR 导出",
)
REQUIRED_IMAGES = (
    "a6-process.jpg",
    "a6-campaign-flow.jpg",
    "official-blueprint.png",
    "comparison-tail.png",
    "comparison-wings.png",
    "comparison-full.png",
    "comparison-nose.png",
    "blueprint-calibration.png",
    "surface-rake-before-after.png",
    "tail-junction.png",
    "animation-ready.png",
    "final-perspective.png",
    "final-ortho-side.png",
    "final-ortho-top.png",
)
EXPECTED_MODEL_SHA256 = "2925ed5d74e0aad56d6be3419a3cefd42b030b15b83988cbf8641739c1cd7c3f"


def main() -> int:
    errors: list[str] = []
    english = ENGLISH.read_text(encoding="utf-8")
    chinese = CHINESE.read_text(encoding="utf-8")

    for phrase in REQUIRED_ENGLISH:
        if phrase not in english:
            errors.append(f"English article missing: {phrase}")
    for phrase in REQUIRED_CHINESE:
        if phrase not in chinese:
            errors.append(f"Chinese article missing: {phrase}")
    for phrase in FORBIDDEN:
        if phrase in english or phrase in chinese:
            errors.append(f"Stale version wording remains: {phrase}")
    for name in REQUIRED_IMAGES:
        if not (IMAGE_ROOT / name).is_file():
            errors.append(f"Report image missing: {name}")

    if OLD_MODEL.exists():
        errors.append(f"Obsolete interactive GLB still published: {OLD_MODEL.name}")
    if not MODEL.is_file():
        errors.append(f"Accepted v5.050 GLB missing: {MODEL.name}")
    else:
        model_hash = hashlib.sha256(MODEL.read_bytes()).hexdigest()
        if model_hash != EXPECTED_MODEL_SHA256:
            errors.append(f"Published v5.050 GLB hash changed: {model_hash}")

    if errors:
        print("Space Rider release check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Space Rider release check passed: {len(REQUIRED_IMAGES)} report images")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
