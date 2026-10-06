// Assets: sheet cells (keyed '<sheet>/<cell>' by tools/import_assets.py) under readable
// names, the battle UI from c2-sans-fight, derived canvases (Chinese command buttons),
// bitmap fonts, and the palette.
(function () {
  const MV = window.MV, U = MV.U, AS = window.MV_ASSETS;

  // palette (sRGB hex; voxels convert to linear with U.lin)
  MV.COL = {
    white: '#e6e3ee', // the brightest thing on screen: a slightly cool off-white, never #fff
    line: '#d9d6e2', black: '#100d17', ink: '#1b1726',
    red: '#ff2a2a', trident: '#e01c24', soul: '#ff1a1a', gold: '#e8b62c', orange: '#ff8a1e', yellow: '#ffd21a',
    ui: '#ff8c1a', uiHi: '#ffe14a', hpYellow: '#ffe03a', hpRed: '#e01818',
    S: { // the six souls
      yellow: '#ffe12a', green: '#2ee05a', purple: '#c43cff', blue: '#2f55ff', orange: '#ff8c1a', aqua: '#4af0ff',
    },
    violet: '#2a1440', ember: '#ff5a1e',
  };
  MV.SOULS = ['yellow', 'green', 'purple', 'blue', 'orange', 'aqua'];

  // readable names -> sheet cells (tools/slice_sheet.py)
  const NAME = {};
  const seq = (pre, sheet, ids) => ids.forEach((id, i) => (NAME[pre + i] = `${sheet}/${id}`));
  const rng = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  seq('face', 'boss', rng(10, 25));
  seq('faceTP', 'boss', rng(53, 67));
  Object.assign(NAME, { introBody: 'boss/88', introHurt: 'boss/89', flashSil: 'boss/168', spear: 'boss/174' });
  seq('brandish', 'boss', rng(110, 123));
  seq('eye', 'boss', [...rng(169, 173), ...rng(185, 189), ...rng(190, 196)]);
  seq('hand', 'boss', rng(175, 180));
  Object.assign(NAME, { fire0: 'boss/181', fire1: 'boss/182', warnRed: 'boss/183', warnYellow: 'boss/184' });
  seq('particle', 'boss', rng(216, 223));
  Object.assign(NAME, {
    cape0: 'boss/233', cape1: 'boss/234', head: 'boss/235', torso: 'boss/236', fistL: 'boss/237', fistR: 'boss/238',
    ball: 'boss/239', arm0: 'boss/240', arm1: 'boss/241', belt: 'boss/242', legs: 'boss/243', feet: 'boss/244',
    kneelDust: 'boss/364', kneel: 'boss/365', msoul: 'boss/373', msoulBreak: 'boss/374',
  });
  seq('swipe', 'boss', rng(268, 274));
  seq('swipeSpear', 'boss', rng(299, 305));
  seq('msoulShard', 'boss', rng(375, 378));
  Object.assign(NAME, {
    heartRed: 'souls/4', heartRedDark: 'souls/5', heartSmall: 'souls/10', heartBreak: 'souls/25',
    heartBlue: 'souls/58', heartGreen: 'souls/95', heartPurple: 'souls/104', heartYellow: 'souls/115',
    heartYellowFlip: 'souls/121', heartOrange: 'souls/152', heartAqua: 'souls/159', jarEmpty: 'souls/194',
  });
  seq('heartShard', 'souls', rng(32, 35));
  seq('yBullet', 'souls', rng(132, 137));
  seq('jarAppear', 'souls', rng(172, 178));
  seq('jar', 'souls', rng(186, 189));
  seq('agDown', 'asgore', rng(39, 42));
  seq('agTalk', 'asgore', [43, 44]);
  seq('agSad', 'asgore', [90, 91]);
  seq('agLeft', 'asgore', rng(116, 119));
  seq('agRight', 'asgore', rng(148, 151));
  seq('agUp', 'asgore', [161, 162]);
  seq('friskDown', 'frisk', rng(0, 3));
  seq('friskUp', 'frisk', rng(52, 55));
  MV.NAME = NAME;

  const IMG = (MV.IMG = {});
  MV.img = (name) => IMG[NAME[name] || name];
  MV.META = AS.meta;
  MV.frame = (obj, anim, i = 0) => {
    const m = AS.meta[obj][anim];
    return IMG[`${obj}/${anim}/${((i % m.n) + m.n) % m.n}`];
  };
  const canvas = (MV.canvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.imageSmoothingEnabled = false;
    return [c, x];
  });
  // a copy the browser may keep on the GPU (no willReadFrequently), for a big still picture drawn
  // every frame: a software canvas has to be uploaded again whenever the GPU's cache lets it go -
  // with several worlds' pictures on stage that was every few frames (the hitches of 16-51)
  MV.gpuCopy = (src) => {
    const c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(src, 0, 0);
    return c;
  };
  MV.loadAssets = () =>
    Promise.all(
      Object.entries(AS.img).map(([k, src]) => new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => { IMG[k] = im; res(); };
        im.onerror = rej;
        im.src = src;
      }))
    ).then(build);

  MV.SPR = {};
  function build() {
    const S = MV.SPR;
    // Chinese command buttons on the original button art (border + icon kept), heavy 14x14
    // glyphs at 2x like the Chinese build (tools/make_font.py)
    const labels = ['战斗', '行动', '物品', '仁慈'], BG = window.MV_BTN_GLYPHS;
    ['UIFight', 'UIAct', 'UIItem', 'UIMercy'].forEach((obj, i) => {
      for (const hl of [false, true]) {
        const src = MV.frame(obj, hl ? 'Highlight' : 'Default');
        const [c, x] = canvas(src.width, src.height);
        x.drawImage(src, 0, 0);
        x.fillStyle = '#000';
        x.fillRect(29, 2, src.width - 31, src.height - 4);
        x.fillStyle = hl ? '#ffff00' : '#ff7f27';
        let gx = 35;
        for (const ch of labels[i]) {
          const [n, rows] = BG[ch];
          for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) if ((rows[j] >> (n - 1 - k)) & 1) x.fillRect(gx + k * 2, 7 + j * 2, 2, 2);
          gx += 31;
        }
        S[`btn${i}${hl ? 'h' : ''}`] = c;
      }
    });
    S.hpLabel = MV.frame('HP', 'Default');
  }

  // ------------------------------------------------------------ bitmap fonts from the original textures
  const FONTS = (MV.FONTS = {
    battle: { img: 'BattleFont', cw: 6, ch: 6, first: 32 }, // HUD (name, LV, numbers)
    damage: { img: 'DamageFont', cw: 33, ch: 32, first: 32 }, // big numbers
  });
  const fontCache = {};
  MV.fontGlyph = (font, chr, color) => {
    const key = font + chr + color;
    if (fontCache[key]) return fontCache[key];
    const f = FONTS[font];
    const code = font === 'battle' ? chr.toUpperCase().charCodeAt(0) : chr.charCodeAt(0);
    const idx = code - f.first;
    const img = IMG[f.img];
    const cols = img.width / f.cw;
    const [c, x] = canvas(f.cw, f.ch);
    const sx = (idx % cols) * f.cw, sy = Math.floor(idx / cols) * f.ch;
    x.drawImage(img, sx, sy, f.cw, f.ch, 0, 0, f.cw, f.ch);
    x.globalCompositeOperation = 'multiply';
    x.fillStyle = color;
    x.fillRect(0, 0, f.cw, f.ch);
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(img, sx, sy, f.cw, f.ch, 0, 0, f.cw, f.ch);
    return (fontCache[key] = c);
  };
  // a string in a bitmap font, as one canvas (for voxelizing HUD text)
  MV.fontCanvas = (font, str, color = '#ffffff', spacing = 0) => {
    const f = FONTS[font], adv = f.cw + spacing;
    const [c, x] = canvas(Math.max(1, str.length * adv), f.ch);
    [...str].forEach((ch, i) => { if (ch !== ' ') x.drawImage(MV.fontGlyph(font, ch, color), i * adv, 0); });
    return c;
  };
})();
