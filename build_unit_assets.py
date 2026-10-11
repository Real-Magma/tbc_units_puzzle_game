"""Crop BCU unit sprites into web assets and update the browser catalog.

Usage:
    py build_unit_assets.py 001
    py build_unit_assets.py 001 002 003
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE_ROOT = PROJECT_ROOT / "org" / "unit"
ASSET_ROOT = PROJECT_ROOT / "assets" / "units"


def read_imgcut(path: Path) -> tuple[str, list[dict[str, object]]]:
    """Return the source sheet filename and crop rectangles before [java]."""
    lines = path.read_text(encoding="utf-8").splitlines()
    sheet_name = lines[2]
    parts: list[dict[str, object]] = []

    for line in lines[4:]:
        if line == "[java]":
            break
        values = line.split(",")
        if len(values) not in (4, 5):
            continue
        x, y, width, height = map(int, values[:4])
        label = values[4].strip() if len(values) == 5 else ""
        parts.append({"x": x, "y": y, "width": width, "height": height, "label": label})

    return sheet_name, parts


def safe_label(label: str) -> str:
    return re.sub(r"\s+", " ", label).strip()


def crop_unit(unit_id: str, source_root: Path) -> dict[str, object]:
    source_unit = source_root / unit_id
    if not source_unit.is_dir():
        raise FileNotFoundError(f"找不到角色資料夾：{source_unit}")

    unit_output = ASSET_ROOT / unit_id
    parts: list[dict[str, object]] = []

    for form_dir in sorted(path for path in source_unit.iterdir() if path.is_dir()):
        imgcut_files = list(form_dir.glob("*.imgcut"))
        if not imgcut_files:
            continue

        imgcut_path = imgcut_files[0]
        sheet_name, rectangles = read_imgcut(imgcut_path)
        sheet_path = form_dir / sheet_name
        if not sheet_path.is_file():
            continue

        with Image.open(sheet_path) as sheet:
            output_form = unit_output / form_dir.name
            output_form.mkdir(parents=True, exist_ok=True)

            for index, rectangle in enumerate(rectangles):
                label = safe_label(str(rectangle["label"]))
                if "ダミー" in label or "空っぽ" in label:
                    continue

                x, y = int(rectangle["x"]), int(rectangle["y"])
                width, height = int(rectangle["width"]), int(rectangle["height"])
                filename = f"{index:02d}.png"
                output_path = output_form / filename
                sheet.crop((x, y, x + width, y + height)).save(output_path)

                parts.append({
                    "id": f"{form_dir.name}-{index:02d}",
                    "name": label or f"部件 {index + 1:02d}",
                    "form": form_dir.name,
                    "src": f"assets/units/{unit_id}/{form_dir.name}/{filename}",
                    "width": width,
                    "height": height,
                })

    if not parts:
        raise RuntimeError(f"{unit_id} 沒有可用的裁切部件")

    return {"id": unit_id, "parts": parts}


def main() -> None:
    unit_ids = [value.zfill(3) for value in sys.argv[1:]] or ["001"]
    ASSET_ROOT.mkdir(parents=True, exist_ok=True)
    catalog_path = ASSET_ROOT / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8")) if catalog_path.exists() else {}

    for unit_id in unit_ids:
        catalog[unit_id] = crop_unit(unit_id, DEFAULT_SOURCE_ROOT)
        print(f"已處理角色 {unit_id}：{len(catalog[unit_id]['parts'])} 個部件")

    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
