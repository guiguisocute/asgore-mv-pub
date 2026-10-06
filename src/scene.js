// Frame composition: camera (+ impacts), palette blend, actors (persistent voxel
// characters / props driven by tracks), timeline events (vox / ov), overlay, render.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U;
  const L = U.lin;

  // palette presets: background gradient, ground glow, fog, hemisphere ambient, key light.
  // The light itself stays near-neutral and is balanced so a face turned to the camera comes
  // out at its own colour (ambient ~0.6 + key ~0.45): the sprites keep the game's colours;
  // the mood lives in the background, the fog and the glows.
  const SKY = L('#dcd8e6'), GROUND = L('#b2abbd'), KEY = L('#fff4ea');
  const PAL = (MV.PAL = {
    corridor: { top: L('#17151f'), bot: L('#0d0c12'), glow: L('#3a3550'), glowY: 0.6, glowAmt: 0.25, fog: L('#141219'), sky: SKY, ground: GROUND, lcol: KEY },
    void: { top: L('#1d1932'), bot: L('#0d0a17'), glow: L('#3a2a5a'), glowY: 0.15, glowAmt: 0.6, fog: L('#141022'), sky: SKY, ground: GROUND, lcol: KEY },
    // the game's black, with a low violet glow on the horizon; the stage itself is lit enough
    // to read (floor, dais, steps)
    battle: { top: L('#050409'), bot: L('#0e0816'), glow: L('#3c1640'), glowY: 0.0, glowAmt: 0.55, fog: L('#07050c'), sky: L('#d8d4e4'), ground: L('#aaa2b8'), lcol: L('#fff2e6') },
    memory: { top: L('#2a1a0c'), bot: L('#120a04'), glow: L('#8a5a1a'), glowY: 0.2, glowAmt: 0.6, fog: L('#1c1208'), sky: L('#ecdcc0'), ground: L('#c4aa8a'), lcol: L('#ffe8c8') },
    dawn: { top: L('#1a0f12'), bot: L('#0a0508'), glow: L('#8a3a20'), glowY: 0.55, glowAmt: 0.5, fog: L('#140a0c'), sky: L('#e2c8cc'), ground: L('#b49ca0'), lcol: L('#ffdcc0') },
    // the darkness at the corridor's end (act two): the 2D battle's black
    black: { top: [0, 0, 0], bot: [0, 0, 0], glow: [0, 0, 0], glowY: 0, glowAmt: 0, fog: [0, 0, 0], sky: SKY, ground: GROUND, lcol: KEY },
    // inside the green soul (act four, bar 20): a kitchen's hearth glowing from below
    hearth: { top: L('#070403'), bot: L('#2a0e05'), glow: L('#a8420e'), glowY: 0.0, glowAmt: 0.75, fog: L('#0a0503'), sky: L('#f0dcc8'), ground: L('#c49c7c'), lcol: L('#ffe2c4') },
  });
  const blendPal = (w) => {
    const out = {};
    let tot = 0;
    for (const k in PAL) tot += w[k] || 0;
    tot = tot || 1;
    for (const k in PAL) {
      const a = (w[k] || 0) / tot;
      if (!a) continue;
      for (const f in PAL[k]) {
        const v = PAL[k][f];
        if (Array.isArray(v)) out[f] = out[f] ? out[f].map((x, i) => x + v[i] * a) : v.map((x) => x * a);
        else out[f] = (out[f] || 0) + v * a;
      }
    }
    return out;
  };

  MV.ACTORS = []; // (V, t, S) => void, drawn every frame in order

  MV.Scene = class {
    constructor(vox, ovCanvas) {
      this.vox = vox;
      this.ov = ovCanvas;
      this.ctx = ovCanvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
    }
    // (tr: the music's time - the impacts; t: the picture's, held still in a hit stop, MV.vt: the
    // whole voxel frame holds, camera and all)
    render(tr) {
      const V = this.vox, W = V.canvas.width, H = V.canvas.height;
      const t = MV.vt(tr), fx = TL.fxAt(tr);
      const c = Object.assign({}, TL.cam.at(t));
      // impacts: shake in screen units scaled to the framing, punch-in, roll
      const k = c.h / 480;
      c.h *= 1 - fx.zoom;
      c.roll += fx.rot;
      const cam0 = MV.camera(c, W / H);
      c.x += (cam0.right[0] * fx.sx + cam0.up[0] * fx.sy) * k;
      c.y += (cam0.right[1] * fx.sx + cam0.up[1] * fx.sy) * k;
      c.z += (cam0.right[2] * fx.sx + cam0.up[2] * fx.sy) * k;
      const cam = MV.camera(c, W / H);
      const look = TL.look.at(t), pal = blendPal(TL.pal.at(t)), ld = TL.lightDir.at(t);
      if (MV.Q.has('cap')) look.cap = +MV.Q.get('cap');
      const S = { t, tr, cam, camP: c, look, pal, fx, W, H };
      MV.S = S;
      for (const a of MV.ACTORS) a(V, t, S);
      const ctx = this.ctx;
      ctx.clearRect(0, 0, MV.OW, MV.OH);
      const act = t === tr ? TL.active(t) : TL.active(t).filter((e) => !e.live).concat(TL.active(tr).filter((e) => e.live)).sort((a, b) => a.z - b.z);
      for (const e of act) if (e.vox) e.vox(V, e.live ? tr : t, S);
      for (const e of act) if (e.ov) e.ov(ctx, e.live ? tr : t, S);
      V.render({
        cam: c, time: t, unlit: look.unlit, lit: look.lit, shadow: look.shadow > 0.5,
        light: { dir: [ld.x, ld.y, ld.z], col: pal.lcol, sky: pal.sky, ground: pal.ground, center: S.shadowCenter || [c.x, c.y, c.z], radius: S.shadowRadius || 700 },
        fog: [...pal.fog, look.fog], fogStart: look.fogStart,
        bg: { top: pal.top, bot: pal.bot, glow: pal.glow, glowY: pal.glowY, glowAmt: pal.glowAmt * (1 + look.glowAmt) },
        post: {
          bloom: look.bloom, th: look.th, exposure: look.exposure, white: look.white, sat: look.sat, vig: look.vig,
          ca: look.ca + fx.ca, grain: look.grain, flash: fx.flash, flashCol: fx.flashCol, contrast: look.contrast,
          // (an impact frame in a voxel window: the game's flash - a pale field, everything on it black)
          cap: look.cap, fade: look.fade, letter: look.letter, inv: fx.inv || fx.bw ? 1 : look.inv, invCol: [look.invV, look.invV * 0.99, look.invV * 1.04], wash: look.wash,
        },
      });
      return S;
    }
  };
})();
