// Act four's battle toolkit, in the 2D battle (world px = the game's px; the box's home is
// MV.FL.box). Everything is a stateless timeline event: a draw(ctx, emi, t, S) for the picture
// and a hit(t, p, moving) for tools/check.cjs.
//  - shots: his own fire (fireballs, rain, rings, spirals, the fire hands), his trident's slashes
//    (the game's attack frames; orange hurts a soul that stands still, light blue one that
//    moves), the six humans' things as bullets;
//  - his tells: the eye flash (the sheet's own frames), the red "!";
//  - borrowing a soul: he holds a paw out to its container (a hand let go of the trident), a
//    ribbon of its colour runs into it and on into the trident (the soul never leaves the jar),
//    the jar lit, the walls in its colour, his trident in its colour; the absent child: what its
//    human left behind, standing beside the box, worn by no one;
//  - your turns: the text box, the buttons, the ACT / ITEM lists, typed lines, the FIGHT target
//    line with his HP bar (and the six soul pips), the attack bar, the strike and the damage;
//  - the camera's tools (never a blown-up sprite): the scope, his breath.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, D = MV.D, F = MV.F, FL = MV.FL;
  const R = Math.round;
  const SR = 5; // the soul's hit radius (the game's hitbox is smaller than the heart)
  const B = (MV.B2 = { SR });
  const HEX = MV.COL.S;
  B.HEX = HEX;
  // the game's own attack colours (sampled from the recording's slashes): what carries the
  // orange / light-blue rule is drawn in these, the souls' jars keep their own
  B.RULE = { orange: '#fea139', aqua: '#029dfe' };
  // the home battle box (inside, where the soul's centre can go: 8 px from the frame)
  const BX = FL.box;
  B.home = { cx: BX.cx, cy: BX.cy, w: BX.w, h: BX.h };
  B.inner = (b = B.home, m = 8) => ({ x0: b.cx - b.w / 2 + m, x1: b.cx + b.w / 2 - m, y0: b.cy - b.h / 2 + m, y1: b.cy + b.h / 2 - m });

  // ---------------------------------------------------------------- sprites
  // the game's fireball (two frames), recoloured: its white takes hex, its dark eye stays
  const fireImg = (f, hex) => (hex ? F.recolor(`fire${f}:${hex}`, MV.img('fire' + f), (r, g, b) => (r > 128 ? [...F.rgb(hex), 255] : null)) : MV.img('fire' + f));
  B.fireImg = fireImg;
  B.fire = (ctx, emi, x, y, t, seed, o = {}) => {
    const img = fireImg(Math.floor(t * 10 + seed) % 2, o.hex);
    F.spr(ctx, img, x, y, { sc: o.sc ?? 1, ax: 8, ay: 8, alpha: o.a ?? 1 });
    if (emi && (o.glow ?? 1) > 0) D.rect(emi, x - 5, y - 5, 10, 10, o.hex || '#ffe0c0', 0.18 * (o.glow ?? 1) * (o.a ?? 1));
  };
  const tinted = (img, hex) => (hex ? F.tint(img, hex) : img);
  B.prop = (name, hex) => F.cached('prop2:' + name + (hex || ''), () => MV.propCanvas(name, hex));

  // ---------------------------------------------------------------- shots
  // shot: {t0, t1, p: t -> [x, y] | null, hr (hit radius), rule ('orange' | 'aqua'), safe,
  //        hw / hh (a box), seg: t -> [x0, y0, x1, y1, halfWidth] (a blade), draw(ctx, emi, t, p, k, s),
  //        hex, sc, seed}
  B.hurts = (rule, mv) => (rule === 'aqua' ? mv : rule === 'orange' ? !mv : true);
  // is a point inside the battle box at t (its rotation included)
  B.inBox = (p, t) => {
    const b = MV.box2At(t), c = Math.cos(-b.rot), s = Math.sin(-b.rot), dx = p[0] - b.cx, dy = p[1] - b.cy;
    const lx = Math.abs(dx * c - dy * s), ly = Math.abs(dx * s + dy * c), r = (b.round || 0) * Math.min(b.w, b.h) / 2;
    if (b.a <= 0.5 || lx > b.w / 2 + 2 || ly > b.h / 2 + 2) return false;
    if (r < 0.5) return true;
    const qx = Math.max(0, lx - (b.w / 2 - r)), qy = Math.max(0, ly - (b.h / 2 - r));
    return qx * qx + qy * qy <= (r + 2) * (r + 2);
  };
  // ---------------------------------------------------------------- the camera
  // shots on the 3D camera over the diorama (src/post2d.js); every value not named goes home
  const CAM_HOME = { x: 480, y: 270, zoom: 1, roll: 0, pitch: 0, yaw: 0, fov: 0.7 };
  B.CAM_HOME = CAM_HOME;
  // a hard cut to a shot
  H.shot = (t, v = {}) => TL.cam2.set(t, Object.assign({}, CAM_HOME, v));
  // a move to a shot (keeps what is not named)
  H.move = (t0, t1, v, ease = 'inOut') => TL.cam2.to(t0, t1, v, ease);
  // a whip: a fast turn to a shot, smeared by its own speed (src/flat.js), with a kick at the end
  H.whip = (t, v, o = {}) => {
    const d = o.dur ?? 0.1;
    TL.cam2.to(t - d, t, Object.assign({}, o.keep ? {} : CAM_HOME, v), o.ease || 'inOut');
    if (o.kick !== false) TL.impact(t, { amp: o.amp ?? 5, dx: o.dx ?? 0, dy: o.dy ?? 0, zoom: 0.025, dur: 0.25 });
    if (o.sfx !== false) H.sfx(t - d, 'SwipeShort', o.vol ?? 0.12);
  };
  // the big blow: a shake, a punch-in, a white flash, two frames of hard black and white
  H.bigHit = (t, o = {}) => TL.impact(t, Object.assign({ amp: 16, zoom: 0.09, flash: 0.45, bw: 0.034, rot: 0.02, dur: 0.6 }, o));
  const segDist = (px, py, s) => {
    const [x0, y0, x1, y1] = s, dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
    const u = U.clamp(((px - x0) * dx + (py - y0) * dy) / L2);
    return Math.hypot(px - (x0 + dx * u), py - (y0 + dy * u));
  };
  B.segDist = segDist;
  const shotHit = (s, t, sp) => {
    if (s.seg) { const g = s.seg(t); return g && segDist(sp[0], sp[1], g) < (g[4] ?? 3) + SR; }
    const p = s.p(t);
    if (!p) return false;
    if (s.hw) return Math.abs(p[0] - sp[0]) < s.hw + SR && Math.abs(p[1] - sp[1]) < s.hh + SR;
    return Math.hypot(p[0] - sp[0], p[1] - sp[1]) < (s.hr ?? 5) + SR;
  };
  H.shots = (shots, o = {}) => {
    shots = shots.filter(Boolean);
    if (!shots.length) return null;
    let t0 = Infinity, t1 = -Infinity;
    shots.forEach((s, i) => { t0 = Math.min(t0, s.t0); t1 = Math.max(t1, s.t1); if (s.seed === undefined) s.seed = i * 1.37 + (o.seed || 0); });
    const name = o.name || 'fire', clip = o.clip === undefined ? 'box' : o.clip;
    return TL.add({
      t0, t1, z: o.z ?? 10, clip, keep: o.keep, kind: 'shots', name,
      draw(ctx, emi, t, S) {
        for (const s of shots) {
          if (t < s.t0 || t >= s.t1) continue;
          const p = s.p ? s.p(t) : null;
          if (!p && !s.draw) continue;
          const k = U.clamp((t - s.t0) / (s.fadeIn ?? 0.06)) * U.clamp((s.t1 - t) / (s.fadeOut ?? 0.06));
          // (s.z: its depth, or t -> its depth - at the soul up on a jar, coming off his points: drawn
          // where it would be seen from there, src/depth.js)
          const zz = s.z === undefined || !S ? 0 : typeof s.z === 'function' ? s.z(t) : s.z, deep = Math.abs(zz) > 0.5;
          if (deep) { const x = MV.depthXf(S.cam, zz, 0); ctx.save(); ctx.transform(x.k, 0, 0, x.k, x.ox, x.oy); if (emi) { emi.save(); emi.transform(x.k, 0, 0, x.k, x.ox, x.oy); } }
          if (s.draw) s.draw(ctx, emi, t, p, k, s);
          else B.fire(ctx, emi, p[0], p[1], t, s.seed, { hex: s.hex, sc: s.sc, a: k });
          if (deep) { ctx.restore(); if (emi) emi.restore(); }
        }
      },
      hit(t, sp, mv) {
        // (what the box clips away cannot touch a soul outside it)
        if (clip === 'box' && !B.inBox(sp, t)) return false;
        for (const s of shots) {
          if (s.safe || t < s.t0 + 0.05 || t >= s.t1 - 0.05 || (s.hitUntil && t > s.hitUntil)) continue;
          if (shotHit(s, t, sp) && B.hurts(s.rule, mv)) return s.name || name;
        }
        return false;
      },
    });
  };
  // how close a shot comes to the soul (centre distance; boxes: gap to the edge)
  B.minDist = (s, dt = 1 / 120) => {
    let m = 1e9;
    for (let t = s.t0 + 0.05; t < s.t1 - 0.05; t += dt) {
      const q = TL.heart.at(t);
      if (q.a < 0.5) continue;
      if (s.seg) { const g = s.seg(t); if (g) m = Math.min(m, segDist(q.x, q.y, g) - (g[4] ?? 3) + 5); continue; }
      const p = s.p(t);
      if (!p) continue;
      m = Math.min(m, s.hw ? Math.max(Math.abs(p[0] - q.x) - s.hw, Math.abs(p[1] - q.y) - s.hh) + 5 : Math.hypot(p[0] - q.x, p[1] - q.y) - (s.hr ?? 5) + 5);
    }
    return m;
  };
  // keep shots out of the soul's way: the first nudge that passes at least pad away, else drop
  B.clear = (shots, pad, nudges = []) => shots.map((s) => {
    if (B.minDist(s) >= pad) return s;
    for (const n of nudges) { const v = n(s); if (v && B.minDist(v) >= pad) return v; }
    return null;
  }).filter(Boolean);
  B.shift = (dx, dy) => (s) => Object.assign({}, s, { p: ((p) => (t) => { const q = p(t); return q && [q[0] + dx, q[1] + dy]; })(s.p) });
  B.delay = (dt) => (s) => Object.assign({}, s, { t0: s.t0 + dt, t1: s.t1 + dt, p: ((p) => (t) => p(t - dt))(s.p) });
  // paths
  B.lin = (t0, p0, v) => (t) => [p0[0] + v[0] * (t - t0), p0[1] + v[1] * (t - t0)];
  B.seg = (t0, t1, a, b, ease = 'lin') => (t) => { const u = MV.EASE[ease](U.clamp((t - t0) / (t1 - t0))); return [U.lerp(a[0], b[0], u), U.lerp(a[1], b[1], u)]; };
  B.arc = (t0, t1, a, b, lift, ease = 'lin') => (t) => {
    const u = MV.EASE[ease](U.clamp((t - t0) / (t1 - t0))), w = 4 * u * (1 - u);
    return [U.lerp(a[0], b[0], u) + (lift[0] || 0) * w, U.lerp(a[1], b[1], u) + (lift[1] || 0) * w];
  };

  // ---------------------------------------------------------------- his fire
  // rain: one fireball per time, falling through the box at x(i), crossing y = o.cross on time
  B.rain = (times, xs, o = {}) => times.map((t, i) => {
    const sp = o.speed ?? 330, y0 = o.y0 ?? 250, y1 = o.y1 ?? 440, cross = o.cross ?? 400;
    const tS = t - (cross - y0) / sp, x = typeof xs === 'function' ? xs(i, t) : xs[i % xs.length], dx = o.drift ?? 0;
    return { t0: tS, t1: tS + (y1 - y0) / sp, hr: o.hr ?? 5, hex: o.hex, rule: o.rule, p: (tt) => [x + dx * (tt - tS), y0 + sp * (tt - tS)] };
  });
  // a ring of n fireballs round c, radius R0 -> R1 (ease), turning; gap: indices left out
  B.ring = (o) => {
    const out = [], n = o.n ?? 24, c = o.c || [BX.cx, BX.cy], gap = new Set(o.gap || []);
    for (let i = 0; i < n; i++) {
      if (gap.has(i)) continue;
      out.push({
        t0: o.t0, t1: o.t1, hr: o.hr ?? 5, hex: o.hex, rule: o.rule,
        p: (t) => {
          const u = U.clamp((t - o.t0) / (o.t1 - o.t0)), Rr = U.lerp(o.R0, o.R1, MV.EASE[o.ease || 'lin'](u));
          const a = (i / n) * U.TAU + (o.a0 || 0) + (o.spin || 0) * (t - o.t0);
          return [c[0] + Math.cos(a) * Rr, c[1] + Math.sin(a) * Rr];
        },
      });
    }
    return out;
  };
  // a block of fire thrown under gravity (px/s²), bouncing once off a floor (y) if given;
  // drawn as the game's fireball, bigger. To land at [x, y] after tau: B.lobTo
  B.lob = (t0, p0, v, o = {}) => {
    const g = o.g ?? 900, yb = o.floor ?? null, e = o.bounce ?? 0.5;
    let tb = null;
    if (yb !== null) { const a = g / 2, b = v[1], c = p0[1] - yb, disc = b * b - 4 * a * c; if (disc >= 0) { const r = (-b + Math.sqrt(disc)) / (2 * a); if (r > 0) tb = r; } }
    const p = (t) => {
      const tau = t - t0;
      if (tb === null || tau <= tb) return [p0[0] + v[0] * tau, p0[1] + v[1] * tau + (g * tau * tau) / 2];
      const vyb = -(v[1] + g * tb) * e, t2 = tau - tb, xb = p0[0] + v[0] * tb;
      const q = [xb + v[0] * 0.75 * t2, yb + vyb * t2 + (g * t2 * t2) / 2];
      // (after it lands it burns out at the box's walls instead of rolling off over the stage)
      if (o.walls && (q[0] < o.walls[0] - 2 || q[0] > o.walls[1] + 2 || q[1] > yb + 2)) return null;
      return q;
    };
    return { t0, t1: t0 + (o.life ?? 1.6), hr: o.hr ?? 7, p, sc: o.sc ?? 1.5, hex: o.hex, rule: o.rule, tLand: tb === null ? null : t0 + tb };
  };
  B.lobTo = (t0, p0, target, tau, o = {}) => {
    const g = o.g ?? 900, vx = (target[0] - p0[0]) / tau, vy = (target[1] - p0[1] - (g * tau * tau) / 2) / tau;
    return B.lob(t0, p0, [vx, vy], Object.assign({ floor: target[1] }, o));
  };
  // the angle of a ring's gap centre at t
  B.gapAngle = (o, t) => (o.a0 || 0) + (((o.gap || [0]).reduce((a, b) => a + b, 0) / (o.gap || [0]).length) / (o.n ?? 24)) * U.TAU + (o.spin || 0) * (t - o.t0);

  // ---------------------------------------------------------------- out of the depth
  // (the climax, the cage open) Things that come at the soul from far down the hall: each one
  // {t0: it appears far off, where the hall meets the door; t1: it reaches the battle plane at
  // `to` [x, y]; from: [x, y] where it starts far off (default the door); img + sc, or draw(ctx,
  // emi, t, p, s, a, it); hr: its hit radius on arrival; stay: how long it lingers there (a
  // glove buried in the floor); rule ('orange' | 'aqua'); safe; through: it flies on past the eye
  // instead}. On its way it is drawn on the plane it is passing - the backdrop, the jars', his,
  // the battle's - so the camera's parallax and the planes' blur (the depth of field) carry it,
  // crossfading between them; it grows as it comes (perspective toward the door). Hits count
  // only on the battle plane.
  const DEEP_Z = 900, DEEP_F = 280, DEEP_PLANES = [['back', -700, 520, 1e9], ['mid', -200, 150, 520], ['king', -50, 52, 150], ['front', 32, -1e9, 52]];
  // (a straight path from the far point to `to`, seen in perspective: it hangs far off, then rushes;
  // it.path: its own way instead - (t, u) -> {p, z (depth behind the battle plane), s (its scale)}:
  // out of a jar on the jars' plane, say, or up from the battle to him)
  const deepPos = (it, t) => {
    if (it.path) { const u = U.clamp((t - it.t0) / (it.t1 - it.t0)); return Object.assign({ u, z: 0, s: 1 }, it.path(t, u)); }
    const u = U.clamp((t - it.t0) / (it.t1 - it.t0)), z = DEEP_Z * (1 - u), s = DEEP_F / (DEEP_F + z), f = it.from || FL.door;
    const x3 = U.lerp(f[0], it.to[0], u), y3 = U.lerp(f[1], it.to[1], u);
    return { u, z, s, p: [FL.door[0] + (x3 - FL.door[0]) * s, FL.door[1] + (y3 - FL.door[1]) * s] };
  };
  B.deepPos = deepPos;
  H.deep = (items, o = {}) => {
    items = items.filter(Boolean);
    if (!items.length) return;
    const t0 = Math.min(...items.map((it) => it.t0)), t1 = Math.max(...items.map((it) => it.t1 + (it.stay ?? 0.12) + (it.through ? 0.25 : 0)));
    const draw = (ctx, emi, t, it, q, a) => {
      if (a <= 0.01) return;
      if (it.draw) it.draw(ctx, emi, t, q.p, q.s, a, it);
      else F.spr(ctx, it.img, q.p[0], q.p[1], { sc: (it.sc ?? 2) * q.s, ax: it.img.width / 2, ay: it.img.height / 2, alpha: a, rot: it.rot || 0 });
    };
    DEEP_PLANES.forEach(([name, z, zLo, zHi]) => TL.add({
      t0, t1, z, keep: o.keep, kind: 'deep', name: 'deep ' + name + (o.name ? ' ' + o.name : ''),
      draw(ctx, emi, t) {
        // (it.trail: a colour - the way it came, a dotted wake back toward the door, on the battle plane)
        if (name === 'front') for (const it of items) {
          if (!it.trail || t < it.t0 + 0.05 || t > it.t1) continue;
          for (let k = 1; k <= 7; k++) { const q = deepPos(it, t - k * 0.035); if (t - k * 0.035 < it.t0) break; D.rect(ctx, q.p[0] - 1, q.p[1] - 1, 2 + q.s * 2, 2 + q.s * 2, it.trail, 0.5 * (1 - k / 8)); }
        }
        for (const it of items) {
          if (t < it.t0 || t > it.t1 + (it.stay ?? 0.12)) continue;
          const q = deepPos(it, Math.min(t, it.t1));
          if (it.through && t > it.t1) continue;
          // (its share of this plane: crossfading over 40 px of depth at each edge)
          const w = U.clamp((q.z - zLo) / 40 + 0.5) * U.clamp((zHi - q.z) / 40 + 0.5);
          const fade = t > it.t1 ? 1 - U.clamp((t - it.t1 - (it.stay ?? 0.12) + 0.1) / 0.1) : U.clamp((t - it.t0) / 0.12);
          draw(ctx, name === 'back' ? null : emi, t, it, q, w * fade);
        }
      },
      hit: name === 'front' ? (t, sp, mv) => {
        for (const it of items) {
          if (it.safe || t < it.t1 - 0.03 || t > it.t1 + (it.hitFor ?? 0.06)) continue;
          if (Math.hypot(it.to[0] - sp[0], it.to[1] - sp[1]) < (it.hr ?? 8) + SR && B.hurts(it.rule, mv)) return it.name || o.name || 'deep';
        }
        return false;
      } : undefined,
    }));
    // past the eye: huge, soft, gone
    if (items.some((it) => it.through)) TL.add({
      t0, t1, z: 48, screen: true, name: 'deep through',
      draw(ctx, emi, t, S) {
        const c = S.cam, z = c.zoom || 1;
        for (const it of items) {
          if (!it.through || t < it.t1 || t > it.t1 + 0.22) continue;
          const v = (t - it.t1) / 0.22, s = 1 + 5 * v * v, x = (it.to[0] - c.x) * z + MV.OW / 2, y = (it.to[1] - c.y) * z + MV.OH / 2;
          const sx = MV.OW / 2 + (x - MV.OW / 2) * (1 + 2.2 * v), sy = MV.OH / 2 + (y - MV.OH / 2) * (1 + 2.2 * v);
          const img = it.img ? F.cached('soft:' + F.id(it.img), () => { const [cc, xx] = MV.canvas(it.img.width + 6, it.img.height + 6); xx.filter = 'blur(1.2px)'; xx.drawImage(it.img, 3, 3); return cc; }) : null;
          if (img) F.spr(ctx, img, sx, sy, { sc: (it.sc ?? 2) * z * s, ax: img.width / 2, ay: img.height / 2, alpha: 0.85 * (1 - v), rot: it.rot || 0 });
        }
      },
    });
  };

  // ---------------------------------------------------------------- the soul and the box
  H.hTo = (t0, t1, x, y, ease = 'inOut') => TL.heart.to(t0, t1, { x, y }, ease);
  // a move the way a player makes it: arriving at tArrive at a steady speed (px/s; the game's
  // soul is not a teleport), from wherever it is
  // (it starts after every move already laid down before tArrive has finished: moves on a Track
  // must not overlap, or the later one wins and the earlier never arrives)
  H.hGo = (tArrive, x, y, speed = 200) => {
    let last = -1e9;
    for (const g of TL.heart.segs) if (g.t1 < tArrive - 1e-4 && g.t1 > last && g.t1 > g.t0 && ('x' in g.vals || 'y' in g.vals)) last = g.t1;
    for (const b of TL.heart.baked || []) if (b.t1 < tArrive - 1e-4 && b.t1 > last) last = b.t1;
    const s = TL.heart.at(Math.max(last, tArrive - 0.6)), d = Math.hypot(x - s.x, y - s.y), dur = Math.max(0.08, d / speed);
    return TL.heart.to(Math.max(tArrive - dur, last), tArrive, { x, y }, 'smooth');
  };
  H.hSet = (t, x, y) => TL.heart.set(t, { x, y });
  // the soul follows a function of time (baked at 120 fps), then stays where it ended
  H.hPath = (t0, t1, fn) => {
    const xs = [], ys = [];
    for (let t = t0; t <= t1 + 1e-6; t += 1 / 120) { const p = fn(t); xs.push(p[0]); ys.push(p[1]); }
    TL.heart.bake(t0, 1 / 120, { x: xs, y: ys });
    TL.heart.set(t0 + (xs.length - 1) / 120, { x: xs[xs.length - 1], y: ys[ys.length - 1] });
    return [xs[xs.length - 1], ys[ys.length - 1]];
  };
  H.boxTo = (t0, t1, v, ease = 'inOut') => TL.box2.to(t0, t1, v, ease);
  H.mode = (t0, t1, key) => { TL.heartMode.set(t0, key).set(t1, 'red'); H.sfx(t0, 'Ding', 0.3); };
  // the soul is hurt at t (only bar 52): the HUD's HP, a blink, the sound
  TL.invulnSpans = [];
  TL.invuln = (t) => TL.invulnSpans.some(([a, b]) => t >= a && t < b);
  // what the game does: the HP falls at once, snd_hurt, the soul blinks while it cannot be hurt
  // again (o.iframes); and here the loss shows: that piece of the HP bar flashes white and burns
  // down to the red, the numbers flash red, a ring is knocked off the soul
  H.hurt = (t, hp, o = {}) => {
    const was = TL.hudT.at(t - 1e-3).hp;
    TL.hudT.set(t, { hp });
    H.sfx(t, o.sfx || 'Hurt', o.vol ?? 0.6);
    const n = Math.max(4, Math.round((o.iframes ?? 0.32) / 0.08));
    for (let i = 0; i < n; i++) TL.heart.set(t + i * 0.08, { a: 0.35 }).set(t + i * 0.08 + 0.04, { a: 1 });
    TL.add({
      t0: t, t1: t + 0.7, z: 39, kind: 'hurt', name: 'hurt',
      draw(ctx, emi, tt) {
        const u = (tt - t) / 0.7, h = TL.hudT.at(tt);
        if (h.a > 0.01 && h.hpA > 0.5 && was > hp) {
          const [bx, by] = FL.hpBar, x0 = bx + hp * 1.2, x1 = bx + Math.min(h.hpMax, was) * 1.2;
          // (white, then burning down to the bar's red from its far end)
          const w = (x1 - x0) * (1 - U.smooth(U.clamp((u - 0.25) / 0.55)));
          if (w > 0.5) D.rect(ctx, x0, by, w, 21, u < 0.12 ? '#ffffff' : '#ffd8c8', h.a);
          if (u < 0.5 && Math.floor(u * 16) % 2 === 0) F.spr(ctx, MV.hudText(`${Math.max(0, Math.round(hp))} / ${h.hpMax}`, '#ff4040'), FL.num, FL.hudY, { sc: 2, alpha: h.a });
          if (emi) D.rect(emi, x0 - 3, by - 3, x1 - x0 + 6, 27, '#ff6040', 0.5 * (1 - u));
        }
        const s = TL.heart.at(tt), k = U.clamp(1 - u / 0.4);
        if (k > 0) {
          ctx.save(); ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(s.x, s.y, 7 + 22 * U.eOut(u / 0.4), 0, U.TAU); ctx.stroke(); ctx.restore();
          for (let i = 0; i < 8; i++) { const a = (i / 8) * U.TAU + 0.3, r = 8 + 30 * U.eOut(u / 0.4); D.rect(ctx, s.x + Math.cos(a) * r - 1, s.y + Math.sin(a) * r - 1, 2, 2, i % 2 ? '#ff3030' : '#ffffff', k); }
        }
      },
    });
  };

  // ---------------------------------------------------------------- the green soul's shield
  // UT's green mode (a ring round the soul, a shield on the side it faces) made a thing you see:
  // a pane of green glass with a bright rim, the green soul and its ring as its emblem - held
  // like the shield of a first-person game (Minecraft): lowered, raised to meet the blow,
  // recoiling and ringing as it blocks. First person: B.shieldFP (src/tl_act4b.js); in the 2D
  // battle the same glass is an arc in front of the soul: B.shieldArc.
  const SHW = 104, SHH = 128;
  const shieldHW = (v) => (SHW / 2) * (v < 0.46 ? 1 : Math.pow(Math.max(0, Math.cos(((v - 0.46) / 0.54) * (Math.PI / 2))), 0.75));
  // its outline in its own px (origin: top left; the top edge arched up in the middle)
  B.shieldPath = (ctx) => {
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) { const u = -1 + k / 10; ctx.lineTo(SHW / 2 + (u * SHW) / 2, 7 * u * u); }
    for (let k = 0; k <= 30; k++) { const v = k / 30; ctx.lineTo(SHW / 2 + shieldHW(v), 7 + v * (SHH - 7)); }
    for (let k = 30; k >= 0; k--) { const v = k / 30; ctx.lineTo(SHW / 2 - shieldHW(v), 7 + v * (SHH - 7)); }
    ctx.closePath();
  };
  // the glass (1 px = 1 sprite px): rim dark outside, bright, a highlight; thicker toward the
  // edges (Fresnel); the ring and the heart; two streaks of glare. rim: the rim alone (its flash)
  const shieldArt = (rimOnly) => F.cached('shieldFP' + (rimOnly ? 'R' : ''), () => {
    const [m, mx] = MV.canvas(SHW, SHH);
    mx.fillStyle = '#fff'; B.shieldPath(mx); mx.fill();
    const md = mx.getImageData(0, 0, SHW, SHH).data, ins = (i, j) => i >= 0 && j >= 0 && i < SHW && j < SHH && md[(j * SHW + i) * 4 + 3] >= 128;
    // distance to the outside (chamfer, two passes)
    const dist = new Float32Array(SHW * SHH);
    for (let j = 0; j < SHH; j++) for (let i = 0; i < SHW; i++) dist[j * SHW + i] = ins(i, j) ? 1e9 : 0;
    const relax = (i, j, di, dj, w) => { const a = i + di, b = j + dj; const d = a < 0 || b < 0 || a >= SHW || b >= SHH ? 0 : dist[b * SHW + a]; if (d + w < dist[j * SHW + i]) dist[j * SHW + i] = d + w; };
    for (let j = 0; j < SHH; j++) for (let i = 0; i < SHW; i++) if (dist[j * SHW + i]) { relax(i, j, -1, 0, 1); relax(i, j, 0, -1, 1); relax(i, j, -1, -1, 1.414); relax(i, j, 1, -1, 1.414); }
    for (let j = SHH - 1; j >= 0; j--) for (let i = SHW - 1; i >= 0; i--) if (dist[j * SHW + i]) { relax(i, j, 1, 0, 1); relax(i, j, 0, 1, 1); relax(i, j, 1, 1, 1.414); relax(i, j, -1, 1, 1.414); }
    const [c, x] = MV.canvas(SHW, SHH), id = x.createImageData(SHW, SHH), d = id.data;
    const put = (p, hex, a) => { const [r, g, b] = F.rgb(hex); d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = Math.round(255 * a); };
    const cx = SHW / 2, cy = SHH * 0.42;
    for (let j = 0; j < SHH; j++) for (let i = 0; i < SHW; i++) {
      const q = j * SHW + i, p = q * 4, e = dist[q];
      if (!e) continue;
      if (e < 1.5) put(p, '#0b4a20', 0.95);
      else if (e < 3.5) put(p, '#5dfc8a', 0.95);
      else if (e < 4.5) put(p, '#d4ffe0', 0.75);
      else if (rimOnly) continue;
      else {
        const r = Math.hypot(i + 0.5 - cx, j + 0.5 - cy), g = (i + j * 0.55) % 64;
        if (Math.abs(r - 25) < 1) put(p, '#8dffaa', 0.6);
        else if ((g > 14 && g < 21) || (g > 26 && g < 28)) put(p, '#eaffef', 0.2);
        else put(p, '#46e870', U.lerp(0.36, 0.14, U.clamp((e - 4.5) / 8)));
      }
    }
    x.putImageData(id, 0, 0);
    if (!rimOnly) { x.globalAlpha = 0.5; x.drawImage(MV.img('heartGreen'), cx - 8, cy - 8); x.globalAlpha = 1; }
    if (rimOnly) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, SHW, SHH); }
    return c;
  });
  B.SHIELD = { W: SHW, H: SHH };
  // the shield before the eye (the overlay, screen px): at (x, y) its middle, sc, rot; flash: the
  // rim white; blocks: [{t, k}] ripples from the middle of the glass (where the blow lands)
  B.shieldFP = (ctx, t, s) => {
    ctx.save();
    ctx.translate(Math.round(s.x), Math.round(s.y)); ctx.rotate(s.rot || 0); ctx.scale(s.sc, s.sc); ctx.translate(-SHW / 2, -SHH * 0.42);
    ctx.globalAlpha = s.a ?? 1;
    ctx.drawImage(shieldArt(false), 0, 0);
    if (s.flash > 0) { ctx.globalAlpha = (s.a ?? 1) * s.flash; ctx.drawImage(shieldArt(true), 0, 0); }
    // where the fire hit: rings running out across the glass, the fire splashing on it and
    // turning to green light
    ctx.save(); B.shieldPath(ctx); ctx.clip();
    for (const hb of s.blocks || []) {
      const u = (t - hb.t) / 0.42;
      if (u < 0 || u > 1) continue;
      const hx = SHW / 2 + (hb.dx || 0), hy = SHH * 0.42 + (hb.dy || 0);
      ctx.globalAlpha = (s.a ?? 1) * (1 - u); ctx.strokeStyle = '#d4ffe0'; ctx.lineWidth = 1.5;
      for (const k of [0, 0.35]) { const r = 4 + (u - k) * 120; if (r > 4) { ctx.beginPath(); ctx.arc(hx, hy, r, 0, U.TAU); ctx.stroke(); } }
      for (let i = 0; i < 18; i++) {
        const a = U.hash(i * 3.7 + hb.t) * U.TAU, r = U.eOut(U.clamp(u * 1.6)) * (16 + 46 * U.hash(i * 1.3 + hb.t)), w = u < 0.3 ? ['#fff1b0', '#ffb040', '#ff7a1e'][i % 3] : ['#8dffaa', '#46e870', '#d4ffe0'][i % 3];
        ctx.globalAlpha = (s.a ?? 1) * (1 - u); ctx.fillStyle = w; ctx.fillRect(Math.round(hx + Math.cos(a) * r), Math.round(hy + Math.sin(a) * r * 0.9), 2, 2);
      }
    }
    ctx.restore();
    ctx.restore();
    ctx.globalAlpha = 1;
  };
  // the 2D shield: UT's faint ring round the soul, and an arc of the green glass on the side it
  // faces (ang: rad), recoil px pushed in, flash white
  B.shieldArc = (ctx, emi, x, y, ang, o = {}) => {
    const k = o.k ?? 1, rc = o.recoil || 0, r0 = 19 - rc, r1 = 27 - rc, hw = 0.82;
    ctx.globalAlpha = 0.35 * k; ctx.strokeStyle = HEX.green; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, 16, 0, U.TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r1, ang - hw, ang + hw); ctx.arc(x, y, r0, ang + hw, ang - hw, true); ctx.closePath();
    ctx.globalAlpha = 0.3 * k; ctx.fillStyle = '#46e870'; ctx.fill();
    if (o.flash > 0) { ctx.globalAlpha = 0.75 * o.flash * k; ctx.fillStyle = '#eaffef'; ctx.fill(); }
    ctx.globalAlpha = k; ctx.strokeStyle = o.flash > 0.5 ? '#ffffff' : '#7dffa0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r1, ang - hw, ang + hw); ctx.stroke();
    ctx.globalAlpha = 0.8 * k; ctx.strokeStyle = '#1f8a40'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r0, ang - hw, ang + hw); ctx.stroke();
    ctx.globalAlpha = 1;
    if (emi) F.glowAt(emi, x + Math.cos(ang) * 23, y + Math.sin(ang) * 23, 14 + 12 * (o.flash || 0), HEX.green, (0.25 + 0.4 * (o.flash || 0)) * k);
  };

  // ---------------------------------------------------------------- your turn: the UI
  const MENU = FL.menu;
  B.menuRect = () => ({ cx: MENU.cx, cy: MENU.cy, w: MENU.w, h: MENU.h });
  // the box widens into the text box; at tBack it closes into a battle box (v)
  H.textBox = (t0, tBack, v = B.home, o = {}) => {
    H.boxTo(t0, t0 + (o.dur ?? 0.22), B.menuRect(), o.ease || 'out');
    H.sfx(t0, 'SwipeShort', 0.2);
    if (tBack !== null && tBack !== undefined) H.boxTo(tBack, tBack + (o.backDur ?? 0.25), v, 'inOut');
  };
  // the soul on button i from t0 (highlighted) until t1
  H.onButton = (i, t0, t1) => {
    // (the menu's cursor: it is simply there, as in the game)
    const [x, y] = MV.btnPos(i, t0);
    TL.heart.set(t0, { x: x + 16, y: y + 21 });
    TL.btn[i].set(t0, { sel: 1 }).set(t1, { sel: 0 });
  };
  // the text box's top-left text anchor (follows the box)
  B.boxAnchor = (dx = 0, dy = 0) => (t) => { const b = MV.box2At(t); return [b.x + 26 + dx, b.y + 20 + dy]; };
  // a list in the text box (the game's two columns: ACT, ITEM); items: [[col, row, label]],
  // the soul beside item `pick` from tPick, selected at tSel
  H.list = (t0, t1, items, o = {}) => {
    const pos = (col, row) => { const b = MV.box2At(t0 + 0.3); return [b.x + 60 + col * 290, b.y + 20 + row * 32]; };
    return TL.add({
      t0, t1, z: 30, kind: 'text',
      ov(ctx, t) {
        const b = MV.box2At(t), ox = b.x + 60, oy = b.y + 20;
        items.forEach(([col, row, label]) => D.text(ctx, label, ox + col * 290, oy + row * 32));
        const sel = o.tPick && t >= o.tPick ? o.pick : o.from ?? 0, [c, r] = items[sel] || items[0];
        if (!(o.tSel && t >= o.tSel + 0.12)) ctx.drawImage(MV.img('heartRed'), R(ox + c * 290 - 30), R(oy + r * 32 + 8), 16, 16);
      },
    });
  };
  // lines typed in the text box: [[t0, t1, text | [line, line]], ...]
  H.lines = (list, o = {}) => list.forEach(([a, b, s]) => H.say(a, b, s, Object.assign({ anchor: B.boxAnchor(), voice: 'Txt1', vol: 0.26, step: o.step ?? 0.04 }, o)));
  // the FIGHT target line: "* 艾斯戈尔" and his HP bar (TL.foe), with the six soul pips after it
  TL.foe = new MV.Track({ hp: 1, max: 1, pips: 0, pipK: 1 });
  // pips: a bitmask of the souls still lending him power (bit i: MV.SOULS[i])
  TL.foePips = new MV.Steps(63);
  H.target = (t0, t1, o = {}) => TL.add({
    t0, t1, z: 30, kind: 'text',
    ov(ctx, t) {
      const b = MV.box2At(t), x = b.x + 26, y = b.y + 20, f = TL.foe.at(t);
      const a = U.clamp((t1 - t) / 0.08) * (o.alpha ? o.alpha(t) : 1);
      if (a <= 0) return;
      // (as the game lists him when you choose 战斗: the soul as the cursor before the line)
      F.spr(ctx, MV.img('heartRed'), x - 26, y + 8, { sc: 1, ax: 8, ay: 8, alpha: a });
      D.text(ctx, '*', x, y, { alpha: a });
      D.text(ctx, '艾斯戈尔', x + 32, y, { alpha: a, color: o.hiName && o.hiName(t) ? MV.COL.uiHi : undefined });
      // the game's bar, split: green for what is left of him, red for what is gone (o.fill: the
      // green running in over the red as it is first shown)
      const bx = x + 220, by = y + 6, bw = 120;
      D.rect(ctx, bx, by, bw, 20, '#ff0000', a);
      const k = U.clamp(f.hp / f.max) * (o.fill ? o.fill(t) : 1);
      if (k > 0) D.rect(ctx, bx, by, Math.max(1, bw * k), 20, '#00ff00', a);
      if (f.pips > 0.001) {
        const mask = TL.foePips.at(t);
        MV.SOULS.forEach((key, i) => {
          const on = (mask >> i) & 1, img = F.tint(MV.img('heartSmall'), on ? HEX[key] : '#34303c');
          F.spr(ctx, img, bx + bw + 16 + i * 22, by + 1, { sc: 2, alpha: a * U.clamp(f.pips * 6 - i) });
        });
      }
    },
  });
  // the attack bar (the game's FIGHT target in the text box) with n cursors, each pressed at
  // presses[i] (they slide in from the right, staggered, and stop on the centre line)
  H.attackBar = (t0, t1, presses, o = {}) => {
    const n = presses.length, SP = o.speed ?? 700;
    presses.forEach((tp) => { H.sfx(tp, 'PlayerFight', 0.45); });
    return TL.add({
      t0, t1, z: 31, kind: 'text',
      ov(ctx, t) {
        const b = MV.box2At(t), img = MV.frame('Target', 'Default', 0);
        const a = U.clamp((t - t0) / 0.08) * U.clamp((t1 - t) / 0.12);
        const tx = b.cx - img.width / 2, ty = b.cy - img.height / 2;
        ctx.globalAlpha = a; ctx.drawImage(img, R(tx), R(ty)); ctx.globalAlpha = 1;
        presses.forEach((tp, i) => {
          // cursor i reaches the centre at tp; before that it slides from the right
          const x = t < tp ? b.cx + (tp - t) * SP : b.cx;
          if (x > b.x + b.w - 4) return;
          const hit = t >= tp, blink = hit && Math.floor((t - tp) * 12) % 2;
          const cur = MV.frame('TargetChoice', 'Default', blink ? 1 : 0);
          ctx.globalAlpha = a * (hit ? U.clamp(1 - (t - tp - 0.35) / 0.2) : 1);
          ctx.drawImage(cur, R(x - 7), R(b.cy - 64));
          ctx.globalAlpha = 1;
        });
      },
    });
  };
  // (a blow landing on him and its damage: src/blow.js H.blow, H.readout)

  // ---------------------------------------------------------------- his tells
  // the eye flash: the sheet's own sparkle frames on both eyes, in a colour
  H.eyes = (t, hex, dur = 0.45, o = {}) => {
    if ((o.vol ?? 0.4) > 0) H.sfx(t, 'EyeFlash', o.vol ?? 0.4);
    return TL.add({
      t0: t, t1: t + dur, z: -50, keep: true,
      draw(ctx, emi, tt) {
        const k = U.clamp((tt - t) / dur), f = Math.min(9, Math.floor(k * 10));
        const img = F.tint(MV.img('eye' + f), hex);
        for (const [x, y] of MV.kingEyes(tt).filter((p, i) => o.eye === undefined || i === o.eye)) {
          F.spr(ctx, img, x, y, { sc: o.sc ?? 2, ax: img.width / 2, ay: img.height / 2 });
          if (emi) F.glowAt(emi, x, y, 16, hex, 0.5 * (1 - k));
        }
      },
    });
  };
  // before his slashes the game turns him to his white-outlined silhouette with a white flash
  // that sinks through grey to black (~0.4 s, snd_noise), then his eyes flash the colours to
  // come, in order (silently in the game). Here each colour has a pitch (B.TONE: the eye-flash
  // sound higher for orange, lower for light blue), and each slash rings its colour's pitch again
  // under the cut - the order is heard as well as seen (README 脑暴 ②); a low drone under the
  // whole omen. H.omen(t0, flashes [[t, 'orange' | 'aqua']], tEnd)
  B.TONE = { orange: 1.25, aqua: 0.8 };
  B.tone = (t, rule, vol = 0.42) => { if (B.TONE[rule]) H.sfx(t, 'EyeFlash', vol, { rate: B.TONE[rule] }); };
  H.omen = (t0, flashes, tEnd, o = {}) => {
    H.poseSet(t0, 'idle');
    TL.kingFace.set(t0, null);
    TL.bossPose.set(t0, 'f:flashSil');
    if (tEnd) TL.bossPose.set(tEnd, 'idle');
    TL.impact(t0, { amp: 0, flash: 0.92, flashCol: [1, 1, 1], flashDecay: 6.5, dur: 0.5 });
    H.sfx(t0, 'Noise', o.vol ?? 0.5);
    if (o.drone !== false) H.sfx(t0 + 0.02, 'Drone', o.droneVol ?? 0.14);
    // (one eye at a time, as the game: left, right, left... - the colour only says what comes)
    flashes.forEach(([t, rule], i) => { H.eyes(t, B.RULE[rule], 0.4, { vol: 0, sc: o.eyeSc ?? 2, eye: i % 2 }); if (o.tones !== false) B.tone(t, rule, o.toneVol ?? 0.42); });
  };
  // the game's red "!" in a red-outlined lane of the box (where his fire is about to flood in). o.alt:
  // as the game does it (the recording, ~128-133 s), the lane and its "!" turn yellow and back by
  // turns - the sheet's own yellow "!"; o.at: the "!" this far down the lane (default 12 px), o.dx
  // this far off the lane's middle (the game's sits toward the box's wall)
  H.warn = (t0, t1, rect, o = {}) => {
    H.sfx(t0, 'Warning', o.vol ?? 0.35);
    return TL.add({
      t0, t1, z: 5, clip: 'box',
      draw(ctx, emi, t) {
        const on = Math.floor((t - t0) * 10) % 2 === 0 ? 1 : 0.6, r = typeof rect === 'function' ? rect(t) : rect;
        const yel = o.alt && Math.floor((t - t0) * 5) % 2 === 1, col = yel ? '#fff27a' : '#ff2a2a';
        ctx.globalAlpha = o.alt ? 1 : on; ctx.strokeStyle = col; ctx.lineWidth = 3;
        ctx.strokeRect(R(r[0]) + 1.5, R(r[1]) + 1.5, R(r[2]) - 3, R(r[3]) - 3); ctx.globalAlpha = 1;
        const img = MV.img(yel ? 'warnYellow' : 'warnRed');
        F.spr(ctx, img, r[0] + r[2] / 2 + (o.dx ?? 0), r[1] + (o.at ?? 12), { sc: o.sc ?? 1, ax: 12, ay: 0, alpha: o.alt ? 1 : on });
      },
    });
  };

  // ---------------------------------------------------------------- the trident's slash
  // As the game does it (the recording at 30 fps, asset/asgore-fight-record*.mp4 ~144-146 s):
  //   wind-up   his attack frames swipe0..4, the trident streak (swipeSpear0..4) in the slash's
  //             colour in front of him, ~0.43 s;
  //   strike    2 frames: the huge U crescent (swipeSpear5, the sheet's 196 x 220 at 2x, in the
  //             colour) round him, his swipe5 (him in the white of the U) in front of it - it
  //             covers the whole box;
  //   follow    2 frames: the crescent with its bubbles (swipeSpear6) behind swipe6.
  // The other direction is the mirror image (dir -1). Every overlay shares the frames' anchor.
  // orange hurts a soul that stands still, light blue (aqua) one that moves; white: avoid it.
  const SWIPE_ANCHOR = [89.5, 128];
  for (let i = 0; i < 7; i++) MV.FRAME_ANCHOR['swipe' + i] = SWIPE_ANCHOR;
  MV.FRAME_ANCHOR.kneel = [92, 95];
  // (hex 'rainbow': the seven colours in bands round the crescent's hollow - violet inside, his red
  // at the rim - as the borrowed powers stand on the trident at the climax's end)
  const SPECTRUM7 = () => ['purple', 'blue', 'aqua', 'green', 'yellow', 'orange'].map((k) => F.rgb(HEX[k])).concat([F.rgb('#ff3a2a')]);
  const swipeImg = (i, hex) => F.cached(`swipeO:${i}:${hex}`, () => {
    if (hex !== 'rainbow') return F.recolor(`swipeO${i}${hex}`, MV.img('swipeSpear' + i), (r) => (r > 128 ? [...F.rgb(hex), 255] : null));
    const S = SPECTRUM7();
    return F.recolor(`swipeO${i}rainbow`, MV.img('swipeSpear' + i), (r, g, b, a, x, y) => {
      if (r <= 128) return null;
      const d = U.clamp((Math.hypot(x - 98, (y - 66) * 0.9) - 46) / 120) * (S.length - 1), k = Math.min(S.length - 2, Math.floor(d)), f = U.clamp(d - k);
      return [0, 1, 2].map((c) => R(S[k][c] + (S[k + 1][c] - S[k][c]) * f)).concat([255]);
    });
  });
  const swipeMask = (i) => F.cached('swipeM:' + i, () => {
    const im = MV.img('swipeSpear' + i), [c, x] = MV.canvas(im.width, im.height);
    x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, im.width, im.height).data, m = new Uint8Array(im.width * im.height);
    for (let k = 0; k < m.length; k++) m[k] = d[k * 4 + 3] > 0 && d[k * 4] > 128 ? 1 : 0;
    return { w: im.width, h: im.height, m };
  });
  TL.swipeFx = []; // [{t0, t1, hex}] the colour of the overlays on the attack frames
  // (src/stage.js asks for the overlay of attack frame i at t: {img, behind})
  MV.swipeOverlay = (t, i) => {
    let hex = null;
    for (const f of TL.swipeFx) if (t >= f.t0 && t < f.t1) hex = f.hex;
    if (!hex) return null;
    return { img: swipeImg(i, hex), behind: i >= 5 };
  };
  const F30 = 1 / 30;
  H.slash = (o) => {
    const t = o.t, dir = o.dir ?? 1, wind = o.wind ?? 0.43, hold = o.hold ?? 2 * F30, follow = o.follow ?? 2 * F30;
    const hex = o.rule ? B.RULE[o.rule] : o.hex || '#f2eef8';
    const tEnd = t + hold + follow;
    for (let i = 0; i < 5; i++) TL.bossPose.set(t - wind + (i / 5) * wind, 'f:swipe' + i);
    TL.bossPose.set(t, 'f:swipe5').set(t + hold, 'f:swipe6').set(tEnd, o.after || 'idle');
    TL.kingFlip.set(t - wind, dir < 0).set(tEnd, false);
    TL.swipeFx.push({ t0: t - wind, t1: tEnd, hex });
    // the game's sound for it (matched on the recording's audio): the cinematic cut, on the U,
    // with a low impact under it; and its weight: the picture shakes and punches in, a flash of
    // its colour, the box's frame jolts
    H.sfx(t, 'CineCut', o.vol ?? 0.6);
    H.sfx(t, 'Impact', 0.3);
    // (the omen's pitch for its colour again, under the cut: what the eyes said, the blade does)
    if (o.tone !== false) B.tone(t, o.rule, o.toneVol ?? 0.22);
    const fc = hex === 'rainbow' ? [1, 1, 1] : F.rgb(hex).map((v) => v / 255);
    TL.impact(t, { amp: o.amp ?? 10, zoom: 0.06, flash: 0.22, flashCol: fc, flashDecay: 16, dur: 0.38 });
    TL.box2.to(t, t + 0.02, { th: 10 }, 'out').to(t + 0.05, t + 0.22, { th: 5 }, 'inOut');
    // inside the box the crescent covers its black (only the frame and the soul stay on top)
    TL.add({
      t0: t, t1: tEnd, z: 6, clip: 'box', keep: true,
      draw(ctx, emi, tt) {
        const K = TL.king.at(tt), body = MV.kingXf(tt, K).body, img = swipeImg(tt < t + hold ? 5 : 6, hex);
        F.spr(ctx, img, K.x + body[4], K.y + body[5], { sc: 2, ax: SWIPE_ANCHOR[0], ay: SWIPE_ANCHOR[1], flip: dir < 0 });
      },
    });
    const name = 'slash ' + (o.rule || 'white');
    return TL.add({
      t0: t, t1: tEnd, z: 12, name,
      // (drawn by the king's layer with the frames; this event only carries the hit)
      hit(tt, sp, mv) {
        if (!B.hurts(o.rule, mv)) return false;
        const M = swipeMask(tt < t + hold ? 5 : 6), K = TL.king.at(tt), body = MV.kingXf(tt, K).body;
        const X = K.x + body[4], Y = K.y + body[5];
        for (const [dx, dy] of [[0, 0], [SR, 0], [-SR, 0], [0, SR], [0, -SR]]) {
          let u = (sp[0] + dx - X) / 2, v = (sp[1] + dy - Y) / 2;
          u = (dir < 0 ? -u : u) + SWIPE_ANCHOR[0]; v += SWIPE_ANCHOR[1];
          const iu = Math.floor(u), iv = Math.floor(v);
          if (iu >= 0 && iv >= 0 && iu < M.w && iv < M.h && M.m[iv * M.w + iu]) return name;
        }
        return false;
      },
    });
  };

  // ---------------------------------------------------------------- the fire hands
  // a hand of fire (the sheet's hand frames, white) sweeping a path, a trail of fireballs
  // left where it passed; o: {t0, t1, path: t -> [x, y], sc, flip, frame, trail: [times]}
  H.hand = (o) => TL.add({
    t0: o.t0, t1: o.t1, z: o.z ?? 20, clip: o.clip ?? null,
    draw(ctx, emi, t) {
      const p = o.path(t), f = o.frame ?? Math.floor(t * 8) % 3, img = MV.img('hand' + f);
      const k = U.clamp((t - o.t0) / 0.15) * U.clamp((o.t1 - t) / 0.2);
      F.spr(ctx, img, p[0], p[1], { sc: o.sc ?? 2, ax: img.width / 2, ay: img.height / 2, flip: o.flip, rot: o.rot ? o.rot(t) : 0, alpha: k });
      if (emi) F.glowAt(emi, p[0], p[1], 40 * (o.sc ?? 2) / 2, '#ffe6c8', 0.14 * k);
    },
    hit: o.hit ? (t, sp, mv) => {
      const p = o.path(t), r = o.hit;
      return Math.abs(p[0] - sp[0]) < r[0] + SR && Math.abs(p[1] - sp[1]) < r[1] + SR ? 'hand' : false;
    } : undefined,
  });

  // ---------------------------------------------------------------- borrowing a soul
  // The soul stays in its container; a ribbon of its colour runs from the jar to his trident
  // while he uses its power. tOn: it reaches the trident; tOff: it lets go (o.brush: before it
  // goes it slides down the shaft over his hand - true, or how long it takes). The jar glows, the
  // trident takes the colour.
  B.jarSoul = (key, t) => { const [x, y] = MV.jarAt(key, t); return [x, y - 30]; };
  B.shaft = (t, f) => MV.spearTip(t, f);
  H.ribbon = (key, tOn, tOff, o = {}) => {
    const hex = HEX[key], grow = o.grow ?? 0.35, fall = o.fall ?? 0.4, brush = o.brush ? (o.brush === true ? 0.45 : o.brush) : 0;
    TL.jar[key].to(tOn - grow, tOn, { glow: 1.6 }, 'out').to(tOff + brush, tOff + brush + 0.5, { glow: o.glowAfter ?? 0.3 }, 'inOut');
    if (o.tint !== false) TL.tridentCol.set(o.tintAt ?? tOn, hex).set(tOff + brush, null);
    H.sfx(tOn - grow, 'Sparkle', 0.3); H.sfx(tOn, 'Spellcast', 0.22);
    H.sfx(tOff + brush, o.brush ? 'Chime' : 'Bell', o.brush ? 0.35 : 0.15);
    const end = (t, S) => {
      // o.hand: it runs into his hand (held out to the jar, then back on the shaft)
      if (o.hand) return MV.handAt(t, o.hand);
      // where the ribbon meets the trident (a little below the points), or his hand (brush)
      const onShaft = B.shaft(t, o.at ?? 0.7);
      // o.retarget {t, dur, to: (t, S) -> [x, y] on his plane}: it tears off the trident and whips
      // over to another end (the soul, src/tl_act4e.js), overshooting a little
      if (o.retarget && t >= o.retarget.t) {
        const r = o.retarget, u = U.eOutBack(U.clamp((t - r.t) / (r.dur ?? 0.2))), p = r.to(t, S);
        return [U.lerp(onShaft[0], p[0], u), U.lerp(onShaft[1], p[1], u)];
      }
      if (!brush || t < tOff) return onShaft;
      const hand = MV.fistAt(t, 'fistL'), u = U.eInOut(U.clamp((t - tOff) / brush));
      return [U.lerp(onShaft[0], hand[0], u), U.lerp(onShaft[1], hand[1], u)];
    };
    return TL.add({
      t0: tOn - grow, t1: tOff + brush + fall, z: o.z ?? -60, keep: true,
      draw(ctx, emi, t, S) {
        // (drawn on his plane; its jar end where the jar is seen from the camera - the jars stand
        // deeper, src/depth.js)
        const a0 = B.jarSoul(key, t), a = S && o.z === undefined ? MV.depthPt(S, a0, MV.PLANE_Z.mid, MV.PLANE_Z.king) : a0, b = end(t, S);
        const g = U.clamp((t - (tOn - grow)) / grow), cut = U.clamp((t - tOff - brush) / fall);
        const N = 40, mid = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 40 - (o.lift ?? 30)];
        const pt = (u) => {
          const x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * mid[0] + u * u * b[0];
          const y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * mid[1] + u * u * b[1];
          const wv = Math.sin(u * 9 - t * 7 + (o.seed || 0)) * 4 * Math.sin(u * Math.PI);
          return [x, y + wv];
        };
        // (torn off the trident to another end: for a moment it burns - wider, white through it - so the
        // change of hands is seen)
        const sw = o.retarget && t >= o.retarget.t ? Math.max(0, 1 - (t - o.retarget.t) / 0.45) : 0;
        for (let i = 0; i < N; i++) {
          const u = i / N;
          if (u > g) break;
          // letting go: it breaks up from the trident's end back to the jar, pieces drifting
          let al = 1, dy = 0;
          if (cut > 0) { const c = U.clamp(cut * 1.6 - (1 - u) * 0.6); al = 1 - c; dy = -c * 22 * (0.5 + U.hash(i * 3.3)); }
          if (al <= 0.02) continue;
          const [x, y] = pt(u), w = Math.max(1, (2 + Math.sin(u * Math.PI) * 2) * (o.width ?? 1) * (1 + 1.6 * sw));
          ctx.fillStyle = sw > 0.35 && i % 2 ? '#ffffff' : hex;
          ctx.globalAlpha = Math.min(1, al * (0.55 + 0.45 * Math.sin(u * 30 - t * 14) ** 2 + sw));
          ctx.fillRect(R(x - w / 2), R(y - w / 2 + dy), R(w), R(w));
          if (emi && i % 3 === 0) { emi.globalAlpha = (0.22 + 0.4 * sw) * al; emi.fillStyle = hex; emi.fillRect(x - 5, y - 5 + dy, 10, 10); emi.globalAlpha = 1; }
        }
        ctx.globalAlpha = 1;
      },
    });
  };
  // where a fist of his is (world px, its middle; it follows the posed arms)
  MV.fistAt = (t, k = 'fistL') => {
    const K = TL.king.at(t), p = MV.BOSS_PARTS[k], bob = Math.round(Math.sin(t * 1.9) * (K.breathe ?? 1) * 0.8);
    return MV.M2.ap(MV.kingXf(t, K).grip, [K.x + (p.x - 79.5) * 2 + 20, K.y + (p.y - 118) * 2 + 18 + bob]);
  };
  // a hand of his let go of the trident and held out toward target (world px) by tOut, back on
  // the shaft from tBack; o.cup: the time the open paw closes round what it was given
  H.reachOut = (side, tOut, tBack, target, o = {}) => {
    const od = o.outDur ?? 0.2, bd = o.backDur ?? 0.16;
    TL.reach.set(tOut - od - 0.005, { [side + 'x']: target[0], [side + 'y']: target[1], ['cup' + side]: 0 });
    TL.reach.to(tOut - od, tOut, { [side]: 1 }, o.ease || 'out');
    if (o.cup != null) TL.reach.set(o.cup, { ['cup' + side]: 1 });
    TL.reach.to(tBack, tBack + bd, { [side]: 0 }, 'inOut');
    TL.reach.set(tBack + bd + 0.005, { ['cup' + side]: 0 });
  };
  // ---------------------------------------------------------------- the absent child
  // While a soul lends him its power, what its human left behind stands beside the box at a
  // child's height, worn by no one (the game's own items: the hat over the gun, the apron, the
  // glasses over the notebook...). items: [{img, x, y, sc, rot, flip, fn: t -> {dx, dy, rot, a,
  // sc, flip, hide}}]; they gather out of motes of the soul's colour from its jar, and go back to
  // it as motes. They keep their colour in the old photograph / the grey (keep).
  H.absent = (key, t0, t1, items, o = {}) => {
    const hex = HEX[key], IN = o.fadeIn ?? 0.3, OUT = o.fadeOut ?? 0.55;
    return TL.add({
      t0, t1: t1 + OUT, z: o.z ?? 3, keep: true, kind: 'absent',
      draw(ctx, emi, t) {
        const kin = U.clamp((t - t0) / IN), kout = 1 - U.clamp((t - t1) / OUT), jar = B.jarSoul(key, t);
        // (o.flare: t -> 0..1, it blazes up: while its child strikes)
        const fl = o.flare ? U.clamp(o.flare(t), 0, 1.5) : 0;
        // o.stand: {x, y (the feet), h} - a faint column of its colour where a child would stand
        if (o.stand) {
          const s = o.stand, [r, g, b] = F.rgb(hex), k = kin * kout * (1 + 2.6 * fl);
          const gr = ctx.createLinearGradient(0, s.y, 0, s.y - s.h);
          gr.addColorStop(0, `rgba(${r},${g},${b},${Math.min(0.6, 0.16 * k)})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = gr; ctx.fillRect(R(s.x - (s.w ?? 44) / 2), R(s.y - s.h), s.w ?? 44, s.h);
          ctx.globalAlpha = 0.35 * k; ctx.fillStyle = hex;
          ctx.fillRect(R(s.x - (s.w ?? 44) / 2) + 4, R(s.y) - 2, (s.w ?? 44) - 8, 2);
          ctx.globalAlpha = 1;
        }
        items.forEach((it, i) => {
          const f = it.fn ? it.fn(t) || {} : {};
          const x = it.x + (f.dx || 0), y = it.y + (f.dy || 0) + Math.sin(t * 2.2 + i * 1.3) * 1.5;
          const a = o.handoff && t > t1 ? 0 : kin * kout * (f.a ?? 1);
          if (a > 0.01 && !f.hide) {
            // (f.rot replaces its resting tilt when given as an absolute turn: f.abs)
            F.spr(ctx, it.img, x, y, { sc: (it.sc ?? 3) * (f.sc ?? 1), ax: it.ax ?? it.img.width / 2, ay: it.ay ?? it.img.height / 2, rot: it.fn && it.absRot ? f.rot || 0 : (it.rot || 0) + (f.rot || 0), flip: f.flip ?? it.flip, alpha: a * (o.alpha ?? 0.94) });
            if (emi) F.glowAt(emi, x, y, 26 + 22 * fl, hex, (0.18 + 0.45 * fl) * a);
          }
          // motes: in from the jar as they appear, back to it as they go
          for (let m = 0; m < 7; m++) {
            const h = U.hash(i * 13.1 + m * 3.7 + t0), h2 = U.hash(i * 7.3 + m * 5.1 + t0);
            let u = -1, from, to;
            if (kin < 1) { u = U.clamp(kin * 1.5 - h * 0.5); from = jar; to = [x, y]; }
            // (o.handoff: at t1 something else takes them over - no motes back to the jar)
            else if (t > t1 && !o.handoff) { u = U.clamp(((t - t1) / OUT) * 1.4 - h * 0.4); from = [x, y]; to = jar; }
            if (u <= 0 || u >= 1) continue;
            const e = U.eInOut(u), sw = Math.sin(u * Math.PI) * (20 + 30 * h2) * (m % 2 ? 1 : -1);
            const px = U.lerp(from[0], to[0], e) + sw * 0.4, py = U.lerp(from[1], to[1], e) - Math.sin(u * Math.PI) * 30 + sw * 0.2;
            D.rect(ctx, px - 1, py - 1, 2, 2, hex, 0.9 * Math.sin(u * Math.PI));
            if (emi) D.rect(emi, px - 3, py - 3, 6, 6, hex, 0.3 * Math.sin(u * Math.PI));
          }
        });
      },
    });
  };

  // ---------------------------------------------------------------- his acting
  // poses of the puppet (src/stage.js TL.pose): every channel not named goes back to rest
  const REST = { bx: 0, by: 0, crouch: 0, lean: 0, grot: 0, gx: 0, gy: 0, trem: 0, hx: 0, hy: 0, htilt: 0, flare: 0, sway: 0 };
  B.POSE = {
    idle: {},
    raise: { grot: 0.42, gy: -10, by: -4, crouch: -2, flare: 0.35 },
    high: { grot: 0.95, gy: -26, by: -8, crouch: -4, flare: 0.65, hy: -2 },
    slam: { grot: -0.24, gy: 9, by: 6, crouch: 7, flare: -0.15 },
    thrust: { grot: -0.36, gx: 18, gy: 16, by: 5, crouch: 6, lean: 0.05, flare: 0.5, sway: 0.5 },
    brace: { crouch: 5, flare: 0.8, lean: -0.03, gy: 3 },
    droop: { grot: -0.2, gy: 7, by: 2, crouch: 4, hy: 4 },
    bow: { grot: -0.22, gy: 9, by: 4, crouch: 6, hy: 8 },
  };
  H.pose = (t0, t1, pose, ease = 'inOut', extra = {}) => TL.pose.to(t0, t1, Object.assign({}, REST, typeof pose === 'string' ? B.POSE[pose] : pose, extra), ease);
  H.poseSet = (t, pose, extra = {}) => TL.pose.set(t, Object.assign({}, REST, typeof pose === 'string' ? B.POSE[pose] : pose, extra));
  // an attack performed: wind up (ease in to the pose before the accent), strike on the accent,
  // hold, then come back (the 'after' pose; by default a small droop: the man under the king)
  H.act = (tAcc, wind, strike, o = {}) => {
    H.pose(tAcc - (o.windDur ?? 0.3), tAcc - 0.02, wind, 'out');
    H.pose(tAcc - 0.02, tAcc + (o.hitDur ?? 0.08), strike, 'outExpo');
    if (o.after !== null) H.pose(tAcc + (o.hold ?? 0.35), tAcc + (o.hold ?? 0.35) + (o.backDur ?? 0.45), o.after || 'droop', 'inOut');
  };
  // fire gathering on the trident's points before an attack, flung at t1
  H.tipFire = (t0, t1, o = {}) => TL.add({
    t0, t1: t1 + 0.12, z: -45,
    draw(ctx, emi, t) {
      const p = MV.spearTip(t, 0.93), u = U.clamp((t - t0) / (t1 - t0)), n = o.n ?? 7;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * U.TAU + t * 6, r = U.lerp(34, 9, U.eIn(u)) * (t > t1 ? 1 + (t - t1) * 20 : 1);
        B.fire(ctx, emi, p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r * 0.8, t, i, { hex: o.hex, a: U.clamp(u * 3) * (t > t1 ? 1 - (t - t1) / 0.12 : 1) });
      }
      if (emi) F.glowAt(emi, p[0], p[1], 30, o.hex || '#ffe0c0', 0.35 * u);
    },
  });
  // the walls' light (TL.wave2): flowing into the door at a steady rate (periods per bar), and
  // pushed in by the accents ([t, amount]); one call per stretch, in time order
  H.waveScore = (t0, t1, perBar, kicks = []) => {
    let u = TL.wave2.at(t0).u, t = t0;
    const ks = kicks.filter(([tk]) => tk >= t0 && tk < t1).sort((a, b) => a[0] - b[0]);
    for (const [tk, amt] of ks) {
      if (tk > t) { u += (perBar * (tk - t)) / T.bar; TL.wave2.to(t, tk, { u }, 'lin'); }
      const d = 0.3;
      u += amt + (perBar * d) / T.bar; TL.wave2.to(tk, tk + d, { u }, 'out'); t = tk + d;
    }
    if (t < t1) { u += (perBar * (t1 - t)) / T.bar; TL.wave2.to(t, t1, { u }, 'lin'); }
  };
  // the walls take a soul's colour (k) from t0 over dur
  H.wallTint = (t0, dur, key, k = 0.55) => {
    if (key) { const [r, g, b] = F.rgb(HEX[key]).map((v) => v / 255); TL.look2.set(t0, { tr: r, tg: g, tb: b }); }
    TL.look2.to(t0, t0 + dur, { tk: key ? k : 0 }, 'inOut');
  };

  // ---------------------------------------------------------------- the camera's cutaways
  // a close-up insert on the screen layer: black, then fn(ctx, t, u) draws (u: 0..1 through it)
  H.insert = (t0, t1, fn, o = {}) => TL.add({
    t0, t1, z: o.z ?? 60, screen: true,
    draw(ctx, emi, t, S) {
      if (o.bg !== false) D.rect(ctx, 0, 0, MV.OW, MV.OH, o.bg || '#000000');
      fn(ctx, t, U.clamp((t - t0) / (t1 - t0)), S);
    },
  });
  // a sprite centred on the screen at an integer scale
  B.big = (ctx, img, x, y, sc, o = {}) => F.spr(ctx, img, x, y, Object.assign({ sc, ax: img.width / 2, ay: img.height / 2 }, o));
  // the gun's lens (yellow): not a mask over the picture but a rifle scope's lens IN it - a brass
  // ring with cross hairs, the setting sun glinting on its rim, the battle (and the planes behind)
  // magnified inside in the sprites' own big pixels, a dashed line of sight running back to the
  // gun that looks through it. Each lock (Dead Eye laying a mark) a flash of its rim.
  // The camera must be level while it is up (it maps the battle plane straight to the screen).
  // o: {track: t -> [x, y] world, r: t -> radius (screen px), gun: t -> [x, y] world | null,
  // mag, locks: [t]}
  H.lens = (t0, t1, o) => TL.add({
    t0, t1, z: 54, screen: true,
    draw(ctx, emi, t, S) {
      const sc = MV.scene2, r = R(o.r(t));
      if (!sc || r < 3) return;
      const c = S.cam, z = c.zoom || 1, P = o.track(t), m = o.mag ?? 2;
      const toS = (x, y) => [(x - c.x) * z + MV.OW / 2, (y - c.y) * z + MV.OH / 2];
      const [sx, sy] = toS(P[0], P[1]).map(R);
      ctx.save();
      // the line of sight, back to the gun
      const g = o.gun ? o.gun(t) : null;
      if (g) {
        const [gx, gy] = toS(g[0], g[1]), d = Math.hypot(sx - gx, sy - gy);
        if (d > r + 8) {
          ctx.strokeStyle = '#ffd27a'; ctx.globalAlpha = 0.55; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 60;
          ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(sx - ((sx - gx) / d) * (r + 8), sy - ((sy - gy) / d) * (r + 8)); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
        }
      }
      // inside: the planes, magnified (those behind the battle toned like the rest of the picture)
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, r, 0, U.TAU); ctx.clip();
      ctx.fillStyle = '#0c0604'; ctx.fillRect(sx - r, sy - r, 2 * r, 2 * r);
      const h = r / (m * z), L = S.look, tone = L.sepia > 0.01 || L.gray > 0.01;
      ctx.imageSmoothingEnabled = false;
      for (const n of MV.PLANES) {
        if (tone && n !== 'front') ctx.filter = `sepia(${U.clamp(L.sepia).toFixed(2)}) grayscale(${U.clamp(L.gray).toFixed(2)})`;
        ctx.drawImage(sc.pl[n].c, P[0] - h + MV.PADX, P[1] - h + MV.PADY, 2 * h, 2 * h, sx - r, sy - r, 2 * r, 2 * r);
        ctx.filter = 'none';
      }
      // the glass: a warm cast, a curved reflection
      ctx.fillStyle = 'rgba(255,214,150,0.06)'; ctx.fillRect(sx - r, sy - r, 2 * r, 2 * r);
      ctx.strokeStyle = 'rgba(255,248,230,0.13)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(sx, sy, r * 0.72, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
      // the cross hairs: heavy posts from the rim, fine lines to a gap, range marks
      ctx.fillStyle = 'rgba(24,10,4,0.92)';
      const gap = 7, post = R(r * 0.5);
      ctx.fillRect(sx - r, sy - 2, r - post, 4); ctx.fillRect(sx + post, sy - 2, r - post, 4);
      ctx.fillRect(sx - 2, sy - r, 4, r - post); ctx.fillRect(sx - 2, sy + post, 4, r - post);
      ctx.fillRect(sx - post, sy - 1, post - gap, 2); ctx.fillRect(sx + gap, sy - 1, post - gap, 2);
      ctx.fillRect(sx - 1, sy - post, 2, post - gap); ctx.fillRect(sx - 1, sy + gap, 2, post - gap);
      for (let i = 1; i <= 3; i++) { const q = R((post * i) / 4); for (const s of [-1, 1]) { ctx.fillRect(sx + s * q - 1, sy - 4, 2, 8); ctx.fillRect(sx - 4, sy + s * q - 1, 8, 2); } }
      ctx.fillStyle = '#ff2a2a'; ctx.fillRect(sx - 1, sy - 1, 2, 2);
      ctx.restore();
      // the rim: dark, brass, its lit edge toward the sun; a lock flashes it white
      let fl = 0;
      for (const tl of o.locks || []) if (t >= tl && t < tl + 0.22) fl = Math.max(fl, 1 - (t - tl) / 0.22);
      ctx.lineWidth = 9; ctx.strokeStyle = '#1e0e04'; ctx.beginPath(); ctx.arc(sx, sy, r + 4, 0, U.TAU); ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = fl > 0.5 ? '#fff4d8' : '#b8863e'; ctx.beginPath(); ctx.arc(sx, sy, r + 4, 0, U.TAU); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = '#ffe0a8'; ctx.beginPath(); ctx.arc(sx, sy, r + 3, Math.PI * 1.1, Math.PI * 1.65); ctx.stroke();
      if (fl > 0) { ctx.globalAlpha = fl; ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx, sy, r + 6 + 26 * fl, 0, U.TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      // the setting sun's glint on the rim
      const ga = -0.75 + 0.05 * Math.sin(t * 3), gx = sx + Math.cos(ga) * (r + 4), gy = sy + Math.sin(ga) * (r + 4), gk = 0.65 + 0.35 * Math.sin(t * 7);
      ctx.globalAlpha = gk; ctx.fillStyle = '#fff4cc';
      ctx.fillRect(R(gx) - 9, R(gy) - 1, 18, 2); ctx.fillRect(R(gx) - 1, R(gy) - 9, 2, 18); ctx.fillRect(R(gx) - 2, R(gy) - 2, 4, 4);
      ctx.restore();
    },
  });
  // (the soft, blurred foreground fire that was here is gone: the one smooth thing in a pixel
  // picture, and fire besides - user, 2026-10-05)
  // a breath of white mist at his mouth
  H.breath = (t, o = {}) => TL.add({
    t0: t, t1: t + 1.2, z: -40,
    draw(ctx, emi, tt) {
      const u = (tt - t) / 1.2, K = TL.king.at(tt), x = K.x + 6 + u * 26, y = K.y - 168 - u * 22;
      for (let i = 0; i < 7; i++) {
        const a = (1 - u) * 0.7 * U.hash(i * 7.7 + 1), r = 3 + u * 10 * U.hash(i * 2.1);
        D.rect(ctx, x + (U.hash(i * 3.3) - 0.5) * 22 * (0.4 + u), y + (U.hash(i * 5.1) - 0.5) * 12, r, r * 0.7, '#e8e6f0', a);
      }
    },
  });
})();
