/* sw.js — service worker: game bisa dimainkan offline setelah dibuka sekali.
 * Strategi: file aplikasi disimpan saat pemasangan; setiap permintaan dilayani dari cache
 * lalu diperbarui di belakang layar (stale-while-revalidate).
 * Setelah mengubah file, jalankan  python3 tools/update_sw.py  agar versi naik dan cache diperbarui. */
'use strict';

var VERSION = 'wk-20261110-094348';
var PRECACHE = [
  './',
  'assets/avatar/acc-b-backpack.svg',
  'assets/avatar/acc-b-bowtie.svg',
  'assets/avatar/acc-b-cap.svg',
  'assets/avatar/acc-b-scarf.svg',
  'assets/avatar/acc-g-backpack.svg',
  'assets/avatar/acc-g-bow.svg',
  'assets/avatar/acc-g-headband.svg',
  'assets/avatar/acc-g-necklace.svg',
  'assets/avatar/acc-u-cape.svg',
  'assets/avatar/acc-u-crown.svg',
  'assets/avatar/acc-u-flowercrown.svg',
  'assets/avatar/acc-u-headphones.svg',
  'assets/avatar/body.svg',
  'assets/avatar/bottom-b-cargo-green.svg',
  'assets/avatar/bottom-b-jeans.svg',
  'assets/avatar/bottom-b-joggers-grey.svg',
  'assets/avatar/bottom-b-shorts-khaki.svg',
  'assets/avatar/bottom-g-culotte-green.svg',
  'assets/avatar/bottom-g-jeans.svg',
  'assets/avatar/bottom-g-skirt-long-purple.svg',
  'assets/avatar/bottom-g-skirt-pink.svg',
  'assets/avatar/bottom-u-galaxy.svg',
  'assets/avatar/hair-b-curly.svg',
  'assets/avatar/hair-b-short.svg',
  'assets/avatar/hair-b-sidepart.svg',
  'assets/avatar/hair-b-spiky.svg',
  'assets/avatar/hair-g-bob.svg',
  'assets/avatar/hair-g-long.svg',
  'assets/avatar/hair-g-pigtails.svg',
  'assets/avatar/hair-g-ponytail.svg',
  'assets/avatar/hijab-g-lavender-long.svg',
  'assets/avatar/hijab-g-mint-dots.svg',
  'assets/avatar/hijab-g-pink.svg',
  'assets/avatar/hijab-g-sky-sport.svg',
  'assets/avatar/shoes-b-sandal-brown.svg',
  'assets/avatar/shoes-b-sneaker-blue.svg',
  'assets/avatar/shoes-b-sneaker-red.svg',
  'assets/avatar/shoes-b-sneaker-white.svg',
  'assets/avatar/shoes-g-flat-purple.svg',
  'assets/avatar/shoes-g-sneaker-pink.svg',
  'assets/avatar/shoes-g-sneaker-sky.svg',
  'assets/avatar/shoes-g-sneaker-white.svg',
  'assets/avatar/shoes-u-boots-yellow.svg',
  'assets/avatar/shoes-u-sneaker-rainbow.svg',
  'assets/avatar/top-b-hoodie-orange.svg',
  'assets/avatar/top-b-polo-green.svg',
  'assets/avatar/top-b-polo-yellow.svg',
  'assets/avatar/top-b-tee-blue.svg',
  'assets/avatar/top-b-tee-stripe-red.svg',
  'assets/avatar/top-g-blouse-yellow.svg',
  'assets/avatar/top-g-sweater-sky.svg',
  'assets/avatar/top-g-tee-pink.svg',
  'assets/avatar/top-g-tee-stripe-mint.svg',
  'assets/avatar/top-g-tunic-purple.svg',
  'assets/avatar/top-u-jacket-rainbow.svg',
  'assets/avatar/top-u-star-gold.svg',
  'assets/avatar/top-u-vest-explorer.svg',
  'assets/images/animals/bird.svg',
  'assets/images/animals/butterfly.svg',
  'assets/images/animals/cat.svg',
  'assets/images/animals/chicken.svg',
  'assets/images/animals/cow.svg',
  'assets/images/animals/dog.svg',
  'assets/images/animals/duck.svg',
  'assets/images/animals/elephant.svg',
  'assets/images/animals/fish.svg',
  'assets/images/animals/horse.svg',
  'assets/images/animals/pig.svg',
  'assets/images/animals/rabbit.svg',
  'assets/images/animals/sheep.svg',
  'assets/images/animals/turtle.svg',
  'assets/images/favicon.png',
  'assets/images/icon-192.png',
  'assets/images/icon-512.png',
  'assets/images/logo.webp',
  'assets/images/mascot.svg',
  'css/style.css',
  'data/game01.json',
  'data/game02.json',
  'data/game03.json',
  'data/game04.json',
  'data/game05.json',
  'data/game06.json',
  'data/game07.json',
  'data/game08.json',
  'data/game09.json',
  'data/game10.json',
  'index.html',
  'js/access.js',
  'js/app.js',
  'js/avatar-items.js',
  'js/avatar.js',
  'js/config.js',
  'js/games/choice.js',
  'js/games/game01.js',
  'js/games/game02.js',
  'js/games/game03.js',
  'js/games/game04.js',
  'js/games/game05.js',
  'js/games/game06.js',
  'js/games/game07.js',
  'js/games/game08.js',
  'js/games/game09.js',
  'js/games/game10.js',
  'js/games/kit.js',
  'js/map.js',
  'js/speech.js',
  'js/stage.js',
  'js/storage.js',
  'manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (cache) {
      // addAll gagal total jika satu file hilang; tambahkan satu per satu agar tetap tahan banting.
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(url).catch(function () { /* lewati file yang gagal */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  e.respondWith(
    caches.open(VERSION).then(function (cache) {
      var key = req.mode === 'navigate' ? 'index.html' : req;
      return cache.match(key, { ignoreSearch: req.mode === 'navigate' }).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && (res.ok || res.type === 'opaque')) cache.put(key, res.clone());
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
