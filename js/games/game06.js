/* Game 6 — Memory Card: ingat kartu kata, lalu buka kartu yang cocok dengan gambar.
 * Kata diucapkan saat kartu dibuka.
 * Soal: { type: "memory_card", image, options: [kata…], answer, audio } */
(function () {
  'use strict';
  var K = WK.Kit;
  var T = K.timers();
  var cards = [];
  var peeking = false;
  var info = null;

  var PEEK_MS = 2600;

  function setAll(open) {
    cards.forEach(function (c) { if (!c.classList.contains('matched')) c.classList.toggle('open', open); });
  }

  function peek(ms, done) {
    peeking = true;
    setAll(true);
    info.textContent = 'Ingat-ingat kartunya…';
    T.set(function () {
      setAll(false);
      peeking = false;
      info.textContent = 'Buka kartu yang cocok dengan gambar!';
      if (done) done();
    }, ms);
  }

  function mount(q, ctx) {
    var wrap = K.el('div', 'g-memory');
    var target = K.el('div', 'mem-target');
    target.appendChild(K.image(q.image));
    wrap.appendChild(target);
    info = K.el('p', 'q-instr', '');
    wrap.appendChild(info);

    var grid = K.el('div', 'mem-grid n' + (q.options || []).length);
    cards = K.shuffle(q.options || []).map(function (word) {
      var c = K.el('button', 'mem-card');
      c.type = 'button';
      c.dataset.value = word;
      c.setAttribute('aria-label', 'Kartu tertutup');
      var inner = K.el('span', 'mem-inner');
      inner.appendChild(K.el('span', 'mem-back', '★'));
      var front = K.el('span', 'mem-front', word);
      front.lang = 'en';
      inner.appendChild(front);
      c.appendChild(inner);
      c.addEventListener('click', function () {
        if (peeking || ctx.locked() || c.classList.contains('open')) return;
        c.classList.add('open');
        c.setAttribute('aria-label', word);
        ctx.say(word);
        var ok = word === q.answer;
        if (ok) c.classList.add('matched');
        else T.set(function () { c.classList.remove('open'); c.setAttribute('aria-label', 'Kartu tertutup'); }, 1100);
        ctx.submit(ok);
      });
      grid.appendChild(c);
      return c;
    });
    wrap.appendChild(grid);
    ctx.el.appendChild(wrap);
    peek(PEEK_MS);
  }

  // Petunjuk: intip semua kartu sekali lagi.
  function hint() { T.set(function () { peek(1600); }, 1150); }

  function reveal(q, ctx) {
    cards.forEach(function (c) {
      if (c.dataset.value === q.answer) c.classList.add('open', 'matched', 'reveal');
    });
    ctx.say(q.answer);
  }

  function unmount() { T.clear(); cards = []; peeking = false; info = null; }

  WK.Games.register(6, { mount: mount, hint: hint, reveal: reveal, unmount: unmount });
})();
