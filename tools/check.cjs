// Validate the battle choreography: no bullet touches the soul unless meant.
// Usage: node tools/check.cjs [t0 | b<bar>] [t1 | b<bar>]
const { chromium, pageUrl, SWIFT } = require('./pw.cjs');
(async () => {
  const [a = 'b0', b = 'b74'] = process.argv.slice(2);
  const browser = await chromium.launch({ args: SWIFT });
  const page = await browser.newPage({ viewport: { width: 320, height: 180 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(pageUrl('?render=1&w=320&h=180'));
  await page.waitForFunction(() => window.MV && (window.MV.ready || window.MV.failed), null, { timeout: 120000 });
  const failed = await page.evaluate(() => window.MV.failed);
  if (failed) { console.log('[failed]', failed); await browser.close(); process.exit(1); }
  const hits = await page.evaluate(([a, b]) => {
    const T = window.MV.T, tt = (s) => (s[0] === 'b' ? T.at(+s.slice(1)) : +s);
    return window.MV.checkHits(tt(a), tt(b));
  }, [a, b]);
  console.log(hits.length ? `${hits.length} collisions` : 'OK: no collisions');
  for (const h of hits.slice(0, 60)) console.log(JSON.stringify(h));
  await browser.close();
})();
