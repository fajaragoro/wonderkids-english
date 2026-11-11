/* Game 5 — Pop Balon: pecahkan balon yang berisi arti yang benar. Kata diucapkan saat balon pecah.
 * Soal: { type: "pop_balloon", prompt: "apple", options: ["apel", "pisang", "mobil"], answer: "apel", audio: "apple", image? } */
(function () {
  'use strict';
  var K = WK.Kit;
  var T = K.timers();
  var balloons = [];

  var COLORS = ['#ff5c93', '#52c4ff', '#ffd23f', '#38cf8a', '#8f6bff', '#ff9345'];

  function mount(q, ctx) {
    var wrap = K.el('div', 'g-balloon');
    var head = K.el('div', 'balloon-word');
    if (q.image) head.appendChild(K.image(q.image, 'tiny'));
    var word = K.el('p', 'big-word display', q.prompt);
    word.lang = 'en';
    head.appendChild(word);
    wrap.appendChild(head);
    wrap.appendChild(K.el('p', 'q-instr', 'Pecahkan balon yang berisi artinya!'));

    var sky = K.el('div', 'balloon-sky n' + (q.options || []).length);
    var list = K.shuffle(q.options || []);
    balloons = list.map(function (opt, i) {
      var b = K.el('button', 'balloon');
      b.type = 'button';
      b.dataset.value = opt;
      b.style.setProperty('--bc', COLORS[i % COLORS.length]);
      b.style.setProperty('--delay', (i * 0.35) + 's');
      b.style.setProperty('--dur', (2.6 + (i % 3) * 0.5) + 's');
      var longest = opt.split(' ').reduce(function (m, w) { return Math.max(m, w.length); }, 0);
      b.appendChild(K.el('span', 'balloon-text' + (longest > 8 ? ' xlong' : longest > 6 ? ' long' : ''), opt));
      b.appendChild(K.el('span', 'balloon-string'));
      b.addEventListener('click', function () {
        if (ctx.locked() || b.disabled) return;
        var ok = opt === q.answer;
        if (ok) {
          b.classList.add('popped');
          ctx.say(q.audio || q.prompt);
        } else {
          b.classList.add('wrong');
        }
        ctx.submit(ok);
      });
      sky.appendChild(b);
      return b;
    });
    wrap.appendChild(sky);
    ctx.el.appendChild(wrap);
    T.set(function () { ctx.say(q.audio || q.prompt); }, 300);
  }

  // Petunjuk: balon salah terbang pergi, kata diucapkan lagi.
  function hint(q, ctx) {
    balloons.forEach(function (b) { if (b.classList.contains('wrong')) { b.disabled = true; b.classList.add('away'); } });
    ctx.say(q.audio || q.prompt);
  }

  function reveal(q, ctx) {
    balloons.forEach(function (b) {
      b.disabled = true;
      if (b.dataset.value === q.answer) b.classList.add('glow');
      else b.classList.add('away');
    });
    ctx.say(q.audio || q.prompt);
  }

  function unmount() { T.clear(); balloons = []; }

  WK.Games.register(5, { mount: mount, hint: hint, reveal: reveal, unmount: unmount });
})();
