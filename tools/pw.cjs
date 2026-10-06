// Playwright for offline frames / export. `npm i` in this repo, or a global install.
const path = require('path');
try {
  module.exports = require('playwright');
} catch (e) {
  console.error('Playwright is required for export and checks: npm i');
  throw e;
}
// file:// URL of index.html with query (forward slashes on Windows)
module.exports.pageUrl = (query) => 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/').replace(/^\//, '') + query;
module.exports.SWIFT = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'];
module.exports.GPU = ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--allow-file-access-from-files'];
