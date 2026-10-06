// 2D overlay (960x540 canvas, upscaled 2x with nearest, composited after the tone curve):
// dialogue boxes, typed text, speech bubbles. The original 640x480 layout sits 1:1 at
// +160,+30. Text uses SimSun 16 px bitmaps at 2x (tools/make_font.py).
(function () {
  const MV = window.MV, U = MV.U, G = window.MV_GLYPHS;
  const D = (MV.D = {});
  MV.OW = 960; MV.OH = 540; MV.OX = 160; MV.OY = 30;
  const R = Math.round;
  const WHITE = MV.COL.white;

  const glyphCache = {};
  function glyph(ch, color) {
    const key = ch + color;
    if (glyphCache[key]) return glyphCache[key];
    const g = G[ch] || G['?'];
    const w = g[0], rows = g[1];
    const [c, x] = MV.canvas(w, 16);
    x.fillStyle = color;
    for (let j = 0; j < 16; j++) for (let i = 0; i < w; i++) if ((rows[j] >> (w - 1 - i)) & 1) x.fillRect(i, j, 1, 1);
    return (glyphCache[key] = c);
  }
  D.textWidth = (s, o = {}) => {
    let w = 0;
    for (const ch of s) w += ((G[ch] || G['?'])[0] + (o.spacing || 0)) * (o.scale || 2);
    return w;
  };
  // o: color, scale (2), align, alpha, shake, seed, spacing
  D.text = (ctx, s, x, y, o = {}) => {
    const sc = o.scale || 2, color = o.color || WHITE;
    const w = D.textWidth(s, o);
    if (o.align === 'center') x -= w / 2;
    else if (o.align === 'right') x -= w;
    let cx = R(x), i = 0;
    y = R(y);
    ctx.globalAlpha = o.alpha ?? 1;
    for (const ch of s) {
      const g = glyph(ch, color);
      let jx = 0, jy = 0;
      if (o.shake) { jx = R(U.noise((o.seed || 0) + i * 3.1) * o.shake); jy = R(U.noise((o.seed || 0) + i * 5.7 + 9) * o.shake); }
      ctx.drawImage(g, cx + jx, y + jy, g.width * sc, 16 * sc);
      cx += (g.width + (o.spacing || 0)) * sc;
      i++;
    }
    ctx.globalAlpha = 1;
    return w;
  };
  // HUD / damage bitmap fonts
  const bitmapText = (font) => (ctx, str, x, y, o = {}) => {
    const f = MV.FONTS[font], sc = o.scale || (font === 'battle' ? 2 : 1);
    const adv = (f.cw + (o.spacing || 0)) * sc, w = str.length * adv;
    if (o.align === 'center') x -= w / 2;
    else if (o.align === 'right') x -= w;
    ctx.globalAlpha = o.alpha ?? 1;
    [...str].forEach((ch, i) => { if (ch !== ' ') ctx.drawImage(MV.fontGlyph(font, ch, o.color || WHITE), R(x + i * adv), R(y), f.cw * sc, f.ch * sc); });
    ctx.globalAlpha = 1;
    return w;
  };
  D.hud = bitmapText('battle');
  D.dmg = bitmapText('damage');

  D.rect = (ctx, x, y, w, h, color, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(R(x), R(y), R(w), R(h)); ctx.globalAlpha = 1; };
  // the Undertale text box: black fill, off-white frame
  D.box = (ctx, x, y, w, h, o = {}) => {
    const th = o.th ?? 5, a = o.alpha ?? 1;
    D.rect(ctx, x, y, w, h, o.frame || WHITE, a);
    D.rect(ctx, x + th, y + th, w - 2 * th, h - 2 * th, '#000000', a);
  };
  // speech bubble: off-white rounded box, black text, tail toward (tx, ty)
  D.bubble = (ctx, x, y, w, h, lines, o = {}) => {
    const a = o.alpha ?? 1, sc = o.scale || 1, pop = o.pop ?? 1;
    const cx = x + w / 2, cy = y + h / 2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(R(cx), R(cy)); ctx.scale(pop, pop); ctx.translate(-R(cx), -R(cy));
    const r = 6;
    ctx.fillStyle = WHITE;
    ctx.fillRect(R(x + r), R(y), R(w - 2 * r), R(h)); ctx.fillRect(R(x), R(y + r), R(w), R(h - 2 * r));
    ctx.fillRect(R(x + 2), R(y + 2), R(w - 4), R(h - 4));
    if (o.tx !== undefined) {
      const side = o.tx < x ? -1 : 1, bx = side < 0 ? x : x + w, by = U.clamp(o.ty, y + 10, y + h - 10);
      for (let i = 0; i < 12; i++) { const k = i / 12; ctx.fillRect(R(bx + side * i * 1.2 - (side < 0 ? 2 : 0)), R(by - 6 * (1 - k)), 2, R(12 * (1 - k))); }
    }
    lines.forEach((ln, i) => D.text(ctx, ln, x + 10 * sc, y + 8 * sc + i * 18 * sc, { scale: sc, color: '#000000', alpha: a }));
    ctx.restore();
  };
})();
