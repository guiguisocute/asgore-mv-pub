// The 2D battle: the game's battle screen as pixels. A 960x540 world (the
// original 640x480 layout 1:1 at +160, +30, the same space as the text overlay), drawn on
// canvases every frame and shown through src/post2d.js. Act one and the start of act two
// are voxels (src/vox.js); once act two has pressed the corridor into the box, frames come
// from here (MV.flatAt), except voxel windows.
//
// Events: the shared timeline (src/engine.js). A 2D event has draw(ctx, emi, t, S) (world
// space; clip: 'box' keeps it inside the battle box; screen: true draws on the screen layer);
// text events keep their ov(ctx, t, S) and are drawn in the world too.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, D = MV.D;
  const R = Math.round;
  MV.PADX = 200; MV.PADY = 140; // world canvas margin, so the camera can pan / roll past the edges

  // ---------------------------------------------------------------- layout (world px)
  const FL = (MV.FL = {
    king: [480, 260], // Asgore's feet centre (the recording: feet at game y 230, cape x 160..478)
    box: { cx: 480, cy: 345, w: 150, h: 150 }, // the battle box (act two gathers the corridor's white into it)
    menu: { cx: 479.5, cy: 350, w: 575, h: 140 }, // the text box (game x 32..607, y 250..390)
    hudY: 435.5, name: 190, lv: 292, hpLabel: 403, hpBar: [435, 430], num: 474,
    btnY: 462, btnX: [192, 345, 505, 660],
    // the containers: base centre of each jar (2x sprites, 30x62), on pedestals that rise
    // outward from the dais (four on his left, the empty one nearest; three on his right)
    // (the right three stand higher: his trident's head sweeps below them)
    jar: { empty: [288, 260], orange: [252, 215], yellow: [222, 170], green: [194, 125], purple: [692, 200], blue: [726, 150], aqua: [760, 100] },
    fireY: 424, // the floor's line, where his fire smoulders below (its sparks rise from it; the pedestals stand in it)
    door: [480, 345], // the barrier's door: the backdrop corridor's vanishing point (act two made the door the box)
  });
  // world px -> the voxel windows' space: their camera at its flat front view (ortho, y 10,
  // 2 units per px) frames the voxel world exactly like this 2D picture
  MV.FLAT_CAM = { x: 0, y: 10, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 1, h: 1080, flat: 0.01 };
  MV.toVox = (x, y) => [(x - 480) * 2, MV.FLAT_CAM.y - (y - 270) * 2];

  // ---------------------------------------------------------------- tracks
  // the camera: looks at (x, y) on the battle plane; zoom = how large the battle plane shows (a
  // dolly: nearer planes grow faster than far ones); pitch / yaw turn it about that point, roll
  // about its axis; fov = the lens (vertical, rad): wide = deep perspective, narrow = flat (the
  // battle plane's framing stays put: changing it is a dolly zoom)
  TL.cam2 = new MV.Track({ x: 480, y: 270, zoom: 1, roll: 0, pitch: 0, yaw: 0, fov: 0.7 });
  // look2: post (bloom, vig, letter, fade, white, wash = the picture flooded with white) and
  // the stage's lights: wall (the flattened corridor's brightness), door (its light), dawn
  // (0 cold white .. 1 sunrise gold), purple (the game's glow along the bottom), embers,
  // flames (his fire, sunk below the floor: its sparks, small flames, a warm breath); sil: the game's flash (pale field,
  // everything black but the trident), silV its grey
  // act four adds: tint (tr, tg, tb, tk: the walls take a soul's colour), rings (0..6: the
  // walls' rings lit from the outside in, one soul colour each), sepia / gray (the world as an
  // old photograph / without colour; events with keep: true and the soul stay in colour), dim
  // (everything but the box, the HUD and the soul in the dark), blur* (px, per layer: the
  // multiplane camera's depth of field), petals (the memories' golden petals for embers)
  TL.look2 = new MV.Track({
    bloom: 0.45, vig: 0.22, letter: 0, fade: 0, white: 0.97, wash: 0, wall: 0, door: 0, dawn: 0, purple: 0, embers: 0, flames: 0, sil: 0, silV: 0.8,
    tr: 1, tg: 1, tb: 1, tk: 0, rings: 0, sepia: 0, gray: 0, dim: 0, blurBack: 0, blurJars: 0, blurKing: 0, blurFire: 0, petals: 0,
    // react: how much the stage answers the music (the kick flares the fire, the loudness
    // breathes in the door, the snare jolts the box's frame); shade: everything behind him
    // darkens (his inner moments), leaving him, the box and the soul
    react: 0, shade: 0,
    // wind: the soul worlds' wind (src/worlds.js; -1..1, + = blowing to the right): his fire leans
    // with it
    wind: 0,
  });
  // the music's accents as decaying pulses at t (0..1): band 'kick' | 'snare' | 'tone' | 'full'
  MV.beatPulse = (t, band = 'kick', decay = 0.13) => {
    if (t < T.off || t > T.mus2End) return 0;
    const s = T.slot(t);
    let v = 0;
    for (let i = 0; i < 4; i++) { const ts = T.off + (s - i) * T.s16, a = T.acc(s - i, band); if (a > 0.45) v = Math.max(v, a * Math.exp(-(t - ts) / decay)); }
    return v;
  };
  // The stage is a diorama (HD-2D): four flat planes standing at real depths behind the battle,
  // filmed by a 3D camera (src/post2d.js). z: distance behind the battle plane, in world px.
  // At the home framing every plane shows exactly as the game lays it out (each is enlarged to
  // make up for its distance); tilt, turn or dolly the camera and they slide against each other.
  //   back   the flattened corridor, the door's light, the purple glow, the embers
  //   mid    the pedestals, the containers and the fire they stand in
  //   king   Asgore, his trident, what he casts (ribbons, eye flashes)
  //   front  the battle: the box, the bullets, the HUD, the soul
  MV.PLANE_Z = { back: 900, mid: 170, king: 110, front: 0 };
  MV.PLANES = ['back', 'mid', 'king', 'front'];
  // Asgore: ow = his everyday self (the overworld sprite at battle size); wipe = a line (world
  // y) climbing him: the battle form below it, his everyday self above (-1: no line)
  TL.king = new MV.Track({ x: FL.king[0], y: FL.king[1], a: 1, sil: 0, breathe: 1, ghost: 0, shake: 0, ow: 0, wipe: -1e4 });
  TL.kingFace = new MV.Steps(null); // a battle face instead of the head part (null = the head)
  TL.kingFlip = new MV.Steps(false); // whole frames mirrored (the slash the other way)
  // (z: its depth - 0 on the battle plane; up on a jar 170, at his chest 110 - drawn where it would be
  // seen from there, src/depth.js)
  TL.heart = new MV.Track({ x: FL.box.cx, y: FL.box.cy, a: 0, sc: 1, rot: 0, crack: 0, seal: 0, glow: 0, z: 0 });
  TL.heartMode = new MV.Steps('red');
  // the box: centre, size, rotation, frame thickness, frame colour (ar ag ab, mixed by ak), round:
  // 0 square .. 1 its corners rounded all the way (a circle when square); fill / fa: its black
  // inside and its frame (0: the cage open - the climax: what it held is everywhere)
  TL.box2 = new MV.Track({ cx: FL.box.cx, cy: FL.box.cy, w: FL.box.w, h: FL.box.h, a: 1, rot: 0, th: 5, ar: 1, ag: 1, ab: 1, ak: 0, round: 0, fill: 1, fa: 1 });
  // 1 = the frame comes from the 2D scene: from the moment act two's box is formed
  // (tl_act2.js), except voxel windows (TL.flat.set(t0, 0).set(t1, 1))
  TL.flat = new MV.Steps(0);
  MV.flatAt = (t) => TL.flat.at(t) > 0.5;

  // ---------------------------------------------------------------- drawing helpers
  const F = (MV.F = {});
  const cache = new Map(), ids = new WeakMap();
  let nid = 0;
  F.id = (img) => ids.get(img) || (ids.set(img, ++nid), nid);
  F.cached = (key, make) => { let c = cache.get(key); if (!c) { c = make(); cache.set(key, c); } return c; };
  // every opaque pixel in one colour
  F.tint = (img, hex) => F.cached('tint:' + F.id(img) + hex, () => {
    const [c, x] = MV.canvas(img.width, img.height);
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = hex; x.fillRect(0, 0, img.width, img.height);
    return c;
  });
  // only the bright pixels (lines, glyphs) in one colour, the dark ones dropped: a button's
  // outline in the flash
  F.tintLines = (img, hex) => F.cached('tintL:' + F.id(img) + hex, () => {
    const [r0, g0, b0] = F.rgb(hex);
    return F.recolor('tintL' + F.id(img) + hex, img, (r, g, b) => (r + g + b > 90 ? [r0, g0, b0, 255] : [0, 0, 0, 0]));
  });
  // enclosed transparent holes filled black (the line art's insides: the fists, the arms)
  F.filled = (img) => F.cached('filled:' + F.id(img), () => {
    const w = img.width, h = img.height, [c, x] = MV.canvas(w, h);
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, w, h), d = id.data, out = new Uint8Array(w * h), st = [];
    for (let i = 0; i < w; i++) st.push(i, (h - 1) * w + i);
    for (let j = 0; j < h; j++) st.push(j * w, j * w + w - 1);
    while (st.length) {
      const p = st.pop();
      if (out[p] || d[p * 4 + 3] > 0) continue;
      out[p] = 1;
      const px = p % w, py = (p / w) | 0;
      if (px > 0) st.push(p - 1); if (px < w - 1) st.push(p + 1);
      if (py > 0) st.push(p - w); if (py < h - 1) st.push(p + w);
    }
    for (let p = 0; p < w * h; p++) if (!out[p] && d[p * 4 + 3] === 0) { d[p * 4] = d[p * 4 + 1] = d[p * 4 + 2] = 0; d[p * 4 + 3] = 255; }
    x.putImageData(id, 0, 0);
    return c;
  });
  // per-pixel recolour: fn(r, g, b, a, x, y) -> [r, g, b, a] | null (keep)
  F.recolor = (key, img, fn) => F.cached('rc:' + key, () => {
    const [c, x] = MV.canvas(img.width, img.height);
    x.drawImage(img, 0, 0);
    const id = x.getImageData(0, 0, img.width, img.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const o = fn(d[i], d[i + 1], d[i + 2], d[i + 3], (i >> 2) % img.width, ((i >> 2) / img.width) | 0);
      if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = o[3] ?? d[i + 3]; }
    }
    x.putImageData(id, 0, 0);
    return c;
  });
  const hexRGB = (F.rgb = (hex) => { const v = parseInt(hex.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; });
  // a sprite: (x, y) is where its anchor (ax, ay, sprite px; default the top-left) goes;
  // o: {sc, rot (rad, clockwise on screen), alpha, ax, ay, flip}
  F.spr = (ctx, img, x, y, o = {}) => {
    if (!img) return;
    const sc = o.sc ?? 2;
    ctx.globalAlpha = o.alpha ?? 1;
    if (!o.rot && !o.flip) {
      ctx.drawImage(img, R(x - (o.ax || 0) * sc), R(y - (o.ay || 0) * sc), img.width * sc, img.height * sc);
    } else {
      ctx.save();
      ctx.translate(R(x), R(y));
      if (o.rot) ctx.rotate(o.rot);
      ctx.scale(o.flip ? -sc : sc, o.sx ? sc * o.sx : sc);
      ctx.drawImage(img, -(o.ax || 0), -(o.ay || 0));
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };
  F.rect = D.rect;
  // a soft round glow on the emissive layer
  F.glowAt = (emi, x, y, r, hex, a) => {
    if (!emi || a <= 0.001) return;
    const g = emi.createRadialGradient(x, y, 0, x, y, r);
    const [cr, cg, cb] = hexRGB(hex);
    g.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`); g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    emi.fillStyle = g; emi.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  // the battle box at t: {x, y, w, h (unrotated rect), cx, cy, rot, ...}
  MV.box2At = (t) => { const b = TL.box2.at(t); return Object.assign(b, { x: b.cx - b.w / 2, y: b.cy - b.h / 2 }); };
  // a point of the original 640x480 screen -> world
  MV.gp = (gx, gy) => [gx + MV.OX, gy + MV.OY];

  // persistent 2D actors, drawn by the scene in layers (src/stage.js fills these):
  // F.layers[name] = [(ctx, emi, t, S) => void]
  F.layers = { back: [], pedestals: [], jars: [], fire: [], king: [], box: [], hud: [], heart: [] };

  // ---------------------------------------------------------------- the scene
  // a canvas the browser may keep on the GPU (never read back): the planes go to WebGL as they are
  const gpuCanvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return [c, x];
  };
  MV.Scene2D = class {
    constructor(canvas) {
      const W = MV.OW + MV.PADX * 2, H = MV.OH + MV.PADY * 2;
      this.W = W; this.H = H;
      // one canvas per depth plane (+ a quarter-size glow for the three that glow)
      this.pl = {};
      for (const name of MV.PLANES) {
        const [c, x] = gpuCanvas(W, H), p = { c, x, z: MV.PLANE_Z[name] };
        if (name !== 'back') [p.g, p.gx] = gpuCanvas(W >> 2, H >> 2);
        this.pl[name] = p;
      }
      this.world = this.pl.front.c; this.ctx = this.pl.front.x; // (the battle plane, for tools)
      [this.emiC, this.emi] = gpuCanvas(W, H);
      [this.screen, this.sctx] = gpuCanvas(MV.OW, MV.OH);
      this.post = new MV.Post2D(canvas);
    }
    // (tr: the music's time - the camera and the impacts; t: the picture's, held still in a hit
    // stop, MV.vt)
    state(tr) {
      const t = MV.vt(tr), fx = TL.fxAt(tr);
      const cam = TL.cam2.at(tr);
      cam.x += fx.sx; cam.y += fx.sy;
      cam.zoom *= 1 + fx.zoom;
      cam.roll += fx.rot * 0.5;
      const look = TL.look2.at(t);
      return { t, tr, flat: true, fx, cam, look, sil: look.sil > 0.5, box: MV.box2At(t) };
    }
    render(tr) {
      const { emi, sctx, pl } = this;
      const S = (MV.S = this.S = this.state(tr)), t = S.t;
      const reset = (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height); c.setTransform(1, 0, 0, 1, MV.PADX, MV.PADY); c.imageSmoothingEnabled = false; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; };
      for (const n of MV.PLANES) reset(pl[n].x);
      reset(emi);
      sctx.clearRect(0, 0, MV.OW, MV.OH);
      const L2 = S.look;
      const tone = !S.sil && (L2.sepia > 0.002 || L2.gray > 0.002);
      // in a hit stop: what was there when it began, held; and what is live, on the music's time
      const evs = t === tr ? TL.active(t) : TL.active(t).filter((e) => !e.live).concat(TL.active(tr).filter((e) => e.live)).sort((a, b) => a.z - b.z);
      const E = S.sil ? null : emi;
      const tOf = (e) => (e.live ? tr : t);
      const ev = (c, z0, z1, filter) => {
        for (const e of evs) {
          if (e.z < z0 || e.z >= z1 || e.screen || (tone && e.keep) || (filter && !filter(e))) continue;
          if (e.draw) e.draw(c, E, tOf(e), S); else if (e.ov) e.ov(c, tOf(e), S);
        }
      };
      const layer = (name, c) => { for (const f of F.layers[name]) f(c, E, t, S); };
      const notBox = (e) => e.clip !== 'box';
      // the plane's glow: what was drawn on the emissive canvas for it, blurred down to a quarter
      const glowOf = (p) => {
        const g = p.gx;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, p.g.width, p.g.height);
        g.imageSmoothingEnabled = true; g.filter = 'blur(2.5px)'; g.drawImage(this.emiC, 0, 0, p.g.width, p.g.height); g.filter = 'none';
        reset(emi);
      };
      // out of focus: drawn into a scratch canvas, softened in one cheap step (shrunk, then scaled
      // back up smoothly) and laid in. (A canvas blur filter per draw call cost ~0.5 s a frame.)
      const plane = (name, px, draw) => {
        const p = pl[name];
        if (!(px > 0.05)) { draw(p.x); return; }
        const [sc, sx] = this.scratch || (this.scratch = gpuCanvas(this.W, this.H));
        reset(sx);
        draw(sx);
        const k = 1 + px * 0.9, w = Math.max(8, Math.round(this.W / k)), h = Math.max(8, Math.round(this.H / k));
        // (one full-size low canvas per plane, of which only the top-left w x h is used: a single
        // shared one sized to the request was rebuilt every frame whenever two planes were soft at
        // different amounts - 44-51, the hall and the jars - two new canvases a frame, the gates'
        // stutter; and every frame of a blur ramp)
        const [lc, lx] = (this.lowCs = this.lowCs || {})[name] || (this.lowCs[name] = gpuCanvas(this.W, this.H));
        lx.imageSmoothingEnabled = true; lx.clearRect(0, 0, w + 2, h + 2); lx.drawImage(sc, 0, 0, w, h);
        const c = p.x; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = true; c.drawImage(lc, 0, 0, w, h, 0, 0, this.W, this.H); c.restore();
        c.imageSmoothingEnabled = false;
      };
      plane('back', L2.blurBack, (c) => { layer('back', c); ev(c, -1000, -400, notBox); });
      reset(emi);
      plane('mid', Math.max(L2.blurJars, L2.blurFire), (c) => { layer('pedestals', c); layer('jars', c); ev(c, -400, -250, notBox); layer('fire', c); ev(c, -250, -100, notBox); });
      glowOf(pl.mid);
      plane('king', L2.blurKing, (c) => { layer('king', c); ev(c, -100, 0, notBox); });
      glowOf(pl.king);
      // the battle plane: the box (black inside, box-clipped events, the frame), the HUD, the soul
      const ctx = pl.front.x, b = S.box;
      const boxEvents = (keepPass) => {
        ctx.save(); emi.save();
        F.boxPath(ctx, b); ctx.clip();
        F.boxPath(emi, b, 30); emi.clip();
        for (const e of evs) {
          if (e.clip !== 'box' || e.screen || (tone && !!e.keep !== keepPass)) continue;
          if (e.draw) e.draw(ctx, E, tOf(e), S); else if (e.ov) e.ov(ctx, tOf(e), S);
        }
        ctx.restore(); emi.restore();
      };
      if (b.a > 0.001) {
        layer('box', ctx);
        boxEvents(false);
        F.boxFrame(ctx, emi, b, S);
      }
      layer('hud', ctx);
      ev(ctx, 0, 40, notBox);
      // the old photograph / the colourless world: the battle plane loses its colour here (the
      // planes behind it in the shader); then the soul and what keeps its colour on top
      if (tone) {
        const [tc, tx] = this.toneC || (this.toneC = gpuCanvas(this.W, this.H));
        tx.setTransform(1, 0, 0, 1, 0, 0); tx.clearRect(0, 0, this.W, this.H);
        tx.filter = `sepia(${U.clamp(L2.sepia).toFixed(3)}) grayscale(${U.clamp(L2.gray).toFixed(3)}) brightness(${(1 - 0.18 * L2.sepia - 0.25 * L2.gray).toFixed(3)})`;
        tx.drawImage(pl.front.c, 0, 0); tx.filter = 'none';
        for (const c of [ctx, emi]) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); }
        ctx.clearRect(0, 0, this.W, this.H); ctx.drawImage(tc, 0, 0);
        emi.globalCompositeOperation = 'destination-out'; D.rect(emi, 0, 0, this.W, this.H, '#000000', U.clamp(Math.max(L2.sepia, L2.gray)));
        emi.globalCompositeOperation = 'source-over';
        ctx.restore(); emi.restore();
        if (b.a > 0.001) boxEvents(true);
        for (const e of evs) if (e.keep && e.clip !== 'box' && !e.screen) { if (e.draw) e.draw(ctx, emi, tOf(e), S); else if (e.ov) e.ov(ctx, tOf(e), S); }
      }
      layer('heart', ctx);
      ev(ctx, 40, 1000, notBox);
      glowOf(pl.front);
      for (const e of evs) if (e.screen) { if (e.draw) e.draw(sctx, null, tOf(e), S); else if (e.ov) e.ov(sctx, tOf(e), S); }
      const fx = S.fx;
      // motion smear from the keyframed camera's speed (shake must not smear)
      const c1 = TL.cam2.at(tr), c0 = TL.cam2.at(tr - 1 / 60);
      const vx = (c1.x - c0.x) * c1.zoom + (c1.yaw - c0.yaw) * 700, vy = (c1.y - c0.y) * c1.zoom + (c1.pitch - c0.pitch) * 700, vr = (c1.roll - c0.roll) * 300;
      // (a streak of at most ~18 px: the picture must still read through a whip; a hard cut is
      // no movement at all - no streak on the frame after it)
      const cut = TL.cam2.segs.some((g) => g.t1 - g.t0 < 1e-6 && g.t0 > tr - 1 / 60 && g.t0 <= tr);
      const vm = Math.hypot(vx + vr, vy), sl = cut ? 0 : (Math.min(vm, 60) - 15) * 0.4;
      const smear = sl > 0 ? [((vx + vr) / vm) * sl / MV.OW, (vy / vm) * sl / MV.OH] : [0, 0];
      const toneK = S.sil ? 0 : U.clamp(Math.max(L2.sepia, L2.gray));
      this.post.render({ planes: MV.PLANES.map((n) => pl[n]), screen: this.screen }, S.cam, {
        bloom: S.sil ? 0 : L2.bloom, vig: L2.vig, letter: L2.letter, fade: L2.fade, white: L2.white, wash: L2.wash,
        flash: fx.flash, flashCol: fx.flashCol, inv: fx.inv || 0, bw: fx.bw || 0, smear,
        // behind him: shade darkens the walls and the jars, dim everything but the battle plane;
        // the old photograph / the grey on the planes behind
        shade: S.sil ? 0 : U.clamp(L2.shade), dim: S.sil ? 0 : U.clamp(L2.dim), sepia: S.sil ? 0 : U.clamp(L2.sepia), gray: S.sil ? 0 : U.clamp(L2.gray), toneK,
      });
      return S;
    }
  };
  // the box outline as a path (rotated about its centre); grow: px outward; add: as one more
  // subpath of the path being built (to clip everything but the box: a big rect, then this,
  // clip('evenodd'))
  F.boxPath = (ctx, b, grow = 0, add = false) => {
    if (!add) ctx.beginPath();
    const hw = b.w / 2 + grow, hh = b.h / 2 + grow, rr = (b.round || 0) * Math.min(b.w, b.h) / 2;
    if (rr > 0.5) {
      // (rounded: drawn about its centre, turned)
      const c = Math.cos(b.rot || 0), s = Math.sin(b.rot || 0), r = Math.min(rr + grow, hw, hh), N = 10, pts = [];
      for (const [qx, qy, a0] of [[hw - r, -hh + r, -Math.PI / 2], [hw - r, hh - r, 0], [-hw + r, hh - r, Math.PI / 2], [-hw + r, -hh + r, Math.PI]])
        for (let i = 0; i <= N; i++) { const a = a0 + (i / N) * (Math.PI / 2); pts.push([qx + Math.cos(a) * r, qy + Math.sin(a) * r]); }
      pts.forEach(([x, y], i) => { const px = b.cx + x * c - y * s, py = b.cy + x * s + y * c; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      ctx.closePath();
      return;
    }
    if (!b.rot) { ctx.rect(R(b.x) - grow, R(b.y) - grow, R(b.w) + 2 * grow, R(b.h) + 2 * grow); return; }
    const c = Math.cos(b.rot), s = Math.sin(b.rot);
    [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].forEach(([x, y], i) => { const px = b.cx + x * c - y * s, py = b.cy + x * s + y * c; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.closePath();
  };
})();
