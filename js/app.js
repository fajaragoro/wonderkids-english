/* app.js — routing antar layar dan pengaturan. */
(function () {
  'use strict';

  var S = WK.Storage;
  var C = WK.Config;

  var current = null;
  var activeStage = null; // { game, stage }
  var activeDeck = null;  // id dek Card Game yang dipilih

  /* ---------- Router ---------- */
  function show(name) {
    // Layar mana pun selain gerbang butuh kode masuk.
    if (name !== 'gate' && !S.hasAccess()) name = 'gate';
    // Belum punya avatar: wajib buat dulu.
    if (name !== 'gate' && name !== 'avatar' && !S.getAvatar()) name = 'avatar';
    // Peta dan stage butuh tingkat.
    if ((name === 'map' || name === 'stage') && !S.getTier()) name = 'tier';
    if (name === 'stage' && !activeStage) name = 'map';
    if (name === 'summary' && !lastSummary) name = 'map';
    // Meninggalkan stage yang sedang berjalan (mis. lewat tombol) menghentikan engine.
    if (current === 'stage' && name !== 'stage') WK.Stage.stop();
    if (current === 'card' && name !== 'card') WK.Cards.stop();
    if (name === 'howto' && !activeDeck) name = 'cards';
    if (name === 'card' && !activeDeck) name = 'cards';

    document.querySelectorAll('.screen').forEach(function (el) {
      el.hidden = el.dataset.screen !== name;
    });
    document.getElementById('topbar').hidden = name === 'gate' || name === 'stage' || name === 'summary' || name === 'card';
    current = name;

    if (name !== 'home' && name !== 'gate' && history.state && history.state.wk === 'root') armBack();
    if (name === 'gate') WK.Access.reset();
    if (name === 'home') renderHome();
    if (name === 'avatar') openAvatar();
    if (name === 'tier') WK.Map.renderTiers(function () { show('map'); });
    if (name === 'map') {
      WK.Map.renderMap({ onStage: startStage, highlight: pendingHighlight });
      pendingHighlight = null;
      WK.Stage.preload(WK.Progress.currentGame(S.getTier()));
    }
    if (name === 'stage') renderStage();
    if (name === 'cards') WK.Cards.renderMenu(function (id) { activeDeck = id; show('howto'); });
    if (name === 'howto') WK.Cards.renderHowto(activeDeck);
    if (name === 'card') WK.Cards.start(activeDeck);
    if (name === 'summary') WK.Stage.renderSummary(lastSummary, { play: startStage, map: function () { show('map'); } });

    if (name === 'map') WK.Map.scrollToCurrent();
    else window.scrollTo(0, 0);

    var heading = document.querySelector('#screen-' + name + ' .title, #screen-' + name + ' .display');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  /* ---------- Avatar ---------- */
  function openAvatar() {
    WK.Avatar.open({
      onDone: function () { show('home'); toast('Avatar tersimpan. Keren!'); },
      onCancel: function () { show('home'); }
    });
  }

  // Avatar tersimpan dirapikan (mis. item hadiah yang terkunci lagi setelah reset progres).
  function currentAvatar() {
    var saved = S.getAvatar();
    var clean = WK.Avatar.normalize(saved, S.getUnlockedItems());
    if (saved && JSON.stringify(saved) !== JSON.stringify(clean)) S.setAvatar(clean);
    return clean;
  }

  /* ---------- Beranda ---------- */
  function renderHome() {
    WK.Avatar.render(document.getElementById('home-avatar'), currentAvatar());
    var name = S.getNickname();
    document.getElementById('home-greet').textContent = name ? 'Hello, ' + name + '!' : 'Hello, friend!';
    var tier = S.getTier();
    var t = tier ? C.tier(tier) : null;
    document.getElementById('home-tier').textContent = t ? t.name + ' (' + t.ages + ')' : 'Belum pilih tingkat';
    document.getElementById('home-stars').textContent = tier ? WK.Progress.tierStars(tier) : 0;
  }

  /* ---------- Stage ---------- */
  var DEV = /[?&]dev\b/.test(location.search);
  var lastSummary = null;
  var pendingHighlight = null; // game yang baru terbuka, dirayakan saat kembali ke peta

  function startStage(game, stage) {
    activeStage = { game: game, stage: stage };
    show('stage');
  }

  function renderStage() {
    var a = activeStage;
    WK.Stage.start(S.getTier(), a.game, a.stage, function (summary) {
      lastSummary = summary;
      activeStage = null;
      if (summary.gameJustCompleted && summary.game < C.GAMES.length) pendingHighlight = summary.game + 1;
      show('summary');
    });
    renderDevPanel();
  }

  // Panel uji (hanya dengan ?dev di URL): selesaikan stage tanpa bermain.
  function renderDevPanel() {
    var old = document.getElementById('dev-panel');
    if (old) old.remove();
    if (!DEV) return;
    var box = document.createElement('div');
    box.id = 'dev-panel';
    box.className = 'dev-panel';
    var label = document.createElement('p');
    label.textContent = 'Mode uji: selesaikan dengan … benar';
    box.appendChild(label);
    [10, 8, 6, 4].forEach(function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = n + '/10';
      b.addEventListener('click', function () { WK.Stage.simulate(n); });
      box.appendChild(b);
    });
    document.getElementById('screen-stage').appendChild(box);
  }

  function quitStage() {
    confirmAction('Keluar dari stage ini? Hasil stage ini tidak disimpan.', 'Ya, keluar', function () {
      WK.Stage.stop();
      activeStage = null;
      show('map');
    });
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(text) {
    var el = document.getElementById('toast');
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2400);
  }

  /* ---------- Dialog ---------- */
  function openDialog(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }
  function closeDialog(dlg) {
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  }

  function confirmAction(text, yesLabel, onYes) {
    var dlg = document.getElementById('dlg-confirm');
    document.getElementById('confirm-text').textContent = text;
    document.getElementById('confirm-yes').textContent = yesLabel;
    dlg.returnValue = '';
    dlg.addEventListener('close', function handler() {
      dlg.removeEventListener('close', handler);
      if (dlg.returnValue === 'yes') onYes();
    });
    openDialog(dlg);
  }

  function renderSound() {
    var on = (S.get('settings') || {}).sound !== false;
    var b = document.getElementById('btn-sound');
    b.textContent = on ? '🔊 Suara: Nyala' : '🔇 Suara: Mati';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    var info = document.getElementById('voice-info');
    var Sp = WK.Speech;
    if (!Sp.supported.speak) info.textContent = 'Browser ini tidak mendukung suara.';
    else info.textContent = 'Suara: ' + (Sp.voiceName() || 'bawaan perangkat') +
      (Sp.supported.listen ? ' · Mikrofon didukung' : ' · Mikrofon tidak didukung (Game 10 memakai mode pilih)');
  }

  function initSettings() {
    var dlg = document.getElementById('dlg-settings');
    document.getElementById('btn-settings').addEventListener('click', function () { renderSound(); openDialog(dlg); });

    document.getElementById('btn-sound').addEventListener('click', function () {
      var st = S.get('settings') || {};
      st.sound = st.sound === false;
      S.set('settings', st);
      if (!st.sound) WK.Speech.stop();
      renderSound();
      if (st.sound) WK.Speech.say('Sound on!');
    });

    document.getElementById('btn-settings-avatar').addEventListener('click', function () {
      closeDialog(dlg);
      show('avatar');
    });

    document.getElementById('btn-reset').addEventListener('click', function () {
      closeDialog(dlg);
      confirmAction('Semua bintang, tingkat, dan hadiah di perangkat ini akan dihapus. Avatar tetap disimpan.',
        'Ya, reset', function () {
          S.resetProgress();
          show('home');
          toast('Progres sudah direset.');
        });
    });

    document.getElementById('btn-logout').addEventListener('click', function () {
      closeDialog(dlg);
      confirmAction('Kode masuk perlu diketik lagi saat membuka game. Progres tetap tersimpan.',
        'Ya, keluar', function () {
          S.logout();
          show('gate');
        });
    });

    // Klik di luar kotak dialog menutupnya.
    document.querySelectorAll('dialog.sheet').forEach(function (d) {
      d.addEventListener('click', function (e) { if (e.target === d) closeDialog(d); });
    });
  }

  /* ---------- Tombol Back (Android/browser) ---------- */
  // Satu entri riwayat "jebakan" dijaga di atas halaman; tombol Back diterjemahkan menjadi navigasi di dalam game.
  var PARENT = { map: 'mode', tier: 'mode', summary: 'map', soon: 'home', mode: 'home', cards: 'mode', howto: 'cards', card: 'cards' };

  function armBack() {
    try { history.pushState({ wk: 'trap' }, ''); } catch (e) { /* abaikan */ }
  }

  function onBack() {
    var open = document.querySelector('dialog[open]');
    if (open) { closeDialog(open); armBack(); return; }
    if (current === 'stage') { quitStage(); armBack(); return; }
    if (current === 'avatar') {
      if (S.getAvatar()) show('home');
      armBack();
      return;
    }
    if (PARENT[current]) { show(PARENT[current]); armBack(); return; }
    // Beranda / gerbang: keluar dari halaman (kembali ke halaman sebelumnya di browser).
    try { history.back(); } catch (e) { /* abaikan */ }
  }

  function initBack() {
    try { history.replaceState({ wk: 'root' }, ''); } catch (e) { return; }
    armBack();
    window.addEventListener('popstate', onBack);
  }

  /* ---------- Mulai ---------- */
  function init() {
    WK.Access.init({ onSuccess: function () { show('home'); } });
    initSettings();

    document.getElementById('btn-play').addEventListener('click', function () { show('mode'); });
    document.getElementById('mode-adventure').addEventListener('click', function () {
      show(S.getTier() ? 'map' : 'tier');
    });
    document.getElementById('mode-cards').addEventListener('click', function () { show('cards'); });
    document.getElementById('howto-start').addEventListener('click', function () { show('card'); });
    WK.Cards.init(function () { show('cards'); });
    document.getElementById('btn-edit-avatar').addEventListener('click', function () { show('avatar'); });
    document.getElementById('stage-quit').addEventListener('click', quitStage);
    WK.Stage.init();
    initBack();
    document.addEventListener('click', function (e) {
      var go = e.target.closest('[data-go]');
      if (go) show(go.dataset.go);
    });

    if (!S.isAvailable()) toast('Penyimpanan perangkat tidak aktif. Progres tidak akan tersimpan.');

    show(S.hasAccess() ? 'home' : 'gate');
    registerOffline();
  }

  // Mode offline (PWA). Tidak aktif di file:// dan bisa dimatikan dengan ?nosw untuk pengembangan.
  function registerOffline() {
    if (!('serviceWorker' in navigator) || /[?&]nosw\b/.test(location.search)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* abaikan */ });
    });
  }

  window.WK.App = { show: show, toast: toast };
  init();
})();
