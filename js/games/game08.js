/* Game 8 — Susun Kalimat: urutkan kata acak menjadi kalimat benar. Kalimat diucapkan saat selesai.
 * Soal: { type: "arrange_words", answer: "I like apples.", options: [], audio, image? } */
(function () {
  'use strict';
  var K = WK.Kit;
  var s = null;

  function mount(q, ctx) {
    var words = String(q.answer).split(/\s+/);
    var wrap = K.el('div', 'g-arrange');
    if (q.image) wrap.appendChild(K.image(q.image, 'small'));
    wrap.appendChild(K.el('p', 'q-instr', q.prompt || 'Ketuk kata sesuai urutan.'));

    var line = K.el('div', 'arrange-line');
    line.lang = 'en';
    var bank = K.el('div', 'word-bank');
    bank.lang = 'en';
    s = { words: words, line: line, bank: bank, placed: [], locked: 0, tiles: [], ctx: ctx, q: q };

    var order = K.shuffle(words.map(function (w, i) { return i; }));
    if (order.every(function (v, i) { return v === i; }) && order.length > 1) order.push(order.shift());
    order.forEach(function (idx) {
      var t = K.el('button', 'word-tile', words[idx]);
      t.type = 'button';
      t.dataset.idx = idx;
      t.addEventListener('click', function () {
        if (ctx.locked()) return;
        if (t.parentNode === bank) place(t);
        else if (!t.classList.contains('locked')) unplace(t);
      });
      s.tiles.push(t);
      bank.appendChild(t);
    });

    wrap.appendChild(line);
    wrap.appendChild(bank);
    ctx.el.appendChild(wrap);
  }

  function place(t) {
    s.line.appendChild(t);
    s.placed.push(t);
    s.ctx.say(t.textContent);
    if (s.placed.length === s.words.length) check();
  }

  function unplace(t) {
    s.placed.splice(s.placed.indexOf(t), 1);
    t.classList.remove('bad');
    s.bank.appendChild(t);
  }

  function check() {
    var sentence = s.placed.map(function (t) { return t.textContent; }).join(' ');
    var ok = sentence === s.words.join(' ');
    s.placed.forEach(function (t) { t.classList.add(ok ? 'good' : 'bad'); });
    if (ok) s.ctx.say(s.q.audio || s.q.answer);
    s.ctx.submit(ok);
  }

  // Petunjuk: semua kata kembali, kata pertama yang belum terkunci dikunci di tempatnya.
  function hint() {
    s.placed.slice(s.locked).forEach(unplace);
    s.placed = s.placed.slice(0, s.locked);
    var nextIdx = s.locked;
    var tile = s.tiles.filter(function (t) {
      return t.parentNode === s.bank && t.textContent === s.words[nextIdx];
    })[0];
    if (!tile) return;
    s.line.appendChild(tile);
    s.placed.push(tile);
    tile.classList.add('locked');
    s.locked++;
    s.ctx.say(s.q.audio || s.q.answer);
  }

  function reveal() {
    s.line.textContent = '';
    s.bank.textContent = '';
    s.words.forEach(function (w) {
      var t = K.el('span', 'word-tile good', w);
      s.line.appendChild(t);
    });
    s.ctx.say(s.q.audio || s.q.answer);
  }

  WK.Games.register(8, { mount: mount, hint: hint, reveal: reveal, unmount: function () { s = null; } });
})();
