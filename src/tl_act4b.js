// Act four, part two: bars 16-39, the six children. The camera leaves him for the containers:
// the weight is on the dead. Each soul is borrowed with the same rite, played with his whole body
// (no close-ups): he turns his bowed head to its jar, lets go of the trident with one hand and
// holds the paw out to it - asking, not taking; the soul's light runs down into the open paw, he
// closes it round the light like round a flower, and takes the trident again: the ribbon now runs
// from the jar into his hand and the trident is that soul's colour (the soul never leaves its
// jar). Then the absent child: what its human left behind stands beside the box at a child's
// height, worn by no one, and the attack comes out of those things, on its own rhythm. And each
// time, one thing he cannot bring himself to do.
//   16-19 yellow · justice      the hat over the empty gun. Dead Eye: the world an old photograph,
//                               red marks on theme B's rests, the shots on its snare; 18 through
//                               the gun's sights; 19 the stand-off - the last mark on the soul
//                               itself, he shuts his eyes, his hands shake, that shot goes wide
//   20-23 green  · kindness     the stained apron; four pans keep his fire and toss it on the
//                               snare; the soul is green and shielded: kindness protects even the
//                               one it is used against - what it blocks turns to green light that
//                               drifts home to its jar
//   24-27 purple · perseverance the glasses over the notebook; the box a ruled page, the notebook's
//                               pages torn out into two columns at the lines' ends (Omega Flowey's
//                               two columns of notebooks); a word (the game's own: 困住 绝望 ...)
//                               flung along a line on every off-beat chord; at 26 the page turns
//                               over toward the camera and tears away; then the lines are scrawled
//                               out one by one, the box slamming shut on those left - the trap
//                               closes to one line. 「凶手」 is struck out; the last thing written is
//                               「对不起」, and it does not hurt
//   28-31 blue   · integrity    the tutu over the ballet shoes on the box's lid: the box is a
//                               music box; gravity; shoes pirouette along the floor; at 30 the box
//                               turns like a music box's stage and a few notes of a music box
//                               chime - he falters, the trident sinks; the march drags him on
//   32-35 orange · bravery      the bandanna and two gloves; the box a ring whose own frame is the
//                               ropes - each glove draws its side back and is shot across on the
//                               beat; the soul does not run, it parries (振刀) and knocks the glove
//                               back; he boxes with the trident. 35: a double parry knocks both
//                               gloves up into the top of the frame, which slings them into him
//   36-39 l.blue · patience     the faded ribbon; the toy knife is a clock's hand: it sweeps through
//                               the soul on the off-beats (stand still), the white hand chases it
//                               (move); the world greys while it waits; at 39 the clock stops,
//                               the whole world stands still - only his hands shake
// The mechanisms are MV.SOULFX[key](...) so the climax (bars 44-51) can combine them.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, B = MV.B2, FL = MV.FL, F = MV.F, D = MV.D;
  const R = Math.round, HEX = MV.COL.S;
  const FX = (MV.SOULFX = MV.SOULFX || {});
  const at = (b, k = 0, s = 0) => T.at(b, k, s);
  const HOME = { x: 480, y: 270, zoom: 1, roll: 0, pitch: 0, yaw: 0 };
  // where the game's damage shows over him when a counterattack lands (the bar across his chest,
  // the number above it)
  const DMG_BAR = (FX.DMG_BAR = [480, 160]);
  const cut = (t, v) => TL.cam2.set(t, Object.assign({}, HOME, v));
  const C = [B.home.cx, B.home.cy], BI = B.inner(B.home);
  const BOX_T = B.home.cy - B.home.h / 2, BOX_L = B.home.cx - B.home.w / 2, BOX_R = B.home.cx + B.home.w / 2;
  // which hand he holds out (the jars on his left take the upper fist, on his right the lower)
  FX.SIDE = { yellow: 'L', green: 'L', orange: 'L', purple: 'R', blue: 'R', aqua: 'R' };
  const sgn = (key) => (FX.SIDE[key] === 'L' ? -1 : 1);
  const img = (n) => MV.ART.make[n] ? MV.ART.get(n) : B.prop(n);

  // ================================================================ the rite
  // tR: his paw is out (the downbeat), its light reaches it grow later and the paw closes round
  // it; tG: his hand is back on the shaft (the trident takes the colour); tOff: the ribbon lets go
  FX.rite = (key, tR, tG, tOff, o = {}) => {
    const side = FX.SIDE[key], s = sgn(key), grow = o.grow ?? 0.26;
    H.reachOut(side, tR + 0.1, tG - 0.15, B.jarSoul(key, tR), { cup: tR + 0.1 + grow + 0.03, outDur: 0.2 });
    // he turns his bowed head to the jar and leans to it; held in one hand, the trident dips
    // (his face stays the battle mask)
    H.pose(tR - 0.12, tR + 0.12, 'idle', 'out', { htilt: 0.15 * s, hx: 8 * s, lean: 0.035 * s, grot: -0.07, gy: 4 });
    H.pose(tG - 0.04, tG + 0.24, o.after || 'idle', 'inOut', o.afterExtra || {});
    H.ribbon(key, tR + 0.1 + grow, tOff, { hand: side, grow, tintAt: tG, lift: o.lift ?? 10 });
    H.wallTint(tG - 0.1, 0.5, key);
    H.wallTint(tOff, 0.8, null);
    H.sfx(tG, 'Grab', 0.22);
    // the camera from the jar's side, on the jar and his paw: the jar on its pedestal deep behind,
    // his arm reaching back across the depth to it; it drifts round as the light comes
    if (o.cam !== false) {
      const j = B.jarSoul(key, tR), sh = side === 'L' ? [380, 112] : [562, 134], z0 = (o.cam && o.cam.zoom) || 1.72;
      H.shot(tR - 0.02, Object.assign({ x: j[0] * 0.55 + sh[0] * 0.45, y: Math.min(j[1], sh[1]) + 26, zoom: z0, yaw: -s * 0.3, pitch: 0.12, fov: 0.85 }, o.cam || {}));
      H.move(tR, tG - 0.02, { zoom: z0 + 0.1, yaw: -s * 0.18 }, 'out');
    }
  };

  // ================================================================ the rite, locked to the music (20-36)
  // Two beats: on the downbeat his paw is out to the jar; on its off-beat the light is in it; on
  // the next downbeat his hand is back on the shaft; on that off-beat the trident takes the colour.
  // Each soul is reached for in its own way (o.style):
  //   cup    green: both paws held out together, gently, as if to cup a flower
  //   pinch  purple: fingertips that pick the light up like a pen - a thin stroke of it
  //   flat   blue: the paw held out flat, palm up; the light comes skipping down the ribbon on its
  //          toes, like a dancer, and lands in it
  //   punch  orange: a fist driven at the jar - the blow knocks the light out of it
  //   wait   light blue: the paw held out, and nothing comes for a whole beat; then the light,
  //          slowly (patience) - everything a beat later
  // tR: the downbeat; tOff: the ribbon lets go. Returns {tIn (the light in his paw), tGrip (back on
  // the shaft), tCol (the trident takes the colour)}
  FX.borrow = (key, tR, tOff, o = {}) => {
    const st = o.style || 'cup', side = FX.SIDE[key], s = sgn(key), B8 = T.beat / 2;
    const wait = st === 'wait';
    const tIn = tR + (wait ? 2 * T.beat : B8), tGrip = tR + (wait ? 3 : 1) * T.beat, tCol = tGrip + B8;
    const grow = wait ? T.beat : st === 'punch' ? B8 - 0.06 : B8 - 0.04;
    const jar = B.jarSoul(key, tR);
    const out = (sd, target, oo = {}) => H.reachOut(sd, tR, tGrip - 0.16, target, Object.assign({ cup: tIn + 0.03, outDur: 0.2 }, oo));
    if (st === 'cup') {
      // (both paws side by side on the jar's side, held low and open, the far arm across his
      // chest; the trident resting against him a moment)
      const far = side === 'L' ? 'R' : 'L', K = FL.king;
      TL.reach.set(tR - 0.32, { [side + 'len']: 0.72, [far + 'len']: 2.45 }).set(tGrip + 0.02, { Llen: 1, Rlen: 1 });
      out(side, [K[0] + s * 150, K[1] - 142], { outDur: 0.26, ease: 'inOut' });
      out(far, [K[0] + s * 96, K[1] - 118], { outDur: 0.3, ease: 'inOut', cup: tIn + 0.06 });
      H.pose(tR - 0.26, tR + 0.04, 'idle', 'inOut', { htilt: 0.12 * s, hx: 8 * s, hy: 3, lean: 0.03 * s, grot: -0.12, gy: 8, crouch: 2 });
    } else if (st === 'punch') {
      // (the fist stays shut: out fast, on the beat - the jar rings with it)
      H.reachOut(side, tR, tGrip - 0.16, jar, { cup: tR - 0.2, outDur: 0.1, ease: 'in' });
      H.pose(tR - 0.12, tR, 'idle', 'in', { lean: 0.07 * s, hx: 10 * s, crouch: 5, grot: -0.1, gy: 6, sway: 0.4 * s });
      TL.jar[key].set(tR, { jx: 0, jy: 0 }).to(tR, tR + 0.04, { jx: 4 * s, jy: -2 }, 'out').to(tR + 0.04, tR + 0.3, { jx: 0, jy: 0 }, 'outBack');
      TL.impact(tR, { amp: 6, dx: s, zoom: 0.025, dur: 0.25 });
      H.sfx(tR, 'PunchStrong', 0.3); H.sfx(tR + 0.02, 'Bell', 0.12);
    } else {
      out(side, jar, st === 'wait' ? { outDur: 0.3, ease: 'inOut' } : {});
      H.pose(tR - 0.14, tR + 0.06, 'idle', 'out', { htilt: 0.15 * s, hx: 8 * s, lean: 0.035 * s, grot: -0.07, gy: 4 });
      // (pinch: the fingertips lift the light a little, as a pen is lifted off the page)
      if (st === 'pinch') TL.reach.to(tIn + 0.03, tIn + 0.2, { [side + 'y']: jar[1] - 16 }, 'out');
    }
    H.pose(tGrip - 0.06, tGrip + 0.2, o.after || 'idle', 'inOut', o.afterExtra || {});
    H.ribbon(key, tIn, tOff, { hand: side, grow, tintAt: tCol, lift: o.lift ?? 10, width: st === 'pinch' ? 0.5 : 1 });
    H.wallTint(tGrip - 0.1, 0.5, key);
    H.wallTint(tOff, 0.8, null);
    H.sfx(tGrip, 'Grab', 0.22);
    // the light coming: a burst out of the jar (punch); a dancer's skip down the ribbon (flat)
    if (st === 'punch' || st === 'flat') TL.add({
      t0: tR - 0.02, t1: tIn + 0.2, z: -58, keep: true, name: 'the light comes ' + key,
      draw(ctx, emi, t) {
        const hex = HEX[key];
        if (st === 'punch') {
          for (let m = 0; m < 14; m++) {
            const a = U.hash(m * 3.3 + tR) * U.TAU, u = U.clamp((t - tR) / 0.32);
            const r = U.eOut(u) * (16 + 26 * U.hash(m * 1.7)), x = jar[0] + Math.cos(a) * r, y = jar[1] + Math.sin(a) * r * 0.8;
            D.rect(ctx, x - 1, y - 1, 2, 2, m % 3 ? hex : '#ffffff', 1 - u);
          }
          // the blow's ring, from the fist to the jar
          const u = U.clamp((t - tR + 0.02) / 0.24);
          if (u < 1) { ctx.save(); ctx.globalAlpha = 0.8 * (1 - u); ctx.strokeStyle = '#fff2dc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(jar[0] - 6 * s, jar[1] + 6, 8 + 30 * U.eOut(u), 0, U.TAU); ctx.stroke(); ctx.restore(); }
        } else {
          // three skips en pointe, along the way the ribbon takes, landing in the palm on the off-beat
          const t0 = tIn - grow, u = U.clamp((t - t0) / (tIn - t0));
          if (t > tIn + 0.12 || u <= 0) return;
          const hand = MV.handAt(t, side), p0 = jar, k = U.eInOut(u), hop = Math.abs(Math.sin(u * Math.PI * 3)) * 14 * (1 - u * 0.5);
          const x = U.lerp(p0[0], hand[0], k), y = U.lerp(p0[1], hand[1], k) - 20 * Math.sin(u * Math.PI) - hop;
          D.rect(ctx, x - 2, y - 4, 4, 6, '#ffffff', 1); D.rect(ctx, x - 4, y - 1, 8, 2, hex, 1); D.rect(ctx, x - 1, y + 2, 2, 4, hex, 1);
          if (emi) F.glowAt(emi, x, y, 14, hex, 0.5);
        }
      },
    });
    return { tIn, tGrip, tCol };
  };

  // ================================================================ their things, home on their jars
  // (the user: once a soul's power is spent, what its child left flies back onto its own jar and
  // stays there - the main thing on the lid, the rest at the jar's foot on the pedestal - and the
  // climax's attacks come from there.) They fly on their section's last beat and land on the next
  // downbeat, the moment he reaches for the next jar - each in its child's way (how): arc | hook
  // (hung back on a hook: drops onto the lid and swings) | clang (falls at the foot, rings,
  // bounces) | bird (flaps there) | climb (hops up the pedestals en pointe) | float (drifts down
  // like a leaf) | uppercut | spin (turning like a clock's hand).
  //   FX.goHome(key, items, tLand): items [{img, j (its spot), t0 (it leaves), from: t -> [x, y,
  //   rot, sc] (where it is until then, world px, the battle plane), how, ax, ay, flip, land (its
  //   own landing time)}]
  //   FX.homeFx[key](t, j) -> {dx, dy, rot, sc, a, glow}: what the climax does to them (tl_act4c)
  const SPOTS = (FX.SPOTS = {
    yellow: [[0, -70, 0.15, 2], [5, 16, 1.4, 2]],
    green: [[0, -66, 0, 1.6], [6, 16, 1.45, 1.6]],
    purple: [[0, -68, 0.1, 2], [0, 16, 0, 1.4]],
    blue: [[0, -67, 0, 1.6], [-10, 14, 0, 1.6], [10, 14, 0, 1.6]],
    orange: [[0, -68, 0.12, 2], [-11, 15, 0.4, 1.1], [11, 15, -0.4, 1.1]],
    aqua: [[0, -70, 0.15, 2], [5, 16, 1.45, 2]],
  });
  FX.homeOf = (key, j, t) => { const [jx, jy] = MV.jarAt(key, t), s = SPOTS[key][j]; return { p: [jx + s[0], jy + s[1]], rot: s[2], sc: s[3] }; };
  FX.homeFx = {};
  FX.HOME_GONE = at(52, 0, 6); // (he has won: they sink into the jars as motes)
  FX.landed = {}; // key -> the time its things are home
  FX.goHome = (key, items, tLand) => {
    FX.landed[key] = tLand;
    const fl = items.map((it) => Object.assign({ land: tLand, how: 'arc' }, it));
    // where one is at t: flying (u 0..1) or home (u 1, tau: since it landed)
    const at2 = (it, t) => {
      const h = FX.homeOf(key, it.j, t), u = U.clamp((t - it.t0) / (it.land - it.t0)), [x0, y0, r0 = 0, s0 = 3] = it.from(Math.min(t, it.t0));
      const tau = t - it.land, e = U.eInOut(u);
      let x = U.lerp(x0, h.p[0], e), y = U.lerp(y0, h.p[1], e), rot = U.lerp(r0, h.rot, e), sc = U.lerp(s0, h.sc, e), sx = 1;
      if (it.how === 'arc') y -= Math.sin(u * Math.PI) * 80;
      else if (it.how === 'hook') {
        // up above the lid, then down onto it; it swings there
        const v = U.eOut(U.clamp(u / 0.75)), w = U.eIn(U.clamp((u - 0.75) / 0.25));
        x = U.lerp(x0, h.p[0], v); y = U.lerp(U.lerp(y0, h.p[1] - 46, v), h.p[1], w) - Math.sin(Math.min(1, u / 0.75) * Math.PI) * 30;
        if (tau > 0) rot = h.rot + 0.32 * Math.exp(-tau * 4.5) * Math.sin(tau * 13);
      } else if (it.how === 'clang') {
        y -= Math.sin(u * Math.PI) * 60;
        if (tau > 0) { y -= Math.abs(Math.sin(tau * 14)) * 12 * Math.exp(-tau * 7); rot = h.rot + 0.25 * Math.exp(-tau * 6) * Math.sin(tau * 20); }
        else rot += u * 5;
      } else if (it.how === 'bird') {
        // a swooping flight, its two halves beating like wings
        y -= Math.sin(u * Math.PI) * 110 - Math.sin(u * Math.PI * 3) * 14 * (1 - u);
        if (u < 1) sx = 0.35 + 0.65 * Math.abs(Math.cos(t * 26 + it.j));
        rot = U.lerp(r0, h.rot, e) + Math.sin(u * Math.PI * 2) * 0.3 * (1 - u);
      } else if (it.how === 'climb') {
        // en pointe, hop by hop up the pedestals, turning as it goes
        const n = it.hops || 4, f = u * n, k = Math.min(n - 1, Math.floor(f)), v = f - k;
        const pts = it.path || [[x0, y0], h.p], P = (q) => { const i = Math.min(pts.length - 1, q * (pts.length - 1)), i0 = Math.floor(i), w2 = i - i0, a = pts[i0], b = pts[Math.min(pts.length - 1, i0 + 1)]; return [U.lerp(a[0], b[0], w2), U.lerp(a[1], b[1], w2)]; };
        const pa = P(k / n), pb = P((k + 1) / n);
        x = U.lerp(pa[0], pb[0], v); y = U.lerp(pa[1], pb[1], v) - Math.sin(v * Math.PI) * 26;
        if (u < 1) sx = Math.cos(t * 16 + it.j * 1.3);
        rot = U.lerp(r0, h.rot, e);
      } else if (it.how === 'float') {
        // drifting up and over, then down onto the lid like a leaf, rocking
        x += Math.sin(u * Math.PI * 2.2) * 26 * (1 - u); y -= Math.sin(u * Math.PI) * 70;
        rot = U.lerp(r0, h.rot, e) + Math.sin(u * Math.PI * 3) * 0.45 * (1 - u);
      } else if (it.how === 'uppercut') {
        // driven up hard, past its spot, and settling down into it
        const v = U.eOut(U.clamp(u / 0.7)), w = U.clamp((u - 0.7) / 0.3);
        x = U.lerp(x0, h.p[0], U.eOut(u)); y = U.lerp(y0, h.p[1] - 60, v) + 60 * U.eInOut(w);
        rot = U.lerp(r0, h.rot, e) - Math.sin(Math.min(1, u / 0.7) * Math.PI) * 1.2 * (it.flip ? -1 : 1);
      } else if (it.how === 'spin') {
        y -= Math.sin(u * Math.PI) * 70;
        if (u < 1) rot = r0 + U.eOut(u) * U.TAU * 2 + (h.rot - r0) * e;
      }
      return { u, tau, x, y, rot, sc, sx };
    };
    const draw = (ctx, emi, t, onMid) => {
      const gone = U.clamp((t - FX.HOME_GONE) / 0.3), fxf = FX.homeFx[key];
      for (const it of fl) {
        if (t < it.t0) continue;
        const q = at2(it, t);
        // (in flight it crosses from the battle plane back to the jars' plane)
        const wMid = U.smooth(U.clamp((q.u - 0.12) / 0.3)), w = onMid ? wMid : 1 - wMid;
        if (w <= 0.01) continue;
        const f = q.u >= 1 && fxf ? fxf(t, it.j) || {} : {};
        const a = w * (1 - gone) * (f.a ?? 1) * (it.appear ? U.clamp((t - it.t0) / 0.1) : 1);
        const x = q.x + (f.dx || 0), y = q.y + (f.dy || 0) + (q.u >= 1 && !f.still ? Math.sin(t * 2 + it.j) : 0);
        if (a > 0.01 && !f.hide) {
          // (sx: squashed across - a wing's beat, a pirouette)
          const sc = q.sc * (f.sc ?? 1), sx = Math.abs(q.sx) < 0.15 ? 0.15 * Math.sign(q.sx || 1) : q.sx;
          ctx.save(); ctx.globalAlpha = a; ctx.translate(R(x), R(y)); ctx.rotate(q.rot + (f.rot || 0)); ctx.scale(sc * sx * (it.flip ? -1 : 1), sc);
          ctx.drawImage(it.img, -(it.ax ?? it.img.width / 2), -(it.ay ?? it.img.height / 2)); ctx.restore(); ctx.globalAlpha = 1;
          const gl = q.u < 1 ? 0.3 : (f.glow || 0);
          if (emi && gl > 0.01) F.glowAt(emi, x, y, 18 + 12 * gl, HEX[key], Math.min(0.6, 0.3 * gl) * a);
        }
        // a trail of its colour in flight; the motes it sinks into the jar as at the end
        if (q.u > 0 && q.u < 1) for (let m = 1; m <= 4; m++) { const qq = at2(it, t - m * 0.03); D.rect(ctx, qq.x - 1, qq.y - 1, 2, 2, HEX[key], 0.5 * w * (1 - m / 5)); }
        if (onMid && gone > 0 && gone < 1) {
          const jar = B.jarSoul(key, t);
          for (let m = 0; m < 5; m++) { const v = U.clamp(gone * 1.4 - m * 0.08), mx = U.lerp(x, jar[0], v) + Math.sin(v * 9 + m) * 4, my = U.lerp(y, jar[1], v); D.rect(ctx, mx - 1, my - 1, 2, 2, HEX[key], Math.sin(v * Math.PI)); }
        }
      }
    };
    const t0 = Math.min(...fl.map((it) => it.t0)), t1 = FX.HOME_GONE + 0.35;
    TL.add({ t0, t1: Math.max(...fl.map((it) => it.land)) + 0.05, z: 3, keep: true, name: 'going home ' + key, draw: (ctx, emi, t) => draw(ctx, emi, t, false) });
    TL.add({ t0, t1, z: -230, name: 'home ' + key, draw: (ctx, emi, t) => draw(ctx, emi, t, true) });
    // (the landings' sounds: each its own)
    const SND = { hook: ['Swipe', 0.1], clang: ['Frypan', 0.22], bird: ['BookSpin', 0.14], climb: ['Chime', 0.12], float: ['Sparkle', 0.08], uppercut: ['PunchWeak', 0.16], spin: ['Saber', 0.1], arc: ['Ding', 0.07] };
    fl.forEach((it) => { const [n, v] = SND[it.how] || SND.arc; H.sfx(it.land, n, v); });
    return { at: (j, t) => { const it = fl.find((q) => q.j === j); return it ? at2(it, t) : null; } };
  };

  // the camera as one child's things go home and he reaches for the next jar: a move across that
  // takes both jars into one picture by the downbeat (tR), then on toward the jar he reaches for
  FX.handCam = (fromKey, toKey, tFly, tR, tEnd, o = {}) => {
    const a = MV.jarAt(fromKey, tR), b = MV.jarAt(toKey, tR), sb = sgn(toKey);
    const xs = [a[0], b[0], 480 + sb * 150], ys = [a[1] - 84, b[1] - 84, a[1] + 24, b[1] + 24, 150];
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const zoom = U.clamp(Math.min(470 / (Math.max(...xs) - Math.min(...xs) + 150), 265 / (Math.max(...ys) - Math.min(...ys) + 90)), 1.12, 1.9) * (o.zk ?? 1);
    const sa = sgn(fromKey);
    H.shot(tFly, Object.assign({ x: U.lerp(cx, a[0], 0.35), y: cy + 6, zoom: zoom * 1.06, yaw: -sa * 0.16, pitch: 0.1, fov: 0.85 }, o.from || {}));
    H.move(tFly, tR, { x: cx, y: cy, zoom, yaw: -sb * 0.08 }, 'inOut');
    H.move(tR, tEnd, Object.assign({ x: U.lerp(cx, b[0], 0.3), zoom: zoom * 1.08, yaw: -sb * 0.2 }, o.to || {}), 'out');
  };

  // ================================================================ yellow · Dead Eye
  // o: {t0, t1 (the gun and hat), bars: [{b, marks, first, ricochet, salvo, hit}]}. Every mark
  // goes down on the soul, where it is at that moment (the soul's own path must be laid first):
  // the shots come for where it was, and it lives by having moved on. hit: it stands still (the
  // stand-off) - the salvo does not miss
  FX.yellow = (o) => {
    const keep = true, GUN = o.gun || [368, 364], MUZ = 34, SP = o.speed ?? 1050;
    const bx = o.box || B.home, BI = B.inner(bx);
    // a ray from p along d through the box to its wall (and once off it if ricochet)
    const ray = (p, d, ric) => {
      const pts = [p.slice()];
      let q = p.slice(), v = d.slice();
      for (let k = 0; k < (ric ? 2 : 1); k++) {
        let tm = 1e9, wall = null;
        const x0 = bx.cx - bx.w / 2, x1 = bx.cx + bx.w / 2, y0 = bx.cy - bx.h / 2, y1 = bx.cy + bx.h / 2;
        if (v[0] > 1e-6) { const s = (x1 - q[0]) / v[0]; if (s < tm) { tm = s; wall = 'x'; } }
        if (v[0] < -1e-6 && q[0] > x0 + 1) { const s = (x0 - q[0]) / v[0]; if (s < tm) { tm = s; wall = 'x'; } }
        if (v[1] > 1e-6) { const s = (y1 - q[1]) / v[1]; if (s < tm) { tm = s; wall = 'y'; } }
        if (v[1] < -1e-6 && q[1] > y0 + 1) { const s = (y0 - q[1]) / v[1]; if (s < tm) { tm = s; wall = 'y'; } }
        q = [q[0] + v[0] * tm, q[1] + v[1] * tm];
        pts.push(q.slice());
        if (wall === 'x') v[0] = -v[0]; else v[1] = -v[1];
      }
      return pts;
    };
    const polyAt = (pts, d) => {
      for (let i = 1; i < pts.length; i++) {
        const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (d <= L || i === pts.length - 1) { const u = Math.min(1, d / L); return [U.lerp(pts[i - 1][0], pts[i][0], u), U.lerp(pts[i - 1][1], pts[i][1], u)]; }
        d -= L;
      }
    };
    const polyLen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
    const FIRE16 = [8, 10, 11, 12];
    const marks = [], lines = [], shots = [], aims = [], hits = [];
    const mkShot = (tf, dir, ric, mk) => {
      const m = [GUN[0] + dir[0] * MUZ, GUN[1] + dir[1] * MUZ], pts = ray(m, dir, ric), len = polyLen(pts);
      return { t0: tf, t1: tf + len / SP + 0.02, hr: 4, p: (t) => polyAt(pts, (t - tf) * SP), pts, mk,
        ang: (t) => { const a = polyAt(pts, (t - tf) * SP), b2 = polyAt(pts, (t - tf) * SP + 4); return Math.atan2(b2[1] - a[1], b2[0] - a[0]); } };
    };
    o.bars.forEach((bb) => {
      const b = bb.b, first = bb.first ?? 3, n = bb.marks ?? 4;
      for (let j = 0; j < n; j++) {
        const tm = at(b, 0, first + j * ((7 - first) / n)), tf = bb.salvo ? at(b, 0, 8) : at(b, 0, FIRE16[j % 4]);
        // (on the soul; in the stand-off the marks stack on it, a little apart so each one shows)
        const h = TL.heart.at(tm), off = bb.hit ? [[0, 0], [-6, -5], [6, 5]][j % 3] : [0, 0], mk = [h.x + off[0], h.y + off[1]];
        const d = [mk[0] - GUN[0], mk[1] - GUN[1]], L = Math.hypot(d[0], d[1]), u = [d[0] / L, d[1] / L];
        const shot = mkShot(tf, u, bb.ricochet && !bb.hit, mk);
        if (bb.hit) {
          // it does not miss: it ends in the soul
          const s = TL.heart.at(tf), arrive = tf + (Math.hypot(s.x - GUN[0], s.y - GUN[1]) - MUZ - 7) / SP;
          shot.t1 = arrive + 0.012; shot.meant = true; hits.push(arrive);
        }
        marks.push({ t0: tm, t1: tf + 0.1, p: mk, onSoul: true, big: !!bb.hit });
        lines.push({ t0: tm, t1: tf + 0.05, pts: bb.hit ? [shot.pts[0], mk] : shot.pts });
        shots.push(shot);
        aims.push([bb.salvo ? tm + 0.1 : tf, Math.atan2(d[1], d[0])]);
        H.sfx(tm, 'Target', bb.hit ? 0.24 : 0.16);
        H.sfx(tf, 'Gunshot', 0.24);
      }
    });
    // the marks and the aim lines keep their red in the old photograph
    TL.add({
      t0: o.t0, t1: o.t1, z: 8, clip: 'box', keep,
      draw(ctx, emi, t) {
        for (const l of lines) {
          if (t < l.t0 || t >= l.t1) continue;
          const k = U.clamp((t - l.t0) / 0.08);
          ctx.strokeStyle = '#ff2a2a'; ctx.globalAlpha = 0.6 * k; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
          ctx.beginPath(); l.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
        }
        for (const m of marks) {
          if (t < m.t0 || t >= m.t1) continue;
          const k = U.eOutBack(U.clamp((t - m.t0) / 0.1));
          F.spr(ctx, MV.ART.get('markX'), m.p[0], m.p[1], { sc: (m.big ? 3 : 2) * k, ax: 3.5, ay: 3.5 });
        }
      },
    });
    const yb = MV.img('yBullet0');
    H.shots(shots.map((s) => Object.assign(s, {
      draw(ctx, emi, t, p) { F.spr(ctx, yb, p[0], p[1], { sc: 1, ax: yb.width / 2, ay: yb.height / 2, rot: s.ang(t) + Math.PI / 2 }); if (emi) D.rect(emi, p[0] - 4, p[1] - 4, 8, 8, HEX.yellow, 0.3); },
    })), { name: 'yellow bullet', clip: null, z: 9, keep });
    // the gun: turning to its next mark, kicking at each shot, shaking with his hands; lowered at
    // the end; the hat above it, tipped
    aims.sort((a, b) => a[0] - b[0]);
    const fires = shots.map((s) => s.t0);
    // (aims: [t, angle, dur] - it is on that angle 0.1 s before t, turning for dur before that)
    const gunAng = (t) => {
      let a = aims.length ? aims[0][1] : 0, prev = a;
      for (const [ta, v, du = 0.12] of aims) { if (t < ta - 0.1) return U.lerp(prev, v, U.smooth(U.clamp((t - (ta - 0.1 - du)) / du))); prev = v; a = v; }
      return U.lerp(a, 1.25, U.smooth(U.clamp((t - o.lower) / 0.3)));
    };
    const shake = (t) => { const tr = TL.pose.at(t).trem; return [U.noise(t * 31) * tr * 1.2, U.noise(t * 37 + 9) * tr * 0.9]; };
    const kick = (t) => { let r = 0; for (const f of fires) if (t >= f && t < f + 0.1) r = Math.max(r, 1 - (t - f) / 0.1); return r; };
    const things = [
      { img: img('cowboyHat'), x: GUN[0] - 6, y: GUN[1] - 68, fn: (t) => ({ rot: -0.4 * U.smooth(U.clamp((t - o.lower - 0.15) / 0.3)), dy: 3 * U.smooth(U.clamp((t - o.lower - 0.15) / 0.3)) }) },
      { img: img('gun'), x: GUN[0], y: GUN[1], ax: 3, ay: 4, fn: (t) => { const a = gunAng(t), k = kick(t), [sx, sy] = shake(t); return { rot: a, dx: -Math.cos(a) * k * 8 + sx, dy: -Math.sin(a) * k * 8 + sy }; } },
    ];
    // (o.home {t0, land}: then they fly home onto the yellow jar)
    H.absent('yellow', o.t0, o.home ? o.home.t0 : o.t1, things, { stand: { x: GUN[0] - 4, y: 422, h: 170 }, handoff: !!o.home, fadeOut: o.home ? 0.3 : undefined });
    if (o.home) FX.goHome('yellow', things.map((it, j) => ({ img: it.img, j, ax: it.ax, ay: it.ay, t0: o.home.t0 + j * 0.05, how: 'arc',
      from: (t) => { const f = it.fn(t); return [it.x + (f.dx || 0), it.y + (f.dy || 0), f.rot || 0, 3]; } })), o.home.land);
    // muzzle flashes
    TL.add({
      t0: o.t0, t1: o.t1, z: 4, keep,
      draw(ctx, emi, t) {
        for (const f of fires) {
          if (t < f || t > f + 0.06) continue;
          const a = gunAng(f), x = GUN[0] + Math.cos(a) * MUZ, y = GUN[1] + Math.sin(a) * MUZ;
          D.rect(ctx, x - 4, y - 4, 8, 8, '#fff6c0', 1); D.rect(ctx, x - 7, y - 1, 14, 2, HEX.yellow, 0.9); D.rect(ctx, x - 1, y - 7, 2, 14, HEX.yellow, 0.9);
          if (emi) F.glowAt(emi, x, y, 26, HEX.yellow, 0.7);
        }
      },
    });
    return { fires, hits, marks: marks.map((m) => ({ t: m.t0, p: m.p, onSoul: !!m.onSoul })) };
  };

  // ================================================================ green · the shield
  // the soul green and still in the middle; four pans at the box's edges keep his fire and toss it
  // in, arriving on the given times from the given sides; the shield turns to meet each one just
  // in time (o.back: throws that circle round and come from behind); what it blocks turns to
  // green light that drifts home to its jar
  const DIRV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }, OPP = { u: 'd', d: 'u', l: 'r', r: 'l' };
  // the 2D shield's turning: blocks [[t, 'u' | 'd' | 'l' | 'r']] -> its angle at t (it swings the
  // short way round to each side just before the blow), the flash and the recoil of each block
  FX.shieldTurns = (blocks) => {
    const ANG = { r: 0, d: Math.PI / 2, l: Math.PI, u: -Math.PI / 2 }, keys = [];
    let a = blocks.length ? ANG[blocks[0][1]] : -Math.PI / 2;
    for (const [ta, d] of blocks) {
      let b = ANG[d];
      while (b - a > Math.PI) b -= U.TAU;
      while (a - b > Math.PI) b += U.TAU;
      keys.push([ta, a, b]); a = b;
    }
    return {
      ang: (t) => { let v = keys.length ? keys[0][1] : a; for (const [ta, a0, b0] of keys) { if (t < ta - 0.1) break; v = U.lerp(a0, b0, U.eOut(U.clamp((t - (ta - 0.1)) / 0.07))); } return v; },
      flash: (t) => { let f = 0; for (const [ta] of blocks) if (t >= ta && t < ta + 0.12) f = Math.max(f, 1 - (t - ta) / 0.12); return f; },
      recoil: (t) => { let r = 0; for (const [ta] of blocks) if (t >= ta && t < ta + 0.3) r = Math.max(r, Math.exp(-(t - ta) * 14)); return r; },
    };
  };
  FX.green = (t0, t1, throws, o = {}) => {
    const bx = o.box || B.home, c = [bx.cx, bx.cy], keep = true;
    H.mode(t0, t1, 'green');
    H.hTo(t0 - 0.2, t0, c[0], c[1], 'inOut');
    const shield = new MV.Steps(throws.length ? throws[0][1] : 'u');
    const FLY = o.fly ?? T.beat, RS = 21;
    const panAt = (d) => { const v = DIRV[d]; return [c[0] + v[0] * (bx.w / 2 + 18), c[1] + v[1] * (bx.h / 2 + 14)]; };
    const flips = { u: [], d: [], l: [], r: [] }, blocks = [], shots = [];
    throws.forEach(([ta, d, back]) => {
      const v = DIRV[d], ts = ta - FLY;
      let p;
      if (back) {
        // it leaves the pan opposite, sweeps half round the soul, and comes in from d
        const from = OPP[d], vf = DIRV[from], a0 = Math.atan2(vf[1], vf[0]), a1 = Math.atan2(v[1], v[0]);
        let da = a1 - a0; if (Math.abs(Math.abs(da) - Math.PI) < 0.01) da = Math.PI;
        p = (t) => { const u = U.clamp((t - ts) / FLY), r = U.lerp(70, RS, U.eIn(u)), a = a0 + da * U.smooth(u); return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; };
        flips[from].push(ts);
      } else {
        const a = panAt(d), b = [c[0] + v[0] * RS, c[1] + v[1] * RS];
        p = B.arc(ts, ta, a, b, [v[1] * 30, -v[0] * 30 - 12], 'in');
        flips[d].push(ts);
      }
      shots.push({ t0: ts, t1: ta, hr: 5, p });
      shield.set(ta - 0.06, d);
      blocks.push([ta, d]);
      H.sfx(ts, 'Frypan', 0.14); H.sfx(ta, 'Bell', 0.1);
    });
    H.shots(shots, { name: 'pan fire', clip: null, z: 16, keep });
    // the shield: the green glass on the side it faces, turning to meet each throw
    const arc = FX.shieldTurns(blocks);
    TL.add({
      t0, t1, z: 41, keep,
      draw(ctx, emi, t) {
        const s = TL.heart.at(t), k = U.clamp((t - t0) / 0.2) * U.clamp((t1 - t) / 0.2);
        B.shieldArc(ctx, emi, s.x, s.y, arc.ang(t), { k, flash: arc.flash(t), recoil: 3 * arc.recoil(t) });
      },
    });
    // what the shield stops turns into green light: a burst, then motes drifting up and home to
    // the green jar
    const home = (t) => B.jarSoul('green', t);
    TL.add({
      t0, t1: t1 + 1.6, z: 42, keep,
      draw(ctx, emi, t) {
        for (const [ta, d] of blocks) {
          const u = (t - ta) / 1.5;
          if (u < 0 || u > 1) continue;
          const v = DIRV[d], s = TL.heart.at(ta), hj = home(t);
          for (let i = 0; i < 7; i++) {
            const h = U.hash(i * 3.7 + ta * 7.1), a = Math.atan2(v[1], v[0]) + (h - 0.5) * 2.4;
            const burst = U.eOut(U.clamp(u * 5)) * (14 + 16 * U.hash(i + ta)), fly = U.eInOut(U.clamp((u - 0.2 - h * 0.15) / 0.7));
            const bx0 = s.x + v[0] * RS + Math.cos(a) * burst, by0 = s.y + v[1] * RS + Math.sin(a) * burst;
            const x = U.lerp(bx0, hj[0], fly) + Math.sin(u * 9 + i) * 6 * (1 - fly), y = U.lerp(by0, hj[1], fly) - Math.sin(fly * Math.PI) * 60;
            const al = (1 - U.clamp((u - 0.85) / 0.15)) * (fly > 0.98 ? 0 : 1);
            D.rect(ctx, x - 1, y - 1, 2, 2, i % 3 ? HEX.green : '#d8ffd8', al);
            if (emi && i % 2) D.rect(emi, x - 3, y - 3, 6, 6, HEX.green, 0.25 * al);
          }
        }
      },
    });
    // the four pans at the box's edges, each with a small flame of his kept in it, flipping as
    // they toss
    TL.add({
      t0: t0 - 0.3, t1: t1 + 0.2, z: 17, keep,
      draw(ctx, emi, t) {
        const k = U.clamp((t - t0 + 0.3) / 0.3) * U.clamp((t1 + 0.2 - t) / 0.3), pan = B.prop('pan');
        for (const d of 'udlr') {
          const [x, y] = panAt(d), v = DIRV[d];
          let flip = 0;
          for (const tt of flips[d]) if (t >= tt - 0.1 && t < tt + 0.2) flip = Math.sin(U.clamp((t - tt + 0.1) / 0.3) * Math.PI);
          const a = Math.atan2(v[1], v[0]);
          if (o.lit && t >= o.lit[d]) B.fire(ctx, emi, x - v[0] * 4, y - v[1] * 4 - 4, t, d.charCodeAt(0), { sc: 0.8, a: k * (1 - flip) });
          F.spr(ctx, pan, x, y, { sc: 2, ax: 8, ay: 5, rot: a, alpha: k, sx: 1 - 1.6 * flip });
        }
      },
    });
    return { panAt };
  };

  // ================================================================ purple · the trap of notes
  // From the game (asset/six-soul.md): the purple soul is *trapped* - it walks only along
  // horizontal lines; in Omega Flowey's purple phase two columns of notebooks hold it between
  // them and words fly out of them along the lines (DEATH, DESPAIR, TRAPPED...; once the soul
  // helps, HOPE); the torn notebook "contains illegible scrawls"; the ball game's purple flag:
  // "Even when you felt trapped, you took notes". So: pages torn out of the child's notebook stand
  // in two columns at the lines' ends, the lines strung between them; on the off-beats a word is
  // written on one of them and flung along its line, shaking off ink; a page turns over toward
  // the camera and tears away; lines are scrawled out and torn one by one, the box closing on
  // those left - until the soul has one line and nowhere to go.
  //   pages: [{t0, t1, lines: [y offsets from the box's centre]}] (each after the first comes with
  //   a page turn); path: [[t, line, x offset]] the soul's places; words: [t | {t, line, side,
  //   word}] thrown on those times (when no line is given, one that misses the soul);
  //   o: {box, speed, books (the columns of pages; false: words come out of the walls), tear: [x, y]
  //   (the first pages are torn out of the notebook there and fly to their places), wordAt (where
  //   in FX.WORDS its words start), strikes: [{t, line, from: 'L' | 'R'}], squeeze (the box closes
  //   on the lines left), sorry: {t (written from), line, side, reach (it reaches the soul), x (the
  //   soul's x then)} - harmless}
  // (Omega Flowey's words, as the Chinese release has them)
  FX.WORDS = ['困住', '噩梦', '悲伤', '绝望', '恐惧', '仇恨', '毁灭', '厄运', '残忍', '死亡', '凶手', '恐怖', '屠杀', '摧毁', '腐化'];
  const INK = { neg: ['#d27cff', '#f8e0ff', '#22082e'], sorry: ['#fff0d6', '#ffffff', '#6a4424'] };
  // a word in the dialogue font, in its ink: outlined, each stroke's top lit (cached)
  FX.wordImg = (w, kind = 'neg') => F.cached('pword:' + kind + ':' + w, () => {
    const [fill, hi, line] = INK[kind], ww = D.textWidth(w, { scale: 1 }) + 2, [c, x] = MV.canvas(ww, 18);
    for (const [dx, dy] of [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]]) D.text(x, w, dx, dy, { scale: 1, color: line });
    D.text(x, w, 1, 1, { scale: 1, color: fill });
    const id = x.getImageData(0, 0, ww, 18), d = id.data, [fr, fg, fb] = F.rgb(fill), [hr, hg, hb] = F.rgb(hi);
    const isFill = (i, j) => { const p = (j * ww + i) * 4; return d[p + 3] > 0 && d[p] === fr && d[p + 1] === fg && d[p + 2] === fb; };
    for (let j = 17; j >= 1; j--) for (let i = 0; i < ww; i++) if (isFill(i, j) && !isFill(i, j - 1)) { const p = (j * ww + i) * 4; d[p] = hr; d[p + 1] = hg; d[p + 2] = hb; }
    x.putImageData(id, 0, 0);
    return c;
  });
  // a word's shot drawn (s.ws: its scale, 2 = the dialogue's own size): (s.tw) thrown - a white
  // frame as it leaves its page, three afterimages, ink shaken off its tail falling away;
  // s.write: [t0, t1] written in place first, stroke by stroke, a pen's point at the stroke;
  // s.cross: scrawled over there (struck out with its line)
  FX.wordDraw = (kind = 'neg') => function (ctx, emi, t, p, kk, s) {
    if (!p) return;
    const im = FX.wordImg(s.word, kind), ws = s.ws || 1, w = im.width * ws, hh = 18 * ws, hx = R(p[0] - w / 2), hy = R(p[1] - hh / 2);
    if (s.write && t < s.write[1]) {
      const u = U.clamp((t - s.write[0]) / (s.write[1] - s.write[0])), ww = Math.ceil(im.width * u);
      if (ww >= 1) { ctx.globalAlpha = kk; ctx.drawImage(im, 0, 0, ww, 18, hx, hy, ww * ws, hh); }
      D.rect(ctx, hx + ww * ws - 2, p[1] - 3 + R(Math.sin(t * 70) * 4 * ws), 2 + 2 * ws, 2 + 2 * ws, '#ffffff', kk);
      if (emi) F.glowAt(emi, hx + ww * ws, p[1], 18 * ws, kind === 'neg' ? HEX.purple : '#ffe6b8', 0.5 * kk);
      ctx.globalAlpha = 1;
      return;
    }
    const tl = t - s.tw;
    // (its speed: a smear of its own ink behind it - not copies of it - and streaks)
    if (s.sp && tl > 0) {
      ctx.globalAlpha = kk * 0.22; ctx.drawImage(F.tint(im, kind === 'neg' ? '#6a1a9a' : '#a87a4a'), R(p[0] - s.dir * 7 * ws - w / 2), hy, w, hh);
      for (let j = 0; j < 4; j++) {
        const h = U.hash(j * 2.7 + s.seed), len = (14 + 26 * h) * Math.min(1, tl * 6) * ws * 0.5, yy = R(p[1] - hh * 0.3 + (j / 3) * hh * 0.6);
        D.rect(ctx, s.dir > 0 ? hx - len - 2 : hx + w + 2, yy, len, 2, kind === 'neg' ? '#b050f0' : '#ffe2b0', kk * (0.25 + 0.2 * h));
      }
    }
    ctx.globalAlpha = kk;
    ctx.drawImage(tl >= 0 && tl < 0.045 ? F.tint(im, '#ffffff') : im, hx, hy, w, hh);
    ctx.globalAlpha = 1;
    // struck out: the scrawl runs over it, it goes
    if (s.cross !== null && s.cross !== undefined && t >= s.cross) {
      const u = U.clamp((t - s.cross) / 0.06);
      for (let q = 0; q < w * u; q += 2) D.rect(ctx, hx + q, p[1] - 2 + ((q >> 2) % 2 ? 4 : -4) * ws * (0.6 + 0.4 * U.hash(q + s.seed)), 2, 2, '#f4dcff', kk);
    }
    // ink shaken off its tail
    for (let j = 0; j < 14; j++) {
      const tj = s.tw + 0.03 + j * 0.065, a = t - tj;
      if (a < 0 || a > 0.42 || tj > s.t1) continue;
      const q = s.p(tj), h = U.hash(j * 3.1 + s.seed * 7);
      D.rect(ctx, q[0] - s.dir * (w / 2 - 3) + (h - 0.5) * 10, q[1] + 3 * ws + 560 * a * a + (h - 0.5) * 6 * ws, 2, 2, kind === 'neg' ? '#a23ee0' : '#ffe2b0', kk * (1 - a / 0.42));
    }
    if (emi) F.glowAt(emi, p[0], p[1], 22 * ws, kind === 'neg' ? HEX.purple : '#fff0d0', 0.32 * kk);
  };
  // a page turning over: the box's page lifts at its free (right) edge, turns over its left edge
  // toward the camera, bending as paper does, and three quarters over tears loose and flies off -
  // what was written on it going with it. Drawn on the screen in the camera's own perspective
  // (the camera must be level: it maps the battle plane straight to the screen). tF: it stands
  // upright on the beat. o: {box, snap: () => ({lines: [y offsets], words: [{img, x, y}]})}
  const LEAD = (FX.TURN_LEAD = 0.13);
  FX.pageTurn = (tF, o) => {
    const T0 = tF - LEAD, TEAR = tF + 0.07, T1 = tF + 0.36, b = o.box;
    let pic = null;
    const make = () => {
      const W = b.w, Hh = b.h, [fc, fx] = MV.canvas(W, Hh), [bc, bk] = MV.canvas(W, Hh), snap = o.snap();
      fx.fillStyle = '#000000'; fx.fillRect(0, 0, W, Hh);
      fx.fillStyle = '#1e1030'; for (let y = 9; y < Hh; y += 9) fx.fillRect(0, y, W, 1);
      fx.fillStyle = '#4a1428'; fx.fillRect(22, 0, 1, Hh);
      fx.fillStyle = HEX.purple; for (const dy of snap.lines) fx.fillRect(0, R(Hh / 2 + dy - 1), W, 2);
      for (const w of snap.words) { const ws = w.ws || 1; fx.drawImage(w.img, R(w.x - b.cx + W / 2 - (w.img.width * ws) / 2), R(w.y - b.cy + Hh / 2 - 9 * ws), w.img.width * ws, 18 * ws); }
      // the frame along its free edges
      fx.fillStyle = '#ffffff'; fx.fillRect(0, 0, W, 4); fx.fillRect(0, Hh - 4, W, 4); fx.fillRect(W - 4, 0, 4, Hh);
      // its back: the paper's dark side, what is written showing through, mirrored
      bk.fillStyle = '#160e20'; bk.fillRect(0, 0, W, Hh);
      bk.save(); bk.translate(W, 0); bk.scale(-1, 1); bk.globalAlpha = 0.28; bk.drawImage(fc, 0, 0); bk.restore();
      bk.fillStyle = '#d8d0e8'; bk.fillRect(0, 0, W, 4); bk.fillRect(0, Hh - 4, W, 4); bk.fillRect(0, 0, 4, Hh);
      return [fc, bc];
    };
    TL.add({
      t0: T0, t1: T1, z: 50, screen: true, name: 'page turn',
      draw(ctx, emi, t, S) {
        const [front, back] = pic || (pic = make());
        const c = S.cam, z = c.zoom || 1, d = MV.OH / 2 / (Math.tan((c.fov || 0.7) / 2) * z);
        const W = b.w, Hh = b.h, y0 = b.cy - Hh / 2, y1 = b.cy + Hh / 2;
        // slow off the page, fastest as it stands; torn loose, it flies on, up and away
        const th0 = t < TEAR ? 0.72 * Math.PI * U.clamp((t - T0) / (TEAR - T0)) ** 1.6 : 0.72 * Math.PI + 4.2 * (t - TEAR);
        const fly = Math.max(0, t - TEAR), offX = -950 * fly * fly - 140 * fly, offY = -260 * fly, al = 1 - U.clamp(fly / 0.27);
        if (al <= 0.01) return;
        // (the paper bends: its free edge leads)
        const N = 40, du = W / N, pts = [[b.cx - W / 2 + offX, 0]];
        for (let i = 0; i < N; i++) {
          const u = (i + 0.5) / N, th = th0 + 0.55 * Math.sin(Math.min(Math.PI, th0)) * u ** 1.5, q = pts[i];
          pts.push([q[0] + Math.cos(th) * du, q[1] + Math.sin(th) * du * 0.8]);
        }
        const toS = (wx, wy, dz) => { const s = d / Math.max(0.32 * d, d - dz); return [(wx - c.x) * z * s + MV.OW / 2, (wy + offY - c.y) * z * s + MV.OH / 2]; };
        ctx.save(); ctx.globalAlpha = al; ctx.imageSmoothingEnabled = false;
        for (let i = 0; i < N; i++) {
          const [xa, za] = pts[i], [xb, zb] = pts[i + 1], xm = (xa + xb) / 2, zm = (za + zb) / 2;
          const A = toS(xa, y0, za)[0], Bx = toS(xb, y0, zb)[0], top = toS(xm, y0, zm)[1], bot = toS(xm, y1, zm)[1];
          const sw = Math.abs(Bx - A);
          if (sw < 0.05) continue;
          const face = Bx >= A, x0 = Math.floor(Math.min(A, Bx));
          ctx.globalAlpha = al;
          ctx.drawImage(face ? front : back, face ? i * du : W - (i + 1) * du, 0, du, Hh, x0, top, Math.ceil(sw) + 1, bot - top);
          // the face turning from the light; the back dim; a sheen along the bend
          const th = Math.atan2(zb - za, xb - xa), sh = face ? 0.55 * (1 - Math.cos(th)) / 2 : 0.38 * (1 + Math.cos(th)) / 2;
          ctx.globalAlpha = al * sh; ctx.fillStyle = '#000000'; ctx.fillRect(x0, top, Math.ceil(sw) + 1, bot - top);
          const gl = face ? Math.max(0, 1 - Math.abs(th - 0.9) / 0.35) : 0;
          if (gl > 0) { ctx.globalAlpha = al * 0.16 * gl; ctx.fillStyle = '#f4ecff'; ctx.fillRect(x0, top, Math.ceil(sw) + 1, bot - top); }
        }
        // torn at the hinge: shreds of paper
        if (fly > 0) for (let k = 0; k < 9; k++) {
          const h = U.hash(k * 2.3 + tF), q = toS(b.cx - W / 2 - 20 * fly - 260 * h * fly, y0 + h * Hh - 140 * fly * (0.5 + h), 0);
          ctx.globalAlpha = al; ctx.fillStyle = k % 3 ? '#ece6d8' : HEX.purple; ctx.fillRect(R(q[0]), R(q[1]), 3 * z, 3 * z);
        }
        ctx.restore();
      },
    });
  };
  FX.purple = (pages, path, words, o = {}) => {
    const bx = o.box || B.home, keep = true, SPEED = o.speed ?? 300, books = o.books !== false, WS = o.ws ?? 2;
    const tA = pages[0].t0, tZ = pages[pages.length - 1].t1;
    const X0 = bx.cx - bx.w / 2, X1 = bx.cx + bx.w / 2, POST = 20; // (the columns stand POST px outside the walls)
    const pageAt = (t) => pages.find((p) => t >= p.t0 && t < p.t1) || (t < tA ? pages[0] : pages[pages.length - 1]);
    const lineY = (pg, i) => bx.cy + pg.lines[i];
    const RUN = 0.2, SNAP = 0.14, ARR = 0.26;
    const strikes = (o.strikes || []).map((s) => Object.assign({}, s, { pg: pageAt(s.t + 0.01) }));
    const strikeOf = (pg, i) => strikes.find((s) => s.pg === pg && s.line === i);
    // a line lasts from its page's start until it is torn
    const lineEnd = (pg, i) => { const s = strikeOf(pg, i); return s ? s.t + RUN : pg.t1; };
    // each column page comes: torn out of the notebook (the first page, o.tear), else dropped into
    // its place as the page before turns
    const arrive = (pg, i, side) => (pages.indexOf(pg) === 0 && o.tear ? pg.t0 + 0.12 + (i * 2 + (side === 'L' ? 1 : 0)) * 0.05 : pg.t0 - LEAD + 0.02 + i * 0.03);
    // a line can carry words once both its pages stand; the first page's lines are ruled in then
    // (the later ones are already printed on the page under the one turning over)
    const ready = (pg, i) => (books ? Math.max(arrive(pg, i, 'L'), arrive(pg, i, 'R')) + ARR : pg.t0 + i * 0.03);
    const ruled = (pg, i) => (pages.indexOf(pg) === 0 ? ready(pg, i) : pg.t0 - LEAD);
    // (the next page's turn: what is on this one goes with it)
    const turnOf = (pg) => { const n = pages[pages.indexOf(pg) + 1]; return n ? n.t0 - LEAD : Infinity; };
    H.mode(tA, tZ, 'purple');
    path.forEach(([t, li, dx], k) => {
      const pg = pageAt(t + 0.01);
      if (k === 0) H.hTo(t - 0.25, t, bx.cx + dx, lineY(pg, li), 'inOut');
      else H.hTo(t, t + 0.12, bx.cx + dx, lineY(pg, li), 'out');
    });
    // the pen racing along a struck line; then the torn line springing back to its page
    const penX = (s, t) => { const u = U.clamp((t - s.t) / RUN); return s.from === 'L' ? U.lerp(X0, X1, u) : U.lerp(X1, X0, u); };
    const tornX = (s, t) => { const v = U.eIn(U.clamp((t - s.t - RUN) / SNAP)); return s.from === 'L' ? U.lerp(X1, X0, v) : U.lerp(X0, X1, v); };
    const scrawlEnd = (s, t) => (t < s.t + RUN ? penX(s, t) : tornX(s, t));
    // ---- the words
    const list = words.map((w) => (typeof w === 'number' ? { t: w } : w)), shots = [];
    // (one word to a line at a time: a line someone else is on - or is given to - stays free)
    const busy = (pg, li, t) => shots.some((s) => s.pg === pg && s.li === li && Math.abs(s.t0 - t) < 0.9) || list.some((w) => w.line === li && w.t !== t && Math.abs(w.t - t) < 0.9 && pageAt(w.t + 0.01) === pg);
    // (a word may be given its own speed, or a place to be at its end: {to: x, end: t} - safe: it
    // does not hurt; the score does something else with it then)
    list.forEach((w, k) => {
      const pg = pageAt(w.t + 0.01), side = w.side || (k % 2 ? 'L' : 'R'), dir = side === 'L' ? 1 : -1;
      const word = w.word || FX.WORDS[((o.wordAt ?? 0) + k) % FX.WORDS.length], im = FX.wordImg(word), ww = im.width * WS;
      const x0 = books ? (side === 'L' ? X0 - POST : X1 + POST) : side === 'L' ? X0 + 4 + ww / 2 : X1 - 4 - ww / 2, xEnd = side === 'L' ? X1 + POST : X0 - POST;
      const SP = w.to !== undefined && w.end ? Math.abs(w.to - x0) / (w.end - w.t) : w.speed ?? SPEED;
      const hy = TL.heart.at(w.t).y;
      // (the lines next to the soul first: close calls)
      const order = w.line !== undefined ? [w.line] : [...pg.lines.keys()].sort((a, b) => Math.abs(lineY(pg, a) - hy) - Math.abs(lineY(pg, b) - hy));
      for (const li of order) {
        if (lineEnd(pg, li) < w.t + 0.1 || ready(pg, li) > w.t || (w.line === undefined && busy(pg, li, w.t))) continue;
        const y = lineY(pg, li);
        let t1 = Math.min(w.t + (Math.abs(xEnd - x0) + ww / 2) / SP, turnOf(pg) + 0.005, w.end ?? Infinity), cross = null;
        // (it splashes on the far wall)
        const tHit = w.end ? Infinity : w.t + (Math.abs((dir > 0 ? X1 : X0) - x0) - ww / 2) / SP;
        // overtaken by the pen striking its line: scrawled out where they meet
        const st = strikeOf(pg, li);
        if (st && st.t < t1) for (let tt = Math.max(st.t, w.t); tt < t1; tt += 1 / 240) {
          const px = x0 + dir * SP * (tt - w.t), hx = penX(st, tt);
          if (st.from === 'L' ? hx >= px - ww / 2 : hx <= px + ww / 2) { cross = tt; t1 = tt + 0.1; break; }
        }
        const splat = cross === null && tHit < t1 - 0.01 ? tHit : null;
        const s = { t0: w.t, t1, tw: w.t, hw: ww / 2 - 4, hh: 5 * WS, ws: WS, word, dir, sp: SP, cross, splat, y, li, pg, fadeIn: 0.01, fadeOut: cross !== null ? 0.08 : w.end ? 0.001 : 0.03, safe: !!w.safe,
          p: (t) => [x0 + dir * SP * Math.max(0, t - w.t), y] };
        if (w.line !== undefined || B.minDist(s) >= 14) { shots.push(s); break; }
      }
      H.sfx(w.t, 'BookSpin', 0.08);
    });
    H.shots(shots.map((s) => Object.assign(s, { draw: FX.wordDraw('neg') })), { name: 'word', keep, z: 6 });
    // ---- the struck lines: hazards while the pen runs and the line springs back
    H.shots(strikes.map((s) => {
      const y = lineY(s.pg, s.line), near = s.from === 'L' ? X0 : X1;
      return { t0: s.t, t1: s.t + RUN + SNAP, p: () => [bx.cx, y], draw() {}, seg: (t) => [near, y, scrawlEnd(s, t), y, 6] };
    }), { name: 'scrawl', keep });
    strikes.forEach((s) => { H.sfx(s.t, 'Swipe', 0.24); H.sfx(s.t + RUN, 'BookSpin', 0.16); });
    // the box closes on the lines left
    if (o.squeeze) strikes.forEach((s) => {
      const ys = s.pg.lines.map((_, i) => i).filter((i) => { const st = strikeOf(s.pg, i); return !st || st.t > s.t; }).map((i) => lineY(s.pg, i));
      if (!ys.length) return;
      const top = Math.min(...ys) - 18, bot = Math.max(...ys) + 18, tq = s.t + RUN + SNAP * 0.6;
      H.boxTo(tq, tq + 0.12, { cy: (top + bot) / 2, h: bot - top }, 'outBack');
      H.sfx(tq, 'Slam', 0.15);
      TL.impact(tq + 0.03, { amp: 4, dy: lineY(s.pg, s.line) < bx.cy ? 1 : -1, zoom: 0.015, dur: 0.2 });
    });
    // ---- the page: its faint rules and margin, the lines (ruled in from the left, lit under a
    // word), the scrawls
    const scrawl = (ctx, emi, t, s, y, k) => {
      const near = s.from === 'L' ? X0 : X1, dir = s.from === 'L' ? 1 : -1, end = scrawlEnd(s, t), len = Math.abs(end - near);
      if (len < 2) return;
      // (two passes of a zigzag, crumpling as the torn line springs back)
      const v = U.clamp((t - s.t - RUN) / SNAP), amp = 4 + 5 * v;
      for (let pass = 0; pass < 2; pass++) {
        let py = y;
        for (let q = 0; q <= len; q += 2) {
          const seg = Math.floor(q / 6), f = (q % 6) / 6, z0 = ((seg + pass) % 2 ? 1 : -1) * amp * (0.55 + 0.45 * U.hash(seg * 0.37 + pass * 5 + s.t)), z1 = ((seg + 1 + pass) % 2 ? 1 : -1) * amp * (0.55 + 0.45 * U.hash((seg + 1) * 0.37 + pass * 5 + s.t));
          py = y + U.lerp(z0, z1, f);
          D.rect(ctx, near + dir * q, py - 1, 2, 2, pass ? '#f4dcff' : '#a02ae0', k);
        }
      }
      if (t < s.t + RUN) { D.rect(ctx, end - 3, y - 3, 6, 6, '#ffffff', k); if (emi) F.glowAt(emi, end, y, 26, '#f0c0ff', 0.75 * k); }
    };
    const splatAt = (ctx, t, s) => {
      const a = t - s.splat;
      if (s.splat === null || a < 0 || a > 0.32) return;
      const xw = s.dir > 0 ? X1 - 2 : X0 + 2;
      for (let j = 0; j < 9; j++) { const h = U.hash(j * 5.3 + s.seed), h2 = U.hash(j * 1.7 + s.seed * 3); D.rect(ctx, xw - s.dir * (30 + 90 * h) * a, s.y + (h2 - 0.5) * 160 * a + 420 * a * a, 2, 2, j % 3 ? '#a23ee0' : '#f4dcff', 1 - a / 0.32); }
    };
    TL.add({
      t0: tA - 0.2, t1: tZ + 0.35, z: 1, clip: 'box', keep, name: 'purple page',
      draw(ctx, emi, t) {
        const pg = pageAt(t + LEAD), b = MV.box2At(t), k = U.clamp((t - tA + 0.1) / 0.2) * (1 - U.clamp((t - tZ) / 0.3));
        if (k <= 0.01) return;
        for (let y = R(b.y) + 9; y < b.y + b.h; y += 9) D.rect(ctx, b.x, y, b.w, 1, '#1e1030', k);
        D.rect(ctx, b.x + 22, b.y, 1, b.h, '#4a1428', k);
        pg.lines.forEach((dy, i) => {
          const y = lineY(pg, i), r0 = ruled(pg, i), st = strikeOf(pg, i);
          if (t < r0) return;
          if (!st || t < st.t + RUN) {
            const ru = U.eOut(U.clamp((t - r0) / 0.12)), xb = U.lerp(X0, X1, ru);
            D.rect(ctx, X0, y - 1, xb - X0, 2, HEX.purple, 0.95 * k);
            if (ru < 1) { D.rect(ctx, xb - 3, y - 2, 6, 4, '#f4dcff', k); if (emi) F.glowAt(emi, xb, y, 16, HEX.purple, 0.5 * k); }
            for (const s of shots) if (s.pg === pg && s.li === i && t >= s.t0 && t < s.t1) { const px = s.p(t)[0]; D.rect(ctx, px - s.hw - 8, y - 1, 2 * s.hw + 16, 2, '#f0c8ff', 0.75 * k); }
          }
          if (st && t >= st.t) scrawl(ctx, emi, t, st, y, k);
        });
        for (const s of shots) splatAt(ctx, t, s);
      },
    });
    // ---- the columns of pages (Omega Flowey's two columns of notebooks): each holds its line's
    // end; it lifts and brightens as its word is written on it, flashes as it is thrown; struck,
    // its line torn, it tears loose and falls; at a page turn the column is blown away with it
    if (books) TL.add({
      t0: tA - 0.1, t1: tZ + 0.6, z: 4, keep, name: 'purple columns',
      draw(ctx, emi, t) {
        const kOut = 1 - U.clamp((t - tZ) / 0.35), pimg = MV.ART.get('notePage'), wimg = F.tint(pimg, '#ffffff');
        pages.forEach((pg, pi) => {
          const gone = turnOf(pg);
          if (t < pg.t0 - 0.3 || t > gone + 0.5) return;
          pg.lines.forEach((dy, i) => {
            const y = lineY(pg, i), st = strikeOf(pg, i);
            for (const side of ['L', 'R']) {
              const ta = arrive(pg, i, side);
              if (t < ta) continue;
              const xs = side === 'L' ? X0 - POST : X1 + POST, sg = side === 'L' ? -1 : 1, ph = i * 1.7 + (side === 'L' ? 0 : 2.3);
              let x = xs, yy = y + Math.sin(t * 2.4 + ph) * 1.5, rot = 0.07 * sg, a = kOut;
              const u = U.clamp((t - ta) / ARR);
              if (u < 1) {
                if (pi === 0 && o.tear) { const e = U.eOut(u); x = U.lerp(o.tear[0], xs, e); yy = U.lerp(o.tear[1], y, e) - Math.sin(e * Math.PI) * 70; rot += (1 - e) * 6 * sg; }
                else { const e = U.eOutBack(u); yy = U.lerp(y - 80, y, e); a *= U.clamp(u * 3); }
              }
              if (st) {
                // (the far one is hit as the pen reaches it; the near one goes as the line springs back)
                const far = (st.from === 'L') !== (side === 'L'), tf = st.t + (far ? RUN : RUN + SNAP);
                if (t > tf) { const f = t - tf; yy += 760 * f * f - 60 * f; x += sg * 50 * f; rot += sg * 8 * f; a *= 1 - U.clamp(f / 0.5); }
                else if (t > st.t && !far) x += U.noise(t * 60 + i) * 2.5;
              }
              // (blown off by the page turning over: up and away from the box)
              if (t > gone) { const f = t - gone; x += sg * (700 * f * f + 110 * f); yy -= 150 * f + 420 * f * f; rot += sg * 9 * f; a *= 1 - U.clamp(f / 0.4); }
              // (o.close: the notebook shuts - the pages still standing fly back into it)
              if (o.close && t > o.close + i * 0.02) {
                const f = U.eInOut(U.clamp((t - o.close - i * 0.02) / 0.24));
                x = U.lerp(x, o.tear[0], f); yy = U.lerp(yy, o.tear[1], f) - Math.sin(f * Math.PI) * 34; rot += f * 2.5 * sg; a *= 1 - U.clamp((f - 0.75) / 0.25);
              }
              if (a <= 0.01) continue;
              // (its word being written on it: it lifts, flutters, brightens; thrown: a flash)
              let lift = 0, flut = Math.sin(t * 8 + ph * 1.3);
              for (const s of shots) if (s.pg === pg && s.li === i && (s.dir > 0) === (side === 'L')) {
                const dd = t - s.tw;
                if (dd > -0.16 && dd < 0.22) { lift = Math.max(lift, dd < 0 ? 1 + dd / 0.16 : 1 - dd / 0.22); flut = Math.sin(t * 46 + ph); }
              }
              if (o.sorry && o.sorry.line === i && (o.sorry.side || 'L') === side && pg === pageAt(o.sorry.t + 0.01) && t > o.sorry.t - 0.2) lift = Math.max(lift, 0.8);
              ctx.save(); ctx.globalAlpha = a; ctx.translate(R(x + sg * lift * 3), R(yy - lift * 3)); ctx.rotate(rot); ctx.scale(2 * (0.72 + 0.28 * Math.abs(flut)), 2);
              ctx.drawImage(pimg, -5, -6.5);
              if (lift > 0.01) { ctx.globalAlpha = a * 0.75 * lift; ctx.drawImage(wimg, -5, -6.5); }
              ctx.restore(); ctx.globalAlpha = 1;
              if (emi) F.glowAt(emi, x, yy, 20 + 16 * lift, HEX.purple, (0.14 + 0.5 * lift) * a);
              // its line runs out to it through the box's wall
              if (t >= Math.max(ruled(pg, i), ta + ARR * 0.7) && (!st || t < st.t + RUN) && t < gone && !(o.close && t > o.close)) {
                const xa = side === 'L' ? x + 9 : X1 + 5, xb2 = side === 'L' ? X0 - 5 : x - 9;
                if (xb2 > xa) D.rect(ctx, xa, y - 1, xb2 - xa, 2, HEX.purple, 0.9 * a);
              }
            }
          });
        });
      },
    });
    // ---- page turns: the page before goes over, carrying what was on it
    pages.slice(1).forEach((pg, j) => {
      const prev = pages[j], tT = pg.t0 - LEAD;
      FX.pageTurn(pg.t0, { box: bx, snap: () => ({
        lines: prev.lines.filter((_, i) => lineEnd(prev, i) > tT && ruled(prev, i) <= tT),
        words: shots.filter((s) => s.pg === prev && s.t0 <= tT && s.t1 > tT - 0.01).map((s) => ({ img: FX.wordImg(s.word), x: s.p(tT)[0], y: s.y, ws: s.ws })),
      }) });
      H.sfx(tT, 'BookSpin', 0.34); H.sfx(pg.t0, 'SwipeShort', 0.22); H.sfx(pg.t0 + 0.07, 'Swipe', 0.12);
    });
    // ---- the last word: written slowly in pale ink where the line begins; it comes along the
    // one line there is, through the soul - and does not hurt
    if (o.sorry) {
      const sr = o.sorry, pg = pageAt(sr.t + 0.01), y = lineY(pg, sr.line), side = sr.side || 'L', dir = side === 'L' ? 1 : -1;
      const im = FX.wordImg('对不起', 'sorry'), ww = im.width * WS, x0 = side === 'L' ? X0 + 6 + ww / 2 : X1 - 6 - ww / 2;
      const tGo = sr.t + (sr.write ?? 0.32), v = Math.abs(sr.x - x0) / Math.max(0.1, sr.reach - tGo), tEnd = sr.reach + 0.34;
      const s = { t0: sr.t, t1: tEnd, safe: true, hw: ww / 2, hh: 7 * WS, ws: WS, word: '对不起', dir, sp: v, tw: tGo, write: [sr.t, tGo], cross: null, fadeIn: 0.01, fadeOut: 0.22,
        p: (t) => [x0 + dir * v * Math.max(0, t - tGo), y] };
      H.shots([Object.assign(s, { draw: FX.wordDraw('sorry') })], { name: 'sorry', keep, z: 7 });
      H.sfx(sr.t, 'Harp', 0.2); H.sfx(sr.reach, 'Sparkle', 0.18);
      // as it goes it breaks into motes that drift up to the purple jar
      TL.add({
        t0: tEnd - 0.24, t1: tEnd + 0.9, z: 8, keep, name: 'sorry motes',
        draw(ctx, emi, t) {
          const from = s.p(tEnd - 0.24), jar = B.jarSoul('purple', t);
          for (let m = 0; m < 18; m++) {
            const h = U.hash(m * 3.7 + 1), h2 = U.hash(m * 5.1 + 2), u = U.clamp((t - (tEnd - 0.24) - h * 0.2) / 0.75);
            if (u <= 0 || u >= 1) continue;
            const e = U.eInOut(u), sx = from[0] + (h - 0.5) * ww, sy = from[1] + (h2 - 0.5) * 12 * WS;
            const px = U.lerp(sx, jar[0], e) + Math.sin(u * Math.PI) * (h2 - 0.5) * 60, py = U.lerp(sy, jar[1], e) - Math.sin(u * Math.PI) * 50;
            D.rect(ctx, px - 1, py - 1, 2, 2, m % 3 ? '#fff0d6' : HEX.purple, Math.sin(u * Math.PI));
            if (emi) D.rect(emi, px - 3, py - 3, 6, 6, '#fff0d6', 0.3 * Math.sin(u * Math.PI));
          }
        },
      });
    }
    return { shots, strikes };
  };

  // ================================================================ blue · the music box
  // gravity: the soul blue on the floor; shoes pirouette along it on the given times (crossing the
  // soul's place, it hops them); stars fall between, never over it. o.turn: [t0, t1] the box turns
  // a quarter round like a music box's stage, the soul tumbling to the new floor
  FX.blue = (phases, shoeTimes, starTimes, o = {}) => {
    const bx = o.box || B.home, I = B.inner(bx, 8), keep = true;
    const tA = phases[0].t0, tZ = phases[phases.length - 1].t1;
    H.mode(tA, tZ, 'blue');
    const phaseAt = (t) => phases.find((p) => t >= p.t0 && t < p.t1) || null;
    const shots = [], hops = [];
    const US = [bx.cx + 4, bx.cx - 30, bx.cx + 26, bx.cx - 10, bx.cx + 36, bx.cx - 38, bx.cx + 8, bx.cx - 22];
    shoeTimes.forEach((tc, k) => {
      const ph = phaseAt(tc), dir = k % 2 ? 1 : -1, SP = o.speed ?? 330;
      if (!ph) return;
      const uh = TL.heart.at(tc - 0.3).x, uS0 = dir > 0 ? I.x0 - 50 : I.x1 + 50;
      const ts = tc - Math.abs(uh - uS0) / SP, te = ts + (I.x1 - I.x0 + 100) / SP;
      if (ts < ph.t0 + 0.2) return;
      shots.push({
        t0: ts, t1: Math.min(te, ph.t1), hw: 12, hh: 6,
        p: (t) => [uS0 + dir * SP * (t - ts), I.y1 - 5],
        draw(ctx, emi, t, p, kk) {
          // en pointe, turning as it slides
          const sq = Math.cos((t - ts) * 14);
          ctx.save(); ctx.globalAlpha = kk; ctx.translate(R(p[0]), R(p[1] + 4)); ctx.scale(2 * (Math.abs(sq) < 0.2 ? 0.2 * Math.sign(sq || 1) : sq) * (dir < 0 ? -1 : 1), 2);
          ctx.drawImage(B.prop('shoe'), -8, -8); ctx.restore(); ctx.globalAlpha = 1;
        },
      });
      hops.push(tc);
      H.sfx(ts, 'Arrow', 0.06);
    });
    // stars from the ceiling, never over the soul
    const stars = [];
    starTimes.forEach((tc, k) => {
      const ph = phaseAt(tc);
      if (!ph) return;
      const s0 = TL.heart.at(tc);
      let uu = s0.x + (k % 2 ? 1 : -1) * (40 + (k % 3) * 16);
      if (uu < I.x0 + 4 || uu > I.x1 - 4) uu = s0.x - (k % 2 ? 1 : -1) * (40 + (k % 3) * 16);
      const SPD = 300, ts = tc - (I.y1 - I.y0 - 10) / SPD;
      if (ts < ph.t0 + 0.2) return;
      stars.push({ t0: ts, t1: Math.min(ts + (I.y1 - I.y0 + 20) / SPD, ph.t1), hr: 5, p: (t) => [uu, I.y0 - 10 + SPD * (t - ts)],
        draw(ctx, emi, t, p, kk) { F.spr(ctx, B.prop('star'), p[0], p[1], { sc: 2, ax: 3.5, ay: 3.5, rot: t * 5, alpha: kk }); if (emi) F.glowAt(emi, p[0], p[1], 10, '#ffe86a', 0.3 * kk); } });
    });
    H.shots(B.clear(shots, 6), { name: 'shoe', keep });
    H.shots(B.clear(stars, 12), { name: 'star', keep });
    return { hops };
  };

  // ================================================================ orange · the ring
  // (user, 2026-10-05) The box is the ring and its own frame is the ropes: the bandanna's two gloves
  // sit inside it against its sides. On the off-beat a glove draws its side of the frame back -
  // pushed out into a V, quivering; on the beat the frame snaps and shoots it across at the soul.
  // And the brave soul does not run: it steps into the glove's lane and parries it on the beat
  // (振刀 - a clang, a flash, an arc of orange light), and the glove is knocked back the way it came
  // into its own side of the frame, which gives and throws it back to rest.
  // o.stop: no punches from then; o.sling {draw, fire, hit, back}: the counterattack - both gloves
  // drawn back together and let go together; the soul parries both at once and knocks them up into
  // the top of the frame, which gives like a rope and slings them up out of the ring into his chest
  // (hit); they fall back in (back). o.home: from then the gloves are the score's (they go home to
  // their jar). Returns the punches [[t, side]], the parries as rings [[t0, t1, x, y, r0, r1]] (the
  // world's gusts) and gloveAt(side, t).
  FX.orange = (t0, t1, beats, o = {}) => {
    const bx = o.box || B.home, keep = true, cx = bx.cx, cy = bx.cy, tStop = o.stop ?? t1, SL = o.sling;
    // (the sling: from the double parry (fire) the gloves are pressed up into the top of the frame
    // and stretch it further and further until it is let go (load); the blow lands at hit)
    const LOAD = SL ? SL.load ?? SL.fire + 0.1 : 0, STRETCH = 24;
    const stretch = (t) => (SL && t >= SL.fire + 0.1 && t < LOAD ? STRETCH * U.eOut(U.clamp((t - SL.fire - 0.1) / Math.max(0.01, LOAD - SL.fire - 0.1))) + U.noise(t * 60) * 2.2 : 0);
    const X = { '-1': bx.cx - bx.w / 2, 1: bx.cx + bx.w / 2 }, YT = bx.cy - bx.h / 2, YB = bx.cy + bx.h / 2;
    // the glove's centre in from its side at rest; out past it drawn back; its half width; how far
    // from the soul's middle it is met
    const REST = 18, OUT = 30, GW = 28, PARRY = GW + 12;
    // ---- the punches: alternate sides, each down a lane the soul steps into to meet it
    const LANES = [-30, 24, -10, 36, -36, 6, 30, -22, 14, -4, 34];
    const P = { '-1': [], 1: [] }, punches = [], ringInfo = [], all = [];
    let k = 0;
    beats.forEach((tk) => {
      if (tk < t0 + T.beat / 2 - 0.01 || tk > t1 - 0.1 || tk >= tStop - 0.05) return;
      const s = k % 2 ? 1 : -1, y = cy + LANES[k % LANES.length], px = cx + s * 10;
      k++;
      const q = { tk, s, y, px, tw0: tk - T.beat / 2 + 0.02, tw1: tk - 0.16, tr: tk - 0.09, tb: tk + 0.18, tz: tk + 0.36 };
      P[s].push(q); all.push(q); punches.push([tk, s]);
      ringInfo.push([tk, tk + 0.4, px + s * 8, y, 6, 140]);
      H.sfx(q.tw0, 'Pullback', 0.12); H.sfx(q.tr, 'SwipeShort', 0.1);
      H.sfx(tk, 'PunchStrong', 0.24); H.sfx(tk, 'Saber', 0.22); H.sfx(q.tb, 'Impact', 0.08);
      TL.impact(tk, { amp: 4, dx: -s, zoom: 0.02, flash: 0.1, flashCol: [1, 0.7, 0.35], flashDecay: 16, dur: 0.25 });
    });
    // ---- the soul: from lane to lane, a lunge into each glove as it parries; at the sling, the
    // middle (it parries both there)
    const keys = [[t0, cx, cy]];
    for (const q of all) { keys.push([q.tk - 0.12, q.px - q.s * 8, q.y]); keys.push([q.tk, q.px, q.y]); keys.push([q.tk + 0.12, q.px - q.s * 4, q.y]); }
    const ySl = cy + 22;
    if (SL) keys.push([SL.draw + 0.2, cx, ySl], [SL.back + 0.3, cx, cy]);
    const soulAt = (t) => {
      let i = 0;
      while (i < keys.length - 1 && t > keys[i + 1][0]) i++;
      if (i >= keys.length - 1) return [keys[i][1], keys[i][2]];
      const [ta, xa, ya] = keys[i], [tb, xb, yb] = keys[i + 1], u = U.smooth(U.clamp((t - ta) / Math.max(1e-3, tb - ta)));
      return [U.lerp(xa, xb, u), U.lerp(ya, yb, u)];
    };
    H.hTo(t0 - 0.25, t0, cx, cy, 'inOut');
    H.hPath(t0, (SL ? SL.back + 0.3 : t1), soulAt);
    // where a glove is at t (and what it is doing), for one side
    const restAt = (s, y) => ({ x: X[s] - s * REST, y, st: 'rest', rot: 0 });
    const gloveAt = (s, t) => {
      let ry = cy;
      for (const q of P[s]) {
        if (t < q.tw0) return restAt(s, ry);
        const yy = U.lerp(ry, q.y, U.smooth(U.clamp((t - q.tw0) / 0.12)));
        if (t < q.tw1) return { x: U.lerp(X[s] - s * REST, X[s] + s * OUT, U.eOut(U.clamp((t - q.tw0) / (q.tw1 - q.tw0)))), y: yy, st: 'draw', rot: 0 };
        if (t < q.tr) return { x: X[s] + s * OUT + U.noise(t * 47) * 1.2, y: q.y + U.noise(t * 53 + 4) * 0.8, st: 'hold', rot: 0 };
        const meet = q.px + s * PARRY;
        if (t < q.tk) return { x: U.lerp(X[s] + s * OUT, meet, U.eIn(U.clamp((t - q.tr) / (q.tk - q.tr)))), y: q.y, st: 'fly', q, rot: 0 };
        if (t < q.tb) { const u = U.eOut(U.clamp((t - q.tk) / (q.tb - q.tk))); return { x: U.lerp(meet, X[s] + s * 6, u), y: q.y - 10 * Math.sin(u * Math.PI), st: 'parried', q, rot: s * 2.4 * u }; }
        if (t < q.tz) return { x: U.lerp(X[s] + s * 6, X[s] - s * REST, U.eInOut((t - q.tb) / (q.tz - q.tb))), y: q.y, st: 'back', rot: 0 };
        ry = q.y;
      }
      if (SL && t >= SL.draw) {
        const sx = X[s], meet = cx + s * PARRY, top = [cx + s * 18, YT + 8], chest = [FL.king[0] + s * 22, FL.king[1] - 114];
        if (t < SL.fire - 0.09) return { x: U.lerp(sx - s * REST, sx + s * OUT, U.eOut(U.clamp((t - SL.draw) / 0.3))), y: U.lerp(ry, ySl, U.smooth(U.clamp((t - SL.draw) / 0.2))), st: 'draw', rot: 0 };
        if (t < SL.fire) return { x: U.lerp(sx + s * OUT, meet, U.eIn(U.clamp((t - SL.fire + 0.09) / 0.09))), y: ySl, st: 'fly', rot: 0 };
        if (t < SL.fire + 0.1) { const u = U.eOut(U.clamp((t - SL.fire) / 0.1)); return { x: U.lerp(meet, top[0], u), y: U.lerp(ySl, top[1], u), st: 'up', rot: -s * 1.6 * u }; }
        // (the slingshot loaded: both pressed up into the top of the frame, stretching it, shaking)
        if (t < LOAD) return { x: top[0] + U.noise(t * 47 + s * 9) * 1.5, y: top[1] - 0.76 * stretch(t) + U.noise(t * 53 + s) * 1.2, st: 'hold', rot: -s * 1.6 };
        if (t < SL.hit) { const u = U.eIn(U.clamp((t - LOAD) / (SL.hit - LOAD))), y0 = top[1] - 0.76 * STRETCH; return { x: U.lerp(top[0], chest[0], u), y: U.lerp(y0, chest[1], u), st: 'slung', rot: -s * 1.6 }; }
        if (t < SL.back) { const u = U.clamp((t - SL.hit) / (SL.back - SL.hit)); return { x: U.lerp(chest[0], cx + s * 40, u), y: U.lerp(chest[1], cy, u * u) - Math.sin(u * Math.PI) * 30, st: 'fall', rot: -s * (1.6 + 4 * u) }; }
        return { x: U.lerp(cx + s * 40, sx - s * REST, U.smooth(U.clamp((t - SL.back) / 0.3))), y: cy, st: 'rest', rot: 0 };
      }
      return restAt(s, ry);
    };
    // ---- the frame, drawn here (the box's own is hidden while it is the ropes): each side bent
    // out where its glove draws it back (a V, quivering; let go: snapping in past straight and
    // shivering), giving where a parried glove is thrown back into it; the top bent up where the
    // gloves are slung
    const sideBend = (s, t) => {
      const g = gloveAt(s, t);
      let off = g.st === 'draw' || g.st === 'hold' ? Math.max(0, (g.x - X[s]) * s + 6) : 0;
      const shots = SL ? P[s].concat([{ tr: SL.fire - 0.09, tb: -9 }]) : P[s];
      for (const q of shots) {
        const d = t - q.tr; if (d > 0 && d < 0.6) off += (OUT + 6) * Math.exp(-d * 9) * Math.cos(d * 30) * 0.7;
        const e = t - q.tb + 0.04; if (e > 0 && e < 0.6) off += 16 * Math.exp(-e * 8) * Math.sin(e * 28 + 0.4);
      }
      return [off, U.clamp(g.y, YT + 10, YB - 10)];
    };
    const topBend = (t) => {
      if (!SL || t < SL.fire) return 0;
      const d = t - SL.fire;
      if (d < 0.1) return 26 * U.eOut(d / 0.1);
      if (t < LOAD) return 26 + stretch(t);
      // (let go: it snaps back past straight and shivers)
      const e = t - LOAD;
      return e < 0.7 ? (26 + STRETCH) * Math.exp(-e * 8) * Math.cos(e * 30) : 0;
    };
    const tEnd = t1 + 0.2;
    TL.box2.to(t0 - 0.3, t0 - 0.05, { fa: 0 }, 'inOut').to(t1 + 0.15, t1 + 0.3, { fa: 1 }, 'inOut');
    TL.add({
      t0: t0 - 0.3, t1: tEnd + 0.1, z: 4, keep, name: 'the ring',
      draw(ctx, emi, t) {
        const b = MV.box2At(t), k = 1 - b.fa, th = b.th || 5, tb = topBend(t);
        if (k <= 0.01 || b.a <= 0.01) return;
        ctx.save(); ctx.globalAlpha = k * b.a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = th; ctx.lineJoin = 'miter';
        const L = X[-1], Rr = X[1], h = th / 2;
        ctx.beginPath();
        ctx.moveTo(L - h, YT - h); if (tb) ctx.lineTo(cx, YT - h - tb); ctx.lineTo(Rr + h, YT - h);
        const [ro, ry] = sideBend(1, t); ctx.lineTo(Rr + h + ro, ry); ctx.lineTo(Rr + h, YB + h);
        ctx.lineTo(L - h, YB + h);
        const [lo, ly] = sideBend(-1, t); ctx.lineTo(L - h - lo, ly); ctx.closePath();
        ctx.stroke(); ctx.restore();
        if (emi) for (const s of [-1, 1]) { const [off, y] = sideBend(s, t); if (off > 8) F.glowAt(emi, X[s] + s * off, y, 20, B.RULE.orange, 0.25); }
      },
    });
    // ---- the gloves, drawn by side: at rest, drawn back, flying (afterimages, speed lines),
    // parried (spinning back), slung (the counterattack)
    const gimg = MV.ART.get('boxGlove');
    const glove = (ctx, x, y, s, a, rot = 0) => F.spr(ctx, gimg, x, y, { sc: 2, ax: 14, ay: 11, flip: s > 0, alpha: a, rot });
    TL.add({
      t0: t0 - 0.3, t1: Math.min(tEnd, o.home ?? Infinity), z: 14, keep,
      draw(ctx, emi, t) {
        const k = U.clamp((t - t0 + 0.3) / 0.3) * U.clamp((t1 + 0.2 - t) / 0.3);
        for (const s of [-1, 1]) {
          const g = gloveAt(s, t), a = k, dir = -s;
          if (a <= 0.01) continue;
          if (g.st === 'fly' || g.st === 'slung') {
            for (let i = 4; i >= 1; i--) { const h2 = gloveAt(s, t - 0.014 * i); if (h2.st === g.st) glove(ctx, h2.x, h2.y, s, a * [0, 0.42, 0.28, 0.17, 0.09][i], h2.rot); }
            if (g.st === 'fly') { const back = g.x - dir * GW; [[-15, 90], [-7, 130], [1, 70], [8, 110], [15, 60]].forEach(([dy, L], i) => D.rect(ctx, dir > 0 ? back - L : back, g.y + dy, L, 2, i % 2 ? '#ffd8a8' : '#ffffff', 0.55 * a)); }
          }
          glove(ctx, g.x, g.y, s, a, g.rot || 0);
          if (emi && g.st !== 'rest') F.glowAt(emi, g.x, g.y, 30, B.RULE.orange, 0.25 * a);
        }
      },
      hit(t, sp) {
        if (!B.inBox(sp, t)) return false;
        for (const s of [-1, 1]) {
          const g = gloveAt(s, t);
          if (g.st !== 'fly' && g.st !== 'parried') continue;
          if (Math.abs(g.x - sp[0]) < GW - 4 + B.SR && Math.abs(g.y - sp[1]) < 17 + B.SR) return 'glove';
        }
        return false;
      },
    });
    // ---- the parries (振刀): an arc of orange light thrown up in front of the soul toward the glove,
    // a white flash on it, sparks back the way the glove came
    const parries = all.map((q) => ({ t: q.tk, x: q.px, y: q.y, s: q.s }));
    if (SL) parries.push({ t: SL.fire, x: cx, y: ySl, s: -1, both: true }, { t: SL.fire, x: cx, y: ySl, s: 1, both: true });
    // (the double parry stops the picture a moment; the loaded frame creaks; let go, it whips)
    if (SL) { H.sfx(SL.fire, 'Saber', 0.45); H.sfx(SL.fire, 'PunchStrong', 0.45); H.stop(SL.fire, 0.05); H.sfx(SL.fire + 0.1, 'Pullback', 0.32); H.sfx(LOAD, 'Swipe', 0.35); }
    TL.add({
      t0: Math.min(...parries.map((p) => p.t)) - 0.02, t1: Math.max(...parries.map((p) => p.t)) + 0.45, z: 42, keep, name: 'parries',
      draw(ctx, emi, t) {
        for (const p of parries) {
          const u = (t - p.t) / 0.32;
          if (u < -0.06 || u > 1) continue;
          const v = U.clamp(u), ang = p.s < 0 ? Math.PI : 0, r = 15 + 12 * U.eOut(v), w = 1 - v;
          ctx.save(); ctx.globalAlpha = w; ctx.lineCap = 'round';
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5 * w + 1; ctx.beginPath(); ctx.arc(p.x, p.y, r, ang - 1.0, ang + 1.0); ctx.stroke();
          ctx.strokeStyle = B.RULE.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, r + 5, ang - 0.8, ang + 0.8); ctx.stroke();
          ctx.restore();
          if (v < 0.25) D.rect(ctx, p.x - 9, p.y - 9, 18, 18, '#ffffff', 0.5 * (1 - v / 0.25));
          for (let m = 0; m < 8; m++) {
            const a = ang + (U.hash(m * 3.1 + p.t) - 0.5) * 1.6, rr = 12 + (p.both ? 70 : 46) * U.eOut(v) * (0.5 + 0.5 * U.hash(m + p.t));
            D.rect(ctx, R(p.x + Math.cos(a) * rr) - 1, R(p.y + Math.sin(a) * rr) - 1, 2, 2, m % 2 ? '#ffd8a8' : B.RULE.orange, w);
          }
          if (emi) F.glowAt(emi, p.x, p.y, 30, B.RULE.orange, 0.45 * w);
        }
      },
    });
    return { punches, rings: ringInfo, gloveAt };
  };

  // ================================================================ light blue · patience
  // (the user, 2026-10-04: the SUPERHOT must be in the bullets - lots of them - not in a clock's
  // hands; the bullets that freeze when the soul stands still are the child's ribbon.) Its two
  // things are two kinds of time:
  //   its faded ribbon, as bows: SUPERHOT's bullets - they move only while the soul moves and hang
  //   frozen in the air while it waits; they hurt whatever they touch. They come in behind the soul
  //   as it moves and land on the spot it has just left; there they hang until its next move
  //   carries them on (or, where that would run into it, they stay hanging there and fall away);
  //   its toy knife, light blue: the other way round - it flies only while the soul waits (through
  //   it, harmless: it is still) and stands frozen in the air while it moves (then in its way).
  // Whatever the soul does, one of them moves. The soul (light blue: patience) moves through the
  // first half of each beat and waits through the second.
  // o: {start: [x, y], steps: [[t, x, y]] (a move from t, over half a beat), bows: [[k, n]] (n bows
  // behind move k: they land where it was as the move began), knives: [[k, angle]] (one through
  // where it waits after move k, in the middle of that wait), finale: {tUp, tHit, to: [x, y], n}
  // (in the last wait the knives gather round it, all pointing up - at twelve - and on tUp fly up
  // into `to`), stopAt (from then all time stands still), endAt (the bows go: motes, home)}
  FX.patience = (t0, t1, o) => {
    const DUR = T.beat / 2, VB = 430, VK = 380;
    const moves = o.steps.map(([t]) => [t, t + DUR]);
    o.steps.forEach(([t, x, y]) => { H.hTo(t, t + DUR, x, y, 'inOut'); H.sfx(t, 'MenuCursor', 0.3); });
    const stopped = (t) => o.stopAt && t >= o.stopAt;
    const movingAt = (t) => moves.some(([a, b]) => t >= a && t < b);
    // two clocks: the bows' runs while the soul moves, the knives' while it waits (both stop at stopAt)
    const DT = 1 / 240, N = Math.ceil((t1 - t0) / DT) + 2, TM = new Float64Array(N), TS = new Float64Array(N);
    for (let i = 1; i < N; i++) { const t = t0 + (i - 0.5) * DT, m = movingAt(t), s = stopped(t); TM[i] = TM[i - 1] + (m && !s ? DT : 0); TS[i] = TS[i - 1] + (!m && !s ? DT : 0); }
    const clock = (A) => (t) => { if (t <= t0) return 0; const f = (t - t0) / DT, i = Math.min(N - 2, Math.floor(f)); return A[i] + (A[i + 1] - A[i]) * Math.min(1, f - i); };
    const inv = (A) => (v) => { if (v <= 0) return t0; let lo = 0, hi = N - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (A[m] < v) lo = m + 1; else hi = m; } return t0 + lo * DT; };
    const tm = clock(TM), ts = clock(TS), tOfM = inv(TM), tOfS = inv(TS);
    // where the soul is after move k (-1: before the first); the waits between
    const P = (k) => (k < 0 ? o.start : [o.steps[k][1], o.steps[k][2]]);
    const W = (k) => ({ p: P(k), a: k < 0 ? t0 : moves[k][1], b: k + 1 < moves.length ? moves[k + 1][0] : t1 });
    const bows = [], knives = [];
    // bows behind move k: fanned out behind the way it goes, landing where it was as the move ends;
    // then on through (with later moves) out the far side - or, where that way meets the soul,
    // hanging there until they fall away
    const bowsFor = (k, n) => {
      const A = P(k - 1), Bp = P(k), d = Math.atan2(Bp[1] - A[1], Bp[0] - A[0]), vL = tm(moves[k][1] - 1e-4);
      for (let i = 0; i < n; i++) {
        // (each lands a little apart from the others, round where the soul was)
        const a = d + Math.PI + (i - (n - 1) / 2) * (n > 3 ? 0.42 : 0.6), dir = [-Math.cos(a), -Math.sin(a)], R = 150, lat = (i - (n - 1) / 2) * 11;
        const L = [A[0] - dir[1] * lat, A[1] + dir[0] * lat];
        bows.push({ vS: vL - R / VB, vL, vZ: vL - R / VB + (R + 170) / VB, from: [L[0] + Math.cos(a) * R, L[1] + Math.sin(a) * R], dir, seed: k * 5 + i, k });
      }
    };
    const bowAt = (b, v) => { const s = U.clamp(v, b.vS, b.vZ) - b.vS; return [b.from[0] + b.dir[0] * VB * s, b.from[1] + b.dir[1] * VB * s]; };
    // a toy knife through where the soul waits after move k, in the middle of that wait
    const knife = (k, ang) => {
      const w = W(k), Pk = w.p, vM = ts((w.a + w.b) / 2), d = [Math.cos(ang), Math.sin(ang)];
      knives.push({ vS: vM - 0.7, vZ: vM + 0.7, at: (v) => [Pk[0] + d[0] * VK * (v - vM), Pk[1] + d[1] * VK * (v - vM)], spin: (v) => v * 11 + k });
    };
    const FN = o.finale;
    (o.bows || []).forEach(([k, n]) => bowsFor(k, n));
    (o.knives || []).forEach(([k, ang]) => knife(k, ang));
    // ---- the bows: the ribbon's own faded colours, a faint line ahead of each the way it will fly
    // (SUPERHOT's trails - brightest while it hangs)
    const bImg = MV.ART.get('ribbon'), tEnd = o.endAt ?? t1;
    const bowShot = (b, vEnd, tGo) => ({ t0: tOfM(b.vS), t1: tGo, hr: 7, seed: b.seed, p: (t) => bowAt(b, Math.min(tm(t), vEnd)),
      draw(ctx, emi, t, p, kk) {
        const hang = !movingAt(t) || stopped(t), v = Math.min(tm(t), vEnd), ang = Math.atan2(b.dir[1], b.dir[0]);
        if (v < vEnd) for (let q = 8; q <= 40; q += 3) D.rect(ctx, p[0] + b.dir[0] * q - 1, p[1] + b.dir[1] * q - 1, 2, 2, '#f4d8ec', kk * (hang ? 0.4 : 0.15) * (1 - q / 42));
        F.spr(ctx, bImg, p[0], p[1], { sc: 2, ax: 6, ay: 4.5, rot: ang + Math.PI / 2 + (hang ? 0 : Math.sin(t * 40 + b.seed) * 0.2), alpha: kk });
        if (emi) F.glowAt(emi, p[0], p[1], 16, '#f4c8e0', (hang ? 0.15 : 0.35) * kk);
      } });
    const BOWS = bows.map((b) => {
      const full = bowShot(b, b.vZ, Math.min(tEnd, tOfM(b.vZ) + 0.02));
      if (B.minDist(full) >= 14) return full;
      // (its way on would meet the soul: it hangs where it landed, until its next beat's wait ends)
      const tFall = Math.min(tEnd, W(b.k + 1).b);
      const hang = Object.assign(bowShot(b, b.vL, tFall), { fadeOut: 0.12 });
      if (B.minDist(hang) >= 14) return hang;
      console.warn('patience: a bow meets the soul, behind move', b.k);
      return null;
    }).filter(Boolean);
    H.shots(BOWS, { name: 'bow', keep: true });
    BOWS.forEach((s) => H.sfx(s.t0 + 0.02, 'Swipe', 0.04));
    // ---- the toy knives: light blue (they strike only what moves)
    const kImg = F.tint(B.prop('knife'), B.RULE.aqua), kLen = 22;
    H.shots(knives.map((K) => ({ t0: tOfS(K.vS), t1: Math.min(t1, tOfS(K.vZ)), rule: 'aqua', p: (t) => K.at(ts(t)),
      seg: (t) => { const p = K.at(ts(t)), a = K.spin(ts(t)); return [p[0] - Math.cos(a) * kLen, p[1] - Math.sin(a) * kLen, p[0] + Math.cos(a) * kLen, p[1] + Math.sin(a) * kLen, 3]; },
      draw(ctx, emi, t, p, kk) { F.spr(ctx, kImg, p[0], p[1], { sc: 2.5, ax: 9, ay: 2, rot: K.spin(ts(t)), alpha: kk }); if (emi) F.glowAt(emi, p[0], p[1], 20, HEX.aqua, 0.35 * kk); } })), { name: 'toy knife', keep: true });
    // ---- the finale: in the last wait the knives come in round the soul and settle there, all
    // pointing up - at twelve; on tUp they fly up out of the box into `to` (one point)
    const fin = [];
    if (FN) {
      const w = W(o.steps.length - 1), P = w.p, n = FN.n ?? 5;
      for (let i = 0; i < n; i++) {
        const off = [(i - (n - 1) / 2) * 13, -12 - 6 * Math.cos(((i - (n - 1) / 2) / n) * Math.PI)], home = [P[0] + off[0], P[1] + off[1]];
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.9 + Math.PI, from = [home[0] + Math.cos(a) * 170, home[1] + Math.sin(a) * 170];
        const tIn = w.a + 0.05 + i * 0.07, tSet = Math.min(FN.tUp - 0.12, FN.tDip ?? Infinity);
        fin.push({ i, home, from, tIn, tSet });
      }
      // (FN.tDip: from then until they go they sink a little and shake - the blow drawn back)
      const dipAt = (t) => (FN.tDip !== undefined && t >= FN.tDip ? 8 * U.eOut(U.clamp((t - FN.tDip) / Math.max(0.01, FN.tUp - FN.tDip))) : 0);
      const finAt = (q, t) => {
        if (t < q.tSet) { const u = U.clamp((t - q.tIn) / (q.tSet - q.tIn)), e = U.eOut(u); return { p: [U.lerp(q.from[0], q.home[0], e), U.lerp(q.from[1], q.home[1], e)], a: -Math.PI / 2 + (1 - e) * (5 + q.i) }; }
        if (t < FN.tUp) { const d = dipAt(t); return { p: [q.home[0] + U.noise(t * 61 + q.i * 3) * d * 0.25, q.home[1] + d], a: -Math.PI / 2 }; }
        const u = U.clamp((t - FN.tUp) / (FN.tHit - FN.tUp)), e = U.eIn(u), y0 = q.home[1] + dipAt(FN.tUp - 1e-4);
        return { p: [U.lerp(q.home[0], FN.to[0], e), U.lerp(y0, FN.to[1], e)], a: Math.atan2(FN.to[1] - y0, FN.to[0] - q.home[0]) * U.clamp(u * 4) + -Math.PI / 2 * (1 - U.clamp(u * 4)) };
      };
      H.shots(fin.map((q) => ({ t0: q.tIn, t1: FN.tHit, rule: 'aqua', safe: true, p: (t) => finAt(q, t).p,
        draw(ctx, emi, t, p, kk) {
          const f = finAt(q, t), up = t >= FN.tUp;
          if (up) for (let j = 1; j <= 4; j++) { const g = finAt(q, t - j * 0.02); D.rect(ctx, g.p[0] - 1, g.p[1] - 1, 2, 2, j % 2 ? '#c8f8ff' : HEX.aqua, 0.6 * (1 - j / 5)); }
          F.spr(ctx, kImg, f.p[0], f.p[1], { sc: 2.5, ax: 9, ay: 2, rot: f.a, alpha: kk });
          if (emi) F.glowAt(emi, f.p[0], f.p[1], 22, HEX.aqua, (up ? 0.6 : 0.35) * kk);
        } })), { name: 'toy knives, at twelve', keep: true, clip: null });
      fin.forEach((q) => H.sfx(q.tIn + 0.1, 'Saber', 0.08));
      H.sfx(FN.tUp - 0.12, 'Bell', 0.25); H.sfx(FN.tUp, 'Saber', 0.35);
    }
    // ---- the bows still hanging when time comes back (endAt) go home: motes up to the light blue jar
    if (o.endAt) {
      const left = BOWS.filter((s) => s.t1 >= o.endAt - 1e-3).map((s) => ({ p: s.p(o.endAt - 0.001), seed: s.seed }));
      if (left.length) TL.add({
        t0: o.endAt, t1: o.endAt + 0.9, z: -230, name: 'the bows go home',
        draw(ctx, emi, t) {
          const u = U.clamp((t - o.endAt) / 0.9), jar = B.jarSoul('aqua', t);
          for (const b of left) for (let m = 0; m < 4; m++) {
            const v = U.clamp(u * 1.3 - m * 0.08 - U.hash(b.seed) * 0.15);
            if (v <= 0 || v >= 1) continue;
            const e = U.eInOut(v), x = U.lerp(b.p[0], jar[0], e) + Math.sin(v * 8 + m) * 6, y = U.lerp(b.p[1], jar[1], e) - Math.sin(v * Math.PI) * 40;
            D.rect(ctx, x - 1, y - 1, 2, 2, m % 2 ? '#f4c8e0' : HEX.aqua, Math.sin(v * Math.PI));
          }
        },
      });
    }
    // (each tick lands with a small ring snapping out of the soul)
    TL.add({
      t0: moves[0][1], t1: moves[moves.length - 1][1] + 0.2, z: 38, keep: true, name: 'ticks',
      draw(ctx, emi, t) {
        o.steps.forEach(([, x, y], k) => {
          const u = (t - moves[k][1]) / 0.18;
          if (u < 0 || u > 1) return;
          ctx.save(); ctx.globalAlpha = 0.8 * (1 - u); ctx.strokeStyle = HEX.aqua; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x, y, 9 + 9 * U.eOut(u), 0, U.TAU); ctx.stroke(); ctx.restore();
        });
      },
    });
    return { tm, ts, movingAt, finale: fin };
  };

  // ================================================================ green · first person, six ways (voxels)
  // Inside the soul. V0..V1 a voxel window seen from where the soul is: the middle of the box,
  // which is a cube now, the soul's own room. A burnt pan waits outside each of its six faces -
  // before him (F), behind (B), left (L), right (R), above (U), below (D, over the fire burning
  // under the box) - and flings his fire at the middle. The shield is held before the eye, so the
  // eye has to turn to meet each one: the view whips round the six axes (a quarter turn, a half
  // turn to look behind, straight up, straight down). The game's red "!" warns as each one is
  // thrown: on the cube's map in the corner, and at the edge of the picture on its side.
  // groups: [[[t, t, ...], face]] - the arrival times of throws from one face (one turn each)
  const VXmapFire = (r) => (r > 200 ? { c: U.lin('#fff1dc'), e: 0.6, raise: 0.4 } : { c: U.lin('#2a1206'), e: 0.05, raise: 0 });
  // ---- the green child's world round the soul's room: a kitchen, as pixel pictures pressed into
  // relief (the voxel windows' way). Before him, behind his back, the hearth - no flames: its
  // coals, and sparks going up the flue; behind the eye a window and shelves of jars; to the left
  // the pans' rack over a counter, a bowl of eggs (Omega Flowey's green heals with eggs), the
  // stained apron left on its hook; to the right more shelves, herbs drying; terracotta tiles and
  // a green rug below; beams and warm lamps above. (KS units per pixel; the room's walls KR from
  // the eye, its front wall KZ before it; floor and ceiling KF / KC from the eye)
  const KS = 16, KR = 620, KZ = 600, KF = -300, KC = 436;
  const KBRICK = ['#7a3424', '#86402c', '#6e2e20', '#924a30', '#5e2a1c', '#80382a'];
  const kshade = (hex, k) => { const [r, g, b] = F.rgb(hex); return `rgb(${R(r * k)},${R(g * k)},${R(b * k)})`; };
  const kitchenModel = (key, w, h, paint, center) => MV.MODEL('kitchen:' + key, () => {
    const col = new Array(w * h).fill(null), raise = new Float32Array(w * h), emi = new Float32Array(w * h);
    const P = {
      w, h,
      px(x, y, c, r = 0, e = 0) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= w || y >= h) return; const i = y * w + x; col[i] = c; raise[i] = r; emi[i] = e; },
      rect(x, y, ww, hh, c, r = 0, e = 0) { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) this.px(x + i, y + j, c, r, e); },
      disc(cx, cy, rr, c, r = 0, e = 0) { for (let y = Math.floor(cy - rr); y <= cy + rr; y++) for (let x = Math.floor(cx - rr); x <= cx + rr; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= rr * rr) this.px(x, y, c, r, e); },
      bricks(x0, y0, ww, hh, soot = () => 1) {
        for (let y = y0; y < y0 + hh; y++) for (let x = x0; x < x0 + ww; x++) {
          const row = Math.floor((y - y0) / 3), off = row % 2 ? 2 : 0, bx = Math.floor((x - x0 + off) / 5);
          const mortar = (y - y0) % 3 === 2 || (x - x0 + off) % 5 === 4, hh2 = U.hash(bx * 7.1 + row * 3.3 + w);
          this.px(x, y, kshade(mortar ? '#2c1610' : KBRICK[Math.floor(hh2 * KBRICK.length)], soot(y) * (mortar ? 1 : 0.9 + 0.2 * U.hash(x * 1.3 + y * 7.7))), mortar ? 0.6 : 1);
        }
      },
      jar(x, y, c) { this.rect(x, y + 1, 3, 4, c, 2); this.rect(x, y, 3, 1, '#d8c8a8', 2.2); this.px(x, y + 2, '#f4ecd8', 2.2); },
      pan(cx, cy, r, c = '#c8783a') { this.rect(cx, cy - r - 4, 1, 4, '#3a2a20', 1.6); this.disc(cx, cy, r, c, 2); this.disc(cx - r * 0.3, cy - r * 0.3, r * 0.35, '#f0b070', 2.2); },
      shelf(x, y, ww) { this.rect(x, y, ww, 1, '#4a2a16', 2.4); this.rect(x, y + 1, ww, 1, '#2a160a', 2.2); },
    };
    paint(P);
    const [c, x] = MV.canvas(w, h), id = x.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { if (!col[i]) continue; const [r, g, b] = col[i][0] === '#' ? F.rgb(col[i]) : col[i].slice(4, -1).split(',').map(Number); id.data[i * 4] = r; id.data[i * 4 + 1] = g; id.data[i * 4 + 2] = b; id.data[i * 4 + 3] = 255; }
    x.putImageData(id, 0, 0);
    return MV.VX.sprite(c, { s: KS, ax: w / 2, ay: center ? h / 2 : h, base: 1, k: 0, max: 1, back: 'flat',
      map: (r, g, b, px, py) => ({ c: [(r / 255) ** 2.2, (g / 255) ** 2.2, (b / 255) ** 2.2], e: emi[py * w + px], raise: Math.max(0.3, raise[py * w + px]) - 1 }) });
  });
  const KW = Math.round((2 * KR) / KS), KH = Math.round((KC - KF) / KS), KD = Math.round((KZ + KR) / KS);
  const KITCHEN = {
    // before him: the hearth, its arch framing where he stands; the coals; the mantel, its candles
    F: () => kitchenModel('F', KW, KH, (P) => {
      P.bricks(0, 0, KW, KH, (y) => 0.75 + 0.25 * (y / KH));
      const cx = KW / 2, top = 12, hw = 17;
      for (let y = top; y < KH; y++) for (let x = Math.floor(cx - hw - 3); x <= cx + hw + 3; x++) {
        const dy = y - (top + hw), inArch = (y >= top + hw ? Math.abs(x + 0.5 - cx) <= hw : (x + 0.5 - cx) ** 2 + dy ** 2 <= hw * hw);
        const inRim = (y >= top + hw ? Math.abs(x + 0.5 - cx) <= hw + 3 : (x + 0.5 - cx) ** 2 + dy ** 2 <= (hw + 3) ** 2);
        if (inArch) P.px(x, y, y > KH - 6 ? '#140805' : '#0a0403', 0);
        else if (inRim) P.px(x, y, (x + y) % 4 ? '#8a7666' : '#6e5c4e', 1.6);
      }
      for (let x = Math.floor(cx - hw + 2); x < cx + hw - 2; x++) for (let y = KH - 5; y < KH; y++) {
        const h2 = U.hash(x * 3.7 + y * 1.3), hot = y > KH - 3 ? h2 : h2 * 0.6;
        if (U.hash(x * 9.1 + y) < 0.15) continue;
        P.px(x, y, hot > 0.7 ? '#ffd27a' : hot > 0.45 ? '#ff8a2a' : hot > 0.25 ? '#c0400e' : '#5a1806', 0.4, hot > 0.45 ? 1.2 : hot > 0.25 ? 0.6 : 0.1);
      }
      // the kettle on its chain, the firedogs
      for (let y = top + 4; y < KH - 13; y++) P.px(cx, y, '#3a2a24', 0.8);
      P.disc(cx, KH - 11, 4, '#1a1414', 1.4); P.rect(cx - 2, KH - 16, 4, 1, '#2a2222', 1.5);
      P.rect(cx - hw + 3, KH - 4, 1, 4, '#2a2020', 1.2); P.rect(cx + hw - 4, KH - 4, 1, 4, '#2a2020', 1.2);
      // the mantel and its things; copper pans to either side
      P.rect(cx - hw - 7, top - 3, 2 * hw + 14, 2, '#4a2a16', 2.6);
      [[-hw - 4, '#f4ecd8'], [hw + 2, '#f4ecd8']].forEach(([dx, c]) => { P.rect(cx + dx, top - 7, 1, 4, c, 2.6); P.px(cx + dx, top - 8, '#ffd890', 2.8, 1.4); });
      [[-10, '#c8a050'], [-6, '#7aa048'], [6, '#c04a3a'], [9, '#e8e0c8']].forEach(([dx, c]) => P.jar(cx + dx, top - 8, c));
      P.pan(cx - hw - 13, 22, 4); P.pan(cx + hw + 12, 20, 3.5); P.pan(cx + hw + 20, 26, 4.5, '#a8582a');
    }),
    // behind the eye: a window on the night, shelves of jars, a dresser of plates
    B: () => kitchenModel('B', KW, KH, (P) => {
      P.bricks(0, 0, KW, KH, (y) => 0.7 + 0.2 * (y / KH));
      const cx = KW / 2;
      P.rect(cx - 9, 5, 18, 15, '#3a2416', 1.8);
      P.rect(cx - 8, 6, 16, 13, '#0c1430', 0.6);
      for (let i = 0; i < 9; i++) P.px(cx - 7 + U.hash(i * 2.3) * 14, 7 + U.hash(i * 5.1) * 11, '#e8ecff', 0.7, 1);
      P.disc(cx + 4, 9, 2, '#f4f0d8', 0.7, 1.2);
      P.rect(cx - 0.5, 6, 1, 13, '#3a2416', 1.8); P.rect(cx - 8, 12, 16, 1, '#3a2416', 1.8);
      [10, 19].forEach((y) => [[3, 22], [KW - 25, 22]].forEach(([x, ww]) => {
        P.shelf(x, y, ww);
        for (let k = 0; k < 5; k++) P.jar(x + 1 + k * 4 + (y % 3), y - 5, ['#c8a050', '#7aa048', '#c04a3a', '#e8e0c8', '#6a5aa0'][(k + y) % 5]);
      }));
      // the dresser: plates standing on its rail, its doors
      P.rect(6, KH - 18, KW - 12, 18, '#4a2a16', 1.6);
      P.rect(6, KH - 19, KW - 12, 1, '#6a3e22', 2.4);
      for (let k = 0; k < 9; k++) P.disc(10 + k * 7, KH - 22, 3, '#ece6d8', 2); for (let k = 0; k < 9; k++) P.disc(10 + k * 7, KH - 22, 1.6, '#4a6ab0', 2.1);
      for (let k = 0; k < 4; k++) { P.rect(9 + k * 16, KH - 15, 13, 13, '#3a2010', 1.8); P.px(20 + k * 16, KH - 9, '#c8a050', 2); }
    }),
    // to the left: the rack of pans over the counter, the eggs, the apron on its hook
    L: () => kitchenModel('L', KD, KH, (P) => {
      P.bricks(0, 0, KD, KH, (y) => 0.72 + 0.22 * (y / KH));
      P.rect(4, 7, KD - 8, 1, '#2a2020', 2);
      [[10, 4], [19, 3], [28, 5], [40, 3.5], [50, 4.5], [61, 3]].forEach(([x, r], k) => P.pan(x, 10 + r + 4, r, k === 2 ? '#3a3a40' : k % 2 ? '#a8582a' : '#c8783a'));
      P.rect(2, KH - 16, 52, 16, '#5a3a22', 1.6); P.rect(2, KH - 17, 52, 2, '#8a5a32', 2.6);
      // the bowl of eggs, a loaf, the board
      P.disc(18, KH - 19, 4, '#e8e0c8', 2.6); P.rect(14, KH - 19, 9, 2, '#6a4a2a', 2.8);
      [[16, KH - 22], [19, KH - 23], [21, KH - 21]].forEach(([x, y]) => P.disc(x, y, 1.4, '#f8f0e0', 3));
      P.rect(30, KH - 20, 9, 3, '#c08040', 2.8); P.rect(31, KH - 21, 7, 1, '#e0a860', 3);
      P.rect(44, KH - 18, 12, 1, '#9a6a3a', 2.8);
      // the stained apron on its hook: hers, left behind
      const ax = KD - 14;
      P.rect(ax, 20, 1, 2, '#3a2a20', 2);
      for (let y = 22; y < 38; y++) { const hw = y < 26 ? 3 : 5; for (let x = ax - hw; x <= ax + hw; x++) P.px(x, y, U.hash(x * 3.1 + y) < 0.12 ? '#8a6a40' : '#ddd4c2', 1.8); }
    }),
    // to the right: shelves of crockery, herbs drying from a pole
    R: () => kitchenModel('R', KD, KH, (P) => {
      P.bricks(0, 0, KD, KH, (y) => 0.72 + 0.22 * (y / KH));
      P.rect(4, 6, KD - 8, 1, '#4a2a16', 2);
      for (let k = 0; k < 12; k++) { const x = 7 + k * 6; for (let y = 7; y < 12 + (k % 3); y++) P.px(x + (y % 2), y, ['#5a8a3a', '#7aa048', '#8a7a40'][k % 3], 2.2); }
      [18, 27].forEach((y, r) => { P.shelf(6, y, KD - 12); for (let k = 0; k < 9; k++) { const x = 8 + k * 7 + r; if (k % 3 === 1) P.disc(x + 1, y - 2, 2, '#ece6d8', 2.4); else P.jar(x, y - 5, ['#c8a050', '#c04a3a', '#e8e0c8', '#7aa048'][(k + r) % 4]); } });
      P.rect(10, KH - 12, KD - 20, 12, '#4a2a16', 1.4); P.rect(10, KH - 13, KD - 20, 1, '#6a3e22', 2);
    }),
    // below: terracotta tiles, a round rug in the soul's green
    D: () => kitchenModel('D', KW, KD, (P) => {
      for (let y = 0; y < KD; y++) for (let x = 0; x < KW; x++) {
        const gr = x % 6 === 5 || y % 6 === 5, tile = Math.floor(x / 6) * 7 + Math.floor(y / 6) * 13;
        P.px(x, y, gr ? '#3a1c12' : ['#9a4a2a', '#a8562e', '#8a4026', '#b05e34'][Math.floor(U.hash(tile) * 4)], gr ? 0.6 : 1);
      }
      const cx = KW / 2, cy = KD * (KZ / (KZ + KR));
      for (let y = 0; y < KD; y++) for (let x = 0; x < KW; x++) { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d < 17) P.px(x, y, Math.floor(d / 2.2) % 2 ? '#e8dcc0' : '#3a8a4a', 1.4); }
    }, true),
    // above: planks, beams, two lamps
    U: () => kitchenModel('U', KW, KD, (P) => {
      for (let y = 0; y < KD; y++) for (let x = 0; x < KW; x++) P.px(x, y, x % 7 === 6 ? '#1e120a' : (x + Math.floor(y / 9)) % 3 ? '#3a2416' : '#33200f', 1);
      [12, 36, 60].forEach((y) => P.rect(0, y, KW, 4, '#22140a', 3));
      [[KW / 2 - 18, 24], [KW / 2 + 18, 48]].forEach(([x, y]) => { P.disc(x, y, 3, '#2a1a10', 4); P.disc(x, y, 2, '#ffd890', 4.4, 1.6); });
      for (let k = 0; k < 14; k++) { const x = 4 + k * 5, y = [13, 37, 61][k % 3]; P.rect(x, y + 4, 2, 3, ['#5a8a3a', '#8a7a40', '#7aa048'][k % 3], 4.6); }
    }, true),
  };
  // where each stands (relief toward the eye); built with the stage (no hitch on first sight)
  const kitchenAt = (EYE) => {
    const y0 = EYE[1] + KF, M4 = MV.M4, mid = (KZ - KR) / 2;
    return [
      ['F', M4.trans(0, y0, -KZ)],
      ['B', M4.mul(M4.trans(0, y0, KR), M4.ry(Math.PI))],
      ['L', M4.mul(M4.trans(-KR, y0, -mid), M4.ry(Math.PI / 2))],
      ['R', M4.mul(M4.trans(KR, y0, -mid), M4.ry(-Math.PI / 2))],
      ['D', M4.mul(M4.trans(0, y0, -mid), M4.rx(-Math.PI / 2))],
      ['U', M4.mul(M4.trans(0, EYE[1] + KC, -mid), M4.rx(Math.PI / 2))],
    ];
  };
  FX.greenFP = (V0, V1, groups, o = {}) => {
    const V3 = MV.V3, boxY = MV.toVox(0, B.home.cy)[1], EYE = [0, boxY, 0];
    const add = (...vs) => vs.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]), mul = (v, k) => [v[0] * k, v[1] * k, v[2] * k];
    // the six faces: the way to look at each (yaw, pitch; up / down keep the yaw they come from)
    const FACE = { F: [0, 0.2], B: [Math.PI, 0.02], L: [Math.PI / 2, 0.04], R: [-Math.PI / 2, 0.04], U: [null, 1.42], D: [null, -1.42] };
    const AXIS = { F: [0, 0, -1], B: [0, 0, 1], L: [-1, 0, 0], R: [1, 0, 0], U: [0, 1, 0], D: [0, -1, 0] };
    const fOf = (yaw, pitch) => { const cp = Math.cos(pitch); return [-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp]; };
    const FOV = o.fov ?? 96, DIST = 300, HGT = 2 * DIST * Math.tan((FOV / 2) * Math.PI / 180);
    // where the eye looks, keyed: [time it faces it, yaw, pitch]; turning between, as fast as the
    // music allows (at most 0.22 s), the shortest way round
    const keys = [[V0, 0, FACE.F[1]]];
    groups.forEach(([ts, face], i) => {
      const prev = keys[keys.length - 1], tFace = ts[0] - 0.07;
      let yaw = FACE[face][0] === null ? prev[1] : FACE[face][0];
      while (yaw - prev[1] > Math.PI + 1e-6) yaw -= U.TAU;
      while (prev[1] - yaw > Math.PI + 1e-6) yaw += U.TAU;
      // (a half turn goes round by his left, so the eye sweeps past the jars)
      if (Math.abs(Math.abs(yaw - prev[1]) - Math.PI) < 1e-3) yaw = prev[1] + Math.PI;
      const last = i ? groups[i - 1][0][groups[i - 1][0].length - 1] + 0.03 : V0 + 0.3;
      keys.push([Math.max(last + 0.06, tFace - 0.22), prev[1], prev[2]], [tFace, yaw, FACE[face][1]]);
    });
    // o.parry {t, hit}: the last throw (from before him) blocked perfectly - flung straight back,
    // and the eye follows it up to him, into his chest
    // (the perfect block stops the picture dead for a moment; the blow itself lands in the 2D)
    const P = o.parry;
    if (P) {
      const k = keys[keys.length - 1];
      keys.push([P.t + 0.05, k[1], k[2]], [P.hit, k[1], 1.12]);
      H.sfx(P.t, 'Ding', 0.3); H.sfx(P.t + 0.02, 'Swipe', 0.22); H.sfx(P.t, 'Saber', 0.3);
      H.stop(P.t, 0.05);
      TL.impact(P.t + 0.05, { amp: 6, dy: 0.6, zoom: 0.03, flash: 0.25, flashCol: [0.85, 1, 0.85], flashDecay: 12, dur: 0.3 });
    }
    const look = (t) => {
      let k = 0;
      while (k + 1 < keys.length && keys[k + 1][0] <= t) k++;
      const a = keys[k], b = keys[k + 1];
      if (!b) return [a[1], a[2]];
      const u = U.eInOut(U.clamp((t - a[0]) / Math.max(1e-3, b[0] - a[0])));
      return [U.lerp(a[1], b[1], u), U.lerp(a[2], b[2], u)];
    };
    // the camera, baked: the eye fixed in the soul (it comes in from behind at the start: the dive)
    const N = Math.ceil((V1 - V0) * 120) + 1, ch = { x: [], y: [], z: [], yaw: [], pitch: [], roll: [], fov: [], h: [], flat: [] };
    for (let i = 0; i < N; i++) {
      const t = V0 + i / 120, [yaw, pitch] = look(t), f = fOf(yaw, pitch), dv = U.eOutExpo(U.clamp((t - V0) / 0.35));
      const eye = add(EYE, mul([0, 30, 140], 1 - dv)), fov = U.lerp(122, FOV, dv), h = 2 * DIST * Math.tan((fov / 2) * Math.PI / 180);
      const tg = add(eye, mul(f, DIST));
      ch.x.push(tg[0]); ch.y.push(tg[1]); ch.z.push(tg[2]); ch.yaw.push(yaw); ch.pitch.push(pitch); ch.roll.push(0); ch.fov.push(fov); ch.h.push(h); ch.flat.push(1);
    }
    TL.cam.set(V0, { x: 0, y: boxY, z: -DIST, yaw: 0, pitch: 0, roll: 0, fov: FOV, h: HGT, flat: 1 });
    TL.cam.bake(V0, 1 / 120, ch);
    TL.flat.set(V0, 0).set(V1, 1);
    TL.look.set(V0, { unlit: 0.55, bloom: 0.12, vig: 0.5, fog: 0, shadow: 0, grain: 0, fade: 0, letter: 0, wash: 0, inv: 0, exposure: 1, th: 1.2, cap: 0.72, sat: 1, contrast: 1, glowAmt: 0 });
    TL.pal.set(V0, { corridor: 0, void: 0, battle: 0, memory: 0, dawn: 0, black: 0, hearth: 1 });
    TL.pal.set(V1, { hearth: 0 });
    TL.lightDir.set(V0, { x: -0.4, y: 0.8, z: 0.45 });
    TL.vStage.set(V0, { a: 1, ped: 0 }).set(V1, { a: 0, ped: 1 });
    TL.kingVox.set(V0, o.pose ?? V0).set(V1, null);
    TL.cage.set(V0, { a: 1, x: 0, y: boxY, z: 0, h: B.home.w, w: 6, edge: 0.75, pulse: 0, sx: 1, sy: 1, sz: 1, panel: 0 }).set(V1, { a: 0 });
    TL.aura.set(V0, { r: 0.2, g: 1, b: 0.35, k: 0.3 }).set(V1, { k: 0 });
    TL.soul.set(V0, { a: 0 });
    // the throws: from the pan outside that face to the shield before the eye (it faces that way
    // by then); the warning from the moment it leaves the pan
    const FLY = o.fly ?? T.beat, PAN_D = 270, SH_D = 70;
    const panAt = (face) => add(EYE, mul(AXIS[face], PAN_D));
    const throws = [];
    groups.forEach(([ts, face]) => ts.forEach((ta) => {
      const [yaw, pitch] = look(ta), b = add(EYE, mul(fOf(yaw, pitch), SH_D)), a = panAt(face), side = V3.norm(V3.cross(AXIS[face], Math.abs(AXIS[face][1]) > 0.5 ? [1, 0, 0] : [0, 1, 0]));
      throws.push({ t0: ta - FLY, t1: ta, face, p: (t) => { const u = U.eIn(U.clamp((t - (ta - FLY)) / FLY)); return add(mul(a, 1 - u), mul(b, u), mul(side, Math.sin(u * Math.PI) * 40)); } });
      H.sfx(ta - FLY, 'Frypan', 0.12); H.sfx(ta, 'Bell', 0.12);
      TL.impact(ta, { amp: 5, dy: 0.6, zoom: 0.03, flash: 0.03, flashCol: [0.3, 1, 0.4], dur: 0.25 });
    }));
    groups.forEach(([ts]) => H.sfx(ts[0] - FLY, 'Warning', 0.22));
    groups.forEach(([ts], i) => { if (i) H.sfx(ts[0] - 0.22, 'SwipeShort', 0.14); });
    const panM = MV.vSprite('pan25', B.prop('pan'), 2.5), fireM = [0, 1].map((f) => MV.vSprite('fireS' + f, MV.img('fire' + f), 1.5, { map: VXmapFire }));
    const GREEN = U.lin(HEX.green), PALE = U.lin('#d8ffd8'), STEAM = U.lin('#e8e2dc'), FIRE = ['#661606', '#a8360c', '#dc7418', '#f6c04c'].map((h) => U.lin(h));
    const arrivals = throws.map((s) => s.t1);
    const KM = kitchenAt(EYE);
    // (the kitchen's models built with the stage, not on the frame the dive lands)
    MV.prewarm.push(() => { if (MV.vox) for (const k in KITCHEN) KITCHEN[k](); });
    // the shield in hand (Minecraft's, in the green soul's glass): low at the bottom of the
    // picture between throws; raised as the fire flies in, held through a run of them; it
    // recoils and rings as it blocks; it lags behind the eye when the eye whips round
    // (after the perfect block it drops away at once: the eye follows the fire it sent back)
    const raised = (t) => { let u = 0; for (const ta of arrivals) { const pa = P && Math.abs(ta - P.t) < 1e-3; u = Math.max(u, U.eOut(U.clamp((t - (ta - 0.3)) / 0.14)) * (1 - U.smooth(U.clamp((t - (ta + (pa ? 0.03 : 0.14))) / (pa ? 0.1 : 0.24))))); } return u; };
    const recoil = (t) => { let r = 0; for (const ta of arrivals) if (t >= ta && t < ta + 0.4) r = Math.max(r, Math.exp(-(t - ta) * 13)); return r; };
    const shieldAt = (t) => {
      const u = raised(t), r = recoil(t), [y1, p1] = look(t), [y0, p0] = look(t - 0.05);
      const sw = U.clamp((y1 - y0) * 900, -70, 70), sp = U.clamp((p1 - p0) * 700, -60, 60);
      let fl = 0;
      for (const ta of arrivals) if (t >= ta && t < ta + 0.14) fl = Math.max(fl, 1 - (t - ta) / 0.14);
      return {
        x: U.lerp(300, 478, u) + sw + U.noise(t * 60) * 5 * r, y: U.lerp(585, 300, u) + 14 * r - sp + U.noise(t * 55 + 7) * 4 * r,
        rot: U.lerp(-0.42, -0.03, u) + 0.05 * r, sc: U.lerp(2, 2.3, u) * (1 + 0.07 * r), flash: fl, a: 1,
        blocks: arrivals.filter((ta) => t >= ta && t < ta + 0.45).map((ta) => ({ t: ta, dx: 1, dy: -14 })),
      };
    };
    arrivals.forEach((ta) => H.sfx(ta, 'Impact', 0.1));
    TL.add({
      t0: V0, t1: V1, z: 12, name: 'green first person',
      vox(Vx, t, S) {
        // the kitchen round the soul's room (the green child's world)
        for (const [k, m] of KM) Vx.draw(KITCHEN[k](), { m, tint: [1, 1, 1, 1], emi: 0.07, shadow: false });
        // from the hearth's coals behind him, sparks going up the flue (his fire: only sparks now)
        for (let i = 0; i < 40; i++) {
          const h1 = U.hash(i * 1.7), h2 = U.hash(i * 3.9 + 1), u = (t * (0.35 + 0.3 * h2) + h1) % 1;
          const x = (h1 - 0.5) * 420 + Math.sin(t * 2 + i) * 18 * u, y = boxY + KF + 40 + u * (260 + 200 * h2), z = -KZ + 40 + 50 * h2;
          const fl = 0.55 + 0.45 * U.hash(Math.floor(t * 12) + i * 3.1);
          Vx.box(x, y, z, 8, 8, 8, FIRE[Math.min(3, Math.floor((1 - u) * 3.5))], 1.4 * fl, Math.sin(u * Math.PI));
        }
        // a pan outside each face, flipping as it throws (a flame kept in it)
        for (const face of 'FBLRUD') {
          let flip = 0;
          for (const s of throws) if (s.face === face && t >= s.t0 - 0.1 && t < s.t0 + 0.2) flip = Math.sin(U.clamp((t - s.t0 + 0.1) / 0.3) * Math.PI);
          const p = panAt(face);
          MV.vDraw(Vx, S, panM, p, { rot: flip * 0.9, emi: 0.05 });
          if (flip < 0.5) MV.vDraw(Vx, S, fireM[Math.floor(t * 10) % 2], add(p, [0, 14, 0]), { emi: 0.5, sc: 0.8 });
        }
        for (const s of throws) if (t >= s.t0 && t < s.t1) MV.vDraw(Vx, S, fireM[Math.floor(t * 10 + s.t0) % 2], s.p(t), { emi: 0.6, sc: 0.45 });
        // steam rising from the pans (a kitchen: the hearth's light from below)
        for (const face of 'FBLRUD') {
          const p = panAt(face);
          for (let i = 0; i < 4; i++) {
            const u = (t * 0.7 + i * 0.25 + face.charCodeAt(0) * 0.13) % 1, q = add(p, [Math.sin(t * 2 + i * 1.7) * 10, 18 + u * 90, Math.cos(t * 1.7 + i) * 10]);
            Vx.box(q[0], q[1], q[2], 6 + 14 * u, 6 + 14 * u, 6 + 14 * u, STEAM, 0.2, 0.55 * Math.sin(u * Math.PI));
          }
        }
        // the perfect block: the fire flung back from the glass, up into his chest; it bursts there
        if (P && t >= P.t && t < P.hit + 0.6) {
          const [yw, pt] = look(P.t), b0 = add(EYE, mul(fOf(yw, pt), SH_D)), chest = [0, MV.toVox(0, FL.king[1] - 132)[1], TL.vStage.at(t).kingZ + 30];
          if (t < P.hit) {
            const u = U.clamp((t - P.t) / (P.hit - P.t)), e = U.eIn(u), q = add(mul(b0, 1 - e), mul(chest, e), [0, Math.sin(u * Math.PI) * 30, 0]);
            MV.vDraw(Vx, S, fireM[Math.floor(t * 14) % 2], q, { emi: 1.2, sc: 1.1 + 0.5 * u });
            for (let k = 1; k <= 9; k++) { const v = U.clamp(u - k * 0.05), ee = U.eIn(v), qq = add(mul(b0, 1 - ee), mul(chest, ee), [0, Math.sin(v * Math.PI) * 30, 0]); Vx.box(qq[0], qq[1], qq[2], 8, 8, 8, k % 2 ? GREEN : PALE, 1.6, 0.85 - k * 0.08); }
          } else {
            const u = (t - P.hit) / 0.6;
            for (let i = 0; i < 26; i++) {
              const h = U.hash(i * 2.3), h2 = U.hash(i * 4.1 + 2), h3 = U.hash(i * 6.7 + 5), r = U.eOut(u) * (40 + 90 * h);
              Vx.box(chest[0] + (h2 - 0.5) * 2 * r, chest[1] + (h3 - 0.5) * 2 * r - u * u * 60, chest[2] + 30 + (h - 0.5) * r, 6, 6, 6, i % 3 ? GREEN : i % 2 ? PALE : FIRE[3], 1.6, 1 - u);
            }
          }
        }
        // what it blocked: green light, scattering
        for (const s of throws) {
          const u = (t - s.t1) / 0.8;
          if (u < 0 || u > 1 || (P && Math.abs(s.t1 - P.t) < 1e-3)) continue;
          const [yw, pt] = look(s.t1), f = fOf(yw, pt), c0 = add(EYE, mul(f, SH_D)), r0 = V3.norm(V3.cross(f, [0, 1, 0])), u0 = V3.cross(r0, f);
          for (let i = 0; i < 10; i++) {
            const h = U.hash(i * 3.1 + s.t1 * 7.7), h2 = U.hash(i * 5.3 + s.t1);
            const q = add(c0, mul(r0, (h - 0.5) * 80 * U.eOut(u)), mul(u0, (h2 - 0.3) * 70 * U.eOut(u)), mul(f, u * 30));
            Vx.box(q[0], q[1], q[2], 1.6, 1.6, 1.6, i % 3 ? GREEN : PALE, 1.2, 1 - u);
          }
        }
      },
      // the warnings: the game's red "!" on the cube's map (bottom right: the faces unfolded, the
      // one the eye faces lit) and at the picture's edge on the side the fire comes from
      ov(ctx, t, S) {
        // the shield in hand, in front of everything the eye sees
        if (t >= V0 + 0.2) B.shieldFP(ctx, t, shieldAt(t));
        // (the perfect block: its glass rings out white, once, wide)
        if (P && t >= P.t && t < P.t + 0.3) {
          const u = (t - P.t) / 0.3, sh = shieldAt(t);
          ctx.save(); ctx.globalAlpha = 0.9 * (1 - u); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6 * (1 - u) + 2;
          ctx.beginPath(); ctx.arc(sh.x, sh.y - 20, 40 + 260 * U.eOut(u), 0, U.TAU); ctx.stroke(); ctx.restore();
        }
        const warn = MV.img('warnRed'), blink = Math.floor(t * 12) % 2 === 0;
        const coming = new Set(throws.filter((s) => t >= s.t0 && t < s.t1 - 0.02).map((s) => s.face));
        const [yw, pt] = look(t), fNow = fOf(yw, pt);
        let facing = 'F', best = -2;
        for (const k in AXIS) { const d = V3.dot(AXIS[k], fNow); if (d > best) { best = d; facing = k; } }
        const CELL = 22, ox = 820, oy = 404, NET = { U: [1, 0], L: [0, 1], F: [1, 1], R: [2, 1], B: [3, 1], D: [1, 2] };
        for (const k in NET) {
          const x = ox + NET[k][0] * CELL, y = oy + NET[k][1] * CELL;
          if (coming.has(k)) { ctx.fillStyle = blink ? '#ff2a2a' : '#701010'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4); }
          else if (k === facing) { ctx.fillStyle = 'rgba(46,224,90,0.45)'; ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4); }
          ctx.strokeStyle = '#e6e3ee'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
          if (coming.has(k) && blink) ctx.drawImage(warn, Math.round(x + CELL / 2 - warn.width / 4), Math.round(y + 2), Math.round(warn.width / 2), Math.round(warn.height / 2));
        }
        // at the edge: where that face lies from the eye, out to the picture's border
        for (const k of coming) {
          const d = AXIS[k], dx = V3.dot(d, S.cam.right), dy = -V3.dot(d, S.cam.up), dz = V3.dot(d, S.cam.f);
          if (dz > 0.8) continue; // (in front: it is in sight)
          let vx = dx, vy = dy;
          if (Math.hypot(vx, vy) < 0.2) { vx = 0; vy = 1; } // (straight behind: at the bottom)
          const L = Math.hypot(vx, vy), sx = vx / L, sy = vy / L, kk = Math.min(Math.abs((MV.OW / 2 - 50) / (sx || 1e-6)), Math.abs((MV.OH / 2 - 54) / (sy || 1e-6)));
          const x = MV.OW / 2 + sx * kk, y = MV.OH / 2 + sy * kk;
          if (!blink) continue;
          ctx.drawImage(warn, Math.round(x - warn.width * 0.75), Math.round(y - warn.height * 0.75), Math.round(warn.width * 1.5), Math.round(warn.height * 1.5));
        }
      },
    });
  };

  // ================================================================ blue · the FEZ turn (voxels)
  // The 2D battle is one face of a stage - and like FEZ, a 2D world that is a face of a 3D one,
  // where what touches is what overlaps in the view you are looking from. The music box's stage
  // turns one way only: a quarter, then a half, then the last quarter - one whole turn.
  //   29  V0: the picture is handed to the voxels (the same picture: the flat front view, the lights
  //       down). Music-box blocks spring up out of the box's floor on the chimes; the soul hops
  //       onto the one low block it can reach - and is stuck: from the front the others stand too
  //       far apart, too high. The steps light up, the dancers out on the dark stage raise the
  //       game's "!" - and on beat 3 the box turns a quarter: from the side the same blocks are a
  //       staircase (their depths, unseen from the front, put them side by side). It climbs, a
  //       note a step.
  //   30  more blocks rise - and from this side a pillar stands in the way: what lies beyond is
  //       behind it. The warning; then one sweep through two beats, high round behind the box to
  //       its other side, where the pillar is behind and the hidden steps stand in front. It
  //       climbs to the top.
  //   31  from this side he is right there: a great leap, a kick, into him. Then the last quarter:
  //       the front again - and he was far behind the box all along. The blocks sink, the soul
  //       riding down; at V1 the 2D has the picture again.
  // o: {floor (the 2D floor, world y), zoom (the 2D's push-in at V0), twirl (the dancer on the lid),
  // pose (his relief's), x0 (the soul's x at V0, voxel), T: {rise1 [4], hop1, warn1, turn1 [a, b],
  // climb1 [2], rise2 [2], warn2, sweep [a, b], climb2 [2], jump [a, hit], back [a, b], sink [a, b]}}
  FX.fez = (V0, V1, o) => {
    const FLAT = MV.FLAT_CAM, SIDE_Z = -150, BS = 48, K = o.T;
    const yV = (y) => MV.toVox(0, y)[1];
    const boxY = yV(B.home.cy), floorY = yV(o.floor), base = boxY - B.home.w; // (the box's floor, voxel y)
    TL.flat.set(V0, 0).set(V1, 1);
    // the voxel post and palette: black (the lights are down), the stage lit for the side views
    TL.look.set(V0, { unlit: 1, bloom: 0.08, vig: 0.22, fog: 0, shadow: 0, grain: 0, fade: 0, letter: 0, wash: 0, inv: 0, exposure: 1, th: 1.3, cap: 0.72, sat: 1, contrast: 1, glowAmt: 0 });
    TL.look.to(K.turn1[0], K.turn1[1], { unlit: 0.45 }, 'inOut').to(K.back[0], K.back[1], { unlit: 0.8 }, 'inOut');
    TL.pal.set(V0, { corridor: 0, void: 0, battle: 0, memory: 0, dawn: 0, black: 1 });
    TL.pal.to(K.turn1[0], K.turn1[1], { black: 0.35, battle: 0.65 }, 'inOut').to(K.back[0], K.back[1], { black: 0.7, battle: 0.3 }, 'inOut');
    TL.lightDir.set(V0, { x: -0.55, y: 0.7, z: 0.45 });
    TL.vStage.set(V0, { a: 0 }).to(K.turn1[0] + 0.1, K.turn1[1], { a: 1 }, 'inOut').to(K.back[0], K.back[1], { a: 0.35 }, 'inOut');
    // his relief, standing as he stands (he does not falter)
    TL.kingVox.set(V0, o.pose).set(V1, null);
    // the box: the cage, its edges the 2D frame
    TL.cage.set(V0 - 0.001, { a: 0 }).set(V0, { a: 1, x: 0, y: boxY, z: 0, h: B.home.w, w: 10, edge: 1, pulse: 0, sx: 1, sy: 1, sz: 1, panel: 0 }).set(V1, { a: 0 });
    TL.aura.set(V0, { k: 0 });
    // the camera: the flat front view, close on the box (the 2D pushed in to it before V0: the
    // same picture); then always turning the same way, as a music box's stage turns: a quarter
    // (yaw -90 deg: the eye at the box's left, him to the left of it), through deep perspective,
    // flat again from the side (wide enough for him); half round in one sweep, high behind the box,
    // to its other side (him to the right); the last quarter, to the front again
    const Q = Math.PI / 2, FRONT = Object.assign({}, FLAT, { y: boxY, h: FLAT.h / o.zoom });
    const SIDE = { x: 0, y: 100, z: SIDE_Z, pitch: 0, roll: 0, fov: 2, h: FLAT.h / 1.15, flat: 1 };
    const turn = (a, b, mid, to) => { const m = (a + b) / 2; TL.cam.to(a, m, mid, 'in').to(m, b, to, 'out'); };
    TL.cam.set(V0, FRONT).set(K.turn1[0], FRONT);
    turn(K.turn1[0], K.turn1[1], { x: -110, y: -40, z: SIDE_Z / 2, yaw: -Q / 2, pitch: -0.22, roll: 0, fov: 34, h: FLAT.h / 1.4, flat: 1 }, Object.assign({ yaw: -Q }, SIDE));
    TL.cam.set(K.sweep[0], Object.assign({ yaw: -Q }, SIDE));
    turn(K.sweep[0], K.sweep[1], { x: 0, y: 40, z: -70, yaw: -2 * Q, pitch: -0.66, roll: 0, fov: 34, h: FLAT.h / 1.12, flat: 1 }, Object.assign({ yaw: -3 * Q }, SIDE));
    // (the leap: the camera leans in on him with it, closer as it comes down)
    if (K.hang) TL.cam.to(K.jump[0], K.jump[1], { y: 170, z: -170, h: FLAT.h / 1.6 }, 'in');
    TL.cam.set(K.back[0], Object.assign({ yaw: -3 * Q }, SIDE));
    turn(K.back[0], K.back[1], { x: 110, y: -40, z: SIDE_Z / 2, yaw: -3.5 * Q, pitch: -0.22, roll: 0, fov: 34, h: FLAT.h / 1.4, flat: 1 }, Object.assign({}, FRONT, { yaw: -4 * Q }));
    for (const [a, b] of [K.turn1, K.sweep, K.back]) { H.sfx(a, 'Rotate', 0.42); H.sfx(b, 'Impact', 0.2); }
    // ---- the blocks [x, level, z, rise time, kind]: the first staircase only a side can see (B1
    // -> B2 -> B3, each a step deeper and higher), what holds them up, one more for the eye; then
    // the pillar - from the first side it stands nearer the eye than the second staircase (B4 ->
    // B5) on its supports, and hides it; from the other side it is behind them
    const BLK = [
      [110, 0, 60, K.rise1[0], 'step'],
      [-110, 0, 12, K.rise1[1], 'post'], [-110, 1, 12, K.rise1[1] + 0.06, 'step'],
      [0, 0, -36, K.rise1[2], 'post'], [0, 1, -36, K.rise1[2] + 0.06, 'post'], [0, 2, -36, K.rise1[2] + 0.12, 'step'],
      [64, 3, 112, K.rise1[3], 'eye'],
    ];
    for (let lv = 0; lv <= 5; lv++) for (const z of [-84, -132]) BLK.push([-120, lv, z, K.rise2[0] + lv * 0.03, 'pillar']);
    for (let lv = 0; lv <= 3; lv++) BLK.push([100, lv, -84, K.rise2[1] + lv * 0.04, lv === 3 ? 'step2' : 'post']);
    for (let lv = 0; lv <= 4; lv++) BLK.push([100, lv, -132, K.rise2[1] + 0.1 + lv * 0.04, lv === 4 ? 'step2' : 'post']);
    [...K.rise1, ...K.rise2].forEach((tb, i) => H.sfx(tb, i % 3 === 2 ? 'Harp' : 'Chime', 0.2));
    const sink = (t) => U.smooth(U.clamp((t - K.sink[0]) / (K.sink[1] - K.sink[0])));
    // a block's bottom and height at t (springing up with an overshoot; sinking at the end)
    const blockAt = (b, t) => {
      const [x, lv, z, tb] = b, k = U.eOutBack(U.clamp((t - tb) / 0.2));
      if (k <= 0.001) return null;
      const h = BS * k, y0 = base + lv * BS * k - sink(t) * (lv + 1) * BS;
      return { x, z, y0, h };
    };
    // (a beat before each turn the steps that will matter light up)
    const warnK = (kind, t) => {
      const w = kind === 'step' ? K.warn1 : kind === 'step2' || kind === 'pillar' ? K.warn2 : null;
      return w === null || t < w || t >= w + T.beat ? 0 : 0.5 + 0.5 * Math.cos((t - w) * 24);
    };
    // ---- the soul: up onto B1 from the front; B2, B3 from the first side; B4, B5 from the other;
    // then the leap into him, knocked back onto the top step, down with it as it sinks
    const top = (lv) => base + (lv + 1) * BS + 16;
    TL.soulMode.set(V0, 'blue').set(V1, 'red');
    TL.soul.set(V0 - 0.001, { a: 0 }).set(V0, { x: o.x0 ?? 0, y: floorY, z: 72, a: 1, sc: 2, spin: 0, glow: 0 }).set(V1, { a: 0 });
    const hop = (tl, v, h) => { TL.soul.hop(tl - 0.24, tl, v, h, 'y', 'lin'); H.sfx(tl, 'Impact', 0.07); };
    hop(K.hop1, { x: 110, z: 60, y: top(0) }, 90);
    hop(K.climb1[0], { x: -110, z: 12, y: top(1) }, 80);
    hop(K.climb1[1], { x: 0, z: -36, y: top(2) }, 80);
    hop(K.climb2[0], { x: 100, z: -84, y: top(3) }, 80);
    hop(K.climb2[1], { x: 100, z: -132, y: top(4) }, 80);
    // (it climbs the music box's tune: a note a step)
    [...K.climb1, ...K.climb2].forEach((t, i) => H.sfx(t - 0.02, i % 2 ? 'Harp' : 'Chime', 0.3));
    // the leap: a ballet dancer's grand jete off the top step - up to the height of it, held there
    // (K.hang: the blow gathered, the soul swelling), then the kick dropping into him in a sixteenth.
    // On the contact the picture stops; the game's flash for a frame or two (everything black on a
    // pale field); released, the shake and the blue light
    const HIT = [0, yV(FL.king[1] - 100), TL.vStage.init.kingZ + 26], S0 = { x: 100, z: -132, y: top(4) };
    const APEX = { x: U.lerp(S0.x, HIT[0], 0.55), z: U.lerp(S0.z, HIT[2], 0.55), y: Math.max(S0.y, HIT[1]) + 120 };
    const hang = K.hang || [U.lerp(K.jump[0], K.jump[1], 0.5), U.lerp(K.jump[0], K.jump[1], 0.84)];
    TL.soul.to(K.jump[0], hang[0], APEX, 'out');
    TL.soul.to(hang[0], hang[1], { x: U.lerp(APEX.x, HIT[0], 0.12), z: U.lerp(APEX.z, HIT[2], 0.12), y: APEX.y + 8, sc: 2.5, glow: 0.8 }, 'inOut');
    TL.soul.to(hang[1], K.jump[1], { x: HIT[0], y: HIT[1], z: HIT[2], sc: 2.2 }, 'in');
    TL.soul.to(K.jump[1], K.jump[1] + 0.001, { glow: 1.6 }, 'lin').to(K.jump[1] + 0.02, K.back[1], { glow: 0, sc: 2 }, 'out');
    TL.soul.hop(K.jump[1] + 0.1, K.back[1], S0, 70, 'y', 'lin');
    TL.soul.to(K.sink[0], K.sink[1], { y: floorY }, 'smooth');
    H.sfx(K.jump[0], 'Swipe', 0.3); H.sfx(hang[0], 'Chime', 0.3); H.sfx(hang[1], 'Swipe', 0.35);
    H.sfx(K.jump[1], 'PunchStrong', 0.5); H.sfx(K.jump[1], 'Impact', 0.4); H.sfx(K.jump[1], 'CineCut', 0.3); H.sfx(K.jump[1] + 0.08, 'Explosion', 0.32);
    H.stop(K.jump[1], 0.08);
    TL.impact(K.jump[1], { amp: 0, bw: 0.034 });
    TL.impact(K.jump[1] + 0.08, { amp: 13, dx: 1, dy: -0.3, zoom: 0.06, rot: 0.015, flash: 0.36, flashCol: [0.55, 0.75, 1], flashDecay: 8, dur: 0.55 });
    // ---- the dancers: three shoes out on the dark stage at the right, pirouetting; they raise the
    // game's "!" a beat before each turn
    const ZS = 200, dancers = [0, 1, 2].map((k) => [210 + k * 52, floorY + 10, ZS - k * 16]);
    H.sfx(K.warn1, 'Warning', 0.3); H.sfx(K.warn2, 'Warning', 0.3);
    // ---- the attacks, seen from the side (user, 2026-10-06: the stars fell on steps the soul had
    // long left and the dancers never struck - it looked like attacking nothing). On each climb the
    // stars drop on the soul itself - one on it, one either side on its step - arriving as it lifts
    // off (it gets away by a hair), bursting on the step; and on the climbs seen from a side a dancer
    // leaps off its line: its shoe comes skimming along the soul's step from the dark, passes under
    // the soul as it jumps and breaks on the next riser. (A shoe keeps its dancer's depth until the
    // side view: from the front it is the dancer leaping, never near the soul.)
    const CLIMB = [[K.climb1[0], 110, 60, 0], [K.climb1[1], -110, 12, 1], [K.climb2[0], 0, -36, 2], [K.climb2[1], 100, -84, 3]];
    const stars = [], shoes = [], bursts = [];
    CLIMB.forEach(([tl, x, z, lv], i) => {
      const tOff = tl - 0.24;
      // (the first of each pair of climbs: the soul has stood on this step - three stars stamping
      // down after it as it leaps - beside it (what makes it jump), on its heels, where it stood; the second follows too close behind the first for anything to fall
      // between them - the shoe)
      if (i % 2 === 0) {
        const FALL = 0.22;
        [[30, -0.06], [15, 0.14], [0, 0.22]].forEach(([dz, dt]) => {
          const ta = tOff + dt, y1 = dz ? top(lv) - 8 : top(lv);
          stars.push({ t0: ta - FALL, t1: ta, p: (t) => { const u = U.clamp((t - (ta - FALL)) / FALL); return [x, U.lerp(base + 360, y1, U.eIn(u) * 0.7 + 0.3 * u), z + dz]; } });
          bursts.push({ t: ta, p: [x, y1, z + dz], n: 10 });
          H.sfx(ta, 'Arrow', 0.12);
        });
        return;
      }
      const d = dancers[i === 1 ? 2 : 0], tL = tOff - 0.36, tW = tOff - 0.05, tR = tOff + 0.2, side = i === 1 ? K.turn1[1] : K.sweep[1];
      const W = [x, top(lv) - 6, z + 70], R0 = [x, top(lv) - 6, z - 22];
      shoes.push({
        t0: tL, t1: tR, di: i === 1 ? 2 : 0,
        p: (t) => {
          const xd = t < side ? d[0] : x;
          if (t < tW) { const u = U.clamp((t - tL) / (tW - tL)); return [xd, U.lerp(d[1], W[1], u) + 90 * 4 * u * (1 - u), U.lerp(d[2], W[2], u)]; }
          return [x, W[1], U.lerp(W[2], R0[2], U.clamp((t - tW) / (tR - tW)))];
        },
      });
      bursts.push({ t: tR, p: R0, n: 16 });
      H.sfx(tL, 'Swipe', 0.2); H.sfx(tW, 'BookSpin', 0.2); H.sfx(tR, 'Ding', 0.18);
    });
    // ---- what touches is what overlaps in the view: from the front x-y, from a side z-y, turning:
    // really close in all three
    const viewOf = (t) => {
      const y = ((((TL.cam.at(t).yaw + Math.PI) % U.TAU) + U.TAU) % U.TAU) - Math.PI;
      return Math.abs(y) < 0.12 ? 'front' : Math.abs(Math.abs(y) - Q) < 0.12 ? 'side' : 'turn';
    };
    const touch = (p, sp, hx, hy, t) => {
      const v = viewOf(t), dx = Math.abs(p[0] - sp[0]), dy = Math.abs(p[1] - sp[1]), dz = Math.abs(p[2] - sp[2]);
      if (dy >= hy) return false;
      return v === 'front' ? dx < hx : v === 'side' ? dz < hx : dx < hx && dz < hx;
    };
    const shoeM = MV.vSprite('shoe', B.prop('shoe'), 2), starM = MV.vSprite('star', B.prop('star'), 2), shoeBig = MV.vSprite('shoe', B.prop('shoe'), 3);
    const STONE = U.lin('#26357c'), TOP = U.lin('#4c66cc'), HOT = U.lin('#c8d8ff'), EDGE = U.lin('#15204e'), CRY = U.lin('#9af2ff');
    const BURST = [U.lin('#ffffff'), U.lin('#9af2ff'), U.lin(HEX.blue)];
    TL.add({
      t0: V0, t1: V1, z: 10, name: 'fez',
      vox(Vx, t, S) {
        // the blocks: Waterfall's stone, crystals set in their faces
        BLK.forEach((b, i) => {
          const q = blockAt(b, t);
          if (!q || q.h < 2) return;
          const cy = q.y0 + q.h / 2, gl = 0.6 + 0.4 * Math.sin(t * 3 + i), w = warnK(b[4], t);
          Vx.box(q.x, cy, q.z, BS - 2, q.h - 1, BS - 2, STONE, 0.04 + 0.3 * w, 1);
          Vx.box(q.x, q.y0 + q.h - 2, q.z, BS - 2, 4, BS - 2, w > 0.01 ? HOT : TOP, 0.12 + 1.2 * w, 1);
          Vx.box(q.x, q.y0 + 1, q.z, BS, 2, BS, EDGE, 0, 1);
          if (q.h > 20) for (const [dx, dy, dz] of [[-10, 6, 24], [12, -8, 24], [-24, 4, -8], [24, -6, 10], [10, 10, -24]]) Vx.box(q.x + dx, cy + dy, q.z + dz, Math.abs(dx) === 24 ? 3 : 6, 6, Math.abs(dz) === 24 ? 3 : 6, CRY, gl + 1.5 * w, 1);
        });
        // the dancers, turning en pointe
        // (one that has leapt is gone from the line, back a moment after its shoe broke)
        dancers.forEach((p, k) => {
          const sh = shoes.find((s) => s.di === k && t >= s.t0 - 0.001 && t < s.t1 + 0.45);
          const a = sh ? (t < sh.t1 ? 0 : U.clamp((t - sh.t1 - 0.25) / 0.2)) : 1;
          if (a > 0.01) MV.vDraw(Vx, S, shoeM, p, { flip: Math.cos(t * 7 + k * 1.3) < 0, emi: 0.25, rot: -0.9 + Math.sin(t * 5 + k) * 0.1, a });
        });
        for (const s of stars) if (t >= s.t0 && t < s.t1) {
          for (let m = 2; m >= 1; m--) { const q = s.p(Math.max(s.t0, t - m * 0.035)); MV.vDraw(Vx, S, starM, q, { rot: t * 5, emi: 0.5, sc: 1.4, a: 0.35 * (3 - m) / 2 }); }
          MV.vDraw(Vx, S, starM, s.p(t), { rot: t * 5, emi: 0.9, sc: 1.6 });
        }
        // the shoes: spinning as they come, a trail behind
        for (const s of shoes) if (t >= s.t0 && t < s.t1) {
          for (let m = 3; m >= 1; m--) { const q = s.p(Math.max(s.t0, t - m * 0.03)); MV.vDraw(Vx, S, shoeBig, q, { rot: (t - m * 0.03) * 14, emi: 0.4, a: 0.3 * (4 - m) / 3 }); }
          MV.vDraw(Vx, S, shoeBig, s.p(t), { rot: t * 14, emi: 0.6 });
        }
        // where they break: a burst of blue and white
        for (const b of bursts) {
          const u = (t - b.t) / 0.3;
          if (u < 0 || u >= 1) continue;
          for (let i = 0; i < b.n; i++) {
            const a = (i / b.n) * U.TAU + b.t, r = U.eOut(u) * (16 + 22 * U.hash(i * 3.3 + b.t));
            Vx.box(b.p[0], b.p[1] + Math.abs(Math.sin(a)) * r * 0.9 - 30 * u * u, b.p[2] + Math.cos(a) * r, 5, 5, 5, BURST[i % 3], 1.4, 1 - u);
          }
        }
        // the kick: it bursts on him
        const u = (t - K.jump[1]) / 0.5;
        if (u >= 0 && u < 1) for (let i = 0; i < 28; i++) {
          const h = U.hash(i * 2.9), h2 = U.hash(i * 5.3 + 1), h3 = U.hash(i * 7.1 + 3), r = U.eOut(u) * (30 + 110 * h);
          Vx.box(HIT[0] + (h2 - 0.5) * r * 1.6, HIT[1] + (h3 - 0.5) * r * 1.6 - 80 * u * u, HIT[2] + 20 + (h - 0.5) * r, 6, 6, 6, BURST[i % 3], 1.6, 1 - u);
        }
      },
      // the dancers' "!", a beat before each turn
      ov(ctx, t, S) {
        for (const w of [K.warn1, K.warn2]) {
          if (t < w || t >= w + T.beat || Math.floor((t - w) * 10) % 2) continue;
          const img = MV.img('warnRed');
          for (const p of dancers) { const q = MV.project(S.cam, [p[0], p[1] + 64, p[2]], MV.OW, MV.OH); if (q) ctx.drawImage(img, Math.round(q[0] - img.width / 2), Math.round(q[1] - img.height), img.width, img.height); }
        }
      },
      hit(t, sp) {
        for (const s of stars) { if (t < s.t0 || t >= s.t1) continue; if (touch(s.p(t), sp, 12 + 10, 12 + 10, t)) return 'fez star'; }
        for (const s of shoes) { if (t < s.t0 || t >= s.t1) continue; if (touch(s.p(t), sp, 14 + 10, 10 + 10, t)) return 'fez shoe'; }
        return false;
      },
    });
    // the dancer on the lid; and the floor's track, running off into the dark both ways along the
    // depth (it shows only when the stage is lit)
    const tutuM = MV.vSprite('tutu', MV.ART.get('tutu'), 3), pointM = MV.vSprite('shoe3', B.prop('shoe'), 3);
    const trackY = yV(B.home.cy + B.home.h / 2 + 1), TRACK = U.lin('#3a1634');
    TL.add({
      t0: V0, t1: V1, z: 11,
      vox(Vx, t, S) {
        const a = TL.vStage.at(t).a;
        if (a > 0.01) for (let i = 0; i < 16; i++) { const z0 = -1400 + i * 120, k = a * (1 - Math.abs(i - 11) / 13); Vx.box(0, trackY - 3, z0 + 60, 60, 4, 116, TRACK, 0.25 * k, k); }
        const f = o.twirl(t) < 0;
        MV.vDraw(Vx, S, tutuM, MV.v3(B.home.cx, BOX_T - 50, 0), { flip: f, emi: 0.12 });
        MV.vDraw(Vx, S, pointM, MV.v3(B.home.cx + 1, BOX_T - 26, 0), { flip: f, rot: -1.25, emi: 0.12 });
      },
    });
    // where he is for the damage over him (screen px while the voxels have the picture)
    const head = (t) => { const S = MV.S, p = S && S.cam && S.cam.vp && MV.project(S.cam, [0, yV(FL.king[1] - 110), TL.vStage.at(t).kingZ], MV.OW, MV.OH); return p ? [p[0], p[1]] : null; };
    return { hit: K.jump[1], x2d: 480 + 100 / MV.VPX, head };
  };

  // ================================================================ the score
  MV.sections.push(() => {
    const beatsOf = (b0, b1, from = 0) => { const o = []; for (let b = b0; b < b1; b++) for (let k = 0; k < 4; k++) if (b > b0 || k >= from) o.push(at(b, k)); return o; };
    const shot = H.shot, move = H.move;
    // the stage answers: theme B's snare cluster pushes the walls' light in; the march's downbeats
    const kicks = [];
    for (let b = 16; b < 24; b++) kicks.push([at(b, 0, 8), 0.08]);
    for (let b = 24; b < 40; b++) kicks.push([at(b), b % 2 ? 0.05 : 0.1]);
    H.waveScore(at(16), at(40), 0.3, kicks);
    TL.look2.set(at(16), { shade: 0 });

    // ---------------------------------------------------------------- 16-19 yellow · the duel
    // 16: the rite (theme B's first hits: paw out on 1, the light in it on 2, the trident on 3)
    FX.rite('yellow', at(16), at(16, 2), at(19, 3, 3));
    TL.heart.set(at(16), { a: 1, x: C[0], y: C[1] });
    // the street: the box drawn out long and low; at its far end the empty gun, the hat over it
    const YB = { cx: 480, cy: 352, w: 272, h: 112 };
    H.boxTo(at(16, 2) - 0.12, at(16, 2) + 0.1, YB, 'outBack');
    H.sfx(at(16, 2) - 0.12, 'SwipeShort', 0.16);
    // the soul's places, reached on the last sixteenths of the bar before; in Dead Eye it creeps on
    // through the stopped world while the marks go down on it, one after another (they trail
    // behind it); when time comes back it darts clear - the shots come for where it was. 19: it
    // stands still
    const SPOT = { 17: [470, 372], 18: [540, 330], 19: [502, 380] };
    H.hTo(at(16, 3, 1), at(16, 3, 3.5), ...SPOT[17], 'inOut');
    const creep = (b, a, z) => H.hPath(at(b, 0, 2.5), at(b, 0, 7.6), (t) => { const u = (t - at(b, 0, 2.5)) / (at(b, 0, 7.6) - at(b, 0, 2.5)); return [U.lerp(a[0], z[0], u), U.lerp(a[1], z[1], u)]; });
    creep(17, SPOT[17], [500, 356]);
    [[at(17, 0, 9), 524, 316], [at(17, 0, 11), 562, 310], [at(17, 0, 13), 584, 324]].forEach(([t, x, y]) => H.hGo(t, x, y, 230));
    H.hTo(at(17, 3, 1), at(17, 3, 3.5), ...SPOT[18], 'inOut');
    creep(18, SPOT[18], [516, 346]);
    [[at(18, 0, 9.2), 452, 386], [at(18, 0, 11), 402, 392], [at(18, 0, 13), 428, 384]].forEach(([t, x, y]) => H.hGo(t, x, y, 260));
    H.hTo(at(18, 3, 1), at(18, 3, 3.5), ...SPOT[19], 'inOut');
    // the old photograph on theme B's rests: the marks go down, the world stops; the shots on its
    // snare cluster
    const deadEye = [];
    for (const b of [17, 18, 19]) {
      const m0 = at(b, 0, b === 19 ? 4 : 3);
      TL.look2.to(m0 - 0.06, m0 + 0.08, { sepia: 0.9 }, 'out').to(at(b, 0, 7.7), at(b, 0, 8), { sepia: 0 }, 'in');
      H.sfx(m0, 'Pullback', 0.14);
      deadEye.push([m0 - 0.03, at(b, 0, 8)]);
    }
    // the frontier at sundown: its wind gusting on theme B's snare; in the old photograph its
    // clock stops (the tumbleweeds, the sand, the vultures hang)
    const ySnare = [];
    for (let b = 16; b < 20; b++) for (const s of [1, 8, 10, 11, 12, 15]) ySnare.push([at(b, 0, s), s === 8 ? 260 : 140]);
    H.world('yellow', at(16) + 0.2, at(19, 3, 3), { wipe: 0.6, fire: 0.15, clock: MV.stopClock(at(16), at(20, 2), deadEye), gusts: ySnare.filter(([t]) => !deadEye.some(([a, b]) => t > a - 0.1 && t < b)), duel: at(19) - 1.0 });
    // the soul in the game's shooting mode: turned over, its point up at him - it is armed too
    H.mode(at(16, 2) - 0.1, at(19, 3, 3), 'yellowUp');
    const lower = at(19, 3);
    const Y = FX.yellow({ t0: at(16, 2), t1: at(19, 3, 3), lower, box: YB, gun: [306, 370], home: { t0: at(19, 3, 2), land: at(20) }, bars: [
      { b: 17, marks: 4 },
      { b: 18, marks: 4, ricochet: true },
      { b: 19, marks: 3, first: 4, salvo: true, hit: true },
    ] });
    // every shot is his: the trident kicks in his hands, the picture kicks away from the gun
    for (const f of Y.fires) { H.pose(f - 0.02, f + 0.04, 'idle', 'outExpo', { grot: 0.1, gy: -4, by: -2, crouch: -1 }); H.pose(f + 0.04, f + 0.2, 'idle', 'inOut'); TL.impact(f, { amp: 4, dx: 1, zoom: 0.02, dur: 0.22 }); }
    H.sfx(at(16, 2, 2), 'Target', 0.2); H.sfx(at(16, 3, 3), 'Target', 0.2);
    // the camera: down the street from the gun's end (it stands near, the soul far down the box);
    // in the old photograph the camera stops dead, then the shots kick it
    shot(at(16, 2), { x: 424, y: 350, zoom: 1.5, yaw: 0.44, pitch: 0.06, fov: 0.85 });
    move(at(16, 2), at(17, 0, 3), { x: 436, zoom: 1.6 }, 'out');
    move(at(17, 0, 8), at(18) - 0.04, { x: 446, zoom: 1.72, yaw: 0.38 }, 'out');
    // 18: Dead Eye through the gun's own lens - a scope's lens in the street, not a mask over the
    // picture: it rises out of the gun, a line of sight back to it; it snaps from mark to mark as
    // they are laid (each lock a flash of its rim, the mark magnified inside), then rides on the
    // soul through the ricochets, and goes home to the gun. The camera level and still: the street
    // whole, the gun at its end
    const GUN_W = [314, 364], Y18 = Y.marks.filter((m) => m.t >= at(18) && m.t < at(19)).sort((a, b) => a.t - b.t);
    const lensSegs = [];
    let lensTo = () => GUN_W;
    const lensGo = (tArrive, dur, fn) => { lensSegs.push([tArrive - dur, tArrive, lensTo, fn]); lensTo = fn; };
    Y18.forEach((m, j) => lensGo(m.t, j ? 0.08 : 0.24, () => m.p));
    lensGo(at(18, 0, 8) - 0.02, 0.12, (t) => { const h = TL.heart.at(t); return [h.x, h.y]; });
    lensGo(at(19, 0, 2), 0.32, () => GUN_W);
    const lensAt = (t) => {
      let p = GUN_W;
      for (const [a, b, f0, f1] of lensSegs) {
        if (t < a) break;
        if (t >= b) { p = f1(t); continue; }
        const u = U.eOut((t - a) / (b - a)), q0 = f0(t), q1 = f1(t);
        p = [U.lerp(q0[0], q1[0], u), U.lerp(q0[1], q1[1], u)];
      }
      return p;
    };
    H.lens(at(18) - 0.04, at(19, 0, 2), {
      track: lensAt, gun: () => GUN_W, mag: 2, locks: Y18.map((m) => m.t),
      r: (t) => 86 * U.eOutBack(U.clamp((t - at(18) + 0.04) / 0.2)) * (1 - U.smooth(U.clamp((t - at(19, 0, 2) + 0.26) / 0.26))),
    });
    shot(at(18), { x: 458, y: 346, zoom: 1.36 });
    move(at(18), at(19, 0, 2), { x: 468, zoom: 1.44 }, 'lin');
    H.sfx(at(18), 'CineCut', 0.16); H.sfx(at(18), 'Pullback', 0.22);
    // 19: the stand-off, from low down by the box: the soul does not move; the marks go down on it
    // one after another. He does not hesitate: the salvo - and it does not miss. The soul is hurt
    // for the first time (the game's hurt: the HP falls, it blinks); he does not flinch
    shot(at(19, 0, 4), { x: 470, y: 268, zoom: 1.24, pitch: 0.24, yaw: -0.06, fov: 0.8 });
    move(at(19, 0, 4), at(19, 0, 8), { zoom: 1.32, y: 262 }, 'lin');
    H.pose(at(19, 0, 5), at(19, 0, 7), 'idle', 'inOut', { grot: 0.06, gy: -2 });
    H.bigHit(at(19, 0, 8), { amp: 9, flash: 0.2, bw: 0 });
    const hit19 = Math.min(...Y.hits);
    H.hurt(hit19, 14, { vol: 0.75, iframes: 0.96 });
    TL.invulnSpans.push([hit19 - 0.05, hit19 + 1.0]);
    TL.impact(hit19, { amp: 8, dy: 0.5, zoom: 0.035, flash: 0.2, flashCol: [1, 0.2, 0.2], flashDecay: 9, dur: 0.4 });
    // high noon: a bell. And the soul's own aim - straight up at him (the shooting mode fires
    // upward), its mark on his chest in the old photograph's one other colour - which never
    // fires: two guns drawn, and only his went off
    H.sfx(at(19), 'ChurchBell', 0.4);
    const aimT = [at(19, 0, 4) + 0.04, at(19, 1, 2)];
    H.sfx(aimT[0] + 0.06, 'Target', 0.22);
    TL.add({
      t0: aimT[0], t1: aimT[1] + 0.35, z: 9, keep: true,
      draw(ctx, emi, t) {
        const s = TL.heart.at(t), yc = TL.king.at(t).y - 96, reach = U.eOut(U.clamp((t - aimT[0]) / 0.12)), k = 1 - U.clamp((t - aimT[1]) / 0.35);
        ctx.save(); ctx.globalAlpha = 0.8 * k; ctx.strokeStyle = HEX.yellow; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(s.x, s.y - 10); ctx.lineTo(s.x, U.lerp(s.y - 10, yc, reach)); ctx.stroke(); ctx.restore();
        if (reach > 0.95) F.spr(ctx, F.tint(MV.ART.get('markX'), HEX.yellow), s.x, yc, { sc: 3, ax: 3.5, ay: 3.5, alpha: k });
        if (emi) F.glowAt(emi, s.x, s.y - 8, 12, HEX.yellow, 0.4 * k);
      },
    });
    // and then the gun is lowered, the hat tipped; he stands as he stood. On the last half beat
    // they go home onto the yellow jar - landing on the downbeat he reaches for the green one
    H.pose(at(19, 3), at(20) - 0.1, 'idle', 'inOut');
    H.boxTo(at(19, 3, 2), at(20) - 0.05, B.home, 'inOut');

    // ---------------------------------------------------------------- 20-23 green · inside the soul
    // the rite: both paws held out together to the green jar, as if to cup a flower
    FX.handCam('yellow', 'green', at(19, 3, 2), at(20), at(20, 1, 2) - 0.02);
    const gR = FX.borrow('green', at(20), at(23, 3), { style: 'cup' }), gG = gR.tCol, gV = at(20, 2);
    // (the counterattack: the last throw comes from before him and is blocked perfectly on the big
    // snare - the picture stops dead - and flung straight back up into his chest through the rest in
    // the music (16ths 9-10, all but silent); the eye follows it up. On the accent after the rest it
    // lands - and on that very frame the 2D has the picture again: the blow, from outside)
    const gParry = at(23, 2), gHit = at(23, 2, 3), gV1 = gHit;
    // a kitchen's hearth for the moment before the dive (inside the soul it is the hearth's light)
    H.world('green', at(20, 1) - 0.08, gV - 0.005, { wipe: 0.3, burn: 0 });
    TL.heart.set(at(20) - 0.01, { x: C[0], y: C[1] });
    H.mode(gG - 0.05, at(23, 3), 'green');
    // the dive: the camera falls into the green soul and through it
    shot(gG, { x: 480, y: 330, zoom: 1.5, pitch: 0.1 });
    move(gG + 0.02, gV - 0.005, { x: C[0], y: C[1], zoom: 9, pitch: 0, yaw: 0, fov: 0.7 }, 'in5');
    H.sfx(gG, 'Pullback', 0.3);
    TL.impact(gV, { amp: 0, flash: 0.6, flashCol: [0.55, 1, 0.6], flashDecay: 9, dur: 0.4 });
    H.sfx(gV, 'Ding', 0.4);
    // the snare: 16ths 1 2 . . . . . 8 . 10 11 12 . . 15 - its figures (1 2 | 8 | 10 11 12 | 15),
    // each one a pan's fire from one face of the box; the eye turns to each figure. The last one, on
    // 23's big snare (8), comes from before him
    const FIG = [[1, 2], [8], [10, 11, 12], [15]], FACES = 'RBLUFDBRLUDF', groups = [];
    let q = 0;
    for (let b = 20; b < 24; b++) for (const fig of FIG) {
      const ts = fig.map((s) => at(b, 0, s)).filter((t) => t >= at(20, 2, 2) - 0.01 && t <= gParry + 0.01);
      if (!ts.length) continue;
      groups.push([ts, FACES[q % FACES.length]]);
      q++;
    }
    FX.greenFP(gV, gV1, groups, { pose: at(20, 3), parry: { t: gParry, hit: gHit } });
    // back in the 2D, the kitchen still round us: he takes it full in the chest and does not move.
    // The cut lands on the contact - close and low on his chest, the hall green and still; on the
    // release the green rings fly out and the camera is thrown back; the game's damage, stamped on
    const GCH = [482, FL.king[1] - 124];
    shot(gHit, { x: 482, y: 170, zoom: 1.72, pitch: 0.2, fov: 0.8 });
    const gRel = H.blow(gHit, { hex: HEX.green, at: GCH, dir: [0, -1], stop: 0.08, sfx: [['Explosion', 0.3], ['BgFlame', 0.2]],
      cam: { back: { x: 480, y: 214, zoom: 1.34, pitch: 0.1, fov: 0.8 }, backDur: 0.34 }, hp: [3500, 3348, 152], readout: { bar: DMG_BAR } });
    move(gRel + 0.36, at(23, 3), { zoom: 1.4, y: 208 }, 'out');
    // (the fire it sent back, white-hot and green, bursting on him: held through the stop)
    TL.add({
      t0: gHit, t1: gRel + 0.4, z: -18, live: true, name: 'the fire comes home',
      draw(ctx, emi, t) {
        const v = t - gRel;
        if (v < 0) { B.fire(ctx, emi, GCH[0], GCH[1] - (t - gHit) * 40, t, 3, { hex: '#e8ffe8', sc: 3.2 }); return; }
        for (let m = 0; m < 18; m++) {
          const a = (m / 18) * U.TAU + U.hash(m * 1.7) * 0.3, r = 10 + U.eOut(v / 0.4) * (60 + 50 * U.hash(m * 2.3));
          D.rect(ctx, R(GCH[0] + Math.cos(a) * r), R(GCH[1] + Math.sin(a) * r * 0.8), m % 3 ? 2 : 4, m % 3 ? 2 : 4, m % 2 ? HEX.green : '#e8ffe8', 1 - v / 0.4);
        }
      },
    });
    H.world('green', gV1 - 0.005, at(23, 3, 2), { wipe: 0, burn: 0.3, fire: 0.15 });
    // their things: the apron and the burnt pan come out of the box, as the room it was goes - and
    // on the last beat home onto the green jar: the apron hung back as on its hook, the pan ringing
    // down at its foot. On the downbeat he reaches for the purple jar
    const gThings = [{ img: img('apron'), x: 446, y: 238 }, { img: B.prop('pan'), x: 516, y: 248, sc: 2, rot: 0.35 }];
    H.absent('green', gV1, at(23, 3), gThings, { handoff: true, fadeIn: 0.2 });
    FX.goHome('green', [
      { img: gThings[0].img, j: 0, t0: at(23, 3), how: 'hook', from: () => [446, 238, 0, 3] },
      { img: gThings[1].img, j: 1, t0: at(23, 3) + 0.05, how: 'clang', from: () => [516, 248, 0.35, 2] },
    ], at(24));
    // ---------------------------------------------------------------- 24-27 purple · the trap of notes
    // the rite on the march: his fingertips pick the light up like a pen (on the downbeat his paw
    // is out, on its off-beat chord the light in it, on beat 2 his hand back on the shaft)
    FX.handCam('green', 'purple', at(23, 3), at(24), at(24, 1) - 0.02);
    const pR = FX.borrow('purple', at(24), at(27, 3), { style: 'pinch' }), pG = at(24, 1), TURN = at(26), HUSH = at(27, 1);
    // the archive in the clouds: haze, shafts of light from high windows, torn pages turning round
    // it on their way into the dark; the page turning at 26 blows them on; as 「对不起」 is written
    // the archive goes still (its pages hang in the air, its lamps sink low) and the haze clears
    // (the counterattack's release, 27 on the off-beat chord and a stop later, blows them on too)
    H.world('purple', at(24) + 0.12, at(27, 3, 3), { wipe: 0.5, fire: 0.15, gusts: [[TURN - 0.05, 900], [at(27, 0, 2) + 0.08, -1100]], hush: HUSH,
      clock: MV.clockOf(at(24), at(28, 1), (t) => 1 - 0.9 * U.smooth(U.clamp((t - HUSH) / 0.5))) });
    // the box opens into a wide page; the notebook's pages tear out and fly to the lines' ends
    const PB = { cx: 480, cy: 338, w: 288, h: 172 };
    H.boxTo(pG - 0.1, pG + 0.14, PB, 'outBack');
    H.sfx(pG - 0.1, 'BookSpin', 0.22);
    const pThings = [
      { img: img('glasses'), x: 716, y: 300 },
      { img: B.prop('book'), x: 718, y: 372, fn: (t) => ({ dy: t > pG && t < pG + 0.6 ? Math.sin((t - pG) * 40) * 2 : 0 }) },
    ];
    H.absent('purple', pG - 0.1, at(27, 3), pThings, { stand: { x: 716, y: 422, h: 170 }, handoff: true, fadeOut: 0.3 });
    for (let k = 0; k < 6; k += 2) H.sfx(pG + 0.12 + k * 0.05, 'Swipe', 0.08);
    const P1 = { t0: pG, t1: TURN, lines: [-52, 0, 52] }, P2 = { t0: TURN, t1: at(27, 3, 3), lines: [-68, -34, 0, 34, 68] };
    // the soul: page 1 between three lines on the beats; on page 2 it keeps clear of the scrawls
    // until one line is left (the middle one) - and there it is trapped
    const ppath = [], SX = 40; // (where it waits on the last line)
    [[1, 0], [1, -40], [0, -40], [0, 36], [2, 36], [2, -30], [1, -14]].forEach(([l, x], k) => ppath.push([at(24, 1 + k), l, x]));
    [[TURN + 0.02, 2, -14], [at(26, 1), 1, 30], [at(26, 2), 2, -24], [at(26, 3), 2, SX]].forEach((p) => ppath.push(p));
    // the words on the off-beat chords (two at once, crossing, as bar 25 ends); the last, as the
    // trap shuts, is 「凶手」 - hurled down the one line left, at the soul
    const tK = at(27), wl = [[at(24, 0, 10), '困住'], [at(24, 0, 14), '噩梦'], [at(25, 0, 2), '悲伤'], [at(25, 0, 6), '绝望'], [at(25, 0, 10), '恐惧', 'R'], [at(25, 0, 10), '仇恨', 'L'], [at(25, 0, 14), '毁灭', 'L'], [at(25, 0, 14), '厄运', 'R'],
      [at(26, 0, 6), '残忍'], [at(26, 0, 10), '恐怖']].map(([t, word, side]) => ({ t, word, side })).concat([{ t: at(26, 0, 14), line: 2, side: 'R', word: '凶手', to: PB.cx + SX + 14, end: tK, safe: true }]);
    // the trap closes: the two outer lines scrawled out at once, then the two inner, the box closing
    // on what is left
    const strikes = [{ t: at(26, 2), line: 0, from: 'L' }, { t: at(26, 2), line: 4, from: 'R' }, { t: at(26, 3), line: 1, from: 'R' }, { t: at(26, 3), line: 3, from: 'L' }];
    const PU = FX.purple([P1, P2], ppath, wl, { box: PB, tear: [718, 372], strikes, squeeze: true, close: at(27, 3) - 0.1,
      sorry: { t: HUSH, line: 2, side: 'L', reach: at(27, 2, 2), x: PB.cx + SX, write: 0.26 } });
    // his trident writes: a stroke on every word; crossing out lines, a slash down; turning the
    // page, a sweep from right to left
    for (const w of wl) { const t = typeof w === 'number' ? w : w.t; H.pose(t - 0.05, t + 0.06, 'idle', 'out', { grot: 0.05 * (Math.round((t - pG) / (T.beat / 2)) % 2 ? 1 : -1), gx: 3, gy: 2 }); H.pose(t + 0.08, t + 0.2, 'idle', 'inOut'); }
    H.act(TURN, 'raise', { grot: -0.26, gx: -18, gy: 8, lean: -0.05, crouch: 4, flare: 0.5, sway: -0.5 }, { windDur: 0.16, hold: 0.12, backDur: 0.2, after: 'idle' });
    [at(26, 2), at(26, 3)].forEach((t) => { H.pose(t - 0.07, t + 0.04, 'idle', 'outExpo', { grot: -0.2, gy: 10, crouch: 4 }); H.pose(t + 0.16, t + 0.4, 'idle', 'inOut'); });
    // 27: the counterattack - the trapped soul turns 「凶手」 back on him. On the downbeat it stops
    // dead against the soul and is held there a sixteenth, shaking, its ink burning white from the
    // soul's side (the blow gathered); then it is flung up out of the page - a sixteenth - and on
    // the off-beat chord stamped into his chest like a seal (the notebook's own weapon): the picture
    // stops, the hall goes purple; released, the ink bursts out and the word stays on him, smeared,
    // while he writes 「对不起」. He does not move.
    const tKh = at(27, 0, 2), tKl = at(27, 0, 1), kImg = FX.wordImg('凶手'), kW = F.tint(kImg, '#ffffff'), kAt = () => { const h = TL.heart.at(tK); return [h.x, h.y]; };
    const kChest = [478, FL.king[1] - 124];
    TL.add({
      t0: tK - 0.02, t1: tKl + 0.01, z: 8, keep: true, name: 'the word caught',
      draw(ctx, emi, t) {
        const [x, y] = kAt(), u = U.clamp((t - tK + 0.02) / (tKl - tK + 0.02)), wv = U.clamp((t - tK) / 0.16);
        // (burning white from the soul's side: the white grows over it)
        F.spr(ctx, kImg, x + U.noise(t * 80) * 3 * u, y + U.noise(t * 70 + 5) * 2 * u, { sc: 2 + 0.3 * u, ax: kImg.width / 2, ay: 9 });
        ctx.save(); ctx.beginPath(); ctx.rect(x - 60, y + 14 - 32 * u, 120, 40); ctx.clip();
        F.spr(ctx, kW, x + U.noise(t * 80) * 3 * u, y + U.noise(t * 70 + 5) * 2 * u, { sc: 2 + 0.3 * u, ax: kImg.width / 2, ay: 9 });
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 1 - wv; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + 40 * U.eOut(wv), 0, U.TAU); ctx.stroke(); ctx.restore();
        if (emi) F.glowAt(emi, x, y, 30 + 20 * u, '#ffffff', 0.35 + 0.35 * u);
      },
    });
    H.deep([{ t0: tKl, t1: tKh, to: kChest, safe: true, stay: 0.02,
      path: (t, u) => { const e = U.eIn(u), [x0, y0] = kAt(); return { p: [U.lerp(x0, kChest[0], e), U.lerp(y0, kChest[1], e) - Math.sin(u * Math.PI) * 26], z: 110 * e, s: 1 - 0.15 * e }; },
      draw(ctx, emi, t, p, s, a) {
        // (big and white-hot, its own ink behind it, speed lines streaming back down to the page)
        const rot = Math.sin((t - tK) * 30) * 0.06, [x0, y0] = kAt(), d = Math.hypot(p[0] - x0, p[1] - y0) || 1, ux = (p[0] - x0) / d, uy = (p[1] - y0) / d;
        for (let j = 0; j < 5; j++) { const L = Math.min(d, 30 + 22 * j), off = (j - 2) * 10; D.rect(ctx, p[0] - ux * (20 + L) - uy * off, p[1] - uy * (20 + L) + ux * off, 2, 2, j % 2 ? '#f4dcff' : HEX.purple, a * 0.7); for (let q = 4; q < L; q += 4) D.rect(ctx, p[0] - ux * (20 + q) - uy * off, p[1] - uy * (20 + q) + ux * off, 2, 2, j % 2 ? '#f4dcff' : HEX.purple, a * 0.55 * (1 - q / L)); }
        F.spr(ctx, F.tint(kImg, '#22082e'), p[0] + 2, p[1] + 2, { sc: 3 * s, ax: kImg.width / 2, ay: 9, alpha: a, rot });
        F.spr(ctx, kW, p[0], p[1], { sc: 3 * s, ax: kImg.width / 2, ay: 9, alpha: a, rot });
        if (emi) F.glowAt(emi, p[0], p[1], 44, '#e8c8ff', 0.6 * a);
      } }], { name: 'murderer', keep: true });
    H.sfx(tK, 'Ding', 0.3); H.sfx(tK, 'Pullback', 0.2); H.sfx(tKl, 'Swipe', 0.3);
    // the blow: cut to him from below on the contact, the picture held; thrown back on the release
    shot(tKh, { x: 480, y: 168, zoom: 1.7, pitch: 0.22, fov: 0.8 });
    const kRel = H.blow(tKh, { hex: HEX.purple, at: kChest, dir: [0, -1], stop: 0.08, sfx: [['BookSpin', 0.35], ['Laz', 0.25]],
      cam: { back: { x: 480, y: 244, zoom: 1.26, pitch: 0.08, fov: 0.8 }, backDur: HUSH - tKh - 0.08 }, hp: [3348, 3162, 186], readout: { bar: DMG_BAR } });
    // (the word pressed into him through the stop, white-hot; then ink: it bursts out every way and
    // the word stays on his chest, smeared and dripping, fading as he writes 「对不起」)
    const kInk = F.tint(kImg, '#5a1a84');
    TL.add({
      t0: tKh, t1: HUSH + 0.6, z: -40, live: true, name: 'ink on his chest',
      draw(ctx, emi, t) {
        if (t < kRel) { F.spr(ctx, kW, kChest[0], kChest[1], { sc: 3.1 - (t - tKh) * 2, ax: kImg.width / 2, ay: 9 }); return; }
        const u = (t - kRel) / 0.6, fade = 1 - U.clamp((t - HUSH) / 0.6);
        // (the stain: the word in ink, a little smeared down)
        F.spr(ctx, kInk, kChest[0], kChest[1] + 2, { sc: 2.6, ax: kImg.width / 2, ay: 9, alpha: 0.85 * fade });
        for (let i = 0; i < 7; i++) { const dx = (i - 3) * 9 + U.hash(i) * 4, L = (6 + 18 * U.hash(i * 2.1)) * U.clamp((t - kRel) / 0.9); D.rect(ctx, R(kChest[0] + dx), R(kChest[1] + 12), 2, R(L), '#5a1a84', 0.8 * fade); }
        if (u < 1) for (let i = 0; i < 36; i++) {
          const h = U.hash(i * 3.1), h2 = U.hash(i * 5.7 + 1), a = (i / 36) * U.TAU + h * 0.3, r = U.eOut(Math.min(1, u * 2)) * (20 + 70 * h2);
          D.rect(ctx, kChest[0] + Math.cos(a) * r, kChest[1] + Math.sin(a) * r * 0.8 + 140 * u * u * h2, i % 4 ? 4 : 2, i % 4 ? 4 : 2, i % 3 ? '#a23ee0' : i % 2 ? '#22082e' : '#f4dcff', 1 - u);
        }
        if (emi && u < 1) F.glowAt(emi, kChest[0], kChest[1], 50, HEX.purple, 0.5 * (1 - u));
      },
    });
    // and then their things go home: the notebook shuts, its pages flying back into it, and it flies
    // with the glasses to the purple jar like a bird
    FX.goHome('purple', [
      { img: pThings[0].img, j: 0, t0: at(27, 3) + 0.06, how: 'bird', from: () => [716, 300, 0, 3] },
      { img: pThings[1].img, j: 1, t0: at(27, 3), how: 'bird', from: () => [718, 372, 0, 3] },
    ], at(28));
    // the camera: 24 low and wide in front - the box opening, the pages flying to their places, the
    // archive behind him; 25 sliding along the page (the archive's depths slide past); square and
    // level for the turn, thrown after the page; a beat on him, the trident his pen; then each
    // line struck a step closer, the haze thickening; the last word: close and level with the line
    shot(pG, { x: 488, y: 290, zoom: 1.26, pitch: 0.08, yaw: -0.04, fov: 0.8 });
    move(pG, at(24, 3, 2), { zoom: 1.38, y: 300 }, 'out');
    shot(at(25), { x: 452, y: 318, zoom: 1.5, yaw: 0.2, pitch: 0.05, fov: 0.8 });
    move(at(25), at(25, 3), { x: 500, yaw: -0.08 }, 'inOut');
    move(at(25, 3), TURN - FX.TURN_LEAD - 0.01, { x: 486, y: 334, zoom: 1.56, yaw: 0, pitch: 0, fov: 0.7 }, 'inOut');
    H.whip(TURN + 0.12, { x: 468, y: 334, zoom: 1.6, fov: 0.7 }, { dur: 0.16, dx: -1, amp: 6 });
    shot(at(26, 1), { x: 500, y: 214, zoom: 1.3, pitch: 0.18, yaw: -0.2, fov: 0.8 });
    shot(at(26, 2) - 0.03, { x: 480, y: 336, zoom: 1.66, fov: 0.7 });
    // (each step after its lines are torn and the box slams in)
    [[at(26, 2), 1.76], [at(26, 3), 1.9]].forEach(([t, zz]) => move(t + 0.27, t + 0.4, { zoom: zz }, 'outExpo'));
    // 27: still close on the one line while the word is held at the soul (creeping in), and the word
    // goes up out of the picture; the contact is a cut to him (the blow, above); then, thrown back
    // to take in him and the line at once, it settles
    move(tK - 0.02, tKl, { zoom: 2.02, y: 330 }, 'in');
    // the last word: written slowly in pale ink at the line's start, his head bowed; it comes along
    // the one line there is, through the soul - which glows a little
    move(HUSH, at(27, 3), { x: 470, y: 330, zoom: 1.9, pitch: -0.02 }, 'inOut');
    TL.look2.set(pG, { blurKing: 0, blurBack: 0 }).set(at(26, 2) - 0.03, { blurKing: 1.2 })
      .to(at(26, 2), tK - 0.03, { blurBack: 1.6 }, 'in').set(tK - 0.02, { blurKing: 0 }).to(tK, HUSH, { blurBack: 0 }, 'inOut').set(at(28), { blurKing: 0, blurBack: 0 });
    H.pose(HUSH - 0.1, at(27, 3), 'bow', 'inOut', { grot: 0.04 });
    H.pose(at(27, 3), at(28) - 0.04, 'idle', 'inOut');
    TL.heart.to(at(27, 2, 2) - 0.04, at(27, 2, 2) + 0.1, { glow: 1 }, 'out').to(at(27, 3, 2), at(28, 0, 2), { glow: 0 }, 'inOut');
    H.boxTo(at(27, 3, 2), at(28) - 0.02, B.home, 'out');

    // ---------------------------------------------------------------- 28-31 blue · the music box
    // the rite: his paw held out flat, palm up; the light comes skipping down the ribbon on its
    // toes and lands in it
    FX.handCam('purple', 'blue', at(27, 3), at(28), at(28, 1) - 0.02);
    FX.borrow('blue', at(28), at(31, 3), { style: 'flat' });
    const bG = at(28, 1), V0 = at(29), V1 = at(31, 3);
    // Waterfall's wishing room
    H.world('blue', at(28) + 0.12, V1, { wipe: 0.5, fire: 0.15 });
    // the music box: the box with the ballerina on its lid - a tutu over the shoe, no one in them;
    // low and close, like a toy on a table
    shot(bG, { x: 480, y: 300, zoom: 1.6, pitch: 0.2, yaw: 0.1, fov: 0.85 });
    move(bG, at(28, 3), { x: 476, zoom: 1.7, yaw: -0.06 }, 'lin');
    const FLOOR = BI.y1;
    H.hTo(bG + 0.02, bG + 0.3, C[0] + 4, FLOOR, 'in');
    H.sfx(bG + 0.3, 'Impact', 0.12);
    // only two hops: the shoes slide in on the off-beat chords
    const shoeA = [at(28, 0, 10), at(28, 0, 14)];
    const HOPX = [C[0] + 4, C[0] - 30, C[0] + 22];
    let hx = C[0] + 4, hi = 0;
    const hop = (tc) => {
      const tu = tc - 0.24, td = tc + 0.24, x0 = hx, x1 = HOPX[(hi++ + 1) % HOPX.length];
      H.hPath(tu, td, (t) => { const u = (t - tu) / (td - tu); return [U.lerp(x0, x1, u), FLOOR - 50 * 4 * u * (1 - u)]; });
      hx = x1;
    };
    shoeA.forEach(hop);
    FX.blue([{ t0: bG, t1: V0 }], shoeA, []);
    // (it stays blue through the dark and the turns, and a little after)
    TL.heartMode.set(V0 + 1e-4, 'blue').set(V1 + 0.25, 'red');
    // the box turns: a quarter on 29's third beat, half round in one sweep through 30's middle, the
    // last quarter after the kick (each a beat after its warning)
    const KF = {
      rise1: [at(29), at(29, 0, 2), at(29, 1), at(29, 1, 2)], hop1: at(29, 1), warn1: at(29, 1), turn1: [at(29, 2), at(29, 2, 2)], climb1: [at(29, 3), at(29, 3, 2)],
      rise2: [at(30), at(30, 0, 2)], warn2: at(30), sweep: [at(30, 1), at(30, 3)], climb2: [at(30, 3), at(30, 3, 2)],
      // (the leap: up on the downbeat, held at its height 16ths 3-5, the kick landing on 6 - the
      // bar's heaviest snare; the turn back to the front after it)
      jump: [at(31), at(31, 0, 6)], hang: [at(31, 0, 3), at(31, 0, 5)], back: [at(31, 2), at(31, 2, 3)], sink: [at(31, 2, 2), at(31, 3)],
    };
    // the ballerina on the lid turns on every beat and spins as the box turns
    const spinning = (t) => [KF.turn1, KF.sweep, KF.back].some(([a, b]) => t >= a && t < b);
    const twirl = (t) => Math.cos((t - bG) * (spinning(t) ? 16 : 5));
    const bThings = [
      { img: img('tutu'), x: C[0], y: BOX_T - 50, fn: (t) => ({ flip: twirl(t) < 0 }) },
      { img: B.prop('shoe'), x: C[0] + 1, y: BOX_T - 26, rot: -1.25, fn: (t) => ({ flip: twirl(t) < 0 }) },
    ];
    H.absent('blue', bG, V1, bThings, { handoff: true });
    // 28, beat 4: the lights go down; only the music box is left - the box, the soul, the dancer -
    // and the camera pushes in to it: the voxels take the picture there
    TL.look2.to(at(28, 3), at(28, 3, 3), { dim: 1 }, 'inOut');
    TL.hudT.to(at(28, 3), at(28, 3, 2), { a: 0 }, 'in').set(at(28, 3, 2), { shards: 0 });
    for (let k = 0; k < 3; k++) TL.btn[k].to(at(28, 3), at(28, 3, 2), { a: 0 }, 'in');
    const FEZ_ZOOM = 1.8;
    move(at(28, 3), V0 - 0.01, Object.assign({}, B.CAM_HOME, { x: C[0], y: C[1], zoom: FEZ_ZOOM }), 'inOut');
    const Fz = FX.fez(V0, V1, { floor: FLOOR, twirl, zoom: FEZ_ZOOM, pose: at(28, 2), x0: (TL.heart.at(V0).x - 480) * MV.VPX, T: KF });
    // the kick landed: the game's damage over him, stamped on as the picture moves again (it follows
    // him while the box turns back)
    H.readout(Fz.hit + 0.08, 3162, 2948, 214, { dur: 1.3, bar: (t) => (MV.flatAt(t) ? DMG_BAR : Fz.head(t) || DMG_BAR) });
    // back in the 2D: the lights come up; the soul where its block left it
    TL.look2.to(V1, V1 + 0.25, { dim: 0 }, 'out');
    TL.hudT.to(V1 + 0.05, V1 + 0.3, { a: 1 }, 'out').set(V1, { shards: 1 });
    for (let k = 0; k < 3; k++) TL.btn[k].to(V1 + 0.05, V1 + 0.3, { a: 1 }, 'out');
    TL.heart.set(V1, { x: Fz.x2d, y: FLOOR });
    H.hTo(V1 + 0.05, at(32) - 0.02, C[0], C[1], 'inOut');
    // their things go home on the last beat: the shoes en pointe, hop by hop up the pedestals to
    // the blue jar; the tutu drifting down onto its lid. On the downbeat he reaches for the orange
    // one
    const bj = MV.jarAt('blue', V1), pj = MV.jarAt('purple', V1);
    FX.goHome('blue', [
      { img: bThings[0].img, j: 0, t0: V1 + 0.06, how: 'float', from: () => [C[0], BOX_T - 50, 0, 3] },
      { img: bThings[1].img, j: 1, t0: V1, how: 'climb', hops: 4, path: [[C[0] + 1, BOX_T - 26], [600, 250], [pj[0], pj[1] - 4], [bj[0] - 10, bj[1] + 14]], from: () => [C[0] + 1, BOX_T - 26, -1.25, 3] },
      { img: bThings[1].img, j: 2, t0: V1 + 0.03, appear: true, how: 'climb', hops: 4, path: [[Fz.x2d + 20, FLOOR], [620, 280], [pj[0] + 10, pj[1] - 4], [bj[0] + 10, bj[1] + 14]], from: () => [Fz.x2d + 20, FLOOR, 0, 2] },
    ], at(32));

    // ---------------------------------------------------------------- 32-35 orange · ringside
    // the rite: a fist driven at the orange jar - the blow knocks its light out
    FX.handCam('blue', 'orange', at(31, 3), at(32), at(32, 1) - 0.02);
    FX.borrow('orange', at(32), at(35, 3), { style: 'punch' });
    const oG = at(32, 1);
    // the soul takes the orange: bravery - it does not run (user, 2026-10-05): it steps into each
    // glove's lane and parries it (振刀), knocking it back. A trail of its own colour behind it
    H.mode(oG - 0.02, at(36) - 0.04, 'orange');
    const hOrange = MV.img('heartOrange');
    TL.add({
      t0: oG, t1: at(36) - 0.04, z: 38, keep: true, name: 'the brave soul',
      draw(ctx, emi, t) {
        for (let k = 3; k >= 1; k--) { const q = TL.heart.at(t - k * 0.035), p = TL.heart.at(t - k * 0.035 + 0.01); if (Math.hypot(p.x - q.x, p.y - q.y) < 0.3) continue; F.spr(ctx, hOrange, q.x, q.y, { sc: 1, ax: 8, ay: 8, alpha: [0, 0.32, 0.18, 0.08][k] }); }
      },
    });
    // the ring: the box's own frame is the ropes (the bandanna's two gloves against its sides); the
    // camera low at the frame, changing sides with a whip
    shot(oG, { x: 468, y: 352, zoom: 1.7, pitch: 0.24, yaw: 0.22, fov: 0.85 });
    H.whip(at(33), { x: 494, y: 352, zoom: 1.74, pitch: 0.24, yaw: -0.24, fov: 0.85 }, { dur: 0.1, dx: 1, amp: 6 });
    // 35: the counterattack - both gloves drawn back together, let go together on the downbeat; the
    // soul parries both at once and knocks them up into the top of the frame, which gives like a
    // rope and slings them out of the ring into his chest: the blow. He does not block it, does not
    // move. They fall back in
    // (34 beat 4 both drawn; 35 downbeat both parried up into the top, which they press up and up
    // - the slingshot loaded - until it is let go on 16th 5; on 6, the bar's heaviest snare, they
    // land in his chest together)
    const SL = { draw: at(34, 3), fire: at(35), load: at(35, 0, 5), hit: at(35, 0, 6), back: at(35, 2) };
    const O = FX.orange(at(32, 1, 2), at(36) - 0.2, beatsOf(32, 36, 2), { stop: SL.draw, sling: SL, home: at(35, 3) });
    const CHO = [480, FL.king[1] - 114], powO = MV.ART.get('punchPow');
    H.sfx(SL.draw, 'Pullback', 0.3);
    const oRel = H.blow(SL.hit, { hex: HEX.orange, at: CHO, dir: [0, -1], pow: 1.15, stop: 0.1, bw: 0.05, sfx: [['PunchStrong', 0.6], ['Slam', 0.3]],
      cam: { snap: { x: 480, y: 160, zoom: 1.76, pitch: 0.18, yaw: 0, fov: 0.85 }, back: { x: 480, y: 256, zoom: 1.2, pitch: 0.14, yaw: 0.06, fov: 0.85 }, backDur: 0.36 },
      hp: [2948, 2701, 247], readout: { bar: DMG_BAR } });
    TL.add({
      t0: SL.hit, t1: oRel + 0.35, z: 38, live: true, keep: true, name: 'the gloves land',
      draw(ctx, emi, t) {
        const u = t < oRel ? 0 : (t - oRel) / 0.35;
        F.spr(ctx, powO, CHO[0], CHO[1], { sc: 4 * (1.4 - 0.4 * U.eOut(t < oRel ? (t - SL.hit) / 0.1 : 1)) * (1 + 0.3 * u), ax: 13, ay: 13, alpha: 1 - u * u, rot: u * 0.5 });
        if (emi) F.glowAt(emi, CHO[0], CHO[1], 60, '#ffd23a', 0.6 * (1 - u));
      },
    });
    // Snowdin in a blizzard: every punch a gust (the way it flies), every shock ring blows the
    // snow away; the soul's blow a gust straight up
    H.world('orange', at(32) + 0.12, at(35, 3, 3), { wipe: 0.5, fire: 0.15, gusts: O.punches.map(([tk, s]) => [tk, -520 * s]), rings: O.rings.concat([[oRel, oRel + 0.6, CHO[0], CHO[1], 20, 760]]) });
    // the absent boxer: the bandanna at a child's height outside the ropes (its gloves are in
    // them), bobbing with every punch
    const bob = (t) => { let v = 0; for (const [tk] of O.punches) { const d = t - tk; if (d > -0.15 && d < 0.4) v = Math.max(v, Math.exp(-Math.abs(d) * 9)); } return v; };
    const oThing = { img: img('bandanna'), x: 330, y: 300, fn: (t) => ({ dy: 4 * bob(t), rot: 0.12 * bob(t) }) };
    H.absent('orange', oG, at(35, 3), [oThing], { stand: { x: 330, y: 422, h: 170 }, handoff: true, fadeOut: 0.3 });
    // he boxes with the trident on the bass: every punch lands in the picture, kicked the way it
    // flies; the downbeats' two frames of hard black and white
    for (const [tk, side] of O.punches) {
      H.pose(tk - 0.1, tk, 'thrust', 'outExpo', { lean: -0.05 * side, gx: -14 * side, sway: -0.5 * side });
      H.pose(tk + 0.06, tk + 0.3, 'brace', 'inOut', { lean: 0.02 * side });
      const down = Math.abs(T.barOf(tk) - Math.round(T.barOf(tk))) < 0.01;
      TL.impact(tk, { amp: down ? 9 : 6, dx: -side, dy: 0.3, zoom: down ? 0.05 : 0.03, dur: 0.3, bw: down ? 0.034 : 0 });
    }
    H.pose(at(34, 3), at(34, 3, 2), 'idle', 'inOut');
    // 34: wide for two beats - him boxing, from the other corner; then close at the ropes
    shot(at(34), { x: 480, y: 262, zoom: 1.06, pitch: 0.12, yaw: -0.18 });
    shot(at(34, 2), { x: 470, y: 348, zoom: 1.86, pitch: 0.22, yaw: 0.2, fov: 0.85 });
    move(at(34, 2), SL.draw, { zoom: 1.94 }, 'lin');
    // the sling: wide enough for the ring and his chest, from a little below
    shot(SL.draw, { x: 480, y: 262, zoom: 1.24, pitch: 0.14, yaw: 0.06, fov: 0.85 });
    move(SL.draw, SL.load, { zoom: 1.32, y: 250 }, 'in');
    move(oRel + 0.38, at(35, 3), { zoom: 1.18, y: 258 }, 'out');
    // their things go home on the last beat: the gloves in a plain arc (no flourish: a glove only
    // ever strikes slung), the bandanna drifting down onto the lid. On the downbeat he reaches for
    // the light blue jar
    FX.goHome('orange', [
      { img: oThing.img, j: 0, t0: at(35, 3) + 0.05, how: 'float', from: (t) => { const f = oThing.fn(t); return [oThing.x, oThing.y + f.dy, f.rot, 3]; } },
      ...[-1, 1].map((s, i) => ({ img: MV.ART.get('boxGlove'), j: 1 + i, t0: at(35, 3) + i * 0.04, how: 'arc', ax: 14, ay: 11, flip: s > 0,
        from: () => { const g = O.gloveAt(s, at(35, 3)); return [g.x, g.y, 0, 2]; } })),
    ], at(36));

    // ---------------------------------------------------------------- 36-39 light blue · patience
    // the rite: the paw held out - and nothing comes for a whole beat; then the light, slowly
    // (patience); the hand back on the shaft on beat 4
    FX.handCam('orange', 'aqua', at(35, 3), at(36), at(36, 2));
    const aR = FX.borrow('aqua', at(36), at(39, 3, 2), { style: 'wait' }), aG = aR.tCol;
    // the box rounds into the face of the Ruins' clock - no hands: here the time is the soul's
    const AB = { cx: C[0], cy: 336, w: 184, h: 184 };
    H.boxTo(aG - 0.1, aG + 0.15, Object.assign({ round: 1 }, AB), 'outBack');
    H.sfx(aG - 0.1, 'Bell', 0.2);
    // patience: frontal, a push so slow it is almost still
    shot(aG, { x: 486, y: 330, zoom: 1.5, pitch: 0.04, yaw: 0.06 });
    move(aG, at(39) - 0.03, { zoom: 1.86, yaw: -0.04, x: 482 }, 'lin');
    // (39: on the downbeat the gathered knives sink a little - the blow drawn back; they go up on 16th
    // 5 and are in his chest on 6, the bar's heaviest snare)
    const TW = -Math.PI / 2, tDip = at(39), tA = at(39, 0, 5), tAh = at(39, 0, 6), back = at(39, 3, 2);
    // the soul takes the light blue: patience - and the child's two things are two kinds of time
    // (SUPERHOT): bows of its ribbon fly only while the soul moves, its toy knives only while it
    // waits. It moves through the first half of each beat of 37 and 38 (bows only in 37; the knives
    // join in 38), then waits - and in that last long wait the knives gather round it, all pointing
    // up, at twelve
    H.mode(aG - 0.02, back, 'aqua');
    H.hTo(at(36, 3), at(36, 3, 2), C[0], 340, 'inOut');
    const kn = B.prop('knife'), CHA = [480, FL.king[1] - 112], KN = [CHA[0], CHA[1] + 50];
    const PS = [[at(37), 446, 314], [at(37, 1), 516, 300], [at(37, 2), 500, 372], [at(37, 3), 432, 352], [at(38), 474, 294], [at(38, 1), 534, 340], [at(38, 2), 482, 374]];
    FX.patience(at(36, 3, 2), back, { start: [C[0], 340], steps: PS,
      bows: [[0, 3], [1, 4], [2, 4], [3, 5], [4, 5], [5, 5], [6, 5]],
      knives: [[2, 0.6], [3, 2.3], [3, 0.55], [4, Math.PI], [4, 1.9], [5, -Math.PI / 2], [5, 0.2]],
      finale: { tDip, tUp: tA, tHit: tAh, to: [KN[0], KN[1] - 26], n: 5 }, stopAt: tAh, endAt: back });
    // 39: the counterattack - patience rewarded: the knives go straight up out of the box at him,
    // into his chest - one knife there. The blow stops the picture; and when it moves again the
    // clock has stopped: all time stands still, grey - he with it, not even breathing; the bows
    // hang in the air round the soul; only the number keeps its colour
    TL.add({
      t0: tAh, t1: back, z: -40, keep: true, name: 'the knife in his chest',
      draw(ctx, emi, t) {
        F.spr(ctx, kn, KN[0], KN[1], { sc: 3, ax: 0, ay: 2, rot: TW });
        const u = (t - tAh) / 0.3;
        if (u < 1) for (let i = 0; i < 22; i++) { const h = U.hash(i * 3.7), a = h * U.TAU, r = U.eOut(u) * (12 + 40 * U.hash(i * 1.3)); D.rect(ctx, CHA[0] + Math.cos(a) * r, CHA[1] + Math.sin(a) * r * 0.8, 3, 3, i % 3 ? HEX.aqua : '#ffffff', 1 - u); }
        if (emi && u < 1) F.glowAt(emi, CHA[0], CHA[1], 50, HEX.aqua, 0.6 * (1 - u));
      },
    });
    H.sfx(tDip, 'Pullback', 0.22);
    // the knives' flight seen from low by the box; the contact pushes in on his chest; thrown back,
    // the camera too stops dead with the clock
    shot(tA - 0.02, { x: 480, y: 250, zoom: 1.22, pitch: 0.12, fov: 0.8 });
    H.blow(tAh, { hex: HEX.aqua, at: CHA, dir: [0, -1], pow: 1.2, stop: 0.1, sfx: [['Saber', 0.45], ['Laz', 0.3]],
      cam: { snap: { x: 480, y: 170, zoom: 1.72, pitch: 0.16, yaw: 0, fov: 0.8 }, back: { x: 480, y: 236, zoom: 1.3, pitch: 0.1, yaw: 0, fov: 0.8 }, backDur: 0.3 },
      hp: [2701, 2438, 263], readout: { bar: DMG_BAR, dur: 1.6 } });
    // (the clock stops: nothing moves - the camera neither)
    TL.look2.to(tAh, tAh + 0.12, { gray: 1 }, 'out');
    TL.king.set(tAh, { breathe: 0 }).set(back, { breathe: 1 });
    // the Ruins in autumn: its time runs only while the soul moves (its leaves fall, its clock
    // ticks); when the clock stops, nothing moves at all
    const moving = (t) => { const a = TL.heart.at(t - 0.012), b = TL.heart.at(t + 0.012); return U.clamp(Math.hypot(b.x - a.x, b.y - a.y) / 0.024 / 70); };
    H.world('aqua', at(36) + 0.12, back, { wipe: 0.5, fire: 0.15, clock: MV.clockOf(aG - 0.3, at(40), (t) => (t >= tAh ? 0 : 0.05 + 0.95 * moving(t))) });
    // the faded ribbon beside the clock (its bows and its knives in the box)
    const aThing = { img: img('ribbon'), x: 622, y: 306, fn: (t) => ({ rot: t < tAh ? Math.sin(t * 3.1) * 0.25 : Math.sin(tAh * 3.1) * 0.25 }) };
    H.absent('aqua', aG, back + 0.12, [aThing], { stand: { x: 622, y: 422, h: 170 }, handoff: true, fadeOut: 0.3 });
    // and the colour floods back: all six jars lit together - the seventh stays dark. The knife goes
    // home turning like a clock's hand; the ribbon last and slowest - as he begins to draw them all
    TL.look2.to(back, at(39, 3, 3), { gray: 0 }, 'out');
    TL.impact(back, { amp: 0, flash: 0.3, flashCol: [0.9, 0.95, 1], flashDecay: 10, dur: 0.3 });
    H.sfx(back, 'Sparkles', 0.35);
    MV.SOULS.forEach((k) => TL.jar[k].to(back, at(40), { glow: 1.2 }, 'out'));
    FX.goHome('aqua', [
      { img: kn, j: 1, t0: back, how: 'spin', ax: 0, ay: 2, from: () => [KN[0], KN[1], TW, 3] },
      { img: aThing.img, j: 0, t0: back + 0.12, land: at(40, 0, 3), how: 'float', from: () => [aThing.x, aThing.y, aThing.fn(back).rot, 3] },
    ], at(40));
    H.hTo(back, at(40) - 0.02, C[0], C[1], 'inOut');
    H.boxTo(back, at(40) - 0.02, Object.assign({ round: 0 }, B.home), 'inOut');
    shot(back, { x: 560, y: 200, zoom: 1.24, pitch: 0.08, yaw: -0.1 });
    move(back, at(40), { x: 520, zoom: 1.16 }, 'inOut');
  });
})();
