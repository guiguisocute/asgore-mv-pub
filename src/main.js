// Player: audio-synced live playback (two music tracks on one clock), scrubbing, live
// sound effects, and the frame / validation API for tools/*.cjs.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U;
  const q = MV.Q;
  const RENDER = q.has('render');

  MV.loadAssets().then(start).catch((e) => { console.error(e); MV.failed = String(e && e.stack || e); });
  function start() {
    const canvas = document.getElementById('mv');
    const ov = document.createElement('canvas');
    ov.width = MV.OW; ov.height = MV.OH;
    MV.vox = new MV.Vox(canvas, { overlay: ov });
    MV.buildTimeline();
    TL.finalize();
    const scene = (MV.scene = new MV.Scene(MV.vox, ov));
    // the 2D battle draws on its own canvas (WebGL1); each frame shows exactly one of the two
    const canvas2 = document.createElement('canvas');
    canvas2.id = 'mv2';
    canvas.after(canvas2);
    const scene2 = (MV.scene2 = new MV.Scene2D(canvas2));
    // (what is painted or baked once - the soul worlds' backdrops, their clocks - done now, not
    // on the frame it is first needed)
    for (const f of MV.prewarm || []) f(scene2);
    const cut = T.cut;
    const LAT = parseFloat(q.get('lat') || '0');
    let shown = null;
    MV.renderFrame = (t) => {
      const flat = MV.flatAt(t);
      const S = flat ? scene2.render(t) : scene.render(t);
      if (shown !== flat) { canvas.style.display = flat ? 'none' : 'block'; canvas2.style.display = flat ? 'block' : 'none'; shown = flat; }
      return S;
    };
    MV.frameCanvas = (t) => (MV.flatAt(t) ? canvas2 : canvas);

    function resize() {
      if (RENDER) {
        for (const c of [canvas, canvas2]) { c.width = +(q.get('w') || 1920); c.height = +(q.get('h') || 1080); }
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // (never 0: a hidden window would leave the voxel bloom chain without buffers)
      const w = Math.max(320, Math.min(window.innerWidth, window.innerHeight * 16 / 9));
      for (const c of [canvas, canvas2]) {
        c.style.width = w + 'px'; c.style.height = w * 9 / 16 + 'px';
        c.width = Math.min(1920, Math.round(w * dpr)); c.height = Math.round(c.width * 9 / 16);
      }
    }
    resize();
    window.addEventListener('resize', resize);
    // (the voxel windows inside the 2D battle - green's first person, blue's FEZ turn - build their
    // scenes on the frame they first show: a half-second stall in playback the first time through.
    // Each shown once now, at load)
    {
      for (let t = T.m2, k = 0; t < T.end; t += 1 / 30, k++) if (!MV.flatAt(t) && k % 8 === 0) MV.renderFrame(t);
      MV.renderFrame(parseFloat(q.get('t') || '0'));
    }

    // choreography check: every moment the soul is visible, no bullet may touch it unless the
    // hit is meant (TL.invuln(t) marks spans where it is, e.g. bar 52); orange / light-blue
    // rules use whether the soul is moving
    // (the 2D battle: the soul is TL.heart in world px; moving = faster than 12 px/s)
    MV.checkHits = (t0, t1, dt = 1 / 120) => {
      const out = [];
      let last = -1;
      for (let t = t0; t <= t1; t += dt) {
        const flat = MV.flatAt(t), tr = flat ? TL.heart : TL.soul;
        const s = tr.at(t);
        if (s.a < 0.5 || (TL.invuln && TL.invuln(t))) continue;
        const a = tr.at(t - 0.025), b = tr.at(t + 0.025);
        const mv = Math.hypot(b.x - a.x, b.y - a.y, (b.z || 0) - (a.z || 0)) / 0.05 > (flat ? 12 : 25);
        for (const e of TL.active(t)) {
          if (!e.hit) continue;
          const r = e.hit(t, flat ? [s.x, s.y] : [s.x, s.y, s.z], mv);
          if (r && t - last > 0.08) { out.push({ t: +t.toFixed(3), bar: +T.barOf(t).toFixed(2), what: r, soul: [Math.round(s.x), Math.round(s.y)], moving: mv }); last = t; }
        }
      }
      return out;
    };
    if (RENDER) {
      MV.exportFrame = (t, type = 'image/jpeg', quality = 0.93) => { MV.renderFrame(t); return MV.frameCanvas(t).toDataURL(type, quality); };
      MV.ready = true;
      MV.renderFrame(parseFloat(q.get('t') || '0'));
      return;
    }

    // ---------------------------------------------------------------- live player
    const ui = document.getElementById('ui'), bar = document.getElementById('bar'), info = document.getElementById('info');
    const audios = T.tracks.map((k) => { const a = new Audio(k.src); a.preload = 'auto'; return Object.assign({ a }, k); });
    let playing = false, clockT = parseFloat(q.get('t') || String(cut.t0)), clockAt = performance.now();
    const cur = (t) => audios.find((k) => t >= k.t0 && t < k.t0 + k.dur - 0.05);
    const now = () => {
      if (!playing) return clockT;
      const est = clockT + (performance.now() - clockAt) / 1000;
      const k = cur(est);
      if (!k || k.a.paused) return Math.min(est, cut.t1);
      const at = k.a.currentTime + k.t0;
      if (Math.abs(at - est) > 0.05) { clockT = at; clockAt = performance.now(); return at; }
      return est;
    };
    const syncAudio = (t) => {
      for (const k of audios) {
        const inside = playing && t >= k.t0 && t < k.t0 + k.dur - 0.05;
        if (inside && k.a.paused) { k.a.currentTime = t - k.t0; k.a.play().catch(() => {}); }
        else if (!inside && !k.a.paused) k.a.pause();
      }
    };
    const play = () => { if (clockT >= cut.t1 - 0.01) seek(cut.t0); playing = true; clockAt = performance.now(); ui.classList.add('hide'); syncAudio(clockT); };
    const pause = () => { clockT = now(); playing = false; for (const k of audios) k.a.pause(); ui.classList.remove('hide'); };
    const seek = (t) => {
      t = U.clamp(t, cut.t0, cut.t1);
      clockT = t; clockAt = performance.now();
      for (const k of audios) { k.a.pause(); if (t >= k.t0 && t < k.t0 + k.dur) k.a.currentTime = t - k.t0; }
      syncAudio(t);
    };
    ui.addEventListener('click', () => (playing ? pause() : play()));
    for (const c of [canvas, canvas2]) c.addEventListener('click', () => (playing ? pause() : play()));
    document.getElementById('timeline').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      seek(cut.t0 + ((e.clientX - r.left) / r.width) * (cut.t1 - cut.t0));
      e.stopPropagation();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'KeyZ' || e.code === 'Enter') { playing ? pause() : play(); e.preventDefault(); }
      if (e.code === 'ArrowRight') seek(now() + (e.shiftKey ? T.bar : 2));
      if (e.code === 'ArrowLeft') seek(now() - (e.shiftKey ? T.bar : 2));
      if (e.code === 'KeyD') info.classList.toggle('show');
    });
    // ---------------------------------------------------------------- live sound effects
    let actx = null, bufs = {}, scheduled = new Set(), sfxGain = null;
    const SFX = TL.sfx.slice().sort((a, b) => a.t - b.t);
    const initAudio = () => {
      if (actx) return;
      actx = new (window.AudioContext || window.webkitAudioContext)();
      sfxGain = actx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(actx.destination);
      for (const [k, url] of Object.entries(window.MV_ASSETS.sfx))
        fetch(url).then((r) => r.arrayBuffer()).then((b) => actx.decodeAudioData(b)).then((d) => (bufs[k] = d)).catch(() => {});
    };
    ui.addEventListener('click', initAudio); canvas.addEventListener('click', initAudio); canvas2.addEventListener('click', initAudio); window.addEventListener('keydown', initAudio);
    let lastSfxT = -1;
    const pumpSfx = (t) => {
      if (!actx || !playing) { lastSfxT = t; return; }
      if (t < lastSfxT - 0.05 || t > lastSfxT + 0.5) scheduled.clear();
      for (const e of SFX) {
        if (e.t < t - 0.02) continue;
        if (e.t > t + 0.12) break;
        const key = e.name + (e.rate || '') + e.t;
        if (scheduled.has(key) || !bufs[e.name]) continue;
        scheduled.add(key);
        const src = actx.createBufferSource(), g = actx.createGain();
        src.buffer = bufs[e.name]; g.gain.value = e.vol;
        if (e.rate) src.playbackRate.value = e.rate;
        src.connect(g).connect(sfxGain);
        src.start(actx.currentTime + Math.max(0, e.t - t));
      }
      lastSfxT = t;
    };
    function loop() {
      if (playing && now() >= cut.t1) { playing = false; clockT = cut.t1; for (const k of audios) k.a.pause(); ui.classList.remove('hide'); }
      const tc = now();
      syncAudio(tc);
      const t = tc - LAT;
      pumpSfx(t);
      MV.renderFrame(t);
      bar.style.width = (100 * (t - cut.t0)) / (cut.t1 - cut.t0) + '%';
      if (info.classList.contains('show')) {
        const s = T.section(t);
        info.textContent = `t=${t.toFixed(2)}  ${s.name}${s.bar !== undefined ? `  bar ${Math.floor(s.bar)} beat ${Math.floor((s.bar % 1) * 4) + 1}` : ''}`;
      }
      requestAnimationFrame(loop);
    }
    loop();
  }
})();
