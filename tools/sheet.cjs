// Contact sheet: render the given times (seconds, b<bar> on music2's grid, c<bar> on music1's)
// small, tiled with their labels, into one PNG.
// Usage: node tools/sheet.cjs <out.png> <t>... [--cols=4] [--w=480] [--gpu]
const { chromium, pageUrl, SWIFT, GPU } = require('./pw.cjs');
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const opts = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
  const [out, ...ts] = args.filter((a) => !a.startsWith('--'));
  const cols = +(opts.cols || 4), w = +(opts.w || 480), h = Math.round(w * 9 / 16);
  const browser = await chromium.launch({ args: opts.gpu ? GPU : SWIFT });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text()); });
  await page.goto(pageUrl(`?render=1&w=960&h=540`));
  await page.waitForFunction(() => window.MV && (window.MV.ready || window.MV.failed), null, { timeout: 120000 });
  const failed = await page.evaluate(() => window.MV.failed);
  if (failed) { console.log('[failed]', failed); await browser.close(); process.exit(1); }
  const url = await page.evaluate(([ts, cols, w, h]) => {
    const MV = window.MV, rows = Math.ceil(ts.length / cols), [c, x] = MV.canvas(cols * w, rows * (h + 18));
    x.fillStyle = '#222'; x.fillRect(0, 0, c.width, c.height);
    x.imageSmoothingEnabled = true; x.font = '13px monospace';
    ts.forEach((s, i) => {
      const t = s[0] === 'b' ? MV.T.at(+s.slice(1)) : s[0] === 'c' ? MV.T.at1(+s.slice(1)) : +s;
      MV.renderFrame(t);
      const px = (i % cols) * w, py = Math.floor(i / cols) * (h + 18);
      x.drawImage(MV.frameCanvas(t), px, py, w, h);
      x.fillStyle = '#ddd'; x.fillText(`${s}  ${t.toFixed(2)}s`, px + 4, py + h + 13);
    });
    return c.toDataURL('image/png');
  }, [ts, cols, w, h]);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log(out);
  await browser.close();
})();
