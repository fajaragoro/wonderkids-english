/* games/choice.js — modul generik "pilih jawaban" (cadangan untuk game tanpa modul sendiri).
 * Soal: { prompt, image, options, answer, audio }. */
(function () {
  'use strict';
  var K = WK.Kit;
  var opts = null;

  function mount(q, ctx) {
    var wrap = K.el('div', 'choice');
    if (q.image) wrap.appendChild(K.image(q.image));
    if (q.prompt) wrap.appendChild(K.el('p', 'q-prompt', q.prompt));
    opts = K.options(q, ctx);
    wrap.appendChild(opts.el);
    ctx.el.appendChild(wrap);
  }

  function hint(q, ctx) {
    K.disableWrong(opts.buttons);
    K.pulse(ctx.el.querySelector('.q-image'));
    if (q.audio) ctx.say(q.audio);
  }

  function reveal(q, ctx) { K.revealAnswer(opts.buttons, q.answer); ctx.say(q.answer); }
  function unmount() { opts = null; }

  WK.Games.register('choice', { mount: mount, hint: hint, reveal: reveal, unmount: unmount });
})();
