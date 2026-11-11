/* cards.js — Card Game: 3 dek kartu (Where is…?, The Profession, Animals & Fruits).
 * Tanpa skor/bintang. Urutan kartu diacak setiap kali dek dimulai.
 * Jawaban tertutup dan hanya terbuka dengan MENAHAN tombol ±1 detik (tidak mudah terbuka tak sengaja). */
(function () {
  'use strict';

  var HOLD_MS = 1100;

  var DECKS = [
    {
      id: 'where', name: 'Where is…?', icon: '🔍', color: 'sky',
      desc: 'Di mana bendanya? Jawab dengan bahasa Inggris.',
      hide: 'bottom',
      steps: [
        'Lihat gambar dan nama benda di kartu. Dengarkan suaranya, misalnya <b lang="en">"Where is the ball?"</b>',
        'Anak menjawab di mana benda itu dengan bahasa Inggris, misalnya <b lang="en">"It is under the bed."</b>',
        'Orang tua boleh ikut membacakan nama benda. Tekan <b>Dengarkan</b> untuk mengulang suara.',
        '<b>Tahan</b> tombol kuning sampai penuh untuk membuka jawabannya.',
        'Tekan <b>Berikutnya</b> untuk kartu lain. Urutan kartu selalu acak.'
      ]
    },
    {
      id: 'jobs', name: 'The Profession', icon: '🩺', color: 'grape',
      desc: 'Dengarkan clue, lalu tebak profesinya.',
      hide: 'top',
      steps: [
        'Dengarkan <b>clue</b> (petunjuk) berbahasa Inggris di kartu. Orang tua boleh ikut membacakannya.',
        'Anak menebak nama profesinya dengan bahasa Inggris, misalnya <b lang="en">"A doctor!"</b>',
        'Tekan <b>Dengarkan</b> untuk mengulang clue.',
        '<b>Tahan</b> tombol kuning sampai penuh untuk membuka gambar dan nama profesinya.',
        'Tekan <b>Berikutnya</b> untuk kartu lain. Urutan kartu selalu acak.'
      ]
    },
    {
      id: 'nature', name: 'Animals & Fruits', icon: '🍎', color: 'leaf',
      desc: 'Tebak hewan atau buah dari clue-nya.',
      hide: 'top',
      steps: [
        'Dengarkan <b>clue</b> (petunjuk) berbahasa Inggris di kartu. Orang tua boleh ikut membacakannya.',
        'Anak menebak nama hewan atau buahnya dengan bahasa Inggris, misalnya <b lang="en">"A rabbit!"</b>',
        'Tekan <b>Dengarkan</b> untuk mengulang clue.',
        '<b>Tahan</b> tombol kuning sampai penuh untuk membuka gambar dan namanya.',
        'Tekan <b>Berikutnya</b> untuk kartu lain. Urutan kartu selalu acak.'
      ]
    }
  ];

  var cache = {};
  var run = null; // { deck, cards, index, open:[] }

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function deck(id) { return DECKS.filter(function (d) { return d.id === id; })[0]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function say(text) { if (text) WK.Speech.say(text); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function load(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    return fetch('data/cards/' + id + '.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (list) { cache[id] = list; return list; });
  }

  /* ---------------- Menu dek ---------------- */
  function renderMenu(onPick) {
    var box = $('deck-list');
    box.textContent = '';
    DECKS.forEach(function (d, i) {
      var b = el('button', 'deck-card ' + d.color);
      b.type = 'button';
      var art = el('span', 'deck-art');
      art.setAttribute('aria-hidden', 'true');
      art.appendChild(el('span', 'deck-num display', pad(i + 1)));
      art.appendChild(el('span', 'deck-emoji', d.icon));
      var info = el('span', 'deck-info');
      info.appendChild(el('span', 'deck-name display', d.name));
      info.appendChild(el('span', 'deck-desc', d.desc));
      info.appendChild(el('span', 'chip small', '100 kartu'));
      b.appendChild(art);
      b.appendChild(info);
      b.addEventListener('click', function () { onPick(d.id); });
      box.appendChild(b);
      load(d.id).catch(function () { /* dimuat lagi saat dimulai */ });
    });
  }

  /* ---------------- Cara main ---------------- */
  function renderHowto(id) {
    var d = deck(id);
    $('howto-icon').textContent = d.icon;
    $('howto-icon').className = 'deck-icon ' + d.color;
    $('howto-title').textContent = d.name;
    var ol = $('howto-steps');
    ol.textContent = '';
    d.steps.forEach(function (s) {
      var li = el('li');
      li.innerHTML = s; // teks tetap dari kode, bukan dari pengguna
      ol.appendChild(li);
    });
  }

  /* ---------------- Gambar kartu ---------------- */
  function picture(src) {
    var box = el('div', 'cc-pic');
    if (/\.svg$/.test(src)) {
      var im = el('img');
      im.src = 'assets/' + src;
      im.alt = '';
      box.appendChild(im);
    } else box.textContent = src;
    return box;
  }

  // Kartu: bagian atas (langit + gelombang) dan bawah (ungu). Salah satunya tertutup sampai ditahan.
  function cardEl(d, c, n) {
    var card = el('article', 'cc-card ' + d.id + ' hide-' + d.hide);
    card.appendChild(el('span', 'cc-num display', pad(n)));
    var top = el('div', 'cc-top');
    var bottom = el('div', 'cc-bottom');
    var speak = { front: '', back: '' };

    if (d.id === 'where') {
      top.appendChild(picture(c.image));
      top.appendChild(el('p', 'cc-name display', c.name));
      bottom.appendChild(el('p', 'cc-ask', c.ask));
      var ans = el('div', 'cc-answer');
      ans.appendChild(el('span', 'cc-place', c.place));
      ans.appendChild(el('p', 'cc-loc', c.answer));
      bottom.appendChild(ans);
      speak.front = c.ask;
      speak.back = c.sentence;
    } else {
      var art = el('div', 'cc-art');
      if (d.id === 'jobs') {
        var fig = el('div', 'cc-figure');
        fig.innerHTML = WK.Figure.figure(c.figure);
        art.appendChild(fig);
        var tool = el('span', 'cc-tool', c.tool);
        art.appendChild(tool);
      } else {
        art.appendChild(picture(c.image));
        art.classList.add(c.kind);
      }
      top.appendChild(art);
      top.appendChild(el('p', 'cc-name display', c.name));
      bottom.appendChild(el('p', 'cc-tag', d.id === 'jobs' ? 'Who am I?' : (c.kind === 'fruit' ? 'What fruit am I?' : 'What animal am I?')));
      bottom.appendChild(el('p', 'cc-clue', c.clue));
      speak.front = c.clue;
      // "A doctor!", "An apple!"; nama jamak (grapes, cherries, blueberries) tanpa a/an.
      var plural = /(berries|cherries|grapes)$/.test(c.name);
      speak.back = plural ? c.name + '!' : (/^[aeiou]/i.test(c.name) ? 'An ' : 'A ') + c.name + '!';
    }
    top.setAttribute('lang', 'en');
    bottom.setAttribute('lang', 'en');
    card.appendChild(top);
    card.appendChild(bottom);

    var cover = el('div', 'cc-cover');
    cover.setAttribute('aria-hidden', 'true');
    cover.appendChild(el('span', 'cc-q display', '?'));
    cover.appendChild(el('span', 'cc-cover-text', 'Tahan tombol kuning untuk membuka'));
    (d.hide === 'top' ? top : bottom).appendChild(cover);
    return { el: card, speak: speak };
  }

  /* ---------------- Main ---------------- */
  function start(id) {
    var d = deck(id);
    run = { deck: d, cards: [], index: 0, opened: {}, node: null };
    $('card-deck-name').textContent = d.name;
    $('card-stage').textContent = '';
    $('card-stage').appendChild(el('p', 'q-status', 'Menyiapkan kartu…'));
    return load(id).then(function (list) {
      if (!run || run.deck !== d) return;
      run.cards = shuffle(list);
      show(0, 0);
    }).catch(function () {
      $('card-stage').textContent = '';
      $('card-stage').appendChild(el('p', 'q-status', 'Kartu belum bisa dimuat. Periksa koneksi lalu coba lagi.'));
    });
  }

  function show(i, dir) {
    var r = run;
    r.index = i;
    var c = r.cards[i];
    var built = cardEl(r.deck, c, i + 1);
    r.node = built;
    var stage = $('card-stage');
    stage.textContent = '';
    built.el.classList.add(dir < 0 ? 'enter-left' : 'enter-right');
    stage.appendChild(built.el);
    $('card-count').textContent = (i + 1) + ' / ' + r.cards.length;
    $('card-prev').disabled = i === 0;
    $('card-next').textContent = i === r.cards.length - 1 ? 'Acak lagi ↻' : 'Berikutnya ▶';
    setOpen(!!r.opened[c.id], true);
    say(built.speak.front);
  }

  function setOpen(open, quiet) {
    var r = run;
    if (!r || !r.node) return;
    r.node.el.classList.toggle('open', open);
    var hold = $('card-hold');
    hold.disabled = open;
    hold.classList.toggle('done', open);
    hold.querySelector('.hold-label').textContent = open ? 'Jawaban terbuka!' : 'Tahan untuk membuka';
    if (open && !quiet) {
      r.opened[r.cards[r.index].id] = true;
      if (WK.Sfx) WK.Sfx.play('correct');
      WK.Speech.say(r.node.speak.back, { queue: false });
    }
  }

  /* ---------------- Tombol tahan ---------------- */
  var holdTimer = null;
  function holdStart(e) {
    var b = $('card-hold');
    if (b.disabled || !run || !run.node) return;
    if (e && e.type === 'pointerdown') { try { b.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } }
    b.classList.add('holding');
    if (WK.Sfx) WK.Sfx.play('tap');
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      b.classList.remove('holding');
      setOpen(true);
    }, HOLD_MS);
  }
  function holdEnd() {
    var b = $('card-hold');
    if (!b.classList.contains('holding')) return;
    b.classList.remove('holding');
    clearTimeout(holdTimer);
    if (!b.disabled) WK.App.toast('Tahan terus sampai penuh, ya!');
  }

  function init(onQuit) {
    var hold = $('card-hold');
    hold.addEventListener('pointerdown', holdStart);
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { hold.addEventListener(ev, holdEnd); });
    hold.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    hold.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); holdStart(); }
    });
    hold.addEventListener('keyup', function (e) { if (e.key === 'Enter' || e.key === ' ') holdEnd(); });

    $('card-listen').addEventListener('click', function () {
      if (!run || !run.node) return;
      var c = run.cards[run.index];
      say(run.opened[c.id] ? run.node.speak.back : run.node.speak.front);
    });
    $('card-prev').addEventListener('click', function () {
      if (run && run.index > 0) show(run.index - 1, -1);
    });
    $('card-next').addEventListener('click', function () {
      if (!run || !run.cards.length) return;
      if (run.index < run.cards.length - 1) show(run.index + 1, 1);
      else {
        // Semua kartu sudah dilihat: acak ulang dan mulai lagi.
        run.cards = shuffle(run.cards);
        run.opened = {};
        WK.App.toast('Kartu diacak lagi!');
        show(0, 1);
      }
    });
    $('card-quit').addEventListener('click', onQuit);
  }

  function stop() {
    clearTimeout(holdTimer);
    WK.Speech.stop();
    run = null;
  }

  window.WK.Cards = {
    DECKS: DECKS, init: init, renderMenu: renderMenu, renderHowto: renderHowto, start: start, stop: stop,
    _run: function () { return run; }, HOLD_MS: HOLD_MS
  };
})();
