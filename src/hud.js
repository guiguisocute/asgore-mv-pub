// HUD text: the battle font (src/sprites.js) has no lowercase, so the few letters of "Frisk"
// get hand-made 5x5 glyphs in the same style. The HUD itself is drawn by src/stage.js.
(function () {
  const MV = window.MV;

  const LOWER = {
    r: ['.....', 'XXXX.', 'XX..X', 'XX...', 'XX...'],
    i: ['XX...', '.....', 'XX...', 'XX...', 'XX...'],
    s: ['.....', '.XXXX', 'XXX..', '..XXX', 'XXXX.'],
    k: ['XX...', 'XX.XX', 'XXXX.', 'XX.XX', 'XX.XX'],
  };
  const ADV = { i: 3 };
  MV.hudText = (str, color = '#ffffff') => {
    let w = 0;
    for (const ch of str) w += ADV[ch] || 6;
    const [c, x] = MV.canvas(Math.max(1, w), 6);
    let cx = 0;
    for (const ch of str) {
      if (LOWER[ch]) {
        x.fillStyle = color;
        LOWER[ch].forEach((row, j) => [...row].forEach((v, k) => { if (v === 'X') x.fillRect(cx + k, j, 1, 1); }));
      } else if (ch !== ' ') x.drawImage(MV.fontGlyph('battle', ch, color), cx, 0);
      cx += ADV[ch] || 6;
    }
    return c;
  };
})();
