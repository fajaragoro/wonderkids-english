/* Game 3 — Tebak Gambar: gambar tertutup ubin yang terbuka sedikit demi sedikit, ditambah petunjuk.
 * Kata diucapkan sebagai petunjuk (setelah salah pertama).
 * Soal: { type: "guess_image", image, prompt: "petunjuk", options, answer, audio } */
(function () {
  'use strict';
  var K = WK.Kit;
  var T = K.timers();
  var opts = null;
  var covers = [];

  var START_OPEN = 2;   // ubin terbuka di awal
  var MAX_AUTO = 6;     // ubin yang terbuka otomatis (dari 9)

  function openOne() {
    var closed = covers.filter(function (c) { return !c.classList.contains('open'); });
    if (!closed.length) return;
    closed[Math.floor(Math.random() * closed.length)].classList.add('open');
  }

  function openAll() { covers.forEach(function (c) { c.classList.add('open'); }); }

  function mount(q, ctx) {
    var wrap = K.el('div', 'g-guess');
    var frame = K.el('div', 'guess-frame');
    frame.appendChild(K.image(q.image));
    var grid = K.el('div', 'guess-cover');
    grid.setAttribute('aria-hidden', 'true');
    covers = [];
    for (var i = 0; i < 9; i++) {
      var c = K.el('span', 'cover', '?');
      covers.push(c);
      grid.appendChild(c);
    }
    frame.appendChild(grid);
    wrap.appendChild(frame);

    if (q.prompt) {
      var clue = K.el('p', 'clue');
      clue.appendChild(K.el('span', 'clue-tag', 'Petunjuk'));
      clue.appendChild(K.el('span', 'clue-text', q.prompt));
      clue.lang = 'en';
      wrap.appendChild(clue);
    }

    opts = K.options(q, ctx, { onPick: function (o, b, ok) { if (ok) openAll(); } });
    wrap.appendChild(opts.el);
    ctx.el.appendChild(wrap);

    if (q.prompt) T.set(function () { ctx.say(q.prompt); }, 350);
    for (var k = 0; k < START_OPEN; k++) openOne();
    var opened = START_OPEN;
    T.every(function () {
      if (opened >= MAX_AUTO) return;
      openOne();
      opened++;
    }, 1800);
  }

  function hint(q, ctx) {
    K.disableWrong(opts.buttons);
    openOne(); openOne();
    ctx.say(q.audio || q.answer);
  }

  function reveal(q, ctx) {
    openAll();
    K.revealAnswer(opts.buttons, q.answer);
    ctx.say(q.audio || q.answer);
  }

  function unmount() { T.clear(); opts = null; covers = []; }

  WK.Games.register(3, { mount: mount, hint: hint, reveal: reveal, unmount: unmount,
    replayText: function (q) { return q.prompt; } });
})();
