"""Build browser-ready enemy sprites and score templates from BCU exports.

The BCU enemy export retains names such as 000_e.imgcut. This script writes:

* assets/enemies: lazy-loaded enemy manifests and index
* assets/enemy_sprites: lossless WebP sprite sheets
* assets/enemy_scoring/templates: idle-pose score templates

Usage:
    py py/build_enemy_assets.py --all
    py py/build_enemy_assets.py 000 001 378
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import quote

from PIL import Image

from build_score_templates import build_template_from_paths, parse_imgcut


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = PROJECT_ROOT / "assets" / "enemy_scoring" / "enemies_scoring"
ASSET_ROOT = PROJECT_ROOT / "assets" / "enemies"
SPRITE_ROOT = PROJECT_ROOT / "assets" / "enemy_sprites"
TEMPLATE_ROOT = PROJECT_ROOT / "assets" / "enemy_scoring" / "templates"
ENEMY_NAME_PATHS = (
    PROJECT_ROOT / "assets" / "EnemyName_tw.txt",
    PROJECT_ROOT / "assets" / "EnemyName_jp.txt",
    PROJECT_ROOT / "assets" / "EnemyName_kr.txt",
)


def read_enemy_names() -> dict[str, str]:
    """Prefer Traditional Chinese enemy names, then Japanese and Korean."""
    names: dict[str, str] = {}
    for path in ENEMY_NAME_PATHS:
        if not path.is_file():
            continue
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            values = line.split("\t", 1)
            if len(values) == 2 and re.fullmatch(r"\d{3}", values[0].strip()) and values[1].strip():
                names.setdefault(values[0].strip(), values[1].strip())
    return names


def source_sheet_name(imgcut_path: Path) -> str:
    lines = imgcut_path.read_text(encoding="utf-8").splitlines()
    if len(lines) < 3 or not lines[2].strip():
        raise ValueError("imgcut has no source sheet name")
    return lines[2].strip()


def make_entry(enemy_id: str, enemy_names: dict[str, str]) -> tuple[dict[str, object], dict[str, object]]:
    enemy_dir = SOURCE_ROOT / enemy_id
    imgcut_path = next(iter(sorted(enemy_dir.glob("*_e.imgcut"))), None)
    model_path = next(iter(sorted(enemy_dir.glob("*_e.mamodel"))), None)
    idle_path = next(iter(sorted(enemy_dir.glob("*_e00.maanim"))), None)
    if not imgcut_path or not model_path:
        raise ValueError("missing imgcut or mamodel")

    sheet_name = source_sheet_name(imgcut_path)
    # BCU enemy imgcut metadata commonly prefixes the sheet with ``i`` even
    # though the exported PNG is named ``000_e.png``.
    sheet_candidates = [enemy_dir / sheet_name]
    if sheet_name.startswith("i"):
        sheet_candidates.append(enemy_dir / sheet_name[1:])
    sheet_path = next((path for path in sheet_candidates if path.is_file()), None)
    # Some BCU enemies inherit another unit/enemy sheet in imgcut metadata but
    # still export a matching local enemy sheet alongside their own model.
    # Prefer the declared source; only use this packaged local fallback when
    # that external dependency is absent from the project.
    if sheet_path is None:
        local_sheet = enemy_dir / f"{enemy_id}_e.png"
        if local_sheet.is_file():
            sheet_path = local_sheet
    if sheet_path is None:
        raise ValueError(f"missing source sheet: {sheet_name}")

    crops = parse_imgcut(imgcut_path)
    sprite_path = SPRITE_ROOT / enemy_id / "e.webp"
    sprite_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(sheet_path) as sheet:
        sheet_width, sheet_height = sheet.size
        sheet.convert("RGBA").save(
            sprite_path,
            "WEBP",
            lossless=True,
            quality=100,
            method=4,
        )

    source = f"assets/enemy_sprites/{quote(enemy_id)}/e.webp"
    parts: list[dict[str, object]] = []
    for index, crop in enumerate(crops):
        if bool(crop["placeholder"]):
            continue
        x, y = int(crop["x"]), int(crop["y"])
        width, height = int(crop["width"]), int(crop["height"])
        left, top = max(0, x), max(0, y)
        right, bottom = min(sheet_width, x + width), min(sheet_height, y + height)
        if left >= right or top >= bottom:
            continue
        label = str(crop["label"]).strip()
        parts.append({
            "id": f"e-{index:02d}",
            "name": label or f"部件 {index + 1:02d}",
            "form": "e",
            "src": source,
            "width": right - left,
            "height": bottom - top,
            "sprite": {
                "x": left,
                "y": top,
                "width": right - left,
                "height": bottom - top,
                "sheetWidth": sheet_width,
                "sheetHeight": sheet_height,
            },
        })

    if not parts:
        raise ValueError("no usable sprite crops")
    template = build_template_from_paths(
        enemy_id,
        "e",
        model_path,
        imgcut_path,
        idle_path if idle_path is not None else enemy_dir / "missing.maanim",
    )
    usable_crop_indexes = {int(str(part["id"]).split("-", 1)[1]) for part in parts}
    template["parts"] = [
        part for part in template["parts"]
        if int(part["cropIndex"]) in usable_crop_indexes
    ]
    if not template["parts"]:
        raise ValueError("no usable visible idle parts")
    template["bounds"] = {
        "minX": min(part["x"] for part in template["parts"]),
        "maxX": max(part["x"] for part in template["parts"]),
        "minY": min(part["y"] for part in template["parts"]),
        "maxY": max(part["y"] for part in template["parts"]),
    }
    return {
        "id": enemy_id,
        "name": enemy_names.get(enemy_id, f"敵人 {enemy_id}"),
        "folder": enemy_id,
        "parts": parts,
    }, template


def write_catalog(catalog: dict[str, dict[str, object]]) -> None:
    ASSET_ROOT.mkdir(parents=True, exist_ok=True)
    manifests_root = ASSET_ROOT / "manifests"
    manifests_root.mkdir(exist_ok=True)
    index: dict[str, dict[str, object]] = {}
    for enemy_id, entry in catalog.items():
        parts = entry["parts"]
        index[enemy_id] = {
            "id": enemy_id,
            "name": entry["name"],
            "folder": enemy_id,
            "forms": sorted({part["form"] for part in parts}),
        }
        payload = json.dumps(entry, ensure_ascii=False, separators=(",", ":"))
        (manifests_root / f"{enemy_id}.json").write_text(payload, encoding="utf-8")
        (manifests_root / f"{enemy_id}.js").write_text(
            "window.ENEMY_MANIFESTS ??= {};"
            f"window.ENEMY_MANIFESTS[{json.dumps(enemy_id)}]={payload};\n",
            encoding="utf-8",
        )

    payload = json.dumps(catalog, ensure_ascii=False, separators=(",", ":"))
    (ASSET_ROOT / "catalog.json").write_text(payload, encoding="utf-8")
    (ASSET_ROOT / "catalog.js").write_text(f"window.ENEMY_CATALOG={payload};\n", encoding="utf-8")
    (ASSET_ROOT / "index.js").write_text(
        f"window.ENEMY_INDEX={json.dumps(index, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )


def write_template(enemy_id: str, template: dict[str, object]) -> None:
    output_dir = TEMPLATE_ROOT / enemy_id
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "e.js").write_text(
        "window.ENEMY_SCORE_TEMPLATES ??= {};"
        f"window.ENEMY_SCORE_TEMPLATES[{json.dumps(f'{enemy_id}/e')}]="
        f"{json.dumps(template, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Build browser-ready BCU enemy assets")
    parser.add_argument("enemy_ids", nargs="*", help="three-digit enemy IDs")
    parser.add_argument("--all", action="store_true", help="build every enemy in assets/enemy_scoring/enemies_scoring")
    parser.add_argument("--refresh-names", action="store_true", help="update catalog names without rebuilding images or templates")
    args = parser.parse_args()
    if not SOURCE_ROOT.is_dir():
        raise SystemExit(f"Missing source directory: {SOURCE_ROOT}")

    if args.all:
        enemy_ids = sorted(path.name for path in SOURCE_ROOT.iterdir() if path.is_dir() and re.fullmatch(r"\d{3}", path.name))
    else:
        enemy_ids = [enemy_id.zfill(3) for enemy_id in args.enemy_ids] or ["000"]

    catalog_path = ASSET_ROOT / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8")) if catalog_path.is_file() else {}
    enemy_names = read_enemy_names()
    if args.refresh_names:
        for enemy_id, entry in catalog.items():
            entry["name"] = enemy_names.get(enemy_id, f"敵人 {enemy_id}")
        write_catalog(catalog)
        print(f"Refreshed names for {len(catalog)} enemies.")
        return

    succeeded = 0
    skipped: list[str] = []
    for enemy_id in enemy_ids:
        try:
            entry, template = make_entry(enemy_id, enemy_names)
            catalog[enemy_id] = entry
            write_template(enemy_id, template)
            succeeded += 1
        except (OSError, UnicodeDecodeError, ValueError) as error:
            skipped.append(f"{enemy_id}: {error}")

    write_catalog(catalog)
    print(f"Built {succeeded} enemies; skipped {len(skipped)}.")
    for message in skipped:
        print(f"SKIPPED {message}")


if __name__ == "__main__":
    main()
