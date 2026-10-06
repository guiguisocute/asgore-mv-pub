#!/usr/bin/env python3
"""Cut the spriters-resource sheets in asset/ into frames.

Every sheet has a dark purple page (138,90,157) and each frame sits on a light
purple cell (195,134,255). Each connected non-page region is one cell; the cell
colour becomes transparent. Section titles on the page are dropped by the name
tables (only listed cells are exported).

    .venv/Scripts/python tools/slice_sheet.py            # -> work/index/<sheet>.png (numbered cells)
    .venv/Scripts/python tools/slice_sheet.py --export   # -> work/parts/<sheet>/<name>.png

The index is stable: cells sorted top-to-bottom (rows of 6 px), left-to-right.
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

A = 'asset/PC _ Computer - Undertale - '
SHEETS = {
    'boss': A + 'Enemies & Bosses - Asgore Dreemurr.png',
    'souls': A + 'Miscellaneous - The Human Souls.png',
    'asgore': A + 'Non-Playable Characters - Asgore Dreemurr.png',
    'asriel': A + 'Non-Playable Characters - Asriel Dreemurr.png',
    'chara': A + 'Non-Playable Characters - Chara.png',
    'toriel': A + 'Non-Playable Characters - Toriel.png',
    'frisk': A + 'Playable Characters - Frisk.png',
}
PAGE = (138, 90, 157)
CELL = (195, 134, 255)


def cells(sheet):
    im = np.array(Image.open(sheet).convert('RGBA'))
    page = (im[..., 0] == PAGE[0]) & (im[..., 1] == PAGE[1]) & (im[..., 2] == PAGE[2])
    lab, n = ndimage.label(~page)
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        sub = im[y0:y1, x0:x1].copy()
        m = lab[y0:y1, x0:x1] == i + 1
        cellpx = (sub[..., 0] == CELL[0]) & (sub[..., 1] == CELL[1]) & (sub[..., 2] == CELL[2])
        sub[~m | cellpx] = 0
        out.append(dict(x=x0, y=y0, w=x1 - x0, h=y1 - y0, img=sub, cell=cellpx.sum() > 0.2 * m.sum()))
    out.sort(key=lambda c: (round(c['y'] / 6), c['x']))
    return out, im


def index_image(key):
    cs, im = cells(SHEETS[key])
    base = Image.fromarray(im).convert('RGB')
    sc = 2 if base.width < 800 else 1
    base = base.resize((base.width * sc, base.height * sc), Image.NEAREST)
    d = ImageDraw.Draw(base)
    for i, c in enumerate(cs):
        if c['w'] * c['h'] < 4:
            continue
        d.rectangle([c['x'] * sc, c['y'] * sc, (c['x'] + c['w']) * sc - 1, (c['y'] + c['h']) * sc - 1], outline=(0, 255, 0))
        d.text((c['x'] * sc + 1, c['y'] * sc + 1), str(i), fill=(255, 255, 0) if c['cell'] else (0, 255, 255))
    os.makedirs('work/index', exist_ok=True)
    base.save(f'work/index/{key}.png')
    print(key, len(cs), 'cells')


if __name__ == '__main__':
    for k in SHEETS:
        index_image(k)
