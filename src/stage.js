// The 2D battle's persistent actors, drawn every frame from their tracks (layers of
// src/flat.js): the backdrop (the flattened barrier corridor, its door's light, the game's
// purple glow and embers), the seven containers on pedestals over his fire's sparks, Asgore
// as a puppet of the sheet's parts or whole original frames (his robed form, the brandish,
// the kneel), his trident, the battle box, the HUD with the four buttons (MERCY smashed into
// shards that stay on the floor), the soul.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, D = MV.D, F = MV.F, FL = MV.FL;
  const R = Math.round;
  const W0 = -MV.PADX, H0 = -MV.PADY, WW = MV.OW + 2 * MV.PADX, HH = MV.OH + 2 * MV.PADY;

  // ---------------------------------------------------------------- backdrop
  // The corridor of act one, pressed flat: its picture (src/corridor.js, measured from the
  // recording) with the light still flowing into the door, dimmed and drawn behind
  // everything, its vanishing point (the door) behind his chest.
  const CR = window.MV_CORRIDOR;
  const [wallC, wallX] = MV.canvas(CR.w, CR.h);
  wallC.getContext('2d').imageSmoothingEnabled = true;
  const wallImg = wallX.createImageData(CR.w, CR.h);
  const WALL_K = 1.6; // world px per game px of the corridor picture
  // TL.wave2.u: the light wave's phase in periods (its fractional part 0 = the walls at their
  // brightest, ~0.41 = the door at its brightest); sections drive it on the music
  TL.wave2 = new MV.Track({ u: 0 });
  // each pixel's ring coordinate (0 = the outer edge .. 6 = the door; ring b spans b..b+1): the
  // corridor's rectangles, by rectangular distance from the door, banded so the inner rings keep
  // some width
  const RING_EDGE = [1, 0.74, 0.54, 0.38, 0.24, 0.12, 0];
  const ringOf = new Float32Array(CR.w * CR.h);
  for (let j = 0; j < CR.h; j++) for (let i = 0; i < CR.w; i++) {
    const d = Math.min(1, Math.max(Math.abs(i + 0.5 - CR.w / 2) / (CR.w / 2), Math.abs(j + 0.5 - CR.h / 2) / (CR.h / 2)));
    let b = 0;
    while (b < 5 && d < RING_EDGE[b + 1]) b++;
    ringOf[j * CR.w + i] = b + (RING_EDGE[b] - d) / (RING_EDGE[b] - RING_EDGE[b + 1]);
  }
  MV.wave2 = (t) => TL.wave2.at(t).u;
  const drawWall = (ctx, t, S) => {
    const k = S.look.wall;
    if (k <= 0.002) return;
    const u = MV.wave2(t), wv = CR.wave, n = wv.length, d = wallImg.data;
    const L = S.look, dawn = L.dawn;
    // cold violet stone, warming toward the door as the dawn comes; tk: the borrowed soul's
    // colour over all of it; rings: the rings lit one soul colour each from the outside in
    const c0 = [0.55, 0.5, 0.78], c1 = [0.95, 0.72, 0.5], tc = [L.tr, L.tg, L.tb], tk = U.clamp(L.tk);
    const RC = MV.SOULS.map((s) => F.rgb(MV.COL.S[s]).map((v) => v / 255)), rings = L.rings;
    for (let i = 0, N = CR.w * CR.h; i < N; i++) {
      const x = ((u - CR.ph[i]) % 1 + 1) % 1 * n, i0 = x | 0, f = x - i0;
      const w = wv[i0 % n] * (1 - f) + wv[(i0 + 1) % n] * f;
      let v = ((CR.lo[i] + (CR.hi[i] - CR.lo[i]) * w) / 255) * k;
      const m = dawn * CR.ph[i]; // the deeper (closer to the door), the warmer
      let r = c0[0] + (c1[0] - c0[0]) * m, g = c0[1] + (c1[1] - c0[1]) * m, b = c0[2] + (c1[2] - c0[2]) * m;
      if (tk > 0) { r += (tc[0] * 1.15 - r) * tk; g += (tc[1] * 1.15 - g) * tk; b += (tc[2] * 1.15 - b) * tk; }
      if (rings > 0) {
        // (a stain of colour in the stone, not a light: half-mixed, barely brighter; the lit front
        // and the bands' edges feathered - no hard steps)
        const rc = ringOf[i], on = U.clamp((rings - rc) * 1.6 + 0.2) * 0.6;
        if (on > 0) {
          const bi = Math.min(5, rc | 0), bj = Math.min(5, bi + 1), m = U.smooth(U.clamp((rc - bi - 0.7) / 0.3)), q = RC[bi], q2 = RC[bj];
          const qr = q[0] + (q2[0] - q[0]) * m, qg = q[1] + (q2[1] - q[1]) * m, qb = q[2] + (q2[2] - q[2]) * m;
          r += (qr - r) * on; g += (qg - g) * on; b += (qb - b) * on; v *= 1 + 0.25 * on;
        }
      }
      d[i * 4] = 255 * v * r;
      d[i * 4 + 1] = 255 * v * g;
      d[i * 4 + 2] = 255 * v * b;
      d[i * 4 + 3] = 255;
    }
    wallX.putImageData(wallImg, 0, 0);
    const s = CR.vs * WALL_K, x0 = FL.door[0] - 320 * WALL_K, y0 = FL.door[1] - 240 * WALL_K, w = CR.w * s, h = CR.h * s;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(wallC, x0, y0, w, h);
    // the outer walls go on past the picture's edge (a tilted camera sees beyond it): its edge
    // rows and columns stretched out to the plane's border
    const xl = W0, xr = W0 + WW, yt = H0, yb = H0 + HH;
    ctx.drawImage(wallC, 0, 0, 1, CR.h, xl, y0, x0 - xl, h); ctx.drawImage(wallC, CR.w - 1, 0, 1, CR.h, x0 + w, y0, xr - x0 - w, h);
    ctx.drawImage(wallC, 0, 0, CR.w, 1, x0, yt, w, y0 - yt); ctx.drawImage(wallC, 0, CR.h - 1, CR.w, 1, x0, y0 + h, w, yb - y0 - h);
    for (const [sx, sy, dx, dy, dw, dh] of [[0, 0, xl, yt, x0 - xl, y0 - yt], [CR.w - 1, 0, x0 + w, yt, xr - x0 - w, y0 - yt], [0, CR.h - 1, xl, y0 + h, x0 - xl, yb - y0 - h], [CR.w - 1, CR.h - 1, x0 + w, y0 + h, xr - x0 - w, yb - y0 - h]]) ctx.drawImage(wallC, sx, sy, 1, 1, dx, dy, dw, dh);
    ctx.imageSmoothingEnabled = false;
  };
  const glowRect = (ctx, x, y, r, rgb, a) => {
    if (a <= 0.002) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
    g.addColorStop(0.45, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a * 0.35})`);
    g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  const mixRGB = (a, b, k) => a.map((v, i) => R(v + (b[i] - v) * k));
  F.layers.back.push((ctx, emi, t, S) => {
    const L = S.look;
    if (S.sil) { // the game's flash: a pale field
      const g = R(255 * L.silV);
      D.rect(ctx, W0, H0, WW, HH, `rgb(${g},${g},${g})`);
      return;
    }
    D.rect(ctx, W0, H0, WW, HH, '#000000');
    // (a soul's world over all of it: src/worlds.js)
    if (MV.worldCovers && MV.worldCovers(t)) return;
    drawWall(ctx, t, S);
    // the door's light behind him: the barrier's cold white, slowly turning to sunrise
    const dl = mixRGB([214, 214, 236], [255, 196, 120], L.dawn);
    // (breathing with the music's loudness, a beat of light on the snare)
    const br = L.react > 0 ? 1 + L.react * (0.7 * MV.beatPulse(t, 'snare', 0.22) + 0.8 * (T.env(t) - 0.55)) : 1;
    ctx.globalCompositeOperation = 'lighter';
    glowRect(ctx, FL.door[0], FL.door[1], 340, dl, 0.22 * L.door * br);
    glowRect(ctx, FL.door[0], FL.door[1], 150, dl, 0.25 * L.door * br);
    ctx.globalCompositeOperation = 'source-over';
    // (no bloom from it: the door is behind the box, whose inside stays pure black)
    // the game's purple glow rising from the bottom, breathing
    if (L.purple > 0.002) {
      const h = (110 + 40 * Math.sin(t * 0.8) + 20 * Math.sin(t * 2.3)) * (0.6 + 0.4 * L.purple);
      const g = ctx.createLinearGradient(0, MV.OH + 20, 0, MV.OH - h);
      g.addColorStop(0, `rgba(110,28,124,${0.6 * L.purple})`);
      g.addColorStop(0.5, `rgba(70,18,92,${0.3 * L.purple})`);
      g.addColorStop(1, 'rgba(40,10,60,0)');
      ctx.fillStyle = g; ctx.fillRect(W0, MV.OH - h, WW, h + MV.PADY);
    }
  });
  // embers (the sheet's background particles) drifting up; stateless loops
  const EMBERS = 46;
  F.layers.back.push((ctx, emi, t, S) => {
    const a0 = S.look.embers;
    if (a0 <= 0.002 || S.sil || (MV.worldCovers && MV.worldCovers(t))) return;
    for (let i = 0; i < EMBERS; i++) {
      const h1 = U.hash(i * 1.71), h2 = U.hash(i * 3.13 + 2), h3 = U.hash(i * 5.37 + 9);
      const life = 6 + h3 * 6, u = ((t / life + h1) % 1 + 1) % 1;
      const x = 120 + h2 * 720 + Math.sin(t * 0.7 + i) * 14, y = MV.OH + 10 - u * (260 + h3 * 200);
      const a = a0 * Math.sin(u * Math.PI) * (0.5 + 0.5 * h1);
      const img = MV.img('particle' + (Math.floor(t * 8 + i) % 8));
      F.spr(ctx, img, x, y, { sc: 1, alpha: a * 0.8, ax: 5, ay: 5 });
      if (emi) D.rect(emi, x - 4, y - 4, 8, 8, '#ff5a1e', a * 0.25);
    }
  });

  // ---------------------------------------------------------------- pedestals
  // the containers stand on pedestals rising out of the dark where his fire smoulders (four on his left, the
  // empty one lowest; three on his right), a dull gold rim under each jar
  const STONE = '#251d31', GOLD = '#6e5220';
  F.layers.pedestals.push((ctx, emi, t, S) => {
    if (S.sil) return;
    for (const key of MV.JARS) {
      const s = TL.jar[key].at(t);
      if (s.a <= 0.001) continue;
      const [x, y] = MV.jarAt(key, t);
      const g = ctx.createLinearGradient(0, y, 0, FL.fireY + 20);
      g.addColorStop(0, STONE); g.addColorStop(0.75, '#1a1424'); g.addColorStop(1, 'rgba(26,20,36,0)');
      ctx.globalAlpha = s.a;
      ctx.fillStyle = g; ctx.fillRect(R(x - 19), R(y), 38, R(FL.fireY + 20 - y));
      ctx.globalAlpha = 1;
      D.rect(ctx, x - 21, y - 2, 42, 3, GOLD, s.a);
    }
  });

  // ---------------------------------------------------------------- his fire, as sparks
  // (2026-10-03, the user: the wall of flames where a floor would be stole the picture.) His
  // fire has sunk into the dark below the battle: what shows of it is what rises - sparks and
  // embers drifting up through the stage, a few small flames flickering up out of the dark at the
  // floor's line and going out at once, a low warm breath of light. All pixels on the sprites' 2
  // px grid, flickering at 12 fps like the game's. look2.flames scales it (0 = out; past 1, a
  // surge: more of them, brighter, bigger); they lean with the worlds' wind; the kick stirs it.
  const SPARK = ['#ffe6a8', '#ffb048', '#f2741c', '#b8380c', '#6a1806'];
  const FLAME = ['#6a1806', '#b8380c', '#f2741c', '#ffc458'];
  const snap2 = (v) => Math.round(v / 2) * 2;
  // one spark: i its seed, L its loop's length (s), far = smaller and slower (the backdrop's)
  const spark = (ctx, emi, t, i, k, wind, far, fade = 1) => {
    const h1 = U.hash(i * 1.37 + (far ? 50 : 0)), h2 = U.hash(i * 2.91 + 7 + (far ? 50 : 0)), h3 = U.hash(i * 4.43 + 3 + (far ? 50 : 0));
    const life = (far ? 5 : 3) + (far ? 4 : 2.6) * h3, u = (((t / life + h1) % 1) + 1) % 1;
    const rise = (far ? 150 : 210) + (far ? 180 : 260) * h2;
    const x0 = W0 + 40 + h2 * (WW - 80), y0 = FL.fireY + (far ? -10 : 26) - 30 * h1;
    const x = x0 + Math.sin(t * (0.8 + h3) + i) * (5 + 9 * h1) * u + wind * (far ? 50 : 90) * u + U.noise(t * 1.3 + i * 3.1) * 6 * u;
    const y = y0 - rise * (u + 0.25 * u * u);
    const flick = 0.55 + 0.45 * U.hash(Math.floor(t * 12) * 0.71 + i * 3.3);
    const a = Math.min(1, Math.sin(Math.PI * Math.min(1, u * 1.25)) * 1.4) * flick * Math.min(1, k) * (far ? 0.55 : 0.9) * fade;
    if (a <= 0.02) return;
    const big = !far && h1 > (k > 1 ? 0.72 - 0.25 * (k - 1) : 0.78), s = big ? 4 : 2;
    const col = SPARK[Math.min(4, Math.floor(u * 4.2 + (far ? 1 : 0)))];
    // (the hot ones drag a short tail)
    if (!far && u < 0.55) D.rect(ctx, snap2(x - wind * 2), snap2(y + 4), 2, 2, SPARK[Math.min(4, Math.floor(u * 4.2) + 1)], a * 0.5);
    D.rect(ctx, snap2(x), snap2(y), s, s, col, a);
    if (emi && (big || k > 1)) D.rect(emi, x - 4, y - 4, 8 + s, 8 + s, '#ff8a2a', 0.22 * a);
  };
  MV.fireSpark = spark;
  // (the far ones, on the backdrop behind everything; a world standing there hides them)
  F.layers.back.push((ctx, emi, t, S) => {
    const k = S.look.flames;
    if (k <= 0.002 || S.sil || (MV.worldCovers && MV.worldCovers(t))) return;
    const n = 50 * Math.min(1.6, k);
    for (let i = 0; i < Math.ceil(n); i++) spark(ctx, null, t, i, k, S.look.wind * 0.5, true, U.clamp(n - i));
  });
  F.layers.fire.push((ctx, emi, t, S) => {
    // (the kick stirs it when the stage answers the music)
    const k0 = S.look.flames, kick = S.look.react * MV.beatPulse(t, 'kick', 0.16);
    if (k0 <= 0.002 || S.sil) return;
    const k = k0 * (1 + 0.45 * kick), wind = S.look.wind, base = FL.fireY;
    // the warm breath from below: no shapes, a glow sinking into the dark
    const br = (0.16 + 0.05 * U.noise(t * 1.7)) * Math.min(1.4, k);
    const g = ctx.createLinearGradient(0, base + 60, 0, base - 120);
    g.addColorStop(0, `rgba(150,44,12,${br})`); g.addColorStop(0.45, `rgba(96,24,8,${br * 0.5})`); g.addColorStop(1, 'rgba(40,8,4,0)');
    ctx.fillStyle = g; ctx.fillRect(W0, base - 120, WW, 180 + MV.PADY);
    // small flames: up out of the dark at the floor's line and out again (a pixel tongue)
    const nf = 16 * Math.min(1.6, k);
    for (let i = 0; i < Math.ceil(nf); i++) {
      const fade = U.clamp(nf - i);
      const h1 = U.hash(i * 7.31 + 1), h2 = U.hash(i * 3.17 + 5), per = 0.7 + 0.8 * h2, ph = (((t / per + h1) % 1) + 1) % 1;
      const cyc = Math.floor(t / per + h1), x = snap2(W0 + 60 + U.hash(cyc * 1.93 + i * 5.1) * (WW - 120) + wind * 20);
      const h = Math.sin(Math.PI * ph) * (8 + 18 * U.hash(cyc * 2.7 + i)) * Math.min(1.3, k);
      if (h < 4) continue;
      const lean = wind * 0.6 + (U.hash(cyc + i * 9.7) - 0.5) * 0.5;
      for (let yy = 0; yy < h; yy += 2) {
        const u = yy / h, hw = Math.max(1, (5 - 4 * u) * (0.7 + 0.3 * Math.sin(ph * 9 + yy)));
        D.rect(ctx, snap2(x - hw + lean * yy), base - yy - 2, snap2(2 * hw) || 2, 2, FLAME[Math.min(3, Math.floor((1 - u) * 3.2))], 0.85 * Math.min(1, k) * fade);
      }
      if (emi) D.rect(emi, x - 6, base - h, 12, h, '#ff7a1e', 0.12 * Math.min(1, k) * fade);
    }
    // sparks and embers rising
    const n = 64 * Math.min(1.7, k);
    for (let i = 0; i < Math.ceil(n); i++) spark(ctx, emi, t, i, k, wind, false, U.clamp(n - i));
  });

  // ---------------------------------------------------------------- the seven containers
  // the jar sprite's white strokes and heart take the soul's colour, its dark lines stay,
  // and a pale glass pane fills the capsule; the empty one is clear glass
  const jarImg = (MV.jarImg = (key, f, gone) => F.cached(`jar2:${key}:${f}:${gone ? 1 : 0}`, () => {
    const src = MV.img(key === 'empty' || gone ? 'jarEmpty' : 'jar' + f);
    const col = F.rgb(key === 'empty' ? '#cfd0dc' : MV.COL.S[key]);
    const [c, x] = MV.canvas(src.width, src.height);
    x.drawImage(src, 0, 0);
    const id = x.getImageData(0, 0, src.width, src.height), d = id.data;
    for (let j = 0; j < src.height; j++) for (let i = 0; i < src.width; i++) {
      const p = (j * src.width + i) * 4;
      if (!d[p + 3]) { // glass inside the capsule
        if (i >= 2 && i < 13 && j >= 3 && j < 26) { d[p] = 70; d[p + 1] = 66; d[p + 2] = 92; d[p + 3] = 110; }
        continue;
      }
      if (d[p] < 40 && d[p + 1] < 40 && d[p + 2] < 40) { d[p] = 18; d[p + 1] = 15; d[p + 2] = 25; }
      else if (d[p] > 230) { d[p] = col[0]; d[p + 1] = col[1]; d[p + 2] = col[2]; }
      else { d[p] = col[0] * 0.45; d[p + 1] = col[1] * 0.45; d[p + 2] = col[2] * 0.45; }
    }
    x.putImageData(id, 0, 0);
    return c;
  }));
  // jx, jy: a jar's offset from its place (rising out of the fire, flying to the trident...)
  MV.JARS.forEach((k) => Object.assign(TL.jar[k].init, { jx: 0, jy: 0 }));
  MV.jarAt = (key, t) => { const s = TL.jar[key].at(t), [x, y] = FL.jar[key]; return [x + s.jx, y + s.jy]; };
  F.layers.jars.push((ctx, emi, t, S) => {
    MV.JARS.forEach((key, i) => {
      const s = TL.jar[key].at(t);
      if (s.a <= 0.001) return;
      const [x, y] = MV.jarAt(key, t);
      const f = Math.floor(t * 5 + i * 1.3) % 4; // the heart bobs, like the game's 4-frame jar
      const img = jarImg(key, f, s.empty > 0.5);
      F.spr(ctx, S.sil ? F.tint(img, '#000000') : img, x, y, { sc: 2, alpha: s.a, ax: 7.5, ay: 31 });
      if (emi && key !== 'empty' && s.empty < 0.5) F.glowAt(emi, x, y - 28, 30 + 24 * s.glow, MV.COL.S[key], U.clamp(0.12 + 0.5 * s.glow) * s.a);
      // the seventh, empty one lit (bar 52): a pale light inside its glass, waiting for a soul
      if (key === 'empty' && s.glow > 0.01 && !S.sil) {
        const k = U.clamp(s.glow) * s.a;
        D.rect(ctx, x - 10, y - 52, 20, 44, '#e8e6ff', 0.32 * k);
        D.rect(ctx, x - 6, y - 48, 12, 36, '#ffffff', 0.35 * k);
        if (emi) F.glowAt(emi, x, y - 30, 30 + 20 * s.glow, '#e8e6ff', 0.4 * k);
      }
    });
  });

  // ---------------------------------------------------------------- Asgore
  // the puppet: the sheet's parts at 2x on his feet (TL.king.x, y); offsets from
  // src/boss.js (fitted against the recording, tools/fit_puppet.py)
  const P = MV.BOSS_PARTS, OX = 79.5, OY = 118;
  const ORDER = ['cape', 'legs', 'belt', 'torso', 'feet', 'head'];
  const ARMS = ['armL', 'armR'], FISTS = ['fistL', 'fistR'];
  const FRAME_ANCHOR = (MV.FRAME_ANCHOR = { flashSil: [79.5, 113] }); // (src/fight.js adds the attack frames')
  for (let i = 0; i < 14; i++) FRAME_ANCHOR['brandish' + i] = [79.5, 121];
  const tridentImg = (hex) => F.cached('trident2:' + (hex || ''), () => {
    const src = MV.img('spear'), [lr, lg, lb] = F.rgb(hex || '#ff3a2a'), [dr, dg, db] = F.rgb(hex ? '#14101c' : '#c41616');
    return F.recolor('trident2' + (hex || ''), src, (r, g, b) => (r > 200 && g > 200 && b > 200 ? [lr, lg, lb, 255] : [dr, dg, db, 255]));
  });
  MV.tridentImg = tridentImg;
  // only the silhouette's outline in white, everything inside black (the game's upper arm is a
  // plain round outline, without the sheet arm's inner highlight)
  F.outlined = (img) => F.cached('outlined:' + F.id(img), () => {
    const src = F.filled(img), w = src.width, h = src.height, [c, x] = MV.canvas(w, h);
    x.drawImage(src, 0, 0);
    const id = x.getImageData(0, 0, w, h), d = id.data, A = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 0;
    const keep = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (A(i, j) && (!A(i - 1, j) || !A(i + 1, j) || !A(i, j - 1) || !A(i, j + 1))) keep[j * w + i] = 1;
    for (let p = 0; p < w * h; p++) if (d[p * 4 + 3] > 0 && !keep[p]) { d[p * 4] = d[p * 4 + 1] = d[p * 4 + 2] = 0; }
    x.putImageData(id, 0, 0);
    return c;
  });
  const drawPart = (ctx, k, X, Y, bob, sil, a, m) => {
    // (the arms and fists are open line art in the sheet: fill their insides so the trident
    // passes under the gripping fists, as in the game)
    const p = P[k], src = p.plain ? F.outlined(MV.img(p.img)) : k.startsWith('arm') || k.startsWith('fist') ? F.filled(MV.img(p.img)) : MV.img(p.img);
    const img = sil ? F.tint(src, '#000000') : src;
    const x = X + (p.x - OX) * 2, y = Y + (p.y - OY) * 2 + bob;
    if (m) { ctx.save(); ctx.transform(...m); }
    F.spr(ctx, img, x, y, { sc: 2, alpha: a, rot: p.rot ? -p.rot : 0 });
    if (m) ctx.restore();
  };

  // ---------------------------------------------------------------- his body, posable
  // The game composes him from parts; here the parts are joints, so he can act beyond the
  // sheet's three animations. TL.pose (all 0 = the game's idle; world px, radians):
  //   bx, by     the whole body             crouch, lean  the upper body sinks / tilts at the waist
  //   grot       both arms, both fists and the trident turn together about the shoulders
  //              (+ = the points rise); gx, gy shift them; trem: they tremble (px)
  //   hx, hy, htilt  the head               flare, sway   the cape spreads / swings
  TL.pose = new MV.Track({ bx: 0, by: 0, crouch: 0, lean: 0, grot: 0, gx: 0, gy: 0, trem: 0, hx: 0, hy: 0, htilt: 0, flare: 0, sway: 0 });
  // a hand let go of the trident (beyond the sheet: the game never frees them): L = the upper
  // fist on the screen's left, R = the lower one on the right; 0 on the shaft .. 1 the arm out
  // toward (Lx, Ly) / (Rx, Ry) (world px), the paw open; cupL / cupR: the open paw curls round
  // what it holds (a soul's light); Llen / Rlen: the arm's reach (x its usual length: both paws
  // held out together on one side, the far arm reaching across his chest)
  TL.reach = new MV.Track({ L: 0, R: 0, Lx: 200, Ly: 140, Rx: 760, Ry: 140, cupL: 0, cupR: 0, Llen: 1, Rlen: 1 });
  // 2D affine [a, b, c, d, e, f] (x' = a x + c y + e, y' = b x + d y + f), canvas order
  const M2 = (MV.M2 = {
    mul: (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]],
    tr: (x, y) => [1, 0, 0, 1, x, y],
    // turn by r (clockwise on screen) about (px, py)
    rot: (r, px, py) => { const c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, px - c * px + s * py, py - s * px - c * py]; },
    ap: (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]],
  });
  // the wind of a blow landing on him (src/blow.js): it takes only his cape - he does not move
  TL.gust = new MV.Track({ flare: 0, sway: 0 });
  // the joints' transforms at t (pivots: the waist, the shoulders, the neck, the cape's top)
  MV.kingXf = (t, K = TL.king.at(t)) => {
    const p = TL.pose.at(t), X = K.x, Y = K.y, gu = TL.gust.at(t);
    const body = M2.tr(p.bx, p.by);
    const up = M2.mul(body, M2.mul(M2.tr(0, p.crouch), M2.rot(p.lean, X, Y - 96)));
    const tx = p.trem ? U.noise(t * 31) * p.trem : 0, ty = p.trem ? U.noise(t * 37 + 9) * p.trem * 0.7 : 0;
    const grip = M2.mul(up, M2.mul(M2.tr(p.gx + tx, p.gy + ty), M2.rot(-p.grot, X + 1, Y - 152)));
    const head = M2.mul(up, M2.mul(M2.tr(p.hx, p.hy), M2.rot(p.htilt, X + 1, Y - 142)));
    const fl = p.flare + gu.flare, sx = 1 + 0.2 * fl, sy = 1 + 0.06 * fl, k = 0.18 * (p.sway + gu.sway), cx = X, cy = Y - 170;
    const cape = M2.mul(up, [sx, 0, k, sy, cx - sx * cx - k * cy, cy - sy * cy]);
    return { body, up, grip, head, cape, p };
  };
  // where the trident's pivot (its butt) and points are, world px
  const spearPivot = (t, K, q, pose) => {
    const bob = pose === 'idle' ? R(Math.sin(t * 1.9) * (K.breathe ?? 1) * 0.8) : 0;
    return [K.x + (q.x - OX) * 2, K.y + (q.y - OY) * 2 + bob];
  };
  const spearXf = (t, K, q) => { const xf = MV.kingXf(t, K); return q.free > 0.5 ? xf.body : xf.grip; };
  MV.spearTip = (t, f = 1) => {
    const K = TL.king.at(t), q = TL.trident.at(t), [px, py] = spearPivot(t, K, q, TL.bossPose.at(t));
    const L = MV.img('spear').width * 2 * q.sc * (q.len || 1) * f;
    return M2.ap(spearXf(t, K, q), [px + Math.cos(-q.rot) * L, py + Math.sin(-q.rot) * L]);
  };
  // the eyes inside a whole-body frame (sprite px): the white-outlined silhouette hunches - its
  // eyes sit well below the horns' roots, measured on the recording (~143 s / ~188 s)
  const FRAME_EYES = { flashSil: [[73.25, 27.5], [86.25, 27.5]] };
  MV.kingEyes = (t) => {
    const pose = TL.bossPose.at(t), fe = pose.startsWith('f:') && FRAME_EYES[pose.slice(2)];
    if (fe) {
      const K = TL.king.at(t), img = MV.img(pose.slice(2)), A = FRAME_ANCHOR[pose.slice(2)] || [img.width / 2, img.height];
      const fl = TL.kingFlip.at(t) ? -1 : 1, body = MV.kingXf(t, K).body;
      return fe.map(([c, r]) => M2.ap(body, [K.x + fl * (c - A[0]) * 2, K.y + (r - A[1]) * 2]));
    }
    const K = TL.king.at(t), bob = R(Math.sin(t * 1.9) * (K.breathe ?? 1) * 1.2), m = MV.kingXf(t, K).head;
    return [M2.ap(m, [K.x - 10, K.y - 201 + bob]), M2.ap(m, [K.x + 7.5, K.y - 201 + bob])];
  };
  // the borrowed powers along the trident (bars 40-52: a band of each soul's colour grows down
  // from the points as he draws it; the relic fight, 64-70, takes them off again): how much of
  // each band is there (0..1, it grows down from the one above it), rb (0: the bands in the order
  // he borrowed them, the points first, his own red on the rest of the shaft; 1: run together into
  // one gradient - the seven colours in the rainbow's order, violet at the points, his red at the
  // butt; a band going to 0 there gives its share back to the others), flow (0..1: light running
  // up the shaft to the points - the charge). While any band is there it replaces TL.tridentCol.
  TL.tridentBands = new MV.Track({ yellow: 0, green: 0, purple: 0, blue: 0, orange: 0, aqua: 0, rb: 0, flow: 0 });
  const RED = '#ff3a2a', SP0 = 2, SP1 = 232, BAND = (SP1 - SP0) / 7;
  const SPECTRUM = ['purple', 'blue', 'aqua', 'green', 'yellow', 'orange'];
  // (the sprite's light pixels in white / its dark outline, each alone)
  const spearPart = (dark) => F.recolor('spearPart' + dark, MV.img('spear'), (r, g, b) => ((r > 200 && g > 200 && b > 200) !== dark ? (dark ? [20, 16, 28, 255] : [255, 255, 255, 255]) : [0, 0, 0, 0]));
  let bandC = null;
  const bandedImg = (t, B) => {
    const [c, x] = bandC || (bandC = MV.canvas(240, 62));
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, 240, 62);
    x.drawImage(spearPart(false), 0, 0);
    x.globalCompositeOperation = 'source-in';
    // the bands: [x from, x to (toward the points), hex], butt to points; hard edges a px soft
    if (B.rb < 0.999) {
      const segs = [];
      let hi = SP1;
      for (const k of MV.SOULS) { const L = BAND * U.clamp(B[k]); if (L > 0.3) { segs.unshift([hi - L, hi, MV.COL.S[k]]); hi -= L; } }
      segs.unshift([0, hi, RED]);
      const g = x.createLinearGradient(0, 0, 240, 0);
      segs.forEach(([x0, x1, hex], i) => {
        g.addColorStop(U.clamp(i ? (x0 + 0.8) / 240 : 0), hex);
        g.addColorStop(U.clamp(i < segs.length - 1 ? (x1 - 0.8) / 240 : 1), hex);
      });
      x.fillStyle = g; x.fillRect(0, 0, 240, 62);
    }
    // the rainbow: each colour's share by its weight (his red always 1), blended centre to centre
    if (B.rb > 0.001) {
      const ws = SPECTRUM.map((k) => [MV.COL.S[k], U.clamp(B[k])]).filter(([, w]) => w > 0.004).concat([[RED, 1]]);
      const tot = ws.reduce((s, [, w]) => s + w, 0), g = x.createLinearGradient(0, 0, 240, 0);
      let hi = SP1;
      g.addColorStop(1, ws[0][0]);
      for (const [hex, w] of ws) { const L = ((SP1 - SP0) * w) / tot; g.addColorStop(U.clamp((hi - L / 2) / 240), hex); hi -= L; }
      g.addColorStop(0, RED);
      x.globalAlpha = U.clamp(B.rb); x.globalCompositeOperation = B.rb < 0.999 ? 'source-atop' : 'source-in';
      x.fillStyle = g; x.fillRect(0, 0, 240, 62);
      x.globalAlpha = 1;
    }
    // the charge: a light running up the shaft to the points, again and again
    if (B.flow > 0.01) {
      const ph = (((t * 1.15) % 1) + 1) % 1, cx = U.lerp(SP0 - 20, SP1 + 30, ph), g = x.createLinearGradient(cx - 18, 0, cx + 18, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${0.6 * U.clamp(B.flow)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(cx - 18, 0, 36, 62);
    }
    x.globalCompositeOperation = 'source-over';
    x.drawImage(spearPart(true), 0, 0);
    return c;
  };
  MV.tridentBanded = (t) => { const b = TL.tridentBands.at(t); return MV.SOULS.some((k) => b[k] > 0.004) ? b : null; };
  const drawSpear = (ctx, emi, t, K, q, pose, a, sil) => {
    const [px, py] = spearPivot(t, K, q, pose), m = spearXf(t, K, q);
    const bands = MV.tridentBanded(t);
    const img = bands ? bandedImg(t, bands) : tridentImg(TL.tridentCol.at(t));
    for (const c of emi && q.glow > 0.01 && !sil ? [ctx, emi] : [ctx]) {
      c.save();
      c.globalAlpha = c === ctx ? a : U.clamp(q.glow * 0.35) * a;
      c.transform(...m);
      c.translate(R(px), R(py)); c.rotate(-q.rot); c.scale(2 * q.sc * (q.len || 1), 2 * q.sc);
      c.drawImage(img, 0, -31);
      c.restore();
      c.globalAlpha = 1;
    }
  };
  // the trident as he holds it at t, drawn into another layer (the all-out blow, src/finale.js: the
  // part driven into the box drawn again in the box, over its black)
  MV.drawTridentAt = (ctx, emi, t) => {
    const K = TL.king.at(t), q = TL.trident.at(t), pose = TL.bossPose.at(t);
    if (K.a > 0.001 && (pose === 'idle' || q.free > 0.5) && q.on > 0.001) drawSpear(ctx, emi, t, K, q, pose, K.a * q.on, false);
  };
  // him as he stands at time t, drawn into a canvas at the game's own 1x (feet centre at
  // (W/2, H - 8)): what the voxel windows build his relief from
  MV.kingSnapshot = (t, o = {}) => {
    const W = 200, Hh = 190, [c2, x2] = MV.canvas(W * 2, Hh * 2), K = Object.assign(TL.king.at(t), { x: W, y: Hh * 2 - 16, shake: 0, ghost: 0, a: 1 });
    const pose = o.pose || TL.bossPose.at(t);
    // (drawn at the battle's 2x about his feet, then halved: the sprites' own pixels)
    const save = TL.king.at;
    TL.king.at = (tt) => Object.assign(save.call(TL.king, tt), { x: K.x, y: K.y, shake: 0, ghost: 0 });
    try { drawBattleForm(x2, null, t, K, pose, false, K.x, K.y); } finally { TL.king.at = save; }
    const [c, x] = MV.canvas(W, Hh);
    x.imageSmoothingEnabled = false;
    x.drawImage(c2, 0, 0, W, Hh);
    return c;
  };
  F.layers.king.push((ctx, emi, t, S) => {
    const K = TL.king.at(t);
    if (K.a <= 0.001) return;
    const pose = TL.bossPose.at(t);
    if (pose === 'none') return;
    const sil = S.sil || K.sil > 0.5;
    const X = R(K.x + (K.shake ? U.noise(t * 47) * K.shake : 0)), Y = R(K.y);
    // act two: his everyday self (4x) above the climbing line, the battle form below it
    const wipe = K.wipe > -1000 ? R(K.wipe) : null; // (-1e4: none - the line may climb past the top)
    if (K.ow > 0.001) {
      const ow = MV.img(TL.asgFace.at(t) === 'up' ? 'agUp0' : 'agDown0');
      ctx.save();
      // (what is left of him above the line fades as it crosses his head: no crown left floating
      // over the robed form's horns)
      let fa = 1;
      if (wipe !== null) {
        ctx.beginPath(); ctx.rect(W0, H0, WW, wipe - H0); ctx.clip();
        const oh = ow.height * 4;
        fa = U.smooth(U.clamp((wipe - (Y - oh)) / (0.45 * oh)));
      }
      if (fa > 0.001) F.spr(ctx, sil ? F.tint(ow, '#000000') : ow, X, Y, { sc: 4, ax: ow.width / 2, ay: ow.height, alpha: K.ow * K.a * fa });
      ctx.restore();
    }
    if (wipe === null) drawBattleForm(ctx, emi, t, K, pose, sil, X, Y);
    else {
      if (wipe < Y) { ctx.save(); ctx.beginPath(); ctx.rect(W0, wipe, WW, HH); ctx.clip(); drawBattleForm(ctx, emi, t, K, pose, sil, X, Y); ctx.restore(); }
      // the line of light climbing him
      D.rect(ctx, X - 175, wipe - 2, 350, 4, '#f0ecf6', 0.9 * K.a);
      if (emi) D.rect(emi, X - 185, wipe - 8, 370, 16, '#f0ecf6', 0.35 * K.a);
    }
  });
  const drawBattleForm = (ctx, emi, t, K, pose, sil, X, Y) => {
    const xf = MV.kingXf(t, K), rch = TL.reach.at(t);
    if (pose.startsWith('f:')) {
      const name = pose.slice(2), img = MV.img(name);
      const A = FRAME_ANCHOR[name] || [img.width / 2, img.height];
      const im = sil && name !== 'flashSil' ? F.tint(img, '#000000') : img;
      const flip = TL.kingFlip.at(t);
      // the slash's own overlays on the attack frames (src/fight.js H.slash): the crescents
      // behind him, the trident streak in front
      const sw = name.startsWith('swipe') ? MV.swipeOverlay(t, +name.slice(5)) : null;
      ctx.save(); ctx.transform(...xf.body);
      if (sw && sw.behind) F.spr(ctx, sw.img, X, Y, { sc: 2, ax: A[0], ay: A[1], alpha: K.a, flip });
      for (let g = K.ghost; g >= 1; g--) {
        const p = TL.king.at(t - g * 0.045);
        F.spr(ctx, im, p.x, p.y, { sc: 2, ax: A[0], ay: A[1], alpha: K.a * 0.55 ** g, flip });
      }
      F.spr(ctx, im, X, Y, { sc: 2, ax: A[0], ay: A[1], alpha: K.a, flip });
      if (sw && !sw.behind) F.spr(ctx, sw.img, X, Y, { sc: 2, ax: A[0], ay: A[1], alpha: K.a, flip });
      ctx.restore();
    } else {
      const br = K.breathe ?? 1, s = Math.sin(t * 1.9) * br, face = TL.kingFace.at(t);
      const JOINT = { cape: xf.cape, legs: xf.body, feet: xf.body, belt: xf.up, torso: xf.up, head: xf.head };
      // (the trident turned far from where the game holds it: forearms instead of the arm sprites)
      const fore = pose === 'idle' && Math.abs(xf.p.grot) > FORE_G;
      for (const k of ORDER) {
        if (k === 'torso' && fore) drawForearms(ctx, t, xf, X, Y, R(s * 0.8), sil, K.a, rch, true);
        if (k === 'head' && face) { // one of his battle faces in place of the head, lined up on it
          const p = P.head, [dx, dy] = MV.faceAt(face), img = F.filled(MV.img(face));
          ctx.save(); ctx.transform(...xf.head);
          F.spr(ctx, sil ? F.tint(img, '#000000') : img, X + (p.x + dx - OX) * 2, Y + (p.y + dy - OY) * 2 + R(s * 1.2), { sc: 2, alpha: K.a });
          ctx.restore();
          continue;
        }
        drawPart(ctx, k, X, Y, k === 'head' ? R(s * 1.2) : k === 'torso' ? R(s * 0.8) : 0, sil, K.a, JOINT[k]);
      }
      if (fore) drawForearms(ctx, t, xf, X, Y, R(s * 0.8), sil, K.a, rch, false);
      else if (pose === 'idle') ARMS.forEach((k, i) => { if (!(rch[i ? 'R' : 'L'] > 0.001)) drawPart(ctx, k, X, Y, R(s * 0.8), sil, K.a, xf.grip); });
    }
    // the trident: idle (between the arms and the fists), or free with any pose
    const q = TL.trident.at(t);
    if ((pose === 'idle' || q.free > 0.5) && q.on > 0.001) {
      for (let g = q.ghost || 0; g >= 1; g--) {
        const tt = t - g * 0.045, qq = TL.trident.at(tt);
        if (qq.on <= 0.001 || (q.free > 0.5 && qq.free < 0.5)) continue; // no afterimage from before it was drawn
        drawSpear(ctx, null, tt, TL.king.at(tt), qq, pose, K.a * q.on * 0.6 ** g, sil);
      }
      drawSpear(ctx, emi, t, K, q, pose, K.a * q.on, sil);
    }
    if (pose === 'idle') {
      const s = Math.sin(t * 1.9) * (K.breathe ?? 1);
      FISTS.forEach((k, i) => { if (!(rch[i ? 'R' : 'L'] > 0.001)) drawPart(ctx, k, X, Y, R(s * 0.8), sil, K.a, xf.grip); });
      for (const side of ['L', 'R']) if (rch[side] > 0.001) drawReach(ctx, emi, t, K, xf, side, rch, sil);
    }
  };
  // ---- the arms when the trident is turned far from where the game holds it (raised high, swung
  // right down): turned whole with the grip, the game's arm sprites would come off his shoulders.
  // So then they are left out and only the forearms are drawn - each from an elbow a short upper
  // arm out from its shoulder (bent away from his body) to its fist: a sleeve in the sprites' own
  // style (black, a pixel of white line round it, narrowing to the wrist, a round elbow). One whose
  // fist is up above the shoulder pads comes out from behind them (drawn under the torso); one whose
  // fist is lower crosses in front of him. (composite px)
  const FORE_G = 0.6, ARM_SHOULDER = { L: [32, 44], R: [126, 44] }, UPPER = 22, PAD_Y = 34;
  const forearmImg = (len) => F.cached('forearm:' + len, () => {
    const L = Math.max(10, len), Hh = 15, w = L + 2, h = Hh + 2, cy = h / 2, [c, x] = MV.canvas(w, h);
    const inside = (i, j) => {
      if (Math.hypot(i + 0.5 - 8, j + 0.5 - cy) <= 7) return true; // the elbow
      return i >= 8 && i <= L && Math.abs(j + 0.5 - cy) <= U.lerp(7, 5.2, (i - 8) / Math.max(1, L - 8));
    };
    const id = x.createImageData(w, h), d = id.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (!inside(i, j)) continue;
      const edge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1), p = (j * w + i) * 4;
      d[p] = d[p + 1] = d[p + 2] = edge ? 255 : 0; d[p + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    return c;
  });
  const drawForearms = (ctx, t, xf, X, Y, bob, sil, a, rch, behind) => {
    const at = (c) => M2.ap(xf.up, [X + (c[0] - OX) * 2, Y + (c[1] - OY) * 2 + bob]), mid = at([OX, PAD_Y]);
    for (const side of ['L', 'R']) {
      if (rch[side] > 0.001) continue; // (a hand held out: the reach draws its own arm)
      const Fp = MV.fistAt(t, side === 'L' ? 'fistL' : 'fistR');
      if ((Fp[1] < mid[1]) !== behind) continue;
      // the elbow: the upper arm toward the fist, bent away from his middle
      const S = at(ARM_SHOULDER[side]), d = Math.hypot(Fp[0] - S[0], Fp[1] - S[1]) || 1, ux = (Fp[0] - S[0]) / d, uy = (Fp[1] - S[1]) / d;
      const cands = [0.5, -0.5].map((b) => [S[0] + UPPER * 2 * (ux * Math.cos(b) - uy * Math.sin(b)), S[1] + UPPER * 2 * (ux * Math.sin(b) + uy * Math.cos(b))]);
      const E = Math.abs(cands[0][0] - mid[0]) >= Math.abs(cands[1][0] - mid[0]) ? cands[0] : cands[1];
      const img = forearmImg(Math.round(Math.hypot(Fp[0] - E[0], Fp[1] - E[1]) / 2) + 8);
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(R(E[0]), R(E[1])); ctx.rotate(Math.atan2(Fp[1] - E[1], Fp[0] - E[0])); ctx.scale(2, 2);
      ctx.drawImage(sil ? F.tint(img, '#000000') : img, -8, -img.height / 2);
      ctx.restore();
    }
  };
  // ---- a hand let go of the trident: the sleeve from the shoulder, the paw at its end (open,
  // or curled round a light); MV.handAt: where a hand is (the ribbons of light end there)
  const SHOULDER = { L: [30, 46], R: [122, 58] }, ARM_LEN = 74;
  const reachGeo = (t, K, xf, side, r) => {
    const sh = SHOULDER[side], S = M2.ap(xf.up, [K.x + (sh[0] - OX) * 2, K.y + (sh[1] - OY) * 2]);
    const G = MV.fistAt(t, side === 'L' ? 'fistL' : 'fistR'), tx = r[side + 'x'], ty = r[side + 'y'];
    const d = Math.hypot(tx - S[0], ty - S[1]) || 1, AL = ARM_LEN * (r[side + 'len'] ?? 1), P = [S[0] + ((tx - S[0]) / d) * AL, S[1] + ((ty - S[1]) / d) * AL];
    const k = U.clamp(r[side]), hand = [U.lerp(G[0], P[0], k), U.lerp(G[1], P[1], k)];
    return { S, hand, ang: Math.atan2(hand[1] - S[1], hand[0] - S[0]) };
  };
  MV.handAt = (t, side = 'L') => {
    const r = TL.reach.at(t);
    if (!(r[side] > 0.001)) return MV.fistAt(t, side === 'L' ? 'fistL' : 'fistR');
    const K = TL.king.at(t);
    return reachGeo(t, K, MV.kingXf(t, K), side, r).hand;
  };
  const drawReach = (ctx, emi, t, K, xf, side, r, sil) => {
    const { S, hand, ang } = reachGeo(t, K, xf, side, r), k = U.clamp(r[side]);
    const sleeve = MV.ART.get('armReach'), len = Math.max(16, Math.hypot(hand[0] - S[0], hand[1] - S[1]));
    ctx.save();
    ctx.globalAlpha = K.a;
    ctx.translate(R(S[0]), R(S[1])); ctx.rotate(ang);
    // (the sleeve sags a little toward the wrist on either side: mirrored on the left)
    ctx.scale((2 * len) / (sleeve.width * 2 - 4), Math.abs(ang) > Math.PI / 2 ? -2 : 2);
    ctx.drawImage(sil ? F.tint(sleeve, '#000000') : sleeve, -2, -sleeve.height / 2);
    ctx.restore();
    // the paw: the fist while it leaves the shaft, then open, fingers toward what it reaches for;
    // closed again (gently) round the light it was given
    const open = k >= 0.45 && !(r['cup' + side] > 0.5);
    const img = open ? MV.ART.get('pawReach') : F.filled(MV.img(side === 'L' ? 'fistL' : 'fistR'));
    F.spr(ctx, sil ? F.tint(img, '#000000') : img, hand[0], hand[1], { sc: 2, ax: img.width / 2, ay: open ? img.height - 3 : img.height / 2, rot: open ? ang + Math.PI / 2 : ang + (side === 'L' ? Math.PI : 0), flip: side === 'R', alpha: K.a });
  };

  // ---------------------------------------------------------------- the battle box
  F.layers.box.push((ctx, emi, t, S) => {
    const b = S.box;
    if (b.fill <= 0.002) return;
    ctx.globalAlpha = b.a * b.fill;
    ctx.fillStyle = '#000000';
    F.boxPath(ctx, b); ctx.fill();
    ctx.globalAlpha = 1;
  });
  F.boxFrame = (ctx, emi, b, S) => {
    if (b.fa <= 0.002) return;
    b = Object.assign({}, b, { a: b.a * b.fa });
    const th = b.th + (S.look.react > 0 ? S.look.react * 3 * MV.beatPulse(S.t, 'snare', 0.09) : 0);
    const col = S.sil ? [0, 0, 0] : [U.lerp(255, b.ar * 255, b.ak), U.lerp(255, b.ag * 255, b.ak), U.lerp(255, b.ab * 255, b.ak)].map(R);
    ctx.save();
    ctx.globalAlpha = b.a;
    ctx.strokeStyle = `rgb(${col})`;
    ctx.lineWidth = th;
    const bb = Object.assign({}, b, { x: b.x - th / 2, y: b.y - th / 2, w: b.w + th, h: b.h + th });
    F.boxPath(ctx, bb); ctx.stroke();
    ctx.restore();
    if (emi && b.ak > 0.01) { emi.save(); emi.globalAlpha = 0.35 * b.ak * b.a; emi.strokeStyle = `rgb(${col})`; emi.lineWidth = th + 4; F.boxPath(emi, bb); emi.stroke(); emi.restore(); }
  };

  // ---------------------------------------------------------------- the HUD
  const lift = (k) => (1 - U.eOutBack(U.clamp(k))) * 60;
  const hudTxt = (str) => F.cached('hudTxt:' + str, () => MV.hudText(str, '#ffffff'));
  MV.btnPos = (i, t) => { const b = TL.btn[i].at(t); return [FL.btnX[i] + (b.dx || 0), FL.btnY + (b.dy || 0)]; };
  F.layers.hud.push((ctx, emi, t, S) => {
    const h = TL.hudT.at(t), y = FL.hudY;
    if (h.a > 0.001 && !S.sil) {
      const txt = (str, x, k) => { if (k > 0) F.spr(ctx, hudTxt(str), x, y - lift(k), { sc: 2, alpha: h.a * U.clamp(k * 4) }); };
      txt('Frisk', FL.name, h.nameA);
      txt('LV 1', FL.lv, h.lvA);
      if (h.hpA > 0) {
        const a = h.a * U.clamp(h.hpA * 4), dy = lift(h.hpA);
        F.spr(ctx, MV.SPR.hpLabel, FL.hpLabel, y - dy + 0.5, { sc: 1, alpha: a });
        const w = h.hpMax * 1.2, f = U.clamp(h.hp / h.hpMax) * w, [bx, by] = FL.hpBar;
        D.rect(ctx, bx, by - dy, w, 21, MV.COL.hpRed, a);
        if (f > 0) D.rect(ctx, bx, by - dy, Math.max(1, f), 21, MV.COL.hpYellow, a);
      }
      txt(`${Math.max(0, Math.round(h.hp))} / ${h.hpMax}`, FL.num, h.numA);
    }
    const broken = TL.mercyBreak !== undefined && t >= TL.mercyBreak && !(TL.mercyRestored !== undefined && t >= TL.mercyRestored);
    for (let i = 0; i < 4; i++) {
      const b = TL.btn[i].at(t);
      if (b.a <= 0.001 || b.hide || (i === 3 && broken)) continue;
      const fall = (1 - U.eOutBack(U.clamp(b.drop))) * 140;
      const [x, y] = MV.btnPos(i, t);
      const img = MV.SPR[`btn${i}${b.sel > 0.5 ? 'h' : ''}`];
      F.spr(ctx, S.sil ? F.tintLines(img, '#000000') : img, x, y - fall, { sc: 1, alpha: b.a * U.clamp(b.drop * 3) });
      if (emi && b.sel > 0.5) D.rect(emi, x - 3, y - 3, 116, 48, '#ffe14a', 0.18 * b.a);
    }
    drawShards(ctx, emi, t, S);
  });
  // ---- MERCY, smashed: the button's pixels in 3x3 chunks burst from the trident's point, fall
  // and come to rest on the floor of its slot (analytic flight: every frame stands alone).
  // TL.mercyRestore = [t0, t1]: they fly back up and the button reassembles (act five).
  const GRAV = 1500, CH = 3;
  let shards = null;
  const mercyShards = () => {
    if (shards) return shards;
    const img = MV.SPR.btn3, [c, x] = MV.canvas(img.width, img.height);
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, img.width, img.height).data, rnd = U.rng(77), out = [];
    const [bx, by] = [FL.btnX[3], FL.btnY], hit = [bx + 55, by];
    const floor = by + 42;
    for (let j = 0; j < img.height; j += CH) for (let i = 0; i < img.width; i += CH) {
      let n = 0, r = 0, g = 0, b = 0;
      for (let jj = 0; jj < CH; jj++) for (let ii = 0; ii < CH; ii++) {
        const p = ((j + jj) * img.width + i + ii) * 4;
        if (d[p + 3] > 0 && d[p] + d[p + 1] + d[p + 2] > 60) { n++; r += d[p]; g += d[p + 1]; b += d[p + 2]; }
      }
      if (n < 3) continue;
      const x0 = bx + i, y0 = by + j, dx = x0 - hit[0], dist = Math.abs(dx) + 1;
      const vx = (dx / dist) * (30 + rnd() * 130) + (rnd() - 0.5) * 50, vy = -(120 + rnd() * 380);
      const yRest = floor - CH - R(rnd() * 3);
      const tl = (-vy + Math.sqrt(vy * vy + 2 * GRAV * Math.max(0, yRest - y0))) / GRAV;
      out.push({ x0, y0, vx, vy, tl, yRest, col: `rgb(${R(r / n)},${R(g / n)},${R(b / n)})`, s: rnd() });
    }
    return (shards = out);
  };
  MV.mercyShards = mercyShards;
  const drawShards = (ctx, emi, t, S) => {
    if (TL.mercyBreak === undefined || t < TL.mercyBreak || TL.hudT.at(t).shards < 0.5) return;
    const tb = TL.mercyBreak, Rr = TL.mercyRestore;
    let back = 0;
    if (Rr) { if (t >= Rr[1]) return; if (t > Rr[0]) back = U.eInOut((t - Rr[0]) / (Rr[1] - Rr[0])); }
    const fresh = Math.max(0, 1 - (t - tb) * 2.5);
    for (const q of mercyShards()) {
      const tau = Math.min(t - tb, q.tl);
      let x = q.x0 + q.vx * tau * (1 - 0.35 * U.clamp(tau / q.tl)), y = q.y0 + q.vy * tau + 0.5 * GRAV * tau * tau;
      if (t - tb >= q.tl) y = q.yRest;
      if (back) { x = U.lerp(x, q.x0, back); y = U.lerp(y, q.y0, back); }
      // at rest they dim: ruins in the slot
      const dim = t - tb > q.tl ? 0.55 : 1;
      D.rect(ctx, x, y, CH, CH, S.sil ? '#000000' : q.col, dim + (1 - dim) * back);
      if (emi && fresh > 0) D.rect(emi, x - 1, y - 1, CH + 2, CH + 2, '#ff8c1a', fresh * 0.6);
    }
  };

  // ---------------------------------------------------------------- the soul
  // (yellowUp: the game's shooting mode - the soul turned over, its point up at him)
  const HEART = { red: 'heartRed', blue: 'heartBlue', green: 'heartGreen', purple: 'heartPurple', yellow: 'heartYellow', yellowUp: 'heartYellowFlip', orange: 'heartOrange', aqua: 'heartAqua' };
  // the crack (bar 52): a zigzag split down the middle, revealed 0..1 (it never breaks in two);
  // seal (bars 60-63): the crack glowing as it closes
  const CRACK = [[8, 3], [7, 4], [7, 5], [8, 6], [9, 7], [9, 8], [8, 9], [7, 10], [7, 11], [8, 12], [8, 13]];
  const heartImg = (name, crack, seal) => {
    const n = Math.round(U.clamp(crack) * CRACK.length), g = Math.round(U.clamp(seal) * 4);
    if (!n) return MV.img(name);
    return F.cached(`heartC:${name}:${n}:${g}`, () => {
      const [c, x] = MV.canvas(16, 16);
      x.drawImage(MV.img(name), 0, 0);
      x.fillStyle = g ? ['#3a0000', '#ff6a50', '#ffa080', '#ffd0b8', '#fff0e8'][g] : '#1a0000';
      for (let i = 0; i < n; i++) x.fillRect(CRACK[i][0], CRACK[i][1], 1, 1);
      return c;
    });
  };
  MV.heartImg = heartImg; // (for what draws the soul itself: tl_act4e's yellow)
  // the dash: where TL.dashSpans says (bars that are a chase), a soul moving fast leaves two or three
  // fading copies of itself behind - the way it went reads even in a wide shot (README 脑暴 ①)
  TL.dashSpans = TL.dashSpans || [];
  const DASH_DT = 0.028, DASH_V = 140;
  // its wake: where TL.trailSpans says (the climax), a thin red line of light behind it where it
  // dashed in the last third of a second - its dance drawn on the black (his six ribbons against
  // its one red line)
  TL.trailSpans = TL.trailSpans || [];
  const wake = (ctx, emi, t) => {
    const N = 20, dt = 1 / 60;
    let prev = TL.heart.at(t);
    for (let k = 1; k <= N; k++) {
      const q = TL.heart.at(t - k * dt);
      if (q.a < 0.5) break;
      const v = Math.hypot(q.x - prev.x, q.y - prev.y) / dt;
      if (v > 90) {
        const a = 0.7 * (1 - k / (N + 1)) * U.clamp((v - 90) / 120);
        ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#ff2a2a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.restore();
        if (emi && k % 4 === 1) F.glowAt(emi, q.x, q.y, 10, '#ff2020', 0.25 * a);
      }
      prev = q;
    }
  };
  F.layers.heart.push((ctx, emi, t, S) => {
    const s = TL.heart.at(t);
    if (s.a <= 0.001 || TL.heartHide(t)) return;
    const mode = TL.heartMode.at(t);
    const img = heartImg(HEART[mode] || 'heartRed', s.crack, s.seal || 0);
    // (away from the battle plane - up on a jar, at his chest - drawn where it would be seen from
    // there; its ghosts and its wake with it)
    const deep = Math.abs(s.z || 0) > 0.5;
    if (deep) { const x = MV.depthXf(S.cam, s.z, 0); ctx.save(); ctx.transform(x.k, 0, 0, x.k, x.ox, x.oy); if (emi) { emi.save(); emi.transform(x.k, 0, 0, x.k, x.ox, x.oy); } }
    if (TL.trailSpans.some(([a, b]) => t >= a && t < b)) wake(ctx, emi, t);
    if (TL.dashSpans.some(([a, b]) => t >= a && t < b)) {
      let prev = s;
      for (let k = 1; k <= 3; k++) {
        const q = TL.heart.at(t - k * DASH_DT);
        if (q.a < 0.5 || Math.hypot(q.x - prev.x, q.y - prev.y) / DASH_DT < DASH_V) break;
        F.spr(ctx, img, q.x, q.y, { sc: s.sc, rot: s.rot, alpha: s.a * 0.42 * (1 - k / 4), ax: 8, ay: 8 });
        prev = q;
      }
    }
    F.spr(ctx, img, s.x, s.y, { sc: s.sc, rot: s.rot, alpha: s.a, ax: 8, ay: 8 });
    if (emi) F.glowAt(emi, s.x, s.y, 14 + 10 * s.glow, mode === 'red' ? '#ff2020' : MV.COL.S[mode] || MV.COL.S.yellow, (0.3 + 0.5 * s.glow) * s.a);
    if (deep) { ctx.restore(); if (emi) emi.restore(); }
  });
  // spans where something else draws the soul (the jar fight's hero: src/tl_act4d.js)
  TL.heartHideSpans = TL.heartHideSpans || [];
  TL.heartHide = (t) => TL.heartHideSpans.some(([a, b]) => t >= a && t < b);
})();
