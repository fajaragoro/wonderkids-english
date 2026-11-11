/* cards.js — Card Game: 3 dek kartu (Where is…?, The Profession, Animals & Fruits).
 * Tanpa skor/bintang. Urutan kartu diacak setiap kali dek dimulai.
 * Jawaban tertutup dan hanya terbuka dengan MENAHAN tombol ±1 detik (tidak mudah terbuka tak sengaja). */
(function () {
  'use strict';

  var HOLD_MS = 1100;

  var DECKS = [
    {
      id: 'where', name: 'Where is…?', icon: '🔍', color: 'sky',
      desc: 'Belajar kata posisi: in, on, under, behind…',
      hide: 'bottom',
      steps: [
        'Lihat gambar di kartu: di mana bendanya? Dengarkan pertanyaannya, misalnya <b lang="en">"Where are the glasses?"</b>',
        'Anak menjawab dengan kata posisi, misalnya <b lang="en">"They are on the book."</b>',
        'Kata posisi yang dipelajari: <b lang="en">in, inside, on, under, above, below, behind, in front of, next to, beside, near, between, at</b>.',
        '<b>Tahan</b> tombol kuning sampai penuh untuk membuka jawaban dan arti kata posisinya.',
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
        'Masih sulit? Tekan <b>Clue 2</b> untuk melihat gambar alat kerjanya, lalu <b>Clue 3</b> untuk petunjuk yang lebih jelas.',
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
        'Masih sulit? Tekan <b>Clue 2</b> untuk melihat bayangannya, lalu <b>Clue 3</b> untuk petunjuk yang lebih jelas.',
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

  // Adegan "Where is": benda + tempat disusun sesuai kata posisinya (x, y = titik tengah dalam %,
  // s = ukuran px pada panggung 260x190; z lebih besar = lebih depan).
  var LAYOUT = {
    'in':          { place: [50, 68, 118, 2], obj: [50, 36, 66, 1] },
    'inside':      { place: [50, 54, 140, 2], obj: [50, 56, 62, 1] },
    'on':          { place: [50, 70, 118, 1], obj: [50, 25, 66, 2] },
    'under':       { place: [50, 38, 132, 2], obj: [50, 80, 62, 1] },
    'above':       { place: [50, 74, 100, 1], obj: [50, 17, 62, 2] },
    'below':       { place: [50, 19, 84, 1], obj: [50, 74, 84, 2] },
    'behind':      { place: [57, 63, 118, 2], obj: [37, 38, 92, 1] },
    'in front of': { place: [50, 42, 128, 1], obj: [50, 74, 76, 2] },
    'next to':     { place: [36, 54, 124, 1], obj: [78, 62, 82, 2] },
    'beside':      { place: [64, 54, 124, 1], obj: [22, 62, 82, 2] },
    'near':        { place: [30, 52, 122, 1], obj: [80, 64, 92, 2] },
    'between':     { place: [16, 56, 92, 1], obj: [50, 60, 74, 2], place2: [84, 56, 92, 1] },
    'at':          { place: [60, 50, 140, 1], obj: [22, 70, 76, 2] }
  };
  function sceneItem(emo, spec, cls) {
    var e = el('span', 'sc-item ' + cls, emo);
    e.style.left = spec[0] + '%';
    e.style.top = spec[1] + '%';
    e.style.fontSize = spec[2] + 'px';
    e.style.zIndex = spec[3];
    return e;
  }
  function scene(c) {
    var L = LAYOUT[c.prep] || LAYOUT['next to'];
    var box = el('div', 'cc-scene prep-' + c.prep.replace(/ /g, '-'));
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', c.sentence);
    box.appendChild(sceneItem(c.place, L.place, 'sc-place'));
    if (c.place2 && L.place2) box.appendChild(sceneItem(c.place2, L.place2, 'sc-place'));
    var o = L.obj.slice();
    if (c.adjust) { o[0] += c.adjust[0]; o[1] += c.adjust[1]; }
    box.appendChild(sceneItem(c.image, o, 'sc-obj'));
    return box;
  }

  // Huruf awal + kotak kosong untuk Clue 3: "D _ _ _ _ _".
  function letterHint(name) {
    var box = el('p', 'cc-letters');
    box.setAttribute('aria-label', 'Huruf awal ' + name.charAt(0).toUpperCase());
    name.split(' ').forEach(function (w, wi) {
      var word = el('span', 'cc-word');
      for (var i = 0; i < w.length; i++) {
        word.appendChild(el('span', 'cc-letter' + (wi === 0 && i === 0 ? ' first' : ''), wi === 0 && i === 0 ? w.charAt(0).toUpperCase() : (w.charAt(i) === '-' ? '-' : '')));
      }
      box.appendChild(word);
    });
    return box;
  }

  // Kartu: bagian atas (langit + gelombang) dan bawah (ungu). Salah satunya tertutup sampai ditahan.
  function cardEl(d, c, n) {
    var card = el('article', 'cc-card ' + d.id + ' hide-' + d.hide);
    card.appendChild(el('span', 'cc-num display', pad(n)));
    var top = el('div', 'cc-top');
    var bottom = el('div', 'cc-bottom');
    var speak = { front: '', back: '' };

    var hint = null; // isi penutup saat Clue 2 dibuka
    var clue3 = null;
    if (d.id === 'where') {
      top.appendChild(scene(c));
      top.appendChild(el('p', 'cc-name display', c.name));
      bottom.appendChild(el('p', 'cc-ask', c.ask));
      var ans = el('div', 'cc-answer');
      var loc = el('p', 'cc-loc');
      var lead = c.answer.slice(0, c.answer.indexOf(' ' + c.prep + ' ') + 1);
      loc.appendChild(document.createTextNode(lead));
      loc.appendChild(el('b', 'cc-prep', c.prep));
      loc.appendChild(document.createTextNode(c.answer.slice(lead.length + c.prep.length)));
      ans.appendChild(loc);
      var mean = el('p', 'cc-mean');
      mean.appendChild(el('b', 'display', c.prep.toUpperCase()));
      mean.appendChild(document.createTextNode(' = ' + c.meaning));
      mean.setAttribute('lang', 'id');
      ans.appendChild(mean);
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
        hint = el('div', 'cc-hint tool');
        hint.appendChild(el('span', 'cc-hint-tool', c.tool));
        hint.appendChild(el('span', 'cc-hint-label', 'Clue 2: alat kerjaku'));
      } else {
        art.appendChild(picture(c.image));
        art.classList.add(c.kind);
        hint = el('div', 'cc-hint shadow');
        hint.appendChild(picture(c.image));
        hint.appendChild(el('span', 'cc-hint-label', 'Clue 2: bayanganku'));
      }
      top.appendChild(art);
      top.appendChild(el('p', 'cc-name display', c.name));
      bottom.appendChild(el('p', 'cc-tag', d.id === 'jobs' ? 'Who am I?' : (c.kind === 'fruit' ? 'What fruit am I?' : 'What animal am I?')));
      bottom.appendChild(el('p', 'cc-clue', c.clue));
      clue3 = el('div', 'cc-clue3');
      clue3.appendChild(el('span', 'cc-clue3-tag display', 'Clue 3'));
      clue3.appendChild(el('p', 'cc-clue3-text', c.clue3));
      clue3.appendChild(letterHint(c.name));
      clue3.hidden = true;
      bottom.appendChild(clue3);
      speak.front = c.clue;
      speak.clue3 = c.clue3 + ' It starts with the letter ' + c.name.charAt(0).toUpperCase() + '.';
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
    var q = el('div', 'cc-cover-q');
    q.appendChild(el('span', 'cc-q display', '?'));
    q.appendChild(el('span', 'cc-cover-text', 'Tahan tombol kuning untuk membuka'));
    cover.appendChild(q);
    if (hint) { hint.hidden = true; cover.appendChild(hint); }
    (d.hide === 'top' ? top : bottom).appendChild(cover);
    return { el: card, speak: speak, hint: hint, cover: cover, clue3: clue3 };
  }

  /* ---------------- Main ---------------- */
  function start(id) {
    var d = deck(id);
    run = { deck: d, cards: [], index: 0, opened: {}, clues: {}, node: null };
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
    $('card-clues').hidden = r.deck.id === 'where';
    setClue(r.clues[c.id] || 1, true);
    setOpen(!!r.opened[c.id], true);
    say(built.speak.front);
  }

  // Tingkat clue yang terbuka: 1 (teks), 2 (+ gambar alat/bayangan), 3 (+ petunjuk spesifik & huruf awal).
  function setClue(level, quiet) {
    var r = run;
    if (!r || !r.node || r.deck.id === 'where') return;
    var n = r.node;
    r.clues[r.cards[r.index].id] = level;
    if (n.hint) {
      n.hint.hidden = level < 2;
      n.cover.classList.toggle('has-hint', level >= 2);
    }
    if (n.clue3) n.clue3.hidden = level < 3;
    n.el.classList.toggle('lvl3', level >= 3);
    var open = !!r.opened[r.cards[r.index].id];
    var b2 = $('card-clue2'), b3 = $('card-clue3');
    b2.disabled = open || level >= 2;
    b3.disabled = open || level !== 2;
    b2.classList.toggle('used', level >= 2);
    b3.classList.toggle('used', level >= 3);
    if (!quiet) {
      if (WK.Sfx) WK.Sfx.play('correct');
      if (level === 3) {
        WK.Speech.say(n.speak.clue3, { queue: false });
        n.clue3.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function setOpen(open, quiet) {
    var r = run;
    if (!r || !r.node) return;
    r.node.el.classList.toggle('open', open);
    var hold = $('card-hold');
    hold.disabled = open;
    hold.classList.toggle('done', open);
    hold.querySelector('.hold-label').textContent = open ? 'Jawaban terbuka!' : 'Tahan untuk membuka';
    if (open) { $('card-clue2').disabled = true; $('card-clue3').disabled = true; }
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
      if (run.opened[c.id]) say(run.node.speak.back);
      else {
        say(run.node.speak.front);
        if ((run.clues[c.id] || 1) >= 3) WK.Speech.say(run.node.speak.clue3, { queue: true });
      }
    });
    $('card-clue2').addEventListener('click', function () { if (run && run.node) setClue(2); });
    $('card-clue3').addEventListener('click', function () { if (run && run.node) setClue(3); });
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
        run.clues = {};
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
