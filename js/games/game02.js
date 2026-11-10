/* Game 2 — Susun Huruf: susun huruf acak menjadi kata. Kata diucapkan saat selesai.
 * Soal: { type: "spell_letters", image, answer, options: [huruf pengecoh opsional], audio } */
(function () {
  'use strict';
  var K = WK.Kit;
  var s = null; // { slots: [{el, tile, locked}], tiles: [el], answer }

  function letters(word) { return word.split(''); }

  function mount(q, ctx) {
    var answer = String(q.answer);
    var wrap = K.el('div', 'g-spell');
    if (q.image) wrap.appendChild(K.image(q.image));
    wrap.appendChild(K.el('p', 'q-instr', q.prompt || 'Susun hurufnya!'));

    var row = K.el('div', 'slots');
    var tray = K.el('div', 'tray');
    s = { slots: [], tiles: [], answer: answer, ctx: ctx, q: q };

    letters(answer).forEach(function (ch) {
      if (ch === ' ') { row.appendChild(K.el('span', 'slot-gap')); return; }
      var slot = K.el('button', 'slot');
      slot.type = 'button';
      slot.setAttribute('aria-label', 'Kotak huruf');
      var rec = { el: slot, tile: null, locked: false, ch: ch };
      slot.addEventListener('click', function () {
        if (ctx.locked() || rec.locked || !rec.tile) return;
        returnTile(rec);
      });
      s.slots.push(rec);
      row.appendChild(slot);
    });

    var pool = letters(answer.replace(/ /g, '')).concat((q.options || []).filter(function (x) { return x && x.length === 1; }));
    var shuffled = K.shuffle(pool);
    // Hindari urutan acak yang kebetulan sudah benar.
    if (shuffled.join('') === pool.join('') && pool.length > 1) shuffled.push(shuffled.shift());
    shuffled.forEach(function (ch) {
      var t = K.el('button', 'tile-letter', ch);
      t.type = 'button';
      t.dataset.ch = ch;
      t.addEventListener('click', function () {
        if (ctx.locked() || t.classList.contains('used')) return;
        placeTile(t);
      });
      s.tiles.push(t);
      tray.appendChild(t);
    });

    wrap.appendChild(row);
    wrap.appendChild(tray);
    ctx.el.appendChild(wrap);
  }

  function placeTile(t) {
    var rec = s.slots.filter(function (r) { return !r.tile; })[0];
    if (!rec) return;
    rec.tile = t;
    rec.el.textContent = t.dataset.ch;
    rec.el.classList.add('filled');
    t.classList.add('used');
    t.disabled = true;
    if (s.slots.every(function (r) { return r.tile; })) check();
  }

  function returnTile(rec) {
    rec.tile.classList.remove('used');
    rec.tile.disabled = false;
    rec.tile = null;
    rec.el.textContent = '';
    rec.el.classList.remove('filled', 'bad');
  }

  function check() {
    var word = s.slots.map(function (r) { return r.tile.dataset.ch; }).join('');
    var target = s.answer.replace(/ /g, '');
    var ok = word === target;
    s.slots.forEach(function (r) { r.el.classList.add(ok ? 'good' : 'bad'); });
    if (ok) s.ctx.say(s.q.audio || s.answer);
    s.ctx.submit(ok);
  }

  // Petunjuk: kosongkan kotak, kunci huruf berikutnya yang benar di tempatnya.
  function hint() {
    s.slots.forEach(function (r) { if (!r.locked && r.tile) returnTile(r); r.el.classList.remove('bad'); });
    var rec = s.slots.filter(function (r) { return !r.locked; })[0];
    if (!rec) return;
    var tile = s.tiles.filter(function (t) { return !t.classList.contains('used') && t.dataset.ch === rec.ch; })[0];
    if (!tile) return;
    rec.tile = tile;
    rec.locked = true;
    rec.el.textContent = rec.ch;
    rec.el.classList.add('filled', 'locked');
    tile.classList.add('used');
    tile.disabled = true;
    s.ctx.say(s.q.audio || s.answer);
  }

  function reveal() {
    s.slots.forEach(function (r) {
      r.el.textContent = r.ch;
      r.el.classList.remove('bad');
      r.el.classList.add('filled', 'good');
    });
    s.tiles.forEach(function (t) { t.disabled = true; t.classList.add('used'); });
    s.ctx.say(s.q.audio || s.answer);
  }

  WK.Games.register(2, { mount: mount, hint: hint, reveal: reveal, unmount: function () { s = null; } });
})();
