/* Game 4 — Kalimat Rumpang: isi kata yang hilang. Kalimat lengkap diucapkan.
 * Soal: { type: "fill_blank", prompt: "I ___ apples.", options, answer, audio: "I like apples.", image? } */
(function () {
  'use strict';
  var K = WK.Kit;
  var T = K.timers();
  var opts = null;
  var blank = null;

  function mount(q, ctx) {
    var wrap = K.el('div', 'g-fill');
    if (q.image) wrap.appendChild(K.image(q.image, 'small'));

    var sentence = K.el('p', 'sentence');
    sentence.lang = 'en';
    var parts = String(q.prompt).split('___');
    blank = K.el('span', 'blank', '?');
    sentence.appendChild(document.createTextNode(parts[0] || ''));
    sentence.appendChild(blank);
    sentence.appendChild(document.createTextNode(parts.slice(1).join('___')));
    wrap.appendChild(sentence);
    wrap.appendChild(K.el('p', 'q-instr', 'Pilih kata yang tepat.'));

    opts = K.options(q, ctx, {
      speak: false,
      onPick: function (opt, b, ok) {
        blank.textContent = opt;
        blank.className = 'blank filled ' + (ok ? 'good' : 'bad');
        if (ok) ctx.say(q.audio || String(q.prompt).replace('___', opt));
        else T.set(function () { if (blank) { blank.textContent = '?'; blank.className = 'blank'; } }, 900);
      }
    });
    wrap.appendChild(opts.el);
    ctx.el.appendChild(wrap);
    T.set(function () { ctx.say(blanked(q)); }, 350);
  }

  // Kalimat dengan jeda di tempat kata yang hilang (tidak membocorkan jawaban).
  function blanked(q) { return String(q.prompt).replace(/___/g, '…'); }

  // Petunjuk: pilihan salah dinonaktifkan dan kalimat lengkap diucapkan.
  function hint(q, ctx) {
    K.disableWrong(opts.buttons);
    K.pulse(blank);
    if (q.audio) ctx.say(q.audio);
  }

  function reveal(q, ctx) {
    T.clear();
    K.revealAnswer(opts.buttons, q.answer);
    blank.textContent = q.answer;
    blank.className = 'blank filled good';
    if (q.audio) ctx.say(q.audio);
  }

  function unmount() { T.clear(); opts = null; blank = null; }

  WK.Games.register(4, { mount: mount, hint: hint, reveal: reveal, unmount: unmount, replayText: blanked });
})();
