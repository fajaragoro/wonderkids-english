/* cards-figure.js — figur orang FACELESS untuk kartu profesi (SVG dibuat di browser).
 * Gaya datar seperti gambar 2D lain: tanpa garis luar, warna cerah, bayangan lembut.
 * Wajah selalu kosong (tanpa mata, hidung, mulut, alis) sesuai aturan wajib.
 *
 * figure(opts) -> string SVG. opts:
 *   skin   : warna kulit
 *   hair   : 'short' | 'long' | 'bun' | 'none' | 'hijab'   hairColor
 *   hat    : lihat HATS di bawah (atau kosong)              hatColor
 *   top    : warna baju     bottom : warna celana/rok       skirt : true untuk rok
 *   coat   : warna jas panjang (mis. jas dokter putih)
 *   apron  : warna celemek  vest : warna rompi  tie : warna dasi
 *   badge  : warna lencana di dada   stripe : warna garis reflektif */
(function () {
  'use strict';

  var SKINS = ['#ffd2ac', '#f1b98c', '#d99a6c', '#a86b45', '#7a4a2c'];

  function shade(hex, f) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f);
    return '#' + [r, g, b].map(function (v) { return ('0' + Math.min(255, v).toString(16)).slice(-2); }).join('');
  }

  // Topi dan penutup kepala (kepala berpusat di 50,34 r=16)
  var HATS = {
    cap: function (c) {
      return '<path fill="' + c + '" d="M34 30c0-10 7-15 16-15s16 5 16 15z"/>' +
        '<path fill="' + shade(c, .8) + '" d="M58 28h16c2 0 2 4 0 4H58z"/>';
    },
    police: function (c) {
      return '<path fill="' + c + '" d="M31 27c0-8 9-12 19-12s19 4 19 12z"/>' +
        '<rect x="33" y="26" width="34" height="6" rx="2" fill="' + shade(c, .7) + '"/>' +
        '<path fill="#222a44" d="M36 31h28l-3 4H39z"/><circle cx="50" cy="22" r="3" fill="#ffc928"/>';
    },
    chef: function () {
      return '<path fill="#ffffff" d="M36 26c-5 0-7-5-4-9c2-3 6-3 8-1c1-4 5-6 10-6s9 2 10 6c2-2 6-2 8 1c3 4 1 9-4 9z"/>' +
        '<rect x="37" y="23" width="26" height="8" rx="2" fill="#eef2fb"/>';
    },
    fire: function (c) {
      return '<path fill="' + c + '" d="M32 32c0-11 8-18 18-18s18 7 18 18z"/>' +
        '<path fill="' + shade(c, .78) + '" d="M27 31h46c2 0 2 4 0 4H27c-2 0-2-4 0-4z"/>' +
        '<path fill="#ffc928" d="M46 17h8v9h-8z"/>';
    },
    hard: function (c) {
      return '<path fill="' + c + '" d="M33 31c0-10 7-16 17-16s17 6 17 16z"/>' +
        '<path fill="' + shade(c, .82) + '" d="M29 30h42c2 0 2 4 0 4H29c-2 0-2-4 0-4zM48 15h4v14h-4z"/>';
    },
    pilot: function (c) {
      return '<path fill="' + c + '" d="M32 27c0-7 8-11 18-11s18 4 18 11z"/>' +
        '<rect x="33" y="25" width="34" height="6" rx="2" fill="' + shade(c, .7) + '"/>' +
        '<path fill="#222a44" d="M37 30h26l-3 4H40z"/><path fill="#ffc928" d="M44 20h12l-2 3h-8z"/>';
    },
    nurse: function () {
      return '<path fill="#ffffff" d="M37 24l3-8h20l3 8z"/><path fill="#ff4f7b" d="M48 17h4v6h-4zM47 18.5h6v3h-6z"/>';
    },
    straw: function () {
      return '<ellipse cx="50" cy="27" rx="27" ry="6" fill="#f2c86b"/>' +
        '<path fill="#e8b64a" d="M37 26c0-8 6-12 13-12s13 4 13 12z"/><path fill="#c0392b" d="M37 23h26v3H37z"/>';
    },
    beret: function (c) {
      return '<ellipse cx="47" cy="22" rx="19" ry="8" fill="' + c + '"/><circle cx="47" cy="13" r="2" fill="' + c + '"/>';
    },
    cowboy: function (c) {
      return '<ellipse cx="50" cy="27" rx="26" ry="5" fill="' + shade(c, .85) + '"/>' +
        '<path fill="' + c + '" d="M38 26c0-9 4-14 12-14s12 5 12 14z"/><path fill="' + shade(c, .6) + '" d="M38 22h24v3H38z"/>';
    },
    grad: function (c) {
      return '<path fill="' + c + '" d="M28 20l22-8l22 8l-22 8z"/><path fill="' + shade(c, .8) + '" d="M38 24h24v6H38z"/>' +
        '<path stroke="#ffc928" stroke-width="2" d="M70 20v10"/>';
    },
    astro: function () {
      return '<circle cx="50" cy="34" r="22" fill="#e9eef8"/><circle cx="50" cy="34" r="16" fill="#3a4a8a"/>' +
        '<path fill="#6e83d6" d="M40 26c3-4 9-5 13-3c-6 0-10 2-13 6z"/>';
    },
    crown: function () {
      return '<path fill="#ffc928" d="M36 22l4-10l5 7l5-9l5 9l5-7l4 10z"/>';
    },
    headset: function (c) {
      return '<path stroke="' + c + '" stroke-width="4" fill="none" d="M33 34c0-12 7-19 17-19s17 7 17 19"/>' +
        '<rect x="29" y="31" width="7" height="11" rx="3" fill="' + c + '"/><rect x="64" y="31" width="7" height="11" rx="3" fill="' + c + '"/>' +
        '<path stroke="' + c + '" stroke-width="2.5" fill="none" d="M33 41c2 6 8 8 12 8"/>';
    },
    bandana: function (c) {
      return '<path fill="' + c + '" d="M34 30c0-9 7-15 16-15s16 6 16 15z"/><path fill="' + c + '" d="M64 26l8 4l-4 6z"/>';
    },
    hood: function (c) {
      return '<path fill="' + c + '" d="M30 40c0-16 9-24 20-24s20 8 20 24l-4 4V30c0-6-7-10-16-10s-16 4-16 10v14z"/>';
    },
    mask: function () {
      return '<path fill="#ffffff" d="M36 30c0-9 6-14 14-14s14 5 14 14z"/><rect x="38" y="36" width="24" height="9" rx="4" fill="#bfe8ff"/>' +
        '<path stroke="#bfe8ff" stroke-width="1.5" d="M38 39l-4-3M62 39l4-3"/>';
    }
  };

  function hairSvg(kind, c) {
    switch (kind) {
      case 'long': return '<path fill="' + c + '" d="M32 36c-2-14 6-22 18-22s20 8 18 22l2 22H62V34c-4-6-20-6-24 0v24H30z"/>';
      case 'bun': return '<circle cx="50" cy="14" r="7" fill="' + c + '"/><path fill="' + c + '" d="M34 32c0-10 7-16 16-16s16 6 16 16c-5-5-27-5-32 0z"/>';
      case 'short': return '<path fill="' + c + '" d="M34 32c-1-11 6-17 16-17s17 6 16 17c-3-4-8-6-12-6s-6 2-10 2s-7-1-10 4z"/>';
      default: return '';
    }
  }

  function figure(o) {
    o = o || {};
    var skin = o.skin || SKINS[0];
    var top = o.top || '#22b0f2';
    var bottom = o.bottom || '#3654e8';
    var shoes = o.shoes || '#3a3550';
    var s = '';
    // bayangan tanah
    s += '<ellipse cx="50" cy="133" rx="24" ry="4" fill="#1f2260" opacity=".12"/>';
    // kaki
    if (o.skirt) {
      s += '<rect x="40" y="104" width="7" height="24" rx="3" fill="' + skin + '"/><rect x="53" y="104" width="7" height="24" rx="3" fill="' + skin + '"/>';
      s += '<path fill="' + bottom + '" d="M37 86h26l5 24H32z"/>';
    } else {
      s += '<path fill="' + bottom + '" d="M38 86h11v42h-9zM51 86h11l-2 42h-9z"/>';
      s += '<path fill="' + shade(bottom, .85) + '" d="M51 86h11l-2 42h-4z"/>';
    }
    s += '<path fill="' + shoes + '" d="M37 126h12v5H35c0-3 1-5 2-5zM51 126h12c1 0 2 2 2 5H51z"/>';
    // lengan
    var sleeve = o.coat || top;
    s += '<path fill="' + sleeve + '" d="M33 56l-9 26l7 3l8-20zM67 56l9 26l-7 3l-8-20z"/>';
    s += '<circle cx="27" cy="86" r="4.5" fill="' + skin + '"/><circle cx="73" cy="86" r="4.5" fill="' + skin + '"/>';
    // badan
    s += '<path fill="' + top + '" d="M36 52h28c4 0 6 3 6 7v31H30V59c0-4 2-7 6-7z"/>';
    s += '<path fill="' + shade(top, .86) + '" d="M58 52h6c4 0 6 3 6 7v31h-12z"/>';
    if (o.coat) {
      s += '<path fill="' + o.coat + '" d="M36 52h7l3 46H30V59c0-4 2-7 6-7zM64 52h-7l-3 46h16V59c0-4-2-7-6-7z"/>';
      s += '<path fill="' + shade(o.coat, .9) + '" d="M57 52h7c4 0 6 3 6 7v39h-16z" opacity=".5"/>';
    }
    if (o.vest) s += '<path fill="' + o.vest + '" d="M35 53h9l2 37H31V60c0-4 1-7 4-7zM65 53h-9l-2 37h15V60c0-4-1-7-4-7z"/>';
    if (o.stripe) s += '<path fill="' + o.stripe + '" d="M30 74h40v4H30z"/>';
    if (o.apron) s += '<path fill="' + o.apron + '" d="M40 60h20v38H38z"/><path stroke="' + o.apron + '" stroke-width="2" d="M40 60l-4-8M60 60l4-8"/>';
    if (o.tie) s += '<path fill="' + o.tie + '" d="M48 54h4l1 4l-2 16l-1 2l-1-2l-2-16z"/>';
    if (o.badge) s += '<path fill="' + o.badge + '" d="M58 62l3 1.5l3-1.5v5l-3 2l-3-2z"/>';
    if (o.belt) s += '<path fill="' + o.belt + '" d="M30 84h40v4H30z"/>';
    // leher & kepala (FACELESS: tidak ada mata/hidung/mulut)
    s += '<rect x="45" y="44" width="10" height="10" rx="3" fill="' + skin + '"/>';
    if (o.hair === 'long') s += hairSvg('long', o.hairColor || '#4a2f23');
    if (o.hair === 'hijab') {
      var hj = o.hijabColor || '#7a3df0';
      s += '<path fill="' + hj + '" d="M30 38c0-14 9-22 20-22s20 8 20 22v18c-6 6-34 6-40 0z"/>';
      s += '<ellipse cx="50" cy="36" rx="13" ry="14" fill="' + skin + '"/>';
      s += '<path fill="' + shade(hj, .85) + '" d="M60 22c6 4 10 10 10 16v18c-2 2-6 3-10 4z"/>';
    } else {
      s += '<circle cx="50" cy="34" r="16" fill="' + skin + '"/>';
      s += '<path fill="' + shade(skin, .9) + '" d="M58 21a16 16 0 0 1 0 26a14 14 0 0 0 0-26z"/>';
      s += '<ellipse cx="34" cy="35" rx="2.5" ry="4" fill="' + shade(skin, .92) + '"/><ellipse cx="66" cy="35" rx="2.5" ry="4" fill="' + shade(skin, .92) + '"/>';
      if (o.hair && o.hair !== 'long') s += hairSvg(o.hair, o.hairColor || '#4a2f23');
      if (o.hair === 'long') s += '<path fill="' + (o.hairColor || '#4a2f23') + '" d="M34 32c0-11 7-17 16-17s16 6 16 17c-4-5-9-7-16-7s-12 2-16 7z"/>';
    }
    if (o.hat && HATS[o.hat]) s += HATS[o.hat](o.hatColor || '#3654e8');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 138" class="figure" aria-hidden="true">' + s + '</svg>';
  }

  window.WK = window.WK || {};
  window.WK.Figure = { figure: figure, SKINS: SKINS, HATS: Object.keys(HATS) };
})();
