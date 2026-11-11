# Wonder Kids English

Web game bahasa Inggris untuk anak 5–10 tahun. HTML, CSS, dan JavaScript murni, tanpa build tool.
Rancangan lengkap: [docs/DESIGN.md](docs/DESIGN.md).

## Menjalankan

Dari folder proyek:

```bash
python3 -m http.server 8000
```

Lalu buka http://localhost:8000. Tambahkan `?nosw` di URL saat mengembangkan agar tidak memakai cache offline. Untuk mencoba dari HP di jaringan Wi-Fi yang sama, buka `http://<IP-komputer>:8000`.

Mode uji: tambahkan `?dev` di URL (mis. http://localhost:8000/?dev) untuk tombol "selesaikan stage dengan x/10".

Kode masuk: `3016` (diatur di `js/access.js`, konstanta `ACCESS_CODE`).

## Struktur

```
index.html        Halaman utama, kode masuk, kerangka layar
manifest.webmanifest, sw.js   Pasang di layar utama + mode offline (PWA)
css/style.css     Tema ilustrasi 2D datar (latar biru berpola, kartu berbingkai putih, gelombang ungu), mobile-first
js/storage.js     Wrapper localStorage (key: wonderkids-english)
js/access.js      Kode masuk
js/app.js         Routing layar, pengaturan (Keluar, Reset progres, Ubah avatar)
js/avatar-items.js Katalog item avatar (tambah item = 1 file SVG + 1 baris di sini)
js/avatar.js      Render avatar berlapis + wizard kustomisasi
js/config.js      Tingkat, daftar 10 game, aturan bintang (nilai awal, bisa diubah)
js/map.js         Pilih tingkat, peta petualangan, aturan buka kunci (WK.Progress)
js/speech.js      Suara: speechSynthesis (en-US, pilih suara terjernih) + SpeechRecognition (Game 10)
js/sfx.js         Efek suara (klik, benar, salah, menang) dibuat dengan Web Audio, tanpa file audio
js/stage.js       Engine stage: muat soal, salah/benar, skor, bintang, ringkasan, hadiah
js/games/         kit.js (helper), choice.js (modul generik), game01.js … game10.js
assets/images/    Logo, maskot, ikon, pola latar (pattern.svg), gelombang kartu (wave.svg)
assets/emoji/     Gambar 2D untuk setiap emoji yang dipakai (Fluent Emoji Flat), dibuat oleh tools/emoji
assets/avatar/    SVG item avatar, semua viewBox 0 0 200 280 (placeholder, ganti dengan desain final dengan nama file sama)
data/             game01.json … game10.json (1000 soal: 30/30/40 per game)
tools/update_sw.py  Perbarui daftar file offline di sw.js
tools/emoji/      build.js: salin SVG Fluent Emoji Flat untuk semua emoji yang dipakai ke assets/emoji
tools/style2d.py  Ubah SVG karakter (avatar, maskot, hewan) ke gaya 2D: garis ungu tua, warna cerah, bayangan & kilau
tools/content/    Sumber soal (g01.py … g10.py) + build.py (validasi & tulis data/*.json)
```

Aturan desain wajib: semua makhluk hidup tampil tanpa wajah (faceless).

## Format soal per game

Semua soal mengikuti struktur DESIGN.md bagian 11. Jawaban dicocokkan persis (huruf besar/kecil dan tanda baca).

| Game | `type` | Isi penting |
|---|---|---|
| 1 Pasangkan | `match_image` | `image` emoji, `options` kata, `answer` |
| 2 Susun Huruf | `spell_letters` | `image`, `answer` kata; `options` = huruf pengecoh (opsional) |
| 3 Tebak Gambar | `guess_image` | `image`, `prompt` = petunjuk (Inggris), `options`, `answer` |
| 4 Kalimat Rumpang | `fill_blank` | `prompt` dengan `___`, `options`, `answer`, `audio` = kalimat lengkap |
| 5 Pop Balon | `pop_balloon` | `prompt` kata Inggris, `options` = arti (Indonesia), `answer` |
| 6 Memory Card | `memory_card` | `image`, `options` 3–4 kata, `answer` |
| 7 Dengarkan | `listen_choose` | `audio` = yang diucapkan, `options`, `answer` |
| 8 Susun Kalimat | `arrange_words` | `answer` = kalimat (dipecah per spasi), `options` kosong |
| 9 Kejar Bintang | `runner` | campuran: `prompt`, `image` opsional, `options`, `answer` |
| 10 Ulangi Yuk | `speak_repeat` | `prompt`/`answer` = yang diucapkan; `options` = kata mirip untuk mode alternatif |

Aturan wajib gambar: tanpa makhluk berwajah (emoji hewan/orang/matahari berwajah tidak dipakai).

## Suara

- Semua suara memakai suara bawaan browser (Web Speech API), bahasa English (US). Suara berbeda tiap perangkat.
- Efek suara: setiap tombol berbunyi "pop" saat diketuk; jawaban benar, salah, dan selesai stage punya bunyi sendiri.
  Dibuat langsung dengan Web Audio (jalan offline). Tombol dengan atribut `data-silent` tidak berbunyi (mis. tombol mikrofon Game 10).
  Ubah nada atau volume di `js/sfx.js`.
- Suara (ucapan dan efek) bisa dimatikan di Pengaturan. Saat suara mati atau tidak didukung, Game 7 menampilkan teksnya langsung.
- Game 10 memakai mikrofon (SpeechRecognition) bila didukung: Chrome/Edge (butuh internet) dan Safari iOS 14.5+.
  Mikrofon hanya jalan di `https://` atau `localhost`. Jika tidak didukung, izin ditolak, atau tidak ada internet,
  game otomatis pindah ke mode pilih rekaman.

## Mengubah soal

Sumber soal ada di `tools/content/gXX.py` (satu file per game, daftar `T1`, `T2`, `T3` dari mudah ke sulit;
setiap 10 soal = 1 stage). Setelah mengedit, jalankan:

```bash
python3 tools/content/build.py 1 2 3 4 5 6 7 8 9 10
```

Validator memeriksa jumlah soal per tingkat, ID unik, jawaban ada di pilihan, format per game, dan menolak
emoji berwajah/makhluk hidup. Hewan memakai siluet tanpa wajah di `assets/images/animals/`.

## Mengunggah (GitHub Pages / Netlify)

1. Jalankan `python3 tools/update_sw.py` agar daftar file offline dan versinya diperbarui.
2. Unggah seluruh isi folder (kecuali `tools/` dan `docs/` bila tidak ingin dipublikasikan) ke hosting statis HTTPS:
   - **Netlify**: seret folder ke app.netlify.com/drop.
   - **GitHub Pages**: unggah ke repositori, lalu Settings > Pages > Deploy from branch.
3. Buka alamatnya di HP, lalu jalankan daftar uji di `docs/UJI-PERANGKAT.md`.

Setelah pembaruan, pengguna mendapat versi baru pada pembukaan berikutnya (versi lama dilayani dulu dari cache, versi baru diunduh di belakang layar).

## Navigasi dan offline

- Tombol Back Android/browser bergerak di dalam game (stage → konfirmasi keluar, ringkasan → peta, peta → beranda); dari beranda baru keluar.
- Setelah dibuka sekali lewat HTTPS, seluruh game (1000 soal, gambar, avatar) bisa dimainkan tanpa internet.

## Gambar 2D

- Emoji di soal dan tampilan **tidak** digambar oleh HP, tetapi diganti otomatis oleh `js/emoji.js` dengan file
  `assets/emoji/<kode>.svg`, supaya gayanya sama di semua perangkat dan tetap jalan offline.
- Setelah menambah emoji baru di soal atau kode, jalankan:
  ```bash
  cd tools/emoji && npm install && node build.js
  ```
  lalu `python3 tools/update_sw.py`. Emoji yang tidak punya file tetap tampil sebagai emoji biasa.
- Karakter (avatar, maskot Wondi, hewan) memakai gaya yang sama lewat `tools/style2d.py` (aman dijalankan berulang).

## Kredit

- Gambar emoji: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) © Microsoft, lisensi MIT
  (lewat paket `@iconify-json/fluent-emoji-flat`).
- Font: Lilita One dan Baloo 2 (Google Fonts, SIL Open Font License).
