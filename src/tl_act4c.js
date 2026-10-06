// Act four, part three: bars 40-52 - he draws all six powers, the climax, the fall.
// The drawing, the cage breaking, the corridor of worlds and the all-out blow:
// the things on the jars light up and do not strike; everything that comes is his.
//   40-43 the drawing (the rise): every half bar he draws one more soul's power, in the order he
//         first borrowed them (40.5 yellow, 41 green, 41.5 purple, 42 blue, 42.5 orange, 43 light
//         blue). Its ribbon runs from its jar to the trident (the soul stays in its jar), a band of
//         its colour grows down the trident from the points, his arm rises a notch - and the colour
//         runs on out of the points into his fire: the game's chains poured out of him without a
//         break, the net swung half a cell over every half bar (the soul hops diamonds on the beats),
//         a column wider, in its colour, with each power drawn. The things on the jars only light up. 43.5:
//         the six colours and his own red run together - the trident a rainbow; the world stops,
//         grey, and the net hangs in the air round the soul.
//   44    the music's blow and its silence: the charge is full - not an attack. The rainbow trident
//         at its highest, the power breaks the cage open and blows the net away: the cage's top and
//         sides flung off, its floor drawn out across the hall into a wide platform.
//   44-51 THE GATES OF THE WORLDS: the corridor itself is the attack. Out of the door each world
//         rushes at the soul as a wall with one way through - never where the soul is: yellow a
//         wall of its fire with one hole, green a pane of glass with one hole, purple a ruled page
//         with a slit on its line, blue the music box's lid turning with its hole, orange a wall with
//         no way through (go through it moving), light blue the same (stand still and let it pass -
//         the game's rules). A gate every two beats, then every beat, every eighth, every sixteenth;
//         the soul a dash from gate to gate, its red wake behind it. He only holds the trident up.
//   52    the fall: one rainbow slash - it does not miss. HP 14 -> 1, the soul cracks (it does not
//         break); all his fire dies at once - black - and his voice. (From the darkness on: the
//         hand-over to bar 53.)
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, B = MV.B2, FL = MV.FL, F = MV.F, D = MV.D;
  const HEX = MV.COL.S, R = Math.round, SR = B.SR;
  const at = (b, k = 0, s = 0) => T.at(b, k, s);
  const cut = (t, v) => H.shot(t, v);
  const C = [B.home.cx, B.home.cy];

  MV.sections.push(() => {
    const FX = MV.SOULFX, SOULS = MV.SOULS;
    const WAKE = { yellow: at(40, 2), green: at(41), purple: at(41, 2), blue: at(42), orange: at(42, 2), aqua: at(43) };
    const CONV = at(43, 2), r0 = at(44), tLetGo = at(52, 2);
    // the soul's dance (as in src/tl_act4a.js): keys [t, x, y, dash?] - it holds
    // each place and dashes to the next (in the last `dash` s), there on the key's time; B.dodge
    // follows it wherever the fire lets it
    const dance = (keys, dash0 = 0.18) => (t) => {
      if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
      for (let k = 1; k < keys.length; k++) {
        const [tb, xb, yb, dk] = keys[k];
        if (t > tb) continue;
        // (a long way takes longer: about 320 px/s at least)
        const [ta, xa, ya] = keys[k - 1], d = Math.min(dk ?? Math.max(dash0, Math.hypot(xb - xa, yb - ya) / 320), tb - ta), e = d > 0 ? U.eInOut(U.clamp((t - tb + d) / d)) : 1;
        return [U.lerp(xa, xb, e), U.lerp(ya, yb, e)];
      }
      const z = keys[keys.length - 1];
      return [z[1], z[2]];
    };
    const CHASE = { lureW: 1.6, startW: 0.06, comfort: 6, speed: 360 };

    // ================================================================ their things, awake
    // From its soul's drawing on, each thing lifts off its spot on the jar and hovers there, lit. They
    // do not strike (their first move of their own is the turn at 68)
    const lift = (key, t) => -9 * U.eOutBack(U.clamp((t - WAKE[key]) / 0.3));
    SOULS.forEach((key) => {
      FX.homeFx[key] = (t, j) => {
        const w = WAKE[key];
        if (t < w - 0.02) return {};
        const flare = Math.exp(-Math.max(0, t - w) * 3);
        return { dy: lift(key, t) + Math.sin(t * 2.6 + j * 1.7) * 1.5, rot: 0, glow: 0.5 + 1.3 * flare, still: true, a: 1 };
      };
    });

    // ================================================================ 40-43 the drawing
    TL.heart.set(at(40), { x: C[0], y: C[1] });
    // the box widens a little to hold what is coming
    const BX = { cx: C[0], cy: C[1], w: 230, h: 150 };
    H.boxTo(at(40), at(40) + 0.3, { w: BX.w, h: BX.h }, 'outBack');
    H.sfx(at(40), 'SwipeShort', 0.16);
    // he draws them one by one: the ribbon (the soul stays in its jar), a band of its colour down the
    // trident from the points, his arm a notch higher (braced: his cape thrown out by the power)
    const NOTCH = [0.12, 0.26, 0.4, 0.55, 0.7, 0.86];
    SOULS.forEach((key, i) => {
      const t = WAKE[key];
      H.ribbon(key, t, tLetGo, { at: 0.42 + i * 0.09, tint: false, grow: 0.32, lift: 26, seed: i * 1.7 });
      TL.tridentBands.to(t, t + 0.34, { [key]: 1 }, 'out');
      H.pose(t - 0.02, t + 0.1, 'idle', 'outBack', { grot: NOTCH[i], gy: -4 - 4 * i, by: -i, crouch: 3, flare: 0.3 + 0.12 * i });
      H.pose(t + 0.14, t + 0.5, 'idle', 'inOut', { grot: NOTCH[i], gy: -4 - 4 * i, by: -i, flare: 0.2 + 0.12 * i });
      TL.jar[key].to(t, t + 0.08, { glow: 2.4 }, 'out').to(t + 0.3, t + 0.9, { glow: 1.3 }, 'inOut');
      H.sfx(t, 'Grab', 0.2);
      // (the frame flashes its colour)
      const [cr, cg, cb] = F.rgb(HEX[key]).map((v) => v / 255);
      TL.box2.set(t - 0.01, { ar: cr, ag: cg, ab: cb }).to(t - 0.01, t + 0.05, { ak: 0.9 }, 'out').to(t + 0.2, t + 0.6, { ak: 0 }, 'inOut');
    });
    // the six worlds come back round him as rings of the corridor, one with each power (the first
    // borrowed outermost), drawn in toward the door at 43.5 and flung out by the blow at 44
    const BANDS = [[0.82, 3], [0.66, 0.82], [0.52, 0.66], [0.4, 0.52], [0.28, 0.4], [0, 0.28]];
    const pull = (t) => 1 - 0.32 * U.smooth(U.clamp((t - CONV) / (r0 - CONV)));
    SOULS.forEach((key, i) => H.world(key, WAKE[key] - 0.04, r0, { band: (tt) => BANDS[i].map((d) => (d > 2 ? d : d * pull(tt))), wipe: 0.35, burn: 0.42, burst: true, wind: false,
      glow: (tt) => 0.8 * Math.exp(-Math.max(0, tt - WAKE[key]) * 2.5) * (tt >= WAKE[key] ? 1 : 0) }));
    TL.look2.to(at(40), at(40, 2), { wall: 0.2 }, 'inOut');
    // his fire sinks as the six worlds come back round him (it roars up again at 44)
    TL.look2.to(WAKE.yellow, WAKE.green, { flames: 0.18 }, 'inOut');

    // ---- his fire, gaining the colours: the game's chains poured out of him without a break (user
    // 2026-10-06: they run on unbroken), the whole net swung half a cell over on every half bar and
    // back on the next, the bend at the soul's height on a beat (41·0, 41·8 ... the diamond it is in
    // closes: it hops). Three columns of his own white at the middle from the start, and one more,
    // outward, in a power's colour from the moment he draws it. From 43.5 the world stands and the
    // net hangs in the air; the blow at 44 flings it away
    const FALLN = (360 - 170) / 150, HALF = T.bar / 2;
    const warp43 = B.warp([[CONV, r0]]);
    const SEAMS = [1, 2, 3, 4, 5].map((j) => at(40, 2) + j * HALF - FALLN), SWAY43 = B.swing(SEAMS, 35);
    const BYWAKE = SOULS.slice().sort((a, b) => WAKE[a] - WAKE[b]);
    const NETCOLS = [0, 70, -70, 140, -140, 210, -210, 280, -280].map((dx, i) => ({
      x: C[0] + dx, t0: i < 3 ? at(40) : Math.max(at(40), WAKE[BYWAKE[i - 3]]), t1: at(40, 2) + 7 * HALF - FALLN, ph: 0, hex: i < 3 ? undefined : HEX[BYWAKE[i - 3]],
    }));
    const NET = B.helix({ cols: NETCOLS, warp: warp43, y0: 170, sway: SWAY43 });
    H.pourGlow(NETCOLS, 170, { sway: SWAY43 });
    H.sfx(at(40), 'BgFlame', 0.18);
    SEAMS.forEach((s) => H.sfx(s, 'BgFlame', 0.14));
    // (the blow at 44 ends it: what is in the air then is flung out from the middle, burning out)
    const FLUNG = [];
    for (const s of NET) {
      if (s.t0 <= r0 && s.t1 > r0) { const p = s.p(r0); FLUNG.push({ p, hex: s.hex }); }
      s.t1 = Math.min(s.t1, r0 + 0.01);
    }
    H.shots(NET, { name: 'chain', clip: null, z: 19 });
    TL.add({
      t0: r0, t1: r0 + 0.45, z: 19, name: 'the net flung away',
      draw(ctx, emi, t) {
        const u = (t - r0) / 0.45;
        for (const f of FLUNG) {
          const dx = f.p[0] - C[0], dy = f.p[1] - (C[1] - 60), L = Math.hypot(dx, dy) || 1, d = 900 * u * (1 - 0.4 * u);
          B.fire(ctx, emi, f.p[0] + (dx / L) * d, f.p[1] + (dy / L) * d, t, f.p[0], { hex: f.hex, a: 1 - u });
        }
      },
    });
    // the soul's dance through the net: a step on each beat inside its diamond, a hop on each half
    // bar as the net swings (unswung its diamonds are at x 410 / 480 / 550, y 360 and at x 445 /
    // 515, y 297; swung half a cell over the other way round); still in the grey
    const inner = (t) => B.inner(MV.box2At(t));
    const DANCE40 = dance([
      [at(40), 480, 345], [at(40, 1), 450, 372], [at(40, 2), 505, 338],
      [at(40, 2, 2), 480, 382], [at(40, 3), 480, 334],
      [at(41), 550, 300], [at(41, 1), 550, 336], [at(41, 2), 480, 382], [at(41, 3), 480, 332],
      [at(42), 410, 300], [at(42, 1), 410, 336], [at(42, 2), 480, 384], [at(42, 3), 480, 334],
      [at(43), 550, 300], [at(43, 1), 550, 338], [CONV - 0.04, 515, 360], [r0, 515, 360],
    ]);
    B.dodge(at(40) + 0.02, r0 - 0.02, NET, Object.assign({ box: inner, lure: DANCE40 }, CHASE));
    H.graze(at(40), r0, NET);
    TL.dashSpans.push([at(40), CONV]);

    // ---- 43.5 the meeting: the world stops, grey; the six colours and his own red run together on
    // the trident - a rainbow; the net of his fire hangs in the air; he lifts the trident to its height
    TL.look2.to(CONV - 0.02, CONV + 0.08, { gray: 1 }, 'out').set(r0, { gray: 0 });
    TL.tridentBands.to(CONV, CONV + 0.45, { rb: 1 }, 'inOut');
    TL.trident.to(CONV, r0 - 0.04, { glow: 2.2 }, 'in');
    H.sfx(CONV, 'Pullback', 0.4); H.sfx(CONV + 0.5, 'Charge', 0.45);
    // he lifts the trident to its height, the cape spreading; the six colours in his eyes
    H.pose(CONV, r0 - 0.06, 'high', 'inOut', { flare: 1.4, gy: -34, by: -12 });
    SOULS.forEach((key, i) => H.eyes(at(43, 2, 2 + i * 0.6), HEX[key], 0.3, { vol: i ? 0 : 0.4 }));
    TL.heart.to(at(43, 3), at(43, 3, 3), { glow: 1.2, sc: 1.3 }, 'out').to(at(43, 3, 3), r0, { glow: 0, sc: 1 }, 'in');
    // the camera: low and wide, the box and the jars both sides of him; with each power a push
    // toward that jar; at the meeting the whole tableau from low down, then up to the points
    cut(at(40), { x: 480, y: 286, zoom: 1.14, pitch: 0.16, fov: 0.85 });
    const LEAN = { yellow: [-1, 0.16], green: [-1, 0.2], purple: [1, 0.16], blue: [1, 0.2], orange: [-1, 0.24], aqua: [1, 0.24] };
    SOULS.forEach((key, i) => {
      const [sd, yw] = LEAN[key], t = WAKE[key];
      H.whip(t, { x: 480 + sd * 46, y: 282 - i * 3, zoom: 1.16 + i * 0.03, pitch: 0.16, yaw: -sd * yw, fov: 0.85 }, { dur: 0.08, dx: sd, amp: 4, sfx: false });
    });
    cut(CONV, { x: 480, y: 268, zoom: 1.06, pitch: 0.3, fov: 0.95 });
    H.move(CONV + 0.4, r0 - 0.03, { y: 150, zoom: 1.32, pitch: 0.34 }, 'in');

    // ================================================================ 44 the charge breaks the cage
    // the music's blow: the charge is full - he does not strike; the rainbow trident at its height,
    // the power bursts out of it and breaks the cage open: its top and sides flung off out of the
    // picture, its floor drawn out across the whole hall. Until the end of 51 the cage stands open:
    // the soul is out in the hall on a wide platform, and the worlds come at it
    const FLOOR = 404, BX0 = C[0] - BX.w / 2, BY0 = C[1] - BX.h / 2;
    TL.box2.set(r0, { cx: C[0], cy: C[1], w: 2600, h: 1800, rot: 0, round: 0, ak: 0, fill: 0, fa: 0 });
    // (user, 2026-10-06: no frame through the gates - the soul is out in the corridor itself, flying
    // through the worlds; the box stays open, unseen, until 51's beat 3, when it slams back round the
    // soul for the all-out blow)
    const ARENA = { cx: C[0], cy: FLOOR - 75, w: 340, h: 150 };
    const tShut = at(51, 2);
    TL.box2.set(tShut - 0.01, { cx: ARENA.cx, cy: ARENA.cy, w: 1300, h: 760, fill: 0, fa: 1, a: 1 }).to(tShut, tShut + 0.14, Object.assign({ fill: 1 }, ARENA), 'outExpo');
    H.sfx(tShut, 'SwipeShort', 0.3); H.sfx(tShut + 0.13, 'Impact', 0.3);
    TL.impact(tShut + 0.13, { amp: 5, zoom: 0.02, dur: 0.25 });
    TL.add({
      t0: r0, t1: at(52) + 0.2, z: 36, keep: true, name: 'the cage opens',
      draw(ctx, emi, t) {
        const e = U.eOut(U.clamp((t - r0) / 0.42)), a = 1 - U.clamp((t - r0 - 0.24) / 0.22);
        if (t < r0 + 0.5) {
          // (from the trident's points: the power's ring, in its colours)
          const v = (t - r0) / 0.5, tip = MV.spearTip(r0, 0.95);
          ['#ff3a2a', HEX.orange, HEX.yellow, HEX.green, HEX.aqua, HEX.blue, HEX.purple].forEach((c, i) => {
            ctx.save(); ctx.globalAlpha = 0.6 * (1 - v); ctx.strokeStyle = c; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(tip[0], tip[1], 30 + U.eOut(v) * (880 - i * 18), 0, U.TAU); ctx.stroke(); ctx.restore();
          });
          ctx.save(); ctx.globalAlpha = 0.9 * (1 - v); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 10 * (1 - v) + 2;
          ctx.beginPath(); ctx.arc(C[0], C[1], 60 + U.eOut(v) * 760, 0, U.TAU); ctx.stroke(); ctx.restore();
        }
        // the top and the sides, thrown off, turning
        const bar = (cx, cy, w, h, dx, dy, rot) => { ctx.save(); ctx.globalAlpha = a; ctx.translate(Math.round(cx + dx * e), Math.round(cy + dy * e)); ctx.rotate(rot * e); ctx.fillStyle = '#ffffff'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore(); };
        if (a > 0.01) { bar(C[0], BY0 - 2, BX.w + 8, 5, 30, -460, -0.7); bar(BX0 - 2, C[1], 5, BX.h + 8, -560, -160, 1.1); bar(BX0 + BX.w + 2, C[1], 5, BX.h + 8, 560, -180, -1.3); }
        // the floor, drawn out across the whole hall - and gone: nothing holds the soul now
        const half = U.lerp(BX.w / 2, 1000, U.eInOut(U.clamp((t - r0) / 0.45))), y = U.lerp(BY0 + BX.h, FLOOR, U.eOut(U.clamp((t - r0) / 0.3))), fa = 1 - U.clamp((t - r0 - 0.35) / 0.35);
        if (fa > 0.01) { D.rect(ctx, C[0] - half, y - 2, 2 * half, 5, '#ffffff', fa); if (emi) D.rect(emi, C[0] - half, y - 5, 2 * half, 11, '#ffffff', 0.22 * fa); }
      },
    });
    H.sfx(r0 + 0.02, 'GlassBreak', 0.35); H.sfx(r0, 'Explosion', 0.5); H.sfx(r0, 'BgFlame', 0.4);
    // the depth of field: the hall behind a little soft, the soul and what reaches it sharp (the jars'
    // plane sharp: the far gates are drawn on it)
    TL.look2.to(r0, r0 + 0.35, { blurBack: 0.8, blurJars: 0 }, 'out').to(at(51, 3), at(52), { blurBack: 0, blurJars: 0 }, 'inOut');
    // he holds it high, charged: the light running up the shaft, brighter
    H.pose(r0 - 0.02, r0 + 0.12, 'high', 'outExpo', { grot: 1.12, gy: -44, by: -16, crouch: -6, flare: 1.6, hy: -3 });
    TL.tridentBands.to(r0, r0 + 0.2, { flow: 0.5 }, 'out').to(at(48), at(51, 3), { flow: 1 }, 'in');
    TL.trident.to(r0, r0 + 0.2, { glow: 1.4 }, 'out').to(at(48), at(51, 3), { glow: 2.6 }, 'in');
    H.hit(r0, 1.2, { flash: 0.3 });
    // (his fire's sparks surge with it, then thin: the worlds rushing past behind)
    TL.look2.to(r0, r0 + 0.1, { flames: 1.45 }, 'out').to(r0 + 0.3, at(45), { flames: 0.7 }, 'inOut');
    cut(r0, { x: 480, y: 250, zoom: 1.0, pitch: -0.3, yaw: 0.05 });
    H.bigHit(r0 + 0.002, { amp: 6, flash: 0, rot: 0 });

    // ================================================================ 44-51 the gates of the worlds
    // The corridor is the attack. Each gate is a world's ring of the corridor with a wall across it,
    // rushing out of the door (the corridor's vanishing point, FL.door) at its own pace; it reaches the
    // platform's plane on its time (ta) - there it is the ring at depth 0.36, (184, 138) each way round
    // the door, wider than the platform - and passes the soul in that instant: only its way through
    // is safe. The way through is never where the soul is when the gate is born. Kinds: yellow a wall
    // of fire with a hole; green a pane of glass with a hole; purple a ruled page with a slit on a line;
    // blue the music box's lid, turning as it comes, with a hole; orange no way through - be moving as
    // it passes; light blue the same - be still (the game's rules).
    const VP = FL.door, GW = 184, GH = 138, DARR = 0.36, SH = 15;
    const GL = [VP[0] - GW, VP[0] + GW, VP[1] - GH, VP[1] + GH];
    const AI = B.inner(ARENA);
    const KCOL = { yellow: HEX.yellow, green: HEX.green, purple: HEX.purple, blue: HEX.blue, orange: B.RULE.orange, aqua: B.RULE.aqua };
    // (each colour's own pitch as it passes: the omen's two for orange and light blue)
    const KRATE = { yellow: 1.0, green: 1.12, purple: 0.9, blue: 0.95, orange: 1.25, aqua: 0.8 };
    // [ta, kind, approach (s), {hole: [x, y, hw, hh]} | {slit: y} | {from, to} (orange) | {at} (light
    // blue), hold (it hangs in the breath before the stab)]
    const slalom = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => [at(51, 0, k), k % 2 ? 'yellow' : 'green', 0.3, { hole: [R(480 + 34 * Math.sin(k * 0.75)), R(322 + 10 * Math.sin(k * 1.5)), 24, 22] }]);
    const GATES = [
      // 44-45: every two beats; big holes, slow
      [at(45), 'yellow', 1.04, { hole: [392, 300, 46, 36] }],
      [at(45, 2), 'green', 1.04, { hole: [574, 360, 46, 36] }],
      // 46: every beat - the page's slit, the turning lid
      [at(46), 'purple', 0.78, { slit: 292 }],
      [at(46, 1), 'blue', 0.78, { hole: [420, 362, 40, 32] }],
      [at(46, 2), 'purple', 0.78, { slit: 304 }],
      [at(46, 3), 'blue', 0.78, { hole: [566, 334, 40, 32] }],
      // 47: the game's two rules, by turns
      [at(47), 'orange', 0.78, { from: [566, 334], to: [484, 352] }],
      [at(47, 1), 'aqua', 0.78, { at: [484, 352] }],
      [at(47, 2), 'orange', 0.78, { from: [484, 352], to: [390, 318] }],
      [at(47, 3), 'aqua', 0.78, { at: [390, 318] }],
      // 48: the two stabs - each gate hangs in the breath before it and comes with the blow
      [at(48, 0, 4), 'yellow', 0.7, { hole: [586, 302, 40, 32] }, true],
      [at(48, 0, 8), 'green', 0.7, { hole: [440, 372, 40, 32] }, true],
      [at(48, 3), 'purple', 0.6, { slit: 298 }],
      // 49: every beat, then every eighth
      [at(49), 'blue', 0.6, { hole: [560, 366, 36, 30] }],
      [at(49, 1), 'orange', 0.6, { from: [560, 366], to: [478, 334] }],
      [at(49, 2), 'aqua', 0.6, { at: [478, 334] }],
      [at(49, 2, 2), 'yellow', 0.5, { hole: [420, 316, 34, 28] }],
      [at(49, 3), 'green', 0.5, { hole: [466, 360, 34, 28] }],
      [at(49, 3, 2), 'purple', 0.5, { slit: 300 }],
      // 50: every eighth
      [at(50), 'blue', 0.42, { hole: [530, 300, 32, 28] }],
      [at(50, 0, 2), 'orange', 0.42, { from: [530, 300], to: [470, 330] }],
      [at(50, 1), 'aqua', 0.42, { at: [470, 330] }],
      [at(50, 1, 2), 'yellow', 0.42, { hole: [414, 360, 32, 28] }],
      [at(50, 2), 'green', 0.42, { hole: [474, 380, 32, 28] }],
      [at(50, 2, 2), 'purple', 0.42, { slit: 332 }],
      [at(50, 3), 'blue', 0.42, { hole: [536, 316, 30, 26] }],
      [at(50, 3, 2), 'yellow', 0.42, { hole: [480, 292, 30, 26] }],
      // 51 beats 1-2: every sixteenth, a slalom of small holes; on beat 3 it all stops
      ...slalom,
    ].map(([ta, kind, A, way, hold], i) => {
      const g = Object.assign({ i, ta, kind, A, tb: ta - A, hold: !!hold, rule: kind === 'orange' || kind === 'aqua' ? kind : undefined, spin: 2.6 * (i % 2 ? 1 : -1) }, way);
      const lam = A / Math.log(9);
      // (its own time: in the breath before a stab it slows to a crawl - never quite still: a gate
      // standing dead in the air read as the picture stalling (user, 2026-10-06) - then rushes the
      // last of the way in 0.04 s)
      const hA = ta - 0.19, hB = ta - 0.04, hK = 0.2, tauB = hA + (hB - hA) * hK;
      const tau = (t) => (!g.hold || t < hA ? t : t < hB ? hA + (t - hA) * hK : tauB + (t - hB) * ((ta - tauB) / (ta - hB)));
      g.S = (t) => (t < g.tb ? 0 : Math.exp((tau(t) - ta) / lam)); // 1 on its time (1/9 when born)
      g.D = (t) => DARR * g.S(t); // (the corridor's ring it is)
      return g;
    });
    // the breaths before 48's stabs
    for (const g of GATES) if (g.hold) H.hush(g.ta - 0.19, g.ta);

    // ---- what the planner and the hits see: on its time (±0.03 s) the wall is everything round its
    // way through, as rectangles; orange's and light blue's walls carry their rule
    const W0 = 0.03, STRIPS = [];
    const strip = (g, x0, x1, y0, y1) => { if (x1 - x0 < 1 || y1 - y0 < 1) return; const c = [(x0 + x1) / 2, (y0 + y1) / 2]; STRIPS.push({ t0: g.ta - W0, t1: g.ta + W0, hw: (x1 - x0) / 2, hh: (y1 - y0) / 2, p: () => c, rule: g.rule, name: 'gate ' + g.kind }); };
    for (const g of GATES) {
      if (g.hole) { const [hx, hy, hw, hh] = g.hole; strip(g, GL[0], GL[1], GL[2], hy - hh); strip(g, GL[0], GL[1], hy + hh, GL[3]); strip(g, GL[0], hx - hw, hy - hh, hy + hh); strip(g, hx + hw, GL[1], hy - hh, hy + hh); }
      else if (g.slit) { strip(g, GL[0], GL[1], GL[2], g.slit - SH); strip(g, GL[0], GL[1], g.slit + SH, GL[3]); }
      else strip(g, GL[0], GL[1], GL[2], GL[3]);
    }
    const safeIn = (g, sp) => (g.hole ? Math.abs(sp[0] - g.hole[0]) < g.hole[2] - SR && Math.abs(sp[1] - g.hole[1]) < g.hole[3] - SR : g.slit ? Math.abs(sp[1] - g.slit) < SH - SR : false);

    // ---- the soul's dance from gate to gate: in each way through on its time (a slit: at its line,
    // on toward the next gate), dashing through orange's, dead still under light blue's
    const KEYS = [[r0 + 0.02, 515, 360], [r0 + 0.7, 515, 360]];
    GATES.forEach((g, i) => {
      const next = GATES[i + 1], px = KEYS[KEYS.length - 1][1];
      if (g.hole) KEYS.push([g.ta - 0.06, g.hole[0], g.hole[1]], [g.ta + 0.05, g.hole[0], g.hole[1]]);
      else if (g.slit) { const x = U.clamp(next && next.hole ? (px + next.hole[0]) / 2 : px, AI.x0 + 20, AI.x1 - 20); KEYS.push([g.ta - 0.06, x, g.slit], [g.ta + 0.05, x, g.slit]); }
      else if (g.kind === 'aqua') KEYS.push([g.ta - 0.1, g.at[0], g.at[1]], [g.ta + 0.07, g.at[0], g.at[1]]);
      else KEYS.push([g.ta - 0.08, g.from[0], g.from[1]], [g.ta + 0.09, g.to[0], g.to[1], 0.17]);
    });
    const last = KEYS[KEYS.length - 1];
    KEYS.push([at(52), last[1], last[2]]);
    const DANCE44 = dance(KEYS, 0.2);
    const DG44 = B.dodge(r0 + 0.02, at(51, 2, 1.5), STRIPS, Object.assign({ box: AI, lure: DANCE44, cell: 4 }, CHASE));
    // (the grazes: the walls round each way through, a little longer than they cut - H.graze leaves
    // out a shot's first and last 0.06 s)
    H.graze(r0 + 0.3, at(51, 2, 1.5), STRIPS.map((s) => Object.assign({}, s, { t0: s.t0 - 0.07, t1: s.t1 + 0.07 })));
    TL.dashSpans.push([r0, at(51, 2, 1.5)]);
    TL.trailSpans.push([r0 + 0.3, at(51, 2, 1.5)]);

    // ---- each gate's depth: born at the door on the walls' plane (900 deep), it comes on at a steady
    // pace in depth and is on the soul's plane (0) on its time; drawn there (src/depth.js) - behind
    // him until it passes his plane (110), then in front - so it rushes out of the door and over the
    // soul with the hall round it whichever way the camera turns, and its ring of the corridor with it
    // (user, 2026-10-06: the gates looked pasted on - drawn on the soul's plane, they slid against
    // the rings on the walls)
    const ZW = 900, zOfS = (s) => (s <= 0 ? ZW : ZW * U.clamp(-Math.log(s) / Math.log(9)));
    // ...and past it: it does not stop on the soul's plane - it rushes on at the lens, opening round
    // the soul (its way through) until it has flown out past the picture, the soul and the eye gone
    // through it (user, 2026-10-06 night: the gates popped away on the soul's plane - not immersive).
    // pass(t): 0..1 over its last stretch, TP long
    for (const g of GATES) {
      g.TP = U.clamp(g.A * 0.34, 0.13, 0.3);
      g.pass = (t) => U.clamp((t - g.ta) / g.TP);
      // (v: how far through it is - leaving its time at the speed it came, then faster)
      g.v = (t) => { const u = g.pass(t); return 0.81 * u + 0.19 * u * u; };
      g.Z = (t) => (t <= g.ta ? zOfS(g.S(t)) : -380 * g.v(t));
    }
    // ---- the walls, alive (they read as wallpaper): his fire as the game's fireballs, a lattice
    // flickering and rising through a dark wash of its colour (yellow, orange, light blue); a pane of
    // the green glass with light running over it; a page of the notebook, ruled, a line lighting at a
    // time; the music box's lid, its crystals twinkling. Soft toward their edges (no frame: a hard
    // edge never lines up with anything), a bright rim round the way through, white on its time.
    // (Built at load: each was a hitch on the frame it first came)
    const W2 = 2 * GW, H2 = 2 * GH;
    const softEdge = (c) => {
      const x = c.getContext('2d'), id = x.getImageData(0, 0, W2, H2), d = id.data;
      for (let j = 0; j < H2; j++) for (let i = 0; i < W2; i++) { const e = Math.min(i / W2, 1 - i / W2, j / H2, 1 - j / H2), p = (j * W2 + i) * 4 + 3; d[p] = R(d[p] * U.smooth(U.clamp(e / 0.2))); }
      x.putImageData(id, 0, 0);
      return MV.gpuCopy(c);
    };
    const washOf = (kind) => F.cached('gateWash3:' + kind, () => {
      const [c, x] = MV.canvas(W2, H2), [cr, cg, cb] = F.rgb(KCOL[kind]);
      if (kind === 'green') {
        x.fillStyle = `rgba(${R(cr * 0.22)},${R(cg * 0.42)},${R(cb * 0.3)},0.5)`; x.fillRect(0, 0, W2, H2);
        x.fillStyle = 'rgba(212,255,224,0.16)'; for (let k = -H2; k < W2; k += 46) for (let q = 0; q < H2; q += 2) x.fillRect(k + q, q, 3, 2);
      } else if (kind === 'purple') {
        x.fillStyle = 'rgba(23,11,38,0.88)'; x.fillRect(0, 0, W2, H2);
        x.fillStyle = 'rgba(142,92,200,0.85)'; for (let y = 14; y < H2; y += 22) x.fillRect(0, y, W2, 2);
        x.fillStyle = 'rgba(192,80,106,0.9)'; x.fillRect(46, 0, 2, H2);
      } else if (kind === 'blue') {
        x.fillStyle = 'rgba(26,38,104,0.9)'; x.fillRect(0, 0, W2, H2);
        x.strokeStyle = '#d8b048'; x.lineWidth = 6; x.strokeRect(16, 16, W2 - 32, H2 - 32); x.lineWidth = 2; x.strokeRect(28, 28, W2 - 56, H2 - 56);
      } else {
        x.fillStyle = `rgba(${R(cr * 0.2)},${R(cg * 0.2)},${R(cb * 0.2)},0.7)`; x.fillRect(0, 0, W2, H2);
      }
      return softEdge(c);
    });
    MV.prewarm.push(() => { for (const k of Object.keys(KCOL)) { washOf(k); B.fireImg(0, KCOL[k]); B.fireImg(1, KCOL[k]); } });
    // (in the gate's own px - its middle at 0, 0, its size on arrival - laid in at scale s round the
    // door: home = VP + local * s)
    // (a curtain of his fire pouring down the wall like the hail - uneven, each fireball its own
    // flicker and brightness: a still lattice read as a pattern)
    const FDX = 34, FDY = 29, FSC = 1.45, FV = 120;
    const edgeFade = (u, v) => U.smooth(U.clamp(Math.min((u + GW) / W2, (GW - u) / W2, (v + GH) / H2, (GH - v) / H2) / 0.18));
    const fireWall = (ctx, t, s, col, a, hl) => {
      const f0 = B.fireImg(0, col), f1 = B.fireImg(1, col), fall = t * FV, j0 = Math.floor(fall / FDY);
      for (let jj = -1; jj <= Math.ceil(H2 / FDY) + 1; jj++) {
        const j = jj - j0, v = -GH + jj * FDY + (fall % FDY) - FDY;
        if (v < -GH - 8 || v > GH + 8) continue;
        for (let i = -1; i <= Math.ceil(W2 / FDX); i++) {
          const h1 = U.hash(i * 7.13 + j * 3.71), h2 = U.hash(i * 2.39 + j * 5.17 + 3);
          const u = -GW + (i + (j & 1 ? 0.5 : 0) + (h1 - 0.5) * 0.45) * FDX + (v + GH) * 0.22, vv = v + (h2 - 0.5) * 9;
          if (u < -GW - 8 || u > GW + 8) continue;
          if (hl && u > hl[0] - 9 && u < hl[2] + 9 && vv > hl[1] - 9 && vv < hl[3] + 9) continue;
          const k = edgeFade(u, vv) * a * (0.55 + 0.45 * h2);
          if (k <= 0.02) continue;
          F.spr(ctx, (Math.floor(t * 10 + h1 * 7) & 1) ? f1 : f0, VP[0] + u * s, VP[1] + vv * s, { sc: FSC * s * (0.85 + 0.3 * h1), ax: 8, ay: 8, alpha: k });
        }
      }
    };
    const glass = (ctx, t, s, a) => {
      // two bands of light sliding over the pane
      for (const [sp, off, w] of [[260, 0, 34], [260, 0.45, 14]]) {
        const ph = (((t * sp) / (W2 + H2) + off) % 1) * (W2 + H2) - H2;
        ctx.globalAlpha = 0.22 * a; ctx.fillStyle = '#eaffef'; ctx.beginPath();
        ctx.moveTo(VP[0] + (-GW + ph) * s, VP[1] - GH * s); ctx.lineTo(VP[0] + (-GW + ph + w) * s, VP[1] - GH * s);
        ctx.lineTo(VP[0] + (-GW + ph + w + H2) * s, VP[1] + GH * s); ctx.lineTo(VP[0] + (-GW + ph + H2) * s, VP[1] + GH * s); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const page = (ctx, t, s, a) => {
      // one of its lines lit at a time, running down the page
      const n = Math.floor(H2 / 22), j = Math.floor(t * 9) % n, y = VP[1] + (-GH + 14 + j * 22) * s;
      ctx.globalAlpha = 0.7 * a; ctx.fillStyle = '#e8c8ff'; ctx.fillRect(VP[0] - GW * 0.8 * s, y, GW * 1.6 * s, Math.max(1, 2 * s)); ctx.globalAlpha = 1;
    };
    const lid = (ctx, t, s, a) => {
      for (let j = 0; j < 6; j++) for (let i = 0; i < 9; i++) {
        if ((i + j) % 2) continue;
        const tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * 5 + i * 1.7 + j * 2.3));
        ctx.globalAlpha = a * tw; ctx.fillStyle = '#9af2ff';
        const x = VP[0] + (-GW + 30 + i * 38) * s, y = VP[1] + (-GH + 26 + j * 42) * s, z = Math.max(1, 4 * s);
        ctx.fillRect(x - z / 2, y - z / 2, z, z);
      }
      ctx.globalAlpha = 1;
    };
    // (where on the picture a point of the wall is at scale s: out from the door)
    const proj = (p, s) => [VP[0] + (p[0] - VP[0]) * s, VP[1] + (p[1] - VP[1]) * s];
    const drawGate = (ctx, emi, t, g) => {
      // (past its time: laid out as on its time, opened round where the soul went through - a
      // perspective rush, 1 -> ~12x - and thinning as it leaves; no way through: a quicker wash)
      const u = g.pass(t), past = t > g.ta;
      const s = past ? 1 : g.S(t), col = KCOL[g.kind];
      const near = U.clamp(Math.log(s * 9) / Math.log(9)), flash = Math.max(0, 1 - Math.abs(t - g.ta) / 0.05);
      const a = (0.28 + 0.72 * near) * (past ? (1 - u) ** (g.rule ? 2.4 : 1.4) : 1);
      if (a <= 0.005) return;
      const x0 = VP[0] - GW * s, y0 = VP[1] - GH * s, w = 2 * GW * s, h = 2 * GH * s;
      ctx.save();
      if (past) {
        if (!g.P) { const hs = TL.heart.at(g.ta); g.P = g.hole ? [g.hole[0], g.hole[1]] : [hs.x, hs.y]; }
        const m = 1 / (1 - 0.92 * g.v(t));
        ctx.translate(g.P[0], g.P[1]); ctx.scale(m, m); ctx.translate(-g.P[0], -g.P[1]);
      }
      if (g.kind === 'blue') { ctx.translate(VP[0], VP[1]); ctx.rotate(g.spin * (g.ta - t) * (t < g.ta ? 1 : 0)); ctx.translate(-VP[0], -VP[1]); }
      // its way through, on the picture and in its own px
      let hr = null, hl = null;
      if (g.hole) { const c = proj(g.hole, s); hr = [c[0] - g.hole[2] * s, c[1] - g.hole[3] * s, 2 * g.hole[2] * s, 2 * g.hole[3] * s]; hl = [g.hole[0] - VP[0] - g.hole[2], g.hole[1] - VP[1] - g.hole[3], g.hole[0] - VP[0] + g.hole[2], g.hole[1] - VP[1] + g.hole[3]]; }
      if (g.slit) { const y = VP[1] + (g.slit - VP[1]) * s; hr = [x0, y - SH * s, w, 2 * SH * s]; }
      ctx.save();
      ctx.beginPath(); ctx.rect(x0, y0, w, h);
      if (hr) ctx.rect(hr[0], hr[1], hr[2], hr[3]);
      ctx.clip('evenodd');
      ctx.globalAlpha = a * (1 + 0.4 * flash); ctx.drawImage(washOf(g.kind), x0, y0, w, h); ctx.globalAlpha = 1;
      if (g.kind === 'green') glass(ctx, t, s, a);
      else if (g.kind === 'purple') page(ctx, t, s, a);
      else if (g.kind === 'blue') lid(ctx, t, s, a);
      else fireWall(ctx, t, s, col, Math.min(1, a * 1.15 + flash), hl);
      ctx.restore();
      // the rim of its way through (no frame round the wall itself); white on its time
      if (hr) {
        ctx.globalAlpha = Math.min(1, a * 1.1 + flash); ctx.lineWidth = Math.max(1, 1.5 * s); ctx.strokeStyle = flash > 0.2 ? '#ffffff' : '#fff6d8';
        if (g.slit) { const xa = x0 + 0.14 * w, xb = x0 + 0.86 * w; ctx.beginPath(); ctx.moveTo(xa, hr[1]); ctx.lineTo(xb, hr[1]); ctx.moveTo(xa, hr[1] + hr[3]); ctx.lineTo(xb, hr[1] + hr[3]); ctx.stroke(); }
        else ctx.strokeRect(hr[0], hr[1], hr[2], hr[3]);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      if (emi && flash > 0) { const c = g.hole ? g.hole : [VP[0], g.slit ?? VP[1]]; F.glowAt(emi, c[0], c[1], 40, col, 0.45 * flash); }
    };
    const tEndG = Math.max(...GATES.map((g) => g.ta + g.TP)) + 0.02;
    // (each on the plane it is at: the far ones behind him on the jars' plane, the near ones in front)
    const ZK = MV.PLANE_Z.king, ZJ = MV.PLANE_Z.mid;
    const gatesOn = (ctx, emi, t, S, far) => {
      for (let n = GATES.length - 1; n >= 0; n--) {
        const g = GATES[n];
        if (t < g.tb || t > g.ta + g.TP) continue;
        const z = g.Z(t);
        if ((z > ZK) !== far) continue;
        const x = MV.depthXf(S.cam, z, far ? ZJ : 0);
        ctx.save(); ctx.transform(x.k, 0, 0, x.k, x.ox, x.oy);
        if (emi) { emi.save(); emi.transform(x.k, 0, 0, x.k, x.ox, x.oy); }
        drawGate(ctx, emi, t, g);
        ctx.restore(); if (emi) emi.restore();
      }
    };
    TL.add({ t0: GATES[0].tb, t1: tEndG, z: -120, keep: true, name: 'the gates, far', draw(ctx, emi, t, S) { gatesOn(ctx, emi, t, S, true); } });
    TL.add({
      t0: GATES[0].tb, t1: tEndG, z: 6, keep: true, name: 'the gates',
      draw(ctx, emi, t, S) { gatesOn(ctx, emi, t, S, false); },
      // (the hits, exactly on its time: outside its way through - or, for orange and light blue, by
      // the rule)
      hit(t, sp, mv) {
        for (const g of GATES) {
          if (Math.abs(t - g.ta) > 0.02 || !B.hurts(g.rule, mv) || safeIn(g, sp)) continue;
          return 'gate ' + g.kind;
        }
        return false;
      },
    });
    // as each passes: a rush of air in its pitch (orange and light blue: the omen's tones), the
    // picture punched forward (the dense ones lighter)
    GATES.forEach((g) => {
      const dense = g.ta >= at(50);
      H.sfx(g.ta - 0.02, 'SwipeShort', dense ? 0.1 : 0.16, { rate: KRATE[g.kind] });
      if (g.rule) B.tone(g.ta, g.rule, dense ? 0.12 : 0.2);
      if (!dense) {
        H.sfx(g.tb, 'Spellcast', 0.05);
        TL.impact(g.ta, { amp: 2, zoom: 0.018, dur: 0.18 });
      }
    });
    // ---- no frame and no HUD while the gates come: the soul alone in the corridor (they come back
    // with the box at 51's beat 3, for the all-out blow)
    TL.hudT.to(r0 + 0.25, r0 + 0.65, { a: 0 }, 'inOut').set(r0 + 0.66, { shards: 0 }).set(tShut - 0.01, { shards: 1 }).to(tShut, tShut + 0.3, { a: 1 }, 'out');
    for (let k = 0; k < 3; k++) TL.btn[k].to(r0 + 0.25, r0 + 0.65, { a: 0 }, 'inOut').to(tShut, tShut + 0.3, { a: 1 }, 'out');

    // ---- the hall behind: the corridor's rings - a world's ring born at the door on every beat
    // through 42-43 (under way behind the six rings when the blow flings those away), then a ring with
    // each gate, at its pace: the world in the band round a gate is that gate's own; each ring at its
    // own depth, as its gate is
    const births = [];
    for (let b = 42, k = 0; b < 44; b++) for (let q = 0; q < 4; q++, k++) births.push([at(b, q), SOULS[k % 6]]);
    births[births.length - 1][1] = GATES[0].kind;
    GATES.forEach((g, i) => births.push([g.tb, (GATES[i + 1] || g).kind, g.D]));
    // (no lines at the rings' edges: the gates' walls are the edges)
    H.tunnel(births, r0, at(52), { edge: false, zOf: (d) => zOfS(d / DARR) });
    // ---- the camera: low at the platform, looking up the corridor - the gates come at the lens.
    // One take (user, 2026-10-06 night: the cuts at 46 / 48 / 49 / 50 broke the flight): a steady
    // push from 44's beat 3 to the box's return, drawing in as the gates come faster; over it the eye
    // chases the soul - a little behind it, a third of its way off the middle, banking into its dashes
    // - so it goes through each gate's way with the soul. Back on the plain push by 51's beat 3.
    const tF0 = at(44, 2, 2), tF1 = at(51, 2);
    cut(tF0, { x: 480, y: 318, zoom: 1.12, pitch: 0.2, fov: 0.85 });
    H.move(tF0, at(51, 2, 2), { zoom: 1.6, y: 330, pitch: 0.13 }, (u) => 0.45 * u + 0.55 * u * u);
    {
      const dt = 1 / 120, n = Math.ceil((tF1 - tF0) / dt), xs = [], ys = [], rs = [];
      let fx = TL.heart.at(tF0).x, fy = TL.heart.at(tF0).y, vx = 0;
      for (let k = 0; k <= n; k++) {
        const t = tF0 + k * dt, h = TL.heart.at(t), c = TL.cam2.at(t);
        const lx = fx;
        fx += (h.x - fx) * (1 - Math.exp(-dt / 0.13)); fy += (h.y - fy) * (1 - Math.exp(-dt / 0.13));
        vx += ((fx - lx) / dt - vx) * (1 - Math.exp(-dt / 0.1));
        const w = U.smooth(U.clamp((t - tF0) / 0.35)) * (1 - U.smooth(U.clamp((t - (tF1 - 0.45)) / 0.45)));
        xs.push(c.x + w * 0.34 * (fx - 480)); ys.push(c.y + w * 0.22 * (fy - 340)); rs.push(c.roll - w * U.clamp(vx / 9000, -0.028, 0.028));
      }
      TL.cam2.bake(tF0, dt, { x: xs, y: ys, roll: rs });
    }
    // ---- the speed of it: thin streaks of light rushing out of the door along the walls and past the
    // lens, on the gates' pace (each at its own depth, so they slide with the chasing eye)
    {
      const tS0 = r0 + 0.3, tS1 = tF1 + 0.1, dt = 1 / 120, clk = [0];
      for (let t = tS0; t < tS1; t += dt) clk.push(clk[clk.length - 1] + dt * U.lerp(1.0, 2.3, U.smooth(U.inv(at(45), at(50, 2), t))));
      const ph = (t) => { const f = U.clamp((t - tS0) / dt, 0, clk.length - 1.001), i = Math.floor(f); return U.lerp(clk[i], clk[i + 1], f - i); };
      const N = 64, ZN = -300, SPAN = ZW - ZN;
      const SP = [...Array(N)].map((_, i) => ({ th: U.hash(i * 3.17) * U.TAU, rb: 1.15 + 1.5 * U.hash(i * 7.31), off: U.hash(i * 1.93), w: 0.6 + 0.8 * U.hash(i * 5.7) }));
      const rOf = (z) => 9 ** (-z / ZW); // (a ring's scale at depth z, as the gates')
      const streaks = (ctx, t, S, far) => {
        const env = U.smooth(U.clamp((t - tS0) / 0.4)) * (1 - U.smooth(U.clamp((t - (tF1 - 0.3)) / 0.35)));
        if (env <= 0.01) return;
        const p = ph(t);
        ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#fff1d8';
        for (const q of SP) {
          const z = ZW - (((p * 0.9 + q.off) % 1) * SPAN), z1 = z + 90;
          if ((z > ZK) !== far) continue;
          const a = env * 0.42 * U.clamp((ZW - z) / 260) * U.clamp((z - ZN) / 120);
          if (a <= 0.01) continue;
          const dir = [Math.cos(q.th) * GW, Math.sin(q.th) * GH];
          const pt = (zz) => { const k = q.rb * rOf(zz), x = MV.depthXf(S.cam, zz, far ? ZJ : 0); return [x.ox + x.k * (VP[0] + dir[0] * k), x.oy + x.k * (VP[1] + dir[1] * k)]; };
          const A = pt(z), Bp = pt(z1);
          ctx.globalAlpha = a; ctx.lineWidth = q.w * (1 + 2 * U.clamp(-z / 300));
          ctx.beginPath(); ctx.moveTo(Bp[0], Bp[1]); ctx.lineTo(A[0], A[1]); ctx.stroke();
        }
        ctx.restore();
      };
      TL.add({ t0: tS0, t1: tS1, z: -130, keep: true, name: 'speed, far', draw(ctx, emi, t, S) { if (!S.sil) streaks(ctx, t, S, true); } });
      TL.add({ t0: tS0, t1: tS1, z: 4, keep: true, name: 'speed, near', draw(ctx, emi, t, S) { if (!S.sil) streaks(ctx, t, S, false); } });
    }
    // ================================================================ 52 the fall
    // (from the 14 the duel left it: bar 19)
    // the last slash: the rainbow, all of it in one stroke - one blow, one kill (user, 2026-10-04:
    // no sad face, no reaction shots, no afterblows - the camera rides the trident). 51 from beat 3:
    // the hall goes dark behind him, the trident held up high, still, everything drawn in to its
    // points; from the last off-beat the stroke, the camera riding its points down the arc to the
    // soul; the downbeat frozen a sixteenth; the blow lands on the kick: 14 -> 1 at once, the soul
    // cracked right through (src/finale.js FIN.allOut). The falling line's accents only ring on in
    // it; he holds the stroke; the camera closes on what is left of the soul until the dark
    const f0 = at(52), tKill = at(52, 0, 1), s52 = TL.heart.at(f0);
    MV.FIN.allOut({ tIn: at(51, 2, 2), tSw: at(51, 3, 2), tHit: f0, hold: tKill - f0, soul: [s52.x, s52.y] });
    TL.invulnSpans.push([f0 - 0.05, at(52, 2, 4)]);
    H.hurt(tKill, 1, { vol: 0.8, iframes: 0.6 });
    TL.heart.to(tKill, tKill + 0.05, { crack: 1, y: C[1] + 14 }, 'out');
    TL.impact(tKill, { amp: 8, zoom: 0.03, flash: 0.24, flashCol: [1, 0.15, 0.15], flashDecay: 9, dur: 0.4 });
    [at(52, 0, 3), at(52, 0, 6)].forEach((t, i) => TL.impact(t, { amp: 4 - 2 * i, zoom: 0.015, flash: 0.12, flashCol: [1, 0.15, 0.15], flashDecay: 12, dur: 0.3 }));
    H.move(tKill + 0.27, at(52, 2) - 0.02, { x: s52.x, y: C[1] + 22, zoom: 1.6, roll: 0, pitch: 0, yaw: 0, fov: 0.7 }, 'inOut');
    H.pose(at(52, 1), at(52, 2), 'slam', 'inOut', Object.assign({}, MV.FIN.STRUCK, { crouch: 9, flare: 0.6 }));
    // HP 1: all his fire dies at once. Black; only the cracked soul
    const dark = at(52, 2);
    TL.look2.set(dark, { flames: 0, embers: 0, door: 0, wall: 0, rings: 0, dim: 1, tk: 0, gray: 0 });
    TL.box2.set(dark, { a: 0 });
    TL.hudT.set(dark, { a: 0, shards: 0 });
    for (let k = 0; k < 3; k++) TL.btn[k].set(dark, { a: 0 });
    MV.JARS.forEach((k) => TL.jar[k].set(dark, { glow: 0 }));
    H.sfx(dark, 'Wind', 0.3);
    const hx = TL.heart.at(dark).x;
    cut(dark, { x: hx, y: C[1] + 22, zoom: 1.6 });
    TL.cam2.to(dark, at(53, 3), { zoom: 1.8, y: C[1] + 26 }, 'lin');
    TL.look2.to(dark, dark + 0.5, { letter: 1 }, 'inOut');
    // in his voice, the game's own words for a fallen soul
    const say = (t0, t1, s) => { const e = H.say(t0, t1, s, { anchor: () => [250, 388], voice: 'VoiceAsg', vol: 0.36, step: 0.09, z: 70 }); e.screen = true; };
    say(at(52, 2, 6), at(53, 1, 2), '你现在还不能放弃……');
    say(at(53, 1, 4), at(54, 0, 2), 'Frisk！保持你的决心……');
  });
})();
