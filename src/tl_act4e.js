// Act four, part five: bars 61-73 - the answer. Leave the game's frame: the soul
// climbs the jars, taking each soul's power with its things. Every soul's way
// of winning is the game's own: the Snowdin ball game's flags (asset/six-soul.md) - orange "rushes
// fists-first through all obstacles", yellow's "sure-fire accuracy put an end to the mayhem", green's
// "concern and care", light blue "waited, still, for this opportunity, then dethroned Ball with a
// sharp attack", blue "hopping and twirling", purple "even when you felt trapped, you took notes and
// achieved the end"; and red: "Bravery. Justice. Integrity. Kindness. Perseverance. Patience. Using
// these, you were able to win" - "Try as you might, you continue to be yourself."
//   60·14 he slams the trident: his fire takes the shape of two hands
//   61-62 THE GRIP: the hands close on the box from both sides, a squeeze on every snare (150 px
//         wide -> 54), each squeeze spraying his fire across it in the six borrowed colours; on the
//         last the soul is caught (20 -> 15)
//   63    the soul throws itself at the walls from inside, a blow a step; the hands are pushed back
//   64·0  the cage bursts, the hands blown apart - the soul flies out of the game's frame for good:
//         no box, no HUD, the hall (the gates' immersion)
//   64-70 THE ANSWER: up on a jar, the soul in it lends the child what it lent him - its ribbon tears
//         off his trident and binds to the soul (the trigger, seen: the child came to it with its
//         things), its band leaves the trident, its pip goes dark; the jar's things come out of the
//         glass into the soul, which takes its colour; its world comes into the hall; and the soul
//         strikes him in that soul's way (src/blow.js H.blow: the hold, the stop, the hard frame,
//         the hall in its colour, the force going out through him - he does not move):
//           64 orange  his fire rises between them - orange: it passes what moves; the soul charges
//                      fists-first through it into his chest
//           65 yellow  he rains fire round himself; Dead Eye turned on him - the world an old
//                      photograph, three marks laid on him, three shots, the last the blow
//           66 green   he throws fire at it, the glass takes it (it turns to green light); the soul
//                      comes down before him with the pane raised -
//           67         - his all-out blow, what is left of it (three colours gone): it lands on the
//                      glass, held; the glass throws it back into him. A leap over his shoulder
//           68 l.blue  rings of his light-blue fire pass through it - it does not move; the world
//                      stops, grey; then the toy knife: one sharp cut
//           69 blue    a leap and a twirl over his fire, a hang at the top, the sole kicks down
//           70 purple  the lines of his trap and his words along them; it runs the line, striking
//                      each word out, to its end - the notebook spins into him: 711 left
//   71    the walk-up: the six words of the red flag, two a step, in their colours round the soul,
//         its six ribbons lit; they go into it; he lowers the trident
//   71·4  THE LAST FIGHT (user, 2026-10-06 night: the game's own attack bar for the last blow, one
//         with the walk-up): the game's frame comes back - what the soul broke at 64, flying in
//         from out of the picture - and shuts on 72's downbeat into the text box: the game's
//         picture again (the HUD, 战斗 lit), the target open in it; the soul has drawn back to where
//         the cursor stands, its ribbons stretched behind it like a bowstring
//   72-73 the ribbons pour into the soul and let go - it burns red ("you continue to be yourself");
//         the cursor creeps, and lurches on with each accent of the last phrase's syncopation - the
//         soul with it, right over it, up toward his chest; the camera a notch closer each time. On
//         the last note the cursor is on the centre line - the press - and the soul goes through
//         him: the red blade across him, the picture held, the silence; 711; the target closes, he
//         kneels behind the empty box: the game's window, for act five
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, B = MV.B2, F = MV.F, D = MV.D, FIN = MV.FIN, BL = MV.BLOW, FL = MV.FL, FX = MV.SOULFX;
  const HEX = MV.COL.S, SOULS = MV.SOULS, R = Math.round, TAU = U.TAU;
  const at = (b, k = 0, s = 0) => T.at(b, k, s);
  const cut = (t, v) => H.shot(t, v), move = (t0, t1, v, e) => H.move(t0, t1, v, e);
  const C = [B.home.cx, B.home.cy], MENU = B.menuRect();
  const ZJ = MV.PLANE_Z.mid, ZK = MV.PLANE_Z.king;
  const bit = (k) => 1 << SOULS.indexOf(k);
  const ART = (n) => MV.ART.get(n);
  // something drawn at a depth (src/depth.js), on the battle plane: fn() draws in home coordinates
  const atDepth = (ctx, emi, S, z, fn) => {
    if (!S || Math.abs(z) < 0.5) { fn(); return; }
    const x = MV.depthXf(S.cam, z, 0);
    ctx.save(); ctx.transform(x.k, 0, 0, x.k, x.ox, x.oy);
    if (emi) { emi.save(); emi.transform(x.k, 0, 0, x.k, x.ox, x.oy); }
    try { fn(); } finally { ctx.restore(); if (emi) emi.restore(); }
  };
  const ring = (ctx, x, y, r, w, col, a) => { if (a <= 0.01 || r <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); };
  // the red flag's words: the notebook word's own lettering re-inked in the soul's colour - the fill
  // in the colour, the lit tops paler, the outline kept dark (tinting it all ran the outline into
  // the strokes: the words read as blots)
  // (in between, after both were tried: the bold solid word kept, a thin outline - one px of a deep
  // shade of its colour round the dialogue-size letters, built at that size: the notebook word is
  // half size, enlarged, its outline doubled with it - the stroke tops lit a little)
  const flagWord = (w, key) => F.cached('flagWord4:' + w, () => {
    const [cr, cg, cb] = F.rgb(HEX[key]), hi = [cr, cg, cb].map((v) => Math.round(v + (255 - v) * 0.35)), lo = [cr, cg, cb].map((v) => Math.round(v * 0.32));
    // (strokes a px bolder than the font's: 3 px, then the 1 px outline round them)
    const ww = D.textWidth(w, { scale: 2 }) + 3, hh = 35, [c, x] = MV.canvas(ww, hh);
    for (let dy = 0; dy <= 3; dy++) for (let dx = 0; dx <= 3; dx++) if ((dx % 3) || (dy % 3)) D.text(x, w, dx, dy, { scale: 2, color: `rgb(${lo})` });
    for (const [dx, dy] of [[1, 1], [2, 1], [1, 2], [2, 2]]) D.text(x, w, dx, dy, { scale: 2, color: HEX[key] });
    const id = x.getImageData(0, 0, ww, hh), d = id.data, isFill = (i, j) => { const q = (j * ww + i) * 4; return d[q + 3] > 0 && d[q] === cr && d[q + 1] === cg && d[q + 2] === cb; };
    for (let j = hh - 1; j >= 1; j--) for (let i = 0; i < ww; i++) if (isFill(i, j) && !isFill(i, j - 1)) { const q = (j * ww + i) * 4; d[q] = hi[0]; d[q + 1] = hi[1]; d[q + 2] = hi[2]; }
    x.putImageData(id, 0, 0);
    return c;
  });  const motes = (ctx, x, y, u, cols, n, r0, r1, seed) => { for (let m = 0; m < n; m++) { const a = U.hash(m * 3.1 + seed) * TAU, r = r0 + (r1 - r0) * U.eOut(u) * (0.45 + 0.55 * U.hash(m * 1.7 + seed)); D.rect(ctx, R(x + Math.cos(a) * r) - 1, R(y + Math.sin(a) * r) - 1, 2, 2, cols[m % cols.length], 1 - u); } };

  // (what is recoloured or built for these bars, built at load: not on the frame it is first needed)
  (MV.prewarm = MV.prewarm || []).push(() => {
    FIN.crescentImg(5, ['orange', 'yellow', 'green']); BL.white(ART('punchPow'));
    for (const w of ['困住', '绝望', '恐惧']) FX.wordImg(w);
    for (const [w, k] of [['勇敢', 'orange'], ['正义', 'yellow'], ['善良', 'green'], ['耐心', 'aqua'], ['正直', 'blue'], ['毅力', 'purple']]) flagWord(w, k);
    for (const n of ['glove', 'gun', 'pan', 'knife', 'shoe', 'book', 'star']) { B.prop(n); BL.white(B.prop(n)); }
    for (const k of SOULS) { B.fireImg(0, HEX[k]); B.fireImg(1, HEX[k]); }
    B.fireImg(0, B.RULE.orange); B.fireImg(1, B.RULE.orange);
  });
  MV.sections.push(() => {
    // ================================================================ the plan
    // the order the soul comes to them: up the jars on his left, over his shoulder, down those on
    // his right; when each lends the child its power (its ribbon tears off the trident)
    const SW = { orange: at(64, 0, 2), yellow: at(65), green: at(66), aqua: at(68), blue: at(69), purple: at(70) };
    // up on a jar's lid (home px; the jars' depth)
    const perch = (key) => { const [x, y] = MV.jarAt(key, at(64)); return [x, y - 71, ZJ]; };
    const CHEST = BL.CHEST;
    // his HP (README 账本): 2438 -> 711 over the six; the last blow takes the 711
    const HPS = { orange: [2438, 2170, 268], yellow: [2170, 1877, 293], green: [1877, 1525, 352], aqua: [1525, 1284, 241], blue: [1284, 1010, 274], purple: [1010, 711, 299] };
    const tD = at(60, 2), T61 = at(61), T63 = at(63), T64 = at(64), T71 = at(71), tIn = at(71, 3), T72 = at(72), tP = at(73, 2);

    // ---- the soul's flight: from where it is to [x, y, z] by t1 - an arc lifted by lift px, turning
    // spin times (its size, its glow on the way); its depth with it
    const flyTo = (t0, t1, to, o = {}) => {
      const s0 = TL.heart.at(t0), from = [s0.x, s0.y], ease = MV.EASE[o.ease || 'inOut'];
      H.hPath(t0, t1, (t) => { const u = U.clamp((t - t0) / (t1 - t0)), e = ease(u); return [U.lerp(from[0], to[0], e), U.lerp(from[1], to[1], e) - (o.lift || 0) * Math.sin(Math.PI * u)]; });
      TL.heart.to(t0, t1, { z: to[2] ?? s0.z ?? 0 }, o.zEase || o.ease || 'inOut');
      if (o.spin) TL.heart.set(t0, { rot: 0 }).to(t0, t1, { rot: o.spin * TAU }, 'out').set(t1 + 0.001, { rot: 0 });
      if (o.sc !== undefined) TL.heart.to(t0, t1, { sc: o.sc }, 'inOut');
    };
    // a landing on a jar: the jar knocked down a little, dust off its lid, a tick
    const land = (key, t) => {
      TL.jar[key].to(t, t + 0.04, { jy: 4 }, 'out').to(t + 0.04, t + 0.3, { jy: 0 }, 'outBack');
      TL.heart.to(t, t + 0.05, { sc: 0.8 }, 'out').to(t + 0.05, t + 0.24, { sc: 1 }, 'outBack');
      H.sfx(t, 'Impact', 0.22); H.sfx(t, 'Ding', 0.12);
      const [x, y] = perch(key);
      TL.add({
        t0: t, t1: t + 0.45, z: 40, name: 'landing ' + key,
        draw(ctx, emi, tt, S) { atDepth(ctx, emi, S, ZJ, () => { const u = (tt - t) / 0.45; for (let m = 0; m < 10; m++) { const s = m % 2 ? 1 : -1, h = U.hash(m * 2.7 + t); D.rect(ctx, R(x + s * (6 + 30 * U.eOut(u) * (0.5 + h))), R(y + 9 - 10 * U.eOut(u) * h), 2, 2, '#d8d2e4', 0.8 * (1 - u)); } }); },
      });
    };

    // ================================================================ the six ribbons (from 60's drums)
    // back to his trident as the drums come (src/tl_act4d.js 60); each tears off it to the soul when
    // its soul answers, and binds there (drawn on his plane, both ends where they are seen from the
    // camera); all six pour into the soul at 72 and let go
    const RIB = (k) => { const i = SOULS.indexOf(k); return { at: 0.42 + i * 0.09, lift: 26, seed: i * 1.7 }; };
    const soulOnKing = (t, S) => { const h = TL.heart.at(t); return S ? MV.depthPt(S, [h.x, h.y], h.z || 0, ZK) : [h.x, h.y]; };
    SOULS.forEach((k) => H.ribbon(k, tD + 0.24, T72 + 0.06, Object.assign({ tint: false, grow: 0.24, glowAfter: 0.12, retarget: { t: SW[k], dur: 0.22, to: soulOnKing } }, RIB(k))));
    let pips = 63;
    // ---- a soul answers: what it lent him is the child's now; its things out of its glass into the
    // soul (o.items: the armour, the weapon), which takes its colour
    const answer = (key, t, o = {}) => {
      TL.tridentBands.to(t, t + 0.12, { [key]: 0 }, 'out');
      pips &= ~bit(key); TL.foePips.set(t + 0.02, pips);
      TL.jar[key].to(t - 0.02, t + 0.06, { glow: 3.2 }, 'out').to(t + 0.3, t + 1.4, { glow: 1.6 }, 'inOut');
      TL.heartMode.set(t + 0.08, o.mode || key);
      TL.heart.to(t + 0.08, t + 0.12, { glow: 1.6, sc: 1.35 }, 'out').to(t + 0.12, t + 0.5, { glow: 0.5, sc: 1 }, 'inOut');
      H.sfx(t, 'Chime', 0.3, { rate: o.rate ?? 1 }); H.sfx(t + 0.08, 'Item', 0.3); H.sfx(t + 0.08, 'Sparkles', 0.22);
      const hex = HEX[key], items = (o.items || []).map((n) => (MV.ART.make[n] ? ART(n) : B.prop(n)));
      TL.add({
        t0: t, t1: t + 0.7, z: 41, keep: true, name: 'answer ' + key,
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt), jar = B.jarSoul(key, tt), u = (tt - t) / 0.7;
          atDepth(ctx, emi, S, h.z || 0, () => {
            // its things up out of the glass and into the soul (0 .. 0.12 s), a white flash as they go in
            items.forEach((img, i) => {
              const v = U.clamp((tt - t) / 0.13), e = U.eIn(v), s = i ? 1 : -1;
              if (v >= 1) return;
              const x = U.lerp(jar[0] + s * 8, h.x + s * 3, e), y = U.lerp(jar[1], h.y, e) - Math.sin(v * Math.PI) * 18;
              F.spr(ctx, v > 0.75 ? F.tint(img, '#ffffff') : img, x, y, { sc: 2 * (1 - 0.5 * e), ax: img.width / 2, ay: img.height / 2 });
            });
            // the soul's colour bursting out of it
            const w = (tt - t - 0.1) / 0.6;
            if (w > 0) { ring(ctx, h.x, h.y, 8 + 46 * U.eOut(w), 3, hex, 0.9 * (1 - w)); ring(ctx, h.x, h.y, 4 + 26 * U.eOut(w), 2, '#ffffff', 0.7 * (1 - w)); motes(ctx, h.x, h.y, w, [hex, '#ffffff'], 14, 6, 60, t); }
            if (emi && w > 0) F.glowAt(emi, h.x, h.y, 50, hex, 0.6 * (1 - w));
          });
        },
      });
      // (where his trident loses it: a burst of its colour off the shaft)
      TL.add({
        t0: t, t1: t + 0.45, z: -44, name: 'off the trident ' + key,
        draw(ctx, emi, tt) { const p = MV.spearTip(tt, 0.4 + SOULS.indexOf(key) * 0.09), u = (tt - t) / 0.45; motes(ctx, p[0], p[1], u, [hex, '#ffffff'], 10, 2, 40, t + 1); },
      });
    };

    // ================================================================ 60·14 · his fire takes the shape of hands
    const tb0 = at(60, 3, 2);
    H.tipFire(at(60, 2, 6), tb0, { n: 8 });
    H.act(tb0, 'raise', 'slam', { windDur: 0.12, hold: 0.25, after: 'brace' });
    H.sfx(tb0, 'BgFlame', 0.42); H.hit(tb0, 0.6);

    // ================================================================ 61-62 · the grip
    // his two fire hands close on the box from both sides (the game's own hands, solid white, at a
    // giant's size; the gardener's hands - here his grip); a squeeze on every snare, the box a
    // step narrower each time, the hand that squeezes spraying fire across it in the borrowed
    // colours. The last catches the soul.
    const SQ = [at(61, 0, 2), at(61, 0, 6), at(61, 0, 10), at(61, 0, 14), at(62, 0, 2), at(62, 0, 6), at(62, 0, 10), at(62, 0, 14)];
    const W0B = 150, WEND = 54, wAfter = (i) => R(U.lerp(W0B - 4, WEND, (i + 1) / SQ.length));
    H.boxTo(T61 - 0.01, T61 + 0.05, { w: W0B - 8 }, 'outExpo'); H.boxTo(T61 + 0.07, T61 + 0.3, { w: W0B - 4 }, 'outBack');
    SQ.forEach((ts, i) => {
      H.boxTo(ts - 0.01, ts + 0.05, { w: wAfter(i) - 7 }, 'outExpo');
      H.boxTo(ts + 0.07, ts + 0.3, { w: wAfter(i) }, 'outBack');
      H.sfx(ts, 'Slam', 0.18 + 0.02 * i); H.sfx(ts, 'BgFlame', 0.2);
      TL.impact(ts, { amp: 4 + 0.6 * i, dx: i % 2 ? 1 : -1, zoom: 0.012, dur: 0.25 });
      TL.box2.to(ts, ts + 0.02, { th: 8 }, 'out').to(ts + 0.04, ts + 0.22, { th: 5 }, 'inOut');
    });
    H.sfx(T61, 'Grab', 0.4); H.sfx(T61, 'Impact', 0.35); TL.impact(T61, { amp: 7, zoom: 0.02, dur: 0.3 });
    // the soul's dance in the narrowing box (as in src/tl_act4a.js)
    const dance = (keys, dash = 0.14) => (t) => {
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
    const DANCE61 = dance([
      [T61 - 0.05, 480, 345], [at(61, 0, 1), 470, 300], [at(61, 0, 5), 492, 388], [at(61, 0, 9), 468, 312], [at(61, 0, 13), 488, 380],
      [at(62, 0, 1), 476, 296], [at(62, 0, 5), 484, 392], [at(62, 0, 9), 478, 318], [at(62, 0, 13), 482, 372], [at(63) - 0.05, 480, 345],
    ]);
    // the sprays: from the squeezing hand's fingers, a fan aimed where the soul is about to be; out
    // through the other side (the game's fire is not held in by the box), into the other hand
    const PALETTE = ['yellow', 'green', 'purple', 'blue', 'orange', 'aqua'];
    const sprays = [];
    SQ.forEach((ts, i) => {
      const side = i % 2 ? 1 : -1, w = wAfter(i), x0 = C[0] + side * (w / 2 + 8), aim = DANCE61(ts + 0.22);
      for (let k = 0; k < 4; k++) {
        const y0 = C[1] - 36 + k * 24, a = Math.atan2(aim[1] - y0, aim[0] - x0) + (k - 1.5) * 0.16, sp = 300, hex = HEX[PALETTE[(i + k) % 6]];
        const tE = ts + (w + 24) / (sp * Math.abs(Math.cos(a)) + 1e-3);
        sprays.push({ t0: ts, t1: Math.min(ts + 1.2, tE), hr: 5, hex, fadeIn: 0.03, fadeOut: 0.05, p: B.lin(ts, [x0, y0], [Math.cos(a) * sp, Math.sin(a) * sp]) });
      }
    });
    H.shots(sprays, { name: 'his grip', clip: null, z: 21 });
    B.dodge(T61 - 0.05, at(62, 0, 13.5), sprays, { box: (t) => B.inner(MV.box2At(t), 7), lure: DANCE61, lureW: 1.4, startW: 0.06, comfort: 5, speed: 320 });
    H.graze(T61, at(62, 0, 13.5), sprays);
    // the last squeeze catches it: one of its fire on the soul (20 -> 15)
    {
      const tHit = at(62, 0, 14) + 0.16, to = TL.heart.at(tHit), x0 = C[0] + (WEND / 2 + 8), y0 = to.y - 10;
      const v = [(to.x - x0) / 0.16, (to.y - y0) / 0.16];
      H.shots([{ t0: tHit - 0.16, t1: tHit + 0.02, hr: 6, sc: 1.3, hex: HEX.purple, p: B.lin(tHit - 0.16, [x0, y0], v) }], { name: 'caught', clip: null, z: 21 });
      TL.invulnSpans.push([tHit - 0.06, tHit + 0.55]);
      H.hurt(tHit, 15, { vol: 0.6, iframes: 0.45 });
      TL.impact(tHit, { amp: 7, zoom: 0.025, flash: 0.18, flashCol: [1, 0.2, 0.2], flashDecay: 10, dur: 0.3 });
      H.hGo(at(63) - 0.02, C[0], C[1], 200);
    }
    // he holds the grip: braced, the trident burning in the six colours, still
    H.pose(T61, T61 + 0.2, 'brace', 'out', { crouch: 8, flare: 1.1, grot: 0.18, gy: -4 });
    TL.trident.to(T61, T61 + 0.2, { glow: 1.6 }, 'out');
    // the camera: close on the box between the hands, closing in with them
    cut(T61, { x: 480, y: 318, zoom: 1.32, pitch: 0.1, fov: 0.85 });
    move(T61, at(62) - 0.03, { zoom: 1.5, y: 326 }, 'lin');
    cut(at(62) - 0.02, { x: 480, y: 330, zoom: 1.62, pitch: 0.06, yaw: 0.04, fov: 0.85 });
    move(at(62), at(63) - 0.03, { zoom: 1.9, y: 338 }, 'in');

    // ================================================================ 63 · the soul breaks the grip
    const BOX63 = { cx: C[0], cy: C[1], w: WEND, h: 150 };
    const SLAMS = [
      { t: at(63, 0, 2), side: 'L', at: 0.1, pow: 1 },
      { t: at(63, 0, 6), side: 'R', at: -0.25, pow: 1.2 },
      { t: at(63, 0, 10), side: 'T', at: 0, pow: 1.4 },
      { t: at(63, 0, 14), side: 'ALL', pow: 1.8 },
    ];
    BL.cage(BOX63, SLAMS, T64);
    SLAMS.forEach((s, k) => move(s.t, s.t + 0.05, { zoom: 1.7 + 0.12 * k, y: 336 + 3 * k }, 'outExpo'));
    cut(T63, { x: 480, y: 334, zoom: 1.6, pitch: 0.05, fov: 0.85 });
    // the hands, pushed back by each blow (that side; the last, both)
    const pushOf = (side, t) => {
      let d = 0;
      for (const s of SLAMS) { if (t < s.t) continue; if (s.side === side || s.side === 'ALL' || s.side === 'T') d += (s.side === 'T' ? 5 : 12) * (s.pow || 1) * (0.55 + 0.45 * Math.exp(-(t - s.t) * 6)); }
      return d;
    };
    // ---- the hands, drawn: in from the sides as he slams (60·14), on the box's walls from 61, blown
    // apart with the cage at 64
    {
      const tIn = tb0, tOn = T61, tOff = T64, HSC = 2.7;
      const img = MV.img('hand3'), FIRE = ['#ffe6a8', '#ffb048', '#f2741c'];
      const handAt = (s, t) => {
        const b = MV.box2At(Math.min(t, tOff - 0.001)), w = t < tOff - 0.001 ? b.w : WEND;
        let x = C[0] + s * (w / 2 + 4 + pushOf(s < 0 ? 'L' : 'R', t)), y = C[1] + 6, rot = s * 0.08, a = 1;
        if (t < tOn) { const u = U.eOut(U.clamp((t - tIn) / (tOn - tIn))); x = U.lerp(C[0] + s * 520, x, u); y = U.lerp(C[1] + 120, y, u); a = U.clamp(u * 3); }
        if (t >= tOff) { const v = t - tOff; x += s * (520 * v + 400 * v * v); y += -160 * v + 900 * v * v; rot += s * 4 * v; a = 1 - U.clamp(v / 0.45); }
        return { x, y, rot, a };
      };
      TL.add({
        t0: tIn, t1: tOff + 0.5, z: 26, keep: true, name: 'his hands',
        draw(ctx, emi, t) {
          for (const s of [-1, 1]) {
            const g = handAt(s, t);
            if (g.a <= 0.01) continue;
            // the fire they are: flames licking up off them, his sparks in the six colours
            for (let m = 0; m < 12; m++) {
              const h1 = U.hash(m * 3.3 + s), life = 0.5 + 0.4 * h1, u = (((t / life + h1) % 1) + 1) % 1;
              const x = g.x + s * (12 + 40 * U.hash(m * 1.7)) , y = g.y + 60 - u * (140 + 60 * h1);
              D.rect(ctx, R(x / 2) * 2, R(y / 2) * 2, 2, 2, m % 3 ? FIRE[m % 3] : HEX[PALETTE[m % 6]], g.a * (1 - u));
            }
            // (outside the wall, the palm against it: the left one as the sheet draws it, the right mirrored)
            ctx.save(); ctx.globalAlpha = g.a; ctx.translate(R(g.x), R(g.y)); ctx.rotate(g.rot); ctx.scale(HSC * (s < 0 ? 1 : -1), HSC);
            ctx.drawImage(img, -img.width + 3, -img.height / 2); ctx.restore(); ctx.globalAlpha = 1;
            if (emi) F.glowAt(emi, g.x + s * 40, g.y, 90, '#ffe0c0', 0.16 * g.a);
          }
          // blown apart: what they were, scattered fire
          const v = t - tOff;
          if (v > 0 && v < 0.6) for (const s of [-1, 1]) for (let m = 0; m < 16; m++) {
            const a = U.hash(m * 5.3 + s) * TAU, sp = 160 + 340 * U.hash(m * 2.1 + s), x = C[0] + s * 40 + Math.cos(a) * sp * v + s * 260 * v, y = C[1] + Math.sin(a) * sp * v + 300 * v * v;
            B.fire(ctx, emi, x, y, t, m + s, { hex: HEX[PALETTE[m % 6]], a: 1 - v / 0.6 });
          }
        },
      });
    }

    // ================================================================ 64·0 · out of the frame
    // the cage bursts (BL.cage), the soul flies out of it onto the orange jar; no box and no HUD from
    // here to the end: the soul and him in the hall
    TL.hudT.to(T64, T64 + 0.25, { a: 0 }, 'in').set(T64 + 0.26, { shards: 0 });
    for (let k = 0; k < 3; k++) TL.btn[k].to(T64, T64 + 0.25, { a: 0 }, 'in');
    TL.look2.to(T64, T64 + 0.08, { flames: 1.5 }, 'out').to(T64 + 0.3, T64 + 1, { flames: 0.45 }, 'inOut');
    TL.heart.set(T64 - 0.001, { z: 0 });
    flyTo(T64 + 0.02, SW.orange, perch('orange'), { lift: 70, spin: 1, sc: 1, ease: 'out' });
    land('orange', SW.orange);
    cut(T64, { x: 470, y: 280, zoom: 1.0, pitch: 0.06, fov: 0.85 });
    // the soul's red wake on its flights from here on (and its lurches at him at the end)
    TL.trailSpans.push([T64, tP]);

    // ---- the worlds: each soul's world comes into the hall as it lends its power (the newest over the
    // last, its colour running in over the rings); at 71 all six stand round the door as rings
    const WORLD_IN = { orange: SW.orange - 0.08, yellow: at(64, 3, 3), green: at(65, 3, 3), aqua: at(67, 3), blue: at(68, 3, 3), purple: at(69, 3, 3) };
    const WORLD_OUT = { orange: at(65) + 0.3, yellow: at(66) + 0.3, green: at(67, 3, 2), aqua: at(69) + 0.3, blue: at(70) + 0.3, purple: T71 + 0.3 };
    const ORDER = ['orange', 'yellow', 'green', 'aqua', 'blue', 'purple'];
    ORDER.forEach((k) => H.world(k, WORLD_IN[k], WORLD_OUT[k], { wipe: 0.32, burn: 0, wind: k === 'orange' || k === 'yellow',
      clock: k === 'yellow' ? MV.stopClock(WORLD_IN[k], WORLD_OUT[k], [[at(65, 0, 2), at(65, 0, 6)]]) : k === 'aqua' ? MV.stopClock(WORLD_IN[k], WORLD_OUT[k], [[at(68, 0, 2), at(68, 0, 6)]]) : undefined }));

    // ================================================================ 64 · orange - fists first, through
    answer('orange', SW.orange, { items: ['bandanna', 'glove'], rate: 1.25 });
    {
      const P = perch('orange'), tW0 = at(64, 0, 3), tGo = at(64, 0, 5), tHit = at(64, 0, 6), stop = 0.1;
      // his fire rises between them - his orange: it passes what moves
      const curtain = [], cx = 372;
      for (let k = 0; k < 26; k++) {
        const te = at(64, 0, 1.2) + k * 0.05, x = cx + Math.sin(k * 1.7) * 9, life = 1.15;
        curtain.push({ t0: te, t1: te + life, hr: 6, sc: 1.3, hex: B.RULE.orange, rule: 'orange', z: 140, fadeIn: 0.05, fadeOut: 0.1, seed: k, p: B.lin(te, [x, 300], [Math.sin(k) * 10, -340]) });
      }
      // (where the soul goes through it, its fire is knocked aside)
      const knock = (s) => {
        const tc = tGo + 0.065, p = s.p(tc), q = [U.lerp(P[0], CHEST[0], 0.5), U.lerp(P[1], CHEST[1], 0.5)];
        if (!p || tc < s.t0 || tc > s.t1 || Math.hypot(p[0] - q[0], p[1] - q[1]) > 70) return s;
        const p0 = s.p, d = [p[0] - q[0] || 1, p[1] - q[1]], L = Math.hypot(d[0], d[1]);
        return Object.assign({}, s, { hitUntil: tc, t1: tc + 0.35, p: (t) => (t < tc ? p0(t) : [p[0] + (d[0] / L) * 420 * (t - tc), p[1] + (d[1] / L) * 420 * (t - tc) + 300 * (t - tc) ** 2]) });
      };
      const curtainK = curtain.map(knock);
      H.shots(curtainK, { name: 'his orange fire', clip: null, z: 18 });
      H.sfx(at(64, 0, 1.2), 'BgFlame', 0.32);
      // the hold: back on the lid, low, the fists out and shaking; then the charge (a sixteenth)
      H.hPath(SW.orange + 0.2, tGo, (t) => { const u = U.eOut(U.clamp((t - tW0) / (tGo - tW0))); return [P[0] - 12 * u + U.noise(t * 50) * 1.2 * u, P[1] + 5 * u]; });
      TL.heart.to(tW0, tGo, { sc: 0.82, glow: 1.2 }, 'out');
      flyTo(tGo, tHit, [CHEST[0] - 6, CHEST[1] + 4, ZK + 4], { ease: 'in2' });
      TL.heart.to(tGo, tHit, { sc: 1.25 }, 'in');
      H.sfx(tGo, 'SwipeShort', 0.3); H.sfx(tGo, 'Pullback', 0.2);
      // the fists: before the soul from the hold to the blow - small, growing as it goes
      const fist = ART('fistFront'), pow = ART('punchPow');
      TL.add({
        t0: tW0, t1: tHit, z: 42, keep: true, name: 'fists first',
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt);
          atDepth(ctx, emi, S, h.z || 0, () => {
            const k = U.clamp((tt - tW0) / 0.1), shake = tt < tGo ? U.noise(tt * 60) * 1.5 : 0;
            F.spr(ctx, fist, h.x + 12 + shake, h.y - 2, { sc: tt < tGo ? 1.2 : 1.2 + 1.4 * U.eIn(U.clamp((tt - tGo) / (tHit - tGo))), ax: 11, ay: 12, alpha: k });
            if (tt >= tGo) for (let m = 1; m <= 4; m++) { const q = TL.heart.at(tt - m * 0.018); F.spr(ctx, MV.img('heartOrange'), q.x, q.y, { sc: 1.1, ax: 8, ay: 8, alpha: 0.4 * (1 - m / 5) }); }
          });
        },
      });
      // on him (his plane - it stays on him whichever way the camera turns): the game's big fist and
      // its burst
      TL.add({
        t0: tHit, t1: tHit + stop + 0.3, z: -18, keep: true, live: true, name: 'the fist on him',
        draw(ctx, emi, tt) {
          const w = tt - tHit, a = 1 - U.clamp((w - stop - 0.05) / 0.2);
          F.spr(ctx, BL.white(pow), CHEST[0], CHEST[1], { sc: 3.4 * (1 + 0.25 * (1 - U.eOut(U.clamp(w / 0.06)))), ax: 13, ay: 13, alpha: a });
          F.spr(ctx, fist, CHEST[0] - 4, CHEST[1] + 4, { sc: 3.2, ax: 11, ay: 12, alpha: a });
        },
      });
      TL.heart.to(tW0, tHit + stop, { glow: 1.4 }, 'inOut');
      TL.invulnSpans.push([tGo, tHit + stop + 0.06]);
      H.blow(tHit, { hex: HEX.orange, at: CHEST, dir: [0.7, -0.3], pow: 1.35, stop, hp: HPS.orange, readout: { pips: 'orange', out: ['orange'] }, sfx: [['PunchStrong', 0.6], ['Slam', 0.3]],
        cam: { snap: { x: CHEST[0] - 30, y: CHEST[1] + 20, zoom: 2.1, pitch: 0.06, yaw: 0.06, roll: -0.02, fov: 0.8 }, back: { x: 420, y: 200, zoom: 1.25, roll: 0, yaw: 0.14, pitch: 0.08 }, backDur: 0.36 } });
      // the camera before it: low past the jar toward him - the soul small on its lid, his fire
      // between them
      cut(SW.orange, { x: 350, y: 186, zoom: 1.5, pitch: 0.1, yaw: 0.22, fov: 0.85 });
      move(SW.orange, tGo - 0.01, { zoom: 1.62, x: 336 }, 'out');
      // knocked back off him, turning, high over and onto the yellow jar
      flyTo(tHit + stop + 0.02, at(64, 0, 14), perch('yellow'), { lift: 110, spin: 2, ease: 'inOut' });
      land('yellow', at(64, 0, 14));
    }

    // ================================================================ 65 · yellow - sure-fire accuracy
    // he rains fire round himself (the mayhem) from 64·9; Dead Eye turned on him: the world an old
    // photograph (his fire hangs in it), three marks laid on him - his hand, the trident's point, his
    // chest - then three shots, the last the blow
    {
      const P = perch('yellow'), tM = [at(65, 0, 2), at(65, 0, 3), at(65, 0, 4)], tS = [at(65, 0, 6), at(65, 0, 8), at(65, 0, 10)], stop = 0.09;
      const freeze = [[tM[0] - 0.02, tS[0] - 0.02]];
      const warpY = (t) => { let lag = 0; for (const [a, b] of freeze) { if (t <= a) break; lag += Math.min(t, b) - a; } return t - lag * 0.97; };
      // his slam and a rain of his fire round himself (the mayhem: about him, sparse - the soul's jar
      // is out of it)
      H.act(at(64, 2, 1), 'high', 'slam', { windDur: 0.16, hold: 0.3, after: 'brace' });
      H.sfx(at(64, 2, 1), 'BgFlame', 0.36);
      const hail = B.hail({ t0: at(65), t1: at(65, 3), vel: [-70, 230], spacing: 120, warp: warpY, seed: 41, at: [520, 260] })
        .filter((s) => { for (let t = s.t0; t < s.t1; t += 0.02) { const p = s.p(t); if (p && (p[0] < 360 || p[0] > 690)) return false; } return true; });
      hail.forEach((s) => { s.z = 110; });
      H.shots(hail, { name: 'his rain', clip: null, z: 17 });
      answer('yellow', SW.yellow, { mode: 'yellowUp', items: ['cowboyHat', 'gun'], rate: 1.0 });
      // the old photograph while the marks go down; his fire stands in the air
      TL.look2.to(tM[0] - 0.03, tM[0] + 0.04, { sepia: 1 }, 'out').to(tS[0] - 0.03, tS[0] + 0.02, { sepia: 0 }, 'out');
      H.sfx(tM[0] - 0.03, 'Spellcast', 0.3);
      // the marks on him: where each is (his plane)
      const MK = [(t) => MV.fistAt(t, 'fistL'), (t) => FIN.prongAt(t, 1), () => CHEST];
      const MKfix = MK.map((f, i) => f(tM[i]));
      tM.forEach((t) => H.sfx(t, 'Target', 0.32));
      // the soul turns: at him as it takes the gun, to each mark as it is laid, to each again as it
      // fires (snaps - a gunslinger's), then point up again for the leap (-1: up; i: mark i)
      const AIM = [[SW.yellow + 0.08, -1], [SW.yellow + 0.12, 2], [tM[0], 0], [tM[1], 1], [tM[2], 2], [tS[0] - 0.07, 0], [tS[1] - 0.07, 1], [tS[2] - 0.07, 2], [tS[2] + stop + 0.03, -1]];
      const tAimEnd = at(65, 0, 12);
      TL.heartHideSpans.push([SW.yellow + 0.08, tAimEnd]);
      // (the angle seen on the screen: the soul's depth point on his plane to the mark - the
      // depth transforms are uniform, so it holds on either plane)
      const soulK = (tt, S) => { const h = TL.heart.at(tt); return S ? MV.depthPt(S, [h.x, h.y], h.z || 0, ZK) : [h.x, h.y]; };
      const angOf = (i, tt, S) => { if (i < 0) return -Math.PI / 2; const q = soulK(tt, S), m = MKfix[i]; return Math.atan2(m[1] - q[1], m[0] - q[0]); };
      const aimAt = (tt, S) => {
        let k = 0;
        for (let j = 0; j < AIM.length; j++) if (tt >= AIM[j][0]) k = j;
        const a1 = angOf(AIM[k][1], tt, S);
        if (!k) return a1;
        const a0 = angOf(AIM[k - 1][1], tt, S), d = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
        return a0 + d * U.eOut(U.clamp((tt - AIM[k][0]) / (AIM[k][1] < 0 ? 0.12 : 0.05)));
      };
      const gunAt = (t, S) => { const h = TL.heart.at(t), a = aimAt(t, S); return [h.x + Math.cos(a) * 15, h.y + Math.sin(a) * 15]; };
      TL.add({
        t0: SW.yellow, t1: at(65, 3, 1), z: 42, keep: true, live: true, name: 'the gun',
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt), gun = B.prop('gun'), ang = aimAt(tt, S);
          let rec = 0;
          for (const ts of tS) if (tt >= ts && tt < ts + 0.12) rec = Math.max(rec, 1 - (tt - ts) / 0.12);
          const bx = -Math.cos(ang) * rec, by = -Math.sin(ang) * rec;
          atDepth(ctx, emi, S, h.z || 0, () => {
            // the soul itself (its shooting mode, turned to its aim; kicked back by each shot)
            if (tt < tAimEnd && h.a > 0.001) {
              F.spr(ctx, MV.heartImg('heartYellowFlip', h.crack, h.seal || 0), h.x + bx * 2, h.y + by * 2, { sc: h.sc, rot: ang + Math.PI / 2, alpha: h.a, ax: 8, ay: 8 });
              if (emi) F.glowAt(emi, h.x, h.y, 14 + 10 * h.glow, MV.COL.S.yellow, (0.3 + 0.5 * h.glow) * h.a);
            }
            // the gun on its point
            const g = gunAt(tt, S);
            F.spr(ctx, gun, g[0] + bx * 5, g[1] + by * 5, { sc: 2, ax: 3, ay: 3, rot: ang, alpha: U.clamp((tt - SW.yellow - 0.12) / 0.1) });
          });
        },
      });
      TL.add({
        t0: tM[0] - 0.02, t1: at(65, 3, 1), z: -18, keep: true, live: true, name: 'dead eye (on him)',
        draw(ctx, emi, tt, S) {
          // the trajectories: a dashed line from the soul to each mark from the moment it is laid until
          // its shot runs down it (drawn in quickly; the dashes creep toward him)
          const q = soulK(tt, S);
          MKfix.forEach((m, i) => {
            const v = tt - tM[i], w = tt - tS[i];
            if (v < 0 || w >= 0) return;
            const u = U.eOut(U.clamp(v / 0.07)), cur = tt >= tS[i] - 0.07 || (tt >= tM[i] && tt < (tM[i + 1] ?? tS[0]));
            ctx.save(); ctx.strokeStyle = '#ffe66a'; ctx.lineWidth = cur ? 2.5 : 2; ctx.globalAlpha = cur ? 0.95 : 0.55;
            ctx.setLineDash([9, 7]); ctx.lineDashOffset = -tt * 60;
            ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(U.lerp(q[0], m[0], u), U.lerp(q[1], m[1], u)); ctx.stroke(); ctx.restore();
          });
          // the marks (his plane: they stay on him): red X, a lock flash; shot, a star and rings
          MKfix.forEach((m, i) => {
            const v = tt - tM[i], w = tt - tS[i];
            if (v < 0 || w > 0.5) return;
            if (w < 0) { const s = U.eOutBack(U.clamp(v / 0.08)); F.spr(ctx, ART('markX'), m[0], m[1], { sc: 3 * s, ax: 3.5, ay: 3.5 }); ring(ctx, m[0], m[1], 6 + 30 * U.eOut(U.clamp(v / 0.2)), 2, '#ff3a3a', 1 - U.clamp(v / 0.2)); return; }
            if (i < 2) { F.spr(ctx, BL.white(B.prop('star')), m[0], m[1], { sc: 3.2 * (1 - w / 0.5), ax: 3.5, ay: 3.5, rot: w * 5 }); ring(ctx, m[0], m[1], 6 + 90 * U.eOut(w / 0.5), 2, '#fff6c0', 1 - w / 0.5); }
            if (emi && w < 0.2) F.glowAt(emi, m[0], m[1], 40, HEX.yellow, 0.5 * (1 - w / 0.2));
          });
          // the shots: a streak from the gun to the mark (the soul's depth to his)
          tS.forEach((ts, i) => {
            const w = tt - ts;
            if (w < 0 || w > 0.07) return;
            const g = S ? MV.depthPt(S, gunAt(ts, S), ZJ, ZK) : gunAt(ts, S), m = MKfix[i], u = U.clamp(w / 0.045);
            ctx.save(); ctx.strokeStyle = '#fff6c0'; ctx.globalAlpha = 1 - U.clamp((w - 0.045) / 0.025); ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(g[0], g[1]); ctx.lineTo(U.lerp(g[0], m[0], u), U.lerp(g[1], m[1], u)); ctx.stroke(); ctx.restore();
          });
        },
      });
      // (the game shows a many-shot weapon's damage once, after the last: 88 + 96 + 109)
      tS.forEach((ts, i) => { H.sfx(ts, i < 2 ? 'Gunshot' : 'Gunshot2', i < 2 ? 0.34 : 0.5); if (i < 2) TL.impact(ts, { amp: 4, dx: 0.6, zoom: 0.015, flash: 0.06, dur: 0.22 }); });
      TL.invulnSpans.push([tS[2] - 0.05, tS[2] + stop + 0.05]);
      H.blow(tS[2], { hex: HEX.yellow, at: CHEST, dir: [0.8, 0.1], pow: 1.3, stop, hp: HPS.yellow, readout: { pips: 'yellow', out: ['yellow'] }, sfx: [['Sparkles', 0.3]],
        cam: { snap: { x: CHEST[0], y: CHEST[1] + 10, zoom: 1.95, pitch: 0.05, yaw: -0.05, fov: 0.8 }, back: { x: 380, y: 150, zoom: 1.3, yaw: 0.2, pitch: 0.08 }, backDur: 0.3 } });
      // the camera: a stand-off - low at the jar's height, the soul at the left, him across the hall
      cut(SW.yellow, { x: 372, y: 124, zoom: 1.42, pitch: 0.05, yaw: 0.22, fov: 0.85 });
      move(SW.yellow, tS[0] - 0.02, { zoom: 1.52 }, 'lin');
      // his answer: fire at the soul's jar - it is off it, up onto the green jar
      const tV = at(65, 0, 11), vol = [];
      for (let k = 0; k < 3; k++) { const src = MV.spearTip(tV, 0.95), dst = [P[0] + (k - 1) * 10, P[1] + (k - 1) * 6], dur = 0.42 + k * 0.04, tt0 = tV + k * 0.04; vol.push({ t0: tt0, t1: tt0 + dur + 0.04, hr: 7, sc: 1.6, z: (t) => U.lerp(ZK, ZJ, U.clamp((t - tt0) / dur)), p: B.seg(tt0, tt0 + dur, src, dst) }); }
      H.shots(vol, { name: 'his answer', clip: null, z: 20 });
      H.act(tV, 'raise', 'slam', { windDur: 0.14, hold: 0.2, after: 'brace' });
      H.sfx(tV, 'BgFlame', 0.3);
      TL.add({ t0: tV + 0.46, t1: tV + 1.0, z: 39, name: 'on the empty lid', draw(ctx, emi, tt, S) { atDepth(ctx, emi, S, ZJ, () => motes(ctx, P[0], P[1] + 4, (tt - tV - 0.46) / 0.54, ['#ffe6a8', '#ffb048', '#ffffff'], 16, 4, 40, 5)); } });
      flyTo(at(65, 0, 12), at(65, 0, 14), perch('green'), { lift: 40, spin: 1 });
      land('green', at(65, 0, 14));
    }

    // ================================================================ 66-67 · green - care, and the blow thrown back
    {
      const P = perch('green'), BLK = [at(66, 0, 2), at(66, 0, 6)];
      answer('green', SW.green, { items: ['apron', 'pan'], rate: 1.12 });
      // he throws his fire at it: the glass takes it; it turns to green light, drifting home to its jar
      const fb = BLK.map((tb, i) => { const t0 = tb - 0.34, src = MV.spearTip(t0, 0.95), dst = [P[0] + 14, P[1] + 8 - i * 6]; return { t0, t1: tb, hr: 7, sc: 1.7, z: (t) => U.lerp(ZK, ZJ, U.clamp((t - t0) / 0.34)), p: B.seg(t0, tb, src, dst, 'in') }; });
      H.shots(fb, { name: 'his fire at the glass', clip: null, z: 20 });
      BLK.forEach((tb) => { H.sfx(tb, 'Frypan', 0.32); H.sfx(tb, 'Impact', 0.2); TL.impact(tb, { amp: 4, dx: -0.6, zoom: 0.012, dur: 0.22 }); });
      [at(66) - 0.1, at(66, 0, 4) - 0.1].forEach((t) => H.act(t + 0.1, 'raise', 'slam', { windDur: 0.12, hold: 0.15, after: 'brace' }));
      // the glass round it: UT's green ring and an arc of the shield's glass on his side (src/fight.js)
      const glassUntil = at(66, 0, 8);
      TL.add({
        t0: SW.green + 0.1, t1: glassUntil + 0.15, z: 42, keep: true, name: 'green glass',
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt), k = U.clamp((tt - SW.green - 0.1) / 0.12) * (1 - U.clamp((tt - glassUntil) / 0.15));
          let fl = 0, rc = 0;
          for (const tb of BLK) if (tt >= tb && tt < tb + 0.3) { fl = Math.max(fl, 1 - (tt - tb) / 0.12); rc = Math.max(rc, Math.exp(-(tt - tb) * 14) * 5); }
          const src = MV.spearTip(tt, 0.9), ang = Math.atan2(src[1] - h.y, src[0] - h.x);
          atDepth(ctx, emi, S, h.z || 0, () => B.shieldArc(ctx, emi, h.x, h.y, ang, { k, flash: fl, recoil: rc }));
          // what it took: green light, drifting off toward its jar
          BLK.forEach((tb, i) => { const u = (tt - tb) / 0.9; if (u > 0 && u < 1) atDepth(ctx, emi, S, ZJ, () => motes(ctx, P[0] + 18, P[1] + 4, u, ['#46e870', '#d4ffe0', '#8dffaa'], 14, 4, 46, tb + i)); });
        },
      });
      // down from the jar to stand before him, the pane raised
      const tDn0 = at(66, 0, 8), tDn1 = at(66, 2, 1), Ps = [C[0], 300, 0];
      flyTo(tDn0, tDn1, Ps, { lift: -20, ease: 'inOut' });
      cut(SW.green, { x: 300, y: 104, zoom: 1.5, pitch: -0.12, yaw: 0.18, fov: 0.85 });
      move(SW.green, tDn0, { zoom: 1.58, x: 290 }, 'lin');
      cut(tDn0, { x: 440, y: 230, zoom: 1.12, pitch: 0.1, yaw: 0.1, fov: 0.85 });
      // ---- 67: his all-out blow - what is left of it: three of the six are the child's now. Down
      // onto the pane; held; the pane throws it back into him
      const tIn = at(66, 2, 2), tSw = at(66, 3, 2), tHit = at(67), hold = T.s16;
      const tRel = FIN.allOut({ tIn, tSw, tHit, hold, soul: [Ps[0], Ps[1]], gone: ['orange', 'yellow', 'green'], clip: null, crescentHold: 0.02, frontTrident: false });
      TL.invulnSpans.push([tHit - 0.06, at(67, 1, 2)]);
      const tBack = at(67, 0, 3), tH2 = at(67, 0, 6), stop2 = 0.12, GONE = ['orange', 'yellow', 'green'];
      // the pane: the green glass (the shield's), before the soul, toward him; the blow lands on it
      TL.add({
        t0: tDn1 - 0.1, t1: tH2 + 0.3, z: 39, keep: true, live: true, name: 'the pane',
        draw(ctx, emi, tt) {
          const h = TL.heart.at(Math.min(tt, tBack)), k = U.clamp((tt - tDn1 + 0.1) / 0.14) * (1 - U.clamp((tt - tBack - 0.15) / 0.2));
          if (k <= 0.01) return;
          const press = tt >= tHit && tt < tBack ? 1 : 0, shake = press ? U.noise(tt * 70) * 2 : 0;
          const fl = tt >= tHit && tt < tHit + 0.1 ? 1 : tt >= tBack && tt < tBack + 0.12 ? 1 - (tt - tBack) / 0.12 : 0;
          const blocks = tt >= tHit ? [{ t: tHit, dx: 0, dy: -10 }, ...(tt >= tBack ? [{ t: tBack, dx: 0, dy: -6 }] : [])] : [];
          B.shieldFP(ctx, tt, { x: h.x + shake, y: h.y - 34 + 4 * press, sc: 0.62, rot: 0, a: k, flash: fl, blocks });
          if (emi) F.glowAt(emi, h.x, h.y - 34, 70, '#46e870', (0.25 + 0.5 * fl) * k);
        },
      });
      // the crescent held on the glass, shuddering (from his release to the throw), then thrown
      // back into him, turned over
      TL.add({
        t0: tRel, t1: tH2 + 0.02, z: 38.5, keep: true, live: true, name: 'thrown back',
        draw(ctx, emi, tt) {
          // (the crescent about its hollow, (98, 66) of the sheet's frame)
          const img = FIN.crescentImg(5, GONE), h = TL.heart.at(tRel), pane = [h.x, h.y - 34];
          if (tt < tBack) {
            // held on the glass: pressing down on it, squeezed smaller and smaller, shuddering
            const v = U.clamp((tt - tRel) / (tBack - tRel)), s = U.lerp(1.5, 0.75, U.eIn(v)), sh = U.noise(tt * 80) * 3 * (1 - 0.5 * v);
            F.spr(ctx, img, pane[0] + sh, pane[1] - 46 * s, { sc: s, ax: 98, ay: 66 });
            motes(ctx, pane[0], pane[1] - 8, ((tt - tRel) % 0.12) / 0.12, ['#46e870', '#ffffff', HEX.purple, HEX.aqua], 14, 6, 60, R(tt * 20));
            if (emi) F.glowAt(emi, pane[0], pane[1] - 20, 80, '#46e870', 0.45);
          } else {
            // thrown back, turned over, into his chest
            const u = U.eIn(U.clamp((tt - tBack) / (tH2 - tBack))), cx = U.lerp(pane[0], CHEST[0], u), cy = U.lerp(pane[1] - 34, CHEST[1], u);
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI * U.eOut(U.clamp((tt - tBack) / 0.14)));
            F.spr(ctx, img, 0, 0, { sc: U.lerp(0.75, 1.1, u), ax: 98, ay: 66 }); ctx.restore();
            for (let m = 1; m <= 6; m++) { const v = U.eIn(U.clamp((tt - m * 0.016 - tBack) / (tH2 - tBack))); D.rect(ctx, R(U.lerp(pane[0], CHEST[0], v)) - 3, R(U.lerp(pane[1] - 34, CHEST[1], v)) - 3, 6, 6, FIN.SPEC7[m % 7], 0.55 * (1 - m / 7)); }
            if (emi) F.glowAt(emi, cx, cy, 70, '#46e870', 0.4);
          }
        },
      });
      H.sfx(tBack, 'Bell', 0.4); H.sfx(tBack, 'SwipeShort', 0.35); H.sfx(tRel, 'GlassBreak', 0.25);
      TL.impact(tBack, { amp: 9, dy: -1, zoom: 0.03, flash: 0.14, flashCol: [0.6, 1, 0.7], flashDecay: 10, dur: 0.35 });
      TL.heart.to(tRel, tRel + 0.05, { glow: 1.8, sc: 1.3 }, 'out').to(tBack, tBack + 0.2, { glow: 0.6, sc: 1 }, 'inOut');
      H.blow(tH2, { hex: HEX.green, at: CHEST, dir: [0, -1], pow: 1.6, stop: stop2, hp: HPS.green, readout: { pips: 'green', out: ['green'] }, sfx: [['Frypan', 0.5], ['CineCut', 0.5]],
        cam: { snap: { x: CHEST[0], y: CHEST[1] + 30, zoom: 1.85, pitch: 0.1, yaw: 0, roll: 0.02, fov: 0.8 }, back: { x: 560, y: 150, zoom: 1.12, roll: 0, yaw: -0.16, pitch: 0.1 }, backDur: 0.4 } });
      // (he answers it as at 52: the stroke held; then braced)
      H.pose(at(67, 1, 2), at(67, 2, 2), 'brace', 'inOut', { crouch: 6, flare: 0.8, grot: -0.2, gy: 6 });
      // the camera for the throw: wide enough for both
      cut(tBack - 0.01, { x: 480, y: 222, zoom: 1.18, pitch: 0.08, fov: 0.85 });
      // over his right shoulder to the light-blue jar, high
      flyTo(at(67, 0, 9), at(67, 0, 14), perch('aqua'), { lift: 150, spin: 1, ease: 'inOut' });
      land('aqua', at(67, 0, 14));
      H.whip(at(67, 0, 11), { x: 640, y: 120, zoom: 1.2, pitch: -0.06, yaw: -0.2, fov: 0.85 }, { dur: 0.12, dx: 1, amp: 4 });
    }

    // ================================================================ 68 · light blue - still, then one sharp cut
    {
      const P = perch('aqua'), tR = [at(68, 0, 2), at(68, 0, 4)], tK = at(68, 0, 5), tHit = at(68, 0, 6), stop = 0.09;
      answer('aqua', SW.aqua, { items: ['ribbon', 'knife'], rate: 0.8 });
      // his rings of light-blue fire out of him through the hall - it does not move, they pass
      const rings = [];
      tR.forEach((t0, i) => rings.push(...B.ring({ t0, t1: t0 + 0.7, R0: 30, R1: 760, n: 44, a0: i * 0.07, rule: 'aqua', hex: B.RULE.aqua, c: CHEST, ease: 'out' }).map((s) => Object.assign(s, { z: 140 }))));
      H.shots(rings, { name: 'his light blue', clip: null, z: 18, keep: true });
      tR.forEach((t) => { B.tone(t, 'aqua', 0.3); H.sfx(t, 'Spellcast', 0.24); });
      H.act(tR[0], 'raise', 'slam', { windDur: 0.14, hold: 0.2, after: 'brace' });
      // the world stops, grey (the clock in it too): only it, its knife and his light blue keep colour
      TL.look2.to(tR[0], tR[0] + 0.06, { gray: 1 }, 'out').to(tHit, tHit + 0.04, { gray: 0 }, 'out');
      TL.king.to(tR[0], tR[0] + 0.1, { breathe: 0 }, 'out').to(tHit + 0.4, tHit + 0.8, { breathe: 1 }, 'inOut');
      H.sfx(tR[0] + 0.02, 'Drone', 0.18);
      // the knife: at the soul's side from the wait, turned on him; then one cut - a sixteenth
      const knife = B.prop('knife'), A = [CHEST[0] - 150, CHEST[1] - 110], Bq = [CHEST[0] + 150, CHEST[1] + 120];
      const p0Of = (t) => { const h = TL.heart.at(t); return [h.x - 18, h.y + 4]; }, angOf = (p) => Math.atan2(CHEST[1] - p[1], CHEST[0] - p[0]);
      TL.add({
        t0: SW.aqua + 0.2, t1: tK, z: 42, keep: true, name: 'the knife, waiting',
        draw(ctx, emi, tt, S) { const h = TL.heart.at(tt), p0 = p0Of(tt); atDepth(ctx, emi, S, h.z || 0, () => F.spr(ctx, knife, p0[0], p0[1], { sc: 2, ax: 9, ay: 2, rot: angOf(p0), alpha: U.clamp((tt - SW.aqua - 0.2) / 0.15) })); },
      });
      // its flight and the cut across him, light blue, opening and going (his plane)
      TL.add({
        t0: tK, t1: tHit + stop + 0.5, z: -18, keep: true, live: true, name: 'a sharp attack',
        draw(ctx, emi, tt, S) {
          if (tt < tHit) {
            const p0 = p0Of(tK), q = S ? MV.depthPt(S, p0, ZJ, ZK) : p0, u = U.eIn(U.clamp((tt - tK) / (tHit - tK)));
            F.spr(ctx, knife, U.lerp(q[0], CHEST[0], u), U.lerp(q[1], CHEST[1], u), { sc: 2 + 1.5 * u, ax: 9, ay: 2, rot: angOf(p0) });
            return;
          }
          const w = tt - tHit, op = U.clamp(w / 0.03), sp = U.clamp((w - stop) / 0.3);
          BL.blade(ctx, A, Bq, 12 * (1 - sp) * op, { col: B.RULE.aqua, core: '#f0fbff', rim: '#06203a', cut: sp > 0 ? [0.5 * sp, 1 - 0.5 * sp] : [0, op], crumb: 0.12 });
          if (emi) F.glowAt(emi, CHEST[0], CHEST[1], 90, B.RULE.aqua, 0.4 * (1 - sp));
        },
      });
      H.sfx(tK, 'Saber', 0.34); H.sfx(tHit, 'Laz', 0.45);
      H.blow(tHit, { hex: B.RULE.aqua, at: CHEST, dir: [0.55, 0.6], pow: 1.3, stop, hp: HPS.aqua, readout: { pips: 'aqua', out: ['aqua'] }, sfx: [['Saber', 0.4]],
        cam: { snap: { x: CHEST[0] + 10, y: CHEST[1], zoom: 1.9, pitch: 0.05, yaw: -0.08, roll: 0.02, fov: 0.8 }, back: { x: 620, y: 120, zoom: 1.32, roll: 0, yaw: -0.22, pitch: 0.05 }, backDur: 0.32 } });
      // the camera: still (patience) - from the jar's side, him across, the soul small and high
      cut(SW.aqua, { x: 640, y: 96, zoom: 1.42, pitch: 0.02, yaw: -0.22, fov: 0.85 });
      // his answer: fire at its jar - it drops to the blue one
      const tV = at(68, 0, 10), vol = [];
      for (let k = 0; k < 3; k++) { const src = MV.spearTip(tV, 0.95), dst = [P[0] + (k - 1) * 12, P[1] + 4], dur = 0.36 + k * 0.04, tt0 = tV + k * 0.04; vol.push({ t0: tt0, t1: tt0 + dur + 0.04, hr: 7, sc: 1.6, z: (t) => U.lerp(ZK, ZJ, U.clamp((t - tt0) / dur)), p: B.seg(tt0, tt0 + dur, src, dst) }); }
      H.shots(vol, { name: 'his answer', clip: null, z: 20 });
      H.act(tV, 'raise', 'slam', { windDur: 0.14, hold: 0.2, after: 'brace' });
      flyTo(at(68, 0, 12), at(68, 0, 14), perch('blue'), { lift: 26 });
      land('blue', at(68, 0, 14));
    }

    // ================================================================ 69 · blue - hopping and twirling
    {
      const P = perch('blue'), tUp = at(69, 0, 2), tTop = at(69, 0, 4), tDrop = at(69, 0, 5), tHit = at(69, 0, 6), stop = 0.1, TOP = [600, 2, 145];
      answer('blue', SW.blue, { items: ['tutu', 'shoe'], rate: 0.95 });
      // his fire under it: a rain round him the leap goes over (low, sparse)
      H.act(at(69, 0, 1), 'high', 'slam', { windDur: 0.12, hold: 0.25, after: 'brace' });
      const hail = B.hail({ t0: at(69, 0, 3), t1: at(69, 2), vel: [70, 250], spacing: 118, seed: 53, at: [470, 330] })
        .filter((s) => { for (let t = s.t0; t < s.t1; t += 0.02) { const p = s.p(t); if (p && (p[1] < 200 || p[0] > 680 || p[0] < 300)) return false; } return true; });
      hail.forEach((s) => { s.z = 60; });
      H.shots(hail, { name: 'his rain', clip: null, z: 17 });
      H.sfx(at(69, 0, 1), 'BgFlame', 0.3);
      // up and over, turning (en pointe); hung at the top, the sole turned down; then down onto him
      flyTo(tUp, tTop, TOP, { lift: 24, spin: 1, ease: 'out' });
      H.hPath(tTop, tDrop, (t) => [TOP[0] - 6 * U.clamp((t - tTop) / (tDrop - tTop)), TOP[1] - 3 * Math.sin(Math.PI * U.clamp((t - tTop) / (tDrop - tTop)))]);
      flyTo(tDrop, tHit, [CHEST[0] + 14, CHEST[1] - 18, ZK + 4], { ease: 'in2' });
      TL.heart.to(tTop, tDrop, { glow: 1.3 }, 'inOut');
      H.sfx(tTop, 'Chime', 0.24); H.sfx(tDrop, 'SwipeShort', 0.3);
      const sole = ART('shoeSole'), star = ART('blueStar');
      TL.add({
        t0: tTop - 0.05, t1: tHit, z: 42, keep: true, name: 'the sole',
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt), k = U.clamp((tt - tTop + 0.05) / 0.1), turn = U.clamp((tt - tTop) / (tDrop - tTop));
          atDepth(ctx, emi, S, h.z || 0, () => F.spr(ctx, sole, h.x + 4, h.y + 10, { sc: 1 + 0.6 * U.clamp((tt - tDrop) / (tHit - tDrop)), ax: 9, ay: 2, rot: U.lerp(-2.2, -0.6, U.eOut(turn)), alpha: k }));
        },
      });
      // the kick on him (his plane): the sole; the game's ring of stars off it
      TL.add({
        t0: tHit, t1: tHit + stop + 0.55, z: -18, keep: true, live: true, name: 'the sole on him',
        draw(ctx, emi, tt) {
          const w = tt - tHit, a = 1 - U.clamp((w - stop - 0.05) / 0.25);
          F.spr(ctx, sole, CHEST[0] + 8, CHEST[1] - 22, { sc: 2.4, ax: 9, ay: 2, rot: -0.6, alpha: a });
          for (let m = 0; m < 8; m++) { const ang = (m / 8) * TAU + w * 3, r = 20 + U.eOut(U.clamp(w / 0.5)) * 130; F.spr(ctx, star, CHEST[0] + Math.cos(ang) * r, CHEST[1] + Math.sin(ang) * r * 0.85, { sc: 3, ax: 3.5, ay: 3.5, rot: w * 6, alpha: a }); }
        },
      });
      TL.invulnSpans.push([tDrop, tHit + stop + 0.05]);
      H.blow(tHit, { hex: HEX.blue, at: CHEST, dir: [-0.3, 0.9], pow: 1.35, stop, hp: HPS.blue, readout: { pips: 'blue', out: ['blue'] }, sfx: [['PunchStrong', 0.45], ['Star', 0.35]],
        cam: { snap: { x: CHEST[0] + 20, y: CHEST[1] - 10, zoom: 1.95, pitch: -0.08, yaw: -0.1, roll: -0.03, fov: 0.8 }, back: { x: 600, y: 150, zoom: 1.2, roll: 0, yaw: -0.24, pitch: 0.06 }, backDur: 0.34 } });
      // the camera: from the side, the arc of the leap in it; it rides up with the soul
      cut(SW.blue, { x: 640, y: 130, zoom: 1.36, pitch: 0.06, yaw: -0.26, fov: 0.85 });
      move(tUp, tTop, { y: 70, zoom: 1.3, x: 600 }, 'out');
      // off him, twirling, down onto the purple jar
      flyTo(tHit + stop + 0.02, at(69, 0, 14), perch('purple'), { lift: 90, spin: 2 });
      land('purple', at(69, 0, 14));
    }

    // ================================================================ 70 · purple - trapped, taking notes, to the end
    {
      const P = perch('purple'), tL = at(70, 0, 1), tRun = at(70, 0, 2), tHit = at(70, 0, 6), stop = 0.1;
      answer('purple', SW.purple, { items: ['glasses', 'book'], rate: 0.9 });
      // his trap: the ruled lines across the hall, the soul on one, his words coming along them
      const LINES = [P[1] - 38, P[1], P[1] + 38], X0 = 528, X1 = 800;
      const words = [], WRD = ['困住', '绝望', '恐惧'];
      const RUN = (t) => U.lerp(P[0], CHEST[0] + 26, U.eIn(U.clamp((t - tRun) / (tHit - tRun))));
      // (out of his side along the lines at the soul: the one on its own line meets it as it runs and
      // is struck out there; the others go past)
      [[0, at(70, 0, 1.5), 0], [1, at(70, 0, 2), 1], [2, at(70, 0, 2.5), 2]].forEach(([li, t0, wi]) => {
        const img = FX.wordImg(WRD[wi]), y = LINES[li], sp = 340, x0 = X0 + 16, xAt = (t) => x0 + sp * (t - t0);
        let tc = null;
        if (li === 1) for (let t = t0; t < tHit; t += 0.005) if (xAt(t) >= RUN(t) - 26) { tc = t; break; }
        words.push({ img, li, t0, tc, xAt, y });
      });
      const drawWords = (ctx, emi, tt) => {
        for (const w of words) {
          if (tt < w.t0) continue;
          const x = w.xAt(Math.min(tt, w.tc ?? tt));
          if (w.tc && tt >= w.tc) {
            const v = (tt - w.tc) / 0.35;
            if (v >= 1) continue;
            F.spr(ctx, w.img, x, w.y, { sc: 2, ax: w.img.width / 2, ay: 9, alpha: 1 - v });
            // struck out: the pen's scrawl through it, the ink breaking up
            ctx.save(); ctx.strokeStyle = '#f0d8ff'; ctx.lineWidth = 2; ctx.globalAlpha = 1 - v; ctx.beginPath();
            for (let i = 0; i <= 8; i++) { const q = U.clamp(v * 4) * i / 8; ctx.lineTo(x - w.img.width + 2 * w.img.width * q, w.y + (i % 2 ? -7 : 7)); }
            ctx.stroke(); ctx.restore();
            motes(ctx, x, w.y, v, [HEX.purple, '#f0d8ff', '#22082e'], 12, 4, 36, w.t0);
            continue;
          }
          if (x > X1 + 40) continue;
          F.spr(ctx, w.img, x, w.y, { sc: 2, ax: w.img.width / 2, ay: 9, alpha: U.clamp((tt - w.t0) / 0.08) });
          if (emi) F.glowAt(emi, x, w.y, 24, HEX.purple, 0.25);
        }
      };
      // (as shots: the ones on the other lines; the soul's own line's are struck out before they touch)
      H.shots(words.filter((w) => !w.tc).map((w) => ({ t0: w.t0, t1: w.t0 + 1.2, hw: w.img.width - 4, hh: 9, z: ZJ - 20, draw: () => {}, p: (t) => [w.xAt(t), w.y] })), { name: 'his words', clip: null, z: 15 });
      TL.add({
        t0: tL - 0.05, t1: tHit + stop + 0.6, z: 40, keep: true, name: 'the trap',
        draw(ctx, emi, tt, S) {
          atDepth(ctx, emi, S, ZJ - 20, () => {
            const k = U.clamp((tt - tL + 0.05) / 0.12) * (1 - U.clamp((tt - tHit - stop) / 0.4));
            // (the game's trap: the soul held to its line; drawn out from his side to the soul's)
            LINES.forEach((y, i) => {
              const x0 = U.lerp(X1, X0, U.eOut(U.clamp((tt - tL - i * 0.03) / 0.12)));
              D.rect(ctx, R(x0), R(y) - 2, R(X1 - x0), 3, i === 1 ? '#d8b8ff' : '#9c6ad8', 0.9 * k);
              if (emi) D.rect(emi, x0, y - 4, X1 - x0, 8, HEX.purple, 0.25 * k);
            });
            drawWords(ctx, emi, tt);
          });
        },
      });
      H.sfx(tL, 'Swipe', 0.26); words.forEach((w) => { H.sfx(w.t0, 'BookSpin', 0.1); if (w.tc) H.sfx(w.tc, 'Arrow', 0.22); });
      H.act(tL, 'raise', 'slam', { windDur: 0.1, hold: 0.2, after: 'brace' });
      // it runs its line to the end - to him
      H.hPath(tRun, tHit, (t) => [RUN(t), P[1] + (CHEST[1] - P[1]) * U.eIn(U.clamp((t - tRun) / (tHit - tRun)))]);
      TL.heart.to(tRun, tHit, { z: ZK + 4 }, 'in');
      TL.invulnSpans.push([tHit - 0.03, tHit + stop + 0.05]);
      // the notebook spinning into him, the star-shaped shock
      const book = B.prop('book');
      TL.add({
        t0: tRun, t1: tHit, z: 42, keep: true, name: 'the notebook',
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt), ph = (tt - tRun) * 22;
          atDepth(ctx, emi, S, h.z || 0, () => { ctx.save(); ctx.translate(R(h.x - 16), R(h.y - 4)); ctx.rotate(-ph * 0.3); ctx.scale(2 * Math.max(0.15, Math.abs(Math.cos(ph))), 2); ctx.drawImage(book, -10.5, -5.5); ctx.restore(); });
        },
      });
      // on him (his plane): the notebook spinning into him, the star-shaped shock
      TL.add({
        t0: tHit, t1: tHit + stop + 0.6, z: -18, keep: true, live: true, name: 'the notebook on him',
        draw(ctx, emi, tt) {
          const w = tt - tHit, u = U.clamp(w / 0.5), c = CHEST;
          ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = '#d27cff'; ctx.lineWidth = 5; ctx.beginPath();
          for (let i = 0; i <= 16; i++) { const a = -w * 2 + (i / 16) * TAU, r = (20 + U.eOut(u) * 190) * (i % 2 ? 0.5 : 1); ctx.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r); }
          ctx.closePath(); ctx.stroke(); ctx.restore();
          ctx.save(); ctx.translate(c[0], c[1] + 4); ctx.rotate(w * 8); ctx.scale(4.2, 4.2); ctx.globalAlpha = 1 - U.clamp((w - stop) / 0.3); ctx.drawImage(book, -10.5, -5.5); ctx.restore(); ctx.globalAlpha = 1;
        },
      });
      H.blow(tHit, { hex: HEX.purple, at: CHEST, dir: [-0.8, -0.2], pow: 1.45, stop, hp: HPS.purple, readout: { pips: 'purple', out: ['purple'] }, sfx: [['BookSpin', 0.5], ['Star', 0.3]],
        cam: { snap: { x: CHEST[0] - 10, y: CHEST[1] + 10, zoom: 2.0, pitch: 0.05, yaw: 0.08, roll: 0.02, fov: 0.8 }, back: { x: 480, y: 210, zoom: 1.1, roll: 0, yaw: 0, pitch: 0.08 }, backDur: 0.4 } });
      cut(SW.purple, { x: 600, y: 150, zoom: 1.45, pitch: 0.05, yaw: -0.18, fov: 0.85 });
      move(tRun, tHit - 0.02, { x: 560, zoom: 1.6 }, 'in');
      // off him, down before him: the place it will stand for the end
      flyTo(tHit + stop + 0.04, at(70, 3), [C[0], 300, 0], { lift: 40, spin: 1 });
    }
    // with the last of what he borrowed gone, he has his own red only
    TL.tridentBands.to(at(70, 0, 7), at(70, 1, 2), { rb: 0, flow: 0 }, 'inOut');

    // ================================================================ 71 · the six (the walk-up)
    // the red flag's six words, two a step, in their colours round the soul - its ribbons, the jars
    // lit with them; then into it. He lifts the trident one last time - nothing on it but his red
    {
      const STEPS = [at(71), at(71, 1), at(71, 2), at(71, 3)];
      const PAIRS = [[['勇敢', 'orange'], ['正义', 'yellow']], [['善良', 'green'], ['耐心', 'aqua']], [['正直', 'blue'], ['毅力', 'purple']]];
      TL.heartMode.set(T71 - 0.02, 'red');
      TL.heart.to(T71 - 0.1, T71 + 0.1, { glow: 0.8, sc: 1.1 }, 'out');
      const placed = [];
      PAIRS.forEach((pr, i) => pr.forEach(([w, key], j) => {
        const ang = -Math.PI / 2 + (i * 2 + j) * (TAU / 6) + 0.3;
        placed.push({ img: flagWord(w, key), key, t: STEPS[i] + j * 0.06, ang });
        TL.jar[key].to(STEPS[i], STEPS[i] + 0.06, { glow: 3 }, 'out').to(STEPS[i] + 0.3, STEPS[3], { glow: 2 }, 'inOut');
        H.sfx(STEPS[i] + j * 0.06, 'Chime', 0.26, { rate: +(0.9 + 0.08 * (i * 2 + j)).toFixed(2) });
      }));
      TL.add({
        t0: STEPS[0], t1: tIn + 0.4, z: 44, keep: true, name: 'the six',
        draw(ctx, emi, tt) {
          const h = TL.heart.at(tt);
          for (const p of placed) {
            const v = tt - p.t;
            if (v < 0) continue;
            const into = U.eIn(U.clamp((tt - tIn) / 0.22)), r = (64 + 4 * Math.sin(tt * 3 + p.ang)) * (1 - into), a = U.clamp(v / 0.1) * (1 - U.clamp((tt - tIn - 0.18) / 0.06));
            const x = h.x + Math.cos(p.ang + tt * 0.4) * r * 1.3, y = h.y + Math.sin(p.ang + tt * 0.4) * r;
            F.spr(ctx, v < 0.06 ? F.tint(p.img, '#ffffff') : p.img, x, y, { sc: 1 + 0.3 * (1 - U.eOut(U.clamp(v / 0.12))), ax: p.img.width / 2, ay: p.img.height / 2, alpha: a });
            if (emi) { F.glowAt(emi, x, y, 46, HEX[p.key], 1.0 * a); F.glowAt(emi, x, y, 24, HEX[p.key], 0.75 * a); }
          }
          const w = (tt - tIn - 0.2) / 0.5;
          if (w > 0 && w < 1) { ring(ctx, h.x, h.y, 6 + 60 * U.eOut(w), 4, '#ff3a2a', 1 - w); motes(ctx, h.x, h.y, w, FIN.SPEC7, 21, 4, 70, 71); }
        },
      });
      TL.heart.to(tIn + 0.15, tIn + 0.22, { glow: 2, sc: 1.6 }, 'out').to(tIn + 0.22, T72 - 0.02, { glow: 1.2, sc: 1.3 }, 'inOut');
      // and the crack it has carried since 52 lights up and closes: whole for the last blow
      TL.heart.to(tIn + 0.16, tIn + 0.22, { seal: 1 }, 'out').to(tIn + 0.24, tIn + 0.5, { crack: 0 }, 'in').set(tIn + 0.5, { seal: 0 });
      H.sfx(tIn + 0.18, 'SegaPower', 0.4);
      // the six worlds round the door as rings (the first who answered outermost), flung out at 72
      const BANDS = [[0.82, 3], [0.66, 0.82], [0.52, 0.66], [0.4, 0.52], [0.28, 0.4], [0, 0.28]];
      ORDER.forEach((k, i) => H.world(k, at(70, 3) + i * 0.08, T72, { band: BANDS[i], wipe: 0.3, burn: 0.35, burst: true, wind: false, glow: (tt) => (tt >= STEPS[Math.floor(i / 2)] ? 0.7 * Math.exp(-(tt - STEPS[Math.floor(i / 2)]) * 3) : 0) }));
      // he: the trident up once more (his red alone on it); then down - he will not guard
      H.pose(T71, T71 + 0.3, 'high', 'out', { flare: 0.9 });
      H.pose(at(71, 3), T72 + 0.2, 'droop', 'inOut', { grot: -0.34, gy: 16, hy: 2, flare: -0.1, crouch: 2 });
      // the camera: on the soul in its ring of words, him over it, slowly in and round it (then out to
      // the game's own picture as its frame comes back, below)
      cut(T71, { x: 480, y: 262, zoom: 1.16, pitch: 0.08, yaw: -0.07, fov: 0.85 });
      move(T71, tIn - 0.02, { zoom: 1.42, y: 288, yaw: 0.05 }, 'inOut');
    }

    // ================================================================ 71·4-73 · the last FIGHT
    // (user, 2026-10-06 night: the game's own attack bar for the last blow, one with the walk-up; the
    // camera better.) As the six go into the soul the game's frame comes back - what the soul broke
    // at 64, flying in from out of the picture - and shuts into the text box on 72's downbeat: the
    // game's picture again (the HUD, 战斗 lit, 仁慈's shards in their slot), the target open in it.
    // The soul has drawn back to where the cursor stands (its six ribbons stretched behind it like a
    // bowstring; on the downbeat they pour into it and let go - it burns red). The cursor creeps,
    // and lurches on with each accent of the last phrase's syncopation (72: 16ths 11, 14; 73: 0, 3,
    // 6) - the soul with it, right over it, low at first, then rising to his chest; a notch closer
    // each time. On the last note (73·8) the cursor is on the centre line - the press - and the soul
    // is through him (the line of the cut, the picture in hard black and white,
    // the red blade through his chest, the hall in Frisk's red, the picture held; released into the
    // silence). The target closes into its line as the number comes; he kneels behind the empty box.
    {
      // (the hall dark round the two of them: the dawn at the door, low)
      TL.look2.set(T72, { flames: 0.2, embers: 0.15, wall: 0.06, react: 0.4, dim: 0, shade: 0.25, letter: 0, sepia: 0, gray: 0 });
      TL.look2.to(T72, T72 + 0.8, { door: 0.5, dawn: 1 }, 'out');
      TL.tridentBands.set(T72, { yellow: 0, green: 0, purple: 0, blue: 0, orange: 0, aqua: 0, rb: 0, flow: 0 });
      TL.impact(T72, { amp: 12, zoom: 0.05, flash: 0.2, flashCol: [1, 0.5, 0.45], flashDecay: 8, dur: 0.5 });
      H.sfx(T72, 'Explosion', 0.3); H.sfx(T72, 'Bell', 0.3);
      TL.king.to(at(72, 2), at(72, 3), { breathe: 0 }, 'inOut');
      // his chest, where the soul starts from (the cursor's end of the target), its way between
      const LC = [482, FL.king[1] - 126], S0 = [208, 250];
      const path = (v) => [U.lerp(S0[0], LC[0], v), S0[1] + (LC[1] - S0[1]) * v * v];
      // the line of the cut: the way it goes into him
      const DIR = (() => { const a = path(0.96), b = path(1), d = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; })();
      // the blow's times: the picture held as long as the last note rings (it is gone by ~0.45 s,
      // README 最后一击 · 加重), released into the silence; he goes down when his bar is empty - on
      // the loop point
      const STOPL = 0.5, tLR = tP + STOPL, tK = at(74) + 0.06;
      // ---- the cursor (0 at the target's left end .. 1 on its centre line): it creeps; on each accent
      // it lurches on (two thirds of the way to the next in 0.06 s); the last sixteenth a dash home
      const tA = T72 + 0.05, ACC = [at(72, 2, 3), at(72, 3, 2), at(73), at(73, 0, 3), at(73, 1, 2)], tDash = tP - 0.05;
      const VK = [0.05, 0.22, 0.4, 0.57, 0.72, 0.86];
      const cursorV = (t) => {
        if (t <= tA) return 0;
        if (t < ACC[0]) return (VK[0] * (t - tA)) / (ACC[0] - tA);
        for (let i = 0; i < ACC.length; i++) {
          const a = ACC[i], b = i + 1 < ACC.length ? ACC[i + 1] : tDash;
          if (t < b) { const w = t - a; return VK[i] + (VK[i + 1] - VK[i]) * (0.65 * U.eOut(Math.min(1, w / 0.06)) + (0.35 * w) / (b - a)); }
        }
        return t < tP ? VK[5] + (1 - VK[5]) * U.eIn((t - tDash) / (tP - tDash)) : 1;
      };

      // ---- the frame comes back: the outline of the text box in pieces, in from out of the picture,
      // turning, each clicking into its place - the last on the downbeat, when the box is whole
      const tF0 = tIn + 0.04, TH = 5, MX0 = MENU.cx - MENU.w / 2, MX1 = MENU.cx + MENU.w / 2, MY0 = MENU.cy - MENU.h / 2, MY1 = MENU.cy + MENU.h / 2;
      const pieces = [];
      const piece = (x, y, w, h, i) => {
        const c = [x + w / 2, y + h / 2], d = [c[0] - MENU.cx, (c[1] - MENU.cy) * 2.5], L = Math.hypot(d[0], d[1]) || 1, far = 560 + 300 * U.hash(i * 3.7 + 1);
        pieces.push({ w, h, c, spin: (U.hash(i * 5.1 + 2) - 0.5) * 10, tL: T72 - 0.07 * U.hash(i * 7.7 + 3),
          from: [c[0] + (d[0] / L) * far + (U.hash(i * 1.9 + 4) - 0.5) * 160, c[1] + (d[1] / L) * far * 0.6 + (U.hash(i * 2.3 + 5) - 0.5) * 120] });
      };
      for (let k = 0; k < 10; k++) { const a = U.lerp(MX0 - TH, MX1 + TH, k / 10), b = U.lerp(MX0 - TH, MX1 + TH, (k + 1) / 10); piece(a, MY0 - TH, b - a, TH, k); piece(a, MY1, b - a, TH, k + 20); }
      for (let k = 0; k < 3; k++) { const a = U.lerp(MY0, MY1, k / 3), b = U.lerp(MY0, MY1, (k + 1) / 3); piece(MX0 - TH, a, TH, b - a, k + 40); piece(MX1, a, TH, b - a, k + 50); }
      TL.add({
        t0: tF0, t1: T72, z: 36, name: 'the frame comes back',
        draw(ctx, emi, t) {
          for (const q of pieces) {
            const u = U.clamp((t - tF0) / (q.tL - tF0)), e = U.eIn(u), x = U.lerp(q.from[0], q.c[0], e), y = U.lerp(q.from[1], q.c[1], e);
            ctx.save(); ctx.translate(R(x), R(y)); ctx.rotate(q.spin * (1 - e)); ctx.globalAlpha = U.clamp(u * 5); ctx.fillStyle = '#ffffff';
            ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); ctx.restore();
            if (emi && u > 0.6) D.rect(emi, x - q.w / 2 - 3, y - q.h / 2 - 3, q.w + 6, q.h + 6, '#ffffff', 0.2 * u);
          }
          ctx.globalAlpha = 1;
        },
      });
      H.sfx(tF0, 'SwipeShort', 0.22); H.sfx(T72 - 0.1, 'Pullback', 0.18);
      // the game's window, whole on the downbeat: the text box, the HUD (15 HP), 战斗 lit - the one
      // thing left to choose - and 仁慈's shards in their slot
      TL.box2.set(T72 - 0.003, Object.assign({ a: 0, rot: 0, round: 0, fill: 1, fa: 1, ak: 0, th: 5 }, MENU)).set(T72, { a: 1, th: 10 }).to(T72 + 0.02, T72 + 0.26, { th: 5 }, 'out');
      TL.hudT.set(T72 - 0.003, { shards: 1 }).to(T72, T72 + 0.14, { a: 1 }, 'out');
      TL.btn[0].set(T72 - 0.003, { sel: 1 }).to(T72, T72 + 0.1, { a: 1 }, 'out');
      // ---- the target, open in the box with it; the cursor; on the last note on the centre line -
      // the press: it blinks as the game's does. After the blow the target closes into its line (the
      // game's), the box left empty for what comes after
      const tC0 = tLR + 0.3, tC1 = tC0 + 0.26, XL = MENU.cx - MENU.w / 2 + 12;
      const cursorX = (t) => U.lerp(XL, MENU.cx, cursorV(t));
      TL.add({
        t0: T72, t1: tC1, z: 31, live: true, name: 'the last FIGHT',
        draw(ctx, emi, t) {
          const img = MV.frame('Target', 'Default', 0), sx = U.eOut(U.clamp((t - T72) / 0.06)) * (1 - U.eIn(U.clamp((t - tC0) / (tC1 - tC0))));
          if (sx <= 0.01) return;
          ctx.save(); ctx.translate(MENU.cx, MENU.cy); ctx.scale(sx, 1); ctx.drawImage(img, -img.width / 2, -img.height / 2); ctx.restore();
          if (t < tA) return;
          const w = t - tP, cur = MV.frame('TargetChoice', 'Default', w >= 0 && Math.floor(w * 14) % 2 ? 1 : 0), x = cursorX(t);
          ctx.globalAlpha = U.clamp((t - tA) / 0.04) * (1 - U.clamp((t - tC0) / 0.12));
          ctx.drawImage(cur, R(x - 7), R(MENU.cy - 64)); ctx.globalAlpha = 1;
          if (emi && w >= 0 && w < 0.4) F.glowAt(emi, x, MENU.cy, 46, '#ffffff', 0.35 * (1 - w / 0.4));
        },
      });

      // ---- the soul: drawn back to where the cursor stands as the frame comes; then over the cursor,
      // with it, rising to his chest (its depth with it: at him, it is where he is). On the last
      // accent (73·6) the breath before the blow (溜め, README 最后一击 · 加重): it stops short, draws
      // back - a little back down its way and toward us, shaking, smaller, white-hot at its heart -
      // and in the last sixteenth (詰め) it is into his chest
      const tB = ACC[4], tH0 = tB + 0.06, tT = tDash;
      const PH = path(cursorV(tH0)), PB = [PH[0] - DIR[0] * 12, PH[1] - DIR[1] * 12];
      const soulAt = (t) => {
        if (t < tH0) return path(cursorV(t));
        if (t < tT) { const u = U.eOut(U.clamp((t - tH0) / (tT - tH0))), sh = 1.8 * u; return [U.lerp(PH[0], PB[0], u) + U.noise(t * 57) * sh, U.lerp(PH[1], PB[1], u) + U.noise(t * 61 + 9) * sh]; }
        if (t < tP) { const e = U.eIn(U.clamp((t - tT) / (tP - tT))); return [U.lerp(PB[0], LC[0], e), U.lerp(PB[1], LC[1], e)]; }
        return [LC[0] + DIR[0] * 3000 * (t - tP), LC[1] + DIR[1] * 3000 * (t - tP)];
      };
      flyTo(tIn + 0.2, T72 - 0.02, [S0[0], S0[1], 0], { lift: 16, ease: 'out' });
      H.hPath(T72 - 0.02, tP + 0.03, soulAt);
      TL.heart.to(ACC[2], ACC[3] + 0.06, { z: 18 }, 'inOut').to(ACC[3] + 0.06, tH0, { z: 46 }, 'inOut').to(tH0, tT, { z: -26 }, 'out').to(tT, tP, { z: ZK + 4 }, 'in2');
      TL.heart.to(T72, T72 + 0.08, { glow: 2.4, sc: 1.9 }, 'out').to(T72 + 0.08, ACC[0], { glow: 1.1, sc: 1.4 }, 'inOut');
      ACC.forEach((ts, i) => {
        H.sfx(ts, 'MenuCursor', 0.34); H.sfx(ts, 'Impact', 0.12);
        TL.heart.to(ts, ts + 0.04, { sc: 1.6, glow: 1.8 }, 'out');
        if (i < 4) TL.heart.to(ts + 0.04, ts + 0.2, { sc: 1.4, glow: 1.1 }, 'inOut');
      });
      TL.heart.to(tB + 0.04, tT, { sc: 1.2, glow: 2.8 }, 'inOut').to(tT, tP, { sc: 1.5 }, 'in');
      // (the same drawing-in his all-out had at 52)
      H.sfx(tB + 0.04, 'Pullback', 0.45);
      // (gone into him on the note: the picture held on it has the blade, not a ghost of the soul)
      TL.heart.to(tP - 0.03, tP - 0.002, { a: 0 }, 'lin');
      // the hall's rectangles in its red, out from the box as the frame shuts and the ribbons pour in
      BL.flood(T72, [MENU.cx, MENU.cy]);
      // the six colours round it while it goes (what they gave it), turning - in the breath drawn into it
      TL.add({
        t0: T72, t1: tP, z: 44, name: 'what they gave it',
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt), into = U.eIn(U.clamp((tt - tB) / (tT - tB)));
          atDepth(ctx, emi, S, h.z || 0, () => {
            SOULS.forEach((k, i) => { const a = (i / 6) * TAU + tt * 4, r = (20 + 2 * Math.sin(tt * 9 + i)) * (1 - into); D.rect(ctx, R(h.x + Math.cos(a) * r * 1.1) - 2, R(h.y + Math.sin(a) * r) - 2, 4, 4, HEX[k], 0.9 * (1 - into)); });
            if (emi) F.glowAt(emi, h.x, h.y, 40, '#ff3020', 0.5);
          });
        },
      });
      // the breath: the soul white-hot at its heart; the lines of the drawing-in running at it from
      // everywhere, red and white (his all-out drew his seven colours into his points; the child's
      // answer is its own red); the hall behind him going dark
      TL.add({
        t0: tB, t1: tP, z: 44.5, name: 'the breath',
        draw(ctx, emi, tt, S) {
          const h = TL.heart.at(tt), k = U.clamp((tt - tB - 0.03) / (tT - tB - 0.03)), v = (tt - tB - 0.02) / (tT - tB - 0.02);
          if (h.a <= 0.01) return;
          atDepth(ctx, emi, S, h.z || 0, () => {
            // (long lines all pointing at it, their inner ends running in and closing on it)
            for (let m = 0; m < 40; m++) {
              const a = ((m + 0.5 * U.hash(m * 5.9 + 4)) / 40) * TAU, st = 0.45 * U.hash(m * 2.3 + 1), u = U.clamp((v - st) / (1 - st));
              if (u <= 0 || u >= 1) continue;
              const r = 22 + (1 - U.eIn(u)) * (170 + 120 * U.hash(m * 3.1)), L = (70 + 150 * U.hash(m * 7.3 + 2)) * (1 - 0.6 * u), wh = m % 3 === 0;
              ctx.save(); ctx.globalAlpha = (wh ? 0.85 : 0.7) * Math.min(1, u * 3); ctx.strokeStyle = wh ? '#ffffff' : '#ff3a2a'; ctx.lineWidth = wh ? 1 : 2;
              ctx.beginPath(); ctx.moveTo(h.x + Math.cos(a) * r, h.y + Math.sin(a) * r * 0.8); ctx.lineTo(h.x + Math.cos(a) * (r + L), h.y + Math.sin(a) * (r + L) * 0.8); ctx.stroke(); ctx.restore();
            }
            if (k > 0) F.spr(ctx, F.tint(MV.img('heartRed'), '#ffffff'), h.x, h.y, { sc: h.sc * (0.3 + 0.3 * k), ax: 8, ay: 8, alpha: 0.9 * k * h.a });
            if (emi) F.glowAt(emi, h.x, h.y, 30 + 30 * k, '#ff6040', 0.5 * k);
          });
        },
      });
      TL.look2.to(tB, tB + 0.12, { shade: 0.7 }, 'out');

      // ---- the camera: out to the game's own picture as its frame comes back (71·4 -> 72); held
      // there while the cursor creeps; a notch closer on each accent, the roll a little further each
      // way - the soul, the cursor under it and his chest always in the picture
      move(tIn + 0.06, T72 - 0.005, { x: 480, y: 270, zoom: 1, pitch: 0, yaw: 0, roll: 0 }, 'inOut');
      move(T72 + 0.12, ACC[0] - 0.01, { zoom: 1.04, y: 264 }, 'lin');
      const NOTCH = [
        { x: 452, y: 246, zoom: 1.12, roll: -0.012, pitch: 0.03 },
        { x: 458, y: 240, zoom: 1.26, roll: 0.014, pitch: 0.04 },
        { x: 464, y: 236, zoom: 1.4, roll: -0.016, pitch: 0.05 },
        { x: 470, y: 232, zoom: 1.56, roll: 0.018, pitch: 0.06 },
        { x: 474, y: 228, zoom: 1.74, roll: -0.022, pitch: 0.07 },
      ];
      ACC.forEach((ts, i) => {
        TL.cam2.to(ts - 0.004, ts + 0.05, NOTCH[i], 'outExpo');
        if (i < 4) move(ts + 0.06, ACC[i + 1] - 0.01, { zoom: NOTCH[i].zoom + 0.025 }, 'lin');
      });
      // the breath: from the last notch on in at the soul, low, faster and faster until the note
      move(tH0, tP - 0.004, { x: 452, y: 168, zoom: 2.6, roll: -0.05, pitch: 0.11 }, 'in');

      // ---- the blow (the last FIGHT, the heaviest of them all): the line of the cut,
      // the hard black and white - then the picture held
      // while the last note rings, seen three times, a jump closer each time (all of it - him from
      // below - the wound); released into the silence: the camera blown back, the hall shaken
      const SA = [LC[0] - DIR[0] * 700, LC[1] - DIR[1] * 700], SB = [LC[0] + DIR[0] * 700, LC[1] + DIR[1] * 700];
      H.stop(tP, STOPL);
      TL.add({
        t0: tP, t1: tP + 0.034, z: 90, screen: true, live: true, name: 'the line of the cut',
        draw(ctx, emi, t, S) {
          // (through where his chest is in the picture now)
          const a = MV.toScreen(S.cam, LC, ZK), b = MV.toScreen(S.cam, [LC[0] + DIR[0] * 100, LC[1] + DIR[1] * 100], ZK);
          const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
          D.rect(ctx, 0, 0, MV.OW, MV.OH, '#000000');
          ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(a[0] - d[0] * 1400, a[1] - d[1] * 1400); ctx.lineTo(a[0] + d[0] * 1400, a[1] + d[1] * 1400); ctx.stroke(); ctx.restore();
        },
      });
      TL.impact(tP + 0.034, { amp: 0, bw: 0.066, inv: 0.066 });
      BL.field(tP, tLR, '#ff2a2a', LC);
      // (on his plane: the game's window stays whole in front of it)
      TL.add({
        t0: tP, t1: tLR + 0.55, z: -16, live: true, name: 'the last cut',
        draw(ctx, emi, t) {
          const v = t - tP, op = U.clamp(v / 0.05), cr = U.clamp((t - tLR) / 0.5), e = U.eIn(cr);
          const w = 26 * (1 - 0.6 * e) * (t < tLR ? 1 + 0.08 * (v / STOPL) : 1);
          BL.blade(ctx, SA, SB, w, { col: '#ff2a2a', core: '#fff4f0', rim: '#3a0408', cut: cr > 0 ? [0.5 * e, 1 - 0.5 * e] : [0, op], crumb: 0.14, alpha: 1 - 0.3 * cr });
          if (emi) F.glowAt(emi, LC[0], LC[1], 160, '#ff3020', 0.5 * (1 - cr));
        },
      });
      // where it went in: a hard star on his chest through the stop (H.blow's, bigger), pressing on
      // as it is held, gone with the release
      TL.add({
        t0: tP, t1: tLR + 0.12, z: -15, live: true, name: 'where it went in',
        draw(ctx, emi, tt) {
          const v = tt - tP, k = tt < tLR ? 1 : 1 - (tt - tLR) / 0.12, s = tt < tLR ? 1.5 + 0.35 * (1 - U.eOut(U.clamp(v / 0.06))) + 0.15 * (v / STOPL) : 1.65 + (tt - tLR) * 4;
          for (const [rr, col] of [[46, '#ff2a2a'], [30, '#ffffff']]) {
            ctx.globalAlpha = k; ctx.fillStyle = col; ctx.beginPath();
            for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU - Math.PI / 2 + 0.2, r = rr * s * (i % 2 ? 0.22 : i % 4 ? 0.62 : 1); ctx.lineTo(LC[0] + Math.cos(a) * r, LC[1] + Math.sin(a) * r); }
            ctx.closePath(); ctx.fill();
          }
          ctx.globalAlpha = 1;
          if (emi) F.glowAt(emi, LC[0], LC[1], 70 * s, '#ff3020', 0.5 * k);
        },
      });
      // the picture held, seen three times - each a jump closer, a thud each: all of it (the cursor on
      // the centre line, the cut through him: cause and effect in one picture); him from below; the
      // wound, closer and closer (enlarged pixels, as 52's all-out allowed itself)
      const J = [tP + 0.1, tP + 0.23, tP + 0.36];
      cut(J[0], { x: 480, y: 244, zoom: 1.06, roll: -0.035, pitch: 0.05, fov: 0.8 });
      move(J[0], J[1] - 0.004, { zoom: 1.1 }, 'lin');
      cut(J[1], { x: 486, y: 200, zoom: 1.6, pitch: 0.22, roll: 0.05, yaw: -0.06, fov: 0.95 });
      move(J[1], J[2] - 0.004, { zoom: 1.68 }, 'lin');
      cut(J[2], { x: 482, y: 138, zoom: 3.0, roll: -0.16, pitch: 0.06, fov: 0.8 });
      move(J[2], tLR - 0.004, { zoom: 3.25 }, 'in');
      J.forEach((tj, i) => { if (i) H.sfx(tj, 'Impact', 0.26 + 0.08 * i); TL.impact(tj, { amp: 3 + 2 * i, zoom: 0.02 + 0.01 * i, dur: 0.18 }); });
      // ---- released into the silence: the camera blown back out of the wound and swaying slowly
      // back (a heavy shake - slow, long); the flash; the wind of it; his fire blown out; the shock
      // running out through the hall - each jar knocked up as it reaches it, its soul flaring; the
      // door's light thrown open; dust shaken down from the hall
      TL.cam2.to(tLR, tLR + 0.34, { x: 480, y: 246, zoom: 1.12, roll: 0.03, pitch: 0.05, yaw: 0, fov: 0.8 }, 'outExpo');
      move(tLR + 0.36, tK - 0.01, { zoom: 1.08, roll: 0, y: 250 }, 'inOut');
      TL.impact(tLR, { amp: 20, dx: DIR[0], dy: DIR[1], freq: 0.42, rot: 0.045, dur: 1.4 });
      TL.impact(tLR, { amp: 9, flash: 0.3, flashCol: [1, 0.38, 0.32], flashDecay: 7, dur: 0.5 });
      BL.wind(tLR, LC, DIR, '#ff2a2a', 2.6);
      TL.look2.to(tLR, tLR + 0.35, { flames: 0, embers: 0 }, 'out');
      TL.look2.to(tLR, tLR + 0.4, { shade: 0.25 }, 'inOut');
      TL.look2.to(tLR, tLR + 0.05, { door: 1.2 }, 'out').to(tLR + 0.08, tLR + 0.5, { door: 0.5 }, 'inOut');
      MV.JARS.forEach((k) => {
        const [x, y] = FL.jar[k], td = tLR + Math.hypot(x - LC[0], y - LC[1]) / 1500;
        TL.jar[k].to(td, td + 0.05, { jy: -7 }, 'out').to(td + 0.05, td + 0.4, { jy: 0 }, 'outBack');
        // (a pulse on whatever light it has then, and back to it)
        const g0 = TL.jar[k].at(td - 0.001).glow;
        if (k !== 'empty') TL.jar[k].to(td, td + 0.04, { glow: g0 + 1.1 }, 'out').to(td + 0.08, td + 0.4, { glow: g0 }, 'inOut');
      });
      TL.add({
        t0: tLR + 0.05, t1: tLR + 1.7, z: -300, name: 'dust shaken down',
        draw(ctx, emi, t) {
          const v = t - tLR - 0.05;
          for (let m = 0; m < 34; m++) {
            const h1 = U.hash(m * 3.7 + 11), h2 = U.hash(m * 1.9 + 5), h3 = U.hash(m * 5.3 + 2), w = v - h3 * 0.45;
            if (w <= 0) continue;
            const x = 90 + h1 * 780 + Math.sin(w * 2 + m) * 6, y = -40 + h2 * 220 + (40 + 70 * h3) * w + 60 * w * w;
            D.rect(ctx, R(x / 2) * 2, R(y / 2) * 2, 2, 2, '#d4cede', Math.min(1, w * 6) * (1 - U.clamp((v - 1.0) / 0.6)) * (0.3 + 0.4 * h2));
          }
        },
      });
      H.sfx(tP, 'Laz', 0.7); H.sfx(tP, 'CineCut', 0.85); H.sfx(tP, 'Slam', 0.5); H.sfx(tP, 'Impact', 0.5);
      H.sfx(tLR, 'ScreenShake', 0.55); H.sfx(tLR, 'HeavyDamage', 0.65); H.sfx(tLR, 'Explosion', 0.4);
      // the number in the silence, twice the game's size, with the release; the last of his bar
      // white, then gone
      H.readout(tLR, 711, 0, 711, { num: 2, bar: [480, 120], bw: 220, dur: 1.9 });
      // he stands a moment; when his bar is empty - on the loop point - he kneels (the game's frame; its
      // face: eyes closed, at rest), the trident falls - the first time he moves for a blow
      TL.add({
        t0: tLR, t1: tK, z: -19, name: 'the wound',
        draw(ctx, emi, t) {
          // (gone as he goes down: it was drawn where his chest was standing)
          const a = 1 - U.clamp((t - tK + 0.25) / 0.25), Lw = 52;
          BL.blade(ctx, [LC[0] - DIR[0] * Lw, LC[1] - DIR[1] * Lw], [LC[0] + DIR[0] * Lw, LC[1] + DIR[1] * Lw], 3.5, { col: '#ff2a2a', core: '#ffd8d0', rim: '#3a0408', alpha: a });
          if (emi) F.glowAt(emi, LC[0], LC[1], 40, '#ff3020', 0.35 * a);
        },
      });
      TL.bossPose.set(tK, 'none');
      TL.king.set(tK, { breathe: 1 });
      TL.kneel.set(tK, { a: 1, dy: -12 }).to(tK, tK + 0.12, { dy: 0 }, 'in');
      TL.kneelFace.set(tK, 'face0');
      TL.kingFace.set(tK, null);
      FIN.kneel(tK, T.end);
      FIN.trident(tK, tK + 0.3, T.end);
      H.sfx(tK + 0.12, 'Impact', 0.32);
      TL.impact(tK + 0.12, { amp: 4, dy: 1, zoom: 0.02, dur: 0.3 });
      cut(tK, { x: 480, y: 270, zoom: 1 });
      // (the game's window has been back since 72: the empty text box, the HUD, 战斗 - its turn over)
      TL.btn[0].set(tK, { sel: 0 });
      TL.heart.set(tK, { a: 0, z: 0, x: C[0], y: C[1], sc: 1, glow: 0, rot: 0 });
      TL.heartMode.set(tK, 'red');
    }
  });
})();
