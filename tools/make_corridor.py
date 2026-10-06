#!/usr/bin/env python3
"""Bake the barrier room's light from a reference recording into src/corridor.js.

The recording itself is not in this repo (too large). src/corridor.js is already
baked; this script is here for anyone who wants to rebuild it from a capture.

The room's light is one wave flowing into the door: every ~6.8 s the walls brighten
slowly and fall back, and the closer a point is to the door, the later the wave reaches
it (the door itself runs about half a period behind the walls, so it glows when the walls
are dark). So instead of a fixed picture the bake stores, per game pixel (3 px cells):

    lo, hi  the darkest / brightest it gets (0..255)
    ph      when the wave peaks there, as a fraction of the period (0..1, walls ~0)

and the shared waveform (slow rise, quicker fall) measured on the walls. The renderer
plays the wave on the GPU: v = lo + (hi - lo) * wave(frac((t - t0) / P - ph)).

Only frames without a text box are used; Asgore, Frisk and the watermark are filled from
their neighbours; the maps are made left-right symmetric.

    .venv/Scripts/python tools/make_corridor.py
"""
import json, subprocess, tempfile, os
import numpy as np
from PIL import Image

SRC = 'asset/asgore-fight-record-100mb.mp4'
WINDOWS = [(17.5, 22.9), (46.0, 49.3), (51.7, 56.3)]  # no text box / portrait box (the jars rise in the third)
FPS = 15
VS = 3


def clip(t0, t1):
    with tempfile.TemporaryDirectory() as td:
        p = os.path.join(td, 'c.gray')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t0), '-t', str(t1 - t0), '-i', SRC,
                        '-vf', f'fps={FPS},crop=1920:1440:320:0,scale=640:480:flags=area,format=gray', '-f', 'rawvideo', p], check=True)
        a = np.fromfile(p, dtype=np.uint8).reshape(-1, 480, 640).astype(np.float64)
    ts = t0 + np.arange(a.shape[0]) / FPS
    return a, ts


frames, times = [], []
for t0, t1 in WINDOWS:
    a, ts = clip(t0, t1)
    # drop frames with the text box (its white frame line at y ~ 11-13)
    box = (a[:, 40:140, 80:560].mean(axis=(1, 2)) < 12) & (a[:, 10:14, 40:600].mean(axis=(1, 2)) > 150)
    frames.append(a[~box]); times.append(ts[~box])
A = np.concatenate(frames); TS = np.concatenate(times)
print('frames used', len(TS))

# period from the far wall's peaks
wall = A[:, 300, 60:120].mean(axis=1)
P = 6.8
best = None
for p in np.arange(6.3, 7.3, 0.01):
    z = np.abs(np.sum((wall - wall.mean()) * np.exp(-2j * np.pi * TS / p)))
    if best is None or z > best[0]:
        best = (z, p)
P = best[1]
# per-pixel phase of the fundamental, relative to the far wall; range
w = np.exp(-2j * np.pi * TS / P)
Z = np.tensordot(w, A - A.mean(axis=0), axes=(0, 0))  # (480, 640)
zw = np.sum(w * (wall - wall.mean()))
ph = (np.angle(zw) - np.angle(Z)) / (2 * np.pi) % 1.0  # 0 = with the walls, later -> larger
lo = np.percentile(A, 3, axis=0)
hi = np.percentile(A, 97, axis=0)

# waveform on the far wall: fold its samples by phase, peak at 0 (smoothed over 3 bins)
u = ((TS / P) - (np.angle(zw) / (2 * np.pi) * -1)) % 1.0
peak_u = u[np.argmax(wall)]
uu = (u - peak_u) % 1.0
bins = 40
wave = np.zeros(bins)
for b in range(bins):
    m = (uu >= b / bins) & (uu < (b + 1) / bins)
    wave[b] = wall[m].mean() if m.any() else np.nan
idx = np.arange(bins)
wave = np.interp(idx, idx[~np.isnan(wave)], wave[~np.isnan(wave)])
# The light is a triangle wave with hard corners (linear fall, linear rise; checked at 0.5 s
# steps: 247 -> 2 in ~2.8 s, 2 -> 247 in ~4 s): a smoothed fold rounds the corners and the
# fitted range then never reaches the game's black and white. Fit the fall fraction of a
# triangle (peak at 0) to the far wall's samples and use the exact triangle.
def tri(f, n=bins):
    b = np.arange(n) / n
    return np.where(b < f, 1 - b / f, (b - f) / (1 - f))
best_f = None
for f in np.arange(0.30, 0.56, 0.005):
    W = tri(f)
    x = (uu * bins) % bins
    i0 = np.floor(x).astype(int) % bins; fr = x - np.floor(x)
    Wv = W[i0] * (1 - fr) + W[(i0 + 1) % bins] * fr
    A_ = np.c_[np.ones_like(Wv), Wv]
    coef, res, *_ = np.linalg.lstsq(A_, wall, rcond=None)
    r = np.sum((A_ @ coef - wall) ** 2)
    if best_f is None or r < best_f[0]:
        best_f = (r, f, coef)
print('triangle fall fraction', round(best_f[1], 3), 'wall lo/hi', np.round(best_f[2][0], 1), np.round(best_f[2][0] + best_f[2][1], 1))
wave = tri(best_f[1])
# peak time of the far wall within the period, for the global offset
t_peak = TS[np.argmax(wall)]
print(f'P = {P:.3f} s, wall peak at {t_peak:.2f} s')


def fill_and_sym(m, circ=False):
    m = m.copy()
    m[0:34, 560:640] = m[0:34, 0:80][:, ::-1]  # watermark
    y0, y1, x0, x1 = 284, 480, 246, 394      # Asgore + Frisk (to the bottom edge)
    for y in range(y0, y1):
        if circ:
            m[y, x0:x1] = m[y, x0 - 1]
        else:
            m[y, x0:x1] = np.linspace(m[y, x0 - 6:x0].mean(), m[y, x1:x1 + 6].mean(), x1 - x0)
    if circ:  # circular mean of the mirror pair
        z = np.exp(2j * np.pi * m) + np.exp(2j * np.pi * m[:, ::-1])
        return (np.angle(z) / (2 * np.pi)) % 1.0
    return 0.5 * (m + m[:, ::-1])


# Robust per-cell fit (the windows rarely catch the door at its peak, which biases the
# Fourier phase): for every 3-px cell try 100 phase offsets of the wall's waveform and keep
# the best linear fit v ~ lo + (hi - lo) * wave(...). Frames of the third window are not
# used for the rows where the containers rise.
h, wd = 480 // VS, 640 // VS
V = A[:, :h * VS, :wd * VS].reshape(len(TS), h, VS, wd, VS).mean(axis=(2, 4))
late = TS > 51.0
jar_rows = np.zeros(h, bool); jar_rows[360 // VS:452 // VS] = True
uu0 = (TS - t_peak) / P
best_r = np.full((h, wd), np.inf); best_ph = np.zeros((h, wd)); best_lo = np.zeros((h, wd)); best_hi = np.zeros((h, wd))
for sel_rows, frames_ok in ((~jar_rows, np.ones(len(TS), bool)), (jar_rows, ~late)):
    Vs = V[frames_ok][:, sel_rows, :]  # (n, rows, w)
    n = Vs.shape[0]
    Vm = Vs.mean(axis=0); Vc = Vs - Vm
    for k in range(100):
        p = k / 100
        x = ((uu0[frames_ok] - p) % 1.0) * bins
        i0 = np.floor(x).astype(int) % bins; fr = x - np.floor(x)
        Wv = wave[i0] * (1 - fr) + wave[(i0 + 1) % bins] * fr
        Wc = Wv - Wv.mean()
        b = np.tensordot(Wc, Vc, axes=(0, 0)) / (Wc @ Wc)
        r = (Vc ** 2).sum(axis=0) - b ** 2 * (Wc @ Wc)
        r = np.where(b > 0, r, np.inf)
        R = best_r[sel_rows]; better = r < R
        best_r[sel_rows] = np.where(better, r, R)
        best_ph[sel_rows] = np.where(better, p, best_ph[sel_rows])
        a0 = Vm - b * Wv.mean()
        best_lo[sel_rows] = np.where(better, a0, best_lo[sel_rows])
        best_hi[sel_rows] = np.where(better, a0 + b, best_hi[sel_rows])
# the floor rows where the jars rise are plain vertical bands: copy the row above them
r0 = 357 // VS
for m in (best_lo, best_hi, best_ph): m[r0 + 1:] = m[r0]
up = lambda m: np.pad(np.repeat(np.repeat(m, VS, axis=0), VS, axis=1), ((0, 480 - h * VS), (0, 640 - wd * VS)), mode='edge')
lo, hi, ph = np.clip(up(best_lo), 0, 255), np.clip(up(best_hi), 0, 255), up(best_ph)
lo, hi, ph = fill_and_sym(lo), fill_and_sym(hi), fill_and_sym(ph, circ=True)
h, wd = 480 // VS, 640 // VS
cell = lambda m: m[:h * VS, :wd * VS].reshape(h, VS, wd, VS).mean(axis=(1, 3))
cph = lambda m: (np.angle(np.exp(2j * np.pi * m)[:h * VS, :wd * VS].reshape(h, VS, wd, VS).mean(axis=(1, 3))) / (2 * np.pi)) % 1.0
out = dict(vs=VS, w=wd, h=h, P=round(float(P), 4), tPeak=round(float(t_peak), 3),
           lo=[int(round(v)) for v in cell(lo).ravel()], hi=[int(round(v)) for v in cell(hi).ravel()],
           ph=[round(float(v), 3) for v in cph(ph).ravel()], wave=[round(float(v), 3) for v in wave])
with open('src/corridor.js', 'w') as f:
    f.write('// Generated by tools/make_corridor.py (the barrier room light wave, from the recording) - do not edit.\n')
    f.write('window.MV_CORRIDOR = ')
    json.dump(out, f, separators=(',', ':'))
    f.write(';\n')
cp = cph(ph)
print('phase: wall', round(float(cp[100, 10]), 3), 'near', round(float(cp[66, 96]), 3), 'frame', round(float(cp[66, 100]), 3), 'door', round(float(cp[66, 106]), 3), 'funnel', round(float(cp[20, 106]), 3))
print('wave', ' '.join(f'{v:.2f}' for v in wave))
# preview: the room at 8 moments of the period
rows = []
LO, HI, PH = cell(lo), cell(hi), cp
for k in range(8):
    tt = k / 8
    x = ((tt - PH) % 1.0) * bins
    i0 = np.floor(x).astype(int) % bins; fr = x - np.floor(x)
    v = LO + (HI - LO) * (wave[i0] * (1 - fr) + wave[(i0 + 1) % bins] * fr)
    rows.append(v)
prev = np.concatenate([np.concatenate(rows[:4], axis=1), np.concatenate(rows[4:], axis=1)], axis=0)
Image.fromarray(np.clip(prev, 0, 255).astype(np.uint8)).save('work/corridor_wave.png')
print('-> src/corridor.js')
