"""Crop BCU unit sprites into web assets and update the browser catalog.

Usage:
    py build_unit_assets.py 001
    py build_unit_assets.py 001 002 003
    py build_unit_assets.py --all
    py build_unit_assets.py --refresh-names
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE_ROOT = PROJECT_ROOT / "assets" / "units_original"
ASSET_ROOT = PROJECT_ROOT / "assets" / "units"
UNIT_NAME_PATH = PROJECT_ROOT / "assets" / "UnitName.txt"
INVALID_FOLDER_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')


def read_unit_names(path: Path = UNIT_NAME_PATH) -> dict[str, str]:
    """Read the base-form unit names from the tab-separated UnitName.txt."""
    if not path.is_file():
        return {}

    names: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        columns = line.split("\t")
        if not columns or not re.fullmatch(r"\d{3}", columns[0].strip()):
            continue
        if len(columns) > 1 and columns[1].strip():
            names[columns[0].strip()] = columns[1].strip()
    return names


def output_folder_name(unit_id: str, unit_name: str | None) -> str:
    """Return a Windows-safe folder name such as '000 貓咪'."""
    if not unit_name:
        return unit_id
    safe_name = INVALID_FOLDER_CHARS.sub("_", unit_name).strip().rstrip(".")
    return f"{unit_id} {safe_name}" if safe_name else unit_id


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


def crop_unit(unit_id: str, source_root: Path, unit_names: dict[str, str]) -> dict[str, object]:
    source_unit = source_root / unit_id
    if not source_unit.is_dir():
        raise FileNotFoundError(f"找不到角色資料夾：{source_unit}")

    unit_name = unit_names.get(unit_id)
    folder_name = output_folder_name(unit_id, unit_name)
    unit_output = ASSET_ROOT / folder_name
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
            sheet_width, sheet_height = sheet.size

            for index, rectangle in enumerate(rectangles):
                label = safe_label(str(rectangle["label"]))
                if "ダミー" in label or "空っぽ" in label:
                    continue

                x, y = int(rectangle["x"]), int(rectangle["y"])
                width, height = int(rectangle["width"]), int(rectangle["height"])
                left = max(0, x)
                top = max(0, y)
                right = min(sheet_width, x + width)
                bottom = min(sheet_height, y + height)
                if left >= right or top >= bottom:
                    print(
                        f"略過超出圖片範圍的部件：{unit_id} / {form_dir.name} / {index:02d}"
                    )
                    continue

                filename = f"{index:02d}.png"
                output_path = output_form / filename
                sheet.crop((left, top, right, bottom)).save(output_path)

                parts.append({
                    "id": f"{form_dir.name}-{index:02d}",
                    "name": label or f"部件 {index + 1:02d}",
                    "form": form_dir.name,
                    "src": f"assets/units/{quote(folder_name)}/{form_dir.name}/{filename}",
                    "width": right - left,
                    "height": bottom - top,
                })

    if not parts:
        raise RuntimeError(f"{unit_id} 沒有可用的裁切部件")

    return {"id": unit_id, "name": unit_name or unit_id, "folder": folder_name, "parts": parts}


def write_browser_catalogs(catalog: dict[str, dict[str, object]]) -> None:
    """Write the legacy catalog plus lightweight index and per-unit manifests."""
    catalog_path = ASSET_ROOT / "catalog.json"
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")

    catalog_script_path = ASSET_ROOT / "catalog.js"
    catalog_script_path.write_text(
        f"window.UNIT_CATALOG = {json.dumps(catalog, ensure_ascii=False)};\n",
        encoding="utf-8",
    )

    manifests_root = ASSET_ROOT / "manifests"
    manifests_root.mkdir(exist_ok=True)
    unit_index: dict[str, dict[str, object]] = {}
    for unit_id, entry in catalog.items():
        parts = entry.get("parts", [])
        unit_index[unit_id] = {
            "id": entry.get("id", unit_id),
            "name": entry.get("name", unit_id),
            "folder": entry.get("folder", unit_id),
            "forms": sorted({part["form"] for part in parts if "form" in part}),
        }
        (manifests_root / f"{unit_id}.json").write_text(
            json.dumps(entry, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        (manifests_root / f"{unit_id}.js").write_text(
            "window.UNIT_MANIFESTS ??= {};"
            f"window.UNIT_MANIFESTS[{json.dumps(unit_id)}]="
            f"{json.dumps(entry, ensure_ascii=False, separators=(',', ':'))};\n",
            encoding="utf-8",
        )

    (ASSET_ROOT / "index.js").write_text(
        f"window.UNIT_INDEX = {json.dumps(unit_index, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )


def main() -> None:
    arguments = sys.argv[1:]
    refresh_names_only = "--refresh-names" in arguments
    build_all = "--all" in arguments
    if build_all:
        unit_ids = sorted(
            path.name
            for path in DEFAULT_SOURCE_ROOT.iterdir()
            if path.is_dir() and re.fullmatch(r"\d{3}", path.name)
        )
    else:
        unit_ids = [
            value.zfill(3)
            for value in arguments
            if value not in {"--refresh-names", "--all"}
        ] or ([] if refresh_names_only else ["001"])
    ASSET_ROOT.mkdir(parents=True, exist_ok=True)
    catalog_path = ASSET_ROOT / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8")) if catalog_path.exists() else {}

    unit_names = read_unit_names()
    for unit_id, entry in catalog.items():
        if unit_id in unit_names:
            entry["name"] = unit_names[unit_id]

    try:
        for unit_id in unit_ids:
            try:
                catalog[unit_id] = crop_unit(unit_id, DEFAULT_SOURCE_ROOT, unit_names)
            except (FileNotFoundError, RuntimeError, OSError) as error:
                print(f"略過角色 {unit_id}：{error}")
                continue

            print(f"已處理角色 {unit_id}：{len(catalog[unit_id]['parts'])} 個部件")
    finally:
        # Keep the successfully processed units available even if a later file is broken.
        write_browser_catalogs(catalog)


if __name__ == "__main__":
    main()
