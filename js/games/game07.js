/* Game 7 — Dengarkan: dengarkan audio lalu pilih jawaban yang benar.
 * Teks audio ditampilkan setelah menjawab (atau langsung, bila perangkat tidak bisa bersuara).
 * Soal: { type: "listen_choose", audio, options, answer, image? } */
(function () {
  'use strict';
  var K = WK.Kit;
  var T = K.timers();
  var opts = null;
  var textBox = null;

  function showText(q) {
    if (!textBox) return;
    textBox.textContent = q.audio;
    textBox.classList.add('shown');
  }

  function mount(q, ctx) {
    var wrap = K.el('div', 'g-listen');
    var speaker = K.el('button', 'big-speaker');
    speaker.type = 'button';
    speaker.setAttribute('aria-label', 'Putar suara');
    speaker.appendChild(K.el('span', 'spk-icon', '🔊'));
    speaker.appendChild(K.el('span', 'spk-label display', 'Dengarkan'));
    speaker.addEventListener('click', function () {
      ctx.say(q.audio);
      K.pulse(speaker);
    });
    wrap.appendChild(speaker);

    textBox = K.el('p', 'listen-text', '• • •');
    textBox.lang = 'en';
    wrap.appendChild(textBox);
    if (!K.canSpeak()) {
      showText(q);
      wrap.appendChild(K.el('p', 'note-small', 'Suara belum aktif di perangkat ini, jadi teksnya ditampilkan.'));
    }

    wrap.appendChild(K.el('p', 'q-instr', q.prompt || 'Apa yang kamu dengar?'));
    opts = K.options(q, ctx, {
      cls: (q.options || []).some(function (o) { return o.length > 14; }) ? 'long' : '',
      speak: false,
      onPick: function (o, b, ok) { if (ok) showText(q); }
    });
    wrap.appendChild(opts.el);
    ctx.el.appendChild(wrap);
    T.set(function () { ctx.say(q.audio); }, 350);
  }

  function hint(q, ctx) {
    K.disableWrong(opts.buttons);
    T.set(function () { ctx.say(q.audio, { rate: 0.7 }); }, 300);
  }

  function reveal(q, ctx) {
    K.revealAnswer(opts.buttons, q.answer);
    showText(q);
    ctx.say(q.audio);
  }

  function unmount() { T.clear(); opts = null; textBox = null; }

  WK.Games.register(7, { mount: mount, hint: hint, reveal: reveal, unmount: unmount });
})();
