/* emoji.js — tampilkan semua emoji sebagai gambar 2D yang seragam (assets/emoji/<kode>.svg,
 * set Fluent Emoji Flat). Tanpa ini, tiap HP menggambar emoji dengan gayanya sendiri.
 * Teks yang ditambahkan ke halaman dipindai otomatis (MutationObserver), jadi modul lain
 * cukup menulis emoji biasa. Jika file gambar tidak ada, emoji teks aslinya dipakai lagi. */
(function () {
  'use strict';

  var RE = /\p{Extended_Pictographic}/u;
  var TEST = /\p{Extended_Pictographic}/u;
  var seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, TITLE: 1, OPTION: 1 };

  function code(g) {
    var out = [];
    for (var i = 0; i < g.length; i++) {
      var cp = g.codePointAt(i);
      if (cp > 0xffff) i++;
      if (cp !== 0xfe0f) out.push(cp.toString(16));
    }
    return out.join('-');
  }

  function graphemes(text) {
    if (seg) return Array.from(seg.segment(text), function (s) { return s.segment; });
    return Array.from(text);
  }

  function img(g) {
    var im = document.createElement('img');
    im.className = 'emo';
    im.src = 'assets/emoji/' + code(g) + '.svg';
    im.alt = g;
    im.draggable = false;
    im.setAttribute('aria-hidden', 'true');
    im.onerror = function () { im.replaceWith(document.createTextNode(g)); };
    return im;
  }

  function convertText(node) {
    var text = node.nodeValue;
    if (!text || !TEST.test(text)) return;
    var p = node.parentNode;
    if (!p || SKIP[p.nodeName] || (p.closest && p.closest('[data-raw-emoji]'))) return;
    var frag = document.createDocumentFragment();
    var buf = '';
    graphemes(text).forEach(function (g) {
      if (RE.test(g)) {
        if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ''; }
        frag.appendChild(img(g));
      } else buf += g;
    });
    if (buf) frag.appendChild(document.createTextNode(buf));
    p.replaceChild(frag, node);
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { convertText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var list = [];
    while (walker.nextNode()) list.push(walker.currentNode);
    list.forEach(convertText);
  }

  function start() {
    scan(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'characterData') convertText(m.target);
        else m.addedNodes.forEach(scan);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (!TEST.test('🍎')) return; // browser lama: biarkan emoji teks
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);

  window.WK = window.WK || {};
  window.WK.Emoji = { scan: scan, code: code };
})();
