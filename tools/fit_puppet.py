#!/usr/bin/env python3
"""Fit the battle-Asgore part offsets against a reference frame:
draws the composite (parts at PARTS offsets, sprite px) in colour over the frame
(scaled to sprite px) -> work/fit.png. Offsets found here go to src/boss.js.

The reference frame is not in this repo. src/boss.js already has the fitted offsets.

    python tools/fit_puppet.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import slice_sheet as S
from PIL import Image, ImageOps

cs, _ = S.cells(S.SHEETS['boss'])
P = lambda i: Image.fromarray(cs[i]['img'])
# name: (cell, x, y, rot deg, mirror)
PARTS = [
    ('cape0', 233, 0, 33, 0, 0),
    ('legs', 243, 48, 86, 0, 0),
    ('belt', 242, 47, 60, 0, 0),
    ('torso', 236, 22, 20, 0, 0),
    ('head', 235, 56, 2, 0, 0),
    ('feet', 244, 37, 109, 0, 0),
    ('armL', 241, 28, 38, 7, 0),
    ('armR', 240, 112, 52, -6, 0),
    ('spear', 174, 25, 26, -27, 0),
    ('fistL', 237, 32, 32, -26, 0),
    ('fistR', 238, 104, 68, -26, 0),
]
frame = Image.open('work/vid/idle96.png').convert('L')
crop = frame.crop((700, 0, 1900, 760)).resize((200, 127), Image.BOX)
OX, OY = 16.7, 0  # composite origin inside the crop
SC = 4
bg = ImageOps.autocontrast(crop).convert('RGBA').resize((200 * SC, 127 * SC), Image.NEAREST)
comp = Image.new('RGBA', (200, 127), (0, 0, 0, 0))
for name, cell, x, y, rot, mir in PARTS:
    im = P(cell)
    if mir: im = ImageOps.mirror(im)
    pv = (0, 31) if name == 'spear' else (0, 0)  # rotate about the top-left (spear: the butt)
    big = Image.new('RGBA', (600, 600), (0, 0, 0, 0)); big.alpha_composite(im, (300 - pv[0], 300 - pv[1]))
    if rot: big = big.rotate(rot, center=(300, 300), resample=Image.NEAREST)
    layer = Image.new('RGBA', comp.size, (0, 0, 0, 0)); layer.alpha_composite(big, (int(round(OX + x)) - 300, int(round(OY + y)) - 300)) if False else None
    tmp = Image.new('RGBA', (comp.width + 1200, comp.height + 1200), (0, 0, 0, 0)); tmp.alpha_composite(big, (int(round(OX + x)) - 300 + 600, int(round(OY + y)) - 300 + 600))
    comp.alpha_composite(tmp.crop((600, 600, 600 + comp.width, 600 + comp.height)))
# tint composite: white -> red, black -> translucent blue
px = comp.load()
for yy in range(comp.height):
    for xx in range(comp.width):
        r, g, b, a = px[xx, yy]
        if a < 128: continue
        px[xx, yy] = (255, 40, 40, 200) if r > 128 else (40, 80, 255, 70)
over = bg.copy()
over.alpha_composite(comp.resize((200 * SC, 127 * SC), Image.NEAREST))
side = Image.new('RGBA', (400 * SC, 127 * SC))
side.paste(bg, (0, 0)); side.paste(over, (200 * SC, 0))
side.save('work/fit.png')
print('ok')
