// Persistent actors, drawn every frame from their tracks: the barrier corridor, overworld
// Asgore / Frisk, the seven containers, the red soul.
//
// The barrier room is a straight rectangular tube seen from inside, down its axis: the
// game's nested rectangles are exactly its perspective (every ring's floor lies 0.76 and its
// ceiling 6.4 half-widths from the vanishing point at the frame centre, and the light's lag
// grows in proportion to depth). So act one looks down a real tube with a perspective
// camera whose picture is the game's; Frisk stands near, the containers a little further,
// Asgore further still, which the front view hides. Act two's oblique cut reveals it.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, M4 = MV.M4, VX = MV.VX;
  const L = U.lin;

  // ---------------------------------------------------------------- the tube
  // act-one camera: on the tube's axis, looking down -z, vertical fov 30 deg; F = focal length
  // in game px, so a point at depth d and offset (x, y) from the axis shows at (F x/d, F y/d)
  const FOV = 30, F = 240 / Math.tan((FOV / 2) * Math.PI / 180);
  const AXY = -14, EYEZ = 600; // axis height (floor at -230 = the battle floor), eye position
  const HW = 284, FL = -216, CE = 1819; // half-width, floor and ceiling relative to the axis
  const D_DOOR = 41700, KPH = 101786; // virtual depth of the door; the light's lag per unit depth
  // The real tube would be 42000 deep. Beyond D_TIP0 its remaining length is folded into a
  // short tip along the view rays (scaled about the eye, so the picture is unchanged): the
  // straight tube ends in a 300-long pyramid holding the door. The straight part is long
  // enough that act two's oblique camera never sees where it ends.
  const D_TIP0 = 12000, D_TIP1 = 12300, SIG_END = D_TIP1 / D_DOOR, KT = (1 - SIG_END) / (D_TIP1 - D_TIP0);
  const d3of = (d) => (d <= D_TIP0 ? d : (d * (1 + D_TIP0 * KT)) / (1 + d * KT)); // virtual -> real depth
  MV.TUBE = { FOV, F, AXY, EYEZ, HW, FL, CE, D_TIP0, D_TIP1 };
  // depth segments (real depth from the eye; models are grouped by them): from the mouth on,
  // then the tip
  const SEG = [400, 1000, 2000, 4000, 8000, D_TIP0, D_TIP1];
  MV.TUBE.SEG = SEG;
  MV.TUBE.zOf = (d) => EYEZ - d;
  const segOf = (d3) => { for (let s = SEG.length - 2; s >= 0; s--) if (d3 >= SEG[s]) return s; return 0; };

  // ---------------------------------------------------------------- layout (act one)
  // a point of the game frame (gx, gy) standing on the tube's floor -> world position + scale
  // (the sprite scale that keeps its size in the picture)
  const onFloor = (gx, gy) => { const d = (-FL * F) / (gy - 240), k = d / F; return [(gx - 320) * k, AXY + FL, EYEZ - d, k]; };
  MV.onFloor = onFloor;
  MV.LAY = {
    asg: onFloor(318, 414), frisk: onFloor(318, 456), jar: onFloor(320, 440),
    // the seven containers as the game lines them up (the empty one waits for the seventh soul)
    jarX: { green: -186, yellow: -146, orange: -106, empty: -66, purple: 94, blue: 134, aqua: 174 },
  };
  MV.JARS = ['green', 'yellow', 'orange', 'empty', 'purple', 'blue', 'aqua'];

  // ---------------------------------------------------------------- the tube's voxels
  // The walls are laid out in the straight 'virtual' tube with cells that each cover about
  // 3 game px of the picture (finer near the eye has no use: those walls show only the
  // smooth outer gradient), then mapped to the real tube; each cell takes its light from
  // the pixel it covers in the act-one picture (lo, hi from the recording) and its lag
  // from its depth. Models per wall and depth segment.
  const CR = window.MV_CORRIDOR, VS = CR.vs;
  // the measured maps, 3x3 median-filtered: the recording's noise is invisible head-on but
  // shows as speckles once the walls are seen from the side
  const med3 = (A) => {
    const o = new Float32Array(A.length), v = [];
    for (let j = 0; j < CR.h; j++) for (let i = 0; i < CR.w; i++) {
      v.length = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) v.push(A[U.clamp(j + dj, 0, CR.h - 1) * CR.w + U.clamp(i + di, 0, CR.w - 1)]);
      v.sort((a, b) => a - b);
      o[j * CR.w + i] = v[4];
    }
    return o;
  };
  const LO = med3(CR.lo), HI = med3(CR.hi);
  const at = (P, gx, gy) => P[U.clamp(Math.floor(gy / VS), 0, CR.h - 1) * CR.w + U.clamp(Math.floor(gx / VS), 0, CR.w - 1)];
  // the walls nearer than the picture shows (and far behind the eye) are plain white: act one
  // never sees them; act two's camera turns among them and must never find the tube's end
  let edgeWhite = 0;
  for (let j = 0; j < CR.h; j++) edgeWhite += HI[j * CR.w] + HI[j * CR.w + CR.w - 1];
  edgeWhite /= 2 * CR.h * 255;
  const D_NEAR = -8000;
  // walls: 0 left, 1 right, 2 floor, 3 ceiling; each: distance from the axis, cross axis span
  const WALL = [
    { n: [-1, 0], off: HW, span: [FL, CE], zmin: 12 },
    { n: [1, 0], off: HW, span: [FL, CE], zmin: 12 },
    { n: [0, -1], off: -FL, span: [-HW, HW], zmin: 12 },
    { n: [0, 1], off: CE, span: [-HW, HW], zmin: 30 },
  ];
  const TH = 4; // wall thickness (outward from the inner face)
  // virtual (cross, d) on wall w -> real point
  const map3 = (w, q, d) => {
    const W = WALL[w], d3 = d3of(d), sg = d3 / d;
    const xr = W.n[0] ? W.n[0] * W.off : q, yr = W.n[1] ? W.n[1] * W.off : q;
    return [xr * sg, AXY + yr * sg, EYEZ - d3];
  };
  const TUBE = (() => {
    const parts = {}; // key 'w:s' -> instance array
    const push = (key, a) => (parts[key] = parts[key] || []).push(...a);
    const cell = (w, q0, q1, d0, d1, door, white) => {
      const W = WALL[w];
      const P = [map3(w, q0, d0), map3(w, q1, d0), map3(w, q0, d1), map3(w, q1, d1)];
      const lo3 = [0, 1, 2].map((i) => Math.min(...P.map((p) => p[i]))), hi3 = [0, 1, 2].map((i) => Math.max(...P.map((p) => p[i])));
      // thickness outward along the wall normal
      if (W.n[0]) { if (W.n[0] > 0) hi3[0] += TH; else lo3[0] -= TH; }
      if (W.n[1]) { if (W.n[1] > 0) hi3[1] += TH; else lo3[1] -= TH; }
      const c = [0, 1, 2].map((i) => (lo3[i] + hi3[i]) / 2), s = [0, 1, 2].map((i) => Math.max(hi3[i] - lo3[i], 0.5));
      if (white) { push(`${w}:N`, [c[0], c[1], c[2], s[0], s[1], s[2], edgeWhite, edgeWhite, 0, 0, 1, 1]); return; }
      // its light: the picture pixel its centre covers
      const qm = (q0 + q1) / 2, dm = Math.sqrt(d0 * d1);
      const xr = W.n[0] ? W.n[0] * W.off : qm, yr = W.n[1] ? W.n[1] * W.off : qm;
      // (never from the picture's top rows: the recording's text box frame ran there)
      const gx = 320 + (F * xr) / dm, gy = Math.max(18, 240 - (F * yr) / dm);
      const lo = at(LO, gx, gy) / 255, hi = at(HI, gx, gy) / 255;
      const seg = door ? SEG.length - 2 : segOf(d3of(dm));
      push(`${w}:${seg}`, [c[0], c[1], c[2], s[0], s[1], s[2], lo, hi, Math.min(0.41, dm / KPH), 0, 1, 1]);
    };
    for (let w = 0; w < 4; w++) {
      const W = WALL[w];
      // the plain white stretch from far behind the eye to the mouth (coarse cells: it is
      // flat; coarser still where the camera never comes near)
      for (let d = D_NEAR; d < SEG[0];) {
        const NC = d < -600 ? 64 : 24, nq = Math.ceil((W.span[1] - W.span[0]) / NC), d1 = Math.min(SEG[0], d + NC);
        for (let i = 0; i < nq; i++) cell(w, W.span[0] + ((W.span[1] - W.span[0]) * i) / nq, W.span[0] + ((W.span[1] - W.span[0]) * (i + 1)) / nq, d, d1, false, true);
        d = d1;
      }
      let d = SEG[0];
      while (d < D_DOOR) {
        // depth step: ~3 px of the picture across the wall's receding direction
        let dz = Math.max(W.zmin, (3 * d * d) / (F * W.off));
        // never straddle a segment boundary (in real depth)
        const s = segOf(d3of(d)), lim = s < SEG.length - 2 ? SEG[s + 1] : 1e9;
        let d1 = Math.min(D_DOOR, d + dz);
        if (d3of(d1) > lim + 1e-6) { let a = d, b = d1; for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (d3of(m) > lim) b = m; else a = m; } d1 = Math.max(a, d + 1e-3); }
        const dc = Math.max(12, (3 * d) / F) * (w === 3 ? 2 : 1);
        const n = Math.max(1, Math.ceil((W.span[1] - W.span[0]) / dc));
        for (let i = 0; i < n; i++) cell(w, W.span[0] + ((W.span[1] - W.span[0]) * i) / n, W.span[0] + ((W.span[1] - W.span[0]) * (i + 1)) / n, d, d1);
        d = d1;
      }
    }
    // the door: the tube's far end (in the tip)
    const dc = (3 * D_DOOR) / F;
    for (let y = FL; y < CE; y += dc) for (let x = -HW; x < HW; x += dc) {
      const p = map3(2, x + dc / 2, D_DOOR), sg = d3of(D_DOOR) / D_DOOR;
      const gx = 320 + (F * (x + dc / 2)) / D_DOOR, gy = 240 - (F * (y + dc / 2)) / D_DOOR;
      push(`2:${SEG.length - 2}`, [p[0], AXY + (y + dc / 2) * sg, p[2] - TH / 2, dc * sg, dc * sg, TH, at(LO, gx, gy) / 255, at(HI, gx, gy) / 255, 0.41, 0, 1, 1]);
    }
    return parts;
  })();
  const tubeModel = (w, s) => (TUBE[`${w}:${s}`] ? MV.MODEL(`tube:${w}:${s}`, () => new Float32Array(TUBE[`${w}:${s}`])) : null);

  // TL.light: {auto: 1 = the wave runs, wt: the wave's frozen time when auto = 0, k: brightness}.
  // The wave is aligned so the walls peak exactly at T.m1, where act two freezes it.
  TL.light = new MV.Track({ auto: 1, wt: T.m1, k: 1 });
  MV.waveU = (t) => { const l = TL.light.at(t); return ((l.auto > 0.5 ? t : l.wt) - T.m1) / CR.P; };
  // Act two: the darkness at the corridor's end comes forward and the white is pressed into
  // the battle box. TL.corr: {a, zb: the darkness's front (world z): no wall deeper than it is
  // drawn (Asgore, Frisk and the jars break up as it reaches them: their 'gone'); kz: the tube's length
  // scale about z = zc (the soul's plane); sq: 0..1 its cross-section squeezed onto the box
  // (half size BOXH, centred on y = cy); nearA: the plain white stretch behind the mouth;
  // soft: the walls sink into the dark over this fraction of the front's distance from zc}
  TL.corr.init = Object.assign(TL.corr.init, { a: 1, zb: -1e5, kz: 1, zc: 0, sq: 0, cy: 0, nearA: 1, soft: 0 });
  const BOXH = 150;
  MV.ACTORS.push((V, t, S) => {
    const c = TL.corr.at(t);
    S.clipZ = c.zb > -1e4 ? [0, 0, 1, c.zb] : undefined;
    if (c.a <= 0.001) return;
    const k = TL.light.at(t).k;
    const wall = { u: MV.waveU(t), wave: CR.wave, unlit: 1 };
    // x -> x * lerp(1, h / HW); y: the floor..ceiling span onto cy - h .. cy + h; z about zc
    const kx = U.lerp(1, BOXH / HW, c.sq), ky = (2 * BOXH) / (CE - FL), y0 = AXY + FL;
    const sy = 1 - c.sq + c.sq * ky, ty = c.sq * (c.cy - BOXH - y0 * ky);
    const m = [kx, 0, 0, 0, 0, sy, 0, 0, 0, 0, c.kz, 0, 0, ty, c.zc * (1 - c.kz), 1];
    // (the darkness's front is pressed along with the tube, or what it swallowed would come back)
    const clip = S.clipZ && [0, 0, 1, c.zc + (c.zb - c.zc) * c.kz];
    const clipSoft = c.soft * Math.max(0, c.zc - c.zb) * c.kz;
    // The walls are never lit: lit, the steps of their cells show as dark specks once they are
    // seen from the side. Instead each wall takes a fixed shade as the camera leaves act one's
    // view (lit 0 .. 1), so the corridor still reads in 3D: left, right, floor, ceiling.
    const lit = 1 - S.look.unlit, SHADE = [0.93, 0.76, 1, 0.86];
    for (const s of ['N', ...SEG.slice(0, -1).keys()]) for (let w = 0; w < 4; w++) {
      const md = tubeModel(w, s), a = c.a * (s === 'N' ? c.nearA : 1);
      const kw = k * U.lerp(1, SHADE[w], lit);
      if (md && a > 0.001) V.draw(md, { m, tint: [kw, kw, kw, a], shadow: false, wall, clip, clipSoft, unlit: 1 });
    }
  });
  // ---------------------------------------------------------------- overworld characters
  const charMap = VX.mapColor();
  const charModel = (name) => MV.MODEL('ow:' + name, () => VX.sprite(MV.img(name), { s: 2, base: 1.5, k: 0.45, max: 5, map: charMap }));
  MV.owModel = charModel;
  // The sprites turn to face the camera as it leaves act one's eye (like HD-2D's standing
  // sprites): seen from the side they stay pictures, not cardboard. Act one's own view is
  // unchanged (the turn is relative to its eye).
  const EYE0 = [0, AXY, EYEZ];
  const faceYaw = (S, x, z) => Math.atan2(S.cam.eye[0] - x, S.cam.eye[2] - z) - Math.atan2(EYE0[0] - x, EYE0[2] - z);
  MV.faceYaw = faceYaw;
  // gone 0..1: swallowed by act two's darkness - the voxels break apart into small motes that
  // drift up and go out one by one (shader scatter + dissolve + shrink); pivot: the model's middle
  const goneFx = (g, pivot, amt) => (g > 0.001 ? {
    scatter: [pivot[0], pivot[1], pivot[2], amt * U.eOut(g)], sdir: [0, 1.1, 0.25],
    dissolve: U.smooth(U.clamp((g - 0.05) / 0.8)), sizeMul: U.lerp(1, 0.35, U.clamp(g * 3)), seed: 3.1,
  } : {});
  const owDraw = (V, track, name, t, S) => {
    const s = track.at(t);
    if (s.a <= 0.001 || s.gone >= 0.999) return;
    const d = 1 - s.dark, g = s.gone || 0;
    V.draw(charModel(name), Object.assign({
      m: M4.mul(M4.trans(s.x, s.y, s.z), M4.mul(M4.ry(faceYaw(S, s.x, s.z)), M4.scale(s.sc ?? 1))),
      tint: [d, d, d, s.a], emi: (s.emi || 0) + 0.8 * g * (1 - g),
    }, goneFx(g, [0, 30, 0], 26)));
  };
  for (const tr of [TL.asg, TL.frisk]) tr.init.gone = 0;
  MV.ACTORS.push((V, t, S) => {
    const f = TL.asgFace.at(t);
    const talk = TL.flags.asgTalk && TL.flags.asgTalk(t);
    owDraw(V, TL.asg, f === 'up' ? 'agUp0' : f === 'down' ? (talk ? 'agTalk' + (Math.floor(t * 6) % 2) : 'agDown0') : f, t, S);
    owDraw(V, TL.frisk, TL.friskFace.at(t) === 'up' ? 'friskUp0' : 'friskDown0', t, S);
  });

  // ---------------------------------------------------------------- containers
  // the jar sprite's white strokes and heart take the soul's colour (gray base -> darker);
  // the empty one is clear glass. A faint glass pane sits inside each capsule.
  // (gone: the soul has left it for now, its glass shows empty in its colour)
  const jarModel = (MV.jarModel = (key, f, gone) => MV.MODEL(`jar:${key}:${f}:${gone ? 1 : 0}`, () => {
    const col = key === 'empty' ? '#cfd0dc' : MV.COL.S[key];
    const img = MV.img(key === 'empty' || gone ? 'jarEmpty' : 'jar' + f);
    const inst = VX.sprite(img, { s: 1, base: 3, max: 9, round: 4, sub: 2, map: (r, g, b, x, y) => {
      if (r < 40 && g < 40 && b < 40) return { c: L('#120f19'), e: 0, raise: 0 };
      if (r > 230) return { c: L(col), e: key === 'empty' ? 0.05 : 0.9, raise: 0.6 };
      return { c: L(col).map((v) => v * 0.45), e: key === 'empty' ? 0 : 0.3, raise: 0.3 };
    } });
    // glass: a thin pale pane filling the capsule's inside, slightly behind the strokes
    const P = VX.pixels(img), out = [...inst];
    const g = L(key === 'empty' ? '#b8b4cc' : '#a49cc0').map((v) => v * 0.5);
    for (let y = 3; y < 26; y++) for (let x = 2; x < 13; x++) {
      if (P.d[(y * 15 + x) * 4 + 3] > 0) continue;
      out.push(x + 0.5 - 7.5, 31 - y - 0.5, -1.5, 1, 1, 1, g[0], g[1], g[2], 0.05, 0.55, 1);
    }
    return new Float32Array(out);
  }));
  TL.jar = {};
  // (x, y, z, sc: the voxel jar in act one's corridor; a, glow, empty, jx, jy: shared with
  // the 2D battle, src/stage.js)
  MV.JARS.forEach((k) => (TL.jar[k] = new MV.Track({ x: 0, y: 0, z: 0, a: 0, rise: 0, glow: 0, sc: 2, empty: 0, gone: 0 })));
  MV.ACTORS.push((V, t, S) => {
    MV.JARS.forEach((key, i) => {
      const s = TL.jar[key].at(t);
      if (s.a <= 0.001 || s.rise <= 0.001 || s.gone >= 0.999) return;
      const sc = s.sc, g = s.gone;
      // (rising out of the floor in act one; breaking up in act two's darkness)
      const y = s.y - (1 - s.rise) * 31 * sc, clip = s.rise < 1 ? [0, 1, 0, s.y] : undefined;
      const f = Math.floor(t * 5 + i * 1.3) % 4; // the heart bobs, like the game's 4-frame jar
      V.draw(jarModel(key, f, s.empty > 0.5), Object.assign({
        m: M4.mul(M4.trans(s.x, y, s.z), M4.mul(M4.ry(faceYaw(S, s.x, s.z)), M4.scale(sc))),
        tint: [1, 1, 1, s.a], clip, emi: s.glow * (key === 'empty' ? 0.2 : 1) + 0.6 * g * (1 - g),
      }, goneFx(g, [0, 15, 0], 14)));
    });
  });

  // ---------------------------------------------------------------- the red soul
  const heartModel = (MV.heartModel = (col) => MV.MODEL('heart:' + col, () => VX.sprite(MV.img('heartRed'), { s: 1, ax: 8, ay: 8, base: 2, k: 0.9, max: 7, map: () => ({ c: L(col), e: 0, raise: 0 }) })));
  MV.ACTORS.push((V, t, S) => {
    const s = TL.soul.at(t);
    if (s.a <= 0.001) return;
    const mode = TL.soulMode.at(t);
    const col = mode === 'red' ? MV.COL.soul : MV.COL.S[mode];
    V.draw(heartModel(col), { m: M4.mul(M4.trans(s.x, s.y, s.z), M4.mul(M4.ry(s.spin + faceYaw(S, s.x, s.z)), M4.scale(s.sc))), tint: [1, 1, 1, s.a], emi: 0.55 + (s.glow || 0) });
  });
})();
