/* avatar.js — render avatar berlapis SVG dan wizard kustomisasi.
 * Avatar disimpan sebagai ID item: { gender, hair, hijab, accessory, top, bottom, shoes }. */
(function () {
  'use strict';

  var I = WK.AvatarItems;
  var S = WK.Storage;

  /* ================= Aturan item ================= */

  function isUnlocked(item, unlocked) {
    return !item.reward || (unlocked || []).indexOf(item.id) !== -1;
  }

  // Aksesoris kepala yang tidak boleh dipakai bersama kerudung.
  function blockedByHijab(item, avatar) {
    return !!(avatar.hijab && item && item.head && !item.hijabOk);
  }

  function validItem(id, cat, gender, unlocked) {
    var it = id ? I.get(id) : null;
    return !!(it && it.cat === cat && it.genders.indexOf(gender) !== -1 && isUnlocked(it, unlocked));
  }

  // Rapikan avatar: ID tidak dikenal/terkunci diganti default. Mengembalikan objek baru.
  function normalize(avatar, unlocked) {
    if (!avatar || !I.DEFAULTS[avatar.gender]) return null;
    var g = avatar.gender;
    var d = I.DEFAULTS[g];
    var out = { gender: g };
    ['hair', 'top', 'bottom', 'shoes'].forEach(function (cat) {
      out[cat] = validItem(avatar[cat], cat, g, unlocked) ? avatar[cat] : d[cat];
    });
    out.hijab = validItem(avatar.hijab, 'hijab', g, unlocked) ? avatar.hijab : null;
    out.accessory = validItem(avatar.accessory, 'accessory', g, unlocked) ? avatar.accessory : null;
    if (blockedByHijab(I.get(out.accessory), out)) out.accessory = null;
    return out;
  }

  /* ================= Render ================= */

  function layerFiles(avatar) {
    var files = { body: 'body' };
    files.bottom = avatar.bottom;
    files.shoes = avatar.shoes;
    files.top = avatar.top;
    if (avatar.hijab) files.hijab = avatar.hijab;
    else files.hair = avatar.hair;
    var acc = I.get(avatar.accessory);
    if (acc && !blockedByHijab(acc, avatar)) files[acc.layer || 'accessory'] = acc.id;
    return files;
  }

  // Isi elemen dengan lapisan <img>. Elemen yang sama dipakai ulang agar tidak berkedip.
  // hide: daftar lapisan yang tidak digambar (dipakai ubin pilihan agar item terlihat jelas).
  function render(el, avatar, hide) {
    el.classList.add('avatar');
    if (!el.hasAttribute('role')) { el.setAttribute('role', 'img'); }
    if (!avatar) { el.textContent = ''; return el; }
    var files = layerFiles(avatar);
    I.LAYERS.forEach(function (layer, i) {
      var img = el.querySelector('img[data-layer="' + layer + '"]');
      var file = hide && hide.indexOf(layer) !== -1 ? null : files[layer];
      if (!file) { if (img) img.remove(); return; }
      if (!img) {
        img = document.createElement('img');
        img.alt = '';
        img.draggable = false;
        img.dataset.layer = layer;
        img.style.zIndex = i;
        el.appendChild(img);
      }
      var src = I.BASE_PATH + file + '.svg';
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
    el.setAttribute('aria-label', 'Avatar ' + (avatar.gender === 'girl' ? 'anak perempuan' : 'anak laki-laki'));
    return el;
  }

  function create(avatar, className, hide) {
    var el = document.createElement('div');
    if (className) el.className = className;
    return render(el, avatar, hide);
  }

  /* ================= Wizard ================= */

  var STEPS = [
    { key: 'gender', title: 'Pilih karakter', short: 'Karakter' },
    { key: 'head', title: 'Pilih rambut', short: 'Rambut' },
    { key: 'accessory', title: 'Pilih aksesoris', short: 'Aksesoris' },
    { key: 'top', title: 'Pilih baju', short: 'Baju' },
    { key: 'bottom', title: 'Pilih celana', short: 'Celana' },
    { key: 'shoes', title: 'Pilih sepatu', short: 'Sepatu' },
    { key: 'name', title: 'Nama panggilan', short: 'Nama' }
  ];

  // Fokus kamera tiap kategori pada ubin pilihan: z = zoom, y = titik tengah (unit viewBox 0–280).
  var FOCUS = {
    gender: { z: 0.7, y: 140 }, hair: { z: 1.45, y: 72 }, hijab: { z: 1.1, y: 110 },
    accessory: { z: 0.72, y: 140 }, accHead: { z: 1.3, y: 74 }, accBody: { z: 1.4, y: 140 },
    top: { z: 1.25, y: 162 }, bottom: { z: 1.25, y: 218 },
    shoes: { z: 1.9, y: 246 }
  };

  var state = { step: 0, avatar: null, nickname: '', headTab: 'hair', editing: false, onDone: null, onCancel: null };
  var els = {};

  function unlocked() { return S.getUnlockedItems() || []; }

  function tile(opts) {
    // opts: { label, avatar, focus, hide, selected, disabled, locked, note, big, onPick }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile' + (opts.selected ? ' selected' : '') + (opts.locked ? ' locked' : '') +
      (opts.disabled ? ' disabled' : '') + (opts.big ? ' big' : '');
    b.setAttribute('aria-pressed', opts.selected ? 'true' : 'false');
    if (opts.locked || opts.disabled) b.setAttribute('aria-disabled', 'true');

    var art = document.createElement('span');
    art.className = 'tile-art';
    var f = FOCUS[opts.focus] || FOCUS.gender;
    var av = create(opts.avatar, 'tile-avatar', opts.hide);
    av.style.width = (f.z * 100) + '%';
    av.style.top = ((0.5 - f.y * f.z / 200) * 100) + '%';
    art.appendChild(av);
    b.appendChild(art);

    var label = document.createElement('span');
    label.className = 'tile-label';
    label.textContent = opts.label;
    b.appendChild(label);

    if (opts.note) {
      var n = document.createElement('span');
      n.className = 'tile-note';
      n.textContent = opts.note;
      b.appendChild(n);
    }
    if (opts.selected) {
      var check = document.createElement('span');
      check.className = 'tile-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';
      b.appendChild(check);
    }
    b.addEventListener('click', function () {
      if (opts.locked) { WK.App.toast(opts.note || 'Item ini masih terkunci.'); return; }
      if (opts.disabled) { WK.App.toast(opts.note || 'Belum bisa dipilih.'); return; }
      opts.onPick();
    });
    return b;
  }

  function withItem(cat, id) {
    var a = Object.assign({}, state.avatar);
    a[cat] = id;
    if (cat === 'hair') a.hijab = null;
    return a;
  }

  function pick(cat, id) {
    var a = withItem(cat, id);
    if (cat === 'hijab') {
      var acc = I.get(a.accessory);
      if (blockedByHijab(acc, a)) {
        a.accessory = null;
        WK.App.toast(acc.name + ' dilepas karena memakai kerudung.');
      }
    }
    state.avatar = a;
    bounce();
    renderStep();
  }

  function bounce() {
    els.preview.classList.remove('bounce');
    void els.preview.offsetWidth;
    els.preview.classList.add('bounce');
  }

  function itemTiles(cat, focusKey) {
    var list = I.list(cat, state.avatar.gender);
    var un = unlocked();
    // item terbuka dulu, lalu hadiah yang masih terkunci
    list.sort(function (x, y) { return (isUnlocked(x, un) ? 0 : 1) - (isUnlocked(y, un) ? 0 : 1); });
    return list.map(function (it) {
      var locked = !isUnlocked(it, un);
      var preview = withItem(cat, it.id);
      var disabled = cat === 'accessory' && blockedByHijab(it, state.avatar);
      return tile({
        label: it.name,
        avatar: preview,
        hide: (cat === 'top' || cat === 'bottom' || cat === 'shoes') ? ['hijab', 'hair', 'accessory', 'back'] : null,
        focus: cat === 'accessory' ? (it.head ? 'accHead' : (it.layer === 'back' ? 'accessory' : 'accBody')) : (focusKey || cat),
        selected: state.avatar[cat] === it.id && (cat !== 'hair' || !state.avatar.hijab),
        locked: locked,
        disabled: disabled,
        note: locked ? '🔒 Hadiah Game ' + it.reward : (disabled ? 'Tidak bisa dengan kerudung' : ''),
        onPick: function () { pick(cat, it.id); }
      });
    });
  }

  function renderOptions() {
    var step = STEPS[state.step];
    var box = els.options;
    box.textContent = '';
    els.tabs.hidden = true;
    els.nameField.hidden = true;
    box.hidden = false;
    var grid = document.createElement('div');
    grid.className = 'tile-grid';

    if (step.key === 'gender') {
      grid.classList.add('two');
      ['girl', 'boy'].forEach(function (g) {
        var current = state.avatar && state.avatar.gender === g;
        grid.appendChild(tile({
          label: g === 'girl' ? 'Girl' : 'Boy',
          avatar: current ? state.avatar : I.DEFAULTS[g],
          focus: 'gender',
          big: true,
          selected: current,
          onPick: function () {
            if (!current) { state.avatar = Object.assign({}, I.DEFAULTS[g]); state.headTab = 'hair'; }
            bounce();
            renderStep();
          }
        }));
      });
    } else if (step.key === 'head') {
      var isGirl = state.avatar.gender === 'girl';
      els.tabs.hidden = !isGirl;
      if (!isGirl) state.headTab = 'hair';
      els.tabs.querySelectorAll('button').forEach(function (b) {
        var on = b.dataset.tab === state.headTab;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      itemTiles(state.headTab).forEach(function (t) { grid.appendChild(t); });
    } else if (step.key === 'accessory') {
      grid.appendChild(tile({
        label: 'Tanpa',
        avatar: withItem('accessory', null),
        focus: 'accessory',
        selected: !state.avatar.accessory,
        onPick: function () { pick('accessory', null); }
      }));
      itemTiles('accessory').forEach(function (t) { grid.appendChild(t); });
    } else if (step.key === 'name') {
      box.hidden = true;
      els.nameField.hidden = false;
      els.nameInput.value = state.nickname;
      return;
    } else {
      itemTiles(step.key).forEach(function (t) { grid.appendChild(t); });
    }
    box.appendChild(grid);
  }

  function stepTitle() {
    var step = STEPS[state.step];
    if (step.key === 'head' && state.avatar && state.avatar.gender === 'girl') return 'Pilih rambut atau kerudung';
    return step.title;
  }

  function renderStep() {
    var last = state.step === STEPS.length - 1;
    els.stepLabel.textContent = 'Langkah ' + (state.step + 1) + ' dari ' + STEPS.length;
    els.stepTitle.textContent = stepTitle();

    els.dots.querySelectorAll('button').forEach(function (d, i) {
      d.classList.toggle('done', i < state.step);
      d.classList.toggle('now', i === state.step);
      d.disabled = !state.avatar && i > 0;
      if (i === state.step) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });

    render(els.preview, state.avatar);
    els.empty.hidden = !!state.avatar;
    els.previewName.textContent = state.nickname.trim();
    els.previewName.hidden = !state.nickname.trim();

    renderOptions();

    els.back.textContent = state.step === 0 ? (state.editing ? 'Batal' : 'Kembali') : 'Kembali';
    els.back.hidden = state.step === 0 && !state.editing;
    els.next.textContent = last ? 'Simpan!' : 'Lanjut';
    els.next.disabled = !state.avatar;
    els.next.classList.toggle('berry', last);
    els.next.classList.toggle('sun', !last);
  }

  function go(step) {
    if (!state.avatar) return;
    state.step = Math.max(0, Math.min(STEPS.length - 1, step));
    renderStep();
    els.stepTitle.focus({ preventScroll: true });
    els.root.scrollIntoView({ block: 'start' });
  }

  function cleanName(v) {
    // Huruf, angka, spasi, titik, tanda hubung; maks 12 karakter.
    return String(v || '').replace(/[^\p{L}\p{N} .\-']/gu, '').replace(/\s+/g, ' ').slice(0, 12);
  }

  function save() {
    var avatar = normalize(state.avatar, unlocked());
    S.setAvatar(avatar);
    S.setNickname(state.nickname.trim());
    if (state.onDone) state.onDone(avatar);
  }

  function bindOnce() {
    if (els.root) return;
    els.root = document.getElementById('screen-avatar');
    els.preview = document.getElementById('avatar-preview');
    els.previewName = document.getElementById('avatar-preview-name');
    els.empty = document.getElementById('avatar-preview-empty');
    els.options = document.getElementById('avatar-options');
    els.tabs = document.getElementById('avatar-tabs');
    els.nameField = document.getElementById('avatar-name-field');
    els.nameInput = document.getElementById('avatar-name');
    els.stepLabel = document.getElementById('avatar-step-label');
    els.stepTitle = document.getElementById('avatar-step-title');
    els.dots = document.getElementById('avatar-dots');
    els.back = document.getElementById('avatar-back');
    els.next = document.getElementById('avatar-next');

    STEPS.forEach(function (s, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Langkah ' + (i + 1) + ': ' + s.short);
      d.textContent = i + 1;
      d.addEventListener('click', function () { go(i); });
      els.dots.appendChild(d);
    });

    els.tabs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]');
      if (!b) return;
      state.headTab = b.dataset.tab;
      renderStep();
    });

    els.nameInput.addEventListener('input', function () {
      var clean = cleanName(els.nameInput.value);
      if (clean !== els.nameInput.value) els.nameInput.value = clean;
      state.nickname = clean;
      els.previewName.textContent = clean.trim();
      els.previewName.hidden = !clean.trim();
    });
    els.nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); els.nameInput.blur(); save(); }
    });

    els.back.addEventListener('click', function () {
      if (state.step === 0) { if (state.onCancel) state.onCancel(); }
      else go(state.step - 1);
    });
    els.next.addEventListener('click', function () {
      if (state.step === STEPS.length - 1) save();
      else go(state.step + 1);
    });
  }

  // options: { onDone(avatar), onCancel() }
  function open(options) {
    bindOnce();
    var saved = normalize(S.getAvatar(), unlocked());
    state.editing = !!saved;
    state.avatar = saved;
    state.nickname = S.getNickname();
    state.headTab = saved && saved.hijab ? 'hijab' : 'hair';
    state.step = 0;
    state.onDone = options.onDone;
    state.onCancel = options.onCancel;
    renderStep();
  }

  window.WK.Avatar = {
    render: render,
    create: create,
    normalize: normalize,
    open: open
  };
})();
