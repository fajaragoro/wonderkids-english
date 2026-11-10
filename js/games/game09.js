/* Game 9 — Kejar Bintang: avatar berlari; saat ada rintangan, jawab soal untuk melompat.
 * Soal campuran: { type: "runner", prompt, image?, options, answer, audio } */
(function () {
  'use strict';
  var K = WK.Kit;
  var T = K.timers();
  var s = null;

  var OBSTACLES = ['📦', '🪵', '🚧', '🧱', '🌵'];
  var collected = 0; // bintang terkumpul selama satu stage (direset saat stage baru)
  var lastStage = null;

  function mount(q, ctx) {
    var wrap = K.el('div', 'g-runner');

    var scene = K.el('div', 'run-scene running');
    scene.setAttribute('aria-hidden', 'true');
    scene.appendChild(K.el('span', 'run-cloud c1', '☁️'));
    scene.appendChild(K.el('span', 'run-cloud c2', '☁️'));
    var ground = K.el('div', 'run-ground');
    scene.appendChild(ground);
    var runner = WK.Avatar.create(WK.Avatar.normalize(WK.Storage.getAvatar(), WK.Storage.getUnlockedItems()), 'run-me');
    scene.appendChild(runner);
    var obstacle = K.el('span', 'run-obstacle', OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)]);
    scene.appendChild(obstacle);
    var star = K.el('span', 'run-star', '⭐');
    scene.appendChild(star);
    var count = K.el('span', 'run-count display', '⭐ ' + collected);
    scene.appendChild(count);
    wrap.appendChild(scene);

    var card = K.el('div', 'run-card');
    card.hidden = true;
    if (q.image) card.appendChild(K.image(q.image, 'small'));
    if (q.prompt) {
      var p = K.el('p', 'q-prompt', q.prompt);
      p.lang = 'en';
      card.appendChild(p);
    }
    var opts = K.options(q, ctx, {
      onPick: function (o, b, ok) {
        if (ok) {
          scene.classList.add('jump');
          collected++;
          T.set(function () { count.textContent = '⭐ ' + collected; }, 450);
        } else {
          scene.classList.remove('bump');
          void scene.offsetWidth;
          scene.classList.add('bump');
        }
      }
    });
    card.appendChild(opts.el);
    wrap.appendChild(card);
    ctx.el.appendChild(wrap);

    s = { scene: scene, card: card, opts: opts, ctx: ctx };

    // Lari dulu; rintangan mendekat lalu soal muncul.
    ctx.lock();
    T.set(function () {
      scene.classList.remove('running');
      scene.classList.add('stopped');
      card.hidden = false;
      ctx.unlock();
      if (q.audio) ctx.say(q.audio);
    }, 1500);
  }

  function hint(q, ctx) {
    K.disableWrong(s.opts.buttons);
    if (q.audio) ctx.say(q.audio);
  }

  function reveal(q, ctx) {
    K.revealAnswer(s.opts.buttons, q.answer);
    ctx.say(q.answer);
  }

  function unmount() { T.clear(); s = null; }

  // Bintang kejar dihitung ulang tiap stage dimulai.
  WK.Games.register(9, {
    mount: function (q, ctx) {
      var key = ctx.tier + '-' + ctx.game + '-' + ctx.stage + '-' + ctx.runId;
      if (lastStage !== key) { collected = 0; lastStage = key; }
      mount(q, ctx);
    },
    hint: hint, reveal: reveal, unmount: unmount
  });
})();
