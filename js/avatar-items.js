/* avatar-items.js — katalog item avatar.
 * Setiap item = satu file SVG di assets/avatar/{id}.svg (viewBox 0 0 200 280, ditumpuk berlapis).
 * Untuk menambah item: taruh file SVG, lalu tambah satu baris di ITEMS.
 *
 * Field:
 *   id       : nama file tanpa .svg
 *   cat      : hair | hijab | accessory | top | bottom | shoes
 *   genders  : ['girl'], ['boy'], atau ['girl','boy']
 *   name     : nama tampil (Bahasa Indonesia)
 *   layer    : (opsional, aksesoris) 'back' = di belakang badan, default 'accessory'
 *   head     : (aksesoris) true jika dipakai di kepala
 *   hijabOk  : (aksesoris kepala) true jika boleh diletakkan di atas kerudung
 *   reward   : nomor game yang membuka item ini sebagai hadiah (item terkunci sampai terbuka)
 */
(function () {
  'use strict';

  var G = ['girl'], B = ['boy'], U = ['girl', 'boy'];

  var ITEMS = [
    // Rambut
    { id: 'hair-g-ponytail', cat: 'hair', genders: G, name: 'Kuncir' },
    { id: 'hair-g-bob', cat: 'hair', genders: G, name: 'Bob berponi' },
    { id: 'hair-g-long', cat: 'hair', genders: G, name: 'Panjang' },
    { id: 'hair-g-pigtails', cat: 'hair', genders: G, name: 'Kuncir dua' },
    { id: 'hair-b-short', cat: 'hair', genders: B, name: 'Pendek' },
    { id: 'hair-b-spiky', cat: 'hair', genders: B, name: 'Jabrik' },
    { id: 'hair-b-curly', cat: 'hair', genders: B, name: 'Ikal' },
    { id: 'hair-b-sidepart', cat: 'hair', genders: B, name: 'Belah samping' },

    // Kerudung (hanya Girl)
    { id: 'hijab-g-pink', cat: 'hijab', genders: G, name: 'Kerudung pink' },
    { id: 'hijab-g-lavender-long', cat: 'hijab', genders: G, name: 'Kerudung panjang ungu' },
    { id: 'hijab-g-sky-sport', cat: 'hijab', genders: G, name: 'Kerudung sport biru' },
    { id: 'hijab-g-mint-dots', cat: 'hijab', genders: G, name: 'Kerudung hijau polkadot' },

    // Aksesoris
    { id: 'acc-g-headband', cat: 'accessory', genders: G, name: 'Bando', head: true, hijabOk: false },
    { id: 'acc-g-bow', cat: 'accessory', genders: G, name: 'Pita', head: true, hijabOk: true },
    { id: 'acc-g-necklace', cat: 'accessory', genders: G, name: 'Kalung bintang' },
    { id: 'acc-g-backpack', cat: 'accessory', genders: G, name: 'Ransel oranye', layer: 'back' },
    { id: 'acc-b-cap', cat: 'accessory', genders: B, name: 'Topi', head: true, hijabOk: false },
    { id: 'acc-b-backpack', cat: 'accessory', genders: B, name: 'Ransel biru', layer: 'back' },
    { id: 'acc-b-scarf', cat: 'accessory', genders: B, name: 'Syal' },
    { id: 'acc-b-bowtie', cat: 'accessory', genders: B, name: 'Dasi kupu-kupu' },

    // Baju
    { id: 'top-g-tee-pink', cat: 'top', genders: G, name: 'Kaos pink' },
    { id: 'top-g-blouse-yellow', cat: 'top', genders: G, name: 'Blus kuning' },
    { id: 'top-g-tunic-purple', cat: 'top', genders: G, name: 'Tunik ungu' },
    { id: 'top-g-tee-stripe-mint', cat: 'top', genders: G, name: 'Kaos garis hijau' },
    { id: 'top-g-sweater-sky', cat: 'top', genders: G, name: 'Sweter biru' },
    { id: 'top-b-tee-blue', cat: 'top', genders: B, name: 'Kaos biru' },
    { id: 'top-b-tee-stripe-red', cat: 'top', genders: B, name: 'Kaos garis merah' },
    { id: 'top-b-polo-green', cat: 'top', genders: B, name: 'Polo hijau' },
    { id: 'top-b-hoodie-orange', cat: 'top', genders: B, name: 'Hoodie oranye' },
    { id: 'top-b-polo-yellow', cat: 'top', genders: B, name: 'Polo kuning' },

    // Celana
    { id: 'bottom-g-skirt-long-purple', cat: 'bottom', genders: G, name: 'Rok panjang ungu' },
    { id: 'bottom-g-jeans', cat: 'bottom', genders: G, name: 'Celana jin' },
    { id: 'bottom-g-skirt-pink', cat: 'bottom', genders: G, name: 'Rok pink' },
    { id: 'bottom-g-culotte-green', cat: 'bottom', genders: G, name: 'Kulot hijau' },
    { id: 'bottom-b-jeans', cat: 'bottom', genders: B, name: 'Celana jin' },
    { id: 'bottom-b-shorts-khaki', cat: 'bottom', genders: B, name: 'Celana pendek' },
    { id: 'bottom-b-joggers-grey', cat: 'bottom', genders: B, name: 'Celana training' },
    { id: 'bottom-b-cargo-green', cat: 'bottom', genders: B, name: 'Celana kargo' },

    // Sepatu
    { id: 'shoes-g-sneaker-pink', cat: 'shoes', genders: G, name: 'Sneaker pink' },
    { id: 'shoes-g-sneaker-white', cat: 'shoes', genders: G, name: 'Sneaker putih' },
    { id: 'shoes-g-flat-purple', cat: 'shoes', genders: G, name: 'Flat ungu' },
    { id: 'shoes-g-sneaker-sky', cat: 'shoes', genders: G, name: 'Sneaker biru muda' },
    { id: 'shoes-b-sneaker-blue', cat: 'shoes', genders: B, name: 'Sneaker biru' },
    { id: 'shoes-b-sneaker-white', cat: 'shoes', genders: B, name: 'Sneaker putih' },
    { id: 'shoes-b-sneaker-red', cat: 'shoes', genders: B, name: 'Sneaker merah' },
    { id: 'shoes-b-sandal-brown', cat: 'shoes', genders: B, name: 'Sandal' },

    // Hadiah (terbuka setelah game tertentu selesai, Tahap 4)
    { id: 'acc-u-crown', cat: 'accessory', genders: U, name: 'Mahkota', head: true, hijabOk: true, reward: 1 },
    { id: 'top-u-star-gold', cat: 'top', genders: U, name: 'Kaos bintang emas', reward: 2 },
    { id: 'shoes-u-sneaker-rainbow', cat: 'shoes', genders: U, name: 'Sneaker pelangi', reward: 3 },
    { id: 'acc-u-cape', cat: 'accessory', genders: U, name: 'Jubah pahlawan', layer: 'back', reward: 4 },
    { id: 'bottom-u-galaxy', cat: 'bottom', genders: U, name: 'Celana galaksi', reward: 5 },
    { id: 'acc-u-flowercrown', cat: 'accessory', genders: U, name: 'Mahkota bunga', head: true, hijabOk: true, reward: 6 },
    { id: 'top-u-vest-explorer', cat: 'top', genders: U, name: 'Rompi penjelajah', reward: 7 },
    { id: 'shoes-u-boots-yellow', cat: 'shoes', genders: U, name: 'Sepatu bot kuning', reward: 8 },
    { id: 'acc-u-headphones', cat: 'accessory', genders: U, name: 'Headphone', head: true, hijabOk: true, reward: 9 },
    { id: 'top-u-jacket-rainbow', cat: 'top', genders: U, name: 'Jaket pelangi', reward: 10 }
  ];

  // Urutan lapisan dari paling belakang ke paling depan.
  var LAYERS = ['back', 'body', 'bottom', 'shoes', 'top', 'hijab', 'hair', 'accessory'];

  var DEFAULTS = {
    girl: { gender: 'girl', hair: 'hair-g-ponytail', hijab: null, accessory: null,
            top: 'top-g-tee-pink', bottom: 'bottom-g-jeans', shoes: 'shoes-g-sneaker-pink' },
    boy:  { gender: 'boy', hair: 'hair-b-short', hijab: null, accessory: null,
            top: 'top-b-tee-blue', bottom: 'bottom-b-jeans', shoes: 'shoes-b-sneaker-blue' }
  };

  var byId = {};
  ITEMS.forEach(function (it) { byId[it.id] = it; });

  window.WK = window.WK || {};
  window.WK.AvatarItems = {
    ITEMS: ITEMS,
    LAYERS: LAYERS,
    DEFAULTS: DEFAULTS,
    BASE_PATH: 'assets/avatar/',
    get: function (id) { return byId[id] || null; },
    list: function (cat, gender) {
      return ITEMS.filter(function (it) { return it.cat === cat && it.genders.indexOf(gender) !== -1; });
    },
    rewardForGame: function (game) {
      for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].reward === game) return ITEMS[i];
      return null;
    }
  };
})();
