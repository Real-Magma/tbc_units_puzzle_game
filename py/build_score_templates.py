"""Build lazy-loaded score templates from BCU mamodel / maanim idle files.

Each lazy-loaded JavaScript file describes the visible sprite parts in the
idle animation at frame 0. It deliberately contains no image data: the
browser reuses the existing lazy-loaded WebP sprite sheets when a score round
begins. JavaScript is used rather than fetch JSON so local file:/// testing
works too.

Usage:
    python py/build_score_templates.py --all
    python py/build_score_templates.py 136
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT_CANDIDATES = (
    PROJECT_ROOT / "assets" / "unit_scoring" / "units",
    # Existing projects used this exported-folder name.  Keep accepting it so
    # the source files do not need to be copied or renamed just to rebuild.
    PROJECT_ROOT / "assets" / "unit_scoring" / "units_scoring",
)
OUTPUT_ROOT = PROJECT_ROOT / "assets" / "unit_scoring" / "templates"
FORM_ORDER = ("f", "c", "s", "u")
DUMMY_MARKERS = ("ダミー", "dummy", "dmy", "空っぽ", "placeholder", "blank", "empty")


@dataclass
class AnimationTrack:
    target: int
    modification: int
    loop: int
    moves: list[list[int]]


def parse_ints(line: str) -> list[int]:
    return [int(value.strip()) for value in line.strip().split(",") if value.strip()]


def parse_leading_ints(line: str, count: int) -> list[int]:
    values = line.strip().split(",")[:count]
    if len(values) != count:
        raise ValueError("animation header is incomplete")
    return [int(value.strip()) for value in values]


def is_placeholder(label: str, width: int, height: int) -> bool:
    normalised = label.strip().casefold()
    return (width == 1 and height == 1) or any(marker in normalised for marker in DUMMY_MARKERS)


def parse_imgcut(path: Path) -> list[dict[str, object]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    crops: list[dict[str, object]] = []
    for line in lines[4:]:
        if line.strip() == "[java]":
            break
        values = line.split(",")
        if len(values) not in (4, 5):
            continue
        try:
            x, y, width, height = (int(value.strip()) for value in values[:4])
        except ValueError:
            continue
        label = values[4].strip() if len(values) == 5 else ""
        crops.append({
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "label": label,
            "placeholder": is_placeholder(label, width, height),
        })
    return crops


def parse_model(path: Path) -> tuple[list[list[int]], list[int], list[list[int]]]:
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len(lines) < 4:
        raise ValueError("mamodel is incomplete")
    count = int(lines[2])
    rows: list[list[int]] = []
    for line in lines[3:3 + count]:
        values = line.split(",")
        if len(values) < 13:
            raise ValueError("mamodel part is incomplete")
        rows.append([int(value.strip()) for value in values[:13]])
    scale_info = parse_ints(lines[3 + count])
    if len(scale_info) < 3:
        raise ValueError("mamodel scale configuration is incomplete")
    config_count_index = 4 + count
    if config_count_index >= len(lines):
        raise ValueError("mamodel configuration is incomplete")
    config_count = int(lines[config_count_index])
    configs: list[list[int]] = []
    for line in lines[config_count_index + 1:config_count_index + 1 + config_count]:
        configs.append(parse_leading_ints(line, 6))
    if len(configs) != config_count:
        raise ValueError("mamodel configuration is incomplete")
    return rows, scale_info[:3], configs


def parse_animation(path: Path) -> list[AnimationTrack]:
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if len(lines) < 3:
        return []
    track_count = int(lines[2])
    cursor = 3
    tracks: list[AnimationTrack] = []
    for _ in range(track_count):
        header = parse_leading_ints(lines[cursor], 5)
        cursor += 1
        move_count = int(lines[cursor])
        cursor += 1
        moves = [parse_ints(line)[:4] for line in lines[cursor:cursor + move_count]]
        cursor += move_count
        if len(header) >= 3 and all(len(move) == 4 for move in moves):
            tracks.append(AnimationTrack(header[0], header[1], header[2], moves))
    return tracks


def value_at_frame_zero(track: AnimationTrack) -> int | None:
    """Mirror BCU Part.update() for the idle animation at frame 0."""
    if not track.moves:
        return None
    moves = [move.copy() for move in track.moves]
    first_frame = moves[0][0]
    # Part.validate() shifts every non-single-run animation to start at zero.
    offset = -first_frame if first_frame < 0 or track.loop != 1 else 0
    for move in moves:
        move[0] += offset

    last_frame = moves[-1][0]
    if track.loop == -1:
        frame = (offset % last_frame) if last_frame else 0
    else:
        frame = offset

    if frame > moves[-1][0]:
        return moves[-1][1]
    for index, move in enumerate(moves):
        current_frame, current_value, easing, easing_arg = move
        if frame == current_frame:
            return current_value
        if index >= len(moves) - 1 or not (current_frame < frame < moves[index + 1][0]):
            continue
        if track.modification <= 1:
            return current_value if track.modification == 0 else None
        next_frame, next_value = moves[index + 1][0], moves[index + 1][1]
        if easing == 1 or track.modification in (13, 14):
            ratio = 0.0
        else:
            ratio = (frame - current_frame) / (next_frame - current_frame)
            if easing == 2:
                power = easing_arg or 1
                if power >= 0:
                    ratio = 1 - math.sqrt(max(0.0, 1 - ratio ** power))
                else:
                    ratio = math.sqrt(max(0.0, 1 - (1 - ratio) ** (-power)))
            elif easing == 3:
                # BCU's ``ease3`` is a Lagrange interpolation curve across
                # the adjacent run of easing=3 keys, including the following
                # non-easing anchor.  Returning the current key (or a linear
                # endpoint) makes many collaboration units use a wrong idle
                # pose at frame zero.
                low = index
                while low > 0 and moves[low - 1][2] == 3:
                    low -= 1
                high = index
                while high + 1 < len(moves):
                    high += 1
                    if moves[high][2] != 3:
                        break
                total = 0.0
                for key_index in range(low, high + 1):
                    value = moves[key_index][1] * 4096.0
                    for other_index in range(low, high + 1):
                        if key_index != other_index:
                            value *= (
                                (frame - moves[other_index][0]) /
                                (moves[key_index][0] - moves[other_index][0])
                            )
                    total += value
                return int(total / 4096.0)
            elif easing == 4:
                if easing_arg > 0:
                    ratio = 1 - math.cos(ratio * math.pi / 2)
                elif easing_arg < 0:
                    ratio = math.sin(ratio * math.pi / 2)
                else:
                    ratio = (1 - math.cos(ratio * math.pi)) / 2
            elif easing not in (0, 2, 3, 4):
                ratio = 1.0
        value = current_value + int((next_value - current_value) * ratio)
        if track.modification == 2 and next_value < current_value:
            value = math.ceil((next_value - current_value) * ratio + current_value)
        return value
    return None


def multiply(left: tuple[float, float, float, float, float, float], right: tuple[float, float, float, float, float, float]) -> tuple[float, float, float, float, float, float]:
    a, b, c, d, tx, ty = left
    e, f, g, h, ux, uy = right
    return (
        a * e + c * f,
        b * e + d * f,
        a * g + c * h,
        b * g + d * h,
        a * ux + c * uy + tx,
        b * ux + d * uy + ty,
    )


def translate(x: float, y: float) -> tuple[float, float, float, float, float, float]:
    return (1, 0, 0, 1, x, y)


def scale(x: float, y: float) -> tuple[float, float, float, float, float, float]:
    return (x, 0, 0, y, 0, 0)


def rotate(degrees: float) -> tuple[float, float, float, float, float, float]:
    radians = math.radians(degrees)
    cosine, sine = math.cos(radians), math.sin(radians)
    return (cosine, sine, -sine, cosine, 0, 0)


def transform(matrix: tuple[float, float, float, float, float, float], x: float, y: float) -> tuple[float, float]:
    a, b, c, d, tx, ty = matrix
    return a * x + c * y + tx, b * x + d * y + ty


def build_template_from_paths(
    unit_id: str,
    form: str,
    model_path: Path,
    imgcut_path: Path,
    idle_path: Path,
) -> dict[str, object]:
    """Build a template from explicitly named BCU files."""
    model, model_info, model_configs = parse_model(model_path)
    crops = parse_imgcut(imgcut_path)
    # A small number of special units do not ship an idle animation.  Their
    # mamodel still defines a usable static pose, so use it as the template.
    tracks = parse_animation(idle_path) if idle_path.is_file() else []
    normal_scale, full_angle, full_opacity = model_info
    count = len(model)

    states: list[dict[str, float | int]] = []
    for index, row in enumerate(model):
        states.append({
            "parent": row[0], "id": row[1], "image": row[2], "z": row[3] * count + index,
            "x": row[4], "y": row[5], "pivot_x": row[6], "pivot_y": row[7],
            "scale_x": row[8], "scale_y": row[9], "angle": row[10],
            "opacity": row[11], "flip_x": 1, "flip_y": 1, "global_scale": normal_scale,
        })

    for track in tracks:
        if not (0 <= track.target < count):
            continue
        value = value_at_frame_zero(track)
        if value is None:
            continue
        base = model[track.target]
        state = states[track.target]
        mode = track.modification
        if mode == 0 and 0 <= value < count and value != track.target:
            state["parent"] = value
        elif mode == 1:
            state["id"] = value
        elif mode == 2:
            state["image"] = value
        elif mode == 3:
            state["z"] = value * count + track.target
        elif mode == 4:
            state["x"] = base[4] + value
        elif mode == 5:
            state["y"] = base[5] + value
        elif mode == 6:
            state["pivot_x"] = base[6] + value
        elif mode == 7:
            state["pivot_y"] = base[7] + value
        elif mode == 8:
            state["scale_x"] = base[8] * value / normal_scale
            state["scale_y"] = base[9] * value / normal_scale
        elif mode == 9:
            state["scale_x"] = base[8] * value / normal_scale
        elif mode == 10:
            state["scale_y"] = base[9] * value / normal_scale
        elif mode == 11:
            state["angle"] = base[10] + value
        elif mode == 12:
            state["opacity"] = value * base[11] / full_opacity
        elif mode == 13:
            state["flip_x"] = 1 if value == 0 else -1
        elif mode == 14:
            state["flip_y"] = 1 if value == 0 else -1
        elif mode == 53:
            state["global_scale"] = value

    sizes: dict[int, tuple[float, float]] = {}
    matrices: dict[int, tuple[float, float, float, float, float, float]] = {}
    effective_opacities: dict[int, float] = {}
    resolving: set[int] = set()

    def resolve(index: int) -> tuple[tuple[float, float], tuple[float, float, float, float, float, float], float]:
        if index in sizes:
            return sizes[index], matrices[index], effective_opacities[index]
        if index in resolving:
            raise ValueError(f"parent cycle at part {index}")
        resolving.add(index)
        state = states[index]
        parent = int(state["parent"])
        parent_size = (1.0, 1.0)
        parent_matrix = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
        parent_opacity = 1.0
        if 0 <= parent < count and parent != index:
            parent_size, parent_matrix, parent_opacity = resolve(parent)

        part_size = (
            parent_size[0] * float(state["scale_x"]) * float(state["global_scale"]) / (normal_scale * normal_scale),
            parent_size[1] * float(state["scale_y"]) * float(state["global_scale"]) / (normal_scale * normal_scale),
        )
        matrix = parent_matrix
        if index == 0:
            # BCU applies the first mamodel configuration as an origin shift
            # before the root pivot.  It usually disappears after centering,
            # but preserving it keeps every child in the same coordinate space
            # as BCU for scoring and PNG export.
            if model_configs:
                root_config = model_configs[0]
                matrix = multiply(matrix, translate(
                    -part_size[0] * root_config[2],
                    -part_size[1] * root_config[3],
                ))
            matrix = multiply(matrix, translate(
                part_size[0] * float(state["pivot_x"]) * float(state["flip_x"]),
                part_size[1] * float(state["pivot_y"]) * float(state["flip_y"]),
            ))
        else:
            matrix = multiply(matrix, translate(
                parent_size[0] * float(state["x"]),
                parent_size[1] * float(state["y"]),
            ))
        matrix = multiply(matrix, scale(float(state["flip_x"]), float(state["flip_y"])))
        matrix = multiply(matrix, rotate(float(state["angle"]) * 360 / full_angle))
        opacity = max(0.0, min(1.0, float(state["opacity"]) / full_opacity)) * parent_opacity
        sizes[index], matrices[index], effective_opacities[index] = part_size, matrix, opacity
        resolving.remove(index)
        return part_size, matrix, opacity

    parts: list[dict[str, object]] = []
    for index, state in enumerate(states):
        image_index = int(state["image"])
        if int(state["id"]) < 0 or image_index < 0 or image_index >= len(crops):
            continue
        crop = crops[image_index]
        if bool(crop["placeholder"]) or float(state["opacity"]) <= 0:
            continue
        try:
            part_size, matrix, opacity = resolve(index)
        except ValueError:
            continue
        if opacity <= 0:
            continue
        width, height = float(crop["width"]), float(crop["height"])
        local_center_x = (width / 2 - float(state["pivot_x"])) * part_size[0]
        local_center_y = (height / 2 - float(state["pivot_y"])) * part_size[1]
        center_x, center_y = transform(matrix, local_center_x, local_center_y)
        angle = math.degrees(math.atan2(matrix[1], matrix[0]))
        determinant = matrix[0] * matrix[3] - matrix[1] * matrix[2]
        parts.append({
            "modelIndex": index,
            "cropIndex": image_index,
            "x": round(center_x, 5),
            "y": round(center_y, 5),
            "angle": round(angle, 5),
            "scaleX": round(abs(part_size[0]), 5),
            "scaleY": round(abs(part_size[1]), 5),
            # CSS rotation alone cannot represent BCU's reflection matrix.
            # Keep the signs separately so answer previews and exported PNGs
            # render the same left/right orientation as the source animation.
            "flipX": -1 if part_size[0] < 0 else 1,
            "flipY": -1 if determinant * part_size[1] < 0 else 1,
            "z": int(state["z"]),
            "opacity": round(opacity, 5),
        })

    parts.sort(key=lambda part: (int(part["z"]), int(part["modelIndex"])))
    if not parts:
        raise ValueError("no visible idle parts")
    xs = [float(part["x"]) for part in parts]
    ys = [float(part["y"]) for part in parts]
    return {
        "version": 2,
        "unitId": unit_id,
        "rank": form,
        "frame": 0,
        "parts": parts,
        "bounds": {
            "minX": round(min(xs), 5), "maxX": round(max(xs), 5),
            "minY": round(min(ys), 5), "maxY": round(max(ys), 5),
        },
    }


def build_template(unit_id: str, form: str, form_dir: Path) -> dict[str, object]:
    return build_template_from_paths(
        unit_id,
        form,
        form_dir / "mamodel.txt",
        form_dir / "imgcut.txt",
        form_dir / "maanim_idle.txt",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Build BCU idle-pose score templates")
    parser.add_argument("unit_ids", nargs="*", help="three-digit unit IDs")
    parser.add_argument("--all", action="store_true", help="build every unit under assets/unit_scoring")
    parser.add_argument("--from", dest="first_id", metavar="ID", help="first unit ID to include")
    parser.add_argument("--to", dest="last_id", metavar="ID", help="last unit ID to include")
    args = parser.parse_args()
    source_root = next((path for path in SOURCE_ROOT_CANDIDATES if path.is_dir()), None)
    if source_root is None:
        expected = " or ".join(str(path) for path in SOURCE_ROOT_CANDIDATES)
        raise SystemExit(f"Missing source directory: {expected}")
    if not args.all and not args.unit_ids:
        raise SystemExit("Pass --all or one or more unit IDs")

    wanted = {unit_id.zfill(3) for unit_id in args.unit_ids}
    unit_dirs = sorted(path for path in source_root.iterdir() if path.is_dir() and path.name.isdigit())
    if not args.all:
        unit_dirs = [path for path in unit_dirs if path.name in wanted]
    if args.first_id:
        unit_dirs = [path for path in unit_dirs if path.name >= args.first_id.zfill(3)]
    if args.last_id:
        unit_dirs = [path for path in unit_dirs if path.name <= args.last_id.zfill(3)]
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    success = skipped = 0
    for unit_dir in unit_dirs:
        for form in FORM_ORDER:
            form_dir = unit_dir / form
            required = [form_dir / name for name in ("imgcut.txt", "mamodel.txt")]
            if not form_dir.is_dir() or not all(path.is_file() for path in required):
                skipped += 1
                continue
            try:
                template = build_template(unit_dir.name, form, form_dir)
            except (OSError, ValueError, UnicodeDecodeError) as error:
                skipped += 1
                print(f"Skipped {unit_dir.name}/{form}: {type(error).__name__}")
                continue
            output_dir = OUTPUT_ROOT / unit_dir.name
            output_dir.mkdir(parents=True, exist_ok=True)
            # Script loading also works from file:/// during local testing,
            # while fetch() of a local JSON file is blocked by most browsers.
            script_output = output_dir / f"{form}.js"
            script_output.write_text(
                "window.SCORE_TEMPLATES ??= {};"
                f"window.SCORE_TEMPLATES[{json.dumps(f'{unit_dir.name}/{form}')}]="
                f"{json.dumps(template, ensure_ascii=False, separators=(',', ':'))};\n",
                encoding="utf-8",
            )
            legacy_json = output_dir / f"{form}.json"
            if legacy_json.exists():
                legacy_json.unlink()
            success += 1
    print(f"Built {success} templates; skipped {skipped}. Output: {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
