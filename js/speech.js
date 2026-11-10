/* speech.js — wrapper Web Speech API.
 *   Ucapan  : speechSynthesis, bahasa English (US), pilih suara paling jernih yang tersedia.
 *   Dengar  : SpeechRecognition (Game 10). Jika tidak didukung, canListen() = false → mode alternatif.
 * Suara berbeda tiap perangkat; aksen tidak dijamin seragam (DESIGN.md bagian 9). */
(function () {
  'use strict';

  var synth = window.speechSynthesis || null;
  var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  var LANG = 'en-US';
  var DEFAULT_RATE = 0.9; // sedikit lebih pelan agar jelas untuk anak

  /* ================= Pilih suara ================= */

  var voice = null;

  // Skor suara: en-US dulu, lalu suara "natural/enhanced" yang biasanya lebih jernih.
  function rank(v) {
    var name = (v.name || '').toLowerCase();
    var lang = (v.lang || '').replace('_', '-').toLowerCase();
    var s = 0;
    if (lang === 'en-us') s += 100;
    else if (lang.indexOf('en') === 0) s += 50;
    else return -1;
    if (/natural|neural|enhanced|premium/.test(name)) s += 30;
    if (/google us english/.test(name)) s += 25;
    if (/samantha|aria|jenny|ava|allison|zira/.test(name)) s += 15;
    if (v.localService) s += 5; // suara lokal tidak butuh internet
    if (/compact|eloquence|novelty|whisper|bells|bahh|boing|bubbles|cellos|zarvox|trinoids|albert|bad news|good news|jester|organ|superstar|wobble/.test(name)) s -= 80;
    return s;
  }

  function pickVoice() {
    if (!synth) return;
    var list = synth.getVoices() || [];
    var best = null, bestScore = -1;
    list.forEach(function (v) {
      var sc = rank(v);
      if (sc > bestScore) { best = v; bestScore = sc; }
    });
    voice = best;
  }

  if (synth) {
    pickVoice();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', pickVoice);
    else synth.onvoiceschanged = pickVoice;
  }

  /* ================= Pengaturan ================= */

  function enabled() {
    var st = WK.Storage.get('settings') || {};
    return st.sound !== false;
  }

  /* ================= Ucapkan ================= */

  var pending = null;

  function canSpeak() { return !!synth && enabled(); }

  // Ucapkan teks; ucapan sebelumnya dihentikan agar tidak menumpuk.
  // opts.queue = true: antrekan setelah ucapan yang sedang berjalan (mis. pujian setelah kata).
  function say(text, opts) {
    if (!canSpeak() || !text) return;
    opts = opts || {};
    try {
      if (opts.queue) {
        var uq = makeUtterance(text, opts);
        setTimeout(function () { synth.speak(uq); }, 60);
        return;
      }
      clearTimeout(pending);
      if (synth.speaking || synth.pending) synth.cancel();
      var u = makeUtterance(text, opts);
      // Jeda kecil setelah cancel(): beberapa versi Chrome membuang ucapan yang langsung menyusul.
      pending = setTimeout(function () {
        if (synth.paused) synth.resume();
        synth.speak(u);
      }, 40);
    } catch (e) { /* abaikan: suara tidak penting untuk jalannya game */ }
  }

  function makeUtterance(text, opts) {
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = LANG;
    if (voice) u.voice = voice;
    u.rate = opts.rate || DEFAULT_RATE;
    u.pitch = 1.05;
    u.volume = 1;
    if (opts.onEnd) { u.onend = opts.onEnd; u.onerror = opts.onEnd; }
    return u;
  }

  function stop() {
    clearTimeout(pending);
    try { if (synth) synth.cancel(); } catch (e) { /* abaikan */ }
  }

  // iOS/Safari: ucapan pertama harus dari sentuhan pengguna. Ucapan kosong pada sentuhan pertama membuka kuncinya.
  function unlockOnce() {
    document.removeEventListener('pointerdown', unlockOnce, true);
    document.removeEventListener('keydown', unlockOnce, true);
    if (!synth) return;
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
    } catch (e) { /* abaikan */ }
  }
  document.addEventListener('pointerdown', unlockOnce, true);
  document.addEventListener('keydown', unlockOnce, true);

  // Hentikan suara saat tab disembunyikan.
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); stopListening(); } });

  /* ================= Dengar (pengenalan suara) ================= */

  var rec = null;
  var recTimer = null;

  function canListen() { return !!Recognition; }

  // opts: { onResult(alternatives[]), onError(code) }. Kode error: no-speech, not-allowed, audio-capture, network, unsupported, timeout …
  function listen(opts) {
    if (!Recognition) { opts.onError && opts.onError('unsupported'); return; }
    stopListening();
    stop(); // jangan sampai suara contoh ikut terdengar mikrofon
    var done = false;
    function finish(fn, arg) {
      if (done) return;
      done = true;
      clearTimeout(recTimer);
      try { rec && rec.abort(); } catch (e) { /* abaikan */ }
      rec = null;
      fn && fn(arg);
    }
    try {
      rec = new Recognition();
      rec.lang = LANG;
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 5;
      rec.onresult = function (e) {
        var alts = [];
        for (var i = 0; i < e.results.length; i++) {
          for (var j = 0; j < e.results[i].length; j++) alts.push(e.results[i][j].transcript);
        }
        finish(opts.onResult, alts);
      };
      rec.onerror = function (e) { finish(opts.onError, e.error || 'error'); };
      rec.onend = function () { finish(opts.onError, 'no-speech'); };
      rec.start();
      recTimer = setTimeout(function () { finish(opts.onError, 'no-speech'); }, 8000);
    } catch (e) {
      finish(opts.onError, 'unsupported');
    }
  }

  function stopListening() {
    clearTimeout(recTimer);
    if (rec) {
      var r = rec;
      rec = null;
      r.onresult = r.onerror = r.onend = null;
      try { r.abort(); } catch (e) { /* abaikan */ }
    }
  }

  window.WK = window.WK || {};
  window.WK.Speech = {
    say: say,
    stop: stop,
    canSpeak: canSpeak,
    canListen: canListen,
    listen: listen,
    stopListening: stopListening,
    voiceName: function () { return voice ? voice.name + ' (' + voice.lang + ')' : null; },
    supported: { speak: !!synth, listen: !!Recognition }
  };
})();
