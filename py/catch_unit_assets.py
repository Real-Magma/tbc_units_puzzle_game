from pathlib import Path
from PIL import Image
import re

# 預期來源資料夾與專案同在桌面下：../../../貓戰BCU/org
project_root = Path(__file__).resolve().parents[1]
path = project_root.parent.parent.parent / '貓戰BCU' / 'org'

for i in path.rglob('*.imgcut'):
    phase = i.stem[-1]
    cat_id = i.stem[:3]
    imgcut = open(i, encoding='utf8').read().splitlines()
    bcu_parent = i.parent
    try:
        img = Image.open(bcu_parent/imgcut[2])
    except FileNotFoundError:
        continue
    target_dir = Path('battle cats/unit') / i.relative_to(path).parent
    target_dir.mkdir(parents=True, exist_ok=True)

    k=0
    for c in imgcut[3:]:
        if c == '[java]': break
        coord = c.split(',')
        try:
            if len(coord) == 5:
                x, y, l, w, name = coord
            elif len(coord) == 4:
                x, y, l, w = coord
                name = f'img{str(k).zfill(3)}'
                k += 1
            else:
                continue
            name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "", name)
            x, y, l, w = int(x), int(y), int(l), int(w)
            cropped_img = img.crop((x, y, x+l, y+w))
            final_path = str(target_dir/name)
            if not final_path.endswith('.png'):
                final_path = final_path+'.png'
            cropped_img.save(final_path)
        except Exception as e:
            print(f'Error at {i.name}: {e}')
