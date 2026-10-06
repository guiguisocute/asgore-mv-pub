// Stateless animation engine: every value is a pure function of time t, so any
// frame can be rendered on its own (live playback, scrubbing, offline export).
(function () {
  const MV = window.MV, U = MV.U;

  const EASE = {
    lin: (t) => t, in: U.eIn, out: U.eOut, inOut: U.eInOut, outExpo: U.eOutExpo, inExpo: U.eInExpo,
    outBack: U.eOutBack, outElastic: U.eOutElastic, smooth: U.smooth, step: (t) => (t < 1 ? 0 : 1),
    in2: (t) => t * t, out2: (t) => 1 - (1 - t) * (1 - t), in5: (t) => t ** 5, out5: (t) => 1 - (1 - t) ** 5,
  };
  MV.EASE = EASE;

  // Keyframed multi-channel track. Segments are appended in time order and blend
  // from the value reached at their start to their target values.
  class Track {
    constructor(init) { this.init = Object.assign({}, init); this.segs = []; }
    to(t0, t1, vals, ease = 'inOut', extra) {
      this.segs.push({ t0, t1: Math.max(t1, t0), vals, ease: typeof ease === 'function' ? ease : EASE[ease], extra });
      this.dirty = true;
      return this;
    }
    set(t, vals) { return this.to(t, t, vals, 'lin'); }
    // parabolic hop: moves to vals while lifting channel `ch` by `h` at mid-way
    hop(t0, t1, vals, h, ch = 'y', ease = 'lin') { return this.to(t0, t1, vals, ease, { hop: h, ch }); }
    sort() { this.segs.sort((a, b) => a.t0 - b.t0); this.dirty = false; return this; }
    bake(t0, dt, ch) {
      const n = Object.values(ch)[0].length;
      (this.baked = this.baked || []).push({ t0, t1: t0 + (n - 1) * dt, dt, ch });
      return this;
    }
    at(t) {
      if (this.dirty) this.sort();
      const s = Object.assign({}, this.init);
      for (const g of this.segs) {
        if (t < g.t0) break;
        if (t >= g.t1) { Object.assign(s, g.vals); continue; }
        const u = (t - g.t0) / (g.t1 - g.t0), e = g.ease(u);
        for (const k in g.vals) {
          const a = s[k], b = g.vals[k];
          s[k] = typeof b === 'number' && typeof a === 'number' ? a + (b - a) * e : u < 1 ? a : b;
        }
        if (g.extra && g.extra.hop) s[g.extra.ch] += g.extra.hop * 4 * u * (1 - u);
      }
      if (this.baked)
        for (const b of this.baked) {
          if (t < b.t0 || t > b.t1) continue;
          const f = (t - b.t0) / b.dt, i = Math.floor(f), u = f - i;
          for (const k in b.ch) { const a = b.ch[k], i0 = Math.min(i, a.length - 1), i1 = Math.min(i + 1, a.length - 1); s[k] = a[i0] + (a[i1] - a[i0]) * u; }
        }
      return s;
    }
  }
  MV.Track = Track;

  // piecewise-constant values (modes, poses, flags)
  class Steps {
    constructor(v) { this.keys = [[-1e9, v]]; }
    set(t, v) { this.keys.push([t, v]); this.keys.sort((a, b) => a[0] - b[0]); return this; }
    at(t) { let v = this.keys[0][1]; for (const [k, x] of this.keys) { if (t < k) break; v = x; } return v; }
    since(t) { let k0 = -1e9; for (const [k] of this.keys) { if (t < k) break; k0 = k; } return t - k0; }
  }
  MV.Steps = Steps;

  // ------------------------------------------------------------ timeline store
  // events: {t0, t1, z, vox(V, t, S) adds voxels, ov(ctx, t, S) draws on the 2D overlay,
  //          hit(t, p) -> bool (p = soul position), kind: 'white' | 'blue'(cyan) | 'orange'}
  const TL = (MV.TL = { events: [], impacts: [], flags: {} });
  TL.add = (ev) => { ev.z = ev.z ?? 0; TL.events.push(ev); return ev; };
  // hit stops (src/blow.js H.stop): spans {t, d} where the picture holds still while the music
  // goes on. MV.vt(t) is the picture's time: it stays at the stop's start, then jumps back to
  // the music's. The camera, the impacts and events marked live keep the music's time.
  TL.stops = [];
  MV.vt = (t) => { for (const s of TL.stops) if (t >= s.t && t < s.t + s.d) return s.t; return t; };
  // impact: camera shake / punch + post reaction at time t
  // o: {amp, zoom, rot, flash, flashCol, ca, dur}
  TL.impact = (t, o = {}) => TL.impacts.push(Object.assign({ t, amp: 4, zoom: 0, rot: 0, flash: 0, ca: 0, dur: 0.35 }, o));
  TL.finalize = () => {
    TL.events.sort((a, b) => a.t0 - b.t0);
    TL.impacts.sort((a, b) => a.t - b.t);
    for (const k in TL) if (TL[k] instanceof Track) TL[k].sort();
    TL.maxDur = 0;
    for (const e of TL.events) TL.maxDur = Math.max(TL.maxDur, e.t1 - e.t0);
  };
  TL.active = (t) => {
    const E = TL.events;
    let lo = 0, hi = E.length;
    const tmin = t - TL.maxDur;
    while (lo < hi) { const m = (lo + hi) >> 1; if (E[m].t0 < tmin) lo = m + 1; else hi = m; }
    const out = [];
    for (let i = lo; i < E.length && E[i].t0 <= t; i++) if (t < E[i].t1) out.push(E[i]);
    out.sort((a, b) => a.z - b.z);
    return out;
  };
  // accumulated camera / post reactions
  // (o.dx, dy: a directional kick that snaps that way and springs back; o.inv, bw: seconds of
  // an inverted / hard black-and-white impact frame; o.freq: how fast it shakes and springs back,
  // 1 = the usual jolt - lower is heavier: a slow sway, a long swing back)
  TL.fxAt = (t) => {
    const fx = { sx: 0, sy: 0, zoom: 0, rot: 0, flash: 0, ca: 0, inv: 0, bw: 0 };
    for (const m of TL.impacts) {
      if (m.t > t) break;
      const dt = t - m.t;
      if (dt > Math.max(m.dur, 0.6)) continue;
      const k = Math.max(0, 1 - dt / m.dur), k2 = k * k, fq = m.freq ?? 1;
      const kick = Math.exp(-dt * 18 * fq) * Math.cos(dt * 40 * fq);
      fx.sx += m.amp * (U.noise(dt * 38 * fq + m.t * 7.1) * k2 + (m.dx || 0) * kick);
      fx.sy += m.amp * (U.noise(dt * 41 * fq + m.t * 3.3 + 50) * k2 + (m.dy || 0) * kick);
      if (m.inv && dt < m.inv) fx.inv = 1;
      if (m.bw && dt < m.bw) fx.bw = 1;
      fx.zoom += m.zoom * Math.exp(-dt * 10);
      fx.rot += m.rot * Math.exp(-dt * 8) * Math.cos(dt * 20);
      const fl = m.flash * Math.exp(-dt * (m.flashDecay || 12));
      if (fl > fx.flash) { fx.flash = fl; fx.flashCol = m.flashCol; }
      fx.ca += m.ca * Math.exp(-dt * 9);
    }
    return fx;
  };
})();
