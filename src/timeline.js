// Shared tracks + choreography helpers. Section files (tl_*.js) push builders into
// MV.sections; MV.buildTimeline() runs them in order.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, D = MV.D;
  const Track = MV.Track, Steps = MV.Steps;

  // ---------------------------------------------------------------- tracks
  // camera: target x,y,z, yaw / pitch / roll (rad), fov (deg; ~1 = orthographic look), h = world
  // height framed at the target
  // flat: the world's depth scale about z = 0 (1 = normal; act two presses it toward 0)
  TL.cam = new Track({ x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 1, h: 480, flat: 1 });
  // look: lighting / post. unlit: 1 = flat sprite colours (act one reads as 2D)
  TL.look = new Track({
    unlit: 1, lit: 1, fog: 0, fogStart: 200, exposure: 1, bloom: 0, th: 1.1, sat: 1, vig: 0, ca: 0,
    grain: 0.01, fade: 1, letter: 0, contrast: 1, glowAmt: 0, shadow: 1, cap: 0.92, inv: 0, invV: 0.8, white: 0.96, wash: 0,
  });
  // palette blend weights (scene.js mixes the presets)
  TL.pal = new Track({ corridor: 1, void: 0, battle: 0, memory: 0, dawn: 0, black: 0 });
  TL.lightDir = new Track({ x: -0.45, y: 0.75, z: 0.5 });
  // the red soul (world position), its colour mode, visibility
  TL.soul = new Track({ x: 0, y: 0, z: 0, a: 0, sc: 1, spin: 0, crack: 0 });
  TL.soulMode = new Steps('red');
  // overworld actors (act one)
  TL.asg = new Track({ x: 0, y: 0, z: 0, a: 1, dark: 0, sc: 1 });
  TL.asgFace = new Steps('up');
  TL.frisk = new Track({ x: 0, y: 0, z: 0, a: 1, dark: 0, sc: 1 });
  TL.friskFace = new Steps('up');
  TL.corr = new Track({ a: 1 }); // the barrier tube (channels: src/actors.js)
  // the cage (the 3D battle box): centre, half size, visibility
  TL.cage = new Track({ x: 0, y: 0, z: 0, hx: 80, hy: 80, hz: 80, a: 0, lattice: 0, edge: 0, pulse: 0 });
  // battle Asgore's pose (src/boss.js); the HUD line (name / LV / HP, each with its own landing
  // 0..1) and the four buttons (drop: 0 above the picture .. 1 landed)
  TL.bossPose = new Steps('idle');
  TL.hudT = new Track({ a: 0, hp: 20, hpMax: 20, nameA: 1, lvA: 1, hpA: 1, numA: 1, shards: 1 });
  TL.btn = [0, 1, 2, 3].map(() => new Track({ a: 0, sel: 0, drop: 0, dx: 0, dy: 0 }));

  MV.sections = [];
  MV.buildTimeline = () => MV.sections.forEach((f) => f());

  // ---------------------------------------------------------------- sound effects
  TL.sfx = [];
  const sfxLast = {};
  const H = (MV.H = {});
  // o.rate: played faster / slower, its pitch with it (1.25 a little higher; the player's
  // playbackRate, resampled in tools/render.cjs) - one sound, a pitch for each colour
  H.sfx = (t, name, vol = 1, o = {}) => {
    const rate = o.rate ?? 1;
    const k = name + (rate !== 1 ? '@' + rate : '') + Math.round(t / 0.04);
    if (sfxLast[k]) { sfxLast[k].vol = Math.max(sfxLast[k].vol, vol); return; }
    const e = { t: +t.toFixed(4), name, vol };
    if (rate !== 1) e.rate = rate;
    TL.sfx.push((sfxLast[k] = e));
  };
  H.at = T.at; H.at1 = T.at1;

  // ---------------------------------------------------------------- dialogue
  // A line typed into an overlay text box. times: per-character reveal (default: an even
  // step, with a pause after punctuation like the game). o: {box: 'top'|'battle'|rect, voice,
  // step, x, y, color, star (the leading '* ' bullet)}
  const PAUSE = { '，': 0.12, '。': 0.22, '…': 0.09, '？': 0.22, '！': 0.22, '、': 0.1 };
  H.typeTimes = (t0, str, step = 0.05) => {
    const out = [];
    let t = t0;
    for (const ch of str) { out.push(t); t += step + (PAUSE[ch] || 0); }
    return out;
  };
  MV.BOX = {
    top: { x: MV.OX + 32, y: MV.OY + 10, w: 578, h: 152, tx: 28, ty: 22 },
    battle: { x: MV.OX + 32, y: MV.OY + 250, w: 575, h: 140, tx: 28, ty: 20 },
  };
  H.say = (t0, t1, str, o = {}) => {
    const lines = Array.isArray(str) ? str : [str];
    const all = lines.join('');
    const times = o.times || H.typeTimes(t0, all, o.step ?? 0.05);
    if (o.sfx !== false) [...all].forEach((ch, i) => {
      if (' …。，？！、'.includes(ch)) return;
      if (o.voice === 'VoiceAsg' && i % 2) return; // his voice is slower than the letters
      H.sfx(times[i], o.voice || 'Txt1', o.vol ?? 0.32);
    });
    const box = typeof o.box === 'object' ? o.box : MV.BOX[o.box || 'top'];
    return TL.add({
      t0, t1, z: o.z ?? 30, kind: 'text',
      ov(ctx, t, S) {
        let n = 0;
        for (const tt of times) if (t >= tt) n++;
        const fo = o.fadeOut ?? 0, fade = fo && t > t1 - fo ? (t1 - t) / fo : 1;
        if (o.drawBox !== false && !o.anchor) D.box(ctx, box.x, box.y, box.w, box.h, { alpha: o.boxAlpha ?? 1 });
        let x = box.x + box.tx, y = box.y + box.ty;
        if (o.anchor) { const a = o.anchor(t, S); if (!a) return; x = a[0]; y = a[1]; }
        if (o.face) { const f = MV.img(o.face); ctx.drawImage(f, Math.round(box.x + 22), Math.round(box.y + 22), f.width * 2, f.height * 2); x = box.x + 132; }
        if (o.star !== false) D.text(ctx, '*', x, y, { alpha: fade, color: o.color });
        let left = n;
        lines.forEach((ln, i) => {
          const c = [...ln], k = Math.max(0, Math.min(c.length, left));
          left -= c.length;
          D.text(ctx, c.slice(0, k).join(''), x + 32, y + i * 36, { alpha: fade, color: o.color, shake: o.shake, seed: t * 30 });
        });
      },
    });
  };
  // the game's two-option prompt ("❤ 继续    回去"): the heart sits on option `pick`
  // after tMove; selected at tSel
  H.choice = (t0, t1, opts, o = {}) => {
    const box = MV.BOX[o.box || 'top'];
    // (silent: the menu's move / select sounds read as comic in the film)
    return TL.add({
      t0, t1, z: 31, kind: 'text',
      ov(ctx, t) {
        D.box(ctx, box.x, box.y, box.w, box.h);
        const y = box.y + 70;
        const xs = [box.x + 150, box.x + 360];
        opts.forEach((s, i) => D.text(ctx, s, xs[i], y, { color: o.tSel && t >= o.tSel && i === (o.pick ?? 0) ? MV.COL.uiHi : undefined }));
        const sel = t >= (o.tMove ?? t0 + 0.6) ? (o.pick ?? 0) : o.from ?? 1;
        const hx = xs[sel] - 26, hy = y + 8;
        ctx.drawImage(MV.img('heartRed'), Math.round(hx), Math.round(hy), 16, 16);
      },
    });
  };
  // speech bubble next to a world point (projected each frame). lines: array of strings
  H.bubble = (t0, t1, lines, o = {}) => {
    const all = lines.join('');
    const times = o.times || H.typeTimes(t0 + 0.05, all, o.step ?? 0.07);
    [...all].forEach((ch, i) => { if (!' …。，？！'.includes(ch) && i % 2 === 0) H.sfx(times[i], o.voice || 'VoiceAsg', o.vol ?? 0.38); });
    const sc = o.scale ?? 2;
    const w = o.w || Math.max(...lines.map((l) => D.textWidth(l, { scale: sc }))) + 20 * sc;
    const h = o.h || lines.length * 18 * sc + 14 * sc;
    return TL.add({
      t0, t1, z: 40, kind: 'text',
      ov(ctx, t, S) {
        let k = 0;
        for (const tt of times) if (t >= tt) k++;
        const shown = [];
        let left = k;
        for (const ln of lines) { const c = [...ln]; shown.push(c.slice(0, Math.max(0, left)).join('')); left -= c.length; }
        const pop = U.eOutBack(U.clamp((t - t0) / 0.12));
        const fade = t > t1 - 0.1 ? (t1 - t) / 0.1 : 1;
        // anchor: a world point projected to the overlay, or fixed overlay coordinates (the 2D
        // battle: world px, tail toward tx, ty)
        let x = o.x, y = o.y, tx = o.tx, ty = o.ty;
        if (o.world) {
          const p = MV.project(S.cam, typeof o.world === 'function' ? o.world(t) : o.world, MV.OW, MV.OH);
          if (p) { tx = p[0]; ty = p[1]; x = tx + (o.dx ?? 24); y = ty - h / 2 + (o.dy ?? 0); }
        }
        D.bubble(ctx, x, y, w, h, shown, { tx, ty, alpha: fade, pop, scale: sc });
      },
    });
  };

  // ---------------------------------------------------------------- camera / impacts
  // camera values for an eye position looking at a point (fov in degrees)
  H.eye = (eye, at, fov = 34, roll = 0) => {
    const d = MV.V3.sub(at, eye), D = MV.V3.len(d), n = MV.V3.mul(d, 1 / D);
    return { x: at[0], y: at[1], z: at[2], yaw: Math.atan2(-n[0], -n[2]), pitch: Math.asin(n[1]), roll, fov, h: 2 * D * Math.tan((fov / 2) * Math.PI / 180) };
  };
  H.cam = (t0, t1, v, ease = 'inOut') => TL.cam.to(t0, t1, v, ease);
  H.cut = (t, v) => TL.cam.set(t, v);
  H.look = (t0, t1, v, ease = 'inOut') => TL.look.to(t0, t1, v, ease);
  H.pal = (t0, t1, v, ease = 'inOut') => TL.pal.to(t0, t1, v, ease);
  H.punch = (t, k = 1, o = {}) => TL.impact(t, Object.assign({ amp: 3 * k, zoom: 0.03 * k, ca: 1.5 * k, dur: 0.25 }, o));
  H.hit = (t, k = 1, o = {}) => TL.impact(t, Object.assign({ amp: 8 * k, zoom: 0.05 * k, ca: 4 * k, flash: 0.18 * k, dur: 0.45 }, o));
})();
