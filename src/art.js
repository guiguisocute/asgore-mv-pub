// Sprites for the performance (acts four and five), built once as canvases: MV.ART.get(name).
// Two kinds:
//  - the game's own, prepared: close-ups enlarged with Scale2x (EPX) so the pixel art keeps
//    clean diagonals (his gripping fist, his faces), his faces lined up on the battle puppet's
//    head (MV.faceAt), his eyes flashing with the sheet's own eye-flash frames, the sheet's own
//    "!" warning, his name and HP bar as the game lists a monster;
//  - drawn here in the game's style: an open paw, the memory pictures (told like the game's own
//    "long ago" intro: sepia paintings in the five tones of its story panels; the game's own
//    painting of the children is shown between them), the souls' extra things (cowboy hat,
//    faded ribbon, clock face, Dead Eye marks), friendliness pellets.
// Borrowed moments never show another game's screen: they are told in UT's own vocabulary.
// tools/artsheet.cjs renders every sprite in MV.ART.list for review.
(function () {
  const MV = window.MV, U = MV.U, D = MV.D;
  const R = Math.round;
  const ART = (MV.ART = { make: {}, cache: {} });
  ART.get = (name) => ART.cache[name] || (ART.cache[name] = ART.make[name]());
  const def = (name, fn) => (ART.make[name] = fn);
  const cv = (w, h) => MV.canvas(w, h);
  const rgb = (hex) => { const v = parseInt(hex.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };

  // ---------------------------------------------------------------- helpers
  // rows of characters -> canvas; pal: char -> hex ('.' = empty)
  const art = (rows, pal) => {
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length, [c, x] = cv(w, h);
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
    return c;
  };
  // Scale2x / EPX: a 2x enlargement that keeps pixel-art edges clean (no blur, smoothed steps)
  const scale2x = (ART.scale2x = (src) => {
    const w = src.width, h = src.height, [, sx] = cv(w, h);
    sx.drawImage(src, 0, 0);
    const S = sx.getImageData(0, 0, w, h).data, [c, x] = cv(w * 2, h * 2), O = x.createImageData(w * 2, h * 2), d = O.data;
    const px = (i, j) => { i = U.clamp(i, 0, w - 1); j = U.clamp(j, 0, h - 1); const p = (j * w + i) * 4; return (S[p] << 24) | (S[p + 1] << 16) | (S[p + 2] << 8) | S[p + 3]; };
    const put = (i, j, v) => { const p = (j * w * 2 + i) * 4; d[p] = (v >>> 24) & 255; d[p + 1] = (v >>> 16) & 255; d[p + 2] = (v >>> 8) & 255; d[p + 3] = v & 255; };
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const P = px(i, j), A = px(i, j - 1), B = px(i + 1, j), C = px(i - 1, j), Dd = px(i, j + 1);
      let p1 = P, p2 = P, p3 = P, p4 = P;
      if (C === A && C !== Dd && A !== B) p1 = A;
      if (A === B && A !== C && B !== Dd) p2 = B;
      if (Dd === C && Dd !== B && C !== A) p3 = C;
      if (B === Dd && B !== A && Dd !== C) p4 = Dd;
      put(i * 2, j * 2, p1); put(i * 2 + 1, j * 2, p2); put(i * 2, j * 2 + 1, p3); put(i * 2 + 1, j * 2 + 1, p4);
    }
    x.putImageData(O, 0, 0);
    return c;
  });
  const crop = (src, x0, y0, w, h) => { const [c, x] = cv(w, h); x.drawImage(src, -x0, -y0); return c; };
  // enclosed transparent holes filled (the line art's insides)
  const filled = (src, fill = '#000000') => MV.F ? (fill === '#000000' ? MV.F.filled(src) : src) : src;
  // a shape drawn as a mask -> the game's line art: a 1 px outline round it, a flat fill inside;
  // detail(x) strokes extra lines on the inside
  const lineArt = (w, h, shape, o = {}) => {
    const [mc, mx] = cv(w, h);
    mx.fillStyle = '#fff'; mx.strokeStyle = '#fff';
    shape(mx);
    const M = mx.getImageData(0, 0, w, h).data, inside = (i, j) => i >= 0 && j >= 0 && i < w && j < h && M[(j * w + i) * 4 + 3] > 127;
    let Dl = null;
    if (o.detail) { const [dc, dx] = cv(w, h); dx.strokeStyle = '#fff'; dx.fillStyle = '#fff'; dx.lineWidth = 1; o.detail(dx); Dl = dx.getImageData(0, 0, w, h).data; }
    const [c, x] = cv(w, h), I = x.createImageData(w, h), d = I.data, L = rgb(o.line || '#ffffff'), Fc = rgb(o.fill || '#000000');
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (!inside(i, j)) continue;
      const edge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1);
      const line = edge || (Dl && Dl[(j * w + i) * 4 + 3] > 127);
      const col = line ? L : Fc, p = (j * w + i) * 4;
      d[p] = col[0]; d[p + 1] = col[1]; d[p + 2] = col[2]; d[p + 3] = 255;
    }
    x.putImageData(I, 0, 0);
    return c;
  };
  // the game's intro look: every colour mapped by its brightness onto the five sepia tones of the
  // game's own story panels (sampled from Asriel's flashback paintings, src/assets_story.js)
  const SEPIA = ['#2c1708', '#4a290b', '#643214', '#854a1d', '#c08226'].map(rgb);
  const sepia = (c) => {
    const x = c.getContext('2d'), I = x.getImageData(0, 0, c.width, c.height), d = I.data;
    for (let p = 0; p < d.length; p += 4) {
      if (!d[p + 3]) continue;
      const l = (0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2]) / 255, s = SEPIA[Math.min(SEPIA.length - 1, Math.floor(l * SEPIA.length))];
      d[p] = s[0]; d[p + 1] = s[1]; d[p + 2] = s[2]; d[p + 3] = 255;
    }
    x.putImageData(I, 0, 0);
    return c;
  };
  // a sprite standing with its feet (bottom-centre) at (x, y)
  const stand = (x, img, px, py, k = 1, flip = false) => {
    x.save(); x.translate(R(px), R(py)); if (flip) x.scale(-1, 1);
    x.drawImage(img, -R(img.width * k / 2), -img.height * k, img.width * k, img.height * k); x.restore();
  };
  const flower = () => MV.propCanvas('flower');
  ART.list = [];
  const show = (...names) => ART.list.push(...names);

  // ---------------------------------------------------------------- his close-ups (the game's sprites, enlarged)
  // the fist gripping the trident: the battle fist, Scale2x, over a stretch of the red shaft
  def('fistGrip', () => {
    const fist = scale2x(MV.F.filled(MV.img('fistL'))), [c, x] = cv(64, 40);
    x.fillStyle = '#c41616'; x.fillRect(0, 14, 64, 8);
    x.fillStyle = '#ff3a2a'; x.fillRect(0, 14, 64, 2);
    x.fillStyle = '#7a0c0c'; x.fillRect(0, 21, 64, 1);
    x.drawImage(fist, 12, 4);
    return c;
  });
  // an open paw, palm toward what it touches (no game sprite: drawn in the fist's style)
  def('pawOpen', () => lineArt(30, 30, (m) => {
    m.beginPath(); m.ellipse(13, 19, 10, 9, -0.2, 0, U.TAU); m.fill(); // palm
    [[5, 6, -0.45], [10, 3, -0.15], [16, 3, 0.12], [21, 6, 0.4]].forEach(([fx, fy, a]) => { m.save(); m.translate(fx, fy + 6); m.rotate(a); m.beginPath(); m.roundRect(-2.6, -7, 5.2, 13, 2.6); m.fill(); m.restore(); });
    m.save(); m.translate(24, 19); m.rotate(0.9); m.beginPath(); m.roundRect(-2.6, -6, 5.2, 11, 2.6); m.fill(); m.restore(); // thumb
    m.fillRect(6, 25, 15, 5); // wrist (fur cuff below)
  }, { detail: (d) => { d.beginPath(); d.moveTo(8.5, 12); d.lineTo(9.5, 15); d.moveTo(13.5, 10); d.lineTo(13.5, 14); d.moveTo(18.5, 11); d.lineTo(17.5, 14); d.stroke(); d.fillRect(7, 25, 13, 1); } }));
  def('pawOpen2x', () => scale2x(ART.get('pawOpen')));
  // the paw he holds out to a container (a hand let go of the trident, src/stage.js): fist-sized,
  // open, fingers together and a little curled - asking, not grabbing. Fingers point up (-y),
  // the fur cuff at the bottom; the game's line art (outline from the mask, 1 px finger lines)
  const maskArt = (rows, o = {}) => {
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length, [c, x] = cv(w, h);
    // (openLeft: the left end has no outline - it goes on under something)
    const at = (i, j) => (j >= 0 && j < h && i >= 0 && i < w ? rows[j][i] || '.' : o.openLeft && i < 0 && j >= 0 && j < h && rows[j][0] !== '.' ? '#' : '.');
    const L = o.line || '#ffffff', Fc = o.fill || '#000000';
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const ch = at(i, j);
      if (ch === '.') continue;
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => at(i + a, j + b) === '.');
      x.fillStyle = ch === 'w' || edge ? L : Fc; x.fillRect(i, j, 1, 1);
    }
    return c;
  };
  def('pawReach', () => maskArt([
    '.....###.###......',
    '....####w####.....',
    '....####w####.###.',
    '.##.####w####w####',
    '####w###w####w###.',
    '####w###w####w###.',
    '.###w###w###w####.',
    '.####w##w##w#####.',
    '..###############.',
    '..##############..',
    '...#####w#######..',
    '...######w######..',
    '....############..',
    '....###########...',
    '....##########....',
    '...############...',
    '...#wwwwwwwwww#...',
    '...############...',
  ]));
  // the arm held out: his black sleeve, tapering from under the shoulder pad (the left end, open)
  // to a white fur cuff at the wrist; pointing right (+x), drawn rotated toward what he reaches for
  def('armReach', () => {
    const W = 36, Hh = 18, rows = [];
    for (let j = 0; j < Hh; j++) {
      let s = '';
      for (let i = 0; i < W; i++) {
        const u = i / (W - 1), half = U.lerp(8.6, 5.4, u ** 0.8) + (i >= W - 5 ? 1.2 : 0), c = Hh / 2 - 0.5 + u * 1.2;
        const inside = Math.abs(j - c) <= half;
        s += !inside ? '.' : i >= W - 5 && i <= W - 2 && Math.abs(j - c) < half - 0.6 ? 'w' : '#';
      }
      rows.push(s);
    }
    return maskArt(rows, { openLeft: true });
  });
  show('pawReach', 'armReach');
  // his faces at twice the detail (看破's closed eyes, the bowed head, the sad look, the relief)
  const FACES = { faceClosed: 'face0', faceBowed: 'face2', faceSad: 'face5', faceSad2: 'face8', faceRelief: 'face9', faceLook: 'face1' };
  for (const [k, n] of Object.entries(FACES)) def(k, () => scale2x(MV.F.filled(MV.img(n))));
  show('fistGrip', 'pawOpen2x', 'faceClosed', 'faceBowed', 'faceSad', 'faceSad2', 'faceRelief', 'faceLook');

  // his battle faces on the puppet: each face sprite's offset from the head part's top-left,
  // found by matching their outlines (horns and crown line up)
  const faceOff = {};
  MV.faceAt = (name) => {
    if (faceOff[name]) return faceOff[name];
    const read = (img) => { const [, x] = cv(img.width, img.height); x.drawImage(img, 0, 0); return { w: img.width, h: img.height, d: x.getImageData(0, 0, img.width, img.height).data }; };
    const H = read(MV.img('head')), Fc = read(MV.img(name));
    const wht = (P, i, j) => i >= 0 && j >= 0 && i < P.w && j < P.h && P.d[(j * P.w + i) * 4 + 3] > 0 && P.d[(j * P.w + i) * 4] > 200;
    let best = -1, bo = [0, 0];
    for (let dy = -14; dy <= 6; dy++) for (let dx = -8; dx <= 8; dx++) {
      let s = 0;
      for (let j = 0; j < 20; j++) for (let i = 0; i < Fc.w; i++) if (wht(Fc, i, j) && wht(H, i + dx, j + dy)) s++;
      if (s > best) { best = s; bo = [dx, dy]; }
    }
    return (faceOff[name] = bo);
  };

  // ---------------------------------------------------------------- the memories (the game's intro style)
  const PW = 200, PH = 110;
  const panel = (paint) => () => { const [c, x] = cv(PW, PH); x.imageSmoothingEnabled = false; paint(x); return sepia(c); };
  // 1. Toriel and the butterscotch pie, in the kitchen
  def('memPie', panel((x) => {
    x.fillStyle = '#6e5238'; x.fillRect(0, 0, PW, PH);
    x.fillStyle = '#4a3624'; x.fillRect(0, 92, PW, 18); // floor
    x.fillStyle = '#e9d6a8'; x.fillRect(16, 14, 40, 40); // window
    x.fillStyle = '#4a3624'; x.fillRect(35, 14, 2, 40); x.fillRect(16, 33, 40, 2);
    x.fillStyle = 'rgba(255,240,200,0.22)'; x.beginPath(); x.moveTo(16, 54); x.lineTo(56, 54); x.lineTo(96, 92); x.lineTo(46, 92); x.fill(); // light on the floor
    x.fillStyle = '#3c2a1c'; x.fillRect(118, 60, 82, 32); // counter
    x.fillStyle = '#9a7650'; x.fillRect(118, 58, 82, 3);
    x.fillStyle = '#2a1e14'; x.fillRect(150, 30, 40, 30); x.fillStyle = '#d88a3a'; x.fillRect(156, 38, 28, 14); // the oven, warm inside
    x.fillStyle = '#8a6a48'; x.fillRect(122, 22, 22, 2); [[124, 14], [131, 16], [138, 13]].forEach(([a, b]) => x.fillRect(a, b, 5, 24 - b)); // a shelf of jars
    stand(x, MV.img('toriel/21'), 92, 98);
    x.fillStyle = '#c88a40'; x.beginPath(); x.ellipse(110, 64, 10, 3.2, 0, 0, U.TAU); x.fill(); // the pie
    x.fillStyle = '#ecc070'; x.beginPath(); x.ellipse(110, 63, 8.5, 2.2, 0, 0, U.TAU); x.fill();
    x.fillStyle = '#9a6430'; for (let i = -6; i <= 6; i += 4) x.fillRect(110 + i, 62, 1, 3);
    x.strokeStyle = '#f6ecd0'; x.lineWidth = 1;
    for (let k = 0; k < 3; k++) { x.beginPath(); for (let j = 0; j < 14; j++) x.lineTo(105 + k * 5 + Math.sin(j * 0.7 + k) * 1.5, 58 - j * 1.4); x.stroke(); } // its warmth rising
  }));
  // 2. (the children in the golden flowers, his and her arms round them: the game's own painting,
  // src/assets_story.js 'story/family')
  // 3. the throne room, a tall painting (the window climbs it): the golden flowers he tends over
  // the whole floor - one place among them left bare, in the light - and the two thrones, one of
  // them under a white sheet
  def('memHall', () => {
    const W = PW, HH = 160, [c, x] = cv(W, HH);
    x.imageSmoothingEnabled = false;
    x.fillStyle = '#5a4630'; x.fillRect(0, 0, W, HH);
    for (const wx of [30, 92, 154]) { x.fillStyle = '#ead8aa'; x.fillRect(wx, 16, 16, 40); x.beginPath(); x.arc(wx + 8, 16, 8, Math.PI, 0); x.fill(); } // windows
    x.fillStyle = '#3e2e1e'; x.fillRect(0, 96, W, HH - 96); // floor
    x.fillStyle = '#4a3a24'; x.fillRect(0, 106, W, HH - 106); // the bed's earth
    x.fillStyle = 'rgba(255,240,200,0.16)'; for (const wx of [30, 92, 154]) { x.beginPath(); x.moveTo(wx, 56); x.lineTo(wx + 16, 56); x.lineTo(wx + 34, 158); x.lineTo(wx + 2, 158); x.fill(); }
    // his throne
    x.fillStyle = '#2e2216'; x.fillRect(70, 50, 24, 30); x.fillRect(66, 70, 32, 6); x.fillRect(68, 76, 4, 18); x.fillRect(90, 76, 4, 18);
    x.fillStyle = '#c8a050'; x.fillRect(70, 50, 24, 2); [[72, 46], [80, 44], [88, 46]].forEach(([a, b]) => x.fillRect(a, b, 4, 4));
    // hers, under a white sheet
    x.fillStyle = '#e8dcc0'; x.beginPath(); x.moveTo(108, 98); x.quadraticCurveTo(104, 66, 112, 50); x.quadraticCurveTo(122, 42, 132, 50); x.quadraticCurveTo(140, 66, 138, 98); x.fill();
    x.strokeStyle = '#b8a888'; x.beginPath(); x.moveTo(116, 58); x.quadraticCurveTo(114, 78, 118, 98); x.moveTo(128, 58); x.quadraticCurveTo(132, 80, 130, 98); x.stroke();
    // the flowers, back to front; the bare place
    const fl = flower(), rnd = U.rng(13), pts = [];
    for (let i = 0; i < 170; i++) {
      const fx = rnd() * W, fy = 108 + rnd() * 54;
      if (Math.hypot((fx - 112) / 19, (fy - 140) / 7) >= 1) pts.push([fx, fy]);
    }
    x.fillStyle = '#2e2216'; x.beginPath(); x.ellipse(112, 140, 14, 4, 0, 0, U.TAU); x.fill();
    pts.sort((a, b) => a[1] - b[1]).forEach(([fx, fy]) => x.drawImage(fl, R(fx - 3), R(fy - 9)));
    return sepia(c);
  });
  show('memPie', 'memHall');

  // ---------------------------------------------------------------- borrowed moments, in the game's own UI
  // Nothing from the other games' screens: every borrowed beat is told with what UT itself
  // shows. ART.target: his name and HP bar as the game lists a monster when you choose 战斗 (the
  // "boss card" at bar 0, the bar that falls in the relic fight); pips: the six souls lending him
  // power as small hearts after the bar, going dark one by one (the relic fight's "shield").
  // (the warning is the sheet's own red "!", warnRed; his eye flashes are the sheet's own frames)
  const HPW = 102;
  ART.target = (hp, max = 1, pips = null) => {
    const [c, x] = cv(360, 20);
    D.text(x, '* 艾斯戈尔', 0, 2, { scale: 1, color: '#ffffff' });
    x.fillStyle = '#ff0000'; x.fillRect(110, 3, HPW, 15);
    x.fillStyle = '#00ff00'; x.fillRect(110, 3, R(HPW * U.clamp(hp / max)), 15);
    if (pips) pips.forEach((on, i) => {
      const k = MV.SOULS[i], img = MV.F.tint(MV.img('heartSmall'), on ? MV.COL.S[k] : '#3a3644');
      x.drawImage(img, 222 + i * 14, 6);
    });
    return c;
  };
  def('targetFull', () => ART.target(1));
  def('targetPips', () => ART.target(0.62, 1, [0, 0, 1, 1, 1, 1].map((v, i) => (i > 1 ? 1 : 0))));
  // his face in extreme close-up with the sheet's eye flash on each eye (orange, then light blue)
  ART.glint = (col) => {
    const face = ART.get('faceLook'), [c, x] = cv(face.width, face.height), f = MV.F.tint(MV.img('eye2'), col);
    x.drawImage(face, 0, 0);
    for (const ex of [36, 62]) x.drawImage(f, ex - f.width / 2, 58 - f.height / 2);
    return c;
  };
  def('glintOrange', () => ART.glint(MV.COL.S.orange));
  def('glintAqua', () => ART.glint(MV.COL.S.aqua));
  def('warnBig', () => scale2x(scale2x(MV.img('warnRed'))));
  // his battle head (the stern mask) at twice the detail, for the eye-flash close-ups; the eyes'
  // centres on it (from the puppet's MV.kingEyes)
  def('faceStern', () => scale2x(MV.F.filled(MV.img('head'))));
  ART.eyeX = [37, 54.5]; ART.eyeY = 31;
  // the trident seen along its shaft (the soul's view of the thrust): the three prongs lie in
  // a line across the picture, the crossbar bowed toward the viewer, three points aimed at it;
  // his face stays clear above it. Light blue.
  def('tridentFront', () => lineArt(72, 26, (m) => {
    m.beginPath(); m.moveTo(4, 9); m.quadraticCurveTo(36, 22, 68, 9); m.lineTo(68, 14); m.quadraticCurveTo(36, 27, 4, 14); m.closePath(); m.fill(); // the crossbar
    for (const [x, y, s] of [[6, 11, 5], [36, 17, 7], [66, 11, 5]]) { m.beginPath(); m.moveTo(x, y - s * 1.6); m.lineTo(x + s, y); m.lineTo(x, y + s * 1.2); m.lineTo(x - s, y); m.closePath(); m.fill(); } // the points
  }, { line: '#e6fcff', fill: '#3fd8ec', detail: (d) => { for (const [x, y] of [[6, 11], [36, 17], [66, 11]]) d.fillRect(x - 1, y - 1, 2, 2); } }));
  show('targetFull', 'targetPips', 'glintOrange', 'glintAqua', 'warnBig', 'faceStern', 'tridentFront');

  // ---------------------------------------------------------------- the souls' extra things
  def('cowboyHat', () => art([
    '......kkkkkk......',
    '.....kbbbbbbk.....',
    '.....kbbbbbbk.....',
    '.....kddddddk.....',
    'kk..kbbbbbbbbk..kk',
    'kbkkbbbbbbbbbbkkbk',
    '.kbbbbbbbbbbbbbbk.',
    '..kkkkkkkkkkkkkk..',
  ], { k: '#2a1a0e', b: '#9a6a3a', d: '#5a3a1e' }));
  def('ribbon', () => art([
    '.pp......pp.',
    'pPPp....pPPp',
    'pPPPp..pPPPp',
    '.pPPPkkPPPp.',
    '..ppPkkPpp..',
    '....pPPp....',
    '...pPp.pPp..',
    '..pPp...pPp.',
    '..pp.....pp.',
  ], { p: '#b07a88', P: '#d8a8b4', k: '#7a4a58' }));
  // the clock face the toy knives turn on (cyan soul): a ring, twelve ticks
  def('clockFace', () => lineArt(64, 64, (m) => { m.beginPath(); m.arc(32, 32, 31, 0, U.TAU); m.fill(); }, {
    line: '#9ef0ff', fill: '#0c1418',
    detail: (d) => { for (let i = 0; i < 12; i++) { const a = (i / 12) * U.TAU, r0 = i % 3 ? 26 : 23; d.beginPath(); d.moveTo(32 + Math.cos(a) * r0, 32 + Math.sin(a) * r0); d.lineTo(32 + Math.cos(a) * 29, 32 + Math.sin(a) * 29); d.stroke(); } d.fillRect(31, 31, 2, 2); },
  }));
  // Dead Eye's mark
  def('markX', () => art(['r.....r', '.r...r.', '..r.r..', '...r...', '..r.r..', '.r...r.', 'r.....r'], { r: '#ff2a2a' }));
  // friendliness pellets (white, spinning seeds)
  def('pellet', () => art(['..ww..', '.wwww.', 'wwwwww', 'wwwwww', '.wwww.', '..ww..'], { w: '#ffffff' }));
  show('cowboyHat', 'ribbon', 'clockFace', 'markX', 'pellet');
  // what the other four left behind, worn by no one (the absent children beside the box,
  // src/tl_act4b.js): the stained apron, the cloudy glasses, the old tutu, the manly bandanna
  def('apron', () => art([
    '....kkkkkkk....',
    '...k.......k...',
    '...k.......k...',
    '...kkkkkkkkk...',
    '...kwwwwwwwk...',
    '...kwwwswwwk...',
    '...kwwwwwwwk...',
    'kkkkkkkkkkkkkkk',
    'k.kwwwwwwwwwk.k',
    '..kwwwwwwswwk..',
    '.kwwwwwwwsswwk.',
    '.kwwswwwwwwwwk.',
    'kwwwwwwwwwwwwwk',
    'kwssswwwwwswwwk',
    'kkkkkkkkkkkkkkk',
  ], { k: '#5e564c', w: '#ddd4c2', s: '#8a6a40' }));
  def('glasses', () => art([
    '.kkkk....kkkk.',
    'kcccck..kcccck',
    'kccCckkkkcCcck',
    'kccccck.kcccck',
    '.kkkk....kkkk.',
  ], { k: '#6a6478', c: '#b8b4c8', C: '#f0eef8' }));
  // a page torn out of the torn notebook (purple): ruled, a red margin, its top edge ragged where
  // it was ripped out, a few scrawls; the columns of them that hold the purple lines
  def('notePage', () => art([
    '.ww.www.ww',
    'wwwwwwwwww',
    'wmwwwwwwww',
    'wmllllllll',
    'wmwwwwwwww',
    'wmlsslllww',
    'wmwwwwwwww',
    'wmllllllll',
    'wmwwwwwwww',
    'wmllllsslw',
    'wmwwwwwwww',
    'wmlllwwwww',
    'wwwwwwwwww',
  ], { w: '#ece6d8', l: '#9a8cc4', m: '#d08494', s: '#3a2448' }));
  def('tutu', () => art([
    '.......pppppp.......',
    '....pppPPPPPPppp....',
    '.ppPPPPPPPPPPPPPPpp.',
    'pPPPPPPPPPPPPPPPPPPp',
    '.pPpPpPpPpPpPpPpPpP.',
    '..p.p.p.p.p.p.p.p...',
  ], { P: '#e8dcf2', p: '#9c8cc0' }));
  def('bandanna', () => art([
    '.oooooooooooo.....',
    'oOOOOOOOOOOOOo..oo',
    'oOOdOOdOOdOOOooOOo',
    'oOOdOOdOOdOOOoOOo.',
    '.ooooooooooooo.oo.',
    '..............o..o',
  ], { O: '#ff8c1a', o: '#a8520c', d: '#c45a00' }));
  show('apron', 'glasses', 'notePage', 'tutu', 'bandanna');

  // the bandanna's boxing glove, seen from the side, punching to the right: a fat rounded mitt
  // lit from the top left (four tones of the soul's orange), the thumb along its top with its
  // seam, a laced white cuff at the wrist; a dark outline like the game's sprites
  def('boxGlove', () => {
    const W = 28, Hh = 22, [c, x] = cv(W, Hh), id = x.createImageData(W, Hh), d = id.data;
    const mitt = (i, j) => ((i - 16.5) / 10.6) ** 2 + ((j - 11.8) / 9.4) ** 2 <= 1;
    const thumb = (i, j) => ((i - 14.5) / 7.8) ** 2 + ((j - 4.6) / 3.4) ** 2 <= 1;
    const cuff = (i, j) => i >= 1 && i <= 8 && j >= 6 && j <= 19;
    const inside = (i, j) => i >= 0 && j >= 0 && i < W && j < Hh && (mitt(i + 0.5, j + 0.5) || thumb(i + 0.5, j + 0.5) || cuff(i, j));
    const put = (i, j, hex) => { const [r, g, b] = rgb(hex), p = (j * W + i) * 4; d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255; };
    for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) {
      if (!inside(i, j)) continue;
      if (!inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1)) { put(i, j, '#4a1c04'); continue; }
      if (cuff(i, j) && !mitt(i + 0.5, j + 0.5)) { put(i, j, (j - 6) % 4 === 2 ? '#b4aa98' : i <= 2 ? '#c8c0b0' : '#efe9de'); continue; }
      const th = thumb(i + 0.5, j + 0.5) && j < 8;
      const [ox, oy, rx, ry] = th ? [14.5, 4.6, 7.8, 3.4] : [16.5, 11.8, 10.6, 9.4];
      const nx = (i + 0.5 - ox) / rx, ny = (j + 0.5 - oy) / ry, lit = -(nx * 0.62 + ny * 0.78), rim = nx * nx + ny * ny;
      // (the thumb's seam: where it lies on the mitt)
      if (th && j >= 6 && mitt(i + 0.5, j + 1.5)) { put(i, j, '#a8480a'); continue; }
      put(i, j, lit > 0.55 && rim > 0.35 ? '#ffd494' : lit > 0.1 ? '#ff9a2a' : lit > -0.45 ? '#e2700e' : '#a8480a');
    }
    x.putImageData(id, 0, 0);
    // a glint
    x.fillStyle = '#ffffff'; x.fillRect(11, 6, 2, 1); x.fillRect(10, 7, 1, 1);
    return c;
  });
  // the burst where a punch lands: an eight-pointed star, white at its heart
  def('punchPow', () => {
    const S = 26, [c, x] = cv(S, S), pts = [];
    for (let k = 0; k < 16; k++) { const a = (k / 16) * U.TAU - Math.PI / 2, r = k % 2 ? 5.5 : k % 4 ? 10 : 12.5; pts.push([S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r]); }
    const fill = (k, hex) => { x.fillStyle = hex; x.beginPath(); pts.forEach(([px, py], i) => { const qx = S / 2 + (px - S / 2) * k, qy = S / 2 + (py - S / 2) * k; i ? x.lineTo(qx, qy) : x.moveTo(qx, qy); }); x.closePath(); x.fill(); };
    fill(1, '#ff6a1e'); fill(0.72, '#ffd23a'); fill(0.42, '#ffffff');
    // (crisp: the anti-aliased edge snapped)
    const id = x.getImageData(0, 0, S, S);
    for (let p = 3; p < id.data.length; p += 4) id.data[p] = id.data[p] > 110 ? 255 : 0;
    x.putImageData(id, 0, 0);
    return c;
  });
  show('boxGlove', 'punchPow');
  // the souls' gifts: in the game's Omega Flowey fight, when you call for
  // help, each soul's attack turns into healing things, all in the game's healing green - light
  // blue's knives into bandages with a heart, orange's gloves into a thumbs-up with a heart, blue's
  // stars into music notes, green's fire into fried eggs, yellow's bullets into four-petal flowers
  // (purple's words into kind words: drawn as text). And blue's star itself, as it comes at the soul.
  const HEAL = { g: '#0e8a2c', G: '#3cff5a', W: '#ffffff', y: '#d8ff60' };
  def('healBandage', () => art([
    '..gggggggggggg..',
    '.gGGGGWGWGGGGGg.',
    'gGGGGWWWWWGGGGGg',
    'gGGGGGWWWGGGGGGg',
    'gGGGGGGWGGGGGGGg',
    '.gGGGGGGGGGGGGg.',
    '..gggggggggggg..',
  ], HEAL));
  def('healThumb', () => art([
    '.....gg......',
    '....gGGg.....',
    '....gGGg.....',
    '....gGGg.....',
    '...gGGGg.....',
    '.ggGGGGggggg.',
    'gGGGGGGGGGGGg',
    'gGGGWGWGGGGGg',
    'gGGWWWWWGGGGg',
    'gGGGWWWGGGGGg',
    'gGGGGWGGGGGGg',
    'gGGGGGGGGGGg.',
    '.gGGGGGGGGGg.',
    '..ggggggggg..',
  ], HEAL));
  def('healNote', () => art([
    '....gg...',
    '....gGg..',
    '....gGGg.',
    '....gGgGg',
    '....gG.gG',
    '....gG..g',
    '....gG...',
    '....gG...',
    '.gggGG...',
    'gGGGGG...',
    'gGWGGG...',
    'gGGGGg...',
    '.gggg....',
  ], HEAL));
  def('healEgg', () => art([
    '....gggg......',
    '..ggGGGGgg....',
    '.gGGGGGGGGgg..',
    '.gGGGGyyGGGGg.',
    'gGGGGyWWyGGGg.',
    'gGGGGyWyyGGGGg',
    'gGGGGGyyGGGGg.',
    '.gGGGGGGGGGGg.',
    '..gGGGGGGGgg..',
    '...gggGGgg....',
    '......gg......',
  ], HEAL));
  def('healFlower', () => art([
    '....ggg....',
    '...gGGGg...',
    '...gGGGg...',
    '.gggGGGggg.',
    'gGGGgWgGGGg',
    'gGGGWWWGGGg',
    'gGGGgWgGGGg',
    '.gggGGGggg.',
    '...gGGGg...',
    '...gGGGg...',
    '....ggg....',
  ], HEAL));
  def('blueStar', () => art([
    '...b...',
    '...b...',
    '..bwb..',
    'bbwwwbb',
    '..bwb..',
    '...b...',
    '...b...',
  ], { b: '#3d6dff', w: '#d8e6ff' }));
  show('healBandage', 'healThumb', 'healNote', 'healEgg', 'healFlower', 'blueStar');

  // ---------------------------------------------------------------- the relics' blows (68-70)
  // The game draws each weapon's blow over the monster (src/blow.js); these are its pieces.
  // the tough glove seen from the front, as the game's fist comes at the monster: a round mitt lit
  // from the top left, the thumb folded across its left side, the knuckles' creases, a laced cuff
  def('fistFront', () => {
    const W = 22, Hh = 24, [c, x] = cv(W, Hh), id = x.createImageData(W, Hh), d = id.data;
    const mitt = (i, j) => ((i - 11.5) / 9.6) ** 2 + ((j - 9.6) / 9.0) ** 2 <= 1;
    const thumb = (i, j) => ((i - 5.2) / 3.6) ** 2 + ((j - 13.4) / 5.4) ** 2 <= 1;
    const cuff = (i, j) => i >= 5 && i <= 16 && j >= 17 && j <= 23;
    const inside = (i, j) => i >= 0 && j >= 0 && i < W && j < Hh && (mitt(i + 0.5, j + 0.5) || thumb(i + 0.5, j + 0.5) || cuff(i, j));
    const put = (i, j, hex) => { const [r, g, b] = rgb(hex), p = (j * W + i) * 4; d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255; };
    for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) {
      if (!inside(i, j)) continue;
      if (!inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1)) { put(i, j, '#4a1c04'); continue; }
      if (cuff(i, j) && !mitt(i + 0.5, j + 0.5) && !thumb(i + 0.5, j + 0.5)) { put(i, j, (j - 17) % 3 === 1 ? '#b4aa98' : i <= 6 ? '#c8c0b0' : '#efe9de'); continue; }
      const th = thumb(i + 0.5, j + 0.5) && i < 8;
      // (the thumb's edge where it lies on the mitt; the knuckles' creases across the top)
      if (th && (i === 7 || j === 8)) { put(i, j, '#a8480a'); continue; }
      if (!th && j === 5 && i >= 8 && i <= 17 && i % 3 === 1) { put(i, j, '#c45a00'); continue; }
      const [ox, oy, rx, ry] = th ? [5.2, 13.4, 3.6, 5.4] : [11.5, 9.6, 9.6, 9.0];
      const nx = (i + 0.5 - ox) / rx, ny = (j + 0.5 - oy) / ry, lit = -(nx * 0.62 + ny * 0.78), rim = nx * nx + ny * ny;
      put(i, j, lit > 0.55 && rim > 0.3 ? '#ffd494' : lit > 0.1 ? '#ff9a2a' : lit > -0.45 ? '#e2700e' : '#a8480a');
    }
    x.putImageData(id, 0, 0);
    x.fillStyle = '#ffffff'; x.fillRect(7, 3, 3, 1); x.fillRect(6, 4, 1, 1);
    return c;
  });
  // the sole of the old ballet shoe, as the game shows the kick: seen from below, the toe up - pale
  // satin round the edge, the leather sole darker at the ball and the heel, its ribbons trailing
  def('shoeSole', () => {
    const W = 18, Hh = 34, [c, x] = cv(W, Hh), id = x.createImageData(W, Hh), d = id.data;
    // (the outline: narrow at the toe, wide at the ball, a waist, the round heel)
    const half = (j) => (j < 2 ? 2.4 + j * 1.3 : j < 12 ? 5.2 + Math.sin(((j - 2) / 10) * Math.PI / 2) * 1.6 : j < 20 ? 6.8 - (j - 12) * 0.32 : 4.3 + Math.sin(((j - 20) / 9) * Math.PI) * 1.4 - Math.max(0, j - 26) * 0.7);
    const inside = (i, j) => i >= 0 && j >= 0 && i < W && j < 30 && Math.abs(i + 0.5 - 9) <= half(j);
    const put = (i, j, hex) => { const [r, g, b] = rgb(hex), p = (j * W + i) * 4; d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255; };
    for (let j = 0; j < Hh; j++) for (let i = 0; i < W; i++) {
      if (inside(i, j)) {
        if (!inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1)) { put(i, j, '#5a3a4a'); continue; }
        const edge = Math.abs(i + 0.5 - 9) > half(j) - 2, ball = j >= 4 && j <= 13, heel = j >= 22;
        put(i, j, edge ? (i < 9 ? '#fbe8ee' : '#e6c8d2') : ball || heel ? (i < 8 ? '#c79a8a' : '#a87a6c') : '#d9b6a4');
      } else if (j >= 26 && (i === 5 - Math.round((j - 26) * 0.6) || i === 12 + Math.round((j - 26) * 0.5))) put(i, j, '#3a56ff');
    }
    x.putImageData(id, 0, 0);
    return c;
  });
  show('fistFront', 'shoeSole');
})();
