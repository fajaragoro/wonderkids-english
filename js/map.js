/* map.js — pilih tingkat, peta petualangan 10 game, dan aturan buka kunci.
 * Aturan (DESIGN.md 8.2):
 *  - Game 1 terbuka dari awal.
 *  - Game berikutnya terbuka setelah SEMUA stage game sebelumnya minimal 1 bintang.
 *  - Di dalam game, stage berikutnya terbuka setelah stage sebelumnya minimal 1 bintang.
 *  - Progres dihitung per game per tingkat. Stage yang sudah dibuka bisa diulang kapan saja. */
(function () {
  'use strict';

  var C = WK.Config;
  var S = WK.Storage;

  /* ================= Aturan progres ================= */

  var Progress = {
    stageCount: function (tier) { return C.tier(tier).stages; },

    // Bintang tiap stage, panjang = jumlah stage tingkat ini (stage belum dimainkan = 0).
    stars: function (tier, game) {
      var saved = S.getStageStars(tier, game);
      var out = [];
      for (var i = 0; i < Progress.stageCount(tier); i++) out.push(saved[i] || 0);
      return out;
    },
    gameStars: function (tier, game) {
      return Progress.stars(tier, game).reduce(function (a, b) { return a + b; }, 0);
    },
    maxGameStars: function (tier) { return Progress.stageCount(tier) * 3; },
    tierStars: function (tier) {
      var sum = 0;
      C.GAMES.forEach(function (g) { sum += Progress.gameStars(tier, g.id); });
      return sum;
    },
    maxTierStars: function (tier) { return Progress.maxGameStars(tier) * C.GAMES.length; },

    isGameComplete: function (tier, game) {
      return Progress.stars(tier, game).every(function (s) { return s >= 1; });
    },
    isGameUnlocked: function (tier, game) {
      return game === 1 || Progress.isGameComplete(tier, game - 1);
    },
    isStageUnlocked: function (tier, game, stage) {
      if (!Progress.isGameUnlocked(tier, game)) return false;
      return stage === 1 || Progress.stars(tier, game)[stage - 2] >= 1;
    },
    // Game yang sedang dikerjakan: game terbuka pertama yang belum selesai (atau game terakhir).
    currentGame: function (tier) {
      for (var g = 1; g <= C.GAMES.length; g++) {
        if (Progress.isGameUnlocked(tier, g) && !Progress.isGameComplete(tier, g)) return g;
      }
      return C.GAMES.length;
    },
    completedGames: function (tier) {
      return C.GAMES.filter(function (g) { return Progress.isGameComplete(tier, g.id); }).length;
    }
  };

  /* ================= Util ================= */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function starRow(stars, max) {
    var row = el('span', 'star-row');
    row.setAttribute('aria-label', stars + ' dari ' + max + ' bintang');
    for (var i = 0; i < max; i++) {
      var s = el('span', i < stars ? 'st on' : 'st', '★');
      s.setAttribute('aria-hidden', 'true');
      row.appendChild(s);
    }
    return row;
  }

  /* ================= Layar pilih tingkat ================= */

  function renderTiers(onPick) {
    var box = document.getElementById('tier-list');
    box.textContent = '';
    var currentTier = S.getTier();
    C.TIERS.forEach(function (t) {
      var b = el('button', 'tier-card ' + t.color + (currentTier === t.id ? ' selected' : ''));
      b.type = 'button';
      var badge = el('span', 'tier-num display', String(t.id));
      var info = el('span', 'tier-info');
      info.appendChild(el('span', 'tier-name display', t.name));
      info.appendChild(el('span', 'tier-ages', t.ages));
      info.appendChild(el('span', 'tier-desc', t.desc));
      var meta = el('span', 'tier-meta');
      meta.appendChild(el('span', 'chip small', '⭐ ' + Progress.tierStars(t.id) + '/' + Progress.maxTierStars(t.id)));
      meta.appendChild(el('span', 'chip small', t.stages + ' stage/game'));
      info.appendChild(meta);
      b.appendChild(badge);
      b.appendChild(info);
      if (currentTier === t.id) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () {
        S.setTier(t.id);
        onPick(t.id);
      });
      box.appendChild(b);
    });
  }

  /* ================= Peta ================= */

  // Posisi horizontal stasiun (persen) agar jalur berkelok.
  var XS = [50, 78, 70, 30, 22, 50, 78, 70, 30, 22];
  var ROW = 150;   // jarak vertikal antar stasiun (px)
  var TOP = 70;

  var DECOR = ['🌳', '🌼', '⛰️', '🌲', '🍄', '🌻', '🌳', '🌷', '🌲', '🌿'];

  function renderMap(handlers) {
    var tier = S.getTier();
    var t = C.tier(tier);
    document.getElementById('map-tier').textContent = t.name + ' · ' + t.ages;
    document.getElementById('map-stars').textContent = Progress.tierStars(tier) + '/' + Progress.maxTierStars(tier);
    document.getElementById('map-done').textContent = Progress.completedGames(tier) + '/' + C.GAMES.length;

    var track = document.getElementById('map-track');
    track.textContent = '';
    var n = C.GAMES.length;
    // Peta dari bawah (Game 1) ke atas (Game 10), seperti mendaki.
    var height = TOP * 2 + ROW * (n - 1) + 40;
    track.style.height = height + 'px';
    function yOf(i) { return height - TOP - 20 - i * ROW; }

    // Jalur
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'map-path');
    svg.setAttribute('viewBox', '0 0 100 ' + height);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var d = '';
    C.GAMES.forEach(function (g, i) {
      var x = XS[i], y = yOf(i);
      if (i === 0) d = 'M' + x + ' ' + y;
      else {
        var py = yOf(i - 1);
        d += ' C' + XS[i - 1] + ' ' + (py - ROW / 2) + ' ' + x + ' ' + (y + ROW / 2) + ' ' + x + ' ' + y;
      }
    });
    ['under', 'over'].forEach(function (kind) {
      var p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', 'path-' + kind);
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(p);
    });
    track.appendChild(svg);

    // Hiasan alam
    DECOR.forEach(function (emo, i) {
      var dcr = el('span', 'decor', emo);
      dcr.setAttribute('aria-hidden', 'true');
      dcr.style.top = (yOf(i) - 20) + 'px';
      dcr.style.left = (XS[i] > 50 ? 6 + (i % 3) * 4 : 80 - (i % 3) * 4) + '%';
      track.appendChild(dcr);
    });

    var currentG = Progress.currentGame(tier);
    var max = Progress.maxGameStars(tier);

    C.GAMES.forEach(function (g, i) {
      var unlocked = Progress.isGameUnlocked(tier, g.id);
      var complete = Progress.isGameComplete(tier, g.id);
      var stars = Progress.gameStars(tier, g.id);
      var isCurrent = g.id === currentG && unlocked;

      var fresh = handlers.highlight === g.id && unlocked;
      var st = el('button', 'station' + (unlocked ? '' : ' locked') + (complete ? ' done' : '') +
        (isCurrent ? ' current' : '') + (fresh ? ' just-unlocked' : ''));
      st.type = 'button';
      st.style.left = XS[i] + '%';
      st.style.top = yOf(i) + 'px';
      st.style.setProperty('--c', g.color);
      st.dataset.game = g.id;
      st.setAttribute('aria-label', 'Game ' + g.id + ': ' + g.name + '. ' +
        (unlocked ? stars + ' dari ' + max + ' bintang' + (complete ? ', selesai' : '') : 'terkunci'));

      var disc = el('span', 'st-disc');
      disc.appendChild(el('span', 'st-icon', unlocked ? g.icon : '🔒'));
      disc.appendChild(el('span', 'st-num display', String(g.id)));
      st.appendChild(disc);
      var label = el('span', 'st-label');
      label.appendChild(el('span', 'st-name display', g.name));
      if (unlocked) label.appendChild(el('span', 'st-stars', '⭐ ' + stars + '/' + max));
      st.appendChild(label);

      st.addEventListener('click', function () {
        if (!unlocked) {
          WK.App.toast('Selesaikan Game ' + (g.id - 1) + ' dulu, ya!');
          return;
        }
        openGameSheet(g.id, handlers.onStage);
      });
      track.appendChild(st);

      if (isCurrent) {
        var me = WK.Avatar.create(WK.Avatar.normalize(S.getAvatar(), S.getUnlockedItems()),
          'map-me ' + (XS[i] < 50 ? 'right' : 'left'));
        me.style.left = XS[i] + '%';
        me.style.top = yOf(i) + 'px';
        me.setAttribute('aria-hidden', 'true');
        track.appendChild(me);
      }
    });
  }

  // Gulir peta ke stasiun yang baru terbuka / sedang dikerjakan.
  function scrollToCurrent() {
    var cur = document.querySelector('#map-track .station.just-unlocked') ||
      document.querySelector('#map-track .station.current') ||
      document.querySelector('#map-track .station[data-game="1"]');
    if (cur) cur.scrollIntoView({ block: 'center' });
  }

  /* ================= Lembar detail game ================= */

  function openGameSheet(gameId, onStage) {
    var tier = S.getTier();
    var g = C.game(gameId);
    var dlg = document.getElementById('dlg-game');
    dlg.style.setProperty('--c', g.color);
    document.getElementById('game-sheet-icon').textContent = g.icon;
    document.getElementById('game-sheet-title').textContent = 'Game ' + g.id + ': ' + g.name;
    document.getElementById('game-sheet-desc').textContent = g.desc + ' (' + g.focus + ')';

    var list = document.getElementById('game-sheet-stages');
    list.textContent = '';
    var stars = Progress.stars(tier, gameId);
    stars.forEach(function (s, i) {
      var stage = i + 1;
      var open = Progress.isStageUnlocked(tier, gameId, stage);
      var b = el('button', 'stage-btn' + (open ? '' : ' locked'));
      b.type = 'button';
      b.appendChild(el('span', 'stage-name display', 'Stage ' + stage));
      if (open) b.appendChild(starRow(s, 3));
      else b.appendChild(el('span', 'stage-lock', '🔒'));
      b.setAttribute('aria-label', 'Stage ' + stage + (open ? ', ' + s + ' bintang' : ', terkunci'));
      b.addEventListener('click', function () {
        if (!open) { WK.App.toast('Dapatkan minimal 1 bintang di Stage ' + (stage - 1) + ' dulu.'); return; }
        dlg.close();
        onStage(gameId, stage);
      });
      list.appendChild(b);
    });

    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  window.WK.Progress = Progress;
  window.WK.Map = {
    renderTiers: renderTiers,
    renderMap: renderMap,
    scrollToCurrent: scrollToCurrent,
    starRow: starRow
  };
})();
