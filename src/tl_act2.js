// Act two · the cage (music1, Bergentrückung, 8 bars). Every bar is four staccato chords
// (16ths 0 2 4 6) and a held chord struck on beat 3 (16th 8): four snaps, one breath.
//   0-1  the soul leaves Frisk and hangs before them; from the held chord the camera slowly
//        swings off the axis: the room was never a picture but a long white tube, and he stood
//        far down it
//   2-3  the deep darkness at the corridor's end comes forward - smoothly, unstoppably,
//        growing as it nears - and swallows the corridor, him, the jars, Frisk, the white
//   4    what is left of the white is pressed and gathered into a small square round the
//        soul while the camera turns to face it: the box, the battle's UI. The 2D battle
//        takes the picture from here (it is the same picture)
//   5    purple fire takes the dark; the jars rise out of it onto their pedestals
//   6    he stands there as himself; a line of light climbs him into his robed battle form
//   7    the HUD lands; bar 8's cut-off chord locks the box (src/tl_act3.js)
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, LAY = MV.LAY, FL = MV.FL;
  MV.sections.push(() => {
    const at1 = T.at1;
    const st = (b, k) => at1(b, 0, k * 2); // staccato k (0..3) of bar b
    const held = (b) => at1(b, 0, 8);
    const [fx, fy, fz] = LAY.frisk;
    TL.lightDir.set(0, { x: 0.5, y: 0.75, z: 0.45 });

    // ---------------------------------------------------------------- bars 0-1: the soul, the slow turn
    // it flashes at Frisk's chest, then hangs just before them at its own small size
    const chest = [fx, fy + 32, fz + 10], SOUL = [fx, fy + 92, fz + 60];
    TL.soul.set(st(0, 0), { x: chest[0], y: chest[1], z: chest[2], a: 1, sc: 1 });
    TL.soul.set(st(0, 1), { a: 0 });
    TL.soul.set(st(0, 2), { a: 1 });
    TL.soul.set(st(0, 3), { a: 0 });
    TL.soul.set(held(0) - 0.06, { a: 1 });
    TL.soul.to(held(0), held(0) + 0.6, { x: SOUL[0], y: SOUL[1], z: SOUL[2] }, 'outExpo');
    H.sfx(st(0, 0), 'Noise', 0.35); H.sfx(st(0, 2), 'Noise', 0.35);
    H.sfx(held(0), 'BattleFall', 0.5);
    // the light stops on its white phase
    TL.light.set(T.m1, { auto: 0, wt: T.m1, k: 1 });
    MV.JARS.forEach((k) => TL.jar[k].to(st(0, 0), held(0), { glow: 0.15 }, 'out'));
    // the eye drifts off the axis and round: the picture turns out to be a corridor
    const tilt = H.eye([210, 70, 520], [-40, -130, -620], 40, -0.05);
    H.cam(held(0) - 0.05, held(1) + 0.3, tilt, 'inOut');
    H.sfx(held(0), 'Pullback', 0.3);
    H.look(held(0), held(1), { unlit: 0, bloom: 0.08, th: 1.3, vig: 0.28, cap: 0.72, fog: 0.0001 }, 'inOut');

    // ---------------------------------------------------------------- bars 2-3: the darkness comes
    // its front sweeps from beyond the door to just behind the soul; the walls beyond it are
    // gone, and he, the jars and Frisk break up into drifting voxels as it reaches them
    // Its distance from the soul shrinks at a steady rate (log distance: its size in the picture
    // grows evenly, so it is seen coming from the first beat instead of popping up halfway), and
    // its front is soft: the walls sink into the dark before it, the far end's gloom deepening first
    const zEnd = SOUL[2] - 30, zb0 = MV.TUBE.zOf(MV.TUBE.D_TIP1 + 100);
    const D0 = SOUL[2] - zb0, D1 = SOUL[2] - zEnd;
    const logIn = (u) => (D0 - D0 * (D1 / D0) ** U.smooth(u)) / (D0 - D1);
    TL.corr.set(st(2, 0) - 0.01, { zb: zb0, soft: 0 });
    TL.corr.to(st(2, 0) - 0.01, st(2, 2), { soft: 0.45 }, 'inOut');
    TL.corr.to(st(2, 0), held(3), { zb: zEnd }, logIn);
    const reach = (z) => { for (let t = st(2, 0); t < held(3); t += 1 / 120) if (TL.corr.at(t).zb >= z) return t; return held(3); };
    const swallow = (tr, z) => { const t = reach(z); tr.to(t, t + 0.9, { gone: 1 }, 'out'); H.sfx(t, 'Vaporized', 0.12); };
    swallow(TL.asg, TL.asg.at(T.m1).z + 20);
    MV.JARS.forEach((k) => swallow(TL.jar[k], TL.jar[k].at(T.m1).z + 15));
    swallow(TL.frisk, fz + 15);
    H.pal(st(2, 0), held(2), { corridor: 0, black: 1 }, 'inOut');
    H.sfx(st(2, 0), 'Bigdoor', 0.35); H.sfx(st(2, 0), 'Drone', 0.3);
    // the camera leans in after it, a touch on every staccato
    H.cam(held(1) + 0.3, held(3), H.eye([150, 40, 470], [-10, -80, -300], 40, -0.03), 'inOut');
    for (const b of [2, 3]) for (let k = 0; k < 4; k++) H.punch(st(b, k), 0.22);

    // ---------------------------------------------------------------- bar 4: gathered into the box
    // the white left between the soul and the mouth is pressed thin along the corridor and its
    // section drawn in round the soul, while the camera pulls back to face it and flattens to
    // the 2D battle's view (MV.FLAT_CAM); on the held chord it is the box
    const BOX_Y = MV.toVox(0, FL.box.cy)[1];
    TL.corr.set(0, { zc: SOUL[2] });
    TL.corr.to(st(4, 0) - 0.1, held(4), { kz: 0.015, sq: 1, cy: BOX_Y }, 'inOut');
    // (the long white stretch behind the mouth is not part of it: it goes as the press begins)
    TL.corr.to(st(4, 0) - 0.3, st(4, 0) + 0.1, { nearA: 0 }, 'in');
    TL.soul.to(st(4, 0) - 0.1, held(4), { x: 0, y: BOX_Y, sc: 2 }, 'inOut');
    H.cam(held(3), held(4), MV.FLAT_CAM, 'inOut');
    H.look(held(3), held(4), { unlit: 1, bloom: 0, vig: 0, fog: 0, shadow: 0, grain: 0 }, 'inOut');
    for (let k = 0; k < 4; k++) { H.punch(st(4, k), 0.3); H.sfx(st(4, k), k % 2 ? 'Impact' : 'Slam', 0.16); }
    // its edges become the box's frame (the 2D box's 5 px line = 10 units)
    TL.cage.set(0, { a: 0 });
    TL.cage.set(held(4) - 0.3, { x: 0, y: BOX_Y, z: SOUL[2], h: FL.box.w, w: 10, edge: 1, pulse: 0 });
    TL.cage.to(held(4) - 0.3, held(4), { a: 1 }, 'in');
    TL.corr.to(held(4) - 0.1, held(4) + 0.1, { a: 0 }, 'in');
    H.sfx(held(4), 'ElecDoor', 0.35);
    // the 2D battle takes the same picture
    const tSw = held(4) + 0.3;
    TL.flat.set(tSw, 1);
    TL.look2.set(tSw, { wall: 0, door: 0, purple: 0, embers: 0, flames: 0, fade: 0 });
    TL.box2.set(tSw, { cx: FL.box.cx, cy: FL.box.cy, w: FL.box.w, h: FL.box.h, a: 1 });
    TL.heart.set(tSw, { x: FL.box.cx, y: FL.box.cy, a: 1, sc: 1 });
    TL.king.set(tSw, { a: 0, ow: 0, wipe: -1e4 });
    TL.bossPose.set(tSw, 'f:brandish0'); // the robed form, as the game shows him before he draws the trident
    MV.JARS.forEach((k) => TL.jar[k].set(tSw, { a: 0, jy: 320, glow: 0.4 }));

    // ---------------------------------------------------------------- bar 5: the purple fire, the jars
    TL.look2.to(st(5, 0) - 0.05, held(5), { flames: 1, purple: 0.8, embers: 0.7 }, 'out');
    H.sfx(st(5, 0), 'BgFlame', 0.4);
    const RISE = [['empty', 'purple'], ['orange', 'blue'], ['yellow', 'aqua'], ['green']];
    RISE.forEach((keys, k) => {
      const t1 = st(5, k);
      keys.forEach((key) => TL.jar[key].set(t1 - 0.22, { a: 1 }).to(t1 - 0.22, t1 + 0.08, { jy: 0 }, 'outBack'));
      H.sfx(t1, 'SpearRise', 0.22);
    });

    // ---------------------------------------------------------------- bar 6: the king
    // he stands there as himself, then the line of light climbs him (the held chord)
    TL.king.set(st(6, 0), { x: FL.king[0], y: FL.king[1], a: 1, ow: 0, wipe: FL.king[1] });
    TL.king.to(st(6, 0), st(6, 2), { ow: 1 }, 'inOut');
    const tw0 = held(6) - 0.05, tw1 = held(6) + 0.55;
    TL.king.to(tw0, tw1, { wipe: FL.king[1] - 262 }, 'inOut');
    TL.king.set(tw1 + 0.01, { ow: 0, wipe: -1e4 });
    H.sfx(tw0, 'Power', 0.4);

    // ---------------------------------------------------------------- bar 7: the HUD lands
    for (let k = 0; k < 4; k++) {
      TL.btn[k].set(0, { a: 0, drop: 0 });
      TL.btn[k].set(st(7, k) - 0.18, { a: 1, drop: 0 });
      TL.btn[k].to(st(7, k) - 0.18, st(7, k) + 0.12, { drop: 1 }, 'out');
    }
    TL.hudT.set(0, { a: 0, nameA: 0, lvA: 0, hpA: 0, numA: 0 });
    TL.hudT.set(held(7) - 0.05, { a: 1 });
    TL.hudT.to(held(7) - 0.05, held(7) + 0.25, { nameA: 1 }, 'out');
    TL.hudT.to(held(7) + 0.08, held(7) + 0.38, { lvA: 1 }, 'out');
    TL.hudT.to(held(7) + 0.16, held(7) + 0.46, { hpA: 1 }, 'out');
    TL.hudT.to(held(7) + 0.24, held(7) + 0.54, { numA: 1 }, 'out');
  });
})();
