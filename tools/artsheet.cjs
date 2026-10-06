// Review sheet of the performance sprites (src/art.js: MV.ART.list), each at 2x with its name,
// plus the sheet's eye-flash frames (eye0..16) for picking.
// Usage: node tools/artsheet.cjs [out.png]   (default work/art_sheet.png)
const { chromium, pageUrl, GPU } = require('./pw.cjs');
const fs = require('fs');
(async () => {
  const out = process.argv[2] || 'work/art_sheet.png';
  const b = await chromium.launch({ args: GPU });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto(pageUrl('?render=1&w=960&h=540'));
  await p.waitForFunction(() => window.MV && (window.MV.ready || window.MV.failed), null, { timeout: 120000 });
  const url = await p.evaluate(() => {
    const MV = window.MV, A = MV.ART, W = 1800, items = A.list.map((n) => [n, A.get(n)]);
    for (let i = 0; i < 17; i++) items.push(['eye' + i, MV.img('eye' + i)]);
    // the faces on the puppet's head (MV.faceAt): the head part in red under the face in white
    for (const f of ['face0', 'face1', 'face2', 'face5', 'face8', 'face9']) {
      const [o, ox] = MV.canvas(70, 70), [dx, dy] = MV.faceAt(f);
      ox.drawImage(MV.F.tint(MV.img('head'), '#c03030'), 12, 16);
      ox.globalAlpha = 0.75; ox.drawImage(MV.img(f), 12 + dx, 16 + dy);
      items.push([f + '@head ' + dx + ',' + dy, o]);
    }
    // lay out in rows at 2x
    let x = 10, y = 10, rowH = 0;
    const pos = items.map(([n, c]) => {
      const w = c.width * 2, h = c.height * 2;
      if (x + w > W - 10) { x = 10; y += rowH + 26; rowH = 0; }
      const r = [n, c, x, y];
      x += Math.max(w, 70) + 16; rowH = Math.max(rowH, h);
      return r;
    });
    const H = y + rowH + 30, [cv, cx] = MV.canvas(W, H);
    cx.fillStyle = '#3a3448'; cx.fillRect(0, 0, W, H);
    cx.imageSmoothingEnabled = false;
    cx.font = '12px monospace';
    for (const [n, c, px, py] of pos) {
      cx.fillStyle = '#26222e'; cx.fillRect(px - 2, py - 2, c.width * 2 + 4, c.height * 2 + 4);
      cx.drawImage(c, px, py, c.width * 2, c.height * 2);
      cx.fillStyle = '#e8e4f0'; cx.fillText(n, px, py + c.height * 2 + 14);
    }
    return cv.toDataURL();
  });
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log(out);
  await b.close();
})();
