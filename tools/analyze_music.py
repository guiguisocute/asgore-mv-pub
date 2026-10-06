#!/usr/bin/env python3
"""Analyse music1.mp3 (Bergentrückung) and music2.mp3 (ASGORE) and write
src/analysis.js for the MV engine (window.MV_ANALYSIS = {m1: {...}, m2: {...}},
so the player works from file://).

    .venv/Scripts/python tools/analyze_music.py

All times are MUSIC time (0 = first sample of that mp3). The engine places each
track on the video timeline (T.m1 / T.m2 offsets).

Grid method (see README «音乐分析»): brute-force a constant tempo on the onset
envelope, refine by regressing grid residuals of the onsets (drift = 0), then
take the 16th phase from attack-aligned (non-centred, short-window) flux --
centred STFT flux peaks report attacks 20-40 ms early. Downbeats were checked
by ear-proxies: ASGORE's two orchestral stabs + the loop end, Bergentrückung's
4-staccato + held-chord bar shape.
"""
import json, subprocess, tempfile, os
import numpy as np
import librosa

SR = 22050
OUT = 'src/analysis.js'

TRACKS = {
    'm1': dict(
        src='music1.mp3', title='Bergentrückung', lo=108, hi=118,
        sections=[
            ('phrase1', 0, 4, 'every bar: 5 attacks on 8ths (16ths 0 2 4 6 8) = 4 staccato chords + a held chord struck on beat 3 ringing through beat 4; bass A2 / B2 alternating'),
            ('phrase2', 4, 8, 'same bar shape; bars 6-7 climb (top voice to E5 / G#5), cadence; last attack bar 7 beat 3'),
            ('cut', 8, 10, 'one chord on the bar-8 downbeat cut off after ~0.1 s (loop point), then 4.2 s of silence'),
        ]),
    'm2': dict(
        src='music2.mp3', title='ASGORE', lo=110, hi=120,
        sections=[
            ('themeA', 0, 8, 'two orchestral stabs (16ths 4, 8) after short gaps open each 4-bar phrase; 0-3 ostinato, 4-7 full strings over A2'),
            ('themeA2', 8, 16, 'repeat of 0-7 (bar corr 0.95-0.99); gap before bar 16'),
            ('themeB', 16, 24, 'dark low riff B2 / A#2 / A2, syncopated snare .Xx.....X.xxx..x, two 4-bar halves'),
            ('march', 24, 40, 'A1 pedal on the beat, chords on every off-beat 8th (16ths 2 6 10 14); 8-bar phrase, 32-39 repeats 24-31'),
            ('rise', 40, 44, 'off-beats thin out; 41-43 D3 8th pulse, melody climbs A4-D5-E5; stab gap at the start of 44'),
            ('climax', 44, 52, 'loudest (bar rms 0.9-1.0), melody on A5, off-beat chords; 48-51 repeat 44-47'),
            ('fall', 52, 53, 'falling line E5-C5-B4-A4, bass and drums drop out after beat 2'),
            ('musicbox', 53, 60, 'near silence (-15 dB): music-box / harp arpeggios, 2-bar cycle (odd bars bass B2 B2 A#2 B2)'),
            ('return', 60, 64, 'drums and bass re-enter on bar 60 beat 3 (126.4 s), building'),
            ('final', 64, 71, 'final theme: off-beat 8ths, chromatic bass D#2-F#2; 68-70 repeat 64-66'),
            ('walkup', 71, 72, 'bass walks up one note per beat F#2 G#2 A2 B2'),
            ('finale', 72, 74, 'last statement; last onset bar 73 beat 3, then the loop ends (silence from ~154.1 s)'),
        ]),
}


def load(src):
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, 'm.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', str(SR), wav], check=True)
        y, _ = librosa.load(wav, sr=SR, mono=True)
    return y


def analyse(key, cfg):
    y = load(cfg['src'])
    sr = SR
    dur = len(y) / sr
    # ------------------------------------------------------------ tempo grid
    hop = 32
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, n_fft=1024)
    ft = librosa.frames_to_time(np.arange(len(oenv)), sr=sr, hop_length=hop)
    on_all = librosa.onset.onset_detect(onset_envelope=oenv, sr=sr, hop_length=hop, units='time')
    t_end = on_all[-1] + 0.2  # ignore trailing silence
    best = None
    for bpm in np.arange(cfg['lo'], cfg['hi'], 0.005):
        per = 60 / bpm / 4
        for ph in np.arange(0, per, 0.002):
            s = np.interp(np.arange(ph, t_end, per), ft, oenv).mean()
            if best is None or s > best[0]:
                best = (s, bpm, ph)
    _, bpm, ph = best
    s16 = 60 / bpm / 4
    k = np.round((on_all - ph) / s16)
    r = on_all - (ph + k * s16)
    m = np.abs(r) < s16 * 0.3
    slope = np.linalg.lstsq(np.vstack([on_all[m], np.ones(m.sum())]).T, r[m], rcond=None)[0][0]
    bpm = bpm / (1 + slope)
    s16 = 60 / bpm / 4
    # 16th phase from attack-aligned flux (short non-centred frames, time = frame end)
    fh = 64
    S = np.abs(librosa.stft(y, n_fft=512, hop_length=fh, center=False))
    f = librosa.fft_frequencies(sr=sr, n_fft=512)
    ftt = (np.arange(S.shape[1]) * fh + 512) / sr
    def flux_of(sig, lo, hi):
        SS = S if sig is y else np.abs(librosa.stft(sig, n_fft=512, hop_length=fh, center=False))
        L = np.log1p(SS[(f >= lo) & (f < hi)] * 20)
        d = np.diff(L, axis=1, prepend=L[:, :1]); d[d < 0] = 0
        return d.mean(0)
    full_flux = flux_of(y, 30, 11000)
    phase = max((np.interp(np.arange(p, t_end, s16), ftt, full_flux).mean(), p) for p in np.arange(0, s16, 0.0005))[1]
    offset = round(float(phase - 0.0015), 4)  # frame-end bias ~ half a hop
    bar_len = s16 * 16
    nbars = int(np.ceil((dur - offset) / bar_len))
    nslots = nbars * 16
    last_onset = float(on_all[-1])

    # ------------------------------------------------------------ band fluxes
    yh, yp = librosa.effects.hpss(y)
    def per_slot(v):
        return np.array([v[(ftt >= offset + i * s16 - 0.01) & (ftt < offset + i * s16 + 0.04)].max(initial=0)
                         for i in range(nslots)])
    def local_norm(v, win_bars=8):
        out = np.zeros_like(v)
        for b in range(nbars):
            w = v[max(0, b - win_bars // 2) * 16:min(nbars, b + win_bars // 2) * 16]
            lo, hi = np.percentile(w, 30), np.percentile(w, 98)
            out[b * 16:(b + 1) * 16] = np.clip((v[b * 16:(b + 1) * 16] - lo) / (hi - lo + 1e-9), 0, 1)
        return out
    slots = dict(
        full=local_norm(per_slot(full_flux)),
        low=local_norm(per_slot(flux_of(y, 30, 150))),
        mid=local_norm(per_slot(flux_of(y, 250, 2000))),
        high=local_norm(per_slot(flux_of(y, 2000, 8000))),
        kick=local_norm(per_slot(flux_of(y, 30, 130))),
        snare=local_norm(per_slot(flux_of(yp, 1500, 5000))),
        hat=local_norm(per_slot(flux_of(yp, 7000, 11000))),
        tone=local_norm(per_slot(flux_of(yh, 300, 3000))),
    )
    # absolute (not locally normalised) loudness per 16th, for quiet sections
    rms = librosa.feature.rms(y=y, hop_length=512)[0]
    et = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
    loud = np.array([rms[(et >= offset + i * s16) & (et < offset + (i + 1) * s16)].mean() if ((et >= offset + i * s16) & (et < offset + (i + 1) * s16)).any() else 0
                     for i in range(nslots)])
    slots['loud'] = np.clip(loud / np.percentile(loud, 99.5), 0, 1)

    # ------------------------------------------------------------ pitch
    C = librosa.amplitude_to_db(np.abs(librosa.cqt(yh, sr=sr, hop_length=256, fmin=librosa.note_to_hz('C1'),
                                                    n_bins=84, bins_per_octave=12)), ref=np.max)
    ct = librosa.frames_to_time(np.arange(C.shape[1]), sr=sr, hop_length=256)
    def pitch(t0, t1, lo, hi, floor=-42):
        mm = (ct >= t0) & (ct < t1)
        if not mm.any():
            return -1
        seg = C[lo - 24:hi - 24, mm].mean(1)
        i = int(np.argmax(seg))
        return -1 if seg[i] < floor else lo + i
    C1, C3, C4, C7 = (int(librosa.note_to_midi(n)) for n in ('C1', 'C3', 'C4', 'C7'))
    bass = [pitch(offset + j * 4 * s16, offset + (j + 1) * 4 * s16, C1, C3) for j in range(nbars * 4)]
    lead = [pitch(offset + i * s16 + 0.02, offset + (i + 1) * s16 + 0.03, C4, C7) for i in range(nslots)]

    # ------------------------------------------------------------ envelopes
    E = np.abs(librosa.stft(y, n_fft=2048, hop_length=512)) ** 2
    ef = librosa.fft_frequencies(sr=sr, n_fft=2048)
    def band_env(lo, hi):
        return E[(ef >= lo) & (ef < hi)].sum(0)
    FPS = 60
    tt = np.arange(0, dur, 1 / FPS)
    def env(v, db=False):
        v = np.interp(tt, et[:len(v)], v[:len(et)])
        if db:
            v = 10 * np.log10(v + 1e-9)
            v = (v - np.percentile(v, 2)) / (np.percentile(v, 99.5) - np.percentile(v, 2))
        else:
            v = v / np.percentile(v, 99.5)
        return np.clip(v, 0, 1)
    bar_rms = [float(rms[(et >= offset + b * bar_len) & (et < offset + (b + 1) * bar_len)].mean()) for b in range(nbars)]
    mx = max(bar_rms)
    sections = [dict(name=n, bar0=a, bar1=b, note=d, energy=round(float(np.mean(bar_rms[a:b]) / mx), 3))
                for n, a, b, d in cfg['sections']]
    q = lambda a, kk=2: [round(float(x), kk) for x in a]
    data = dict(
        title=cfg['title'], src=cfg['src'],
        bpm=round(float(bpm), 4), offset=offset, sixteenth=round(s16, 6), barLength=round(bar_len, 6),
        duration=round(dur, 3), bars=nbars, lastOnset=round(last_onset, 3),
        barRms=q(np.array(bar_rms) / mx, 3), sections=sections,
        slots={kk: q(v) for kk, v in slots.items()},
        bass=bass, lead=lead,
        envFps=FPS, env=dict(rms=q(env(rms), 3), low=q(env(band_env(20, 150), db=True), 3),
                             high=q(env(band_env(2500, 11000), db=True), 3)),
    )
    print(f"{key} {cfg['title']}: bpm={bpm:.4f} offset={offset}s 16th={s16:.5f}s bar={bar_len:.4f}s "
          f"bars={nbars} duration={dur:.2f}s last onset {last_onset:.3f}s "
          f"(bar {(last_onset - offset) // bar_len:.0f} + {((last_onset - offset) % bar_len) / (s16 * 4):.2f} beats)")
    for s in sections:
        print(f"   {s['name']:8s} bars {s['bar0']:2d}-{s['bar1']:2d}  t={offset + s['bar0'] * bar_len:7.2f}s  energy {s['energy']:.2f}  {s['note']}")
    return data


out = {k: analyse(k, c) for k, c in TRACKS.items()}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as fh_:
    fh_.write('// Generated by tools/analyze_music.py - do not edit by hand.\n')
    fh_.write('window.MV_ANALYSIS = ')
    json.dump(out, fh_, separators=(',', ':'), ensure_ascii=False)
    fh_.write(';\n')
print('->', OUT)
