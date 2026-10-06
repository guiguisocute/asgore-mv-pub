// Shared helpers: math, easing, deterministic randomness, music-time helpers.
(function () {
  const MV = (window.MV = window.MV || {});

  const U = (MV.U = {});
  U.clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.inv = (a, b, x) => U.clamp((x - a) / (b - a));
  U.smooth = (t) => t * t * (3 - 2 * t);
  U.eIn = (t) => t * t * t;
  U.eOut = (t) => 1 - (1 - t) ** 3;
  U.eInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  U.eOutExpo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
  U.eInExpo = (t) => (t <= 0 ? 0 : 2 ** (10 * t - 10));
  U.eOutBack = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
  U.eOutElastic = (t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  U.TAU = Math.PI * 2;
  U.hash = (x) => {
    const s = Math.sin(x * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  };
  U.hash2 = (x, y) => U.hash(x * 12.9898 + y * 78.233);
  U.noise = (x) => {
    const i = Math.floor(x), f = x - i;
    return U.lerp(U.hash(i), U.hash(i + 1), U.smooth(f)) * 2 - 1;
  };
  U.rng = (seed) => {
    let a = (seed * 2654435761) >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  // sRGB hex -> linear [r,g,b] (voxel albedo is linear; the tone curve is display-referred)
  U.lin = (hex, k = 1) => {
    const v = parseInt(hex.replace('#', ''), 16);
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255].map((c) => c ** 2.2 * k);
  };
  U.mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  // ------------------------------------------------------------ the film's clock
  // Five acts. Act one (barrier corridor) and act three (the battle opening) are silent;
  // music1 (Bergentrückung) plays from T.m1 (act two), music2 (ASGORE) from T.m2 (act four);
  // act five (the end) is silent again. Times below are video seconds.
  const A1 = window.MV_ANALYSIS.m1, A2 = window.MV_ANALYSIS.m2;
  const T = (MV.T = { A1, A2, A: A2 });
  T.m1 = 23.0; // music1 file starts (act two)
  T.cut1 = T.m1 + A1.offset + 8 * A1.barLength; // the cut-off chord that locks the cage
  T.m2 = T.cut1 + 21.6; // music2 file starts (act four)
  T.mus2End = T.m2 + A2.offset + 74 * A2.barLength; // loop point after the last note
  T.end = T.mus2End + 34; // act five, ending A, last black
  T.tracks = [
    { key: 'm1', src: 'music1.mp3', t0: T.m1, dur: A1.duration },
    { key: 'm2', src: 'music2.mp3', t0: T.m2, dur: A2.duration },
  ];
  // music2 grid (the battle): bar b, beat k, sixteenth s (fractional / overflow / negative ok)
  T.bpm = A2.bpm; T.s16 = A2.sixteenth; T.beat = T.s16 * 4; T.bar = A2.barLength;
  T.off = T.m2 + A2.offset;
  T.at = (b, k = 0, s = 0) => T.off + b * T.bar + k * T.beat + s * T.s16;
  T.barOf = (t) => (t - T.off) / T.bar;
  T.slot = (t) => Math.floor((t - T.off) / T.s16 + 1e-6);
  T.acc = (slot, band = 'full') => { const a = A2.slots[band]; return slot >= 0 && slot < a.length ? a[slot] : 0; };
  // music1 grid (the cage)
  T.s161 = A1.sixteenth; T.beat1 = T.s161 * 4; T.bar1 = A1.barLength;
  T.off1 = T.m1 + A1.offset;
  T.at1 = (b, k = 0, s = 0) => T.off1 + b * T.bar1 + k * T.beat1 + s * T.s161;
  T.barOf1 = (t) => (t - T.off1) / T.bar1;
  // loudness envelopes of whichever track is playing
  T.env = (t, band = 'rms') => {
    for (const [A, t0] of [[A2, T.m2], [A1, T.m1]]) {
      const m = t - t0;
      if (m < 0 || m >= A.duration) continue;
      const a = A.env[band], x = m * A.envFps, i = Math.floor(x);
      return i >= a.length - 1 ? a[a.length - 1] : U.lerp(a[i], a[i + 1], x - i);
    }
    return 0;
  };
  T.pulse = (t, period, len = 0.12, phase = 0, off = T.off) => {
    const x = (t - off - phase) / period;
    if (x < 0) return 0;
    const f = (x - Math.floor(x)) * period;
    return Math.max(0, 1 - f / len);
  };
  T.section = (t) => {
    if (t < T.m1) return { name: 'act1 corridor' };
    if (t < T.cut1 + 0.2) return { name: 'act2 cage', bar: T.barOf1(t) };
    if (t < T.m2) return { name: 'act3 opening' };
    if (t < T.mus2End) {
      const b = T.barOf(t);
      for (const s of A2.sections) if (b >= s.bar0 && b < s.bar1) return Object.assign({ bar: b }, s);
      return { name: 'battle', bar: b };
    }
    return { name: 'act5 end' };
  };
  const q = new URLSearchParams(location.search);
  MV.Q = q;
  T.cut = { t0: 0, t1: T.end };
})();
