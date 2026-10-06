// Act three · the battle opens (silent, T.cut1 – T.m2), in the 2D battle. As in the game:
// the box widens into the text box, the soul waits on 战斗, four lines of narration (the
// stage answers them: the flattened corridor's walls light up, then dawn seeps through the
// door behind him), his bubble 「人类……很高兴认识你。」「再见。」, the trident drawn from his
// chest (the game's own frames, timed from the recording), and one swing that destroys the
// 仁慈 button. The game's white flash is a pale field with everything black but the
// trident; then black, and the music.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, FL = MV.FL;
  MV.sections.push(() => {
    const c = T.cut1;

    // ---------------------------------------------------------------- the lock (act two's cut-off chord)
    TL.box2.set(c, { cx: FL.box.cx, cy: FL.box.cy, w: FL.box.w + 16, h: FL.box.h + 16, a: 1 }).to(c, c + 0.25, { w: FL.box.w, h: FL.box.h }, 'outExpo');
    TL.heart.set(c, { x: FL.box.cx, y: FL.box.cy, a: 1, sc: 1 });
    TL.impact(c, { amp: 6, zoom: 0.04, flash: 0.14, flashCol: [0.45, 0.42, 0.52], dur: 0.5 });
    H.sfx(c, 'ElecDoor', 0.4); H.sfx(c, 'Slam', 0.3);

    // ---------------------------------------------------------------- the box becomes the text box
    TL.box2.to(c + 0.5, c + 1.25, { cx: FL.menu.cx, cy: FL.menu.cy, w: FL.menu.w, h: FL.menu.h }, 'inOut');
    H.sfx(c + 0.5, 'SwipeShort', 0.25);
    const [fx0, fy0] = MV.btnPos(0, c);
    TL.heart.to(c + 0.45, c + 1.0, { x: fx0 + 16, y: fy0 + 21 }, 'inOut');
    TL.btn[0].set(c + 1.0, { sel: 1 });

    // narration, typed inside the wide box
    const anchor = (t) => { const b = MV.box2At(t); return [b.x + 26, b.y + 20]; };
    const N = { anchor, voice: 'Txt1', vol: 0.26 };
    H.say(c + 1.5, c + 4.0, '（奇异的光芒照亮了房间。）', N);
    H.say(c + 4.2, c + 6.8, '（黎明的曙光穿过了结界。）', N);
    H.say(c + 7.0, c + 9.7, '（看来你的旅途终于到了终点。）', N);
    H.say(c + 9.9, c + 12.3, '（你现在充满了决心。）', N);
    // a strange light: the six souls glow in their glass, the corridor's walls light up
    MV.JARS.forEach((k) => TL.jar[k].to(c + 1.6, c + 2.8, { glow: k === 'empty' ? 0.2 : 1.1 }, 'inOut').to(c + 4.0, c + 5.5, { glow: 0.45 }, 'inOut'));
    H.sfx(c + 1.6, 'Sparkles', 0.3);
    TL.look2.to(c + 1.6, c + 3.4, { wall: 0.2, door: 0.45 }, 'inOut');
    // the corridor's light wave flows on toward the door: the walls at their brightest as the
    // light fills the room (c + 2.5), the door at its brightest as dawn comes through it
    // (~0.41 period later); act four drives it on the music from T.m2
    const P = window.MV_CORRIDOR.P, w0 = c + 2.5;
    TL.wave2.set(c, { u: (c - w0) / P }).to(c, T.m2, { u: (T.m2 - w0) / P }, 'lin');
    // dawn's light through the barrier: warm, from the door behind him
    TL.look2.to(c + 4.2, c + 6.2, { dawn: 0.45, door: 0.95 }, 'inOut');
    TL.look2.to(c + 8.5, c + 11.0, { dawn: 0.2, door: 0.6, wall: 0.14 }, 'inOut');
    // the journey's end: a slow push
    TL.cam2.to(c + 7.0, c + 12.4, { zoom: 1.07, y: 262 }, 'inOut');
    TL.cam2.to(c + 15.6, c + 16.0, { zoom: 1, y: 270 }, 'inOut');
    // determination: the soul beats
    for (let i = 0; i < 3; i++) TL.heart.to(c + 10.6 + i * 0.5, c + 10.7 + i * 0.5, { glow: 1.4, sc: 1.35 }, 'out').to(c + 10.7 + i * 0.5, c + 11.05 + i * 0.5, { glow: 0, sc: 1 }, 'inOut');
    H.sfx(c + 12.0, 'Save', 0.45);

    // ---------------------------------------------------------------- 「人类……很高兴认识你。」「再见。」
    const BUB = { x: 552, y: 58, tx: 530, ty: 92, scale: 1 };
    H.bubble(c + 12.7, c + 14.8, ['人类……', '很高兴认识你。'], BUB);
    H.bubble(c + 14.95, c + 15.9, ['再见。'], Object.assign({}, BUB, { y: 72 }));

    // ---------------------------------------------------------------- the trident (the game's own frames)
    // 1. the red slash at his chest (brandish1, brandish2) and a flash; 2. the brandish loop, the
    //    trident held out, cape swirling (brandish3..13 at 10 fps); 3. the flash: his silhouette
    //    (flashSil) dashes right with afterimages while the trident swings clockwise from
    //    horizontal to straight down; 4. a held beat; 5. it is thrown straight down into 仁慈,
    //    which shatters while the silhouette fades; 6. the pale field sinks through grey to black.
    const tR = c + 16.05, tL = c + 16.5, tF = c + 17.75, tSw = tF + 0.55, tTh = c + 19.0, tHit = tTh + 0.14;
    TL.bossPose.set(tR, 'f:brandish1').set(tR + 0.15, 'f:brandish2');
    H.sfx(tR + 0.15, 'SpearAppear', 0.6);
    TL.impact(tR + 0.3, { amp: 0, flash: 0.7, flashCol: [0.86, 0.85, 0.9], flashDecay: 14, dur: 0.3 });
    H.sfx(tR + 0.3, 'Flash', 0.4);
    for (let i = 3; i <= 13; i++) TL.bossPose.set(tL + (i - 3) * 0.1, 'f:brandish' + i);
    H.sfx(tL + 0.05, 'SwordAppear', 0.3);
    // 3. the flash: a pale field; only his silhouette, the trident and the buttons remain
    TL.bossPose.set(tF, 'f:flashSil');
    TL.look2.set(tF, { sil: 1, silV: 0.8 });
    MV.JARS.forEach((k) => TL.jar[k].set(tF, { a: 0 }));
    TL.hudT.set(tF, { a: 0 });
    TL.box2.set(tF, { a: 0 });
    TL.btn[0].set(tF, { sel: 0 });
    TL.heart.set(tF, { a: 0 });
    H.sfx(tF, 'CineCut', 0.55);
    TL.trident.set(tF, { on: 1, free: 1, x: 18, y: 50, z: 30, rot: 0, yaw: 0, sc: 0.62, len: 1, glow: 0.5, ghost: 0 });
    TL.trident.set(tF + 0.05, { ghost: 4 });
    TL.king.set(tF + 0.05, { ghost: 4 });
    // the dash + the swing (clockwise to straight down), ending above the 仁慈 button
    const mx = MV.btnPos(3, tF)[0] + 55;
    TL.king.to(tF + 0.05, tSw, { x: mx - (128 - 79.5) * 2 }, 'out');
    TL.trident.to(tF + 0.05, tSw, { x: 128, y: -6, rot: -Math.PI / 2, sc: 0.52 }, 'out');
    H.sfx(tF + 0.08, 'Swipe', 0.6);
    TL.trident.set(tSw + 0.1, { ghost: 0 });
    TL.king.set(tSw + 0.1, { ghost: 0 });
    // 5. thrown: it flies straight down, points first, into the button (he stays where he is),
    //    afterimages streaking behind, on through the bottom of the picture
    const len = MV.img('spear').width * 2 * 0.52;
    const yHit = 118 + (FL.btnY - FL.king[1] - len) / 2; // sprite y of the butt when the points touch the button
    TL.trident.set(tTh, { ghost: 6 });
    const vy = (yHit + 6) / (tHit - tTh), yOut = 330, tOut = tHit + (yOut - yHit) / vy;
    TL.trident.to(tTh, tHit, { y: yHit }, 'lin').to(tHit, tOut, { y: yOut }, 'lin').set(tOut, { on: 0, ghost: 0 });
    H.sfx(tTh, 'SwipeShort', 0.6); H.sfx(tTh, 'Arrow', 0.4);
    TL.mercyBreak = tHit;
    H.sfx(tHit, 'BreakBig', 0.7); H.sfx(tHit, 'GlassBreak', 0.45); H.sfx(tHit, 'Impact', 0.5);
    TL.impact(tHit, { amp: 14, zoom: 0.04, dur: 0.6 });
    // the silhouette fades into the pale field, which then sinks to black
    TL.king.to(tHit + 0.05, tHit + 0.45, { a: 0 }, 'in');
    for (let k = 0; k < 3; k++) TL.btn[k].to(tHit + 0.3, tHit + 0.9, { a: 0 }, 'in');
    TL.look2.to(tHit + 0.85, tHit + 1.7, { silV: 0 }, 'in');
    TL.look2.set(tHit + 1.7, { sil: 0, fade: 1, wall: 0, door: 0, purple: 0, embers: 0, flames: 0 });

    // ---------------------------------------------------------------- the music: back to the battle
    const t2 = T.m2;
    TL.bossPose.set(t2, 'idle');
    TL.king.set(t2, { a: 1, x: FL.king[0], y: FL.king[1], ghost: 0 });
    TL.trident.set(t2, Object.assign({ on: 1, free: 0, len: 1, glow: 0.4, ghost: 0 }, MV.TRIDENT_IDLE));
    for (let k = 0; k < 3; k++) TL.btn[k].set(t2, { a: 1 });
    MV.JARS.forEach((k) => TL.jar[k].set(t2, { a: 1 }));
    TL.hudT.set(t2, { a: 1 });
    TL.box2.set(t2, { a: 1, cx: FL.box.cx, cy: FL.box.cy, w: FL.box.w, h: FL.box.h });
    TL.heart.set(t2, { a: 1, x: FL.box.cx, y: FL.box.cy });
    TL.look2.set(t2 - 0.02, { wall: 0.14, door: 0.5, dawn: 0.15, purple: 0.8, embers: 0.7, flames: 1 });
    TL.look2.to(t2 - 0.02, t2 + 0.3, { fade: 0 }, 'out');
  });
})();
