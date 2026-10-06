// Dump named sprites into one review grid (any MV.img name, sheet key, frame 'Obj/Anim/i', or
// 'art:<name>' from src/art.js), each scaled with its name and size under it.
// Usage: node tools/sprites.cjs <out.png> <name>... [--sc=2]
const { chromium, pageUrl, GPU } = require('./pw.cjs');
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const sc = +((args.find((a) => a.startsWith('--sc=')) || '--sc=2').slice(5));
  const [out, ...names] = args.filter((a) => !a.startsWith('--'));
  const b = await chromium.launch({ args: GPU });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto(pageUrl('?render=1&w=960&h=540'));
  await p.waitForFunction(() => window.MV && (window.MV.ready || window.MV.failed), null, { timeout: 120000 });
  const failed = await p.evaluate(() => window.MV.failed);
  if (failed) { console.log('[failed]', failed); }
  const url = await p.evaluate(([names, sc]) => {
    const MV = window.MV, W = 1800;
    const get = (n) => (n.startsWith('art:') ? MV.ART.get(n.slice(4)) : MV.img(n) || MV.IMG[n]);
    const items = names.map((n) => [n, get(n)]).filter(([, c]) => c);
    let x = 10, y = 10, rowH = 0;
    const pos = items.map(([n, c]) => {
      const w = c.width * sc, h = c.height * sc;
      if (x + w > W - 10) { x = 10; y += rowH + 26; rowH = 0; }
      const r = [n, c, x, y];
      x += Math.max(w, 90) + 16; rowH = Math.max(rowH, h);
      return r;
    });
    const H = y + rowH + 30, [cv, cx] = MV.canvas(W, H);
    cx.fillStyle = '#3a3448'; cx.fillRect(0, 0, W, H);
    cx.imageSmoothingEnabled = false;
    cx.font = '12px monospace';
    for (const [n, c, px, py] of pos) {
      cx.fillStyle = '#26222e'; cx.fillRect(px - 2, py - 2, c.width * sc + 4, c.height * sc + 4);
      cx.drawImage(c, px, py, c.width * sc, c.height * sc);
      cx.fillStyle = '#e8e4f0'; cx.fillText(`${n} ${c.width}x${c.height}`, px, py + c.height * sc + 14);
    }
    return cv.toDataURL();
  }, [names, sc]);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log(out);
  await b.close();
})();
