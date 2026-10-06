// Act five · the end (silence after the loop point; ending A). Times in seconds from T.mus2End.
//   He kneels behind the empty text box, the trident on the floor before him; his fire is out and
//   the colours are gone from the walls - only the light at the door, the dawn. The game's CHECK:
//   「* 艾斯戈尔 - 攻击 80 防御 80」「* 一位父亲。」
//   His confession in his bubble, whole sentences cut, the rest in the game's own words (read off the
//   recording): 「啊……」「看来这就是结果了。」「我记得我儿子死去的那一天。」「说真的……我不想要力量。」
//   「我不想要伤害任何人。」「这场战争实在太漫长了。」「取走我的灵魂，离开这诅咒之地。」 His faces as the
//   game gives them (the kneel: eyes closed, at rest; the confession: eyes closed, sad).
//   仁慈's shards fly back up out of its slot and the button is whole; the soul on 战斗 - and in the
//   silence the game waits (Metal Gear Solid 3: the last shot is the player's to take); it moves to
//   仁慈. The menu closes. 「……？」 (he looks at the soul: open eyes, the first time) 「人类啊……」
//   「我们可以坐在客厅里，讲讲故事……」「吃着奶油糖派……」「就像……」「一个真正的家庭……」 - and as his words
//   trail off a ring of white friendliness pellets is round him. Cut to black; black. (Flowey is never
//   seen.)
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, FIN = MV.FIN;
  MV.sections.push(() => {
    const E = T.mus2End, e = (s) => E + s;
    const cut = (t, v) => H.shot(t, v), move = (t0, t1, v, ea = 'inOut') => H.move(t0, t1, v, ea);
    // his fire out, the colours gone: only the light at the door; the souls dim in their glass
    TL.look2.to(e(0), e(1.4), { flames: 0, embers: 0, wall: 0.06, door: 0.85, dawn: 1, react: 0, letter: 0.45, rings: 0 }, 'inOut');
    MV.JARS.forEach((k) => TL.jar[k].to(e(0.2), e(1.6), { glow: k === 'empty' ? 0 : 0.15 }, 'inOut'));
    TL.heart.set(e(0), { a: 0, crack: 0, seal: 0, glow: 0, sc: 1 });

    // ---- CHECK, in the game's own format
    FIN.stars(e(0.8), e(3.9), ['艾斯戈尔 - 攻击 80 防御 80', '一位父亲。'], { step: 0.05, gap: 0.5 });
    TL.kneelFace.set(e(1.5), 'face5');

    // ---- his confession (the game's bubble at his right, as the recording has it)
    const BUB = { x: 596, y: 96, w: 206, h: 98, tx: 586, ty: 126, scale: 1, step: 0.07 };
    const say = (t0, t1, lines) => H.bubble(t0, t1, lines, BUB);
    say(e(4.1), e(4.9), ['啊……']);
    say(e(5.0), e(6.5), ['看来', '这就是', '结果了。']);
    say(e(6.6), e(8.5), ['我记得', '我儿子死去的', '那一天。']);
    say(e(8.6), e(10.3), ['说真的……', '我不想要力量。']);
    say(e(10.4), e(11.8), ['我不想要', '伤害任何人。']);
    say(e(11.9), e(13.4), ['这场战争', '实在太漫长了。']);
    say(e(13.5), e(15.5), ['取走我的灵魂，', '离开这', '诅咒之地。']);
    move(e(4.0), e(15.5), { x: 500, y: 206, zoom: 1.2 });

    // ---- 仁慈 whole again: its shards fly back up out of the slot
    const tR0 = e(15.7), tR1 = e(16.8);
    TL.mercyRestore = [tR0, tR1];
    TL.mercyRestored = tR1;
    TL.btn[3].set(tR1 - 0.001, { a: 1, drop: 1, sel: 0 });
    H.sfx(tR0, 'Sparkles', 0.3); H.sfx(tR1, 'Ding', 0.25);
    cut(tR0, { x: 480, y: 300, zoom: 1.02 });
    // ---- the soul on 战斗 - and the game waits
    const tW = e(17.0), tM = e(21.3), tSel = e(21.9);
    TL.heart.set(tW - 0.001, { a: 1 });
    H.onButton(0, tW, tM);
    move(tW, tM, { y: 318, zoom: 1.07 });
    // ---- it moves to 仁慈; selected; the menu closes (the box, the HUD, the soul)
    const [mx, my] = MV.btnPos(3, tM);
    TL.heart.set(tM, { x: mx + 16, y: my + 21 });
    TL.btn[3].set(tM, { sel: 1 });
    TL.box2.to(tSel + 0.1, tSel + 0.4, { a: 0 }, 'in');
    TL.hudT.to(tSel + 0.1, tSel + 0.4, { a: 0 }, 'in');
    for (const k of [0, 3]) TL.btn[k].to(tSel + 0.1, tSel + 0.4, { a: 0 }, 'in');
    TL.heart.to(tSel + 0.1, tSel + 0.3, { a: 0 }, 'in');
    TL.look2.to(tSel + 0.2, tSel + 1.0, { letter: 1 }, 'inOut');

    // ---- his answer (the game's faces: open eyes - he looks at the soul - then the smile)
    TL.kneelFace.set(e(22.3), 'face7');
    say(e(22.3), e(23.2), ['……？']);
    say(e(23.35), e(24.5), ['人类啊……']);
    TL.kneelFace.set(e(24.65), 'face11');
    say(e(24.65), e(26.7), ['我们可以', '坐在客厅里，', '讲讲故事……']);
    TL.kneelFace.set(e(26.85), 'face10');
    say(e(26.85), e(28.2), ['吃着奶油糖派……']);
    say(e(28.35), e(29.2), ['就像……']);
    TL.kneelFace.set(e(29.35), 'face11');
    say(e(29.35), e(30.35), ['一个真正的', '家庭……']);
    cut(e(22.2), { x: 520, y: 156, zoom: 1.34 });
    move(e(22.2), e(30.3), { zoom: 1.46, y: 150 });

    // ---- as the words trail off: the pellets. Then black, and black
    const tPel = e(30.3), tBlack = e(31.4);
    FIN.pellets(tPel, tBlack, { r: 150, n: 24, spread: 0.5 });
    // (their sound, cut from the recording: the whir as they come round him)
    H.sfx(tPel, 'PelletRing', 0.6);
    cut(tPel, { x: 480, y: 190, zoom: 1.1 });
    TL.look2.set(tBlack, { fade: 1 });
  });
})();
