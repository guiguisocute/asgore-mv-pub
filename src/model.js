// Sprite -> voxel models. Every opaque pixel becomes one box; its depth comes from a
// distance transform of the sprite's silhouette (thick in the middle, thin at the edge,
// so flat pixel art turns into a pillowy relief), line-art pixels stand proud of the
// fill, and ambient occlusion is baked from the neighbours' depth. Colours map the
// Undertale palette to linear albedo + emissive (MV.VX.map*).
(function () {
  const MV = window.MV, U = MV.U, FL = MV.VOX_FL;
  const VX = (MV.VX = {});

  VX.pixels = (img) => {
    const [c, x] = MV.canvas(img.width, img.height);
    x.drawImage(img, 0, 0);
    return { w: img.width, h: img.height, d: x.getImageData(0, 0, img.width, img.height).data };
  };

  const L = (hex) => U.lin(hex);
  // colour maps: (r,g,b) sRGB 0..255 -> {c: linear albedo, e: emissive, raise: extra depth (px)}
  VX.mapLineArt = (o = {}) => {
    const fill = L(o.fill || MV.COL.ink), line = L(o.line || MV.COL.line);
    return (r, g, b) => {
      if (r > 200 && g > 200 && b > 200) return { c: line, e: o.lineE || 0, raise: o.raise ?? 1 };
      if (r < 40 && g < 40 && b < 40) return { c: fill, e: 0, raise: 0 };
      // anything else (the red trident, coloured details) keeps its colour
      return { c: [(r / 255) ** 2.2, (g / 255) ** 2.2, (b / 255) ** 2.2], e: o.colorE || 0, raise: 0.5 };
    };
  };
  VX.mapColor = (o = {}) => (r, g, b) => {
    // pure white sprite pixels are capped to the film's off-white
    if (r > 245 && g > 245 && b > 245) return { c: L(MV.COL.white), e: o.e || 0, raise: 0 };
    if (r < 12 && g < 12 && b < 12) return { c: L(o.black || '#0c0a12'), e: 0, raise: 0.35 };
    return { c: [(r / 255) ** 2.2, (g / 255) ** 2.2, (b / 255) ** 2.2], e: o.e || 0, raise: 0 };
  };
  VX.mapSolid = (hex, e = 0) => { const c = L(hex); return () => ({ c, e, raise: 0 }); };

  // chamfer distance (in px) from each opaque pixel to the nearest transparent one
  function distance(mask, w, h) {
    const INF = 1e9, d = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) d[i] = mask[i] ? INF : 0;
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!d[i]) continue;
      d[i] = Math.min(d[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414);
    }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (!d[i]) continue;
      d[i] = Math.min(d[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414);
    }
    return d;
  }

  // img -> Float32Array of instances.
  // o: {s: units per px (2), ax, ay: anchor px (default bottom centre), z: centre depth,
  //     base, k, max: relief depth in px = clamp(base + k * dist, base, max), map, sx: mirror,
  //     back: 'flat' keeps the back face on z (relief grows toward +z only),
  //     sub: n splits every pixel into n x n voxels whose depth follows a smoothed relief
  //     (crisp colours, a rounded surface instead of terraces), round: R makes the profile
  //     a quarter circle reaching max at R px from the edge (a pillow, not a bevel)}
  VX.sprite = (img, o = {}) => {
    const P = img.d ? img : VX.pixels(img);
    const { w, h, d } = P;
    const s = o.s ?? 2, ax = o.ax ?? w / 2, ay = o.ay ?? h, z0 = o.z ?? 0;
    const base = o.base ?? 1, k = o.k ?? 0.5, max = o.max ?? 6;
    const map = o.map || VX.mapColor();
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) mask[i] = d[i * 4 + 3] > 127 ? 1 : 0;
    const dist = distance(mask, w, h);
    const T = new Float32Array(w * h), C = new Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const m = map(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], x, y);
      if (!m) { mask[i] = 0; continue; }
      C[i] = m;
      const prof = o.round ? base + (max - base) * Math.sqrt(1 - (1 - Math.min(dist[i] / o.round, 1)) ** 2) : U.clamp(base + k * (dist[i] - 1), base, max);
      T[i] = prof + (m.raise || 0);
    }
    if (o.sub > 1) return subdivide(P, mask, T, C, o, s, ax, ay, z0);
    const out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const m = C[i], t = T[i];
      // AO: how much deeper the neighbourhood is than this pixel
      let sum = 0, n = 0;
      for (let j = -2; j <= 2; j++) for (let q = -2; q <= 2; q++) {
        const xx = x + q, yy = y + j;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        sum += T[yy * w + xx]; n++;
      }
      const ao = U.clamp(1 - Math.max(0, sum / n - t) * 0.22, 0.45, 1);
      const px = (o.sx ? ax - x - 0.5 : x + 0.5 - ax) * s, py = (ay - y - 0.5) * s;
      const depth = t * s * (o.depthScale ?? 1);
      const pz = o.back === 'flat' ? z0 + depth / 2 : z0;
      out.push(px, py, pz, s, s, depth, m.c[0], m.c[1], m.c[2], m.e || 0, 1, ao);
    }
    return new Float32Array(out);
  };

  // the fine relief: each pixel -> n x n voxels; the relief profile (without the line-art
  // raise) is bilinearly sampled between pixel centres (outside the sprite it falls off),
  // the raise and colours stay per pixel so the drawing remains crisp
  function subdivide(P, mask, T, C, o, s, ax, ay, z0) {
    const { w, h } = P, n = o.sub, ss = s / n, base = o.base ?? 1;
    const prof = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) if (mask[i]) prof[i] = T[i] - (C[i].raise || 0);
    const pv = (x, y, fb) => (x < 0 || y < 0 || x >= w || y >= h || !mask[y * w + x] ? fb : prof[y * w + x]);
    const out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const m = C[i], fb = Math.min(prof[i], base * 0.5);
      // AO from the pixel neighbourhood (as in the coarse model)
      let sum = 0, cnt = 0;
      for (let j = -2; j <= 2; j++) for (let q = -2; q <= 2; q++) { const xx = x + q, yy = y + j; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; sum += T[yy * w + xx]; cnt++; }
      const ao = U.clamp(1 - Math.max(0, sum / cnt - T[i]) * 0.22, 0.5, 1);
      for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) {
        const u = x + (a + 0.5) / n - 0.5, v = y + (b + 0.5) / n - 0.5;
        const x0 = Math.floor(u), y0 = Math.floor(v), fu = u - x0, fv = v - y0;
        const p00 = pv(x0, y0, fb), p10 = pv(x0 + 1, y0, fb), p01 = pv(x0, y0 + 1, fb), p11 = pv(x0 + 1, y0 + 1, fb);
        const pr = (p00 * (1 - fu) + p10 * fu) * (1 - fv) + (p01 * (1 - fu) + p11 * fu) * fv;
        const t = pr + (m.raise || 0);
        const px = (o.sx ? ax - (x + (a + 0.5) / n) : x + (a + 0.5) / n - ax) * s, py = (ay - (y + (b + 0.5) / n)) * s;
        const depth = Math.max(0.3, t) * s * (o.depthScale ?? 1);
        const pz = o.back === 'flat' ? z0 + depth / 2 : z0;
        out.push(px, py, pz, ss, ss, depth, m.c[0], m.c[1], m.c[2], m.e || 0, 1, ao);
      }
    }
    return new Float32Array(out);
  }

  // concatenate instance arrays, each optionally moved by a matrix
  VX.merge = (parts) => {
    let n = 0;
    for (const p of parts) n += (p.inst || p).length;
    const out = new Float32Array(n);
    let o = 0;
    for (const p of parts) {
      const a = p.inst || p;
      out.set(a, o);
      if (p.m) for (let i = o; i < o + a.length; i += FL) {
        const q = MV.M4.apply(p.m, [out[i], out[i + 1], out[i + 2]]);
        out[i] = q[0]; out[i + 1] = q[1]; out[i + 2] = q[2];
      }
      o += a.length;
    }
    return out;
  };

  // ------------------------------------------------------------ model cache (needs the GL renderer)
  const CACHE = new Map();
  MV.MODEL = (key, build) => {
    let m = CACHE.get(key);
    if (!m) {
      const inst = build();
      m = MV.vox.model(inst);
      m.inst = inst;
      CACHE.set(key, m);
    }
    return m;
  };
  // a named sprite as a model with the given voxelizer options
  MV.spriteModel = (name, o = {}) => MV.MODEL('spr:' + name + JSON.stringify(o, (k, v) => (typeof v === 'function' ? String(v).length : v)), () => VX.sprite(typeof name === 'string' ? MV.img(name) : name, o));
})();
