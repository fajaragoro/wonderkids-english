/* sfx.js — efek suara pendek (klik, benar, salah, menang) dibuat langsung dengan Web Audio.
 * Tanpa file audio, jadi tetap jalan offline. Ikut pengaturan Suara (Nyala/Mati).
 * Setiap ketukan tombol otomatis berbunyi; tombol dengan atribut data-silent tidak. */
(function () {
  'use strict';

  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null;
  var VOLUME = 0.25;

  function enabled() {
    var st = (WK.Storage && WK.Storage.get('settings')) || {};
    return st.sound !== false;
  }

  function audio() {
    if (!AC) return null;
    if (!ctx) {
      try { ctx = new AC(); } catch (e) { AC = null; return null; }
    }
    // iOS/Chrome menahan audio sampai ada sentuhan; lanjutkan di sentuhan berikutnya.
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(function () { /* abaikan */ });
    return ctx;
  }

  // Satu nada: frekuensi awal → akhir, dengan bentuk gelombang dan durasi tertentu.
  function tone(ac, at, opt) {
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = opt.type || 'sine';
    osc.frequency.setValueAtTime(opt.from, at);
    if (opt.to) osc.frequency.exponentialRampToValueAtTime(opt.to, at + opt.dur);
    var peak = VOLUME * (opt.vol || 1);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + opt.dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(at);
    osc.stop(at + opt.dur + 0.02);
  }

  var SOUNDS = {
    // Ketukan tombol: "pop" kecil yang ceria.
    tap: function (ac, t) {
      tone(ac, t, { type: 'triangle', from: 520, to: 980, dur: 0.07, vol: 0.9 });
    },
    // Jawaban benar: dua nada naik.
    correct: function (ac, t) {
      tone(ac, t, { type: 'triangle', from: 660, dur: 0.12 });
      tone(ac, t + 0.1, { type: 'triangle', from: 990, dur: 0.22 });
    },
    // Jawaban salah: nada turun yang lembut (tidak menakutkan).
    wrong: function (ac, t) {
      tone(ac, t, { type: 'sine', from: 330, to: 200, dur: 0.25, vol: 0.9 });
    },
    // Selesai stage / dapat hadiah: arpeggio kecil.
    win: function (ac, t) {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(ac, t + i * 0.09, { type: 'triangle', from: f, dur: i === 3 ? 0.35 : 0.14 });
      });
    }
  };

  function play(name) {
    if (!enabled() || !SOUNDS[name]) return;
    var ac = audio();
    if (!ac) return;
    try { SOUNDS[name](ac, ac.currentTime + 0.01); } catch (e) { /* abaikan */ }
  }

  // Bunyi "tap" untuk setiap tombol yang diketuk, di seluruh aplikasi.
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button, [role="button"], a[href], [data-go]');
    if (!b || b.disabled || b.closest('[data-silent]')) return;
    play('tap');
  }, true);

  window.WK = window.WK || {};
  window.WK.Sfx = { play: play, supported: !!AC };
})();
