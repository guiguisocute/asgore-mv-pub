// Act four, part four: bars 53-60 - the memory, and the return. His face is the battle mask all
// through (user, 2026-10-04: it never changes in the fight).
//   53    (the dark after the fall, his voice: src/tl_act4c.js)
//   54-55 ITEM · 派, unhurried: the HUD comes back up out of the dark, the soul walks the list on
//         the music box's notes; 「* 你吃掉了奶油糖果派。」「* 你的HP满了。」 while the bar fills
//   55-60 「* 它的香味令艾斯戈尔想起了什么……」: a warm light finds him in the dark; then the memories,
//         told the way the game tells its intro - three paintings in the dark above the text box,
//         slow pans, long crossfades, golden petals; only the game's own lines below, no menu
//         between them: Toriel and the pie (his ATTACK, DEFENSE fall) / 交谈 ③ 「* 你坚定地叫艾斯戈尔
//         不要继续战斗。」「* 他的脑海中闪过一段回忆……」 - the game's own painting of the two children
//         with the golden flowers (his ATTACK, DEFENSE fall again) / the throne room, climbed from
//         the flowers he tends (one place among them bare) up to the thrones, one under a sheet
//   60    ACT · 交谈 ④ 「* 看来谈话不会再有用了。」 - beat 3, the drums: his grip hard, the six colours
//         in his eyes, the trident a rainbow again, the target line once more ("phase two"); beat 4
//         the box shuts. (The six ribbons, and 61-73 - the grip, the soul out of the frame, the six
//         answering it up on their jars, the last blow: src/tl_act4e.js)
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, B = MV.B2, F = MV.F, D = MV.D, FIN = MV.FIN, BL = MV.BLOW, FL = MV.FL;
  const HEX = MV.COL.S, SOULS = MV.SOULS, R = Math.round;
  const at = (b, k = 0, s = 0) => T.at(b, k, s);
  const cut = (t, v) => H.shot(t, v), move = (t0, t1, v, e) => H.move(t0, t1, v, e);
  const C = [B.home.cx, B.home.cy], MENU = B.menuRect();

  MV.sections.push(() => {
    // ================================================================ 53 · what carries on through the dark
    const t53 = at(53);
    TL.kingFace.set(t53, null);
    TL.bossPose.set(t53, 'idle');
    TL.tridentBands.set(t53, { yellow: 0, green: 0, purple: 0, blue: 0, orange: 0, aqua: 0, rb: 0, flow: 0 });
    TL.tridentCol.set(t53, null);
    TL.trident.set(t53, { glow: 0.25, ghost: 0 });
    TL.king.set(t53, { breathe: 1 });
    TL.look2.set(t53, { react: 0, sepia: 0, gray: 0, blurBack: 0, blurJars: 0, blurKing: 0, blurFire: 0, shade: 0, wind: 0, tk: 0 });
    TL.foe.set(t53, { hp: 2438, max: 3500, pips: 0 });
    // (in the dark he stands, the trident lowered)
    H.pose(at(53, 2), at(54), 'idle', 'inOut', { grot: -0.14, gy: 7 });

    // ================================================================ 54-55 · ITEM · 派, unhurried
    // (his voice gone) the HUD comes back up out of the dark: HP 1, the soul cracked
    const tH = at(54, 0, 2);
    TL.hudT.set(tH - 0.002, { shards: 1 }).to(tH, tH + 0.7, { a: 1 }, 'out');
    for (let k = 0; k < 3; k++) TL.btn[k].to(tH, tH + 0.7, { a: 1 }, 'out');
    TL.box2.set(tH - 0.002, Object.assign({ a: 0, rot: 0, round: 0, fill: 1, fa: 1, ak: 0, th: 5 }, MENU)).to(tH, tH + 0.7, { a: 1 }, 'out');
    TL.look2.to(tH, tH + 0.9, { letter: 0.45 }, 'inOut');
    cut(tH, { x: 480, y: 274, zoom: 1.03 });
    move(tH, at(55, 3, 2), { y: 270, zoom: 1 }, 'inOut');
    // the soul on 物品 as the menu comes back; the list; down to 派 on the music box's notes
    H.onButton(2, tH, at(54, 2, 2));
    TL.heart.set(tH - 0.001, { a: 1, glow: 0, sc: 1 }).set(at(54, 2, 2), { a: 0 });
    H.list(at(54, 2, 2), at(55, 0, 1), [[0, 0, '* 螃果'], [1, 0, '* 太空食物'], [0, 1, '* 派'], [1, 1, '* 垃圾食品'], [1, 2, '  第一页']], { pick: 2, from: 0, tPick: at(54, 3, 2), tSel: at(55) });
    // eaten; the bar fills, slowly, as the second line is typed
    const tEat = at(55, 0, 2), EAT = '你吃掉了奶油糖果派。', ty = H.typeTimes(tEat, EAT, 0.06), tFill = ty[ty.length - 1] + 0.3;
    H.sfx(tEat, 'Swallow', 0.4);
    FIN.stars(tEat, at(55, 3, 2), [EAT, '你的HP满了。'], { step: 0.06, gap: 0.3 });
    TL.hudT.to(tFill, tFill + 0.9, { hp: 20 }, 'inOut');
    H.sfx(tFill, 'Heal', 0.5);
    // 55 beat 4: the smell reaches him - a warm light finds him in the dark (his head lifts a
    // little); the painting comes up over him
    const tS = at(55, 3, 2);
    H.lines([[tS, at(56, 2, 2), ['它的香味令艾斯戈尔想起了', '什么……']]], { step: 0.06 });
    TL.look2.to(tS, at(56, 0, 2), { dim: 0.45, door: 0.5, dawn: 1, wall: 0.04, flames: 0, embers: 0 }, 'inOut');
    H.pose(tS, at(56, 0, 2), 'idle', 'inOut', { hy: -1, grot: -0.12, gy: 6 });
    move(tS, at(56, 0, 2), { y: 248, zoom: 1.06 }, 'inOut');

    // ================================================================ 56-60 · the memories
    // three paintings above the text box, the dark round them; long crossfades, slow pans
    FIN.memories([
      { name: 'memPie', t0: at(56, 0, 2), t1: at(57, 3, 2) + 0.6, in: 1.0, out: 1.2, pan: [2, 6, 15, 2] },
      { img: 'story/family', t0: at(57, 3, 2) - 0.6, t1: at(58, 3, 2) + 0.6, in: 1.2, out: 1.2, pan: [3, 8, 13, 1], flash: 0.5 },
      { name: 'memHall', t0: at(58, 3, 2) - 0.6, t1: at(60, 1), in: 1.2, out: 0.8, pan: [8, 58, 8, 0] },
    ]);
    TL.look2.to(at(56, 0, 2), at(56, 2), { dim: 1 }, 'inOut');
    FIN.petals(at(56), at(60, 1), (t) => U.clamp((t - at(56)) / 1.2) * (1 - U.clamp((t - at(60)) / 0.6)));
    move(at(56, 0, 2), at(60), { y: 260, zoom: 1.02 }, 'inOut');
    // under Toriel and her pie, his ATTACK and DEFENSE fall
    FIN.stars(at(56, 2, 2), at(57, 1, 2) - 0.02, ['艾斯戈尔的攻击降低了！', '艾斯戈尔的防御降低了！'], { step: 0.045, gap: 0.18 });
    // 交谈 ③, told under the painting (the game's line; no menu): the recollection - the children
    H.lines([[at(57, 1, 2), at(57, 3, 2), ['你坚定地叫艾斯戈尔不要', '继续战斗。']]], { step: 0.05 });
    H.lines([[at(57, 3, 2), at(58, 1, 2), '他的脑海中闪过一段回忆……']], { step: 0.06 });
    H.sfx(at(57, 3, 2), 'Sparkle', 0.16);
    // under the children, his ATTACK and DEFENSE fall again
    FIN.stars(at(58, 1, 2), at(59, 0, 2), ['艾斯戈尔的攻击力降低了！', '艾斯戈尔的防御力降低了！'], { step: 0.045, gap: 0.18 });
    // 59 beat 3: ACT · 交谈 ④ (the throne room still above)
    H.onButton(1, at(59, 2, 2), at(59, 3, 1));
    TL.heart.set(at(59, 2, 2) - 0.001, { a: 1 }).set(at(59, 3, 1), { a: 0 });
    H.list(at(59, 3, 1), at(59, 3, 3) + 0.05, [[0, 0, '* 查看'], [1, 0, '* 交谈']], { pick: 1, from: 0, tPick: at(59, 3, 2), tSel: at(59, 3, 3) });

    // ================================================================ 60 · 交谈 ④, the return
    const t60 = at(60), tD = at(60, 2);
    H.lines([[t60, tD, '看来谈话不会再有用了。']], { step: 0.045 });
    TL.look2.to(t60 + 0.05, at(60, 0, 6), { dim: 0.4 }, 'inOut');
    H.pose(at(60, 0, 4), tD - 0.05, 'idle', 'inOut', { hy: 3, grot: -0.12, gy: 6 });
    move(t60, tD - 0.02, { x: 480, y: 214, zoom: 1.16 }, 'inOut');
    // ---- beat 3: the drums
    H.pose(tD - 0.03, tD + 0.07, 'brace', 'outExpo', { crouch: 8, flare: 1.25, grot: 0.22, gy: -6 });
    H.pose(tD + 0.45, tD + 0.95, 'raise', 'inOut', { flare: 0.5 });
    SOULS.forEach((k, i) => H.eyes(tD + 0.03 + i * 0.075, HEX[k], 0.32, { vol: i ? 0 : 0.45 }));
    // (the six ribbons back to the trident: src/tl_act4e.js, which hands each over to the soul)
    TL.tridentBands.set(tD - 0.01, { rb: 1, flow: 0 }).to(tD, tD + 0.3, { yellow: 1, green: 1, purple: 1, blue: 1, orange: 1, aqua: 1, flow: 0.8 }, 'out').to(tD + 0.6, tD + 1.6, { flow: 0 }, 'inOut');
    TL.trident.to(tD, tD + 0.1, { glow: 1.6 }, 'out').to(tD + 0.4, tD + 1.4, { glow: 0.6 }, 'inOut');
    // his fire up out of the dark, the walls in the six colours (from the outside in), the dawn
    TL.look2.to(tD - 0.02, tD + 0.08, { dim: 0, flames: 1.5, wall: 0.18, door: 0.65, dawn: 0.45, letter: 0, embers: 0.45, react: 1 }, 'out');
    TL.look2.to(tD + 0.5, tD + 1.5, { flames: 1 }, 'inOut');
    TL.look2.to(tD, tD + 0.45, { rings: 6 }, 'out');
    H.bigHit(tD, { amp: 11, flash: 0.22, bw: 0 });
    H.sfx(tD, 'BgFlame', 0.45); H.sfx(tD, 'Explosion', 0.28);
    // the target line once more, its six pips lighting as the colours go through his eyes
    TL.foe.set(tD - 0.01, { hp: 2438, max: 3500, pips: 0 }).to(tD + 0.05, tD + 0.5, { pips: 1 }, 'lin');
    TL.foePips.set(tD - 0.01, 63);
    H.target(tD, at(60, 3) + 0.05, { fill: (t) => U.eOut(U.clamp((t - tD) / 0.3)) });
    H.sfx(tD + 0.05, 'Target', 0.35);
    cut(tD, { x: 480, y: 92, zoom: 1.95, pitch: 0.05 });
    cut(at(60, 2, 3), { x: 480, y: 290, zoom: 1.03, pitch: 0.06 });
    // the walls' light flows in on the downbeats from here
    const kicks = [];
    for (let b = 61; b < 71; b++) kicks.push([at(b), 0.08]);
    H.waveScore(tD, at(71), 0.3, kicks);
    // 60 beat 4: the box shuts
    const t603 = at(60, 3);
    H.boxTo(t603 - 0.03, t603 + 0.12, B.home, 'outExpo');
    H.sfx(t603 - 0.03, 'SwipeShort', 0.2);
    TL.heart.set(t603 + 0.1, { a: 1, x: C[0], y: C[1] });
    // (61-73: src/tl_act4e.js)
  });
})();
