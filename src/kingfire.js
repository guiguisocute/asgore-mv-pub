// His own fire as the game throws it: the chains poured out of him in
// crossing strands, the hail of big fireballs over the whole picture, the hands that crawl along
// the box's frame trailing fire, the ring bigger than the picture that closes into a coil. The
// game's fire is never held in by the box - the whole picture burns, the box is one small cell in
// it. Dense fire like that must stay whole (no holes cut where the soul goes: that would be the
// bullets dodging the player), so the soul's way through it is found, not made: B.dodge plans it
// the way a player moves (still until it must move, then a straight dash), and H.graze shows how
// close it was (Deltarune's graze, Toby's own language).
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, B = MV.B2, D = MV.D, F = MV.F, FL = MV.FL;
  const R = Math.round, SR = B.SR, TAU = U.TAU;

  // ---------------------------------------------------------------- how near a shot comes
  // the gap between a shot's edge and the soul's (<= 0: they touch) at t, or null when it is not there
  const gapTo = (s, t, qx, qy) => {
    if (t < s.t0 || t >= s.t1) return null;
    if (s.seg) { const g = s.seg(t); return g ? B.segDist(qx, qy, g) - (g[4] ?? 3) - SR : null; }
    const p = s.p(t);
    if (!p) return null;
    if (s.hw) return Math.max(Math.abs(p[0] - qx) - s.hw, Math.abs(p[1] - qy) - s.hh) - SR;
    return Math.hypot(p[0] - qx, p[1] - qy) - (s.hr ?? 5) - SR;
  };
  B.gapTo = gapTo;

  // ---------------------------------------------------------------- a way through
  // B.dodge(t0, t1, shots, o): the soul's way from where it is at t0 through fire that stays whole.
  // A grid (o.cell px) over the box's inside (o.box: {x0, x1, y0, y1} or t -> one) at o.dt steps;
  // each step the fire (over the step, o.sub samples) blocks what lies within its edge + o.pad px of
  // the soul's edge; a distance transform makes keeping o.comfort px more a little cheaper; dynamic
  // programming finds the cheapest way at o.speed px/s - every step that moves costs, so it stays
  // still until it must move and then goes straight, like a player. o.home: a point it likes to keep
  // near (o.homeW); o.lure: t -> [x, y], a point that moves - the soul's dance, written on the music
  // first (o.lureW per 100 px per step: high, it follows the dance wherever the fire lets it; README
  // 脑暴 ①: a soul that only moves when it must reads as a lazy player, no urgency); o.to: where it
  // should end. Smoothed, checked again at 120 Hz (where smoothing
  // would touch the fire, the grid's own way is kept), baked (H.hPath) unless o.bake === false.
  // Returns {ok, worst: the smallest gap, at}.
  B.dodge = (t0, t1, shots, o = {}) => {
    const dt = o.dt ?? 1 / 30, cell = o.cell ?? 3, step = (o.speed ?? 230) * dt, pad = o.pad ?? 3, comfort = o.comfort ?? 14;
    const sub = o.sub ?? 3, N = Math.max(1, Math.round((t1 - t0) / dt));
    const boxAt = typeof o.box === 'function' ? o.box : ((b) => () => b)(o.box || B.inner(B.home));
    let X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9;
    const boxes = [];
    for (let k = 0; k <= N; k++) { const b = boxAt(t0 + k * dt); boxes.push(b); X0 = Math.min(X0, b.x0); X1 = Math.max(X1, b.x1); Y0 = Math.min(Y0, b.y0); Y1 = Math.max(Y1, b.y1); }
    const nx = Math.floor((X1 - X0) / cell) + 1, ny = Math.floor((Y1 - Y0) / cell) + 1, NC = nx * ny;
    const live = shots.filter((s) => !s.safe && s.t1 > t0 - dt && s.t0 < t1 + dt).sort((a, b) => a.t0 - b.t0);
    const INF = 1e30, wC = o.comfortW ?? 2.2, wMove = o.moveW ?? 0.012, wStart = o.startW ?? 0.32, wHome = o.homeW ?? 0, wLure = o.lureW ?? 0.4;
    const home = o.home || null, lure = o.lure || null;
    // (the game's colour rules: orange passes a soul that moves, light blue one that stands still -
    // each step has a cost for standing still and one for moving through each cell)
    const ruled = live.some((s) => s.rule);
    // the cost of standing in each cell at each step (INF: blocked)
    const cost = [], costM = [], blocked = new Uint8Array(NC), dist = new Float32Array(NC);
    let pass = 'still';
    const stamp = (s, t) => {
      if (s.rule && ((pass === 'still' && s.rule === 'aqua') || (pass === 'move' && s.rule === 'orange'))) return;
      if (s.seg) {
        const g = s.seg(t); if (!g) return;
        const rr = (g[4] ?? 3) + SR + pad, xa = Math.min(g[0], g[2]) - rr, xb = Math.max(g[0], g[2]) + rr, ya = Math.min(g[1], g[3]) - rr, yb = Math.max(g[1], g[3]) + rr;
        const i0 = Math.max(0, Math.floor((xa - X0) / cell)), i1 = Math.min(nx - 1, Math.ceil((xb - X0) / cell)), j0 = Math.max(0, Math.floor((ya - Y0) / cell)), j1 = Math.min(ny - 1, Math.ceil((yb - Y0) / cell));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (B.segDist(X0 + i * cell, Y0 + j * cell, g) < rr) blocked[j * nx + i] = 1;
        return;
      }
      const p = s.p(t); if (!p) return;
      if (s.hw) {
        const ax = s.hw + SR + pad, ay = s.hh + SR + pad;
        const i0 = Math.max(0, Math.ceil((p[0] - ax - X0) / cell)), i1 = Math.min(nx - 1, Math.floor((p[0] + ax - X0) / cell)), j0 = Math.max(0, Math.ceil((p[1] - ay - Y0) / cell)), j1 = Math.min(ny - 1, Math.floor((p[1] + ay - Y0) / cell));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) blocked[j * nx + i] = 1;
        return;
      }
      const rr = (s.hr ?? 5) + SR + pad, r2 = rr * rr;
      const i0 = Math.max(0, Math.ceil((p[0] - rr - X0) / cell)), i1 = Math.min(nx - 1, Math.floor((p[0] + rr - X0) / cell)), j0 = Math.max(0, Math.ceil((p[1] - rr - Y0) / cell)), j1 = Math.min(ny - 1, Math.floor((p[1] + rr - Y0) / cell));
      for (let j = j0; j <= j1; j++) { const dy = Y0 + j * cell - p[1]; for (let i = i0; i <= i1; i++) { const dx = X0 + i * cell - p[0]; if (dx * dx + dy * dy < r2) blocked[j * nx + i] = 1; } }
    };
    let first = 0;
    const field = (k, tk, b) => {
      blocked.fill(0);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = X0 + i * cell, y = Y0 + j * cell; if (x < b.x0 - 0.01 || x > b.x1 + 0.01 || y < b.y0 - 0.01 || y > b.y1 + 0.01) blocked[j * nx + i] = 1; }
      for (let m = 0; m < (k ? sub : 1); m++) {
        const tm = k ? tk - dt + ((m + 1) / sub) * dt : tk;
        for (let q = first; q < live.length; q++) { const s = live[q]; if (s.t0 > tm) break; if (tm < s.t1 && !s.seg) stamp(s, tm); }
        if (o.extra) for (const s of o.extra(tm)) stamp(s, tm);
      }
      // (blades sweep fast - a clock's hand turns once in a sixth of a second: sampled finer)
      const SS = k ? sub * 4 : 1;
      for (let m = 0; m < SS; m++) {
        const tm = k ? tk - dt + ((m + 1) / SS) * dt : tk;
        for (let q = first; q < live.length; q++) { const s = live[q]; if (s.t0 > tm) break; if (tm < s.t1 && s.seg) stamp(s, tm); }
      }
    };
    // the cost of each cell from what is blocked: INF there; dearer the less room it has round it
    // (chamfer distance to the nearest blocked cell, in px); dearer far from home and from the lure
    const fieldCost = (tk) => {
      const L = lure ? lure(tk) : null;
      for (let c = 0; c < NC; c++) dist[c] = blocked[c] ? 0 : 1e9;
      const d1 = cell, d2 = cell * 1.4142;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const c = j * nx + i; let v = dist[c]; if (!v) continue;
        if (i > 0) v = Math.min(v, dist[c - 1] + d1);
        if (j > 0) { v = Math.min(v, dist[c - nx] + d1); if (i > 0) v = Math.min(v, dist[c - nx - 1] + d2); if (i < nx - 1) v = Math.min(v, dist[c - nx + 1] + d2); }
        dist[c] = v;
      }
      for (let j = ny - 1; j >= 0; j--) for (let i = nx - 1; i >= 0; i--) {
        const c = j * nx + i; let v = dist[c]; if (!v) continue;
        if (i < nx - 1) v = Math.min(v, dist[c + 1] + d1);
        if (j < ny - 1) { v = Math.min(v, dist[c + nx] + d1); if (i < nx - 1) v = Math.min(v, dist[c + nx + 1] + d2); if (i > 0) v = Math.min(v, dist[c + nx - 1] + d2); }
        dist[c] = v;
      }
      const ck = new Float32Array(NC);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        if (blocked[c]) { ck[c] = INF; continue; }
        const lack = Math.max(0, comfort - dist[c]) / comfort;
        ck[c] = wC * lack * lack + (home ? wHome * Math.hypot(X0 + i * cell - home[0], Y0 + j * cell - home[1]) / 100 : 0) + (L ? wLure * Math.hypot(X0 + i * cell - L[0], Y0 + j * cell - L[1]) / 100 : 0);
      }
      return ck;
    };
    // (under the colour rules: where a coloured attack is over a cell close to a step's boundary - the
    // game judges moving over a twentieth of a second, so a start or a stop there would be seen
    // both ways: the soul must not change between still and moving there)
    const near = [];
    for (let k = 0; k <= N; k++) {
      const tk = t0 + k * dt;
      while (first < live.length && live[first].t1 < tk - dt - 0.5) first++;
      pass = 'still'; field(k, tk, boxes[k]); cost.push(fieldCost(tk));
      if (ruled) {
        pass = 'move'; field(k, tk, boxes[k]); costM.push(fieldCost(tk));
        blocked.fill(0); pass = 'any';
        for (let m = -4; m <= 4; m++) { const tm = tk + m * 0.0075; for (let q = first; q < live.length; q++) { const s = live[q]; if (s.t0 > tm) break; if (s.rule && tm < s.t1) stamp(s, tm); } }
        near.push(Uint8Array.from(blocked));
      }
    }
    // the moves one step allows (a step that stays put is standing still: the light blue rule's)
    const offs = [], ri = Math.floor(step / cell);
    for (let dj = -ri; dj <= ri; dj++) for (let di = -ri; di <= ri; di++) { const d = Math.hypot(di, dj) * cell; if (d <= step + 1e-6) offs.push([di, dj, wMove * d + (d > 0 ? wStart : 0), d > 0 ? 1 : 0]); }
    // from the soul where it is (the nearest open cell)
    const from = o.from || (() => { const s = TL.heart.at(t0); return [s.x, s.y]; })();
    let start = -1, bd = 1e9;
    for (let c = 0; c < NC; c++) { if (cost[0][c] >= INF) continue; const d = Math.hypot(X0 + (c % nx) * cell - from[0], Y0 + Math.floor(c / nx) * cell - from[1]); if (d < bd) { bd = d; start = c; } }
    if (start < 0) { console.warn('dodge: nowhere to start at', T.barOf(t0).toFixed(2)); return { ok: false }; }
    // states: cell * 2 + (did the last step move); back: the state it came from
    let prev = new Float64Array(NC * 2).fill(INF), cur = new Float64Array(NC * 2);
    prev[start * 2] = 0;
    const back = [];
    let dead = -1;
    for (let k = 1; k <= N; k++) {
      const ck = cost[k], cm = ruled ? costM[k] : ck, nb = ruled ? near[k - 1] : null, bk = new Int32Array(NC * 2).fill(-1);
      let any = false;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        for (let m = 0; m < 2; m++) {
          const here = m ? cm[c] : ck[c], st = c * 2 + m;
          if (here >= INF) { cur[st] = INF; continue; }
          let best = INF, bo = -1;
          for (let q = 0; q < offs.length; q++) {
            const [di, dj, mc, mv] = offs[q];
            if (mv !== m) continue;
            const pi = i - di, pj = j - dj;
            if (pi < 0 || pj < 0 || pi >= nx || pj >= ny) continue;
            const pc = pj * nx + pi;
            for (let mp = 0; mp < 2; mp++) {
              if (mp !== m && nb && nb[pc]) continue;
              const v = prev[pc * 2 + mp] + mc + here;
              if (v < best) { best = v; bo = pc * 2 + mp; }
            }
          }
          cur[st] = best;
          if (best < INF) any = true;
          bk[st] = bo;
        }
      }
      back.push(bk);
      [prev, cur] = [cur, prev];
      if (!any) { dead = k; break; }
    }
    if (dead > 0) {
      console.warn('dodge: no way through', T.barOf(t0).toFixed(2), '->', T.barOf(t1).toFixed(2), '- every way is closed at', T.barOf(t0 + dead * dt).toFixed(3));
      if (o.debug) o.debug.dead = t0 + dead * dt;
      return { ok: false, dead: t0 + dead * dt };
    }
    let end = -1, be = INF;
    for (let st = 0; st < NC * 2; st++) {
      if (prev[st] >= INF) continue;
      const c = st >> 1, v = prev[st] + (o.to ? (o.toW ?? 0.5) * Math.hypot(X0 + (c % nx) * cell - o.to[0], Y0 + Math.floor(c / nx) * cell - o.to[1]) : 0);
      if (v < be) { be = v; end = st; }
    }
    const xs = new Float64Array(N + 1), ys = new Float64Array(N + 1);
    for (let k = N, st = end; k >= 0; k--) {
      const c = st >> 1;
      xs[k] = X0 + (c % nx) * cell; ys[k] = Y0 + Math.floor(c / nx) * cell;
      if (k > 0) st = back[k - 1][st];
    }
    xs[0] = from[0]; ys[0] = from[1];
    // smoothed (a dash eases in and out), unless that touches the fire
    const sm = (a) => { const r = Float64Array.from(a); for (let k = 1; k < a.length; k++) { let s = 0, w = 0; for (let d = -3; d <= 3; d++) { const q = Math.min(a.length - 1, Math.max(0, k + d)), ww = 4 - Math.abs(d); s += a[q] * ww; w += ww; } r[k] = s / w; } return r; };
    // (under the colour rules the grid's own way is kept: smoothing would blur its stops and starts)
    const sx = sm(xs), sy = sm(ys), keepRaw = new Uint8Array(N + 1).fill(ruled ? 1 : 0);
    const pos = (t) => { const f = U.clamp((t - t0) / dt, 0, N), k = Math.min(N - 1, Math.floor(f)), u = f - k; const ax = keepRaw[k] ? xs[k] : sx[k], ay = keepRaw[k] ? ys[k] : sy[k], bx = keepRaw[k + 1] ? xs[k + 1] : sx[k + 1], by = keepRaw[k + 1] ? ys[k + 1] : sy[k + 1]; return [ax + (bx - ax) * u, ay + (by - ay) * u]; };
    // (moving as tools/check.cjs judges it: faster than 12 px/s over a twentieth of a second)
    const moving = (t) => { const a = pos(t - 0.025), b = pos(t + 0.025); return Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.05 > 12; };
    const worstOf = () => {
      let w = 1e9, at = t0, bad = [];
      for (let t = t0; t <= t0 + N * dt + 1e-9; t += 1 / 360) {
        const [qx, qy] = pos(t), mv = ruled ? moving(t) : false;
        for (const s of live) {
          if (s.t0 > t) break;
          if (s.rule && !B.hurts(s.rule, mv)) continue;
          const g = gapTo(s, t, qx, qy); if (g !== null && g < w) { w = g; at = t; } if (g !== null && g < 0.5) bad.push(t);
        }
      }
      return { w, at, bad };
    };
    let chk = worstOf();
    for (let pass = 0; pass < 3 && chk.bad.length; pass++) {
      for (const t of chk.bad) { const k = Math.round((t - t0) / dt); for (let d = -4 - 2 * pass; d <= 4 + 2 * pass; d++) if (k + d >= 0 && k + d <= N) keepRaw[k + d] = 1; }
      chk = worstOf();
    }
    if (chk.bad.length) console.warn('dodge: touches the fire at', T.barOf(chk.bad[0]).toFixed(3), 'gap', chk.w.toFixed(1));
    if (o.bake !== false) H.hPath(t0, t0 + N * dt, pos);
    // (how far it kept from its dance, on average and at worst: px)
    let lureD = null;
    if (lure) { let s = 0, m = 0; for (let k = 0; k <= N; k++) { const p = pos(t0 + k * dt), L = lure(t0 + k * dt), d = Math.hypot(p[0] - L[0], p[1] - L[1]); s += d; m = Math.max(m, d); } lureD = [s / (N + 1), m]; }
    (MV.DODGES = MV.DODGES || []).push({ t0, t1: t0 + N * dt, ok: !chk.bad.length, worst: chk.w, at: chk.at, ruled, n: live.length, lureD });
    return { ok: !chk.bad.length, worst: chk.w, at: chk.at, pos };
  };

  // ---------------------------------------------------------------- the graze
  // Deltarune's graze: where the fire skims the soul (its edge within o.near px), the soul's outline
  // flashes white, a few sparks fly off where it passed, a tick. Found on the soul's final way.
  H.graze = (t0, t1, shots, o = {}) => {
    const near = o.near ?? 6, live = shots.filter((s) => !s.safe && !s.rule && s.t1 > t0 && s.t0 < t1).sort((a, b) => a.t0 - b.t0), G = [];
    for (let t = t0; t <= t1; t += 1 / 60) {
      const s = TL.heart.at(t);
      if (s.a < 0.5) continue;
      let best = null;
      for (const sh of live) {
        if (sh.t0 > t) break;
        if (t < sh.t0 + 0.06 || t >= sh.t1 - 0.06) continue;
        const g = gapTo(sh, t, s.x, s.y);
        if (g === null || g <= 0.3 || g >= near || (best && g >= best.g)) continue;
        const p = sh.seg ? null : sh.p(t);
        best = { g, p: p ? [U.lerp(s.x, p[0], 0.5), U.lerp(s.y, p[1], 0.5)] : [s.x, s.y - 8] };
      }
      if (best && (!G.length || t - G[G.length - 1].t > (o.every ?? 0.14))) G.push({ t, p: best.p });
    }
    if (!G.length) return;
    // (heard every time: how close it was is half of what the audience feels - a light tick, a
    // little higher than the menu's own, each one its own pitch)
    G.forEach((g, i) => { if (i % (o.sfxEvery ?? 1) === 0) H.sfx(g.t, 'MenuCursor', o.vol ?? 0.15, { rate: +(1.18 + 0.16 * (U.hash(g.t * 17.3) - 0.5)).toFixed(3) }); });
    const heart = F.tint(MV.img('heartRed'), '#ffffff');
    TL.add({
      t0: G[0].t, t1: G[G.length - 1].t + 0.3, z: 41, name: 'graze',
      draw(ctx, emi, t) {
        const s = TL.heart.at(t);
        for (const g of G) {
          const u = (t - g.t) / 0.22;
          if (u < 0 || u > 1) continue;
          // (the soul's outline, white, then its own sprite back on top)
          if (u < 0.55 && s.a > 0.5) {
            const k = 1 - u / 0.55;
            for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) F.spr(ctx, heart, s.x + dx, s.y + dy, { sc: s.sc, ax: 8, ay: 8, alpha: 0.85 * k });
            const mode = TL.heartMode.at(t), img = MV.img({ red: 'heartRed', blue: 'heartBlue', green: 'heartGreen', purple: 'heartPurple', yellow: 'heartYellow', orange: 'heartOrange', aqua: 'heartAqua' }[mode] || 'heartRed');
            F.spr(ctx, img, s.x, s.y, { sc: s.sc, ax: 8, ay: 8, alpha: s.a });
            if (emi) F.glowAt(emi, s.x, s.y, 16, '#ffffff', 0.35 * k);
          }
          for (let i = 0; i < 5; i++) {
            const a = U.hash(i * 7.1 + g.t * 13) * TAU, r = 3 + U.eOut(u) * (8 + 10 * U.hash(i * 3.3 + g.t));
            D.rect(ctx, R(g.p[0] + Math.cos(a) * r) - 1, R(g.p[1] + Math.sin(a) * r) - 1, 2, 2, i % 2 ? '#ffffff' : '#ffd890', 1 - u);
          }
        }
      },
    });
    return G;
  };

  // ---------------------------------------------------------------- the breath before a stab
  // In the music's silence before a stab the fire in the air hangs there; with the blow it rushes on.
  // holds: [[a, b]] -> t -> the fire's own time (it creeps at 8% through a hold, then catches up in
  // 0.12 s)
  B.warp = (holds) => (t) => {
    let lag = 0;
    for (const [a, b] of holds) {
      if (t <= a) break;
      if (t < b) lag += (t - a) * 0.92;
      else lag += (b - a) * 0.92 * (1 - U.eOut(U.clamp((t - b) / 0.12)));
    }
    return t - lag;
  };
  // ...and the picture with it: the light sinks a little (o.light === false: not), he does not
  // breathe; the stab lets go
  H.hush = (a, b, o = {}) => {
    if (o.light !== false) TL.look2.to(a, a + 0.06, { shade: o.shade ?? 0.42 }, 'out').to(b, b + 0.16, { shade: o.after ?? 0 }, 'out');
    TL.king.to(a, a + 0.05, { breathe: 0 }, 'out').to(b + 0.1, b + 0.5, { breathe: 1 }, 'inOut');
  };

  // ---------------------------------------------------------------- the chains
  // As the game pours them (the recording at 30 fps): the shape of the fire stands still - two
  // strands crossing and uncrossing down each column, x = c ± A sin(2π (y - y0) / λ), columns 2A
  // apart so neighbouring strands meet too: a net of diamonds - and the fireballs FLOW down along
  // it, swaying from side to side as they fall (o.v px/s), like water in a winding channel. Poured
  // out of him at o.y0, a fireball every o.gap s on each strand. cols: [{x, t0, t1 (it stops
  // pouring), ph (0..1 of a wavelength: where the strands cross), hex}]. The pour never breaks
  // (user 2026-10-06: the chains run on unbroken - a net poured in separate waves with a breath
  // between them read as pieces): to make the soul change diamonds (the game's 交错) the whole net
  // swings half a cell over and back - o.sway: te -> dx, the columns' offset for what is poured at
  // te (B.swing) - and each bend flows down the chain with the fire. Where a bend is poured the
  // fireballs come closer together, so the rope stays whole round it.
  B.helix = (o) => {
    const out = [], v = o.v ?? 150, lam = o.lam ?? 254, A = o.A ?? 35, gap = o.gap ?? 0.07, y0 = o.y0 ?? 170, y1 = o.y1 ?? 540;
    const K = TAU / lam, life = (y1 - y0) / v, tw = o.warp || ((t) => t), sway = o.sway || (() => 0);
    for (const c of o.cols) for (const k of [0, 1]) {
      const ph = TAU * (c.ph || 0) + k * Math.PI;
      for (let te = c.t0; te < c.t1 - 1e-6; ) {
        const dx = sway(te), sp = Math.abs(sway(te + 0.005) - sway(te - 0.005)) / 0.01;
        out.push({ t0: te, t1: te + life, hr: o.hr ?? 5, sc: o.sc, hex: c.hex ?? o.hex, fadeIn: 0.1, fadeOut: 0.04, p: (t) => { const y = y0 + v * (tw(t) - te); return [c.x + dx + A * Math.sin(K * (y - y0) + ph), y]; } });
        te += (gap * v) / Math.hypot(v, sp);
      }
    }
    return out;
  };
  // the net's swing (B.helix o.sway): d px over at the first of seams (pour times), back at the next,
  // over again ... each bend poured over dur s
  B.swing = (seams, d, dur = 0.26) => (te) => {
    let x = 0;
    seams.forEach((s, i) => { x += (i % 2 ? -d : d) * U.eInOut(U.clamp((te - s) / dur + 0.5)); });
    return x;
  };
  // one strand of his chain alone (the "!" attack's: the recording has a single snaking strand pouring
  // out of him between the floods): fireballs flowing down a sinusoid, close enough to be one rope.
  // o: {x, t0, t1 (it pours), A, lam, v, gap, ph (0..1), y0, y1, warp, hex}; x and ph may be te -> a
  // value (the strand moved over while it pours: the bend flows down it, it never breaks)
  B.snake = (o) => {
    const out = [], v = o.v ?? 150, lam = o.lam ?? 220, A = o.A ?? 26, gap = o.gap ?? 0.07, y0 = o.y0 ?? 170, y1 = o.y1 ?? 540;
    const K = TAU / lam, life = (y1 - y0) / v, tw = o.warp || ((t) => t);
    const xOf = typeof o.x === 'function' ? o.x : () => o.x, phOf = typeof o.ph === 'function' ? o.ph : () => o.ph || 0;
    for (let te = o.t0; te < o.t1 - 1e-6; ) {
      const x = xOf(te), ph = TAU * phOf(te), sp = Math.abs(xOf(te + 0.005) - xOf(te - 0.005)) / 0.01;
      out.push({ t0: te, t1: te + life, hr: 5, hex: o.hex, fadeIn: 0.1, fadeOut: 0.12, p: (t) => { const y = y0 + v * (tw(t) - te); return [x + A * Math.sin(K * (y - y0) + ph), y]; } });
      te += (gap * v) / Math.hypot(v, sp);
    }
    return out;
  };
  // where it leaves him: a glow at his chest while it pours (on his plane); o.sway: t -> dx (where
  // the column is poured now, B.swing), c.xAt: t -> x (a strand moved over)
  H.pourGlow = (cols, y0, o = {}) => cols.forEach((c) => TL.add({
    t0: c.t0 - 0.1, t1: c.t1 + 0.2, z: -30, name: 'pouring',
    draw(ctx, emi, t) {
      const k = U.clamp((t - c.t0 + 0.1) / 0.15) * U.clamp((c.t1 + 0.2 - t) / 0.2), fl = 0.75 + 0.25 * Math.sin(t * 31 + c.x);
      if (k <= 0) return;
      const cx = (c.xAt ? c.xAt(t) : c.x) + (o.sway ? o.sway(t) : 0);
      for (let i = 0; i < 4; i++) { const a = t * 9 + i * 1.7 + c.x, r = 5 + 3 * Math.sin(t * 13 + i); D.rect(ctx, R(cx + Math.cos(a) * r) - 1, R(y0 + Math.sin(a) * r * 0.6) - 1, 2, 2, i % 2 ? '#ffffff' : '#ffe0b0', k * fl); }
      if (emi) F.glowAt(emi, cx, y0, 18, c.hex || o.hex || '#ffe0c0', 0.4 * k * fl);
    },
  }));

  // ---------------------------------------------------------------- the hail
  // Big fireballs poured from a corner over the whole picture, a lattice moving at vel px/s, a row
  // every rowT s (rows staggered by half a spacing: the game's 交错), slightly uneven. o: {t0, t1:
  // when the first and the last row pass o.at (default the box's middle), vel: [vx, vy], spacing,
  // sc, hr, warp, jitter, seed}. Each fireball exists while its way is inside the world rect o.view
  // (the rows start far enough back, o.back px, that none is born in sight).
  B.hail = (o) => {
    const out = [], vel = o.vel || [100, 170], sp = o.spacing ?? 64, rowT = o.rowT ?? T.beat / 2, tw = o.warp || ((t) => t);
    const V = Math.hypot(vel[0], vel[1]), d = [vel[0] / V, vel[1] / V], n = [-d[1], d[0]];
    const view = o.view || [-170, -130, 1130, 690];
    const ref = o.at || [B.home.cx, B.home.cy], back = o.back ?? 900, O = [ref[0] - d[0] * back, ref[1] - d[1] * back], lead = back / V;
    let r = 0;
    for (let tr = o.t0 - lead; tr <= o.t1 - lead + 1e-6; tr += rowT, r++) {
      for (let j = -24; j <= 24; j++) {
        const h1 = U.hash(r * 17.3 + j * 3.1 + (o.seed || 0)), h2 = U.hash(r * 5.7 + j * 11.9 + (o.seed || 0) + 2), h3 = U.hash(r * 9.1 + j * 2.3 + (o.seed || 0) + 5);
        const off = (j + (r % 2 ? 0.5 : 0)) * sp + (h1 - 0.5) * 2 * (o.jitter ?? 6);
        const p0 = [O[0] + n[0] * off - d[0] * (h2 - 0.5) * 10, O[1] + n[1] * off - d[1] * (h2 - 0.5) * 10], k = 1 + (h3 - 0.5) * 0.08;
        const vx = vel[0] * k, vy = vel[1] * k;
        // its time in the picture: entering and leaving the view rect
        let ta = -1e9, tb = 1e9;
        for (const [p, v, lo, hi] of [[p0[0], vx, view[0], view[2]], [p0[1], vy, view[1], view[3]]]) {
          if (Math.abs(v) < 1e-6) { if (p < lo || p > hi) { ta = 1; tb = 0; } continue; }
          const a = (lo - p) / v, b = (hi - p) / v;
          ta = Math.max(ta, Math.min(a, b)); tb = Math.min(tb, Math.max(a, b));
        }
        if (tb <= ta || tb <= 0) continue;
        out.push({ t0: tr + Math.max(0, ta), t1: tr + tb, hr: o.hr ?? 8, sc: o.sc ?? 1.7, hex: o.hex, fadeIn: 0.03, fadeOut: 0.03, seed: r * 3 + j, p: (t) => { const u = tw(t) - tr; return [p0[0] + vx * u, p0[1] + vy * u]; } });
      }
    }
    return out;
  };

  // ---------------------------------------------------------------- the flood ("!")
  // As the game throws it (the recording, ~128-133 s, user 2026-10-06: the "!" is a flood of
  // fireballs, not a hand): a third of the box is marked by the red "!" while his chains pour out of
  // him; a column of fire runs down the lane's inner edge, and then the whole lane is flooded at
  // once - a dense mass of fireballs comes down into it from above, stands there churning, and drains
  // out through the floor (gone at the box's floor: the game's mass does not spill over the HUD);
  // the other side next. o: {lane: [x0, x1], y0, y1 (the box's top and floor), tF (the moment it is
  // full), n, hold (s it stands), drain (s), speed (its fall, px/s), edge: 'L' | 'R' (the lane's inner
  // edge, for the leading column), warp, seed, hex}
  B.flood = (o) => {
    const out = [], n = o.n ?? 48, [x0, x1] = o.lane, y0 = o.y0, y1 = o.y1, tw = o.warp || ((t) => t);
    const hold = o.hold ?? 0.3, drain = o.drain ?? 0.34, sp = o.speed ?? 820, sd = o.seed || 0;
    // the mass: a jittered, staggered lattice filling the lane
    const cols = Math.max(2, Math.round((x1 - x0) / 15)), rows = Math.ceil(n / cols);
    for (let i = 0; i < cols * rows; i++) {
      const c = i % cols, r = Math.floor(i / cols), h1 = U.hash(i * 3.17 + sd), h2 = U.hash(i * 7.31 + 1 + sd), h3 = U.hash(i * 1.93 + 5 + sd);
      const x = U.lerp(x0 + 8, x1 - 8, (c + (r % 2 ? 0.5 : 0) + (h1 - 0.5) * 0.5) / (cols - 0.5)), ys = U.lerp(y0 + 8, y1 - 10, (r + (h2 - 0.5) * 0.6) / Math.max(1, rows - 1));
      // (it comes down from just over the box's top - the game's mass appears at the lane's top and
      // spreads down - arriving round tF, the deep ones a hair later)
      const ta = o.tF - 0.05 + 0.1 * h3 + 0.04 * (r / rows), top = y0 - 16 - 64 * h3, tS = ta - (ys - top) / sp, td = o.tF + hold + 0.08 * h1;
      out.push({ t0: tS, t1: td + drain + 0.1, hr: 5, hex: o.hex, fadeIn: 0.03, fadeOut: 0.05, seed: i * 1.3 + sd, p: (t) => {
        const u = tw(t), sway = Math.sin(u * 13 + i * 1.7) * 2.2;
        if (u < ta) return [x + sway, ys - sp * (ta - u)];
        const v = Math.min(u, td) - ta, yy = ys + 10 * v + Math.sin(u * 17 + i) * 1.4;
        if (u < td) return [x + sway, yy];
        const w = u - td, y = yy + 40 * w + 1100 * w * w;
        return y > y1 + 6 ? null : [x + sway, y];
      } });
    }
    // the leading column down the lane's inner edge, a moment before
    if (o.edge) {
      const xe = o.edge === 'L' ? x1 - 6 : x0 + 6;
      for (let k = 0; k < 7; k++) {
        const te = o.tF - 0.42 + k * 0.045, top = y0 - 40;
        out.push({ t0: te, t1: te + (y1 - top + 10) / 520, hr: 5, hex: o.hex, fadeIn: 0.03, fadeOut: 0.05, seed: 50 + k + sd, p: (t) => { const y = top + 520 * (tw(t) - te); return y > y1 + 6 ? null : [xe + Math.sin(tw(t) * 11 + k) * 1.5, y]; } });
      }
    }
    return out;
  };

  // ---------------------------------------------------------------- the hands
  // A hand of his fire as the game draws it (the sheet's hands at 2x, solid white), following a way
  // (way: t -> {p: [x, y], f: frame, flip, rot}); it lays fireballs where it passes (lay: [t...]),
  // which then go their own way (o.after(fireball's place, its lay time, index) -> t -> [x, y]).
  // Returns {hand (an obstacle for the planner), fire: [shots]}.
  H.crawl = (o) => {
    const t0 = o.t0, t1 = o.t1, way = o.way, sc = o.sc ?? 2;
    const hw = o.hw ?? 26, hh = o.hh ?? 18;
    TL.add({
      t0, t1, z: o.z ?? 26, name: 'hand',
      draw(ctx, emi, t) {
        const w = way(t), img = MV.img('hand' + (w.f ?? 0)), k = U.clamp((t - t0) / 0.08) * U.clamp((t1 - t) / 0.12);
        if (k <= 0 || !img) return;
        F.spr(ctx, img, w.p[0], w.p[1], { sc, ax: img.width / 2, ay: img.height / 2, flip: w.flip, rot: w.rot || 0, alpha: k });
        if (emi) F.glowAt(emi, w.p[0], w.p[1], 34, '#ffe6c8', 0.12 * k);
      },
      hit: o.harmless ? undefined : (t, sp) => { const p = way(t).p; return Math.abs(p[0] - sp[0]) < hw + SR && Math.abs(p[1] - sp[1]) < hh + SR ? 'hand' : false; },
    });
    const fire = [];
    (o.lay || []).forEach((tl, i) => {
      const at0 = way(tl).p, place = [at0[0] + (o.layAt ? o.layAt[0] : 0), at0[1] + (o.layAt ? o.layAt[1] : 0)];
      const go = o.after ? o.after(place, tl, i) : () => place;
      fire.push({ t0: tl, t1: o.fireEnd ? o.fireEnd(tl, i) : t1 + 0.4, hr: o.hr ?? 7, sc: o.fsc ?? 1.5, fadeIn: 0.05, p: go });
    });
    return { hand: o.harmless ? null : { t0, t1, hw, hh, p: (t) => way(t).p }, fire };
  };

  // ---------------------------------------------------------------- the gloves: always slung
  // (user, 2026-10-05: a glove flying in on its own looks silly - the box's own frame is always its
  // band.) The two gloves sit inside the box against its side walls; for a shot one draws its wall
  // back - out into a V, quivering - and on its time the frame lets go and shoots it along its lane;
  // the wall snaps in past straight and shivers. H.sling(o): o.t0 .. o.t1 the frame is drawn here
  // (the box's own is hidden), o.box (rect, default the box), o.shots [{tL: it arrives, side -1 | 1
  // (the wall it is slung from), y (its lane), to: x (where it is going: the far wall, or the middle
  // for a clap), fly (s), back (s: then it goes back to rest)}], o.rule ('orange'), o.sc, o.arrive
  // (t: before it the gloves come in from o.from (a point: the jar), o.leave (t: after it they go
  // back there). Returns the gloves as shots (the planner's, the hits).
  H.sling = (o) => {
    const bx = o.box, cx = bx.cx, YT = bx.cy - bx.h / 2, YB = bx.cy + bx.h / 2, X = { '-1': cx - bx.w / 2, 1: cx + bx.w / 2 };
    const sc = o.sc ?? 2, REST = 12 * sc, OUT = 15 * sc, GW = 14 * sc, hw = 10 * sc, hh = 8 * sc;
    const P = { '-1': [], 1: [] };
    for (const q of o.shots) P[q.side].push(Object.assign({ fly: 0.08, back: 0.28, draw: 0.16, hold: 0.06 }, q));
    for (const s of [-1, 1]) P[s].sort((a, b) => a.tL - b.tL);
    const yRest = bx.cy;
    const gloveAt = (s, t) => {
      const rest = (y) => ({ x: X[s] - s * REST, y, st: 'rest' });
      if (o.arrive && t < o.arrive) { const u = U.clamp((t - o.arrive + 0.4) / 0.4), e = U.eInOut(u), r = rest(yRest); return { x: U.lerp(o.from[0], r.x, e), y: U.lerp(o.from[1], r.y, e) - Math.sin(u * Math.PI) * 40, st: u > 0 ? 'in' : 'none', a: U.clamp(u * 4) }; }
      // (o.leaveTo: t -> [x, y] - where they go when they leave, instead of back to o.from: the soul,
      // once they have become its gifts)
      if (o.leave && t > o.leave) { const u = U.clamp((t - o.leave) / 0.4), e = U.eInOut(u), r = rest(yRest), to = o.leaveTo ? o.leaveTo(t) : o.from; return { x: U.lerp(r.x, to[0], e), y: U.lerp(r.y, to[1], e) - Math.sin(u * Math.PI) * 40, st: u < 1 ? 'in' : 'none', a: 1 - U.clamp((u - 0.75) * 4) }; }
      let ry = yRest;
      for (const q of P[s]) {
        const tD = q.tL - q.fly - q.hold - q.draw, tH = q.tL - q.fly - q.hold, tF = q.tL - q.fly;
        if (t < tD) return rest(ry);
        const out = X[s] + s * OUT;
        if (t < tH) { const u = U.eOut(U.clamp((t - tD) / q.draw)); return { x: U.lerp(X[s] - s * REST, out, u), y: U.lerp(ry, q.y, U.smooth(U.clamp((t - tD) / 0.1))), st: 'draw' }; }
        if (t < tF) return { x: out + U.noise(t * 47 + s) * 1.3, y: q.y + U.noise(t * 53 + s) * 0.9, st: 'hold' };
        if (t < q.tL) return { x: U.lerp(out, q.to, U.eIn(U.clamp((t - tF) / q.fly))), y: q.y, st: 'fly', q };
        // (back to rest; from the far wall over the top, out of the way)
        if (t < q.tL + q.back) { const u = U.eInOut(U.clamp((t - q.tL) / q.back)), arc = Math.abs(q.to - X[s]) > 90 ? Math.max(30, q.y - YT + 18) : 8; return { x: U.lerp(q.to, X[s] - s * REST, u), y: q.y - Math.sin(u * Math.PI) * arc, st: 'back', q }; }
        ry = q.y;
      }
      return rest(ry);
    };
    // the wall's give: drawn out where its glove draws it; let go: in past straight, shivering
    const bend = (s, t) => {
      const g = gloveAt(s, t);
      let off = g.st === 'draw' || g.st === 'hold' ? Math.max(0, (g.x - X[s]) * s + 6) : 0;
      for (const q of P[s]) { const d = t - (q.tL - q.fly); if (d > 0 && d < 0.6) off += (OUT + 6) * Math.exp(-d * 9) * Math.cos(d * 30) * 0.7; }
      return [off, U.clamp(g.y, YT + 10, YB - 10)];
    };
    const t0 = o.t0, t1 = o.t1;
    TL.box2.to(t0 - 0.02, t0, { fa: 0 }, 'lin').to(t1, t1 + 0.02, { fa: 1 }, 'lin');
    TL.add({
      t0, t1, z: 4, keep: true, name: 'the frame, a sling',
      draw(ctx, emi, t) {
        const b = MV.box2At(t), th = b.th || 5, h = th / 2, L = X[-1], Rr = X[1];
        if (b.a <= 0.01) return;
        const col = b.ak > 0.01 ? `rgb(${R(255 + (b.ar * 255 - 255) * b.ak)},${R(255 + (b.ag * 255 - 255) * b.ak)},${R(255 + (b.ab * 255 - 255) * b.ak)})` : '#ffffff';
        ctx.save(); ctx.globalAlpha = b.a; ctx.strokeStyle = col; ctx.lineWidth = th; ctx.lineJoin = 'miter';
        ctx.beginPath();
        ctx.moveTo(L - h, YT - h); ctx.lineTo(Rr + h, YT - h);
        const [ro, ry] = bend(1, t); ctx.lineTo(Rr + h + ro, ry); ctx.lineTo(Rr + h, YB + h);
        ctx.lineTo(L - h, YB + h);
        const [lo, ly] = bend(-1, t); ctx.lineTo(L - h - lo, ly); ctx.closePath();
        ctx.stroke(); ctx.restore();
        if (emi) for (const s of [-1, 1]) { const [off, y] = bend(s, t); if (off > 8) F.glowAt(emi, X[s] + s * off, y, 20, B.RULE.orange, 0.25); }
      },
    });
    const gimg = MV.ART.get('boxGlove');
    // (o.become {t, img}: from t each glove is drawn as img - centred, not flipped - with a white
    // flash as it changes)
    const glove = (ctx, x, y, s, a, t) => {
      if (o.become && t >= o.become.t) {
        const b = o.become.img, fl = 1 - U.clamp((t - o.become.t) / 0.12);
        F.spr(ctx, fl > 0.5 ? F.tint(b, '#ffffff') : b, x, y, { sc: o.become.sc ?? 2, ax: b.width / 2, ay: b.height / 2, alpha: a });
        return;
      }
      F.spr(ctx, gimg, x, y, { sc, ax: 14, ay: 11, flip: s > 0, alpha: a });
    };
    TL.add({
      t0: Math.min(t0, o.arrive ? o.arrive - 0.4 : t0), t1: o.leave ? o.leave + 0.4 : t1, z: 14, keep: true, name: 'the gloves',
      draw(ctx, emi, t) {
        for (const s of [-1, 1]) {
          const g = gloveAt(s, t), a = g.a ?? 1;
          if (g.st === 'none' || a <= 0.01) continue;
          if (g.st === 'fly') {
            for (let i = 4; i >= 1; i--) { const h2 = gloveAt(s, t - 0.014 * i); if (h2.st === 'fly') glove(ctx, h2.x, h2.y, s, a * [0, 0.42, 0.28, 0.17, 0.09][i], t); }
            const back = g.x + s * GW;
            [[-11, 70], [-5, 100], [1, 55], [6, 85], [11, 45]].forEach(([dy, L], i) => D.rect(ctx, s < 0 ? back - L : back, g.y + dy, L, 2, i % 2 ? '#ffd8a8' : '#ffffff', 0.55 * a));
          }
          glove(ctx, g.x, g.y, s, a, t);
        }
      },
    });
    for (const q of o.shots) { H.sfx(q.tL - (q.fly ?? 0.08) - (q.hold ?? 0.06) - (q.draw ?? 0.16), 'Pullback', 0.12); H.sfx(q.tL - (q.fly ?? 0.08), 'SwipeShort', 0.12); }
    // as shots: each glove while it flies and as it lands (o.rule: the colour's)
    const shots = [];
    // (drawn above: as shots they only hit)
    for (const s of [-1, 1]) for (const q of P[s]) shots.push({ t0: q.tL - q.fly, t1: q.tL + 0.08, hw, hh, rule: o.rule, name: 'glove', draw: () => {}, p: (t) => { const g = gloveAt(s, t); return [g.x, g.y]; } });
    return { shots, gloveAt };
  };

  // ---------------------------------------------------------------- the ring
  // A ring of n fireballs bigger than the picture round c, turning (spin rad/s), closing from R0 to R1
  // between tc and t1 (it stands at R0 from t0); inside the box it winds into a coil - each fireball a
  // little further in than the one before (coil: how much, at the end) - and the last gapN are
  // missing: the way out. ell: its width / height.
  B.coil = (o) => {
    const out = [], n = o.n ?? 44, gapN = o.gapN ?? 6, c = o.c || [B.home.cx, B.home.cy], tw = o.warp || ((t) => t);
    const radius = (t) => (t < o.tc ? o.R0 : U.lerp(o.R0, o.R1, MV.EASE[o.ease || 'lin'](U.clamp((tw(t) - o.tc) / (o.t1 - o.tc)))));
    const coilK = (Rr) => (o.coil ?? 0.45) * U.smooth(U.clamp((o.coilFrom ?? 120) - Rr, 0, o.coilFrom ?? 120) / ((o.coilFrom ?? 120) - (o.coilTo ?? 40)));
    for (let i = 0; i < n - gapN; i++) {
      out.push({
        t0: o.t0 + (o.appear ? (i / n) * o.appear : 0), t1: o.t1, hr: o.hr ?? 5, sc: o.sc, hex: o.hex, fadeIn: 0.12, ring: o,
        p: (t) => {
          const Rr = radius(t), r = Rr * (1 - coilK(Rr) * (i / n)), a = (o.a0 || 0) + (o.spin || 0) * (tw(t) - o.t0) + (i / n) * TAU;
          return [c[0] + Math.cos(a) * r * (o.ell ?? 1), c[1] + Math.sin(a) * r];
        },
      });
    }
    return out;
  };
})();
