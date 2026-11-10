/* storage.js — wrapper localStorage untuk Wonder Kids English.
 * Semua data disimpan di satu key JSON. Setiap baca/tulis dibungkus try/catch,
 * jadi aplikasi tetap jalan (tanpa simpan) bila localStorage diblokir. */
(function () {
  'use strict';

  var KEY = 'wonderkids-english';
  var VERSION = 1;

  function defaults() {
    return {
      version: VERSION,
      access: false,        // status kode masuk
      avatar: null,         // { gender, hair, hijab, accessory, top, bottom, shoes } berisi ID item
      nickname: '',         // nama panggilan, maks 12 karakter
      tier: null,           // 1 | 2 | 3
      progress: {},         // { "t1": { "g1": [bintang stage1, stage2, ...] } }
      unlockedItems: [],    // ID item avatar hadiah
      settings: { sound: true }
    };
  }

  var memory = null;   // salinan di memori (dipakai juga jika localStorage gagal)
  var available = true;

  function load() {
    if (memory) return memory;
    var data = defaults();
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') data = migrate(parsed);
      }
    } catch (e) {
      available = false;
    }
    memory = data;
    return memory;
  }

  // Tempat menambah migrasi bila struktur data berubah di versi berikutnya.
  function migrate(d) {
    var base = defaults();
    Object.keys(base).forEach(function (k) {
      if (!(k in d)) d[k] = base[k];
    });
    d.version = VERSION;
    return d;
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(memory));
      available = true;
      return true;
    } catch (e) {
      available = false;
      return false;
    }
  }

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

  var Storage = {
    isAvailable: function () { load(); return available; },

    get: function (field) { return clone(load()[field]); },

    set: function (field, value) {
      load()[field] = clone(value);
      return save();
    },

    /* --- akses --- */
    hasAccess: function () { return load().access === true; },
    setAccess: function (ok) { return Storage.set('access', !!ok); },

    /* --- avatar --- */
    getAvatar: function () { return Storage.get('avatar'); },
    setAvatar: function (avatar) { return Storage.set('avatar', avatar); },
    getNickname: function () { return load().nickname || ''; },
    setNickname: function (name) {
      return Storage.set('nickname', String(name || '').trim().slice(0, 12));
    },

    /* --- tingkat --- */
    getTier: function () { return load().tier; },
    setTier: function (tier) { return Storage.set('tier', tier); },

    /* --- progres per game per tingkat --- */
    getStageStars: function (tier, game) {
      var t = load().progress['t' + tier] || {};
      return clone(t['g' + game] || []);
    },
    // Simpan bintang stage; hanya naik, tidak pernah turun saat diulang.
    setStageStars: function (tier, game, stage, stars) {
      var p = load().progress;
      var t = p['t' + tier] || (p['t' + tier] = {});
      var g = t['g' + game] || (t['g' + game] = []);
      var i = stage - 1;
      g[i] = Math.max(g[i] || 0, stars);
      for (var k = 0; k < g.length; k++) if (g[k] == null) g[k] = 0;
      return save();
    },
    getTotalStars: function (tier) {
      var t = load().progress['t' + tier] || {};
      var sum = 0;
      Object.keys(t).forEach(function (g) {
        t[g].forEach(function (s) { sum += s || 0; });
      });
      return sum;
    },

    /* --- item hadiah --- */
    getUnlockedItems: function () { return Storage.get('unlockedItems'); },
    unlockItem: function (id) {
      var list = load().unlockedItems;
      if (list.indexOf(id) === -1) list.push(id);
      return save();
    },

    /* --- pengaturan --- */
    // Reset progres: hapus tingkat, bintang, dan item hadiah. Avatar & status masuk tetap.
    resetProgress: function () {
      var d = load();
      d.tier = null;
      d.progress = {};
      d.unlockedItems = [];
      return save();
    },
    // Keluar: hanya mencabut status kode masuk.
    logout: function () { return Storage.setAccess(false); },
    // Hapus semua data (dipakai untuk pengujian).
    clearAll: function () {
      memory = defaults();
      try { window.localStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
      return true;
    }
  };

  window.WK = window.WK || {};
  window.WK.Storage = Storage;
})();
