// The six souls' things as small pixel-art sprites (drawn here in the game's style, from
// asset/six-soul.md: the equipment each human left behind), voxelized like everything
// else. Plus voxel words (the purple soul's notebook) from the dialogue font.
(function () {
  const MV = window.MV, U = MV.U, VX = MV.VX;
  const L = U.lin;

  // rows of characters -> canvas; pal: char -> hex ('.' = empty)
  const art = (rows, pal) => {
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
    const [c, x] = MV.canvas(w, h);
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
    return c;
  };
  const ART = {
    // the burnt frying pan (green, kindness)
    pan: [[
      '.....kkkkkkk..........',
      '...kkgggggggkk........',
      '..kgggdgggggggk.......',
      '.kgggggggggdgggk......',
      '.kggdggggggggggkkkkkkk',
      '.kggggggggdggggkhhhhhk',
      '.kgggggdgggggggkkkkkkk',
      '..kgggggggggggk.......',
      '...kkgggggggkk........',
      '.....kkkkkkk..........',
    ], { k: '#2a2a30', g: '#5c5d66', d: '#3b3b42', h: '#6a4224' }],
    // the torn notebook (purple, perseverance)
    book: [[
      '.ccccccccc.ccccccccc.',
      'cwwwwwwwwwcwwwwwwwwwc',
      'cwllllllwwcwlllllllwc',
      'cwwwwwwwwwcwwwwwwwwwc',
      'cwlllllllwcwllllllwwc',
      'cwwwwwwwwwcwwwwwwwwwc',
      'cwllllwwwwcwlllllllwc',
      'cwwwwwwwwwcwwwwwwwwwc',
      'cwlllllllwcwllllwwwwc',
      'cwwwwwwwwwcwwwwwwwwwc',
      '.ccccccccccccccccccc.',
    ], { c: '#6a2fa0', w: '#ece6d8', l: '#9a8cc4' }],
    // the old ballet shoe (blue, integrity)
    shoe: [[
      '..........rr....',
      '.........rrrr...',
      '........rrprr...',
      '...pppppppppp...',
      '..ppppppppppppp.',
      '.pppppppppppppp.',
      'pppppppppppppppp',
      '.kkkkkkkkkkkkkk.',
    ], { p: '#d6dcff', r: '#3a56ff', k: '#7a84b8' }],
    // the tough glove (orange, bravery)
    glove: [[
      '...oooooooo...',
      '..oooooooooo..',
      '.oooodoooodoo.',
      'oooooooooooooo',
      'ooooooooooooooo',
      'oodoooooooooooo',
      'oooooooooooooo.',
      '.oooooooooooo..',
      '..oooooooooo...',
      '...wwwwwwww....',
      '...wwwwwwww....',
    ], { o: '#ff8c1a', d: '#c45a00', w: '#e8e2d6' }],
    // the toy knife (light blue, patience)
    knife: [[
      '..............hh..',
      'sssssssssssssshhhh',
      '.ssssssssssssshhhh',
      '..............hh..',
    ], { s: '#c8f6ff', h: '#2ab8d0' }],
    // a falling star (blue)
    star: [[
      '...y...',
      '..yyy..',
      'yyyyyyy',
      '.yyyyy.',
      '..yyy..',
      '.yy.yy.',
      'y.....y',
    ], { y: '#ffe86a' }],
    // a golden flower (the throne room's)
    flower: [[
      '..y.y..',
      '.yyyyy.',
      'yyyoyyy',
      '.yyyyy.',
      '..y.y..',
      '...g...',
      '..gg...',
      '...g.g.',
      '...gg..',
    ], { y: '#ffd23a', o: '#e08a00', g: '#3a8a3a' }],
    // the empty gun (yellow, justice)
    gun: [[
      '..mmmmmmmmmmmmm',
      '.mmmmmmmmmmmmm.',
      'mmmmmmmm.......',
      'mmmmmmb........',
      '.hhhhh.........',
      '.hhhh..........',
      '.hhh...........',
    ], { m: '#d9b84a', b: '#7a6420', h: '#6a4224' }],
  };
  // a prop as a model (centred; s units per px)
  MV.propModel = (name, s = 4, o = {}) => MV.MODEL(`prop:${name}:${s}:${o.tint || ''}`, () => {
    const [rows, pal] = ART[name];
    const p2 = o.tint ? Object.fromEntries(Object.entries(pal).map(([k]) => [k, o.tint])) : pal;
    const c = art(rows, p2);
    return VX.sprite(c, { s, ax: c.width / 2, ay: c.height / 2, base: 2, max: 4, round: 2, sub: 2, map: VX.mapColor({ e: o.e || 0.15 }) });
  });
  MV.propSize = (name) => { const r = ART[name][0]; return [Math.max(...r.map((x) => x.length)), r.length]; };
  // a prop as a pixel canvas (the 2D battle); tint: every colour replaced by one
  MV.propCanvas = (name, tint) => {
    const [rows, pal] = ART[name];
    return art(rows, tint ? Object.fromEntries(Object.keys(pal).map((k) => [k, tint])) : pal);
  };

  // a word in the dialogue font as voxels (centred)
  MV.wordModel = (str, hex, s = 2.2) => MV.MODEL(`word:${str}:${hex}:${s}`, () => {
    const D = MV.D, w = Math.max(1, D.textWidth(str, { scale: 1 }));
    const [c, x] = MV.canvas(w, 16);
    D.text(x, str, 0, 0, { scale: 1, color: hex });
    return VX.sprite(c, { s, ax: w / 2, ay: 8, base: 2, max: 3, map: VX.mapSolid(hex, 0.35) });
  });
})();
