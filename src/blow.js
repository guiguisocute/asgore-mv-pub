// Blows that land on him: one grammar for every hit on Asgore - he does not
// move; the world moves for him.
//   H.stop(t, d)        a hit stop: the picture holds while the music goes on (MV.vt)
//   H.blow(t, o)        a blow landing at t: the stop; the impact frame; the hall behind him in one
//                       colour with its own rings - held, then flung out (Smash's special zoom
//                       told with the barrier's rectangles, as round the all-out blow); the wind of
//                       it (sparks blown off him, dust at his feet, his cape); the shake; the camera
//                       pushed to where it lands and thrown back; the game's damage, stamped on
//   H.readout(...)      the game's damage display: the number, the bar, the soul pips
//   H.meter(...)        the game's attack bar with a cursor per press (the multi-hit weapons)
//   BL.relic(...)       the six humans' weapons striking as the game draws their blows (white;
//                       gold when perfect - the game's own critical)
//   BL.blade(...)       a cut as a blade of light in the game's pixels (the knife's, the last one)
//   BL.cage(...)        bar 71: the soul breaking the box from inside; it bursts
(function () {
  const MV = window.MV, TL = MV.TL, U = MV.U, H = MV.H, D = MV.D, F = MV.F, FL = MV.FL, B = MV.B2;
  const R = Math.round, HEX = MV.COL.S;
  const BL = (MV.BLOW = {});
  const W0 = -MV.PADX, H0 = -MV.PADY, WW = MV.OW + 2 * MV.PADX, HH = MV.OH + 2 * MV.PADY;
  // where a blow lands on him unless told: his chest
  BL.CHEST = [482, FL.king[1] - 122];
  const rgb01 = (hex) => F.rgb(hex).map((v) => v / 255);
  const css = (hex, k = 1) => { const [r, g, b] = F.rgb(hex); return `rgb(${R(r * k)},${R(g * k)},${R(b * k)})`; };
  // a sprite in the game's "perfect" gold, or in plain white (its shading kept as brightness)
  const GOLD = ['#6a3a04', '#b07a0c', '#f0b828', '#ffe070', '#fff8d0'].map(F.rgb);
  const WHITE = ['#5a566a', '#9a96a8', '#d0cee0', '#f2f0fa', '#ffffff'].map(F.rgb);
  const ramp = (P) => (r, g, b, a) => { const l = (0.3 * r + 0.59 * g + 0.11 * b) / 255, c = P[Math.min(P.length - 1, Math.floor(l * P.length))]; return [c[0], c[1], c[2], a]; };
  BL.gold = (img) => F.recolor('gold' + F.id(img), img, ramp(GOLD));
  BL.white = (img) => F.recolor('white' + F.id(img), img, ramp(WHITE));
  BL.GOLD = '#ffd84a';
  // a weapon's own time through its stop: still moving, slowly (Sakurai: the attacker keeps
  // pressing in through the hit stop), then on as it was
  BL.creep = (t, tc, d, k = 0.12) => (t < tc ? t : t < tc + d ? tc + (t - tc) * k : t - d * (1 - k));

  // ---------------------------------------------------------------- the hit stop
  H.stop = (t, d) => { if (d > 0) TL.stops.push({ t, d }); return t + d; };

  // ---------------------------------------------------------------- the hall in one colour
  // While the picture stands still the hall behind him is a dark field of the blow's colour; on it
  // its own concentric rectangles (the barrier's room) round where the blow lands, and lines all
  // running at that point (a new set every twelfth of a second); then the rings are flung out past
  // the picture and the field is gone. On his plane, under him (like the all-out blow's dark).
  const FIELDS = [];
  const drawField = (ctx, tr, f) => {
    const kf = tr < f.t1 ? 1 : 1 - U.clamp((tr - f.t1) / 0.14), [r, g, b] = F.rgb(f.hex), c = f.c;
    if (kf > 0.004) {
      ctx.globalAlpha = 0.97 * kf; ctx.fillStyle = `rgb(${R(r * 0.2 + 5)},${R(g * 0.2 + 3)},${R(b * 0.2 + 8)})`; ctx.fillRect(W0, H0, WW, HH);
      const fr = Math.floor(tr * 12);
      for (let m = 0; m < 30; m++) {
        const a = (m / 30) * U.TAU + (U.hash(m * 7.3 + fr * 1.7) - 0.5) * 0.16, r0 = 56 + 90 * U.hash(m * 3.1 + fr * 0.71), L = 120 + 460 * U.hash(m * 5.7 + fr * 1.3);
        const ca = Math.cos(a), sa = Math.sin(a) * 0.74, wh = m % 3 === 0;
        ctx.globalAlpha = kf * (wh ? 0.85 : 0.6); ctx.strokeStyle = wh ? '#ffffff' : css(f.hex); ctx.lineWidth = wh ? 3 : 2;
        ctx.beginPath(); ctx.moveTo(c[0] + ca * (r0 + L), c[1] + sa * (r0 + L)); ctx.lineTo(c[0] + ca * r0, c[1] + sa * r0); ctx.stroke();
      }
    }
    const fl = tr < f.t1 ? 0 : (tr - f.t1) / 0.55;
    if (fl < 1) for (let i = 0; i < 8; i++) {
      const u = (i + 0.6) / 8, rr = (26 + Math.pow(u, 1.5) * 540) * (1 + fl * 2.4 * (0.6 + u)), a = (1 - fl) * (0.45 + 0.55 * u);
      ctx.globalAlpha = a; ctx.strokeStyle = i % 2 ? '#ffffff' : css(f.hex); ctx.lineWidth = R(3 + u * 9);
      ctx.strokeRect(R(c[0] - rr * 1.45), R(c[1] - rr), R(2 * rr * 1.45), R(2 * rr));
    }
    ctx.globalAlpha = 1;
  };
  MV.F.layers.king.unshift((ctx, emi, t, S) => {
    if (S.sil) return;
    const tr = S.tr ?? t;
    for (const f of FIELDS) if (tr >= f.t0 && tr < f.t1 + 0.56) drawField(ctx, tr, f);
  });
  BL.field = (t0, t1, hex, c) => FIELDS.push({ t0, t1, hex, c });

  // ---------------------------------------------------------------- the wind of a blow
  // what the force does going out through him: his cape thrown up (only the cloth), sparks blown
  // off him every way from where it landed, dust off the floor at his feet
  BL.wind = (t, c, dir, hex, pow = 1) => {
    TL.gust.to(t, t + 0.05, { flare: 1.1 * pow, sway: 0.7 * (dir[0] || 0) }, 'out').to(t + 0.05, t + 0.85, { flare: 0, sway: 0 }, 'inOut');
    const n = R(24 * pow), cols = ['#fff1c0', '#ffb040', '#ff7a1e', hex, '#ffffff'];
    TL.add({
      t0: t, t1: t + 0.75, z: -150, live: true, name: 'blown off him',
      draw(ctx, emi, tt) {
        const v = tt - t, u = v / 0.75;
        for (let m = 0; m < n; m++) {
          const a = U.hash(m * 3.7 + t) * U.TAU, sp = (260 + 560 * U.hash(m * 1.3 + t)) * Math.min(1.6, pow), r = 26 + (sp * (1 - Math.exp(-v * 5))) / 5;
          const x = c[0] + Math.cos(a) * r + dir[0] * 60 * u, y = c[1] + Math.sin(a) * r * 0.8 + dir[1] * 40 * u + 60 * u * u, s = m % 4 ? 2 : 4;
          D.rect(ctx, R(x), R(y), s, s, cols[m % cols.length], 1 - u * u);
          if (emi && m % 3 === 0) D.rect(emi, x - 3, y - 3, s + 6, s + 6, cols[m % cols.length], 0.3 * (1 - u));
        }
      },
    });
    TL.add({
      t0: t, t1: t + 0.9, z: -95, live: true, name: 'dust at his feet',
      draw(ctx, emi, tt) {
        const K = TL.king.at(tt), u = (tt - t) / 0.9;
        for (let m = 0; m < 22; m++) {
          const s = m % 2 ? 1 : -1, h = U.hash(m * 2.9 + t), x = K.x + s * (36 + 76 * h) + s * 120 * U.eOut(Math.min(1, u * 1.6)) * (0.4 + h);
          const y = K.y - 2 - 30 * U.eOut(u) * U.hash(m * 4.1 + t) * Math.min(1.6, pow);
          D.rect(ctx, R(x / 2) * 2, R(y / 2) * 2, m % 3 ? 2 : 4, 2, '#c8c2d4', 0.75 * (1 - u));
        }
      },
    });
  };

  // ---------------------------------------------------------------- the game's damage, stamped on
  // the red number at twice its size for an instant (white), landing at its size and hopping as the
  // game's does; the bar under it - what is left green on grey, the part being lost white, then
  // draining. o: {bar: [x, y] | t -> [x, y] (its centre; default over his head), bw, num (the
  // number's size, 1 = the game's), numDx, dur, pips: key (the six soul pips after the bar; that
  // soul's goes out) | true (just the pips), out: [keys] (the pips that go out, at outT), sfx, vol}
  H.readout = (t, hpFrom, hpTo, dmg, o = {}) => {
    TL.foe.set(t, { hp: hpFrom }).to(t + 0.1, t + 0.62, { hp: hpTo }, 'out');
    if (o.sfx !== false) H.sfx(t, o.sfx || 'Damage', o.vol ?? 0.6);
    const dur = o.dur ?? 1.3, n0 = o.num ?? 1, tOut = o.outT ?? t;
    const outs = [].concat(o.out ?? (typeof o.pips === 'string' ? [o.pips] : [])).map((k) => MV.SOULS.indexOf(k));
    const barAt = typeof o.bar === 'function' ? o.bar : () => o.bar || [TL.king.at(t).x, FL.king[1] - 205];
    // (an overlay: it shows over a voxel window too)
    return TL.add({
      t0: t, t1: t + dur, z: 46, live: true, keep: true, kind: 'text', name: 'readout',
      ov(ctx, tt) {
        const f = TL.foe.at(tt), a = U.clamp((t + dur - tt) / 0.15), bw = o.bw ?? 200, at = barAt(tt);
        if (!at) return;
        const pipW = o.pips !== undefined ? 64 : 0, bx = R(at[0] - bw / 2 - pipW), by = R(at[1] - 7), v = tt - t;
        const kNow = U.clamp(f.hp / f.max), kTo = U.clamp(hpTo / f.max);
        D.rect(ctx, bx, by, bw, 14, '#404040', a);
        if (kTo > 0) D.rect(ctx, bx, by, Math.max(1, bw * kTo), 14, '#00e000', a);
        if (kNow > kTo) D.rect(ctx, bx + bw * kTo, by, Math.max(1, bw * (kNow - kTo)), 14, v < 0.1 ? '#ffffff' : '#ffd8c8', a);
        if (o.pips !== undefined) {
          const mask = TL.foePips.at(tt), small = MV.img('heartSmall');
          MV.SOULS.forEach((k, i) => {
            const on = (mask >> i) & 1, x = bx + bw + 10 + i * 20, y = by - 1, out = outs.includes(i), w = tt - tOut;
            F.spr(ctx, F.tint(small, out && w >= 0 && w < 0.12 ? '#ffffff' : on ? HEX[k] : '#34303c'), x, y, { sc: 2, alpha: a });
            if (!out) return;
            const u = w / 0.6;
            if (u > 0 && u < 1) for (let m = 0; m < 8; m++) { const ang = (m / 8) * U.TAU + 0.4, r = 4 + 22 * U.eOut(u); D.rect(ctx, x + small.width + Math.cos(ang) * r - 1, y + small.height + Math.sin(ang) * r - 1, 2, 2, HEX[k], a * (1 - u)); }
          });
        }
        if (o.num !== false) {
          // (o.stamp === false: the game's own number, its size from the start)
          const st = o.stamp === false ? 1 : U.clamp(v / 0.07), sc = n0 * (2 - U.eOut(st)), hop = Math.max(0, Math.sin(U.clamp((v - (o.stamp === false ? 0 : 0.07)) / 0.42) * Math.PI)) * 18 * n0;
          D.dmg(ctx, String(dmg), at[0] - pipW + (o.numDx || 0), by - 6 - 32 * sc - hop, { align: 'center', color: st < 1 ? '#ffffff' : '#ff3030', alpha: a, scale: sc });
        }
      },
    });
  };

  // ---------------------------------------------------------------- the blow
  // o: {hex (its colour: the soul's), at: [x, y] (where it lands), dir: [dx, dy] (the way the force
  // goes), pow (1 a counter, 1.3 a relic's golden blow, 2 the last), stop (s), bw (s of the hard
  // black and white), inv, field: false, wind: false, cam: {snap (the shot it is pushed to for
  // the stop), back (where it is thrown on the release), backDur, backEase}, hp: [from, to, dmg],
  // readout: H.readout's o, sfx: [[name, vol]] (what struck him, on the contact)}. Returns the
  // release time.
  H.blow = (t, o = {}) => {
    const pow = o.pow ?? 1, stop = o.stop ?? 0.08, tRel = t + stop, hex = o.hex || '#ffffff', c = o.at || BL.CHEST, dir = o.dir || [0, -1];
    H.stop(t, stop);
    TL.impact(t, { amp: 0, bw: o.bw ?? 0.034, inv: o.inv ?? 0 });
    if (o.field !== false) BL.field(t, tRel, hex, c);
    // where it lands: a hard white star through the stop, gone with the release
    const big = 1 + 0.35 * (pow - 1);
    TL.add({
      t0: t, t1: tRel + 0.12, z: -20, live: true, name: 'where it lands',
      draw(ctx, emi, tt) {
        const v = tt - t, k = tt < tRel ? 1 : 1 - (tt - tRel) / 0.12, s = big * (tt < tRel ? 1 + 0.25 * (1 - U.eOut(U.clamp(v / 0.05))) : 1 + (tt - tRel) * 3);
        for (const [rr, col] of [[46, hex], [30, '#ffffff']]) {
          ctx.globalAlpha = k; ctx.fillStyle = col; ctx.beginPath();
          for (let i = 0; i < 16; i++) { const a = (i / 16) * U.TAU - Math.PI / 2 + 0.2, r = rr * s * (i % 2 ? 0.22 : i % 4 ? 0.62 : 1); ctx.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r); }
          ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (emi) F.glowAt(emi, c[0], c[1], 60 * s, hex, 0.5 * k);
      },
    });
    TL.impact(tRel, { amp: 8 * pow, dx: dir[0] * 0.9, dy: dir[1] * 0.9, zoom: 0.04 * pow, rot: 0.014 * pow, flash: 0.14 + 0.07 * pow, flashCol: rgb01(hex), flashDecay: 11, dur: 0.5 });
    if (o.wind !== false) BL.wind(tRel, c, dir, hex, pow);
    for (const [n, v] of o.sfx || []) H.sfx(t, n, v);
    H.sfx(t, 'Impact', 0.3 + 0.1 * pow); H.sfx(tRel, 'HeavyDamage', 0.18 + 0.12 * pow);
    if (pow >= 1.25) H.sfx(t, 'CineCut', Math.min(0.75, 0.3 * pow));
    if (o.cam) {
      if (o.cam.snap) TL.cam2.to(t, t + 0.035, o.cam.snap, 'outExpo');
      if (o.cam.back) TL.cam2.to(tRel, tRel + (o.cam.backDur ?? 0.32), o.cam.back, o.cam.backEase || 'out');
    }
    if (o.hp) H.readout(tRel, o.hp[0], o.hp[1], o.hp[2], o.readout || {});
    return tRel;
  };

  // ---------------------------------------------------------------- the attack bar, several cursors
  // the game's target in the box with a cursor per press: each slides in from its side ('L' | 'R')
  // and is on the centre line at its time; pressed, it flashes gold (dead centre: the game's
  // perfect) and blinks out. bars: [{t, from, sp (px/s), gold: false, x: t -> 0..1 (a path of its
  // own: how far in it is)}]. o.clip: (ctx, t) -> a path to keep it in (true), or false
  H.meter = (t0, t1, bars, o = {}) => {
    const SP = o.speed ?? 760;
    bars.forEach((q) => H.sfx(q.t, 'PlayerFight', q.vol ?? 0.4));
    return TL.add({
      t0, t1, z: 31, kind: 'text', name: 'meter',
      draw(ctx, emi, t) {
        const clipped = o.clip ? o.clip(ctx, t) : false;
        if (clipped) { ctx.save(); ctx.clip(); }
        drawMeter(ctx, emi, t);
        if (clipped) ctx.restore();
      },
    });
    function drawMeter(ctx, emi, t) {
      {
        const b = MV.box2At(t), img = MV.frame('Target', 'Default', 0), a = U.clamp((t - t0) / 0.08) * U.clamp((t1 - t) / 0.12);
        ctx.globalAlpha = a; ctx.drawImage(img, R(b.cx - img.width / 2), R(b.cy - img.height / 2)); ctx.globalAlpha = 1;
        const xl = b.cx - b.w / 2 + 12, xr = b.cx + b.w / 2 - 12;
        for (const q of bars) {
          const s = q.from === 'R' ? 1 : -1, hit = t >= q.t, v = t - q.t;
          const x = hit ? b.cx : q.x ? U.lerp(s > 0 ? xr : xl, b.cx, U.clamp(q.x(t))) : b.cx + s * (q.t - t) * (q.sp ?? SP);
          if (x < xl - 1 || x > xr + 1 || (q.from0 !== undefined && t < q.from0)) continue;
          if (hit && v > 0.36) continue;
          const gold = hit && q.gold !== false && v < 0.22;
          const cur = gold ? F.tint(MV.frame('TargetChoice', 'Default', 0), BL.GOLD) : MV.frame('TargetChoice', 'Default', hit && Math.floor(v * 14) % 2 ? 1 : 0);
          ctx.globalAlpha = a * (hit ? U.clamp(1 - (v - 0.22) / 0.14) : 1);
          ctx.drawImage(cur, R(x - 7), R(b.cy - 64));
          ctx.globalAlpha = 1;
          if (emi && gold) F.glowAt(emi, x, b.cy, 34, BL.GOLD, 0.45 * (1 - v / 0.22));
        }
      }
    }
  };

  // ---------------------------------------------------------------- a cut as a blade of light
  // from A to B, in the game's 2 px pixels: widest in the middle (w: half width), a hard white
  // core, its colour round it, a dark rim; o.cut [s0, s1]: only that part of it (0..1 along it) -
  // past the ends it crumbles (cells drifting off and dropping out)
  // (drawn a 2 px row at a time: each row's cells inside it run together into one rect - only
  // the crumbling ends go cell by cell)
  BL.blade = (ctx, A, Bp, w, o = {}) => {
    const dx = Bp[0] - A[0], dy = Bp[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const [s0, s1] = o.cut || [0, 1], crumb = o.crumb ?? 0, P = 2, taper = o.taper ?? 0.7, coreK = o.coreK ?? 0.42;
    const wAt = (f) => w * Math.pow(Math.sin(Math.PI * f), taper) * (o.wv ? o.wv(f) : 1);
    const W = w + 3, xa = Math.min(A[0], Bp[0]) - W, xb = Math.max(A[0], Bp[0]) + W, ya = Math.min(A[1], Bp[1]) - W, yb = Math.max(A[1], Bp[1]) + W;
    const layers = [[o.rim || '#2a0408', 2, 1], [o.col || '#ff2a2a', 0, 1], [o.core || '#ffffff', 0, coreK]];
    ctx.globalAlpha = o.alpha ?? 1;
    layers.forEach(([fill, add, k], layer) => {
      ctx.fillStyle = fill;
      for (let y = Math.floor(ya / P) * P; y <= yb; y += P) {
        const cy = y + P / 2;
        // (the cells this row can hold: where the strip round the line crosses it)
        let x0 = xa, x1 = xb;
        if (Math.abs(nx) > 1e-3) { const xc = A[0] - (ny * (cy - A[1])) / nx, r = W / Math.abs(nx); x0 = Math.max(xa, xc - r); x1 = Math.min(xb, xc + r); }
        let run = -1;
        for (let x = Math.floor(x0 / P) * P; x <= x1 + P; x += P) {
          const cx = x + P / 2, rx = cx - A[0], ry = cy - A[1], f = (ux * rx + uy * ry) / L, d = Math.abs(nx * rx + ny * ry);
          let inside = false;
          if (f >= 0 && f <= 1 && f >= s0 - crumb && f <= s1 + crumb) {
            const ww = wAt(f) * k + add;
            if (ww >= 0.6 && d <= ww) {
              const out = f < s0 ? (s0 - f) / crumb : f > s1 ? (f - s1) / crumb : 0;
              if (out <= 0) inside = true;
              else if (U.hash(f * 977 + d * 1.7 + layer) >= out) {
                // (past the cut it crumbles: cells drifting off, falling)
                const dr = out * 26, s = f * L;
                ctx.fillRect(R((cx + (U.hash(s + d * 3.1) - 0.5) * dr) / P) * P, R((cy + (U.hash(s * 1.3 + d) - 0.5) * dr + out * out * 20) / P) * P, P, P);
              }
            }
          }
          if (inside && run < 0) run = x;
          if (!inside && run >= 0) { ctx.fillRect(run, y, x - run, P); run = -1; }
        }
        if (run >= 0) ctx.fillRect(run, y, Math.floor(x1 / P) * P + 2 * P - run, P);
      }
    });
    ctx.globalAlpha = 1;
  };

  // ---------------------------------------------------------------- the relics' blows
  // The six humans' things as the game draws their attacks over the monster (Undertale's own
  // weapons: the toy knife's cut; the tough glove's small fists then the big one; the ballet shoes'
  // soles kicking; the torn notebook spinning into a star-shaped shock; the burnt pan's big star
  // flash and its ring of eight stars; the empty gun's star bursting into shot rings with eight
  // stars turning), each blow white - and the last dead centre: gold, the game's perfect.
  // hits: [{t, heavy}] (the heavy one last); the heavy one is a full H.blow (o.blow: its options;
  // o.stop its stop). o: {at: [x, y]} where they land (default his chest).
  const STAR = () => B.prop('star');
  const star8 = (ctx, c, r, rot, lw, col, a) => {
    ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let i = 0; i <= 16; i++) { const ang = rot + (i / 16) * U.TAU, rr = i % 2 ? r * 0.5 : r; ctx.lineTo(c[0] + Math.cos(ang) * rr, c[1] + Math.sin(ang) * rr); }
    ctx.closePath(); ctx.stroke(); ctx.globalAlpha = 1;
  };
  const ringAt = (ctx, c, r, lw, col, a) => { ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, U.TAU); ctx.stroke(); ctx.globalAlpha = 1; };
  BL.relic = (kind, key, hits, o = {}) => {
    const hex = HEX[key], c0 = o.at || BL.CHEST, heavy = hits.find((h) => h.heavy), stop = o.stop ?? 0.1;
    const tH = heavy ? heavy.t : -1, tl = hits[hits.length - 1].t, t0 = hits[0].t - (o.lead ?? 0.3), t1 = tl + stop + (o.linger ?? 0.55);
    const lt = (t) => (heavy ? BL.creep(t, tH, stop) : t);
    const SND = { knife: [['Laz', 0.5]], glove: [['PunchWeak', 0.4]], shoe: [['PunchWeak', 0.3], ['Star', 0.16]], book: [['BookSpin', 0.32]], pan: [['Frypan', 0.36], ['Star', 0.14]], gun: [['Gunshot', 0.34], ['Star', 0.14]] };
    const SNDH = { knife: [['Laz', 0.6], ['Saber', 0.4]], glove: [['PunchStrong', 0.6]], shoe: [['PunchStrong', 0.45], ['Star', 0.3]], book: [['BookSpin', 0.4], ['Star', 0.35]], pan: [['Frypan', 0.55], ['Sparkles', 0.3]], gun: [['Gunshot2', 0.5], ['Sparkles', 0.3]] };
    hits.forEach((h, i) => {
      if (h.heavy) return;
      for (const [n, v] of SND[kind]) H.sfx(h.t, n, v);
      TL.impact(h.t, { amp: 3.5, dx: i % 2 ? 0.6 : -0.6, dy: -0.3, zoom: 0.018, flash: 0.05, flashCol: [1, 1, 1], flashDecay: 18, dur: 0.22 });
    });
    if (heavy) H.blow(tH, Object.assign({ hex, at: c0, pow: 1.3, stop, sfx: SNDH[kind] }, o.blow || {}));
    // the soul knows its thing: its jar lights as the thing comes
    TL.jar[key].to(t0, t0 + 0.12, { glow: 2.8 }, 'out').to(t0 + 0.12, tl + stop + 0.3, { glow: 1.9 }, 'inOut');
    const gold = (img) => BL.gold(img), wh = (img) => BL.white(img);
    // (o.scale: drawn smaller about where it lands - the game's own size; o.plain: no gold anywhere,
    // the toy knife's cut the game's red)
    const drawRelic = (ctx, emi, t) => {
      const c = c0, a = U.clamp((t - t0) / 0.12) * (1 - U.clamp((t - (t1 - 0.25)) / 0.25));
      if (a <= 0.003) return;
      if (o.scale) { ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(o.scale, o.scale); ctx.translate(-c[0], -c[1]); }
      drawBody(ctx, emi, t, c, a);
      if (o.scale) ctx.restore();
    };
    return TL.add({
      t0, t1, z: -24, live: true, keep: true, name: 'relic ' + kind,
      draw: drawRelic,
    });
    function drawBody(ctx, emi, t, c, a) {
      {
        const T = lt(t);
        const glow = (x, y, r, col = hex, k = 0.35) => { if (emi) F.glowAt(emi, x, y, r, col, k * a); };
        // (the latest hit begun by T, and its phase: < 0 coming, 0.. after)
        let j = 0;
        for (let i = 0; i < hits.length; i++) if (T >= hits[i].t - 0.12) j = i;
        const hj = hits[j], v = T - hj.t;
        if (kind === 'knife') {
          // the toy knife in from above his right shoulder down the line of the cut; on its time the
          // cut opens across all of him - a long blade of gold light - held, then it splits and goes
          const dirv = [-0.78, 0.62], A = [c[0] - dirv[0] * 190, c[1] - dirv[1] * 190], Bq = [c[0] + dirv[0] * 190, c[1] + dirv[1] * 190];
          const ang = Math.atan2(dirv[1], dirv[0]);
          if (v < 0.25) {
            const u = U.clamp((v + 0.12) / 0.12), e = U.eIn(u), p = [U.lerp(c[0] - dirv[0] * 150, c[0] + dirv[0] * 30, e), U.lerp(c[1] - dirv[1] * 150, c[1] + dirv[1] * 30, e)];
            for (let m = 3; m >= 1; m--) { const ee = U.eIn(U.clamp(u - m * 0.12)); F.spr(ctx, B.prop('knife'), U.lerp(c[0] - dirv[0] * 150, c[0] + dirv[0] * 30, ee), U.lerp(c[1] - dirv[1] * 150, c[1] + dirv[1] * 30, ee), { sc: 4, ax: 9, ay: 2, rot: ang + Math.PI, alpha: a * 0.3 / m }); }
            F.spr(ctx, v < 0 || o.plain ? B.prop('knife') : gold(B.prop('knife')), p[0], p[1], { sc: 4, ax: 9, ay: 2, rot: ang + Math.PI, alpha: a * (v < 0.1 ? 1 : 1 - (v - 0.1) / 0.15) });
          }
          if (v >= 0) {
            // (o.plain: no stop to hold it - the cut opens, stays a moment and goes)
            const tE = o.plain ? hj.t + 0.12 : tH + stop, lag = o.plain ? 0 : stop * 0.88;
            const op = U.eOut(U.clamp(v / 0.03)), sp = t < tE ? 0 : U.clamp((T - tE + lag) / 0.3), w = 13 * (1 - sp) * op;
            if (w > 0.5) {
              BL.blade(ctx, [A[0] - dirv[1] * 10 * sp, A[1] + dirv[0] * 10 * sp], [Bq[0] - dirv[1] * 10 * sp, Bq[1] + dirv[0] * 10 * sp], w, o.plain ? { col: '#ff2a2a', core: '#ffe8e0', rim: '#3a0408', alpha: a, cut: sp > 0 ? [0.5 * sp, 1 - 0.5 * sp] : [0, U.clamp(v / 0.03)], crumb: 0.12 } : { col: BL.GOLD, core: '#fffbe8', rim: '#4a2c04', alpha: a, cut: sp > 0 ? [0.5 * sp, 1 - 0.5 * sp] : [0, U.clamp(v / 0.03)], crumb: 0.12 });
              glow(c[0], c[1], 90, o.plain ? '#ff3030' : BL.GOLD, 0.4);
            }
          }
        } else if (kind === 'glove') {
          // three small fists (the game: a punch with each press), then the big one (gold)
          const OFF = [[-30, -6], [28, 8], [-4, 22]];
          hits.forEach((h, i) => {
            const w = T - h.t;
            if (h.heavy) {
              // (it comes at him from the eye: big, then landing)
              if (w < -0.06 || w > 0.36) return;
              const u = U.clamp((w + 0.06) / 0.06), sc = U.lerp(8.5, 5, U.eOut(u)) * (w > 0.1 ? 1 - (w - 0.1) * 0.6 : 1), al = w > 0.16 ? 1 - (w - 0.16) / 0.2 : 1;
              if (w >= 0) { const pw = MV.ART.get('punchPow'); F.spr(ctx, gold(pw), c[0], c[1], { sc: 3.6 * (1 + 0.3 * (1 - U.eOut(U.clamp(w / 0.08)))), ax: 13, ay: 13, alpha: a * al }); }
              F.spr(ctx, gold(MV.ART.get('fistFront')), c[0], c[1] + 6, { sc, ax: 11, ay: 11, alpha: a * al });
              glow(c[0], c[1], 110, BL.GOLD, 0.5);
              return;
            }
            if (w < -0.02 || w > 0.18) return;
            const p = [c[0] + OFF[i % 3][0], c[1] + OFF[i % 3][1]], sc = w < 0.04 ? U.lerp(3.4, 2.4, U.eOut(Math.max(0, w) / 0.04)) : 2.4, al = w > 0.1 ? 1 - (w - 0.1) / 0.08 : 1;
            if (w >= 0 && w < 0.1) F.spr(ctx, wh(MV.ART.get('punchPow')), p[0], p[1], { sc: 1.4, ax: 13, ay: 13, alpha: a * (1 - w / 0.1) });
            F.spr(ctx, MV.ART.get('fistFront'), p[0], p[1], { sc, ax: 11, ay: 11, alpha: a * al });
          });
          // the game's prompt over him: press, again and again (Z, and a pip for each press)
          const tp0 = hits[0].t - 0.06, tp1 = tH;
          if (t >= tp0 && t < tp1 + 0.05) {
            const px = c[0] - 118, py = c[1] - 36, n = hits.filter((h) => T >= h.t).length, blink = Math.floor(t * 12) % 2;
            D.rect(ctx, px - 17, py - 17, 34, 34, '#ffffff', a); D.rect(ctx, px - 14, py - 14, 28, 28, blink ? '#000000' : '#202020', a);
            D.hud(ctx, 'Z', px - 6, py - 6, { color: '#ffff40', alpha: a, scale: 2 });
            for (let i = 0; i < 4; i++) D.rect(ctx, px - 21 + i * 12, py + 22, 8, 6, i < n ? '#ffff40' : '#404040', a);
          }
        } else if (kind === 'shoe') {
          // the soles kicking: in from below on each press, a clap; the third gold
          const POS = [[-34, -8, -0.55], [32, 2, 0.5], [0, -4, -0.12]];
          hits.forEach((h, i) => {
            const w = T - h.t;
            if (w < -0.06 || w > 0.3) return;
            const [ox, oy, rot] = POS[i % 3], g = !!h.heavy, u = U.clamp((w + 0.06) / 0.06), e = U.eIn(u);
            const x = c[0] + ox + (1 - e) * 70, y = c[1] + oy + (1 - e) * 110 - (w > 0.12 ? (w - 0.12) * 260 : 0), sc = (g ? 4.6 : 3) * (w >= 0 && w < 0.05 ? 1.12 - (w / 0.05) * 0.12 : 1);
            const al = w > 0.14 ? 1 - (w - 0.14) / 0.16 : 1;
            F.spr(ctx, g ? gold(MV.ART.get('shoeSole')) : MV.ART.get('shoeSole'), x, y, { sc, ax: 9, ay: 15, rot, alpha: a * al });
            if (w >= 0 && w < 0.14) for (let m = 0; m < 8; m++) {
              const ang = (m / 8) * U.TAU + 0.3, r0 = (g ? 60 : 40) + w * 260, r1 = r0 + (g ? 26 : 16);
              ctx.globalAlpha = a * (1 - w / 0.14); ctx.strokeStyle = g ? BL.GOLD : '#ffffff'; ctx.lineWidth = g ? 4 : 2;
              ctx.beginPath(); ctx.moveTo(c[0] + ox + Math.cos(ang) * r0, c[1] + oy + Math.sin(ang) * r0); ctx.lineTo(c[0] + ox + Math.cos(ang) * r1, c[1] + oy + Math.sin(ang) * r1); ctx.stroke(); ctx.globalAlpha = 1;
            }
            if (g) glow(c[0], c[1], 100, BL.GOLD, 0.45 * al);
          });
        } else if (kind === 'book') {
          // the notebook spinning sideways, counter-clockwise, in at him; each landing a star-shaped
          // shock (the second, gold and wide)
          hits.forEach((h, i) => {
            const w = T - h.t, g = !!h.heavy, img = g ? gold(B.prop('book')) : B.prop('book');
            if (w < -0.24 || w > 0.6) return;
            if (w < 0.14) {
              const u = U.clamp((w + 0.24) / 0.24), e = U.eOut(u), ph = (1 - e) * (g ? 3.2 : 2.2) * Math.PI;
              const x = g ? c[0] : U.lerp(c[0] + 150, c[0] + 6, e), y = g ? c[1] - 4 : U.lerp(c[1] - 30, c[1] - 4, e);
              ctx.save(); ctx.translate(R(x), R(y)); ctx.rotate(-ph * 0.35); ctx.scale((g ? 4.4 : 3) * Math.max(0.12, Math.abs(Math.cos(ph))), g ? 4.4 : 3);
              ctx.globalAlpha = a * (w > 0.06 ? 1 - (w - 0.06) / 0.08 : 1); ctx.drawImage(img, -10.5, -5.5); ctx.restore(); ctx.globalAlpha = 1;
            }
            if (w >= 0) {
              const u = U.clamp(w / (g ? 0.5 : 0.3)), r = (g ? 20 : 12) + U.eOut(u) * (g ? 190 : 70);
              star8(ctx, c, r, -w * 2, g ? 5 : 3, g ? BL.GOLD : '#ffffff', a * (1 - u));
              if (g) star8(ctx, c, r * 0.62, 0.4 - w * 3, 3, '#fff8d0', a * (1 - u));
              if (g) glow(c[0], c[1], 120, BL.GOLD, 0.45 * (1 - u));
            }
          });
        } else if (kind === 'pan') {
          // the burnt pan swung in on each press; a big star flashing on him; the last, gold, throws
          // out a ring of eight stars
          hits.forEach((h, i) => {
            const w = T - h.t, g = !!h.heavy;
            if (w < -0.1 || w > (g ? 0.7 : 0.2)) return;
            if (w < 0.12) {
              const u = U.clamp((w + 0.1) / 0.1), th = U.lerp(1.4, -0.25, U.eIn(u)), piv = [c[0] + 110, c[1] + 24];
              F.spr(ctx, g ? gold(B.prop('pan')) : B.prop('pan'), piv[0], piv[1], { sc: g ? 4 : 3, ax: 21, ay: 5, rot: th, alpha: a * (w > 0.04 ? 1 - (w - 0.04) / 0.08 : 1) });
            }
            if (w >= 0) {
              const s = (g ? 12 : 8) * (w < 0.06 ? 1.3 - (w / 0.06) * 0.3 : 1) * (1 - Math.max(0, w - 0.08) * 1.4), al = g ? (w < 0.2 ? 1 : 1 - (w - 0.2) / 0.1) : 1 - w / 0.2;
              if (s > 0.5 && al > 0) F.spr(ctx, g ? gold(STAR()) : wh(STAR()), c[0] + (g ? 0 : (i % 2 ? 14 : -14)), c[1] + (g ? 0 : (i % 3) * 8 - 8), { sc: s, ax: 3.5, ay: 3.5, alpha: a * al, rot: w * 2 });
              if (g) {
                const u = U.clamp((w - 0.06) / 0.6);
                if (u > 0) for (let m = 0; m < 8; m++) { const ang = (m / 8) * U.TAU - u * 1.2, r = 20 + U.eOut(u) * 170; F.spr(ctx, gold(STAR()), c[0] + Math.cos(ang) * r, c[1] + Math.sin(ang) * r * 0.85, { sc: 3.4, ax: 3.5, ay: 3.5, rot: u * 6, alpha: a * (1 - u * u) }); }
                glow(c[0], c[1], 120, BL.GOLD, 0.45 * (1 - U.clamp(w / 0.5)));
              }
            }
          });
        } else if (kind === 'gun') {
          // the empty gun at his right, a star shot into him with each press; the last, gold: a big
          // star bursting into rings of gunshot, eight stars turning counter-clockwise round them
          let rec = 0;
          for (const h of hits) if (T >= h.t - 0.06) rec = Math.max(rec, 10 * Math.exp(-(T - h.t + 0.06) * 16));
          const G = [c[0] + 170 + rec, c[1] + 2], muz = [G[0] - 26, G[1] - 9];
          F.spr(ctx, heavy && T >= tH - 0.06 ? gold(B.prop('gun')) : B.prop('gun'), G[0], G[1], { sc: 4, ax: 7, ay: 3, flip: true, alpha: a });
          hits.forEach((h, i) => {
            const w = T - h.t, g = !!h.heavy, tg = g ? c : [c[0] + (i % 2 ? 12 : -10), c[1] + (i % 3) * 10 - 10];
            if (w < -0.06 || w > (g ? 0.75 : 0.22)) return;
            if (w < 0) { const u = (w + 0.06) / 0.06; F.spr(ctx, g ? gold(STAR()) : wh(STAR()), U.lerp(muz[0], tg[0], u), U.lerp(muz[1], tg[1], u), { sc: g ? 4 : 2.6, ax: 3.5, ay: 3.5, rot: u * 4, alpha: a }); if (u < 0.4) D.rect(ctx, muz[0] - 6, muz[1] - 6, 12, 12, '#fff6c0', a); return; }
            if (!g) { F.spr(ctx, wh(STAR()), tg[0], tg[1], { sc: 3.2 * (1 - w / 0.22), ax: 3.5, ay: 3.5, alpha: a, rot: w * 5 }); ringAt(ctx, tg, 6 + w * 140, 2, '#ffffff', a * (1 - w / 0.22)); return; }
            const s = 10 * (w < 0.06 ? 1.3 - (w / 0.06) * 0.3 : 1) * (1 - U.clamp((w - 0.12) / 0.2));
            if (s > 0.4) F.spr(ctx, gold(STAR()), c[0], c[1], { sc: s, ax: 3.5, ay: 3.5, alpha: a, rot: w * 2 });
            for (let k = 0; k < 3; k++) { const u = U.clamp((w - 0.05 - k * 0.07) / 0.45); if (u > 0 && u < 1) ringAt(ctx, c, 12 + U.eOut(u) * 140, 4 - k, k ? '#fff8d0' : BL.GOLD, a * (1 - u)); }
            const u = U.clamp((w - 0.04) / 0.66);
            if (u > 0) for (let m = 0; m < 8; m++) { const ang = (m / 8) * U.TAU - u * 3.2, r = 30 + U.eOut(u) * 130; F.spr(ctx, gold(STAR()), c[0] + Math.cos(ang) * r, c[1] + Math.sin(ang) * r * 0.85, { sc: 3, ax: 3.5, ay: 3.5, rot: -u * 8, alpha: a * (1 - u * u) }); }
            glow(c[0], c[1], 120, BL.GOLD, 0.45 * (1 - U.clamp(w / 0.5)));
          });
        }
      }
    }
  };

  // ---------------------------------------------------------------- bar 71: the cage broken from inside
  // The soul throws itself at the box's walls, one blow a step of the walk-up: a little back the
  // other way first, then a sixteenth into the wall. Where it strikes, the frame bulges out (a fast
  // swell, then a dent that stays) and splits there - a gap in the white with the soul's red light
  // in it, cracks running out of it - and white chips fly; the camera is kicked that way. The last
  // blow ('ALL') is the soul swelling against all four walls at once. At tBurst the frame flies
  // apart in white shards - as MERCY did - and the soul's light floods the hall.
  // slams: [{t, side: 'L' | 'R' | 'T' | 'B' | 'ALL', at: -1..1 along the side, pow}]; box: {cx, cy, w, h}
  BL.cage = (box, slams, tBurst) => {
    const hw = box.w / 2, hh = box.h / 2, cx = box.cx, cy = box.cy, t0 = slams[0].t - 0.03;
    const SIDE = { L: [-1, 0], R: [1, 0], T: [0, -1], B: [0, 1] };
    // a point on a side (u: -1..1 along it) and how far it is pushed out at t
    const bulge = (side, u, t) => {
      let d = 0;
      for (const s of slams) {
        if (t < s.t) continue;
        const all = s.side === 'ALL';
        if (!all && s.side !== side) continue;
        const pw = s.pow ?? 1, v = t - s.t, k = Math.exp(-(((u - (all ? 0 : s.at || 0)) / (all ? 1.3 : 0.42)) ** 2));
        d += k * pw * (all ? 4 : 5) + k * pw * 10 * Math.exp(-v * 11) * Math.cos(v * 30) * (v < 0.45 ? 1 : 0);
      }
      return d * Math.cos((u * Math.PI) / 2);
    };
    const onSide = (side, u, t) => {
      const n = SIDE[side], d = bulge(side, u, t);
      return n[0] ? [cx + n[0] * (hw + d), cy + u * hh] : [cx + u * hw, cy + n[1] * (hh + d)];
    };
    // the splits: where each blow lands (the last: one on each side), cracks running out of it
    const cracks = [];
    slams.forEach((s, i) => {
      const where = s.side === 'ALL' ? [['T', 0.35], ['R', -0.5], ['B', 0.6], ['L', -0.3]] : [[s.side, s.at || 0]];
      where.forEach(([side, u], w) => {
        const n = SIDE[side], lines = [];
        for (let b = 0; b < 3; b++) {
          let x = 0, y = 0, a = Math.atan2(n[1], n[0]) + Math.PI + (b - 1) * 0.95;
          const line = [[0, 0]];
          for (let k = 0; k < 5; k++) { a += (U.hash(i * 7.1 + w * 2.3 + b * 3.3 + k) - 0.5) * 1.2; x += Math.cos(a) * (5 + 4 * U.hash(i + k + w)); y += Math.sin(a) * (5 + 4 * U.hash(k * 2 + i + w)); line.push([x, y]); }
          lines.push(line);
        }
        cracks.push({ t: s.t, side, u, n, lines, pow: s.pow ?? 1 });
      });
    });
    // the soul: back a little the other way, a sixteenth into the wall, bouncing off; the last: it
    // gathers itself small in the middle and swells against all four walls
    slams.forEach((s, i) => {
      const pw = s.pow ?? 1;
      if (s.side === 'ALL') {
        TL.heart.to(s.t - 0.12, s.t - 0.03, { x: cx, y: cy, sc: 0.7 }, 'out');
        TL.heart.to(s.t - 0.03, s.t, { sc: 2.4, glow: 2.2 }, 'in');
        TL.heart.to(s.t + 0.04, s.t + 0.3, { sc: 1.5, glow: 1.6 }, 'out');
      } else {
        const n = SIDE[s.side], p = onSide(s.side, s.at || 0, s.t - 0.01), inP = [p[0] - n[0] * 11, p[1] - n[1] * 11], back = [cx - n[0] * 24, cy - n[1] * 24];
        TL.heart.to(s.t - 0.12, s.t - 0.05, { x: back[0], y: back[1], sc: 0.82 }, 'out');
        TL.heart.to(s.t - 0.05, s.t, { x: inP[0], y: inP[1], sc: 1.3, glow: 0.5 + 0.3 * i }, 'in');
        TL.heart.to(s.t + 0.02, s.t + 0.16, { x: U.lerp(inP[0], cx, 0.7), y: U.lerp(inP[1], cy, 0.7), sc: 1 }, 'out');
      }
      const n = SIDE[s.side] || [0, 0];
      H.sfx(s.t, 'Slam', 0.26 + 0.14 * pw); H.sfx(s.t, 'Break1', 0.16 + 0.12 * pw); H.sfx(s.t, 'Impact', 0.16 + 0.08 * pw);
      TL.impact(s.t, { amp: 3 + 6 * pw, dx: n[0], dy: n[1], zoom: 0.015 + 0.02 * pw, flash: 0.06 + 0.06 * pw, flashCol: [1, 0.2, 0.15], flashDecay: 12, dur: 0.35 });
      if (pw >= 1.4) H.stop(s.t, 0.05);
    });
    // (the box's own frame and black are hidden: the struck one is drawn here)
    TL.box2.set(t0, { fa: 0, fill: 0 }).set(tBurst, { a: 0, fa: 1, fill: 1 });
    const N = 24;
    TL.add({
      t0, t1: tBurst, z: 4, name: 'the cage, struck',
      draw(ctx, emi, t) {
        const P = { T: [], R: [], B: [], L: [] };
        for (const side of ['T', 'R', 'B', 'L']) for (let k = 0; k <= N; k++) P[side].push(onSide(side, -1 + (2 * k) / N, t));
        // inside: black, out to the struck frame
        ctx.fillStyle = '#000000'; ctx.beginPath();
        [...P.T, ...P.R, ...P.B.slice().reverse(), ...P.L.slice().reverse()].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath(); ctx.fill();
        ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = '#ffffff'; ctx.lineJoin = 'miter'; ctx.lineCap = 'square';
        for (const side of ['T', 'R', 'B', 'L']) { ctx.beginPath(); P[side].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
        ctx.restore();
        const lit = cracks.filter((q) => t >= q.t).length;
        for (const cr of cracks) {
          if (t < cr.t) continue;
          const v = t - cr.t, k = Math.min(1.4, 0.5 + 0.09 * lit) * (1 + 0.8 * Math.exp(-v * 8)), gap = 3 + 3 * cr.pow, p = onSide(cr.side, cr.u, t), [nx, ny] = cr.n;
          // (the gap across the white line, the red light in it)
          const gw = nx ? 9 : gap * 2, gh = nx ? gap * 2 : 9;
          D.rect(ctx, p[0] - gw / 2, p[1] - gh / 2, gw, gh, '#000000');
          D.rect(ctx, p[0] - gw / 2 + 2, p[1] - gh / 2 + 2, gw - 4, gh - 4, '#ff3a2a', Math.min(1, k));
          ctx.save(); ctx.strokeStyle = '#ff5a3a'; ctx.globalAlpha = Math.min(1, k * 0.85); ctx.lineWidth = 2;
          for (const line of cr.lines) { ctx.beginPath(); line.forEach(([x, y], i) => (i ? ctx.lineTo(p[0] + x, p[1] + y) : ctx.moveTo(p[0] + x, p[1] + y))); ctx.stroke(); }
          ctx.restore();
          if (emi) F.glowAt(emi, p[0], p[1], 22 + 10 * cr.pow, '#ff3020', 0.4 * Math.min(1, k));
          // white chips knocked off it, out and falling
          if (v < 0.6) for (let m = 0; m < 12; m++) {
            const a = Math.atan2(ny, nx) + (U.hash(m * 3.3 + cr.t + cr.u) - 0.5) * 2.2, sp = 90 + 230 * U.hash(m * 1.9 + cr.t), x = p[0] + Math.cos(a) * sp * v, y = p[1] + Math.sin(a) * sp * v + 320 * v * v;
            D.rect(ctx, R(x), R(y), m % 3 ? 2 : 3, 2, '#ffffff', 1 - v / 0.6);
          }
        }
        // (the soul's light pressing at the walls from inside, more with every blow)
        if (emi && lit) F.glowAt(emi, cx, cy, 60 + 14 * lit, '#ff3020', 0.06 * lit);
      },
    });
    // the burst: the frame in pieces flung out, turning, falling
    const shards = [];
    for (const side of ['T', 'R', 'B', 'L']) {
      const n = SIDE[side];
      for (let k = 0; k < 10; k++) {
        const u = -1 + (2 * k + 1) / 10, p = onSide(side, u, tBurst - 0.001), h1 = U.hash(k * 3.1 + side.charCodeAt(0)), d = [p[0] - cx, p[1] - cy], L = Math.hypot(d[0], d[1]) || 1;
        shards.push({ p, v: [(d[0] / L) * (280 + 420 * h1) + n[0] * 120, (d[1] / L) * (240 + 380 * h1) + n[1] * 120 - 140], len: 10 + 14 * U.hash(k + side.charCodeAt(0) * 2), vert: !!n[0], spin: (h1 - 0.5) * 16 });
      }
    }
    TL.add({
      t0: tBurst, t1: tBurst + 1.1, z: 36, live: true, name: 'the cage bursts',
      draw(ctx, emi, t) {
        const v = t - tBurst;
        for (const s of shards) {
          const x = s.p[0] + s.v[0] * v, y = s.p[1] + s.v[1] * v + 460 * v * v, a = 1 - v / 1.1;
          ctx.save(); ctx.translate(R(x), R(y)); ctx.rotate(s.spin * v); ctx.globalAlpha = a; ctx.fillStyle = '#ffffff';
          ctx.fillRect(s.vert ? -2.5 : -s.len / 2, s.vert ? -s.len / 2 : -2.5, s.vert ? 5 : s.len, s.vert ? s.len : 5);
          ctx.restore();
          if (emi && v < 0.3) D.rect(emi, x - 6, y - 6, 12, 12, '#ff6040', 0.4 * (1 - v / 0.3));
        }
        ctx.globalAlpha = 1;
      },
    });
    H.sfx(tBurst, 'GlassBreak', 0.55); H.sfx(tBurst, 'BreakBig', 0.5); H.sfx(tBurst, 'Explosion', 0.3);
    TL.impact(tBurst, { amp: 16, zoom: 0.07, rot: 0.02, flash: 0.16, flashCol: [1, 0.86, 0.8], flashDecay: 8, dur: 0.6 });
    BL.flood(tBurst, [cx, cy]);
  };
  // the soul's light let out of the cage: the hall's own rectangles in its red and white running out
  // from where the box was, past the picture; motes of it streaming out with them; a low red glow
  BL.flood = (t0, c, o = {}) => {
    const dur = o.dur ?? 1.2;
    return TL.add({
      t0, t1: t0 + dur, z: o.z ?? -399, live: true, name: 'the light let out',
      draw(ctx, emi, t) {
        const u = (t - t0) / dur;
        for (let i = 0; i < 5; i++) {
          const v = U.clamp(u * 1.7 - i * 0.12);
          if (v <= 0 || v >= 1) continue;
          const r = 40 + U.eOut(v) * 640, a = 0.9 * (1 - v);
          ctx.globalAlpha = a; ctx.strokeStyle = i % 2 ? '#ffffff' : '#ff3a2a'; ctx.lineWidth = R(10 * (1 - v) + 3);
          ctx.strokeRect(R(c[0] - r * 1.45), R(c[1] - r), R(2 * r * 1.45), R(2 * r));
        }
        for (let m = 0; m < 56; m++) {
          const a = U.hash(m * 3.3 + 1) * U.TAU, sp = 160 + 360 * U.hash(m * 1.9), r = 16 + sp * (t - t0) * (1 - 0.35 * u);
          D.rect(ctx, R(c[0] + Math.cos(a) * r * 1.3), R(c[1] + Math.sin(a) * r * 0.85), 2, 2, m % 4 ? '#ff4a36' : '#ffd8c8', (1 - u) * (0.5 + 0.5 * U.hash(m * 7.7)));
        }
        ctx.globalAlpha = 1;
        if (emi) F.glowAt(emi, c[0], c[1], 80 + 220 * U.eOut(u), '#ff3020', 0.32 * (1 - u));
      },
    });
  };
})();
