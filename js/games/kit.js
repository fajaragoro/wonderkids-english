/* games/kit.js — helper bersama untuk modul game. */
(function () {
  'use strict';

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function graphemes(str) {
    if (window.Intl && Intl.Segmenter) {
      var n = 0;
      for (var it = new Intl.Segmenter().segment(str)[Symbol.iterator](), r = it.next(); !r.done; r = it.next()) n++;
      return n;
    }
    return Array.from(str.replace(/\uFE0F/g, '')).length;
  }

  // Gambar soal: emoji atau nama file di assets/images/.
  function image(src, cls) {
    var box = el('div', 'q-image' + (cls ? ' ' + cls : ''));
    if (!src) return box;
    if (/\.(svg|png|webp|jpe?g)$/i.test(src)) {
      var im = el('img');
      im.src = 'assets/images/' + src;
      im.alt = '';
      box.appendChild(im);
    } else {
      box.textContent = src;
      var n = graphemes(src);
      if (n > 1) { box.classList.add('multi'); if (n > 2) box.classList.add('many'); }
    }
    box.setAttribute('aria-hidden', 'true');
    return box;
  }

  function pulse(node) {
    if (!node) return;
    node.classList.remove('pulse');
    void node.offsetWidth;
    node.classList.add('pulse');
  }

  // Tombol pilihan standar. onPick(opt, btn) dipanggil sebelum ctx.submit.
  function options(q, ctx, opts) {
    opts = opts || {};
    var grid = el('div', 'options' + (opts.cls ? ' ' + opts.cls : ''));
    var list = opts.keepOrder ? (q.options || []) : shuffle(q.options || []);
    var buttons = list.map(function (opt) {
      var b = el('button', 'opt', opt);
      b.type = 'button';
      b.dataset.value = opt;
      b.addEventListener('click', function () {
        if (ctx.locked() || b.disabled) return;
        var ok = opt === q.answer;
        b.classList.add(ok ? 'right' : 'wrong');
        if (opts.onPick) opts.onPick(opt, b, ok);
        if (opts.speak !== false) ctx.say(opt);
        ctx.submit(ok);
      });
      grid.appendChild(b);
      return b;
    });
    return { el: grid, buttons: buttons };
  }

  function disableWrong(buttons) {
    buttons.forEach(function (b) { if (b.classList.contains('wrong')) b.disabled = true; });
  }

  function revealAnswer(buttons, answer) {
    buttons.forEach(function (b) {
      b.disabled = true;
      if (b.dataset.value === answer) b.classList.add('right', 'reveal');
    });
  }

  // Timer yang otomatis dibatalkan saat soal berganti.
  function timers() {
    var ids = [];
    return {
      set: function (fn, ms) { var id = setTimeout(fn, ms); ids.push(id); return id; },
      every: function (fn, ms) { var id = setInterval(fn, ms); ids.push(id); return id; },
      clear: function () { ids.forEach(function (id) { clearTimeout(id); clearInterval(id); }); ids = []; }
    };
  }

  function speakBtn(label, onClick) {
    var b = el('button', 'btn small sky speak-btn');
    b.type = 'button';
    b.textContent = '🔊 ' + (label || 'Dengarkan');
    b.addEventListener('click', onClick);
    return b;
  }

  // Apakah perangkat bisa mengucapkan teks (Tahap 6 menyediakan WK.Speech).
  function canSpeak() { return !!(WK.Speech && WK.Speech.canSpeak && WK.Speech.canSpeak()); }

  window.WK.Kit = {
    shuffle: shuffle, el: el, image: image, pulse: pulse, options: options,
    disableWrong: disableWrong, revealAnswer: revealAnswer, timers: timers,
    speakBtn: speakBtn, canSpeak: canSpeak
  };
})();
