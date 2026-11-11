/* Buat assets/emoji/<kode>.svg dari set Fluent Emoji Flat (MIT, Microsoft) untuk SEMUA emoji
 * yang dipakai di data/*.json, js/**, dan index.html. Jalankan setelah menambah emoji baru:
 *   cd tools/emoji && npm install && node build.js
 * Emoji berwajah ditolak (aturan faceless) — lihat DENY di tools/content/build.py. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'assets/emoji');
const icons = require('@iconify-json/fluent-emoji-flat/icons.json');
const chars = require('@iconify-json/fluent-emoji-flat/chars.json');
const emoRe = /\p{Extended_Pictographic}/u;
const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });

function files(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? files(p, ext) : ext.some(e => p.endsWith(e)) ? [p] : [];
  });
}
// Kode file: titik kode heksadesimal tanpa FE0F, dipisah '-' (sama dengan js/emoji.js).
function code(g) {
  return [...g].map(c => c.codePointAt(0).toString(16)).filter(h => h !== 'fe0f').join('-');
}

const used = new Set();
const srcs = files(path.join(ROOT, 'data'), ['.json'])
  .concat(files(path.join(ROOT, 'js'), ['.js']), [path.join(ROOT, 'index.html')]);
for (const f of srcs) {
  for (const { segment } of seg.segment(fs.readFileSync(f, 'utf8'))) {
    if (emoRe.test(segment)) used.add(segment);
  }
}

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));
// Penyesuaian faceless: bagian yang bisa terbaca seperti wajah dibuang.
// 1f941 drum: ujung dua stik di tengah membran tampak seperti mata -> stik dihapus.
const STRIP = { '1f941': [/<path fill="#f3c07b"[^>]*\/>/g, /<path fill="#f3ad61"[^>]*\/>/g] };
const missing = [];
for (const g of used) {
  const c = code(g);
  const name = chars[c] || chars[c.split('-')[0]];
  const ic = name && icons.icons[name];
  if (!ic) { missing.push(g + ' ' + c); continue; }
  let body = ic.body;
  for (const re of STRIP[c] || []) body = body.replace(re, '');
  const w = ic.width || icons.width || 32, h = ic.height || icons.height || 32;
  fs.writeFileSync(path.join(OUT, c + '.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>\n`);
}
console.log('emoji:', used.size, 'svg:', used.size - missing.length, 'tidak ada:', missing.join(', ') || '-');
