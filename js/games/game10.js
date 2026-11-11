/* Game 10 — Ulangi Yuk: dengarkan, lalu ucapkan, lalu dinilai (toleran).
 * Soal: { type: "speak_repeat", prompt: "apple", image?, audio: "apple", answer: "apple",
 *         options: ["apple", "april", "ample"] }   ← options dipakai mode alternatif.
 *
 * Mode suara   : butuh WK.Speech.canListen() (SpeechRecognition, Tahap 6).
 * Mode alternatif (tanpa mikrofon): teks ditampilkan, anak memilih rekaman (tombol suara) yang cocok.
 *   Jika perangkat juga tidak bisa bersuara, pilihannya berupa teks. */
(function () {
  'use strict';
  var K = WK.Kit;
  var T = K.timers();
  var s = null;
  var forceAlt = false; // mis. izin mikrofon ditolak → mode alternatif untuk sisa sesi

  var PASS = 0.6; // ambang kemiripan (0–1). Sengaja longgar untuk membangun percaya diri.

  /* ---------- penilaian toleran ---------- */
  function norm(t) {
    return String(t || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var prev = [], cur = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }
  function similarity(heard, target) {
    var a = norm(heard), b = norm(target);
    if (!a || !b) return 0;
    if (a === b || a.indexOf(b) !== -1) return 1;
    var charSim = 1 - lev(a, b) / Math.max(a.length, b.length);
    // Untuk kalimat: berapa banyak kata target yang terdengar.
    var tw = b.split(' '), hw = a.split(' ');
    var hit = tw.filter(function (w) { return hw.some(function (h) { return h === w || lev(h, w) <= 1; }); }).length;
    var wordSim = hit / tw.length;
    return Math.max(charSim, tw.length > 1 ? wordSim : 0);
  }
  function score(alternatives, target) {
    return (alternatives || []).reduce(function (best, alt) { return Math.max(best, similarity(alt, target)); }, 0);
  }

  function canListen() { return !forceAlt && !!(WK.Speech && WK.Speech.canListen && WK.Speech.canListen()); }

  /* ---------- tampilan ---------- */
  function mount(q, ctx) {
    var wrap = K.el('div', 'g-speak');
    if (q.image) wrap.appendChild(K.image(q.image, 'small'));
    var target = K.el('p', 'speak-target display', q.prompt || q.answer);
    target.lang = 'en';
    wrap.appendChild(target);
    var row = K.el('div', 'row speak-row');
    row.appendChild(K.speakBtn('Dengarkan contoh', function () { ctx.say(q.audio || q.answer); }));
    wrap.appendChild(row);
    s = { q: q, ctx: ctx, wrap: wrap, opts: null, heard: null, mic: null };
    ctx.el.appendChild(wrap);

    if (canListen()) mountMic(q, ctx);
    else mountAlt(q, ctx);
    T.set(function () { ctx.say(q.audio || q.answer); }, 350);
  }

  function mountMic(q, ctx) {
    var mic = K.el('button', 'mic-btn');
    mic.type = 'button';
    mic.setAttribute('data-silent', ''); // bunyi klik jangan ikut terekam mikrofon
    mic.appendChild(K.el('span', 'mic-icon', '🎤'));
    mic.appendChild(K.el('span', 'mic-label display', 'Ucapkan'));
    var heard = K.el('p', 'heard', 'Tekan tombol mikrofon, lalu ucapkan.');
    s.mic = mic; s.heard = heard;
    mic.addEventListener('click', function () {
      if (ctx.locked() || mic.classList.contains('listening')) return;
      mic.classList.add('listening');
      heard.textContent = 'Aku mendengarkan…';
      WK.Speech.listen({
        onResult: function (alts) {
          if (!s || s.mic !== mic) return;
          mic.classList.remove('listening');
          heard.textContent = alts && alts[0] ? 'Aku dengar: “' + alts[0] + '”' : '';
          var ok = score(alts, q.answer) >= PASS;
          ctx.submit(ok);
        },
        onError: function (code) {
          if (!s || s.mic !== mic) return;
          mic.classList.remove('listening');
          var fatal = ['not-allowed', 'service-not-allowed', 'unsupported', 'audio-capture', 'network', 'language-not-supported'];
          if (fatal.indexOf(code) !== -1) {
            forceAlt = true;
            heard.textContent = code === 'network'
              ? 'Pengenal suara butuh internet. Kita pakai mode pilih, ya.'
              : 'Mikrofon tidak bisa dipakai. Kita pakai mode pilih, ya.';
            mic.remove();
            if (s.altLink) s.altLink.remove();
            mountAlt(q, ctx);
          } else {
            heard.textContent = 'Suaramu belum terdengar. Coba lagi, ya!';
          }
        }
      });
    });
    s.wrap.appendChild(mic);
    s.wrap.appendChild(heard);
    var alt = K.el('button', 'link-btn', 'Tidak bisa bicara sekarang? Pakai mode pilih');
    alt.type = 'button';
    s.altLink = alt;
    alt.addEventListener('click', function () {
      forceAlt = true;
      mic.remove(); heard.remove(); alt.remove();
      mountAlt(q, ctx);
    });
    s.wrap.appendChild(alt);
  }

  // Mode alternatif: pilih rekaman yang cocok dengan teks.
  function mountAlt(q, ctx) {
    var voice = K.canSpeak();
    s.wrap.appendChild(K.el('p', 'q-instr', voice ? 'Dengarkan tiap tombol. Mana yang sama dengan tulisan di atas?' : 'Pilih tulisan yang sama, lalu ucapkan keras-keras!'));
    if (!voice) {
      // Tanpa suara sama sekali: pilihan teks biasa.
      s.opts = K.options(q, ctx, { speak: false });
      s.wrap.appendChild(s.opts.el);
      return;
    }
    var list = q.options && q.options.length ? q.options : [q.answer];
    var grid = K.el('div', 'options rec-options');
    var buttons = K.shuffle(list).map(function (opt, i) {
      var item = K.el('div', 'rec-item');
      var play = K.el('button', 'rec-play');
      play.type = 'button';
      play.dataset.value = opt;
      play.textContent = '🔊 ' + (i + 1);
      play.setAttribute('aria-label', 'Putar rekaman ' + (i + 1));
      play.addEventListener('click', function () { ctx.say(opt); K.pulse(play); });
      var pick = K.el('button', 'opt rec-pick', 'Pilih ' + (i + 1));
      pick.type = 'button';
      pick.dataset.value = opt;
      pick.addEventListener('click', function () {
        if (ctx.locked() || pick.disabled) return;
        var ok = opt === q.answer;
        pick.classList.add(ok ? 'right' : 'wrong');
        play.textContent = opt; // setelah dipilih, teksnya terlihat
        ctx.submit(ok);
      });
      item.appendChild(play);
      item.appendChild(pick);
      grid.appendChild(item);
      return pick;
    });
    s.opts = { buttons: buttons };
    s.wrap.appendChild(grid);
  }

  function hint(q, ctx) {
    if (s.opts) K.disableWrong(s.opts.buttons);
    T.set(function () { ctx.say(q.audio || q.answer, { rate: 0.7 }); }, 300);
  }

  function reveal(q, ctx) {
    if (s.opts) {
      K.revealAnswer(s.opts.buttons, q.answer);
      s.wrap.querySelectorAll('.rec-play').forEach(function (b) { b.textContent = b.dataset.value; });
    }
    if (s.mic) s.mic.disabled = true;
    ctx.say(q.audio || q.answer);
  }

  function unmount() {
    T.clear();
    if (WK.Speech && WK.Speech.stopListening) WK.Speech.stopListening();
    s = null;
  }

  WK.Games.register(10, { mount: mount, hint: hint, reveal: reveal, unmount: unmount, score: score, similarity: similarity });
})();
