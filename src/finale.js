// The finale's tools (act four, bars 53-73; act five). Each is a stateless timeline event:
//  - the memories, told the way the game tells its intro: a faded painting (src/art.js memPie ...)
//    in the dark above the text box, panning slowly, crossfading; golden petals drifting over it;
//    lines with a star each (the game's two-line messages)
//  - the stored blows (61-66), the soul's save stars, the all-out blow (52, 67)
//  - the end: the kneel (the sheet's kneel frame with his battle faces set on it where the game
//    sets them), the trident falling, the friendliness pellets
// (the blows that land on him - the counters, the relics, the last one - are src/blow.js)
// What is drawn on him lives on his plane, so it stays on him whichever way the camera turns.
(function () {
  const MV = window.MV, TL = MV.TL, U = MV.U, H = MV.H, D = MV.D, F = MV.F, B = MV.B2;
  const R = Math.round, HEX = MV.COL.S;
  const FIN = (MV.FIN = {});
  const prop = (n) => B.prop(n);

  // ---------------------------------------------------------------- lines, a star each
  // lines typed one after another in the text box, each with its own star (o.step, o.gap between
  // them); returns when the last one is typed
  FIN.stars = (t0, t1, lines, o = {}) => {
    let t = t0;
    lines.forEach((s, i) => {
      const step = o.step ?? 0.04, times = H.typeTimes(t, s, step);
      H.say(t, t1, s, Object.assign({ anchor: B.boxAnchor(0, 36 * i), voice: 'Txt1', vol: 0.26, step, times }, o.say || {}));
      t = times[times.length - 1] + (o.gap ?? 0.12);
    });
    return t;
  };

  // ---------------------------------------------------------------- the memories
  // m: {name (MV.ART) | img (MV.img: the game's own panels, src/assets_story.js), t0, t1, in, out
  // (fades, s), pan: [x0, y0, x1, y1] (the window's corner in the painting at its start and end,
  // its px; eased), flash: it flashes up white (a memory flashing past; a number: how strongly)}.
  // The window: 184 x 102 of the painting (the game's panels are 200 x 110), at 2x, centred above
  // the text box.
  const MW = 184, MH = 102, MX = 480 - MW, MY = 168 - MH;
  FIN.MEM_RECT = [MX, MY, MW * 2, MH * 2];
  FIN.memories = (list, o = {}) => TL.add({
    t0: Math.min(...list.map((m) => m.t0)), t1: Math.max(...list.map((m) => m.t1)), z: o.z ?? 22, name: 'memories', keep: true,
    draw(ctx, emi, t) {
      for (const m of list) {
        if (t < m.t0 || t >= m.t1) continue;
        const a = U.smooth(U.clamp((t - m.t0) / (m.in ?? 0.5))) * U.smooth(U.clamp((m.t1 - t) / (m.out ?? 0.5)));
        if (a <= 0.003) continue;
        const pic = m.img ? MV.img(m.img) : MV.ART.get(m.name), u = U.smooth(U.clamp((t - m.t0) / (m.t1 - m.t0))), p = m.pan || [8, 4, 8, 4];
        const ox = U.lerp(p[0], p[2], u), oy = U.lerp(p[1], p[3], u);
        ctx.save();
        ctx.beginPath(); ctx.rect(MX, MY, MW * 2, MH * 2); ctx.clip();
        ctx.globalAlpha = a; ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pic, R(MX - ox * 2), R(MY - oy * 2), pic.width * 2, pic.height * 2);
        if (m.flash) {
          const f = 1 - U.clamp((t - m.t0) / 0.5);
          if (f > 0) { ctx.globalAlpha = a * f * f * (m.flash === true ? 0.9 : m.flash); ctx.fillStyle = '#fff6e2'; ctx.fillRect(MX, MY, MW * 2, MH * 2); }
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    },
  });

  // ---------------------------------------------------------------- golden petals
  // drifting down through the dark over the memories (the garden's flowers, the bed's in the ruins),
  // in place of his embers; k: t -> 0..1. They fade before the text box.
  const PETAL = ['#f8dc80', '#e9b848', '#fff2b8', '#d89a38'];
  FIN.petals = (t0, t1, k) => TL.add({
    t0, t1, z: 24, name: 'petals', keep: true,
    draw(ctx, emi, t) {
      const kk = k(t);
      if (kk <= 0.01) return;
      for (let i = 0; i < 28; i++) {
        if (i / 28 > kk * 1.3) break;
        const h1 = U.hash(i * 1.93 + 4), h2 = U.hash(i * 3.71 + 1), h3 = U.hash(i * 7.13 + 2);
        const life = 5 + 3 * h3, u = (((t / life + h1) % 1) + 1) % 1;
        const x = 200 + 560 * h2 + Math.sin(t * (0.9 + h3) + i) * 16 + (u - 0.5) * 40 * (h1 - 0.5), y = 28 + u * 250;
        const a = kk * Math.min(1, Math.sin(Math.PI * Math.min(1, u * 1.15)) * 1.6) * U.clamp((276 - y) / 26);
        if (a <= 0.02) continue;
        const ph = Math.floor(t * 7 + i * 1.7) % 4, w = ph === 1 ? 4 : 2, h = ph === 3 ? 4 : 2;
        D.rect(ctx, R(x / 2) * 2, R(y / 2) * 2, w, h, PETAL[i % 4], a);
        if (emi && i % 3 === 0) D.rect(emi, x - 3, y - 3, 8, 8, '#ffd070', 0.1 * a);
      }
    },
  });

  // ---------------------------------------------------------------- the trident, by its own pixels
  // a pixel of the trident sprite ('spear', 240 x 62, row 31 its axis) in world px at t, as he
  // holds it (MV.spearTip's frame); its three points: 0 the upper, 1 the middle, 2 the lower
  FIN.spearPt = (t, sx, sy) => {
    const a = MV.spearTip(t, 0), b = MV.spearTip(t, 1), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, k = 2 * (TL.trident.at(t).sc ?? 1), v = sy - 31;
    return [a[0] + ux * (sx / 240) * L - uy * v * k, a[1] + uy * (sx / 240) * L + ux * v * k];
  };
  const PRONG = [[213, 21], [228, 30], [213, 40]];
  FIN.prongAt = (t, i) => FIN.spearPt(t, PRONG[i][0], PRONG[i][1]);
  const inFrame = (t) => String(TL.bossPose.at(t)).startsWith('f:') || TL.bossPose.at(t) === 'none';
  const sparks = (ctx, x, y, v, cols, n = 12, r0 = 6, r1 = 40, seed = 0) => {
    for (let m = 0; m < n; m++) {
      const a = U.hash(m * 3.1 + seed) * U.TAU, r = r0 + (r1 - r0) * U.eOut(v) * (0.5 + 0.5 * U.hash(m * 1.7 + seed));
      D.rect(ctx, R(x + Math.cos(a) * r) - 1, R(y + Math.sin(a) * r) - 1, 2, 2, cols[m % cols.length], 1 - v);
    }
  };

  // ---------------------------------------------------------------- the stored blows
  // FF14's E12S door boss draws two primals' attacks from its crystals and either looses them at
  // once or STOCKS them, to RELEASE them later on top of other things - you must remember what
  // was stored. Told in UT's own terms: the game already makes you remember - before his slashes
  // his eyes flash their colours in order. Here his eyes flash a pair of borrowed colours, the
  // two jars' ribbons send a bead of light up into the trident, and one of its three points
  // keeps them: a small flame in the two colours (a weapon loaded). Released later, it flares
  // with each blow it lets go and goes dark.
  //   FIN.load(prong, keys, tLoad, tOut, {flares: [t]})
  FIN.load = (prong, keys, tLoad, tOut, o = {}) => {
    const cols = keys.map((k) => HEX[k]), flares = o.flares || [];
    H.sfx(tLoad, 'Grab', 0.4); H.sfx(tLoad, 'Target', 0.22);
    flares.forEach((tf) => H.sfx(tf, 'Spellcast', 0.16));
    return TL.add({
      t0: tLoad - 0.01, t1: tOut + 0.45, z: -43, keep: true, name: 'stored ' + keys.join('+'),
      draw(ctx, emi, t) {
        if (inFrame(t)) return;
        const p = FIN.prongAt(t, prong);
        if (t < tOut) {
          // the two small flames on the point, flickering against each other; a glint
          let fl = 0;
          for (const tf of flares) if (t >= tf && t < tf + 0.25) fl = Math.max(fl, 1 - (t - tf) / 0.25);
          cols.forEach((hex, i) => B.fire(ctx, emi, p[0] + (i ? 6 : -6), p[1] - 7 - (Math.sin(t * 19 + i * 2.3) > 0.2 ? 2 : 0), t, i + prong * 2, { hex, sc: 1.35 + 0.5 * fl, glow: 1 + fl }));
          const g = Math.max(fl, Math.pow(Math.max(0, Math.sin(t * 4.2 + prong)), 12));
          if (g > 0.05) { D.rect(ctx, R(p[0]) - 1, R(p[1] - 6 - 7 * g), 2, R(14 * g), '#ffffff', g); D.rect(ctx, R(p[0] - 7 * g), R(p[1] - 6) - 1, R(14 * g), 2, '#ffffff', g); }
          if (emi) F.glowAt(emi, p[0], p[1] - 4, 22 + 26 * fl, cols[Math.floor(t * 6) % 2], 0.35 + 0.4 * fl);
        }
        // loaded: a ring and the sparks of both colours
        const v = (t - tLoad) / 0.4;
        if (v >= 0 && v < 1) {
          ctx.save(); ctx.globalAlpha = 1 - v; ctx.strokeStyle = cols[0]; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p[0], p[1], 4 + 30 * U.eOut(v), 0, U.TAU); ctx.stroke();
          ctx.strokeStyle = cols[1]; ctx.beginPath(); ctx.arc(p[0], p[1], 2 + 18 * U.eOut(v), 0, U.TAU); ctx.stroke(); ctx.restore();
          sparks(ctx, p[0], p[1], v, cols.concat(['#ffffff']), 14, 4, 46, prong + tLoad);
        }
        // let go: the colours flung off the point, then dark
        const w = (t - tOut) / 0.4;
        if (w >= 0 && w < 1) sparks(ctx, p[0], p[1], w, cols, 10, 2, 30, prong + tOut + 1);
      },
    });
  };
  // the storing, as he does it: his eyes flash the two colours (o.gap apart), a bead of light runs
  // up each jar's ribbon into the shaft and on to the point (o.rib(key): the ribbon's {at, lift,
  // seed}, as H.ribbon draws it); o.delay: the beads wait that long after the eyes; o.preview(ctx,
  // emi, t, k): what is being stored, shown faintly in the box before it is drawn in. Returns the
  // time the point is loaded.
  FIN.store = (t, prong, keys, tOut, o = {}) => {
    const gap = o.gap ?? 0.26, run = 0.3, up = 0.12, delay = o.delay ?? 0, tLoad = t + gap + delay + run + up;
    keys.forEach((k, i) => H.eyes(t + i * gap, HEX[k], 0.34, { vol: i ? 0 : 0.3 }));
    H.sfx(t + 0.02, 'Sparkle', 0.18); H.sfx(t + gap + 0.02, 'Sparkle', 0.14);
    const rib = o.rib || (() => ({ at: 0.7, lift: 30, seed: 0 }));
    const ribPt = (k, tt, u) => {
      const r = rib(k), a = B.jarSoul(k, tt), b = MV.spearTip(tt, r.at), mid = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 40 - (r.lift ?? 30)];
      const x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * mid[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * mid[1] + u * u * b[1];
      return [x, y + Math.sin(u * 9 - tt * 7 + (r.seed || 0)) * 4 * Math.sin(u * Math.PI)];
    };
    TL.add({
      t0: t, t1: tLoad + 0.05, z: -42, keep: true, name: 'storing ' + keys.join('+'),
      draw(ctx, emi, tt) {
        keys.forEach((k, i) => {
          const t0 = t + i * gap + delay, hex = HEX[k];
          for (let j = 0; j < 4; j++) {
            const ts = tt - j * 0.025, u = (ts - t0) / run;
            if (u < 0) continue;
            let p;
            if (u <= 1) p = ribPt(k, ts, U.eIn(u));
            else {
              const v = U.clamp((ts - t0 - run) / up), r = rib(k);
              if (ts > tLoad) continue;
              const s = FIN.spearPt(ts, U.lerp(r.at * 240, PRONG[prong][0], v), U.lerp(31, PRONG[prong][1], v));
              p = s;
            }
            const sz = j ? 2 : 4;
            D.rect(ctx, R(p[0] - sz / 2), R(p[1] - sz / 2), sz, sz, j ? hex : '#ffffff', 1 - j * 0.22);
            if (!j && emi) F.glowAt(emi, p[0], p[1], 14, hex, 0.5);
          }
        });
      },
    });
    if (o.preview) TL.add({
      t0: t, t1: tLoad, z: 3, clip: 'box', name: 'stored, shown',
      draw(ctx, emi, tt) { o.preview(ctx, emi, tt, U.clamp((tt - t) / 0.12) * (1 - U.clamp((tt - tLoad + 0.2) / 0.2))); },
    });
    FIN.load(prong, keys, tLoad, tOut, o);
    return tLoad;
  };

  // ---------------------------------------------------------------- the soul saves (61-63)
  // its storing, the other side of his: a save point's star by the soul, twinkling, drawn into it
  FIN.saveStar = (t, o = {}) => {
    const STAR = prop('star'), dx = o.dx ?? 22, dy = o.dy ?? -20, hold = o.hold ?? 0.3, dive = 0.18;
    H.sfx(t, 'Sparkle', 0.14); H.sfx(t + hold + dive, o.sfx || 'Ding', o.vol ?? 0.14);
    return TL.add({
      t0: t, t1: t + hold + dive + 0.45, z: 42, name: 'save star',
      draw(ctx, emi, tt) {
        const s = TL.heart.at(tt);
        if (s.a < 0.05) return;
        const u = (tt - t) / hold, v = (tt - t - hold) / dive;
        if (v < 1) {
          const e = U.eIn(U.clamp(v)), x = s.x + dx * (1 - e), y = s.y + dy * (1 - e), tw = 1 + 0.25 * Math.sin(tt * 30);
          F.spr(ctx, STAR, x, y, { sc: 2 * U.eOutBack(U.clamp(u * 2.5)) * tw * (1 - 0.6 * e), ax: 3.5, ay: 3.5, rot: tt * 2 });
          if (emi) F.glowAt(emi, x, y, 14, '#ffe86a', 0.5);
        }
        const w = (tt - t - hold - dive) / 0.45;
        if (w >= 0 && w < 1) {
          ctx.save(); ctx.globalAlpha = 0.85 * (1 - w); ctx.strokeStyle = '#ffe86a'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(s.x, s.y, 8 + 22 * U.eOut(w), 0, U.TAU); ctx.stroke(); ctx.restore();
          if (emi) F.glowAt(emi, s.x, s.y, 22, '#ff4030', 0.5 * (1 - w));
        }
      },
    });
  };

  // ---------------------------------------------------------------- the all-out blow
  // The seven colours gathered on the trident in one stroke (bar 52; again at 67), told the way
  // the best 2D fighting is told (Limbus Company: held key poses, the camera and the light doing
  // the work) - and the attack is everything (user, 2026-10-04: the camera rides the trident):
  //   tIn .. tSw   behind him the hall goes dark, its rings coming back round him as hard bands of
  //                the seven colours rushing out; he holds the trident up, still; hard rays off
  //                its points; the end of the hold draws everything in (sparks sucked back to the
  //                points, lines rushing at them) - the camera up at him, then close on the points
  //   tSw .. tHit  the stroke: the trident down through its whole arc, faster and faster, a trail
  //                of the seven colours behind the shaft; the camera rides the points down the
  //                arc, rolling with it, and at the end carries on to what they strike
  //   tHit         one hard black-and-white frame; the crescent in hard bands with a white edge;
  //                the points and the soul in one picture, close (the game's pixels big)
  //   .. + hold    everything stops
  //   + hold       the blow lands: shake, flash, the bands flung out, the dark lifting (the HP is
  //                the caller's); the camera thrown back
  // One blow, one kill: no afterblows (user, 2026-10-04).
  // o: {tIn, tSw, tHit, hold, soul: [x, y], cam: false (the caller frames it all), camY,
  //     holdPose, afterPose, afterExtra}
  const SPEC7 = ['purple', 'blue', 'aqua', 'green', 'yellow', 'orange'].map((k) => HEX[k]).concat(['#ff3a2a']);
  FIN.SPEC7 = SPEC7;
  // the pose the stroke ends in (the 'slam' pose's channels: hold it after with H.pose(.., 'slam',
  // .., FIN.STRUCK))
  FIN.STRUCK = { crouch: 11, grot: -0.8, gx: -36, gy: 4, by: 6, flare: 1.0, lean: 0.03 };
  // the game's crescent (swipeSpear5 / 6) in hard bands round its hollow - violet inside, his red
  // at the rim - its leading edge white, a dark line round it (1 px padding: anchor + 1)
  const crescentImg = (i) => F.cached('finCrescent' + i, () => {
    const src = MV.img('swipeSpear' + i), w = src.width + 2, h = src.height + 2, [c, x] = MV.canvas(w, h);
    x.drawImage(src, 1, 1);
    const d = x.getImageData(0, 0, w, h).data, lit = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) lit[p] = d[p * 4 + 3] > 0 && d[p * 4] > 128 ? 1 : 0;
    const L = (i2, j) => i2 >= 0 && j >= 0 && i2 < w && j < h && lit[j * w + i2] === 1;
    const out = x.createImageData(w, h), o = out.data;
    for (let j = 0; j < h; j++) for (let i2 = 0; i2 < w; i2++) {
      const p = (j * w + i2) * 4;
      let col = null;
      if (L(i2, j)) {
        const dd = U.clamp((Math.hypot(i2 - 1 - 98, (j - 1 - 66) * 0.9) - 46) / 120), k = Math.min(6, Math.floor(dd * 7));
        const edge = !L(i2 + 1, j) || !L(i2 - 1, j) || !L(i2, j + 1) || !L(i2, j - 1);
        col = edge && dd > 0.55 ? [255, 248, 236] : F.rgb(SPEC7[k]);
      } else if (L(i2 + 1, j) || L(i2 - 1, j) || L(i2, j + 1) || L(i2, j - 1)) col = [18, 8, 26];
      if (col) { o[p] = col[0]; o[p + 1] = col[1]; o[p + 2] = col[2]; o[p + 3] = 255; }
    }
    x.putImageData(out, 0, 0);
    return c;
  });
  // the same crescent in his red only (bar 67: the six colours have left it)
  const crescentRed = (i) => F.cached('finCrescentRed' + i, () => F.recolor('finCrescentRedR' + i, crescentImg(i), (r, g, b, a) => {
    const l = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
    return l > 0.9 ? [255, 248, 236, a] : l < 0.12 ? [r, g, b, a] : [255, 58 + R(40 * l), 42, a];
  }));
  // the crescent with some of the six gone from it (gone: their keys - what they lent is no longer
  // his; their bands his red): 67, three souls already the child's (src/tl_act4e.js)
  const SPEC_KEYS = ['purple', 'blue', 'aqua', 'green', 'yellow', 'orange'];
  const crescentGone = (i, gone) => F.cached('finCrescentGone' + i + gone.join(), () => {
    const goneRGB = gone.map((k) => F.rgb(HEX[k]));
    return F.recolor('finCrescentGoneR' + i + gone.join(), crescentImg(i), (r, g, b, a) => (goneRGB.some((q) => q[0] === r && q[1] === g && q[2] === b) ? [255, 58, 42, a] : [r, g, b, a]));
  });
  FIN.crescentImg = (i, gone) => (gone && gone.length ? crescentGone(i, gone) : crescentImg(i));
  const STRIKES = [];
  // (a colour of the seven at t: with o.peel the six borrowed ones go one by one, violet first,
  // leaving his red; with o.gone those souls' bands are his red already)
  const colOf = (s, i, t) => ((s.peel && i < 6 && t >= s.peel.t0 + i * s.peel.step) || (s.gone && i < 6 && s.gone.includes(SPEC_KEYS[i])) ? '#ff3a2a' : SPEC7[i]);
  // the dark behind him and what is drawn in it: the first thing on his plane (under him)
  const strikeBack = (ctx, emi, t, s) => {
    const { tIn, tSw, tHit, tRel } = s;
    const k = U.clamp((t - tIn) / 0.14) * (1 - U.clamp((t - tRel - 0.08) / 0.32));
    if (k <= 0.003) return;
    const W = MV.OW + 2 * MV.PADX, Hh = MV.OH + 2 * MV.PADY;
    ctx.save(); ctx.globalAlpha = 0.95 * k; ctx.fillStyle = '#07040b'; ctx.fillRect(-MV.PADX, -MV.PADY, W, Hh); ctx.restore();
    // the hall's rings come back round him as bands of the seven colours, rushing out (frozen in
    // the hold; flung out on the release)
    const c = s.src, m0 = s.mid, ph = Math.min(t, tHit) - tIn + (t > tRel ? (t - tRel) * 3.2 : 0);
    for (let i = 0; i < 10; i++) {
      const u = (((i / 10 + ph * 0.85) % 1) + 1) % 1, r = 30 + Math.pow(u, 1.6) * 760, a = k * U.clamp(u * 5) * (0.4 + 0.6 * u);
      const lw = R(3 + u * 12), hw = r * 1.45, hh = r;
      ctx.globalAlpha = a; ctx.strokeStyle = colOf(s, i % 7, t); ctx.lineWidth = lw;
      ctx.strokeRect(R(m0[0] - hw), R(m0[1] - hh), R(2 * hw), R(2 * hh));
    }
    ctx.globalAlpha = 1;
    // the lines of the drawing-in (the end of the hold: toward the points), then of the blow (out)
    const vin = (t - (tSw - 0.3)) / 0.3, vout = (t - tRel) / 0.3;
    for (let m = 0; m < 28; m++) {
      const a = U.hash(m * 5.3 + 1) * U.TAU, L = 60 + 180 * U.hash(m * 2.1);
      let r = -1;
      if (vin >= 0 && t < tSw) r = 720 * (1 - U.eIn(vin)) + 40;
      else if (vout >= 0 && vout < 1) r = 60 + 900 * U.eOut(vout);
      if (r < 0) continue;
      const o = t < tSw ? c : s.mid;
      ctx.save(); ctx.globalAlpha = k * (t < tSw ? U.clamp(vin * 2) : 1 - vout); ctx.strokeStyle = m % 3 ? '#ffffff' : colOf(s, m % 7, t); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(o[0] + Math.cos(a) * r, o[1] + Math.sin(a) * r); ctx.lineTo(o[0] + Math.cos(a) * (r + L), o[1] + Math.sin(a) * (r + L)); ctx.stroke(); ctx.restore();
    }
    // the stroke's trail: the shaft where it was a moment ago, in the seven colours (held in the
    // freeze)
    if (t >= tSw && t < tRel + 0.2) {
      const tt = Math.min(t, tHit), fa = t < tRel ? 1 : 1 - (t - tRel) / 0.2;
      for (let j = 1; j <= 10; j++) {
        const tp = tt - j * 0.016;
        if (tp < tSw) break;
        const a = MV.spearTip(tp, 0.3), b = FIN.prongAt(tp, 1);
        ctx.save(); ctx.globalAlpha = fa * (1 - j / 11); ctx.strokeStyle = colOf(s, (j - 1) % 7, t); ctx.lineWidth = R(10 - j * 0.5);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
      }
    }
    // the crescent behind him (as the game draws it), in its hard bands
    if (t >= tHit && t < tRel + s.follow + 0.16) {
      const img = s.peel ? crescentRed(t < tRel ? 5 : 6) : FIN.crescentImg(t < tRel ? 5 : 6, s.gone), K = TL.king.at(t), xf = MV.kingXf(t, K);
      const a = t < tRel + s.follow ? 1 : 1 - (t - tRel - s.follow) / 0.16;
      ctx.save(); ctx.transform(...xf.body);
      F.spr(ctx, img, R(K.x), R(K.y), { sc: 2, ax: 90.5, ay: 129, alpha: a });
      ctx.restore();
    }
    if (emi) F.glowAt(emi, c[0], c[1], 90, '#fff0d8', 0.3 * k * (t < tHit ? U.clamp((t - tIn) / 0.5) : 1));
  };
  MV.F.layers.king.unshift((ctx, emi, t) => { for (const s of STRIKES) if (t >= s.tIn && t < s.tEnd) strikeBack(ctx, emi, t, s); });
  FIN.allOut = (o) => {
    const tIn = o.tIn, tHit = o.tHit, tSw = o.tSw ?? tHit - 0.26, hold = o.hold ?? 0.13, follow = 0.08, tRel = tHit + hold;
    // he holds it up high, still (no breath); the light runs up the shaft, the trident burns
    H.pose(tIn - 0.02, tIn + 0.12, 'high', 'outExpo', o.holdPose || { grot: 1.15, gy: -46, by: -16, crouch: -6, flare: 1.8, hy: -3 });
    // the stroke: down through the whole arc, faster and faster, into the pose he ends in - the
    // trident driven down at the soul (steep, toward his middle)
    H.pose(tSw, tHit, o.afterPose || 'slam', 'in2', o.afterExtra || FIN.STRUCK);
    // (where it comes from: the points as they are held at the end of the hold)
    // (o.peel {t0, step}: the six borrowed colours leave it one by one from t0, violet first - his
    // red alone comes down; bar 67)
    const src = FIN.prongAt(tSw - 0.02, 1), K = TL.king.at(tHit);
    const S = { tIn, tSw, tHit, tRel, follow, src, mid: [K.x, K.y - 130], tEnd: tRel + 0.5, peel: o.peel || null, gone: o.gone || null };
    STRIKES.push(S);
    TL.king.to(tIn, tIn + 0.1, { breathe: 0 }, 'out').to(tRel + 0.3, tRel + 0.8, { breathe: 1 }, 'inOut');
    TL.tridentBands.to(tIn, tIn + 0.15, { flow: 1 }, 'out');
    TL.trident.to(tIn, tIn + 0.15, { glow: 2.8 }, 'out').to(tRel, tRel + 0.6, { glow: 0.8 }, 'inOut');
    // rays off the points while it is held; the drawing-in at the end of the hold
    TL.add({
      t0: tIn, t1: tSw, z: -44, keep: true, name: 'all-out: the points',
      draw(ctx, emi, t) {
        const p = FIN.prongAt(t, 1), k = U.clamp((t - tIn) / 0.2);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * U.TAU + (t - tIn) * 0.9, L = (26 + 46 * U.hash(i * 3.3)) * (0.75 + 0.25 * Math.sin(t * 24 + i * 1.9)) * k;
          ctx.save(); ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = i % 2 ? '#ffffff' : colOf(S, (i >> 1) % 7, t); ctx.lineWidth = i % 2 ? 1 : 2;
          ctx.beginPath(); ctx.moveTo(R(p[0] + Math.cos(a) * 6), R(p[1] + Math.sin(a) * 6)); ctx.lineTo(R(p[0] + Math.cos(a) * L), R(p[1] + Math.sin(a) * L)); ctx.stroke(); ctx.restore();
        }
        const v = (t - (tSw - 0.28)) / 0.28;
        if (v > 0) for (let m = 0; m < 30; m++) {
          const a = U.hash(m * 7.7 + 3) * U.TAU, r = (1 - U.eIn(v)) * (50 + 190 * U.hash(m * 1.3));
          D.rect(ctx, R(p[0] + Math.cos(a) * r) - 1, R(p[1] + Math.sin(a) * r) - 1, 2, 2, colOf(S, m % 7, t), U.clamp(v * 3));
        }
        if (emi) F.glowAt(emi, p[0], p[1], 34 + 30 * U.clamp(v), '#fff4dc', 0.45 * k);
      },
    });
    // the trident where the stroke drives it into the box, drawn again inside the box over its black
    // (he stands behind the box; this part comes up in front - the frame hides the seam)
    // (o.clip: null - no box to hold it, the soul out in the hall (67): the trident and the crescent
    // over all of it)
    const clip = o.clip === undefined ? 'box' : o.clip;
    // (o.frontTrident === false: not drawn again in front - what it strikes stands before it: 67's glass)
    if (o.frontTrident !== false) TL.add({
      t0: tSw, t1: tHit + (o.pierce ?? 1.8), z: 5, clip, keep: true, name: 'all-out: the trident in the box',
      draw(ctx, emi, t) { MV.drawTridentAt(ctx, emi, t); },
    });
    // the crescent over the battle (the box's black covered; the soul and the frame stay on top)
    TL.add({
      t0: tHit, t1: tRel + follow + (o.crescentHold ?? 0.16), z: 6, clip, keep: true, name: 'all-out: the crescent',
      draw(ctx, emi, t) {
        const img = S.peel ? crescentRed(t < tRel ? 5 : 6) : FIN.crescentImg(t < tRel ? 5 : 6, S.gone), Kt = TL.king.at(t), body = MV.kingXf(t, Kt).body;
        const a = t < tRel + follow ? 1 : 1 - (t - tRel - follow) / (o.crescentHold ?? 0.16);
        F.spr(ctx, img, Kt.x + body[4], Kt.y + body[5], { sc: 2, ax: 90.5, ay: 129, alpha: a });
      },
    });
    // the frames: one hard black-and-white frame on the stroke; the blow on the release
    TL.impact(tHit, { amp: 0, bw: 0.05 });
    TL.impact(tRel, { amp: o.amp ?? 14, zoom: 0.07, rot: 0.03, flash: 0.34, flashCol: [1, 0.97, 0.93], flashDecay: 8, dur: 0.6 });
    H.sfx(tIn, 'Charge', 0.3); H.sfx(tSw - 0.26, 'Pullback', 0.42); H.sfx(tSw, 'Swipe', 0.5);
    H.sfx(tHit, 'CineCut', 0.75); H.sfx(tHit, 'Impact', 0.4);
    H.sfx(tRel, 'HeavyDamage', 0.42); H.sfx(tRel, 'Explosion', 0.32);
    // the camera: up at him, held; a cut close to the points for the drawing-in; then it rides the
    // points down the arc (a little behind them, toward his hands), rolling with the stroke, and for
    // the last of it carries on from the points to the soul - the points and the soul in one
    // picture for the freeze; thrown back as the blow lands
    if (o.cam !== false) {
      const soul = o.soul, cy = o.camY ?? 130;
      H.shot(tIn, { x: 492, y: cy, zoom: 1.55, pitch: 0.24, fov: 1.0, roll: -0.045 });
      H.move(tIn, tSw - 0.27, { zoom: 1.72, y: cy - 6 }, 'out');
      H.shot(tSw - 0.26, { x: U.lerp(K.x, src[0], 0.78), y: src[1] + 58, zoom: 2.3, pitch: 0.2, fov: 0.95, roll: 0.03 });
      H.move(tSw - 0.26, tSw - 0.01, { zoom: 2.45, y: src[1] + 52 }, 'in');
      const N = Math.max(2, Math.round((tHit - tSw) * 120)), xs = [], ys = [], zs = [], rs = [];
      // (the end: the soul, a little toward where the points came down, clear of the HUD)
      const tipEnd = FIN.prongAt(tHit, 1), end = [U.lerp(soul[0], tipEnd[0], 0.3), soul[1] - 26];
      for (let i = 0; i <= N; i++) {
        const u = i / N, tt = tSw + u * (tHit - tSw), tip = FIN.prongAt(tt, 1), grip = MV.spearTip(tt, 0.45);
        const ride = [U.lerp(tip[0], grip[0], 0.22), U.lerp(tip[1], grip[1], 0.22) + 40 * (1 - u)], w = U.smooth(U.clamp((u - 0.6) / 0.4));
        xs.push(U.lerp(ride[0], end[0], w)); ys.push(U.lerp(ride[1], end[1], w));
        zs.push(U.lerp(2.45, 2.4, u)); rs.push(U.lerp(0.03, 0.1, U.eIn(u)));
      }
      TL.cam2.bake(tSw, 1 / 120, { x: xs, y: ys, zoom: zs, roll: rs });
      H.move(tSw, tHit, { pitch: 0.06, fov: 0.8 }, 'inOut');
      H.shot(tHit, { x: end[0], y: end[1], zoom: 2.4, roll: 0.1, fov: 0.8, pitch: 0.06 });
      H.move(tRel, tRel + 0.24, { zoom: o.zoomOut ?? 1.5, roll: 0, x: U.lerp(end[0], 480, 0.6), y: U.lerp(end[1], 250, 0.5) }, 'outExpo');
    }
    return tRel;
  };

  // ---------------------------------------------------------------- the kneel
  // The sheet's kneel frame has no head: the game sets one of his battle faces on it. Measured on
  // a reference frame: from the frame's anchor (92, 95; its feet), the 49 px wide
  // faces' corner at (-44, -192), the 53 px ones' at (-48, -198), at 2x. TL.kneel {a, dy (it
  // settles from above)}; TL.kneelFace: which face. FIN.kneel draws it on his plane (the puppet off:
  // TL.bossPose 'none'), with the dust off the floor where his knee comes down at t0.
  TL.kneel = new MV.Track({ a: 0, dy: 0 });
  TL.kneelFace = new MV.Steps('face0');
  const faceCorner = (img) => (img.width >= 52 ? [-48, -198] : img.width >= 49 ? [-44, -192] : [-46, -192]);
  // (the sheet's cell carries the game's black round him, in rectangles. His outline is open in places
  // (at the neck above all, where the game sets the head), so no flood can tell inside from out: his
  // black is kept where it lies between his white lines both along its row and down its column, the
  // rest made clear)
  FIN.cutout = (img) => F.cached('cutout:' + F.id(img), () => {
    const w = img.width, h = img.height, [c, x] = MV.canvas(w, h);
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, w, h), d = id.data, line = (p) => d[p * 4 + 3] > 0 && d[p * 4] > 150;
    const r0 = new Int32Array(h).fill(w), r1 = new Int32Array(h).fill(-1), c0 = new Int32Array(w).fill(h), c1 = new Int32Array(w).fill(-1);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (line(j * w + i)) { if (i < r0[j]) r0[j] = i; if (i > r1[j]) r1[j] = i; if (j < c0[i]) c0[i] = j; if (j > c1[i]) c1[i] = j; }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const p = j * w + i;
      if (!line(p) && !(i >= r0[j] && i <= r1[j] && j >= c0[i] && j <= c1[i])) d[p * 4 + 3] = 0;
    }
    x.putImageData(id, 0, 0);
    return c;
  });
  const kneelBody = () => FIN.cutout(MV.img('kneel'));
  FIN.kneel = (t0, t1, o = {}) => TL.add({
    t0, t1, z: o.z ?? -90, name: 'kneel', keep: true,
    draw(ctx, emi, t, S) {
      const kn = TL.kneel.at(t), K = TL.king.at(t);
      if (kn.a <= 0.001 || K.a <= 0.001) return;
      const X = R(K.x), Y = R(K.y + kn.dy), a = kn.a * K.a, sil = S.sil;
      const body = kneelBody(), face = F.filled(MV.img(TL.kneelFace.at(t))), [fx, fy] = faceCorner(face);
      // (he breathes: the head a pixel, slowly)
      const bob = R(Math.sin(t * 1.5) * 0.9);
      F.spr(ctx, sil ? F.tint(body, '#000000') : body, X, Y, { sc: 2, ax: 92, ay: 95, alpha: a });
      F.spr(ctx, sil ? F.tint(face, '#000000') : face, X + fx, Y + fy + bob, { sc: 2, alpha: a });
      // dust where the knee came down
      const v = (t - t0 - (o.land ?? 0.12)) / 0.7;
      if (v > 0 && v < 1) for (let m = 0; m < 14; m++) {
        const s = m % 2 ? 1 : -1, h = U.hash(m * 2.9 + 1), x = X + s * (60 + 130 * h) + s * 60 * U.eOut(v), y = Y - 4 - 18 * U.eOut(v) * U.hash(m * 4.1);
        D.rect(ctx, R(x / 2) * 2, R(y / 2) * 2, 2 + 2 * (m % 3 === 0), 2, '#c8c2d4', 0.7 * (1 - v));
      }
    },
  });
  // the trident let go: from where it was in his hands at tf, down onto the floor in front of his
  // knees by tl (a clatter, one small bounce), lying there until t1
  FIN.trident = (tf, tl, t1, o = {}) => {
    const b0 = MV.spearTip(tf, 0), p0 = MV.spearTip(tf, 1), ang0 = Math.atan2(p0[1] - b0[1], p0[0] - b0[0]);
    const b1 = o.butt || [244, 262], ang1 = o.ang ?? -0.03;
    H.sfx(tl, 'Slam', 0.32); H.sfx(tl, 'Impact', 0.22); H.sfx(tl + 0.16, 'Impact', 0.08);
    return TL.add({
      t0: tf, t1, z: o.z ?? -88, name: 'the trident falls', keep: true,
      draw(ctx, emi, t, S) {
        const u = U.clamp((t - tf) / (tl - tf)), e = u * u;
        const bx = U.lerp(b0[0], b1[0], U.smooth(u)), ang = U.lerp(ang0, ang1, U.smooth(u));
        let by = U.lerp(b0[1], b1[1], e);
        if (t > tl) { const v = (t - tl) / 0.3; if (v < 1) by -= 6 * Math.sin(v * Math.PI) * (1 - v); }
        const img = MV.tridentImg(null);
        ctx.save(); ctx.globalAlpha = TL.king.at(t).a;
        ctx.translate(R(bx), R(by)); ctx.rotate(ang); ctx.scale(2, 2);
        ctx.drawImage(S.sil ? F.tint(img, '#000000') : img, 0, -31);
        ctx.restore(); ctx.globalAlpha = 1;
      },
    });
  };

  // ---------------------------------------------------------------- friendliness pellets
  // a ring of white "friendliness pellets" round him, appearing one after another, spinning (the
  // end comes before they close in)
  FIN.pellets = (t0, t1, o = {}) => TL.add({
    t0, t1, z: o.z ?? -30, name: 'pellets', keep: true,
    draw(ctx, emi, t) {
      const K = TL.king.at(t), c = o.c || [K.x, K.y - 96], n = o.n ?? 24, r = o.r ?? 150, pel = MV.ART.get('pellet');
      for (let i = 0; i < n; i++) {
        const ti = t0 + (i / n) * (o.spread ?? 0.5), k = U.clamp((t - ti) / 0.14);
        if (k <= 0) continue;
        const a = (i / n) * U.TAU - Math.PI / 2 + (o.spin ?? 0.3) * (t - t0), x = c[0] + Math.cos(a) * r, y = c[1] + Math.sin(a) * r;
        F.spr(ctx, pel, x, y, { sc: 2 * (0.3 + 0.7 * U.eOutBack(k)), ax: 3, ay: 3, rot: (t - ti) * 7 + i, alpha: k });
      }
    },
  });

  // ---------------------------------------------------------------- a word of Omega Flowey's
  // in the dialogue font, purple ink outlined, each stroke's top lit (cached)
  const INK = ['#d27cff', '#f8e0ff', '#22082e'];
  FIN.word = (w) => F.cached('finWord:' + w, () => {
    const [fill, hi, line] = INK, ww = D.textWidth(w, { scale: 1 }) + 2, [c, x] = MV.canvas(ww, 18);
    for (const [dx, dy] of [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]]) D.text(x, w, dx, dy, { scale: 1, color: line });
    D.text(x, w, 1, 1, { scale: 1, color: fill });
    const id = x.getImageData(0, 0, ww, 18), d = id.data, [fr, fg, fb] = F.rgb(fill), [hr, hg, hb] = F.rgb(hi);
    const isFill = (i, j) => { const p = (j * ww + i) * 4; return d[p + 3] > 0 && d[p] === fr && d[p + 1] === fg && d[p + 2] === fb; };
    for (let j = 17; j >= 1; j--) for (let i = 0; i < ww; i++) if (isFill(i, j) && !isFill(i, j - 1)) { const p = (j * ww + i) * 4; d[p] = hr; d[p + 1] = hg; d[p + 2] = hb; }
    x.putImageData(id, 0, 0);
    return c;
  });
})();
