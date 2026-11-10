/* config.js — data tetap: tingkat, daftar game, aturan bintang.
 * Angka di sini adalah nilai awal (DESIGN.md bagian 6, 7, 8) dan boleh diubah. */
(function () {
  'use strict';

  var TIERS = [
    { id: 1, name: 'Tingkat 1', ages: '5–6 tahun', stages: 3, color: 'leaf',
      desc: 'Kata dan frasa pendek. Pilih gambar.' },
    { id: 2, name: 'Tingkat 2', ages: '7–8 tahun', stages: 3, color: 'sky',
      desc: 'I like, I have, This is. Isi huruf dan susun kata.' },
    { id: 3, name: 'Tingkat 3', ages: '9–10 tahun', stages: 4, color: 'grape',
      desc: 'Kalimat lengkap, past simple, kalimat tanya dan negatif.' }
  ];

  // Ikon game memakai emoji benda (tanpa makhluk berwajah).
  var GAMES = [
    { id: 1, name: 'Pasangkan', focus: 'Kosakata', icon: '🧩', color: '#ffd23f', desc: 'Cocokkan gambar dengan kata.' },
    { id: 2, name: 'Susun Huruf', focus: 'Ejaan', icon: '🔤', color: '#52c4ff', desc: 'Susun huruf acak menjadi kata.' },
    { id: 3, name: 'Tebak Gambar', focus: 'Kosakata', icon: '🖼️', color: '#ff8fb3', desc: 'Tebak kata dari gambar dan petunjuk.' },
    { id: 4, name: 'Kalimat Rumpang', focus: 'Grammar', icon: '✏️', color: '#7ddc9a', desc: 'Isi kata yang hilang dalam kalimat.' },
    { id: 5, name: 'Pop Balon', focus: 'Kosakata', icon: '🎈', color: '#ff9345', desc: 'Pecahkan balon berisi arti yang benar.' },
    { id: 6, name: 'Memory Card', focus: 'Kosakata', icon: '🎴', color: '#b9a3ff', desc: 'Cari pasangan kartu kata dan gambar.' },
    { id: 7, name: 'Dengarkan', focus: 'Listening', icon: '🎧', color: '#52c4ff', desc: 'Dengarkan lalu pilih jawaban yang benar.' },
    { id: 8, name: 'Susun Kalimat', focus: 'Grammar', icon: '🧱', color: '#ffcc55', desc: 'Urutkan kata menjadi kalimat.' },
    { id: 9, name: 'Kejar Bintang', focus: 'Campuran', icon: '⭐', color: '#38cf8a', desc: 'Lari dan jawab soal di setiap rintangan.' },
    { id: 10, name: 'Ulangi Yuk', focus: 'Pengucapan', icon: '🎤', color: '#ff5c93', desc: 'Dengarkan, lalu ucapkan.' }
  ];

  var QUESTIONS_PER_STAGE = 10;

  // Benar dari 10 → bintang (bagian 8.1).
  function starsFor(correct) {
    if (correct >= 9) return 3;
    if (correct >= 7) return 2;
    if (correct >= 5) return 1;
    return 0;
  }

  window.WK = window.WK || {};
  window.WK.Config = {
    TIERS: TIERS,
    GAMES: GAMES,
    QUESTIONS_PER_STAGE: QUESTIONS_PER_STAGE,
    starsFor: starsFor,
    tier: function (id) { return TIERS[id - 1] || null; },
    game: function (id) { return GAMES[id - 1] || null; }
  };
})();
