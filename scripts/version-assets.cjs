// Keep browser caches from mixing scripts from different prototype revisions.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'admin.html'];
const sources = new Map(pages.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const references = /((?:src|href)=["'])([^"']+)(["'])/g;
const assets = new Set();
const localAsset = url => {
  if (/^(?:[a-z]+:|\/\/)/i.test(url)) return null;
  const file = url.split('?')[0];
  return /\.(?:jsx|js|css)$/.test(file) ? file : null;
};
const hash = crypto.createHash('sha256');
for (const [file, html] of sources) {
  const canonical = html.replace(references, (match, prefix, url, suffix) => {
    const asset = localAsset(url);
    if (!asset) return match;
    assets.add(asset);
    return prefix + asset + suffix;
  });
  hash.update(file + '\0' + canonical + '\0');
}
for (const file of [...assets].sort()) {
  hash.update(file + '\0');
  hash.update(fs.readFileSync(path.join(root, file)));
}
const revision = hash.digest('hex').slice(0, 12);
for (const [file, html] of sources) {
  const updated = html.replace(references, (match, prefix, url, suffix) => {
    const asset = localAsset(url);
    return asset ? prefix + asset + '?v=' + revision + suffix : match;
  });
  if (updated !== html) fs.writeFileSync(path.join(root, file), updated);
}
console.log('Recursos locais versionados: ' + revision);
