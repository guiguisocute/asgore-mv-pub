// The six worlds (act four, bars 16-51). While a soul lends him its power, the flattened
// corridor behind the battle becomes the place where its human's things were left behind - the
// place that child's journey ended. Its colour runs over the corridor's rings from the outside in
// (the soul's light reaching the walls); the world stands there while he uses it, answering the
// music; when the ribbon lets go, his fire burns it away from the bottom up.
//   yellow · justice      the frontier at sundown: dusk bands, the sun sinking at the corridor's
//                         end behind him (his silhouette in its rays), mesas, telegraph poles
//                         marching to the horizon, vultures, sand on the wind, tumbleweeds. Dead
//                         Eye stops its clock: the tumbleweeds hang in the air
//   green  · kindness     a kitchen's hearth: warm brick, a rack of pans, steam
//   purple · perseverance the archive in the clouds: shelves to the door, lamps, high windows'
//                         shafts through a haze (cloudy glasses), torn pages whirling into the dark
//   blue   · integrity    Waterfall's wishing room: a ceiling of crystal stars, two waterfalls,
//                         echo flowers, a spotlight on the music box
//   orange · bravery      Snowdin at night: pines marching to the door, the lamp post, a
//                         blizzard - every punch a gust, every shock ring blows the snow away
//   aqua   · patience     the Ruins in autumn: purple brick, the red tree, a great clock, light
//                         from the hole above; the leaves fall only while the soul moves
//                         (SUPERHOT), and when the clock stops they hang in the air
// Painted once at half resolution (every pixel 2 world px, the sprites' own 2x) on the backdrop
// plane; near things (tumbleweeds, pages, snow, leaves) on the jars' plane in front of the fire,
// a few on the battle plane - never inside the box.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U, H = MV.H, D = MV.D, F = MV.F, FL = MV.FL;
  const R = Math.round, HEX = MV.COL.S;
  const W0 = -MV.PADX, H0 = -MV.PADY, WW = MV.OW + 2 * MV.PADX, HH = MV.OH + 2 * MV.PADY;
  const VP = FL.door; // the corridor's vanishing point, behind the box
  const HS = 2, PW = WW / HS, PH = HH / HS;
  const C = (hex) => F.rgb(hex);
  const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const css = (c, a = 1) => `rgba(${R(c[0])},${R(c[1])},${R(c[2])},${a})`;
  const fract = (x) => x - Math.floor(x);
  const wrap = (x, a, b) => a + (((x - a) % (b - a)) + (b - a)) % (b - a);

  // ---------------------------------------------------------------- the pixel painter
  // half resolution over the whole backdrop plane; world px -> its pixels by X / Y; crisp edges
  // (scanline polygons, no anti-aliasing)
  class Pix {
    constructor() { this.w = PW; this.h = PH; this.d = new Uint8ClampedArray(PW * PH * 4); }
    X(wx) { return (wx - W0) / HS; }
    Y(wy) { return (wy - H0) / HS; }
    put(i, j, c, a = 1) {
      i = Math.floor(i); j = Math.floor(j);
      if (i < 0 || j < 0 || i >= this.w || j >= this.h || a <= 0) return;
      const p = (j * this.w + i) * 4, d = this.d;
      if (a >= 1) { d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; d[p + 3] = 255; return; }
      const b = d[p + 3] / 255, oa = a + b * (1 - a);
      for (let k = 0; k < 3; k++) d[p + k] = (c[k] * a + d[p + k] * b * (1 - a)) / oa;
      d[p + 3] = oa * 255;
    }
    hline(i0, i1, j, c, a) { for (let i = Math.max(0, Math.ceil(i0)), e = Math.min(this.w - 1, Math.floor(i1)); i <= e; i++) this.put(i, j, c, a); }
    rect(i0, j0, w, h, c, a) { for (let j = j0; j < j0 + h; j++) this.hline(i0, i0 + w - 1, j, c, a); }
    // world px
    wrect(x, y, w, h, c, a) { this.rect(R(this.X(x)), R(this.Y(y)), Math.max(1, R(w / HS)), Math.max(1, R(h / HS)), c, a); }
    poly(pts, c, a) {
      const P = pts.map(([x, y]) => [this.X(x), this.Y(y)]);
      let y0 = Infinity, y1 = -Infinity;
      for (const p of P) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
      for (let j = Math.max(0, Math.floor(y0)); j <= Math.min(this.h - 1, Math.ceil(y1)); j++) {
        const yc = j + 0.5, xs = [];
        for (let k = 0; k < P.length; k++) {
          const [ax, ay] = P[k], [bx, by] = P[(k + 1) % P.length];
          if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) this.hline(Math.round(xs[k]), Math.round(xs[k + 1]) - 1, j, c, a);
      }
    }
    // a line w world px thick (a thin quad)
    line(x0, y0, x1, y1, c, a, w = 2) {
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
      if (w <= HS) {
        const n = Math.ceil(L / HS) + 1;
        for (let k = 0; k <= n; k++) this.put(this.X(x0 + (dx * k) / n), this.Y(y0 + (dy * k) / n), c, a);
        return;
      }
      this.poly([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], c, a);
    }
    disc(x, y, r, c, a) {
      const i0 = this.X(x), j0 = this.Y(y), rr = r / HS;
      for (let j = Math.floor(j0 - rr); j <= Math.ceil(j0 + rr); j++) {
        const dy = j + 0.5 - j0;
        if (Math.abs(dy) > rr) continue;
        const hw = Math.sqrt(rr * rr - dy * dy);
        this.hline(Math.round(i0 - hw), Math.round(i0 + hw) - 1, j, c, a);
      }
    }
    // rows of colour from world y0 to y1 (smooth: every row its own mix of the stops)
    vgrad(y0, y1, stops, x0 = W0, x1 = W0 + WW, a = 1) {
      const j0 = Math.floor(this.Y(y0)), j1 = Math.ceil(this.Y(y1)), S = stops.map((s) => (typeof s === 'string' ? C(s) : s)), n = S.length - 1;
      for (let j = j0; j < j1; j++) {
        const u = U.clamp((j + 0.5 - j0) / Math.max(1, j1 - j0)) * n, k = Math.min(n - 1, Math.floor(u));
        this.hline(Math.floor(this.X(x0)), Math.ceil(this.X(x1)) - 1, j, mixC(S[k], S[k + 1], u - k), a);
      }
    }
    canvas() {
      const [c, x] = MV.canvas(this.w, this.h), id = x.createImageData(this.w, this.h);
      id.data.set(this.d); x.putImageData(id, 0, 0);
      return c;
    }
  }
  MV.Pix = Pix;
  const painted = (key, paint) => () => F.cached('world:' + key, () => { const P = new Pix(); paint(P); return MV.gpuCopy(P.canvas()); });
  // a painted layer over the plane, shifted (snapped to its pixels) by parallax p of the camera
  const lay = (ctx, img, W, p = 0) => {
    const ox = R((-W.ox * p) / HS) * HS, oy = R((-W.oy * p) / HS) * HS;
    ctx.drawImage(img, W0 + ox, H0 + oy, WW, HH);
  };
  // the corridor's own perspective: a point X, Y off its axis on the frame Z deep (1 = the
  // picture's edge)
  const persp = (X, Y, Z) => [VP[0] + X / Z, VP[1] + Y / Z];
  // a small pixel sprite from rows
  const rows = (key, rs, pal) => F.cached('wspr:' + key, () => {
    const w = Math.max(...rs.map((r) => r.length)), [c, x] = MV.canvas(w, rs.length);
    rs.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
    return c;
  });
  // a light (additive, soft): a radial glow / a quad of light fading along it
  const glow = (ctx, x, y, r, c, a) => {
    if (a <= 0.002) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, css(c, a)); g.addColorStop(0.5, css(c, a * 0.35)); g.addColorStop(1, css(c, 0));
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.globalCompositeOperation = 'source-over';
  };
  const beam = (ctx, pts, from, to, c, a) => {
    if (a <= 0.002) return;
    const g = ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
    g.addColorStop(0, css(c, a)); g.addColorStop(1, css(c, 0));
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };
  const px = (ctx, x, y, s, col, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(R(x / HS) * HS, R(y / HS) * HS, s, s); ctx.globalAlpha = 1; };

  // ---------------------------------------------------------------- clocks, wind
  // a world's own time: running at rate(t) (0 = stopped) from t0 to t1, baked lazily (120 Hz;
  // the tracks it reads are complete by the first frame)
  MV.clockOf = (t0, t1, rate) => {
    let tab = null;
    return (t) => {
      if (t <= t0) return t;
      if (!tab) {
        tab = [0];
        let acc = 0;
        for (let k = 1; t0 + (k - 1) / 120 < t1; k++) { acc += rate(t0 + (k - 0.5) / 120) / 120; tab.push(acc); }
      }
      const f = (Math.min(t, t1) - t0) * 120, i = Math.min(Math.floor(f), tab.length - 1), j = Math.min(i + 1, tab.length - 1);
      return t0 + tab[i] + (tab[j] - tab[i]) * (f - Math.floor(f)) + Math.max(0, t - t1);
    };
  };
  // the clock stopped over spans [[a, b]] (easing in and out over r)
  MV.stopClock = (t0, t1, spans, r = 0.08) => MV.clockOf(t0, t1, (t) => {
    let k = 1;
    for (const [a, b] of spans) if (t > a && t < b) k = Math.min(k, 1 - U.clamp((t - a) / r) * U.clamp((b - t) / r));
    return k;
  });
  // gusts [[t, amount]]: how far they have pushed things by t (px), each blowing out over tau
  const gustX = (gusts, t, tau = 0.32) => { let x = 0; for (const [tg, a] of gusts) if (t > tg) x += a * tau * (1 - Math.exp(-(t - tg) / tau)); return x; };
  const gustNow = (gusts, t, tau = 0.32) => { let v = 0; for (const [tg, a] of gusts) if (t > tg) v += a * Math.exp(-(t - tg) / tau); return v; };

  // ---------------------------------------------------------------- the worlds and their entrances
  // world: {bg: () => canvas, back(ctx, W), near(ctx, W), front(ctx, W), wind (-1..1)}
  // W: {t, wt (its clock), u (0..1 through its span), k (how present), ox, oy (the camera's offset
  // from home, px: parallax inside it), gx (the gusts' push, px), gv (the gust now), hex, o}
  const WORLDS = (MV.WORLDS = {});
  MV.prewarm = MV.prewarm || [];
  const camOff = (S) => {
    const c = S.cam, fov = c.fov || 0.7, dist = MV.OH / 2 / (Math.tan(fov / 2) * (c.zoom || 1));
    return [c.x - 480 - Math.cos(c.pitch || 0) * Math.sin(c.yaw || 0) * dist, c.y - 270 + Math.sin(c.pitch || 0) * dist];
  };
  // the rectangle (half sizes) of the corridor's ring at d (0 the door .. 1 the picture's edge)
  const ringRect = (d) => [d * 511, d * 384];
  const rectPath = (ctx, d) => { const [hx, hy] = ringRect(d); ctx.rect(R(VP[0] - hx), R(VP[1] - hy), R(2 * hx), R(2 * hy)); };
  // spans where a world covers the whole backdrop (the corridor need not be drawn)
  const covers = [];
  MV.worldCovers = (t) => covers.some(([a, b]) => t >= a && t < b);
  // H.world(key, tIn, tOut, o): the world behind the battle from tIn to tOut.
  //   o.wipe: its colour runs over the rings from the outside in, over this long (0: a cut)
  //   o.burn: his fire burns it away from the bottom up, over this long (0: a cut)
  //   o.band: [d0, d1] (or t -> [d0, d1]) only between the corridor's rings d0 < d1 (the
  //   gathering, the climax's tunnel); o.burst: it leaves by flying outward past the picture
  //   (instead of burning); o.lite: only its painted backdrop (a ring rushing past)
  //   o.clock: t -> its time; o.gusts: [[t, px/s]]; o.rings: shock rings that push its snow
  H.world = (key, tIn, tOut, o = {}) => {
    const w = WORLDS[key], hex = HEX[key], col = C(hex), wipe = o.wipe ?? 0.45, burn = o.burn ?? 0.6;
    const bandAt = typeof o.band === 'function' ? o.band : o.band ? () => o.band : null;
    const clock = o.clock || ((t) => t), gusts = o.gusts || [];
    const kIn = (t) => (wipe > 0 ? U.eOut(U.clamp((t - tIn) / wipe)) : t >= tIn ? 1 : 0);
    const kOut = (t) => (burn > 0 ? U.clamp((t - tOut) / burn) : t >= tOut ? 1 : 0);
    if (!o.band) covers.push([tIn + wipe, tOut]);
    // o.fire: his fire sinks to this while the world stands (its ground shows), and comes back for
    // it - up past its height as it burns the world away
    if (o.fire !== undefined) {
      TL.look2.to(tIn, tIn + Math.max(0.5, wipe + 0.25), { flames: o.fire }, 'inOut');
      TL.look2.to(tOut - 0.1, tOut + 0.12, { flames: 1.4 }, 'out').to(tOut + 0.12, tOut + Math.max(0.3, burn) + 0.3, { flames: 1 }, 'inOut');
    }
    if (w.wind && o.wind !== false) TL.look2.to(tIn, tIn + 0.5, { wind: w.wind }, 'inOut').to(tOut, tOut + Math.max(0.3, burn), { wind: 0 }, 'inOut');
    for (const [tg, a] of gusts) if (o.windGusts !== false) TL.look2.to(tg, tg + 0.06, { wind: U.clamp((w.wind || 0) + a / 500, -1.4, 1.4) }, 'out').to(tg + 0.06, tg + 0.5, { wind: w.wind || 0 }, 'inOut');
    // wd: "wind time" - how far its wind has carried things (the stage's wind over its own clock,
    // in units of its steady wind): what drifts on the wind stops when the wind drops or time stops
    // (a world that does not set the stage's wind - or a cut in the climax - blows steadily)
    const w0 = w.wind || 1, rateOf = (s) => (clock(s + 1 / 240) - clock(s - 1 / 240)) * 120;
    const windClock = w.wind && o.wind !== false ? MV.clockOf(tIn - 2, tOut + burn + 0.5, (s) => (TL.look2.at(s).wind / w0) * rateOf(s)) : null;
    const W = (t, S) => {
      const [ox, oy] = camOff(S), wt = clock(t);
      return { t, wt, wd: windClock ? windClock(t) - (tIn - 2) : wt, u: U.clamp((t - tIn) / Math.max(0.01, tOut - tIn)), k: kIn(t) * (1 - kOut(t)), ox, oy, gx: gustX(gusts, t), gv: gustNow(gusts, t), hex, col, o, S, tIn, tOut, clock };
    };
    // (painted and baked at load, not on the frame it first shows: no hitch in playback)
    MV.prewarm.push((sc) => {
      clock(tIn + 0.5);
      if (windClock) windClock(tIn + 0.5);
      // (its backdrop drawn once into the backdrop plane: on the GPU before it is needed)
      const still = o.lite ? (w.lite || w.bg) : w.bg;
      if (still) { const img = still(), c = sc && sc.pl.back.x; if (c) { c.drawImage(img, 0, 0, 8, 8); c.clearRect(0, 0, 8, 8); } }
    });
    // the burning edge (world y at x) rising from the bottom of the plane to above its top
    const burnY = (t, x) => {
      const b = U.smooth(kOut(t)), y = U.lerp(H0 + HH - 120, H0 - 70, b);
      return y + 16 * U.noise(x * 0.031 + t * 3) + 9 * U.noise(x * 0.093 - t * 7) + 30 * Math.sin(x * 0.006 + 1);
    };
    // (a ring of the climax's tunnel at its own depth, o.depth(t) -> [its outer edge's, its inner
    // edge's]: drawn where those edges would be seen from the camera - with the gates that ride them -
    // and only the four strips of its band: a whole picture under a clip, ring after ring, cost the
    // GPU a full plane's fill per ring)
    const ringStrips = (ctx, t, S, band) => {
      const [zO, zI] = o.depth(t), xo = MV.depthXf(S.cam, zO, 900), xi = MV.depthXf(S.cam, zI, 900);
      const rectOn = (d, x) => { const [hx, hy] = ringRect(d); return [x.ox + x.k * (VP[0] - hx), x.oy + x.k * (VP[1] - hy), x.ox + x.k * (VP[0] + hx), x.oy + x.k * (VP[1] + hy)]; };
      const Ob = rectOn(Math.min(band[1], 3), xo), O = [Math.max(Ob[0], W0), Math.max(Ob[1], H0), Math.min(Ob[2], W0 + WW), Math.min(Ob[3], H0 + HH)];
      const I = band[0] > 0.002 ? rectOn(band[0], xi) : null;
      // its picture: home layout, scaled about the door by zoomAt, then at the outer edge's depth
      const img = (w.lite || w.bg)(), zs = o.zoomAt ? o.zoomAt(t) : 1;
      const Bx = xo.k * zs * (WW / img.width), By = xo.k * zs * (HH / img.height);
      const Ax = xo.ox + xo.k * (VP[0] + (W0 - VP[0]) * zs), Ay = xo.oy + xo.k * (VP[1] + (H0 - VP[1]) * zs);
      const strip = (x0, y0, x1, y1) => {
        x0 = Math.max(x0, O[0]); y0 = Math.max(y0, O[1]); x1 = Math.min(x1, O[2]); y1 = Math.min(y1, O[3]);
        if (x1 - x0 < 0.5 || y1 - y0 < 0.5) return;
        let i0 = (x0 - Ax) / Bx, i1 = (x1 - Ax) / Bx, j0 = (y0 - Ay) / By, j1 = (y1 - Ay) / By;
        i0 = Math.max(0, i0); j0 = Math.max(0, j0); i1 = Math.min(img.width, i1); j1 = Math.min(img.height, j1);
        if (i1 - i0 <= 0 || j1 - j0 <= 0) return;
        ctx.drawImage(img, i0, j0, i1 - i0, j1 - j0, Ax + Bx * i0, Ay + By * j0, Bx * (i1 - i0), By * (j1 - j0));
      };
      if (!I) { strip(O[0], O[1], O[2], O[3]); return; }
      strip(O[0], O[1], O[2], I[1]); strip(O[0], I[3], O[2], O[3]);
      strip(O[0], I[1], I[0], I[3]); strip(I[2], I[1], O[2], I[3]);
    };
    TL.add({
      t0: tIn, t1: tOut + burn, z: o.z ?? -900, kind: 'world', name: 'world ' + key,
      draw(ctx, emi, t, S) {
        if (S.sil) return;
        const a = kIn(t), b = kOut(t);
        if (a <= 0.001 || b >= 0.999) return;
        if (o.depth && o.lite && bandAt) { const band = bandAt(t); if (band[0] < 3) ringStrips(ctx, t, S, band); return; }
        const ww = W(t, S);
        // (a band bursting: flung outward past the picture's edge, fading)
        const bs = o.burst ? 1 + 6 * b * b : 1, band = bandAt ? bandAt(t).map((d) => d * bs) : null;
        if (band && band[0] > 3) return;
        ctx.save();
        if (o.burst && b > 0) ctx.globalAlpha = 1 - b;
        ctx.beginPath();
        // the entrance: outside a shrinking ring; the band: between two rings
        const dHole = band ? Math.max(band[0], U.lerp(band[1], band[0], a)) : U.lerp(1.5, 0, a);
        if (band) { rectPath(ctx, Math.min(band[1], 3)); rectPath(ctx, dHole); }
        else { ctx.rect(W0, H0, WW, HH); if (dHole > 0.001) rectPath(ctx, dHole); }
        ctx.clip('evenodd');
        // the exit: above the burning edge
        if (b > 0 && !o.burst) {
          ctx.beginPath(); ctx.moveTo(W0, H0 - 200); ctx.lineTo(W0 + WW, H0 - 200);
          for (let x = W0 + WW; x >= W0 - 8; x -= 8) ctx.lineTo(x, burnY(t, x));
          ctx.closePath(); ctx.clip();
        }
        const still = o.lite ? (w.lite || w.bg) : w.bg;
        // (o.zoomAt: the picture itself scaled about the door - a ring flying at the eye carries
        // its world with it, growing)
        const zs = o.zoomAt ? o.zoomAt(t) : 1;
        if (zs !== 1) { ctx.translate(VP[0], VP[1]); ctx.scale(zs, zs); ctx.translate(-VP[0], -VP[1]); }
        if (still) lay(ctx, still(), ww, w.par ?? 0);
        if (w.back && !o.lite) w.back(ctx, ww);
        if (o.glow) { const g = o.glow(t); if (g > 0.01) { ctx.globalAlpha = Math.min(1, g) * 0.35; ctx.fillStyle = hex; ctx.fillRect(W0, H0, WW, HH); } }
        ctx.restore();
        // the colour running in at the ring's edge: a band of the soul's colour, fading inward
        if (a < 1 && dHole > 0.001) {
          const [hx, hy] = ringRect(dHole), k = 1 - U.clamp((a - 0.75) / 0.25);
          ctx.save(); ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = hex; ctx.lineWidth = 6;
          ctx.strokeRect(R(VP[0] - hx) - 3, R(VP[1] - hy) - 3, R(2 * hx) + 6, R(2 * hy) + 6);
          ctx.globalAlpha = 0.35 * k; ctx.lineWidth = 16;
          ctx.strokeRect(R(VP[0] - hx) - 14, R(VP[1] - hy) - 14, R(2 * hx) + 28, R(2 * hy) + 28);
          ctx.restore();
        }
        if (band && o.edge !== false) {
          // the band's own edges: thin lines of its colour (the rings it lives between)
          ctx.save(); ctx.globalAlpha = 0.7 * (1 - b); ctx.strokeStyle = hex; ctx.lineWidth = 2;
          for (const d of [band[0], Math.min(band[1], 3)]) { if (d < 0.01) continue; const [hx, hy] = ringRect(d); ctx.strokeRect(R(VP[0] - hx), R(VP[1] - hy), R(2 * hx), R(2 * hy)); }
          ctx.restore();
        }
        // the burning edge: a seam of fire, embers lifting off it (a band: only across itself)
        if (b > 0 && b < 1 && !o.burst) {
          ctx.save();
          if (band) { ctx.beginPath(); rectPath(ctx, Math.min(band[1], 3)); rectPath(ctx, band[0]); ctx.clip('evenodd'); }
          const seam = (col, dy, h, a) => { ctx.globalAlpha = a; ctx.fillStyle = col; for (let x = W0; x < W0 + WW; x += 6) ctx.fillRect(x, R(burnY(t, x + 3) + dy), 6, h); };
          seam('#1a0806', -14, 11, 0.45); seam('#a8300c', 6, 6, 0.6); seam('#ff8a1e', 1, 5, 0.85); seam('#ffe08a', -3, 4, 0.95);
          ctx.globalAlpha = 1;
          for (let i = 0; i < (o.band ? 16 : 60); i++) {
            const h1 = U.hash(i * 3.7 + tOut + (o.band ? o.band[0] * 9 : 0)), x = W0 + h1 * WW, y0 = burnY(t, x), life = fract(t * (1.4 + U.hash(i * 1.3)) + U.hash(i * 7.1));
            D.rect(ctx, x + Math.sin(t * 5 + i) * 6, y0 - life * 70, 4, 4, life < 0.4 ? '#ffd27a' : '#ff6a1e', 1 - life);
          }
          ctx.restore();
        }
      },
    });
    const vis = (t) => kIn(t) * (1 - U.clamp(kOut(t) * 1.6));
    // (a ring of a world has no near things: they would fill the whole picture)
    if (w.near && (o.near ?? !o.band)) TL.add({
      t0: tIn, t1: tOut + burn, z: -180, kind: 'world', name: 'world near ' + key,
      draw(ctx, emi, t, S) { if (S.sil) return; const k = vis(t); if (k <= 0.01) return; const ww = W(t, S); ww.k = k; w.near(ctx, ww, emi); ctx.globalAlpha = 1; },
    });
    if (w.front && !o.band) TL.add({
      t0: tIn, t1: tOut + burn, z: 38, kind: 'world', name: 'world front ' + key,
      draw(ctx, emi, t, S) {
        if (S.sil) return;
        const k = vis(t);
        if (k <= 0.01) return;
        const ww = W(t, S); ww.k = k;
        // (never inside the box: its inside stays the game's black)
        ctx.save(); ctx.beginPath(); ctx.rect(W0, H0, WW, HH); F.boxPath(ctx, S.box, 4, true); ctx.clip('evenodd');
        w.front(ctx, ww);
        ctx.restore(); ctx.globalAlpha = 1;
      },
    });
  };

  // H.tunnel(births, tStart, tEnd, o): flying down the corridor through the worlds (the climax).
  // At each birth [t, key] a ring of that world is born at the door and flies outward past the
  // picture - an edge born at tb is at d = D0 e^((t - tb) / lam) - the newest filling the door
  // until the next is born. Shown from tStart (rings born before are already on their way), cut
  // at tEnd. Each ring is its world's still picture (o.lite), its edges lines of its colour.
  // (a birth may carry its own depth: [tb, key, D] with D(t) -> the ring's scale at t, 0 before it
  // is born - the gates of the climax rush at their own pace, each ring with its gate)
  // (o.zOf: an edge's scale -> its depth (0 the battle plane .. 900 the walls): each ring drawn at
  // its own depth, src/depth.js - the gates of the climax ride their rings' edges)
  H.tunnel = (births, tStart, tEnd, o = {}) => {
    const D0 = 0.03, LAM = o.lam ?? 0.55, Dd = (tau) => (tau < 0 ? 0 : D0 * Math.exp(tau / LAM));
    const depth = (b) => b[2] || ((t) => Dd(t - b[0]));
    births.forEach((b, i) => {
      const [tb, key] = b, Di = depth(b), Dn = i + 1 < births.length ? depth(births[i + 1]) : () => 0;
      const next = i + 1 < births.length ? births[i + 1][0] : Infinity;
      // (gone when the ring inside it has rushed out past the picture too)
      let gone = tEnd;
      if (next < Infinity) for (let t = next; t < next + 4; t += 0.01) if (Dn(t) >= 2.4) { gone = Math.min(tEnd, t); break; }
      const t0 = Math.max(tb, tStart);
      if (gone <= t0) return;
      // (its picture scaled with its outer edge: at the picture's own size when that edge is at
      // the frame of the corridor, and on past it, growing as it rushes by)
      H.world(key, t0, gone, { band: (t) => [Dn(t), Di(t)], zoomAt: (t) => Math.max(0.02, Di(t) * 0.92), wipe: 0, burn: 0, lite: true, wind: false, z: o.z ?? -950, edge: o.edge,
        depth: o.zOf ? (t) => [o.zOf(Di(t)), o.zOf(Dn(t))] : undefined });
    });
    covers.push([tStart, tEnd]);
  };

  // ================================================================ yellow · the frontier at sundown
  // the empty gun and the cowboy hat (Bratty & Catty's, Hotland's heat): the last evening of a town
  // at the edge of the world. The sun sinks at the corridor's end, right behind him.
  const SUN = [480, 312], HZ = 345;
  const yellowSky = painted('ySky', (P) => {
    P.vgrad(H0, HZ + 1, ['#12060e', '#1e0912', '#341016', '#521818', '#74241c', '#963620', '#b44c24', '#cc662c', '#de8436', '#eaa046']);
  });
  const yellowSun = painted('ySun', (P) => {
    // the disc in bands, the rim darker (the haze on the horizon)
    [[176, '#d8783a', 0.45], [164, '#ec9c48'], [150, '#f6ba5e'], [134, '#fbd27c'], [112, '#fde3a2']].forEach(([r, c, a]) => P.disc(SUN[0], SUN[1], r, C(c), a ?? 1));
  });
  const yellowLand = painted('yLand', (P) => {
    const rnd = U.rng(17);
    // far mesas in the haze, then the near ones, their tops lit by the sun
    const mesa = (pts, fill, rim) => { P.poly(pts, C(fill)); for (let k = 0; k + 1 < pts.length; k++) { const [a, b] = [pts[k], pts[k + 1]]; if (Math.abs(a[1] - b[1]) < 1 && a[1] < HZ - 2) P.line(a[0], a[1], b[0], b[1], C(rim), 1, 2); } };
    mesa([[-200, HZ], [-200, 286], [-90, 284], [-70, 296], [60, 296], [76, 310], [210, 312], [226, HZ]], '#6c2c22', '#b4583a');
    mesa([[640, HZ], [656, 300], [790, 298], [806, 282], [960, 280], [980, 292], [1160, 290], [1160, HZ]], '#6c2c22', '#b4583a');
    mesa([[-200, HZ], [-200, 244], [-150, 240], [-120, 252], [-10, 252], [10, 272], [110, 274], [128, 300], [250, 302], [270, 324], [330, 326], [346, HZ]], '#2c0e12', '#c0602c');
    mesa([[612, HZ], [628, 322], [690, 320], [706, 298], [830, 296], [852, 262], [940, 260], [962, 238], [1080, 236], [1100, 250], [1160, 250], [1160, HZ]], '#2c0e12', '#c0602c');
    // the ground: dark, the road's ruts running to the door
    P.vgrad(HZ, H0 + HH, ['#4a1c10', '#2a100a', '#160806', '#0c0504']);
    for (const s of [-1, 1]) for (const d of [70, 150]) P.line(VP[0] + s * d * 4, H0 + HH, VP[0] + s * 4, HZ, C('#120604'), 1, 4);
    // telegraph poles marching to the horizon on both sides of the road, their wires sagging
    const Z = [1, 1.5, 2.2, 3.2, 4.6, 6.6, 9.4, 13.4];
    for (const s of [-1, 1]) {
      const X = s * 470, tops = [];
      Z.forEach((z) => {
        const [x, yb] = persp(X, 250, z), [, yt] = persp(X, -330, z), w = Math.max(2, 12 / z), arm = 70 / z;
        P.wrect(x - w / 2, yt, w, yb - yt, C('#1a0806'));
        P.wrect(x - arm, yt + 14 / z, 2 * arm, Math.max(2, 7 / z), C('#1a0806'));
        for (const q of [-0.8, -0.3, 0.3, 0.8]) P.wrect(x + q * arm - 2, yt + 6 / z, 4, Math.max(2, 8 / z), C('#2a120c'));
        tops.push([x, yt + 14 / z, arm]);
      });
      for (let k = 0; k + 1 < tops.length; k++) for (const q of [-0.8, 0.8]) {
        const [x0, y0, a0] = tops[k], [x1, y1, a1] = tops[k + 1], sag = 26 / Z[k];
        for (let m = 0; m < 24; m++) {
          const u = m / 24, v = (m + 1) / 24;
          P.line(U.lerp(x0 + q * a0, x1 + q * a1, u), U.lerp(y0, y1, u) + sag * 4 * u * (1 - u), U.lerp(x0 + q * a0, x1 + q * a1, v), U.lerp(y0, y1, v) + sag * 4 * v * (1 - v), C('#1a0806'), 1, 2);
        }
      }
    }
    // saguaros
    const cactus = (x, yb, h, s) => {
      const w = 16 * s, col = C('#1c0a0a');
      P.wrect(x - w / 2, yb - h, w, h, col); P.disc(x, yb - h, w / 2, col);
      for (const [dir, y0, len] of [[-1, 0.55, 0.3], [1, 0.4, 0.38]]) {
        const ax = x + dir * w * 1.4, ay = yb - h * y0;
        P.wrect(Math.min(x, ax), ay - w / 2, Math.abs(ax - x), w * 0.8, col);
        P.wrect(ax - w * 0.4, ay - h * len, w * 0.8, h * len, col); P.disc(ax, ay - h * len, w * 0.4, col);
      }
    };
    cactus(96, 470, 190, 1.1); cactus(880, 456, 150, 0.9); cactus(1040, 500, 230, 1.2);
    // pebbles and scrub on the ground
    for (let i = 0; i < 260; i++) { const x = W0 + rnd() * WW, y = HZ + 4 + rnd() ** 2 * (H0 + HH - HZ); P.wrect(x, y, 2 + rnd() * 4, 2, C(rnd() < 0.5 ? '#5a2814' : '#200c08')); }
  });
  // a tumbleweed: a ball of twigs (n px), dry browns
  const tumbleweed = (n) => F.cached('tumble' + n, () => {
    const [c, x] = MV.canvas(n, n), rnd = U.rng(n * 7 + 3), cols = ['#3a2410', '#6a4420', '#946436', '#b8884e'];
    for (let k = 0; k < n * 4; k++) {
      const a = rnd() * U.TAU, r = (0.25 + rnd() * 0.7) * (n / 2), len = 2 + rnd() * n * 0.4, b = a + Math.PI / 2 + (rnd() - 0.5) * 1.4;
      const x0 = n / 2 + Math.cos(a) * r, y0 = n / 2 + Math.sin(a) * r;
      for (let q = 0; q < len; q++) {
        const qx = x0 + Math.cos(b) * q, qy = y0 + Math.sin(b) * q;
        if (Math.hypot(qx - n / 2, qy - n / 2) < n / 2 - 0.4) { x.fillStyle = cols[(k + (q >> 1)) % 4]; x.fillRect(qx | 0, qy | 0, 1, 1); }
      }
    }
    return c;
  });
  const VULTURE = [rows('vult0', ['x.......x', '.x.....x.', '..xx.xx..', '....x....'], { x: '#140608' }), rows('vult1', ['.........', 'xxx...xxx', '...xxx...', '....x....'], { x: '#140608' })];
  WORLDS.yellow = {
    wind: 0.55,
    // (its still picture, for a ring rushing past: the sky, the sun, the land)
    lite: () => F.cached('world:yLite', () => { const [c, x] = MV.canvas(PW, PH); x.drawImage(yellowSky(), 0, 0); x.drawImage(yellowSun(), 0, 0); x.drawImage(yellowLand(), 0, 0); return MV.gpuCopy(c); }),
    back(ctx, W) {
      const u = W.u, sink = 46 * U.smooth(u), wt = W.wt;
      lay(ctx, yellowSky(), W, -0.04);
      // the sun's rays, slowly turning round him (a beat of light on the snare); then the sun
      ctx.save(); ctx.beginPath(); ctx.rect(W0, H0, WW, HZ - H0); ctx.clip();
      const sy = SUN[1] + sink, rb = 0.05 + 0.04 * MV.beatPulse(W.t, 'snare', 0.2);
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * U.TAU + wt * 0.025, hw = 0.035 + 0.02 * U.hash(k * 3.1);
        ctx.fillStyle = css(C('#ffcf80'), rb * (0.6 + 0.4 * U.hash(k * 1.7)));
        ctx.beginPath(); ctx.moveTo(SUN[0], sy); ctx.lineTo(SUN[0] + Math.cos(a - hw) * 1500, sy + Math.sin(a - hw) * 1500); ctx.lineTo(SUN[0] + Math.cos(a + hw) * 1500, sy + Math.sin(a + hw) * 1500); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(yellowSun(), W0, H0 + R(sink / HS) * HS, WW, HH);
      ctx.restore();
      lay(ctx, yellowLand(), W, 0.02);
      // vultures circling over the dying day
      [[250, 26, 84, 22, 0.42, 0], [744, 58, 62, 15, -0.55, 2.1], [610, -36, 96, 24, 0.31, 4.2]].forEach(([cx, cy, rx, ry, sp, ph]) => {
        const a = wt * sp + ph, x = cx + Math.cos(a) * rx - W.ox * 0.03, y = cy + Math.sin(a) * ry, f = Math.floor(wt * 5 + ph * 3) % 2;
        F.spr(ctx, VULTURE[f], x, y, { sc: 2, ax: 4.5, ay: 2, flip: Math.sin(a) * sp > 0 });
      });
      // sand on the wind
      for (let i = 0; i < 40; i++) {
        const h1 = U.hash(i * 1.37), h2 = U.hash(i * 2.71 + 5), sp = 150 + 160 * h2, len = 12 + 40 * U.hash(i * 4.1);
        const x = wrap(h1 * WW + sp * W.wd + W.gx, W0 - 60, W0 + WW), y = 40 + U.hash(i * 5.3) * 300 + Math.sin(wt * 2 + i) * 4;
        D.rect(ctx, x, y, len, 2, '#f4cf98', 0.1 + 0.18 * h2);
      }
      // the day going: the whole of it a little darker as the sun sinks
      D.rect(ctx, W0, H0, WW, HH, '#120408', 0.32 * U.smooth(u));
    },
    near(ctx, W) {
      const wt = W.wt;
      // tumbleweeds rolling along his fire's line on the wind, bouncing
      [[30, 15, 170, 0], [22, 11, 230, 520], [36, 18, 140, 940]].forEach(([s, n, v, x0], i) => {
        const x = wrap(x0 + v * W.wd + W.gx * 1.3, -160, 1120), hop = Math.abs(Math.sin((x / (90 + i * 30)) * Math.PI)) * (14 + 6 * i);
        F.spr(ctx, tumbleweed(n), x, 428 - s / 2 - hop, { sc: 2, ax: n / 2, ay: n / 2, rot: x / (s / 2), alpha: W.k });
      });
      // the duel's own: a big one rolling across the stand-off - in Dead Eye it hangs in the air
      if (W.o.duel !== undefined) {
        const tw = W.clock(W.o.duel), x = -150 + (wt - tw) * 300;
        if (wt > tw && x < 1150) F.spr(ctx, tumbleweed(24), x, 404 - Math.abs(Math.sin((x / 170) * Math.PI)) * 34, { sc: 2, ax: 12, ay: 12, rot: x / 24, alpha: W.k });
      }
      for (let i = 0; i < 14; i++) {
        const h2 = U.hash(i * 2.9 + 1), sp = 240 + 200 * h2, x = wrap(U.hash(i * 1.9) * WW + sp * W.wd + W.gx * 1.5, W0 - 80, W0 + WW);
        D.rect(ctx, x, 300 + U.hash(i * 3.3) * 140, 20 + 50 * h2, 2, '#f6d8a8', (0.18 + 0.2 * h2) * W.k);
      }
    },
    front(ctx, W) {
      for (let i = 0; i < 7; i++) {
        const h2 = U.hash(i * 4.9 + 2), sp = 420 + 260 * h2, x = wrap(U.hash(i * 2.3) * WW + sp * W.wd + W.gx * 2, W0 - 120, W0 + WW);
        D.rect(ctx, x, 120 + U.hash(i * 6.1) * 380, 40 + 70 * h2, 2, '#f8e0b8', 0.22 * W.k);
      }
    },
  };

  // ---------------------------------------------------------------- the corridor as a room
  // the barrier corridor's own box section (X half width, Y0 ceiling, Y1 floor), its rings ZR far
  // to near; wall(P, X, z0, z1, fog) / ceil / floor paint each slice
  const TUN = { X: 560, Y0: -430, Y1: 262 };
  const ZR = [1];
  while (ZR[ZR.length - 1] < 26) ZR.push(ZR[ZR.length - 1] * 1.27);
  const tunnel = (P, o) => {
    for (let k = ZR.length - 2; k >= 0; k--) {
      const z0 = ZR[k], z1 = ZR[k + 1], fog = U.clamp((z0 - 1) / 14);
      const q = (X0, Y0, X1, Y1) => [persp(X0, Y0, z0), persp(X1, Y1, z0), persp(X1, Y1, z1), persp(X0, Y0, z1)];
      if (o.ceil) o.ceil(q(-TUN.X, TUN.Y0, TUN.X, TUN.Y0), z0, z1, fog, k);
      if (o.floor) o.floor(q(-TUN.X, TUN.Y1, TUN.X, TUN.Y1), z0, z1, fog, k);
      for (const s of [-1, 1]) if (o.wall) o.wall(s * TUN.X, z0, z1, fog, k, s);
    }
  };
  // a quad on a side wall (X), between heights ya..yb and depths za..zb
  const wallQuad = (X, ya, yb, za, zb) => [persp(X, ya, za), persp(X, ya, zb), persp(X, yb, zb), persp(X, yb, za)];
  // depth at fraction f of a slice, even on the screen (linear in 1/z)
  const zAt = (z0, z1, f) => 1 / (1 / z0 + (1 / z1 - 1 / z0) * f);

  // ================================================================ purple · the archive in the clouds
  // the torn notebook and the cloudy glasses (Gerson's, in Waterfall): someone who, trapped, kept
  // taking notes. The corridor's walls are shelves all the way to the door, where a candle burns;
  // lamps hang from the beams; high windows let shafts of pale light down through a haze - the
  // world as through cloudy glasses: soft, its lights blooming into discs; and torn pages,
  // thousands, turn round the corridor in a slow whirl, drawn on into the dark toward the door
  // (Omega Flowey's notebooks, the words' paper). Those that sink to the bottom catch his sparks.
  const BOOKS = ['#4a2a5e', '#5e3270', '#3a2448', '#6a2a3a', '#2a2a4e', '#4a3a2a', '#2e3e34', '#7a5a3a', '#5a4a7a', '#3e1e2e'];
  const LAMPS = [];
  [1.27, 2.05, 3.3, 5.4].forEach((z) => { for (const s of [-1, 1]) LAMPS.push([...persp(s * 330, TUN.Y0 + 120, z), z]); });
  // the high windows (in the walls' top row, every other slice) and the shafts they let down:
  // [the window's four corners, the shaft's foot on the floor], screen px
  const PWIN = [], PSHAFT = [];
  for (const k of [1, 3, 5]) for (const s of [-1, 1]) {
    const za = zAt(ZR[k], ZR[k + 1], 0.2), zb = zAt(ZR[k], ZR[k + 1], 0.75), X = s * TUN.X;
    PWIN.push([persp(X, -415, za), persp(X, -415, zb), persp(X, -330, zb), persp(X, -330, za), k]);
    // (a wedge from the window's near edge to its far one, down across the corridor to the floor)
    if (k < 5) PSHAFT.push([persp(X, -400, za), persp(X, -345, zb), persp(-s * 120, TUN.Y1, zb * 1.2), persp(-s * 420, TUN.Y1, za * 1.05), k]);
  }
  const purpleBg = painted('pStudy', (P) => {
    const rnd = U.rng(41), warm = C('#6a4054');
    const lit = (c, fog) => mixC(C(c), warm, fog * 0.6);
    P.vgrad(H0, H0 + HH, ['#0a0610', '#120a18', '#0a0610']);
    tunnel(P, {
      ceil: (qd, z0, z1, fog) => {
        P.poly(qd, lit('#140a16', fog));
        const bw = 30 / z0;
        P.poly([qd[0], qd[1], [qd[1][0], qd[1][1] + bw], [qd[0][0], qd[0][1] + bw]], lit('#2e1a12', fog));
      },
      floor: (qd, z0, z1, fog) => {
        P.poly(qd, lit('#1c0e12', fog));
        for (let m = -4; m <= 4; m++) P.line(...persp(m * 120, TUN.Y1, z0), ...persp(m * 120, TUN.Y1, z1), lit('#100608', fog), 1, 2);
      },
      wall: (X, z0, z1, fog) => {
        P.poly(wallQuad(X, TUN.Y0, TUN.Y1, z0, z1), lit('#0c0610', fog));
        const SH = [-430, -322, -216, -112, -10, 90, 186, 262];
        for (let q = 0; q + 1 < SH.length; q++) {
          const bot = SH[q + 1], gap = bot - SH[q] - 10, nb = 7;
          for (let m = 0; m < nb; m++) {
            const za = zAt(z0, z1, m / nb), zb = zAt(z0, z1, (m + 0.78 + 0.18 * rnd()) / nb), bh = gap * (0.55 + 0.4 * rnd());
            const col = lit(BOOKS[(rnd() * BOOKS.length) | 0], fog);
            P.poly(wallQuad(X, bot - bh, bot, za, zb), col);
            if (rnd() < 0.6) { const yb = bot - bh * (0.22 + 0.5 * rnd()); P.poly(wallQuad(X, yb - 6, yb, za, zb), mixC(col, C('#c8a060'), 0.45)); }
          }
          P.poly(wallQuad(X, bot - 10, bot, z0, z1), lit('#3a2216', fog));
        }
      },
    });
    // the high windows: pale, mullioned, their deep frames
    for (const [a, b, c2, d] of PWIN) {
      P.poly([a, b, c2, d], C('#1a1024'));
      const ins = (p, q, f) => [U.lerp(p[0], q[0], f), U.lerp(p[1], q[1], f)];
      const A = ins(a, c2, 0.12), Bq = ins(b, d, 0.12), Cq = ins(c2, a, 0.12), Dq = ins(d, b, 0.12);
      P.poly([A, Bq, Cq, Dq], C('#b4a8dc'));
      P.line(...ins(A, Bq, 0.5), ...ins(Dq, Cq, 0.5), C('#2a1a34'), 1, 2);
      P.line(...ins(A, Dq, 0.5), ...ins(Bq, Cq, 0.5), C('#2a1a34'), 1, 2);
    }
    // lamps hanging from the beams
    for (const [x, y, z] of LAMPS) {
      P.line(x, y - 120 / z, x, y, C('#2a1810'), 1, 2);
      P.wrect(x - 10 / z, y, 20 / z, 26 / z, C('#2e1a10'));
      P.wrect(x - 6 / z, y + 4 / z, 12 / z, 16 / z, C('#ffcf7a'));
    }
  });
  const PAGE = rows('page', ['wwwwww', 'wllllw', 'wwwwww', 'wlllww', 'wwwwww', 'wllllw', 'wwwwww'], { w: '#dcd4e4', l: '#8a7cb8' });
  const PAGE_B = rows('pageB', ['wwwwww', 'wwwwww', 'wwwwww', 'wwwwww', 'wwwwww', 'wwwwww', 'wwwwww'], { w: '#ff8a2a' });
  // a page tumbling: its width turns with flip (a page seen edge-on is a line)
  const drawPage = (ctx, x, y, sc, flip, rot, a, burn = 0) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.translate(R(x), R(y)); ctx.rotate(rot); ctx.scale(sc * Math.max(0.15, Math.abs(flip)), sc);
    ctx.globalAlpha = a; ctx.drawImage(PAGE, -3, -3.5);
    if (burn > 0) { ctx.globalAlpha = a * burn; ctx.drawImage(PAGE_B, -3, -3.5); }
    ctx.restore(); ctx.globalAlpha = 1;
  };
  // (a shaft's light at a point: inside its quad, brightest along its middle)
  const inShaft = (x, y) => {
    let best = 0;
    for (const [a, b, c2, d] of PSHAFT) {
      const top = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], foot = [(c2[0] + d[0]) / 2, (c2[1] + d[1]) / 2];
      const vx = foot[0] - top[0], vy = foot[1] - top[1], L2 = vx * vx + vy * vy, u = ((x - top[0]) * vx + (y - top[1]) * vy) / L2;
      if (u < 0 || u > 1) continue;
      const hw = U.lerp(Math.hypot(a[0] - b[0], a[1] - b[1]), Math.hypot(c2[0] - d[0], c2[1] - d[1]), u) / 2, dd = Math.hypot(x - top[0] - vx * u, y - top[1] - vy * u);
      best = Math.max(best, U.clamp(1 - dd / hw) * (1 - 0.5 * u));
    }
    return best;
  };
  WORLDS.purple = {
    bg: purpleBg,
    back(ctx, W) {
      const wt = W.wt, hush = W.o.hush ? 1 - 0.65 * U.smooth(U.clamp((W.t - W.o.hush) / 0.6)) : 1;
      // the lamps flicker (and the bass sways them a little); the candle at the end
      for (const [x, y, z] of LAMPS) glow(ctx, x, y + 12 / z, 150 / z, C('#ffb060'), hush * (0.13 * (0.75 + 0.25 * U.noise(wt * 9 + x)) + 0.06 * MV.beatPulse(W.t, 'kick', 0.25)));
      glow(ctx, VP[0], VP[1], 170, C('#ffa860'), hush * (0.16 + 0.04 * U.noise(wt * 7)));
      // the shafts from the high windows, breathing on the snare; motes turning in them
      const sn = MV.beatPulse(W.t, 'snare', 0.3);
      ctx.globalCompositeOperation = 'lighter';
      for (const [a, b, c2, d] of PSHAFT) {
        const top = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], foot = [(c2[0] + d[0]) / 2, (c2[1] + d[1]) / 2], k = (0.15 + 0.05 * sn) * (0.6 + 0.4 * hush);
        // (a broad soft wedge, and a brighter core down its middle; the light reaches the floor)
        for (const [w, kk] of [[1, k], [0.4, k * 0.9]]) {
          const g = ctx.createLinearGradient(top[0], top[1], foot[0], foot[1]);
          g.addColorStop(0, css(C('#c8b8ff'), kk)); g.addColorStop(0.6, css(C('#c8b8ff'), kk * 0.55)); g.addColorStop(1, css(C('#c8b8ff'), kk * 0.12));
          const m = (p, q) => [U.lerp(q[0], p[0], w), U.lerp(q[1], p[1], w)];
          const mt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], mf = [(c2[0] + d[0]) / 2, (c2[1] + d[1]) / 2];
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(...m(a, mt)); ctx.lineTo(...m(b, mt)); ctx.lineTo(...m(c2, mf)); ctx.lineTo(...m(d, mf)); ctx.closePath(); ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const [a, b, c2, d] of PWIN) glow(ctx, (a[0] + c2[0]) / 2, (a[1] + c2[1]) / 2, 70, C('#b8aaff'), 0.1 * hush);
      for (let i = 0; i < 40; i++) {
        const sh = PSHAFT[i % PSHAFT.length], u = fract(U.hash(i * 2.9) + wt * (0.02 + 0.02 * U.hash(i * 1.3))), v = U.hash(i * 4.7);
        const top = [U.lerp(sh[0][0], sh[1][0], v), U.lerp(sh[0][1], sh[1][1], v)], foot = [U.lerp(sh[3][0], sh[2][0], v), U.lerp(sh[3][1], sh[2][1], v)];
        px(ctx, U.lerp(top[0], foot[0], u) + Math.sin(wt * 1.3 + i) * 6, U.lerp(top[1], foot[1], u), 2, '#efe8ff', 0.55 * Math.sin(u * Math.PI));
      }
      // the haze: banks of cloud drifting across (the cloudy glasses)
      for (let i = 0; i < 6; i++) {
        const h = U.hash(i * 3.3 + 7), y = -40 + i * 82 + 20 * Math.sin(wt * 0.2 + i), x = wrap(h * WW + wt * (10 + 8 * h) * (i % 2 ? 1 : -1) + W.gx * 0.5, W0 - 300, W0 + WW + 300), rx = 380 + 180 * h;
        ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.16);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, `rgba(150,134,190,${0.17 + 0.06 * h})`); g.addColorStop(1, 'rgba(150,134,190,0)');
        ctx.fillStyle = g; ctx.fillRect(-rx, -rx, 2 * rx, 2 * rx); ctx.restore();
      }
      if (hush < 1) D.rect(ctx, W0, H0, WW, HH, '#06030a', 0.5 * (1 - hush));
      // the whirl of torn pages: round the corridor's axis, on into the dark toward the door (a
      // gust spins it on); those crossing a shaft catch its light
      for (let i = 0; i < 64; i++) {
        const h1 = U.hash(i * 1.91), h2 = U.hash(i * 3.13 + 1), h3 = U.hash(i * 7.7 + 3);
        const u = fract(h1 + wt * (0.045 + 0.03 * h2)), z = 1.05 * Math.pow(14, u), a0 = h3 * U.TAU + u * 5.5 + wt * 0.12 + W.gx * 0.0016;
        const R0 = 360 + 200 * h2, [x, y] = persp(Math.cos(a0) * R0, Math.sin(a0) * R0 * 0.62 - 40, z);
        const al = U.clamp(u * 6) * (1 - U.clamp((u - 0.75) / 0.25)), lt = inShaft(x, y);
        drawPage(ctx, x, y, Math.max(0.6, 3.6 / z), Math.cos(wt * (1.6 + h1) + i), a0 + Math.sin(wt + i) * 0.5, (0.45 + 0.4 * h3) * al);
        if (lt > 0.05) { const s2 = Math.max(0.6, 3.6 / z); D.rect(ctx, x - 3 * s2, y - 3 * s2, 6 * s2, 6 * s2, '#ffffff', 0.5 * lt * al); }
      }
      // the soft discs of light (the haze, the glasses' cloud)
      for (let i = 0; i < 11; i++) {
        const h = U.hash(i * 6.1 + 2), x = W0 + 60 + h * (WW - 120) + Math.sin(wt * 0.15 + i) * 40, y = 30 + U.hash(i * 2.2) * 330 + Math.cos(wt * 0.11 + i) * 20, r = 16 + 22 * U.hash(i * 9.3);
        glow(ctx, x, y, r, C(i % 3 ? '#ffc890' : '#c8b8ff'), 0.07 * hush);
      }
    },
    near(ctx, W) {
      const wt = W.wt;
      for (let i = 0; i < 9; i++) {
        const h1 = U.hash(i * 2.77 + 9), h2 = U.hash(i * 4.31 + 3), fall = 34 + 30 * h2, top = -60, bot = 452;
        const y = wrap(h2 * (bot - top) + fall * wt, top, bot), x = wrap(W0 + h1 * WW + Math.sin(wt * 0.9 + i * 2) * 50 + W.gx * (1 + h2), W0 - 30, W0 + WW + 30);
        // (reaching his fire, it catches, curls and is gone)
        const burn = U.clamp((y - 360) / 50), gone = U.clamp((y - 420) / 30);
        drawPage(ctx, x, y, 3, Math.cos(wt * (1.3 + h1) + i), Math.sin(wt * 0.8 + i) * 0.5, W.k * (1 - gone), burn);
        if (burn > 0.2) for (let e = 0; e < 4; e++) { const u = fract(wt * 1.3 + e * 0.25 + h1); px(ctx, x + Math.sin(wt * 6 + e) * 8, y - 8 - u * 46, 4, u < 0.5 ? '#ffd27a' : '#ff6a1e', W.k * (1 - u) * burn); }
      }
    },
    front(ctx, W) {
      for (let i = 0; i < 2; i++) {
        const h1 = U.hash(i * 7.7 + 2), y = wrap(h1 * 700 + (60 + 20 * i) * W.wt, -100, 600), x = wrap(150 + i * 560 + Math.sin(W.wt * 0.6 + i) * 90 + W.gx * 2, -80, 1040);
        drawPage(ctx, x, y, 6, Math.cos(W.wt * 1.1 + i * 2), Math.sin(W.wt * 0.5 + i) * 0.6, 0.85 * W.k);
      }
    },
  };

  // ================================================================ blue · the wishing room
  // the ballet shoes and the old tutu (Waterfall): the cavern where monsters wish on the crystals
  // in the ceiling as if they were stars. Two waterfalls, echo flowers on the ledges, and a light
  // from above on the music box. The stars answer the music box.
  const ceilY = (x) => 34 + 50 * U.noise(x * 0.011 + 3) + 20 * U.noise(x * 0.047) + (U.hash(Math.floor(x / 6) * 0.37) > 0.86 ? 52 * U.hash(Math.floor(x / 6)) : 0);
  // the crystals: thick in the ceiling's rock, thinning down the walls
  const STARS = (() => {
    const rnd = U.rng(77), out = [];
    for (let i = 0; i < 420; i++) {
      const x = W0 + rnd() * WW, deep = rnd() < 0.8, y = deep ? H0 + rnd() * (ceilY(x) - H0 + 30) : H0 + rnd() ** 1.3 * 420;
      out.push([x, y, rnd() < 0.07 ? 2 : 1, rnd() * 6.28, 0.5 + rnd() * 2.4]);
    }
    return out;
  })();
  const FALLS = [[30, 120], [836, 930]];
  const blueBg = painted('bCave', (P) => {
    const rnd = U.rng(55);
    P.vgrad(H0, H0 + HH, ['#02040c', '#040a1a', '#08142e', '#0c1c3e', '#12264c', '#0c1a38', '#060e22']);
    // the far cavern: arches of rock stepping down toward the door, rims catching the crystals' light
    for (let k = 9; k >= 1; k--) {
      const z = 1 + k * 0.85, col = mixC(C('#050a18'), C('#1c2c5c'), k / 10), rim = mixC(C('#22346a'), C('#3a5296'), k / 10);
      for (const s of [-1, 1]) {
        const pts = [persp(s * 600, -320, z), persp(s * 600, 262, z), persp(s * (300 + 40 * U.hash(k * 3 + s)), 262, z), persp(s * (330 + 30 * U.hash(k)), 20, z), persp(s * (420 + 40 * U.hash(k * 7)), -200, z), persp(s * 520, -320, z)];
        P.poly(pts, col);
        for (let m = 2; m < 5; m++) P.line(...pts[m], ...pts[m + 1], rim, 1, 2);
      }
    }
    // the ceiling: rock hanging down, ragged with stalactites, its lip catching the light
    for (let x = W0; x < W0 + WW; x += 6) { const y = ceilY(x); P.wrect(x, H0, 6, y - H0, C('#03050c')); P.wrect(x, y - 4, 6, 4, C('#1e2c5a')); }
    // the walls at both sides; the waterfalls pouring down them, white at the lip, into pools
    P.poly([[W0, H0], [26, H0], [40, 140], [20, 300], [30, 440], [W0, 440]], C('#03050c'));
    P.poly([[W0 + WW, H0], [934, H0], [924, 150], [944, 300], [936, 440], [W0 + WW, 440]], C('#03050c'));
    for (const [a, b] of FALLS) {
      for (let x = a; x < b; x += 2) { const e = Math.min(x - a, b - x) / 12, c = rnd() < 0.5 ? '#1e4c96' : rnd() < 0.5 ? '#2a5eae' : '#163a7a'; P.wrect(x, 26 + 8 * U.hash(x), 2, 330, C(c), U.clamp(e)); }
      P.wrect(a, 22, b - a, 8, C('#bfe2ff'));
      P.wrect(a - 34, 348, b - a + 68, 16, C('#163a7a')); P.wrect(a - 34, 348, b - a + 68, 2, C('#7ab8f0'));
    }
    // seagrass and echo flowers at the cavern's floor
    for (let i = 0; i < 70; i++) { const x = rnd() < 0.5 ? W0 + rnd() * 330 : 760 + rnd() * 400, y = 350 + rnd() * 90, h = 30 + rnd() * 60; P.line(x, y, x + (rnd() - 0.5) * 20, y - h, C(rnd() < 0.5 ? '#0c2a3a' : '#123a4a'), 1, 4); }
    const flower = (x, y, s) => {
      P.line(x, y, x + 3 * s, y - 30 * s, C('#1a4a5a'), 1, 2);
      for (let k = 0; k < 6; k++) { const a = (k / 6) * U.TAU; P.disc(x + 3 * s + Math.cos(a) * 6 * s, y - 32 * s + Math.sin(a) * 4 * s, 3.4 * s, C('#3ad0f0')); }
      P.disc(x + 3 * s, y - 32 * s, 2.6 * s, C('#e0ffff'));
    };
    for (const [x, y, s] of [[-150, 404, 1.6], [-70, 384, 1.3], [96, 366, 1], [150, 380, 1.2], [196, 364, 0.8], [780, 368, 1], [826, 352, 0.8], [990, 390, 1.4], [1090, 410, 1.7]]) flower(x, y, s);
    // glowing mushrooms on the ledges
    for (let i = 0; i < 22; i++) { const x = rnd() < 0.5 ? -190 + rnd() * 340 : 760 + rnd() * 390, y = 356 + rnd() * 70; P.wrect(x, y - 6, 4, 6, C('#2a4a6a')); P.wrect(x - 4, y - 10, 12, 4, C('#5ae0ff')); P.wrect(x - 2, y - 12, 8, 2, C('#c8f8ff')); }
  });
  WORLDS.blue = {
    bg: blueBg,
    back(ctx, W) {
      const wt = W.wt, kick = MV.beatPulse(W.t, 'snare', 0.25), tone = MV.beatPulse(W.t, 'tone', 0.3);
      // the crystal stars: each its own slow twinkle; the music box's notes make them flare
      for (const [x, y, s, ph, f] of STARS) {
        const b = 0.3 + 0.7 * Math.max(0, Math.sin(wt * f + ph)) ** 6 + 0.5 * tone * U.hash(ph * 9);
        const c = ph < 2 ? '#fff6c8' : ph < 4 ? '#bfe8ff' : '#7ad8ff';
        px(ctx, x, y, 2 * s, c, U.clamp(b));
        if (s > 1 && b > 0.6) { px(ctx, x - 4, y + 1, 2, c, b - 0.4); px(ctx, x + 6, y + 1, 2, c, b - 0.4); px(ctx, x + 1, y - 4, 2, c, b - 0.4); px(ctx, x + 1, y + 6, 2, c, b - 0.4); }
      }
      // the waterfalls: streaks pouring down, mist at the pools
      for (const [a, b] of FALLS) for (let x = a; x < b; x += 6) {
        const h = U.hash(x * 0.71), sp = 240 + 90 * h;
        for (let m = 0; m < 4; m++) { const y = wrap(h * 330 + m * 82 + sp * wt, 20, 350); D.rect(ctx, x, y, 2, 14 + 10 * h, '#9ad6ff', 0.35 + 0.2 * h); }
      }
      for (const [a, b] of FALLS) for (let i = 0; i < 10; i++) { const u = fract(wt * 0.8 + i * 0.1), x = a + U.hash(i * 3.1 + a) * (b - a); px(ctx, x + Math.sin(wt * 3 + i) * 8, 344 - u * 26, 2, '#cfe8ff', 0.5 * (1 - u)); }
      // the light from above on the music box (it breathes on the snare)
      beam(ctx, [[436, H0], [524, H0], [612, 440], [348, 440]], [480, H0], [480, 440], C('#a8c8ff'), 0.1 + 0.05 * kick);
      // motes of light rising through the cavern
      for (let i = 0; i < 26; i++) { const h1 = U.hash(i * 5.3), u = fract(wt * (0.05 + 0.04 * h1) + U.hash(i * 2.2)), x = W0 + h1 * WW + Math.sin(wt * 0.6 + i) * 16; px(ctx, x, 470 - u * 520, 2, '#7ae8ff', 0.6 * Math.sin(u * Math.PI)); }
    },
    near(ctx, W) {
      for (let i = 0; i < 10; i++) { const h1 = U.hash(i * 7.3 + 1), u = fract(W.wt * (0.07 + 0.05 * h1) + h1), x = W0 + 120 + h1 * 1100 + Math.sin(W.wt * 0.8 + i) * 20; px(ctx, x, 440 - u * 420, 4, '#9af0ff', 0.7 * Math.sin(u * Math.PI) * W.k); }
    },
  };

  // ================================================================ orange · Snowdin, a blizzard
  // the tough glove and the manly bandanna (Snowdin): night in the forest, pines marching along
  // the path to the door, the town's lamp post, the snow driven sideways. Every punch is a gust;
  // every shock ring blows the snow away from it.
  const pine = (P, x, yb, h, w, col, snow) => {
    P.wrect(x - w * 0.06, yb - h * 0.16, w * 0.12, h * 0.16, mixC(col, C('#000000'), 0.3));
    for (let k = 0; k < 5; k++) {
      const yb2 = yb - h * (0.12 + k * 0.16), hw = (w / 2) * (1 - k * 0.17), yt = yb2 - h * 0.3;
      P.poly([[x - hw, yb2], [x + hw, yb2], [x, yt]], col);
      P.line(x - hw, yb2, x + hw, yb2, snow, 1, Math.max(2, h / 90));
      P.line(x - hw * 0.5, yb2 - h * 0.15, x, yt + h * 0.02, snow, 0.5, 2);
    }
  };
  const orangeBg = painted('oSnow', (P) => {
    const rnd = U.rng(91);
    P.vgrad(H0, 346, ['#0a101c', '#101828', '#182236', '#222e48', '#2e3c5a']);
    P.vgrad(345, H0 + HH, ['#2e3a52', '#262f44', '#1e2638', '#181e2e']);
    // the far forest along the horizon, in the snow's haze
    for (let x = W0; x < W0 + WW; x += 10) { const h = 14 + 22 * U.hash(x * 0.13); P.poly([[x - 9, 346], [x + 9, 346], [x, 346 - h]], C('#1e283c')); }
    // pines along the path, far to near (the near ones black against the sky, the far ones lost in
    // the snow's haze)
    const Z = [9, 7.2, 5.8, 4.6, 3.7, 3, 2.4, 1.95, 1.58, 1.28, 1.04];
    for (const z of Z) for (const s of [-1, 1]) for (const X of [470 + 110 * U.hash(z * 7 + s), 760 + 160 * U.hash(z * 3 - s)]) {
      const [x, yb] = persp(s * X, 250, z), fog = U.clamp((z - 1) / 8);
      pine(P, x, yb, 820 / z, 330 / z, mixC(C('#03050a'), C('#33405c'), fog), mixC(C('#b8c8e2'), C('#5a6884'), fog));
    }
    // the path running to the door, snow banks
    P.poly([persp(-170, 262, 1), persp(170, 262, 1), persp(10, 262, 30), persp(-10, 262, 30)], C('#323e56'));
    // the town's lamp post
    P.wrect(118, 228, 8, 250, C('#141820')); P.wrect(106, 214, 32, 18, C('#141820')); P.wrect(110, 218, 24, 10, C('#ffd88a')); P.wrect(102, 210, 40, 4, C('#2a3040'));
    for (let i = 0; i < 90; i++) P.wrect(W0 + rnd() * WW, 350 + rnd() ** 2 * 300, 2 + rnd() * 6, 2, C('#5a6884'));
  });
  WORLDS.orange = {
    bg: orangeBg,
    wind: 0.8,
    back(ctx, W) {
      const wt = W.wt;
      // the lamp's warm light, the arena light from above on the ring
      glow(ctx, 122, 224, 110, C('#ffc870'), 0.16);
      beam(ctx, [[110, 226], [134, 226], [196, 470], [48, 470]], [122, 226], [122, 470], C('#ffd890'), 0.08);
      beam(ctx, [[450, H0], [510, H0], [600, 430], [360, 430]], [480, H0], [480, 430], C('#ffe0b8'), 0.07 + 0.04 * MV.beatPulse(W.t, 'kick', 0.2));
      // snow: far flakes, slow, driven by the wind
      for (let i = 0; i < 90; i++) {
        const h1 = U.hash(i * 1.17), h2 = U.hash(i * 2.39 + 4), fall = 36 + 34 * h2;
        const y = wrap(h2 * HH + fall * wt, H0, H0 + HH), x = wrap(W0 + h1 * WW + W.wd * 60 * (0.6 + h2) + W.gx * 0.6 + Math.sin(wt * 1.4 + i) * 8, W0, W0 + WW);
        px(ctx, x, y, 2, '#dfe8f6', 0.5 + 0.4 * h1);
      }
    },
    near(ctx, W) {
      const wt = W.wt, rings = W.o.rings || [];
      for (let i = 0; i < 60; i++) {
        const h1 = U.hash(i * 3.71 + 2), h2 = U.hash(i * 1.93 + 7), fall = 70 + 60 * h2;
        let y = wrap(h2 * HH + fall * wt, H0, H0 + HH), x = wrap(W0 + h1 * WW + W.wd * 120 * (0.7 + h2) + W.gx * 1.2 + Math.sin(wt * 2 + i) * 10, W0, W0 + WW);
        // (a shock ring blows the snow away from it as it passes)
        for (const [t0, t1, cx, cy, r0, r1] of rings) {
          if (W.t < t0 || W.t > t1 + 0.4) continue;
          const rr = U.lerp(r0, r1, U.clamp((W.t - t0) / (t1 - t0))), dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, push = 46 * Math.exp(-(((d - rr) / 34) ** 2)) * (1 - U.clamp((W.t - t1) / 0.4)) + (d < rr ? 30 : 0);
          x += (dx / d) * push; y += (dy / d) * push;
        }
        px(ctx, x, y, 4, '#eef4ff', (0.6 + 0.35 * h1) * W.k);
      }
    },
    front(ctx, W) {
      for (let i = 0; i < 12; i++) {
        const h1 = U.hash(i * 9.1 + 3), h2 = U.hash(i * 5.7 + 1), y = wrap(h2 * 700 + (150 + 80 * h1) * W.wt, -60, 600), x = wrap(h1 * 1100 + W.wd * 260 + W.gx * 2.2, -60, 1020);
        D.rect(ctx, x, y, 6, 6, '#f4f8ff', 0.75 * W.k);
        if (W.gv > 60) D.rect(ctx, x - W.gv * 0.12, y, W.gv * 0.12, 2, '#f4f8ff', 0.4 * W.k);
      }
    },
  };

  // ================================================================ aqua · the Ruins in autumn
  // the toy knife and the faded ribbon (the Ruins): purple brick, the red tree, a great clock on
  // the wall, the light from the hole above where the humans fell. The leaves fall only while the
  // soul moves - its own clock (SUPERHOT) - and when the clock stops they hang in the air.
  const CLOCK = [872, 142, 76];
  const aquaBg = painted('aRuins', (P) => {
    const rnd = U.rng(23);
    P.vgrad(H0, H0 + HH, ['#0a0612', '#140a20', '#0e0818']);
    tunnel(P, {
      ceil: (qd, z0, z1, fog) => P.poly(qd, mixC(C('#1a0e26'), C('#3a2650'), fog * 0.5)),
      floor: (qd, z0, z1, fog) => P.poly(qd, mixC(C('#22122e'), C('#3e2450'), fog * 0.5)),
      wall: (X, z0, z1, fog) => {
        const mort = mixC(C('#1e1028'), C('#2e1e3e'), fog * 0.6);
        P.poly(wallQuad(X, TUN.Y0, TUN.Y1, z0, z1), mort);
        for (let y = TUN.Y0, r = 0; y < TUN.Y1; y += 48, r++) for (let m = -0.5 * (r % 2); m < 3; m++) {
          const za = zAt(z0, z1, U.clamp(m / 3)), zb = zAt(z0, z1, U.clamp((m + 0.92) / 3));
          if (zb <= za) continue;
          const tone = mixC(C(rnd() < 0.5 ? '#3c2256' : '#482a64'), C('#6a4a86'), fog * 0.5 + rnd() * 0.08);
          P.poly(wallQuad(X, y + 4, Math.min(TUN.Y1, y + 46), za, zb), tone);
        }
        // ivy hanging down the walls
        if (rnd() < 0.5) { const z = zAt(z0, z1, rnd()); for (let y = TUN.Y0; y < TUN.Y0 + 140 + 200 * rnd(); y += 16) P.poly(wallQuad(X, y, y + 12, z, z * 1.03), C('#1e3a2a')); }
      },
    });
    // the hole above, its light
    P.poly([[400, H0], [560, H0], [548, -60], [520, -40], [440, -42], [410, -64]], C('#e8dcb8'));
    // the great clock on the right wall
    const [cx, cy, cr] = CLOCK;
    P.disc(cx, cy, cr + 10, C('#2a1a36')); P.disc(cx, cy, cr + 4, C('#7a6a8a')); P.disc(cx, cy, cr, C('#d8ccb4'));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * U.TAU, r0 = i % 3 ? cr - 12 : cr - 20; P.line(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * (cr - 4), cy + Math.sin(a) * (cr - 4), C('#3a2a3a'), 1, i % 3 ? 2 : 4); }
    // the red tree: its trunk on the left, branches reaching over, its crown of red leaves
    const trunk = C('#1a0c10');
    P.poly([[10, 640], [70, 640], [84, 300], [104, 160], [80, 160], [40, 300]], trunk);
    for (const [x0, y0, x1, y1, w] of [[90, 200, 240, 40, 14], [96, 230, -80, 60, 14], [100, 170, 150, -60, 10], [160, 110, 330, 80, 8], [60, 120, -40, -80, 8]]) P.line(x0, y0, x1, y1, trunk, 1, w);
    const LEAF = ['#8a1a20', '#b42a26', '#d23e2a', '#e8602e'];
    for (let i = 0; i < 900; i++) {
      const a = rnd() * U.TAU, r = rnd() ** 0.7, cx2 = [-60, 120, 280][i % 3], cy2 = [-40, -10, 60][i % 3], rx = [170, 160, 90][i % 3], ry = [110, 90, 50][i % 3];
      P.wrect(cx2 + Math.cos(a) * rx * r, cy2 + Math.sin(a) * ry * r, 4, 4, C(LEAF[Math.min(3, Math.floor((1 - r) * 3 + rnd() * 1.5))]));
    }
  });
  const LEAVES = ['#a01c22', '#d23a2a', '#e8602e', '#f08a3a'];
  const leaf = (ctx, x, y, s, flip, col, a) => { ctx.globalAlpha = a; ctx.fillStyle = col; const w = Math.max(1, R(3 * s * Math.abs(flip))) * 2; ctx.fillRect(R(x / 2) * 2 - w / 2, R(y / 2) * 2, w, 2 * s); ctx.globalAlpha = 1; };
  WORLDS.aqua = {
    bg: aquaBg,
    back(ctx, W) {
      const wt = W.wt;
      // the light from the hole above, fanning down behind him
      for (const [dx, a] of [[-150, 0.05], [0, 0.07], [150, 0.05]]) beam(ctx, [[460 + dx * 0.2, H0], [500 + dx * 0.2, H0], [540 + dx * 1.4, 440], [420 + dx * 1.4, 440]], [480, H0], [480 + dx, 440], C('#e8f4ff'), a);
      // the clock's hands: they move with the leaves' time
      const [cx, cy, cr] = CLOCK, sa = Math.floor(wt * 2) * (U.TAU / 60) - Math.PI / 2, ma = wt * 0.05 - Math.PI / 2;
      ctx.strokeStyle = '#2a1a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * cr * 0.62, cy + Math.sin(ma) * cr * 0.62); ctx.stroke();
      ctx.strokeStyle = '#a8202a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sa) * cr * 0.84, cy + Math.sin(sa) * cr * 0.84); ctx.stroke();
      // the leaves
      for (let i = 0; i < 46; i++) {
        const h1 = U.hash(i * 2.13), h2 = U.hash(i * 3.71 + 2), fall = 26 + 26 * h2;
        const y = wrap(h2 * HH + fall * wt, H0, H0 + HH), x = wrap(W0 + h1 * WW + Math.sin(wt * 1.1 + i) * 26 + W.gx, W0, W0 + WW);
        leaf(ctx, x, y, 1, Math.cos(wt * (2 + h1) + i), LEAVES[i % 4], 0.85);
      }
    },
    near(ctx, W) {
      for (let i = 0; i < 16; i++) {
        const h1 = U.hash(i * 4.13 + 5), h2 = U.hash(i * 2.53 + 8), fall = 50 + 30 * h2;
        const y = wrap(h2 * 600 + fall * W.wt, -60, 460), x = wrap(W0 + h1 * WW + Math.sin(W.wt * 1.3 + i) * 40, W0, W0 + WW);
        leaf(ctx, x, y, 2, Math.cos(W.wt * (2.4 + h1) + i), LEAVES[(i + 1) % 4], 0.95 * W.k);
      }
    },
    front(ctx, W) {
      for (let i = 0; i < 5; i++) {
        const h1 = U.hash(i * 6.7 + 1), h2 = U.hash(i * 8.9 + 4), y = wrap(h2 * 700 + (80 + 30 * h1) * W.wt, -60, 600), x = wrap(h1 * 1040 + Math.sin(W.wt * 0.9 + i) * 70, -40, 1000);
        leaf(ctx, x, y, 4, Math.cos(W.wt * (1.8 + h2) + i), LEAVES[i % 4], 0.9 * W.k);
      }
    },
  };

  // ================================================================ green · a kitchen's hearth
  // the burnt pan and the stained apron (Hotland): someone who cooked for others. Warm brick, the
  // hearth's arch round the door (his fire burns in it), a rack of pans, shelves, steam.
  const greenBg = painted('gKitchen', (P) => {
    const rnd = U.rng(61);
    P.vgrad(H0, H0 + HH, ['#1a0a06', '#2a120a', '#3a1a0e', '#2a1208']);
    for (let y = H0, r = 0; y < H0 + HH; y += 28, r++) for (let x = W0 - (r % 2) * 30; x < W0 + WW; x += 60) {
      const c = mixC(C(rnd() < 0.5 ? '#5a2a18' : '#6a3420'), C('#2a1208'), U.clamp(Math.abs(x - 480) / 900 + rnd() * 0.15));
      P.wrect(x + 2, y + 2, 56, 24, c);
    }
    // the hearth's arch round the door, the dark inside
    P.disc(480, 300, 230, C('#3a2a24')); P.disc(480, 300, 214, C('#1a0c08')); P.wrect(250, 300, 460, 400, C('#3a2a24')); P.wrect(266, 300, 428, 400, C('#120604'));
    for (let a = 0; a < 15; a++) { const t = Math.PI + (a / 14) * Math.PI; P.line(480 + Math.cos(t) * 214, 300 + Math.sin(t) * 214, 480 + Math.cos(t) * 230, 300 + Math.sin(t) * 230, C('#241812'), 1, 3); }
    // the rack of pans along the top
    P.wrect(W0, 22, WW, 8, C('#2a1a12'));
    // (each pan hangs by its handle: the sprite turned upright, the pan below)
    const pan = MV.propCanvas('pan', '#24140e'), pd = pan.getContext('2d').getImageData(0, 0, pan.width, pan.height).data;
    for (let x = -160; x < 1160; x += 120) {
      const s = 4 + 2 * U.hash(x);
      P.line(x, 26, x, 40, C('#2a1a12'), 1, 2);
      for (let j = 0; j < pan.height; j++) for (let i = 0; i < pan.width; i++) if (pd[(j * pan.width + i) * 4 + 3]) P.wrect(x - (pan.height * s) / 2 + j * s, 40 + (pan.width - 1 - i) * s * 0.6, s, s * 0.6, C('#24140e'));
    }
    // shelves with jars and plates at both sides
    for (const sx of [-170, 790]) for (const y of [140, 230]) {
      P.wrect(sx, y, 300, 8, C('#2e1a10'));
      for (let k = 0; k < 6; k++) { const x = sx + 16 + k * 46 + rnd() * 10, h = 20 + rnd() * 26; P.wrect(x, y - h, 26, h, C(rnd() < 0.5 ? '#4a3a2a' : '#5a2e1e')); P.wrect(x + 4, y - h + 4, 18, 4, C('#8a6a4a')); }
    }
  });
  WORLDS.green = {
    bg: greenBg,
    back(ctx, W) {
      glow(ctx, 480, 440, 300, C('#ff8a3a'), 0.12 + 0.06 * MV.beatPulse(W.t, 'kick', 0.2));
      for (let i = 0; i < 18; i++) { const h1 = U.hash(i * 3.3), u = fract(W.wt * (0.18 + 0.1 * h1) + h1), x = W0 + 100 + h1 * (WW - 200) + Math.sin(W.wt + i) * 20 * u; D.rect(ctx, x, 300 - u * 360, 10 + 18 * u, 8 + 10 * u, '#f0e8e0', 0.12 * Math.sin(u * Math.PI)); }
    },
  };

  // a world painted alone, for review (?world=key&t=...)
  if (MV.Q.get('world')) MV.sections.push(() => H.world(MV.Q.get('world'), 0, 1e4, { wipe: 0, wind: false }));
})();
