/* Game 1 — Pasangkan: cocokkan gambar dengan kata. Kata diucapkan saat dipilih.
 * Soal: { type: "match_image", image, options: [kata…], answer, audio } */
(function () {
  'use strict';
  var K = WK.Kit;
  var opts = null;

  function mount(q, ctx) {
    var wrap = K.el('div', 'g-match');
    var pic = K.el('div', 'match-pic');
    pic.appendChild(K.image(q.image));
    pic.appendChild(K.el('span', 'match-q display', '?'));
    wrap.appendChild(pic);
    wrap.appendChild(K.el('p', 'q-instr', q.prompt || 'Gambar apa ini? Pilih katanya.'));
    opts = K.options(q, ctx, {
      cls: 'cards',
      onPick: function (opt, b, ok) {
        if (ok) pic.querySelector('.match-q').textContent = opt;
      }
    });
    wrap.appendChild(opts.el);
    ctx.el.appendChild(wrap);
  }

  function hint(q, ctx) {
    K.disableWrong(opts.buttons);
    K.pulse(ctx.el.querySelector('.q-image'));
    ctx.say(q.audio || q.answer);
  }

  function reveal(q, ctx) {
    K.revealAnswer(opts.buttons, q.answer);
    ctx.el.querySelector('.match-q').textContent = q.answer;
    ctx.say(q.answer);
  }

  WK.Games.register(1, { mount: mount, hint: hint, reveal: reveal, unmount: function () { opts = null; } });
})();
