#!/usr/bin/env python3
"""Contact sheet of rendered frames: python tools/sheet.py <dir> <out.png> [cols] [scale]"""
import sys, os
from PIL import Image, ImageDraw

d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
sc = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5


def key(f):
    s = f[2:-4]
    try:
        return (0, float(s.lstrip('bc')), s)
    except ValueError:
        return (1, 0, s)


fs = sorted([f for f in os.listdir(d) if f.startswith('f_') and f.endswith('.png')], key=key)
ims = [Image.open(os.path.join(d, f)).convert('RGB') for f in fs]
w, h = int(ims[0].width * sc), int(ims[0].height * sc)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * h), (40, 40, 40))
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * w, (i // cols) * h
    S.paste(im.resize((w, h), Image.LANCZOS), (x, y))
    ImageDraw.Draw(S).text((x + 4, y + 2), f[2:-4], fill=(255, 220, 0))
S.save(out)
print(out, S.size)
