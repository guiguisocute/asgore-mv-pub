// Act four · the battle (music2, ASGORE, 74 bars), part one: bars 0-15, the king's fire - as the game
// throws it: the chains poured out of him in crossing strands, the hail of big
// fireballs over the whole picture, the "!" and the flood of fireballs into the third it marks, the
// ring bigger than the picture that closes into a coil, the orange and blue slashes. His fire is
// never held in by the box - the whole picture burns, the box is one small cell in it. The fire
// stays whole; the soul's way through it is found (src/kingfire.js B.dodge), its grazes show.
// He hardly moves: only on the stabs (the fire moves, the king does not); in the music's silence
// before each stab the picture holds its breath. The camera has one idea a phrase, and each
// phrase's home is lower and nearer than the last, until his horns leave the picture.
//   0     the mask goes on: from below, his name and his HP bar; stab 2 he slams the trident down,
//         the box shuts, fire bursts from the points and blocks of fire bounce into the box
//   1-3   the chains, poured out of him: one column, two, three, crossing on the beats; bar 3 the
//         hail joins from the upper left, over the whole picture
//   4-5   the flood: the game's "!" marks a third of the box (red and yellow by turns) while single
//         strands of his chain pour out of him; then that third floods with fireballs all at once
//         and drains - left on stab 1, right on 5's downbeat, left on 5's beat 3
//   6-7   ACT · 交谈 ①: "* 他的手颤抖了一下。"
//   8-11  the rings: stab 1 a ring bigger than the picture round everything, stab 2 it closes; in
//         the box it winds into a coil and the soul slips out through its gap; two more, the second
//         inside the first
//   12-13 the omen and the four slashes (as the game: orange / blue / orange / blue)
//   14    the hail from both corners at once, the blocks: the height of the king's fire
//   15    ACT · 交谈 ②: a breath of mist; he turns his bowed head toward the yellow container
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, B = MV.B2, FL = MV.FL;
  MV.sections.push(() => {
    const at = T.at;
    const cut = H.shot;
    const box = (v) => Object.assign({}, B.home, v);
    const C = [B.home.cx, B.home.cy];
    // the soul's ground at t: the box as it is then
    const inner = (t) => B.inner(MV.box2At(t));
    // the wide box of the chains, the hands and the hail (the game widens it for them)
    const WIDE = box({ w: 200, h: 150 }), WX0 = WIDE.cx - WIDE.w / 2, WX1 = WIDE.cx + WIDE.w / 2, WY0 = WIDE.cy - WIDE.h / 2, WY1 = WIDE.cy + WIDE.h / 2;
    const stabs = (b) => [at(b, 0, 4), at(b, 0, 8)];
    // the music's silence before each stab of bars 4, 8 and 12: the picture holds its breath (the
    // fire in the air hangs there and rushes on with the blow)
    const HOLDS = [];
    for (const b of [4, 8, 12]) for (const ts of stabs(b)) { HOLDS.push([ts - 0.19, ts]); H.hush(ts - 0.19, ts, { light: b !== 12 }); }
    const warp = B.warp(HOLDS);
    const ALL = []; // (every shot of 0-15: the grazes)
    // the soul's dance (README 脑暴 ①: a soul that only moves when it must reads as a lazy player -
    // no urgency): written on the music first, keys [t, x, y] - it holds each place and dashes to the
    // next, there on the key's time. B.dodge follows it wherever the whole fire lets it, and the
    // fire is laid so that the way on is never where the soul is (the blocks are thrown at it, the
    // chains' next wave closes its diamond, each ring's gap opens on its far side)
    const dance = (keys, dash = 0.17) => (t) => {
      if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
      for (let k = 1; k < keys.length; k++) {
        const [tb, xb, yb] = keys[k];
        if (t > tb) continue;
        const [ta, xa, ya] = keys[k - 1], d = Math.min(dash, tb - ta), e = U.eInOut(U.clamp((t - tb + d) / d));
        return [U.lerp(xa, xb, e), U.lerp(ya, yb, e)];
      }
      const z = keys[keys.length - 1];
      return [z[1], z[2]];
    };
    // (a strong pull and a cheap start: with a weak one the planner sits halfway between two steps
    // of the dance - the cheapest way to be near both - and the dance is lost)
    const CHASE = { lureW: 1.6, startW: 0.06, comfort: 6, speed: 300 };
    // (and a soul moving fast leaves two or three copies of itself behind: src/stage.js)
    TL.dashSpans.push([at(0, 2), at(6) - 0.2], [at(8), at(12)], [at(12, 1), at(15) - 0.1]);

    // ================================================================ the stage answers the music
    const t0 = T.m2;
    TL.look2.set(t0, { react: 1 });
    const acc = [];
    for (const b of [0, 4, 8, 12]) acc.push([at(b, 0, 4), 0.14], [at(b, 0, 8), 0.2]);
    H.waveScore(t0, at(16), 0.3, acc);

    // ================================================================ bar 0 · the mask goes on
    TL.box2.set(t0 + 0.001, B.menuRect());
    TL.heart.set(t0 + 0.001, { a: 0 });
    TL.foe.set(t0, { hp: 3500, max: 3500, pips: 0 });
    // (his face is the battle mask all through: the one monster that does not flinch when struck)
    H.poseSet(t0, 'bow');
    const [st1, st2] = stabs(0);
    // (his bar as the game shows it, split green over red: the green runs in from the first stab
    // and is full on the second, as the box shuts)
    H.target(at(0) - 0.05, st2 + 0.08, { fill: (t) => U.eInOut(U.clamp((t - st1 + 0.06) / (st2 - st1 + 0.06))) });
    H.sfx(at(0) + 0.05, 'Target', 0.4);
    // out of the black: from low down at the text box, him towering over it
    cut(t0, { x: 480, y: 292, zoom: 1.04, pitch: 0.3, fov: 0.95 });
    H.move(t0, st1, { zoom: 1.1, y: 285 }, 'lin');
    // stab 1: right under him, his head and the trident going up, his eyes flash
    cut(st1, { x: 476, y: 168, zoom: 1.5, pitch: 0.34, yaw: -0.12, fov: 0.9 });
    H.move(st1, st2, { zoom: 1.6, y: 158 }, 'out');
    H.pose(st1 - 0.03, st1 + 0.12, 'high', 'outExpo');
    H.eyes(st1 + 0.02, '#ffffff', 0.4);
    TL.trident.to(st1, st1 + 0.15, { glow: 1.2 }, 'out').to(st2 + 0.1, st2 + 0.8, { glow: 0.4 }, 'inOut');
    TL.look2.to(st1, st1 + 0.1, { blurBack: 1.5 }, 'out');
    H.punch(st1, 0.8);
    // stab 2: from above, down it comes; the bar fills, the box shuts; from the points fire bursts
    // out over everything and blocks of fire are flung up to come down bouncing into the box
    cut(st2, { x: 480, y: 300, zoom: 1.18, pitch: -0.3, yaw: 0.05 });
    H.move(st2 + 0.05, at(1) - 0.05, { zoom: 1.08, pitch: -0.14, y: 296 }, 'out');
    H.pose(st2 - 0.04, st2 + 0.06, 'slam', 'outExpo');
    H.pose(st2 + 0.6, at(1) - 0.25, 'raise', 'inOut');
    TL.look2.set(st2, { blurBack: 0 });
    H.boxTo(st2 + 0.06, st2 + 0.2, B.home, 'outExpo');
    TL.heart.set(st2 + 0.16, { a: 1, x: C[0], y: C[1] });
    H.bigHit(st2, { amp: 12, flash: 0.3 }); H.sfx(st2, 'Explosion', 0.45); H.sfx(st2, 'BgFlame', 0.35);
    const bc = MV.spearTip(st2 + 0.06, 0.95), burst = [];
    const toSoul = Math.atan2(C[1] - bc[1], C[0] - bc[0]);
    for (let i = 0; i < 20; i++) { const a = toSoul + ((i + 0.5) / 20) * U.TAU; burst.push({ t0: st2 + 0.04, t1: st2 + 1.3, hr: 5, p: B.lin(st2 + 0.04, bc, [Math.cos(a) * 300, Math.sin(a) * 300]) }); }
    const HB = B.inner(B.home);
    // the soul's dance through 0-3: steps in the box, then in the chains' net a step on each beat
    // inside its diamond and a hop to another on every half bar (the net swung half a cell over:
    // its diamond closes), weaving into the hail on bar 3
    // (the net's diamonds: unswung at x 410 / 480 / 550, y 360 and at x 445 / 515, y 297; swung
    // the other way round - each hop goes to the far one it can reach)
    const DANCE0 = dance([
      [st2 + 0.2, 480, 345], [at(0, 2, 2), 440, 375], [at(0, 3, 0), 525, 360], [at(0, 3, 2), 450, 388],
      [at(1), 480, 382], [at(1, 1), 480, 330], [at(1, 2), 550, 300], [at(1, 3), 550, 336],
      [at(2), 480, 382], [at(2, 1), 480, 330], [at(2, 2), 410, 300], [at(2, 3), 410, 336],
      [at(3), 480, 385], [at(3, 1), 480, 335], [at(3, 2), 430, 360], [at(3, 2, 2), 520, 330], [at(3, 3), 450, 380],
      [at(3, 3, 2), 512, 350], [at(4), 494, 382],
    ]);
    // the blocks are thrown at the soul: each comes down where it was a moment before (it must
    // already be moving on)
    const blocks0 = [at(0, 2, 2), at(0, 2, 3), at(0, 3, 0), at(0, 3, 1), at(0, 3, 2), at(0, 3, 3)].map((tl, i) => {
      const tL = st2 + 0.04 + 0.03 * i, x = U.clamp(DANCE0(tl - 0.3)[0], HB.x0 + 12, HB.x1 - 12);
      return B.lobTo(tL, MV.spearTip(st2, 0.95), [x, HB.y1], tl - tL, { life: tl - tL + 0.7, bounce: 0.45, g: 1100, walls: [HB.x0, HB.x1] });
    });
    H.shots(burst, { name: 'burst', clip: null, z: 20 });
    H.shots(blocks0, { name: 'block', clip: null, z: 21 });
    ALL.push(...burst, ...blocks0);

    // ================================================================ bars 1-3 · the chains, the hail
    H.boxTo(at(1) - 0.25, at(1) - 0.05, WIDE, 'outBack');
    H.sfx(at(1) - 0.25, 'SwipeShort', 0.18);
    // poured out of him without a break: a net of diamonds that stands still while the fire flows
    // down it. (A fireball takes FALL s from his chest to the soul's height.)
    const FALL = (360 - 170) / 150;
    // (user, 2026-10-06: the chains run on unbroken - not waves with a breath between them. The
    // whole net swings half a cell over on every half bar's seam and back on the next, the bend
    // flowing down the chains: the soul's diamond closes on every half bar - 1·8, 2·0, 2·8, 3·0 at
    // its height - and it must hop; README 脑暴 ①)
    const SEAM = [at(1, 2), at(2), at(2, 2), at(3)], SWAY = B.swing(SEAM.map((s) => s - FALL), 35);
    const COLS = [270, 340, 410, 480, 550, 620].map((x) => ({ x, t0: at(0, 2, 2), t1: at(3, 2) - FALL, ph: 0 }));
    const chains = B.helix({ cols: COLS, warp, y0: 170, sway: SWAY });
    H.pourGlow(COLS, 170, { sway: SWAY });
    H.sfx(COLS[0].t0, 'BgFlame', 0.22);
    for (const s of SEAM) H.sfx(s - FALL, 'BgFlame', 0.16);
    // the hail: big fireballs from the upper left over the whole picture, a staggered row on every
    // eighth note, the first through the box on bar 3's downbeat
    const hail3 = B.hail({ t0: at(3, 0), t1: at(3, 3), vel: [138, 220], spacing: 70, warp, seed: 1 });
    for (let k = 0; k < 7; k++) H.sfx(at(2, 3) + k * T.beat * 0.5, 'BgFlame', 0.06);
    H.shots(chains, { name: 'chain', clip: null, z: 19 });
    H.shots(hail3, { name: 'hail', clip: null, z: 22 });
    ALL.push(...chains, ...hail3);
    // he holds the trident up and does not move: the fire pours out of him
    // the camera: low at the box looking up at him, the fire coming down at the lens, one long push;
    // bar 3 back to see the hail over the whole picture
    cut(at(1), { x: 480, y: 300, zoom: 1.06, pitch: 0.16, fov: 0.85 });
    H.move(at(1), at(3) - 0.05, { zoom: 1.2, y: 304, pitch: 0.2 }, 'inOut');
    cut(at(3), { x: 470, y: 280, zoom: 0.95, pitch: 0.06, yaw: 0.04, fov: 0.85 });
    H.move(at(3), at(4) - 0.04, { zoom: 1.0, y: 290 }, 'lin');

    // ================================================================ bars 4-5 · the flood ("!")
    // As the game throws it (the recording, ~128-133 s; user 2026-10-06: the "!" is not a hand - it
    // is a flood of fireballs): a third of the box is marked - its outline and the sheet's big "!",
    // red and yellow by turns - while single strands of his chain pour out of him into the rest; a
    // column of fire runs down the lane's inner edge, and the whole lane floods at once: a dense mass
    // of fireballs comes down into it, stands churning, drains out through the floor. Left, right,
    // left, as the game does it. Here on the music: the first "!" on bar 3's last beat, its flood on
    // stab 1 (it hangs above the lane in the breath before it and comes down with the blow); stab 2
    // marks the right, flooded on 5's downbeat, which marks the left again, flooded on 5's beat 3.
    // The soul is never under a "!" when its flood comes; it weaves round the strands meanwhile.
    const [hs1, hs2] = stabs(4);
    const LW = 76, LANE = { L: [WX0 + 3, WX0 + 3 + LW], R: [WX1 - 3 - LW, WX1 - 3] };
    const FLOODS = [
      { side: 'L', tW: at(3, 3), tF: hs1, seed: 11 },
      { side: 'R', tW: hs2, tF: at(5), seed: 23 },
      { side: 'L', tW: at(5), tF: at(5, 2), seed: 37 },
    ];
    const floodFire = [];
    FLOODS.forEach((f) => {
      const [x0, x1] = LANE[f.side];
      H.warn(f.tW, f.tF - 0.02, [x0, WY0 + 3, LW, WIDE.h - 6], { alt: true, at: 30, dx: f.side === 'L' ? -14 : 14 });
      const mass = B.flood({ lane: [x0, x1], y0: WY0, y1: WY1, tF: f.tF, edge: f.side, warp, seed: f.seed });
      floodFire.push(...mass);
      // it comes down: a roar of his fire, a thud in the floor, the box's frame jolted; the picture
      // knocked toward it
      H.sfx(f.tF - 0.42, 'SwipeShort', 0.14); H.sfx(f.tF - 0.06, 'BgFlame', 0.42); H.sfx(f.tF, 'Impact', 0.3);
      TL.impact(f.tF, { amp: 8, dx: f.side === 'L' ? -1 : 1, dy: 0.5, zoom: 0.03, dur: 0.34 });
      TL.box2.to(f.tF, f.tF + 0.02, { th: 9 }, 'out').to(f.tF + 0.05, f.tF + 0.24, { th: 5 }, 'inOut');
    });
    // the strand between the floods, on the side the soul must keep to (it weaves round it): one
    // rope poured without a break, moved over from the right to the left and back (the bend flows
    // down it) - user 2026-10-06: the chains run on unbroken
    // (it runs on a little past the box's floor and goes out there: over the HUD it only clutters)
    const over = (a, b, c, d) => (te) => U.lerp(a, b, U.eInOut(U.clamp((te - c) / d + 0.5)));
    const sx = (te) => over(528, 432, at(4, 1, 3), 0.36)(te) + over(0, 96, at(4, 3, 3), 0.3)(te);
    const sph = (te) => over(0.1, 0.6, at(4, 1, 3), 0.36)(te) + over(0, -0.25, at(4, 3, 3), 0.3)(te);
    const strands = B.snake({ x: sx, ph: sph, t0: at(3, 2), t1: at(5, 2, 2), warp, y1: 470 });
    H.pourGlow([{ x: 528, xAt: sx, t0: at(3, 2), t1: at(5, 2, 2) }], 170);
    H.shots(strands, { name: 'chain', clip: null, z: 19 });
    H.shots(floodFire, { name: 'flood', clip: null, z: 22 });
    ALL.push(...strands, ...floodFire);
    // he takes the stabs braced, the cape thrown out, and is still after them: the fire moves for him
    H.act(hs1, 'raise', { crouch: 7, flare: 1, lean: -0.05, grot: 0.2, gy: -4 }, { windDur: 0.2, after: 'brace' });
    H.act(hs2, 'high', 'slam', { windDur: 0.18, hold: 0.3, after: 'brace' });
    H.sfx(hs2, 'Explosion', 0.22); H.bigHit(hs2, { amp: 7, flash: 0.12, bw: 0, dur: 0.4 });
    H.pose(at(5, 3, 2), at(6) - 0.05, 'droop', 'inOut');
    // the camera: low, looking up at him over the box, a cut with each flood toward the side it is
    // not on (the soul's), a step nearer each time
    cut(hs1, { x: 488, y: 316, zoom: 1.08, pitch: 0.14, yaw: -0.07, fov: 0.85 });
    cut(hs2, { x: 472, y: 312, zoom: 1.14, pitch: 0.12, yaw: 0.07, fov: 0.85 });
    cut(at(5), { x: 470, y: 320, zoom: 1.2, pitch: 0.15, yaw: 0.08, fov: 0.85 });
    cut(at(5, 2), { x: 490, y: 326, zoom: 1.28, pitch: 0.16, yaw: -0.08, fov: 0.85 });
    H.move(at(5, 2), at(6) - 0.3, { zoom: 1.32, y: 330 }, 'lin');
    H.move(at(6) - 0.3, at(6) - 0.05, { zoom: 1, x: 480, y: 270, pitch: 0, yaw: 0, fov: 0.7 }, 'inOut');

    // the soul's way, 0-5: found through all of it, following its dance. Bars 3-5: out of the marked
    // third before each flood, round the strand on its side; across the middle as each flood drains
    const DANCE4 = dance([
      [at(4, 0, 2.6), 500, 380], [at(4, 1), 486, 352], [at(4, 1, 2), 566, 318], [at(4, 2), 488, 392],
      [at(4, 2, 2), 560, 360], [at(4, 3), 470, 330], [at(4, 3, 2), 420, 372],
      [at(5), 470, 350], [at(5, 0, 2), 398, 320], [at(5, 1), 466, 392],
      [at(5, 1, 2), 540, 348], [at(5, 2), 520, 300], [at(5, 2, 2), 562, 360], [at(5, 3), 500, 390], [at(5, 3, 2), 480, 345],
    ], 0.14);
    B.dodge(st2 + 0.2, at(4, 0, 2.6), burst.concat(blocks0, chains, hail3, strands, floodFire), Object.assign({ box: inner, lure: DANCE0 }, CHASE));
    B.dodge(at(4, 0, 2.6), at(6) - 0.24, hail3.concat(strands, floodFire), Object.assign({ box: inner, lure: DANCE4 }, CHASE));
    // ================================================================ bars 6-7 · ACT · 交谈 ①
    const a6 = at(6);
    H.textBox(a6 - 0.15, at(7, 3) + 0.15);
    H.onButton(1, a6 + 0.05, at(6, 1));
    H.list(at(6, 0, 1), at(6, 1), [[0, 0, '* 查看'], [1, 0, '* 交谈']], { pick: 1, from: 0, tPick: at(6, 0, 2), tSel: at(6, 0, 3) + 0.05 });
    H.lines([
      [at(6, 1), at(7, 0) - 0.05, ['你轻声告诉艾斯戈尔你并不想', '和他战斗。']],
      [at(7, 0), at(7, 3) + 0.1, '他的手颤抖了一下。'],
    ]);
    TL.heart.set(at(6, 1) + 0.15, { a: 0 }).set(at(7, 3) + 0.3, { a: 1, x: C[0], y: C[1] });
    // as the line comes (the game's own words: his hands tremble for a moment - the only time he
    // trembles): the trident shakes in his fists; he bows his head; the world behind him darkens;
    // the camera comes round to him, slowly, the jars sliding past behind
    const tr0 = at(7, 0, 2);
    H.pose(tr0, tr0 + 0.2, 'droop', 'out', { trem: 2.2 });
    H.pose(at(7, 1, 2), at(7, 2, 2), 'bow', 'inOut', { trem: 1.2 });
    TL.look2.to(tr0, at(7, 1), { shade: 0.55 }, 'inOut');
    H.move(at(6, 1), at(7, 0), { y: 236, zoom: 1.1, yaw: -0.12 }, 'inOut');
    H.move(tr0, at(7, 2), { x: 472, y: 170, zoom: 1.5, yaw: 0.16, pitch: 0.12 }, 'inOut');
    H.sfx(tr0, 'Drone', 0.12);
    // he straightens, the light returns
    H.pose(at(7, 3), at(8) - 0.05, 'idle', 'inOut');
    TL.look2.to(at(7, 3), at(8) - 0.2, { shade: 0 }, 'inOut');
    H.move(at(7, 3), at(8) - 0.05, Object.assign({}, B.CAM_HOME), 'inOut');

    // ================================================================ bars 8-11 · the rings
    const [rs1, rs2] = stabs(8);
    H.act(rs1, 'raise', 'high', { windDur: 0.2, after: null });
    H.eyes(rs1 + 0.02, '#ffffff', 0.35);
    H.tipFire(rs1, rs2, { n: 9 });
    H.act(rs2, 'high', 'slam', { windDur: 0.06, hold: 0.4, after: 'high' });
    TL.trident.to(rs1 - 0.1, rs1 + 0.1, { glow: 1 }, 'out').to(rs2 + 0.1, rs2 + 0.7, { glow: 0.4 }, 'inOut');
    H.sfx(rs1, 'Spellcast', 0.3); H.sfx(rs2, 'BgFlame', 0.4); H.hit(rs2, 0.9);
    // ring 1: round everything on stab 1, closing from stab 2; then a ring every two beats, each
    // turning the other way - two or three closing at once, a way out every half bar, side to side
    // (user, 2026-10-06 late: tighter, denser, harder - the same rings)
    // (each ring's gap opens on the far side from where the soul is as it closes in - the soul runs
    // round to it and slips out: the gap's middle is set where the dance will be when the ring's
    // radius comes down to that point's distance from the middle; README 脑暴 ①)
    const RC = [B.home.cx, B.home.cy], RN = 52, RG = 5, RR0 = 470, RR1 = 4;
    const RING_SPEC = [
      { t0: rs1, tc: rs2, t1: at(9, 2), spin: 0.8, to: [424, 374] },
      { t0: at(8, 3), tc: at(9), t1: at(10), spin: -0.9, to: [536, 316] },
      { t0: at(9, 1), tc: at(9, 2), t1: at(10, 2), spin: 1.0, to: [428, 314] },
      { t0: at(9, 3), tc: at(10), t1: at(11), spin: -1.0, to: [538, 372] },
      { t0: at(10, 1), tc: at(10, 2), t1: at(11, 2), spin: 1.1, to: [430, 368] },
      { t0: at(10, 3), tc: at(11), t1: at(11, 3, 2), spin: -1.15, to: [532, 318] },
    ];
    RING_SPEC.forEach((s) => {
      const r = Math.hypot(s.to[0] - RC[0], s.to[1] - RC[1]);
      s.tx = s.tc + ((RR0 - r) / (RR0 - RR1)) * (s.t1 - s.tc);
      s.a0 = Math.atan2(s.to[1] - RC[1], s.to[0] - RC[0]) - s.spin * (s.tx - s.t0) - (1 - RG / (2 * RN)) * U.TAU;
    });
    const RINGS = RING_SPEC.map((s) => B.coil({ t0: s.t0, tc: s.tc, t1: s.t1, R0: RR0, R1: RR1, spin: s.spin, a0: s.a0, n: RN, gapN: RG, appear: 0.28, warp }));
    RINGS.forEach((r, i) => { H.shots(r, { name: 'ring', clip: null, z: 20 }); ALL.push(...r); H.sfx(r[0].t0, 'Spellcast', i ? 0.2 : 0); });
    // he holds the trident up through it all, straining
    H.pose(at(11, 3), at(12) - 0.05, 'droop', 'inOut');
    // the camera: wide on stab 1, the ring round everything; from above as it closes in on the box
    // (a ring of fire on a floor), sinking with it; level and low as the soul slips out, nearer
    cut(rs1, { x: 480, y: 300, zoom: 0.9, pitch: 0.12, fov: 0.85 });
    H.move(rs2, at(9, 1), { zoom: 0.98, y: 310 }, 'in');
    cut(at(9, 1), { x: C[0], y: C[1] - 10, zoom: 1.3, pitch: -0.42 });
    H.move(at(9, 1), at(9, 3), { zoom: 1.46, pitch: -0.26, y: C[1] }, 'in');
    cut(at(9, 3), { x: 480, y: 300, zoom: 1.2, pitch: 0.18, yaw: -0.06, fov: 0.85 });
    H.move(at(9, 3), at(12) - 0.05, { zoom: 1.3, y: 298, pitch: 0.22, yaw: 0.04 }, 'inOut');
    // the soul: still through the two stabs, a step on each beat after, then round to each gap
    // (still in each breath before a stab; between the rings a step on every beat)
    // (bar 8 as before - still through the stabs, a step on each beat; then at each ring's way out
    // as it comes down to the soul, and on out past where it was - into the next ring's way)
    const keys8 = [[at(8), 480, 345], [at(8, 1) - 0.2, 480, 345], [at(8, 1, 2), 515, 330], [at(8, 2) - 0.2, 515, 330], [at(8, 2, 2), 455, 365], [at(8, 3), 500, 382], [at(8, 3, 2), 470, 360]];
    RING_SPEC.forEach((s) => {
      const d = [s.to[0] - RC[0], s.to[1] - RC[1]], L = Math.hypot(d[0], d[1]);
      keys8.push([s.tx - 0.1, s.to[0], s.to[1]], [s.tx + 0.08, s.to[0] + (d[0] / L) * 14, s.to[1] + (d[1] / L) * 10]);
    });
    keys8.push([at(12) - 0.1, 480, 345]);
    const DANCE8 = dance(keys8, 0.16);
    B.dodge(at(8), at(12) - 0.1, [].concat(...RINGS), Object.assign({ box: inner, lure: DANCE8 }, CHASE));

    // ================================================================ bars 12-13 · the omen, the slashes
    // As the game does it: a white flash and he is his white-outlined silhouette; his eyes flash the
    // colours to come, in order, silently - and at once the slashes, back to back on the beat: the
    // trident shows the colour, one frame of the huge U crescent, one of its bubbles, the next
    // colour. The soul moves through orange and stands still under the blue.
    cut(at(12), {});
    H.hGo(at(12, 1), C[0] - 55, C[1] + 6, 160);
    const RUN = ['orange', 'aqua', 'orange', 'aqua'];
    H.omen(at(12), [[at(12, 0, 4), RUN[0]], [at(12, 0, 8), RUN[1]], [at(12, 0, 10), RUN[2]], [at(12, 0, 12), RUN[3]]], null, { eyeSc: 2 });
    cut(at(12, 0, 4), { x: 480, y: 150, zoom: 1.45, pitch: 0.24, yaw: 0.14 });
    TL.look2.set(at(12, 0, 4), { shade: 0.5 });
    cut(at(12, 0, 8), { x: 480, y: 140, zoom: 1.55, pitch: -0.2, yaw: -0.14 });
    cut(at(12, 0, 12), { x: 480, y: 248, zoom: 1.12, pitch: 0.08 });
    TL.look2.set(at(12, 0, 12), { shade: 0 });
    const F4 = 4 / 30, US = [at(13, 0, 2), at(13, 0, 6), at(13, 0, 10), at(13, 0, 14)];
    US.forEach((t, i) => H.slash({ t, rule: RUN[i], dir: i % 2 ? -1 : 1, wind: i ? US[i] - US[i - 1] - F4 : 0.42, amp: 11 }));
    // (the trident rising for the first: the spear's own sound)
    H.sfx(US[0] - 0.42, 'SpearRise', 0.32);
    // the soul runs the whole box through each orange (it must be moving) and stands dead still under
    // each blue
    const xs = [C[0] - 55, C[0] + 55, C[0] + 55, C[0] - 55, C[0] - 55];
    US.forEach((t, i) => {
      if (RUN[i] === 'orange') H.hPath(t - 0.24, t + 0.22, (tt) => [U.lerp(xs[i], xs[i + 1], U.smooth((tt - t + 0.24) / 0.46)), C[1] + 6]);
    });
    // a hard cut with every slash, to the side its crescent swings from, a little nearer each time
    US.forEach((t, i) => { const d = i % 2 ? -1 : 1; cut(t - 0.02, { x: 480 + d * 10, y: 258, zoom: 1.16 + i * 0.04, pitch: 0.08 + 0.02 * i, yaw: -d * 0.12, fov: 0.8 }); });

    // ================================================================ bar 14 · the hail from both corners
    const k14 = at(14, 0, 3);
    H.boxTo(at(13, 3, 3), at(14) - 0.02, WIDE, 'outBack');
    H.act(k14, 'high', 'slam', { windDur: 0.25, hold: 0.3, after: 'raise' });
    H.tipFire(at(13, 3, 3), k14, { n: 8 });
    H.bigHit(k14, { amp: 10, flash: 0.2, bw: 0 }); H.sfx(k14, 'Explosion', 0.35);
    const hailL = B.hail({ t0: at(14, 1), t1: at(14, 3), vel: [150, 236], spacing: 92, warp, seed: 3 });
    const hailR = B.hail({ t0: at(14, 1, 2), t1: at(14, 3, 2), vel: [-150, 236], spacing: 92, warp, seed: 7 });
    for (let k = 0; k < 6; k++) H.sfx(at(13, 3, 2) + k * T.beat * 0.5, 'BgFlame', 0.07);
    const HW = B.inner(WIDE);
    // the soul zig-zags across the whole width through the two hails; the blocks are thrown at it
    // (still until the last blue slash has gone by: it stands where the last orange run left it)
    const DANCE14 = dance([
      [at(13, 3, 3) + 0.02, C[0] - 55, C[1] + 6], [at(14, 0, 1), C[0] - 55, C[1] + 6], [at(14, 0, 3), 480, 352], [at(14, 1, 2), 430, 384], [at(14, 2, 1), 528, 340],
      [at(14, 3, 0), 446, 300], [at(14, 3, 3), 530, 390], [at(15) - 0.12, 490, 360],
    ], 0.16);
    const blocks14 = [at(14, 1, 3), at(14, 1, 4), at(14, 0, 9), at(14, 0, 10), at(14, 0, 12), at(14, 0, 13), at(14, 0, 14), at(14, 0, 15)].map((tl, i) => {
      const tL = k14 + 0.02 + 0.03 * i, x = U.clamp(DANCE14(tl - 0.3)[0], HW.x0 + 12, HW.x1 - 12);
      return B.lobTo(tL, MV.spearTip(k14, 0.95), [x, HW.y1], tl - tL, { life: tl - tL + 0.7, bounce: 0.45, g: 1100, walls: [HW.x0, HW.x1] });
    });
    const storm = hailL.concat(hailR, blocks14).map((s) => Object.assign(s, { t1: Math.min(s.t1, at(15) - 0.1) }));
    H.shots(hailL.concat(hailR), { name: 'hail', clip: null, z: 22 });
    H.shots(blocks14, { name: 'block', clip: null, z: 21 });
    ALL.push(...storm);
    B.dodge(at(13, 3, 3) + 0.02, at(15) - 0.12, storm, Object.assign({ box: inner, lure: DANCE14 }, CHASE));
    // the camera: the nearest home, his horns out of the picture; it does not move
    cut(at(14) - 0.02, { x: 480, y: 262, zoom: 1.36, pitch: 0.24, fov: 0.85 });
    // after it all: the trident sinks
    H.pose(at(14, 3, 2), at(15) - 0.05, 'droop', 'inOut');

    // the grazes, wherever the fire skimmed the soul
    H.graze(st2 + 0.2, at(6) - 0.24, ALL);
    H.graze(at(8), at(12) - 0.1, ALL);
    H.graze(at(13, 3, 3) + 0.02, at(15) - 0.12, ALL);

    // ================================================================ bar 15 · ACT · 交谈 ②, toward the jar
    const a15 = at(15);
    H.textBox(a15 - 0.08, at(15, 3), B.home, { dur: 0.15 });
    H.onButton(1, a15, a15 + 0.3);
    H.list(a15 + 0.05, a15 + 0.3, [[0, 0, '* 查看'], [1, 0, '* 交谈']], { pick: 1, tPick: a15 + 0.12, tSel: a15 + 0.24 });
    H.lines([[a15 + 0.32, at(15, 3), ['他的呼吸声有', '一丝紊乱。']]]);
    TL.heart.set(a15 + 0.3, { a: 0 }).set(at(16), { a: 1, x: C[0], y: C[1] });
    // the gap: a breath of mist; then his bowed head turns toward the yellow container, which
    // answers; the crane swings round to his left, following his look along the jars
    H.move(a15, at(15, 2), { x: 480, y: 190, zoom: 1.35, pitch: 0.05, yaw: 0 }, 'inOut');
    H.pose(a15, at(15, 1), 'droop', 'inOut');
    H.breath(at(15, 1) + 0.1);
    TL.look2.to(at(15, 1), at(15, 2), { shade: 0.45 }, 'inOut');
    H.pose(at(15, 2), at(15, 3, 2), 'bow', 'inOut', { htilt: -0.14, hx: -7, lean: -0.04 });
    TL.jar.yellow.to(at(15, 2, 2), at(15, 3, 2), { glow: 1.4 }, 'inOut');
    H.move(at(15, 2), at(16) - 0.02, { x: 404, y: 196, zoom: 1.32, yaw: 0.3, pitch: 0.08 }, 'inOut');
    H.sfx(at(15, 3), 'Sparkle', 0.25);
  });
})();
