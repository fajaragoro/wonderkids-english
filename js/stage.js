/* stage.js — engine stage: muat soal, alur salah/benar, skor, bintang, ringkasan, hadiah.
 *
 * Kontrak modul game (Tahap 5: js/games/gameXX.js mendaftar lewat WK.Games.register):
 *   WK.Games.register(gameId, {
 *     mount(q, ctx)   wajib. Gambar soal q di ctx.el. Panggil ctx.submit(true|false) saat anak menjawab.
 *     hint(q, ctx)    opsional. Petunjuk setelah salah pertama (mis. hilangkan pilihan yang salah).
 *     reveal(q, ctx)  opsional. Tampilkan jawaban benar setelah salah kedua.
 *     unmount()       opsional. Bersihkan timer/listener.
 *     replayText(q)   opsional. Teks untuk "Dengarkan lagi" bila belum ada yang diucapkan.
 *   })
 *   ctx: { el, tier, game, stage, say(text), lock(), unlock(), locked() }
 * Game tanpa modul memakai modul generik 'choice'. */
(function () {
  'use strict';

  var C = WK.Config;
  var S = WK.Storage;

  /* ================= Registri game ================= */

  var registry = {};
  WK.Games = {
    register: function (id, mod) { registry[id] = mod; },
    get: function (id) { return registry[id] || registry.choice; }
  };

  /* ================= Data soal ================= */

  var cache = {};

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function loadGame(gameId) {
    if (cache[gameId]) return Promise.resolve(cache[gameId]);
    return fetch('data/game' + pad2(gameId) + '.json', { cache: 'no-cache' })
      .then(function (r) {
        if (r.status === 404) return [];
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (list) {
        cache[gameId] = Array.isArray(list) ? list : [];
        return cache[gameId];
      });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Ambil soal stage. Jika belum lengkap (data contoh), pakai soal tingkat yang sama, lalu soal game mana pun.
  function pickQuestions(all, tier, stage) {
    var exact = all.filter(function (q) { return q.tier === tier && q.stage === stage; });
    var sample = false;
    var pool = exact;
    if (pool.length < C.QUESTIONS_PER_STAGE) {
      var sameTier = all.filter(function (q) { return q.tier === tier; });
      if (exact.length === 0 && sameTier.length) { pool = sameTier; sample = true; }
      else if (exact.length === 0) { pool = all; sample = all.length > 0; }
      else sample = true;
    }
    // Acak tanpa pengulangan dalam satu stage.
    return { questions: shuffle(pool).slice(0, C.QUESTIONS_PER_STAGE), sample: sample };
  }

  /* ================= Util ================= */

  var PRAISE = ['Great job!', 'Well done!', 'Awesome!', 'Excellent!', 'Super!', 'You got it!', 'Nice work!'];
  function praise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

  function say(text, opts) {
    if (WK.Speech && text) WK.Speech.say(text, opts);
  }

  function $(id) { return document.getElementById(id); }

  function confetti(host) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var colors = ['#ffd23f', '#ff5c93', '#52c4ff', '#38cf8a', '#8f6bff', '#ff9345'];
    var box = document.createElement('div');
    box.className = 'confetti';
    box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.25) + 's';
      p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      box.appendChild(p);
    }
    host.appendChild(box);
    setTimeout(function () { box.remove(); }, 1600);
  }

  /* ================= Engine ================= */

  var run = null; // stage yang sedang berjalan
  var runCounter = 0;

  function start(tier, gameId, stage, done) {
    stop();
    var token = {};
    run = {
      token: token, id: ++runCounter, tier: tier, game: gameId, stage: stage, onDone: done,
      questions: [], index: 0, correct: 0, attempts: 0, results: [], busy: false, sample: false
    };
    $('stage-title').textContent = C.game(gameId).name + ' · Stage ' + stage;
    $('q-area').textContent = '';
    $('q-area').appendChild(statusMsg('Memuat soal…'));
    $('stage-segs').textContent = '';
    $('stage-count').textContent = '';
    hideFeedback();

    loadGame(gameId).then(function (all) {
      if (!run || run.token !== token) return;
      var pick = pickQuestions(all, tier, stage);
      if (!pick.questions.length) { showEmpty(); return; }
      run.questions = pick.questions;
      run.sample = pick.sample;
      $('stage-sample').hidden = !pick.sample;
      $('stage-replay').hidden = !(WK.Speech && WK.Speech.canSpeak());
      renderSegs();
      showQuestion();
    }).catch(function () {
      if (!run || run.token !== token) return;
      $('q-area').textContent = '';
      $('q-area').appendChild(statusMsg('Soal tidak bisa dimuat. Buka game lewat server web (lihat README), lalu coba lagi.'));
    });
  }

  function statusMsg(text) {
    var p = document.createElement('p');
    p.className = 'q-status';
    p.textContent = text;
    return p;
  }

  function showEmpty() {
    var area = $('q-area');
    area.textContent = '';
    area.appendChild(statusMsg('Soal untuk game ini belum tersedia.'));
    $('stage-sample').hidden = true;
  }

  function renderSegs() {
    var segs = $('stage-segs');
    segs.textContent = '';
    run.questions.forEach(function (q, i) {
      var s = document.createElement('i');
      var r = run.results[i];
      if (r === true) s.className = 'done';
      else if (r === false) s.className = 'miss';
      else if (i === run.index) s.className = 'now';
      segs.appendChild(s);
    });
    $('stage-count').textContent = Math.min(run.index + 1, run.questions.length) + '/' + run.questions.length;
  }

  function makeCtx(q) {
    var ctx = {
      el: $('q-area'),
      tier: run.tier, game: run.game, stage: run.stage, runId: run.id,
      say: function (t, o) { if (run && t) run.lastSaid = t; say(t, o); },
      lock: function () { run.busy = true; },
      unlock: function () { run.busy = false; },
      locked: function () { return !run || run.busy; },
      submit: function (ok) { submit(q, ctx, ok); }
    };
    return ctx;
  }

  function currentModule() { return WK.Games.get(run.game); }

  function showQuestion() {
    var q = run.questions[run.index];
    run.attempts = 0;
    run.busy = false;
    run.lastSaid = null;
    hideFeedback();
    renderSegs();
    var area = $('q-area');
    area.textContent = '';
    area.classList.remove('shake');
    run.ctx = makeCtx(q);
    currentModule().mount(q, run.ctx);
  }

  function submit(q, ctx, ok) {
    if (!run || run.busy || run.ctx !== ctx) return;
    var mod = currentModule();
    run.busy = true;

    if (ok) {
      run.correct++;
      run.results[run.index] = true;
      renderSegs();
      var text = praise();
      showFeedback('good', text, null);
      say(text, { queue: true }); // setelah kata/kalimat yang diucapkan modul
      confetti($('screen-stage'));
      setTimeout(next, 1500);
      return;
    }

    run.attempts++;
    var area = $('q-area');
    area.classList.remove('shake');
    void area.offsetWidth;
    area.classList.add('shake');

    if (run.attempts === 1) {
      // Salah pertama: coba lagi dengan petunjuk.
      showFeedback('retry', 'Coba lagi, ya!', 'Lihat petunjuknya.');
      if (mod.hint) mod.hint(q, ctx);
      setTimeout(function () {
        if (run && run.ctx === ctx) { hideFeedback(); run.busy = false; }
      }, 1100);
    } else {
      // Salah kedua: tampilkan jawaban benar, lalu lanjut.
      run.results[run.index] = false;
      renderSegs();
      if (mod.reveal) mod.reveal(q, ctx);
      showFeedback('reveal', 'Jawabannya:', String(q.answer), true);
    }
  }

  function next() {
    if (!run) return;
    var mod = currentModule();
    if (mod.unmount) mod.unmount();
    run.index++;
    if (run.index >= run.questions.length) finish();
    else showQuestion();
  }

  function showFeedback(kind, title, detail, withButton) {
    var fb = $('stage-feedback');
    fb.className = 'feedback ' + kind;
    $('fb-title').textContent = title;
    $('fb-detail').textContent = detail || '';
    $('fb-detail').hidden = !detail;
    $('fb-next').hidden = !withButton;
    fb.hidden = false;
    if (withButton) $('fb-next').focus({ preventScroll: true });
  }

  function hideFeedback() { $('stage-feedback').hidden = true; }

  function stop() {
    if (run) {
      var mod = WK.Games.get(run.game);
      if (mod && mod.unmount) mod.unmount();
    }
    run = null;
  }

  /* ================= Selesai & ringkasan ================= */

  function finish() {
    var r = run;
    var P = WK.Progress;
    var total = r.questions.length;
    // Skala ke 10 soal agar aturan bintang tetap berlaku pada data contoh (<10 soal).
    var stars = C.starsFor(Math.round(r.correct * C.QUESTIONS_PER_STAGE / total));
    var before = P.stars(r.tier, r.game)[r.stage - 1];
    var wasComplete = P.isGameComplete(r.tier, r.game);
    S.setStageStars(r.tier, r.game, r.stage, stars);
    var nowComplete = P.isGameComplete(r.tier, r.game);

    // Hadiah: item avatar milik game ini, sekali saja.
    var reward = null;
    if (!wasComplete && nowComplete) {
      var item = WK.AvatarItems.rewardForGame(r.game);
      var un = S.getUnlockedItems() || [];
      if (item && un.indexOf(item.id) === -1) { S.unlockItem(item.id); reward = item; }
    }

    var summary = {
      tier: r.tier, game: r.game, stage: r.stage, correct: r.correct, total: total, stars: stars,
      best: Math.max(before, stars), improved: stars > before, previous: before, played: before > 0,
      gameJustCompleted: !wasComplete && nowComplete, reward: reward, sample: r.sample
    };
    var done = r.onDone;
    stop();
    done(summary);
  }

  var MOOD = [
    { title: 'Ayo coba lagi!', en: 'Nice try!', sub: 'Tidak apa-apa. Latihan bikin makin pintar.' },
    { title: 'Bagus!', en: 'Good job!', sub: 'Kamu dapat 1 bintang.' },
    { title: 'Hebat!', en: 'Great job!', sub: 'Kamu dapat 2 bintang.' },
    { title: 'Luar biasa!', en: 'Amazing!', sub: 'Bintang penuh!' }
  ];

  function renderSummary(sum, actions) {
    var mood = MOOD[sum.stars];
    var g = C.game(sum.game);
    $('sum-game').textContent = g.name + ' · Stage ' + sum.stage;
    $('sum-title').textContent = mood.title;
    $('sum-en').textContent = mood.en;
    $('sum-score').textContent = sum.correct + ' dari ' + sum.total + ' benar';
    $('sum-sub').textContent = mood.sub + (sum.improved && sum.previous > 0 ? ' Rekor baru!' : '');

    var mascot = $('sum-mascot');
    mascot.className = 'sum-mascot mood-' + sum.stars;

    var starsBox = $('sum-stars');
    starsBox.textContent = '';
    starsBox.setAttribute('aria-label', sum.stars + ' dari 3 bintang');
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.className = 'big-star' + (i < sum.stars ? ' on' : '');
      s.style.animationDelay = (0.25 + i * 0.3) + 's';
      s.textContent = '★';
      s.setAttribute('aria-hidden', 'true');
      starsBox.appendChild(s);
    }

    // Kabar game terbuka
    var unlockNote = $('sum-unlock');
    if (sum.gameJustCompleted) {
      unlockNote.hidden = false;
      unlockNote.textContent = sum.game < C.GAMES.length
        ? '🎉 Game ' + (sum.game + 1) + ': ' + C.game(sum.game + 1).name + ' terbuka!'
        : '🏆 Semua game di tingkat ini selesai!';
    } else unlockNote.hidden = true;

    // Hadiah item avatar
    var rewardBox = $('sum-reward');
    if (sum.reward) {
      rewardBox.hidden = false;
      $('sum-reward-name').textContent = sum.reward.name;
      var av = WK.Avatar.normalize(S.getAvatar(), S.getUnlockedItems());
      var preview = Object.assign({}, av);
      preview[sum.reward.cat] = sum.reward.id;
      if (sum.reward.cat === 'accessory' && sum.reward.head && !sum.reward.hijabOk) preview.hijab = null;
      WK.Avatar.render($('sum-reward-avatar'), preview);
      var wear = $('sum-reward-wear');
      wear.hidden = !sum.reward.genders || sum.reward.genders.indexOf(av.gender) === -1;
      wear.disabled = false;
      wear.textContent = 'Pakai sekarang';
      wear.onclick = function () {
        S.setAvatar(WK.Avatar.normalize(preview, S.getUnlockedItems()));
        wear.textContent = 'Sudah dipakai ✓';
        wear.disabled = true;
      };
    } else rewardBox.hidden = true;

    // Tombol
    var nextBtn = $('sum-next');
    var hasNextStage = sum.stage < C.tier(sum.tier).stages;
    var canNext = hasNextStage && WK.Progress.isStageUnlocked(sum.tier, sum.game, sum.stage + 1);
    nextBtn.textContent = canNext ? 'Stage ' + (sum.stage + 1) + ' →' : 'Ke peta';
    nextBtn.onclick = function () {
      if (canNext) actions.play(sum.game, sum.stage + 1);
      else actions.map();
    };
    $('sum-retry').onclick = function () { actions.play(sum.game, sum.stage); };
    $('sum-map').onclick = function () { actions.map(); };
    $('sum-map').hidden = !canNext;

    if (sum.stars > 0) confetti($('screen-summary'));
    setTimeout(function () { say(mood.en); }, 400);
  }

  function bindOnce() {
    $('fb-next').addEventListener('click', function () {
      if (run && run.busy) next();
    });
    // "Dengarkan lagi": ulangi ucapan terakhir di soal ini (atau teks awal dari modul),
    // supaya tombol ini tidak membocorkan jawaban.
    $('stage-replay').addEventListener('click', function () {
      if (!run || !run.questions.length) return;
      var q = run.questions[run.index];
      var mod = currentModule();
      var text = run.lastSaid || (mod.replayText ? mod.replayText(q) : null);
      if (text) say(text, { rate: 0.8 });
      else WK.App.toast('Di soal ini, kata diucapkan saat kamu memilih.');
    });
  }

  window.WK.Stage = {
    start: start,
    stop: stop,
    renderSummary: renderSummary,
    isRunning: function () { return !!run; },
    // Ambil data game lebih awal (mis. saat peta tampil) agar stage langsung muncul.
    preload: function (gameId) { if (gameId) loadGame(gameId).catch(function () { /* abaikan */ }); },
    // Mode uji (?dev): selesaikan stage seketika dengan jumlah benar tertentu dari 10.
    simulate: function (correct) {
      if (!run) return;
      run.questions = new Array(C.QUESTIONS_PER_STAGE).fill({});
      run.correct = correct;
      finish();
    },
    init: bindOnce,
    _pickQuestions: pickQuestions,
    _current: function () { return run && run.questions[run.index]; }
  };
})();
