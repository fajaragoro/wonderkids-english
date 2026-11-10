# Dokumen Rancangan: Game Bahasa Inggris untuk Anak (5–10 Tahun)

Versi: 1.0
Status: Final untuk tahap prototipe

---

## 1. Ringkasan

Web game interaktif untuk anak usia 5–10 tahun untuk belajar bahasa Inggris (kosakata dan grammar dasar) dengan cara yang menyenangkan. Anak membuat avatar sendiri (faceless), memilih tingkat sesuai usia, lalu bermain 10 mini-game berisi total 1000 soal.

Fokus utama: anak senang dan tidak bosan. Setiap game punya mekanik berbeda, setiap stage pendek, dan setiap selesai stage anak mendapat reward.

---

## 2. Target dan Platform

- **Target pengguna**: anak usia 5–10 tahun, didampingi orang tua atau langsung mandiri.
- **Platform utama**: HP dan tablet (mobile-first).
- **Platform sekunder**: komputer (desktop browser). Layout harus tetap nyaman saat dibuka di layar besar.
- **Bentuk**: web app satu halaman (single-page), tanpa instalasi.
- **Tanpa backend**: semua data (progres, avatar) disimpan di perangkat masing-masing.
- **Bahasa antarmuka**: Bahasa Indonesia untuk instruksi orang tua dan teks sistem. Konten pembelajaran dalam Bahasa Inggris.

---

## 3. Alur Pengguna

1. **Halaman utama**: logo game, maskot, dan kolom input kode.
2. **Verifikasi kode**: kode benar lanjut, kode salah menampilkan pesan ramah dan kolom dikosongkan.
3. **Pilih gender dan buat avatar** (hanya jika belum punya avatar di perangkat ini).
4. **Pilih tingkat**: Tingkat 1 (5–6 tahun), Tingkat 2 (7–8 tahun), Tingkat 3 (9–10 tahun).
5. **Peta petualangan**: 10 game ditampilkan sebagai stasiun atau level berurutan.
6. **Main game**: setiap game terdiri dari beberapa stage.
7. **Ringkasan stage**: skor, bintang, dan tombol lanjut atau ulang.
8. **Kembali ke peta**: game berikutnya terbuka setelah game sebelumnya selesai.

---

## 4. Akses (Kode Masuk)

- Kode masuk: **3016**.
- Kode sama untuk semua pengguna.
- Fungsi: **gerbang akses ringan**, bukan pengamanan. Kode bisa dibaca dari kode sumber halaman.
- Kode disimpan sebagai konstanta di satu tempat agar mudah diganti.
- Setelah kode benar, status "sudah masuk" disimpan di perangkat sehingga anak tidak perlu memasukkan kode setiap kali membuka game. Tombol "Keluar" tersedia di pengaturan.

---

## 5. Karakter dan Avatar

### 5.1 Prinsip desain

- **Faceless**: karakter tidak memiliki wajah (tidak ada mata, hidung, mulut, atau alis). Ekspresi hanya lewat pose tubuh, animasi, dan efek.
- Gaya: bulat, lucu, sederhana, warna cerah, outline tebal dan rapi.
- Karakter harus tetap terbaca jelas di layar kecil (HP).

### 5.2 Pilihan gender

- **Girl** atau **Boy**.
- Pilihan gender menentukan daftar item yang tersedia (misalnya kerudung hanya untuk Girl).

### 5.3 Urutan kustomisasi

Anak memilih berurutan, dengan pratinjau avatar yang langsung berubah:

1. **Gender**: Girl atau Boy.
2. **Rambut / kepala**:
   - Rambut: beberapa model (misalnya pendek, ikal, poni, kuncir).
   - Kerudung (**hanya Girl**): beberapa pilihan warna dan model. Jika kerudung dipilih, rambut tertutup.
3. **Aksesoris**: misalnya topi, bando, jepit, bow, kalung, ransel. Aksesoris kepala boleh bentrok dengan kerudung dan dalam hal ini aksesoris kepala dinonaktifkan atau diletakkan di atas kerudung.
4. **Baju**: beberapa model dan warna.
5. **Celana**: beberapa model dan warna.
6. **Sepatu**: beberapa model dan warna.
7. **Nama panggilan** (opsional): maksimal 12 karakter.

Jumlah item awal (bisa ditambah nanti):

| Kategori | Girl | Boy |
|---|---|---|
| Rambut | 4 | 4 |
| Kerudung | 4 | - |
| Aksesoris | 4 | 4 |
| Baju | 5 | 5 |
| Celana | 4 | 4 |
| Sepatu | 4 | 4 |

### 5.4 Teknis avatar

- Dibangun dari **lapisan SVG** (satu lapisan per bagian: badan, rambut, kerudung, aksesoris, baju, celana, sepatu). Setiap item adalah file SVG terpisah.
- Pilihan tersimpan di perangkat (localStorage) dalam bentuk ID item, bukan gambar.
- Avatar dipakai di halaman utama, peta, dan layar reward.

---

## 6. Tingkat dan Distribusi Soal

### 6.1 Tiga tingkat

| | Tingkat 1 (5–6 th) | Tingkat 2 (7–8 th) | Tingkat 3 (9–10 th) |
|---|---|---|---|
| Kosakata | Benda, warna, angka, hewan, anggota keluarga | Aktivitas harian, tempat, makanan, kata kerja umum | Kosakata lebih luas, sifat, perasaan, kata penghubung |
| Grammar | Kata dan frasa pendek (*a red apple*) | Pola *I like / I have / This is*, kata tanya dasar | *Present simple*, *past simple* dasar, pertanyaan dan negatif |
| Bentuk jawaban | Pilih gambar, teks sangat pendek | Pilih teks, isi huruf, susun kata | Lengkapi kalimat, susun kalimat, pilih jawaban kalimat |
| Audio | Semua soal | Semua soal | Kata dan kalimat |
| Tingkat kesulitan | Rendah | Sedang | Lebih tinggi |

### 6.2 Distribusi 1000 soal

Total 1000 soal = 10 game × 100 soal. Tingkat 3 mendapat porsi lebih besar.

| Tingkat | Soal per game | Total soal | Jumlah stage per game (10 soal per stage) |
|---|---|---|---|
| Tingkat 1 | 30 | 300 | 3 stage |
| Tingkat 2 | 30 | 300 | 3 stage |
| Tingkat 3 | 40 | 400 | 4 stage |

Setiap soal hanya milik satu game dan satu tingkat.

---

## 7. Sepuluh Game

| # | Nama | Fokus | Mekanik | Audio |
|---|---|---|---|---|
| 1 | Pasangkan | Kosakata | Cocokkan gambar dengan kata | Kata diucapkan saat dipilih |
| 2 | Susun Huruf | Ejaan | Susun huruf acak menjadi kata | Kata diucapkan saat selesai |
| 3 | Tebak Gambar | Kosakata | Tebak kata dari gambar dan petunjuk | Kata diucapkan sebagai petunjuk |
| 4 | Kalimat Rumpang | Grammar | Isi kata yang hilang dalam kalimat | Kalimat diucapkan |
| 5 | Pop Balon | Kosakata | Pecahkan balon yang berisi arti yang benar | Kata diucapkan saat balon pecah |
| 6 | Memory Card | Kosakata | Cari pasangan kartu kata dan gambar | Kata diucapkan saat kartu dibuka |
| 7 | Dengarkan | Listening | Dengarkan audio lalu pilih jawaban yang benar | Audio utama game |
| 8 | Susun Kalimat | Grammar | Urutkan kata acak menjadi kalimat benar | Kalimat diucapkan saat selesai |
| 9 | Kejar Bintang | Campuran | Karakter berlari dan menjawab soal saat ada rintangan | Kata atau kalimat diucapkan |
| 10 | Ulangi Yuk | Pengucapan | Dengarkan, lalu ucapkan, lalu dinilai | Audio contoh dan input suara |

### 7.1 Aturan umum game

- Setiap stage berisi **10 soal**.
- Soal dalam stage diacak tetapi tidak boleh ada yang terulang dalam satu stage.
- **Salah pertama**: anak diberi kesempatan mencoba lagi, dengan petunjuk visual atau audio.
- **Salah kedua**: jawaban benar ditampilkan dan anak lanjut ke soal berikutnya.
- Setiap jawaban benar disertai efek visual dan pujian singkat dalam Bahasa Inggris dengan audio (misalnya "Great job!", "Well done!").

### 7.2 Game 10 (pengucapan)

- Memakai **Web Speech API** untuk pengenalan suara.
- Jika perangkat atau browser tidak mendukung input suara, game menampilkan mode alternatif: anak memilih rekaman atau kata yang paling sesuai, bukan mengucapkan.
- Penilaian pengucapan bersifat toleran. Tujuannya membangun kepercayaan diri, bukan menghukum.

---

## 8. Stage, Skor, dan Reward

### 8.1 Skor dan bintang

| Hasil stage (benar dari 10) | Bintang |
|---|---|
| 9–10 | 3 bintang |
| 7–8 | 2 bintang |
| 5–6 | 1 bintang |
| Di bawah 5 | 0 bintang, tetap bisa diulang |

Angka ini adalah nilai awal dan bisa diubah.

### 8.2 Buka kunci

- Game 1 terbuka dari awal.
- Game berikutnya terbuka setelah **semua stage di game sebelumnya** mendapat minimal 1 bintang.
- Progres dihitung **per game per tingkat**. Anak yang pindah tingkat mulai dari awal di tingkat tersebut.
- Stage yang sudah selesai bisa diulang kapan saja.

### 8.3 Reward

- Bintang dikumpulkan dan ditampilkan di peta.
- Setiap game yang selesai membuka **item avatar** baru (misalnya satu aksesoris atau satu warna baju) sebagai hadiah.
- Maskot memberi respons di layar ringkasan, dengan animasi dan audio singkat.

---

## 9. Audio

- Semua audio menggunakan **suara bawaan browser** (Web Speech API, `speechSynthesis`).
- Bahasa suara diatur ke **English (US)**. Jika suara tersedia, pilih suara yang terdengar paling jernih.
- Setiap kata atau kalimat yang diucapkan harus ada teksnya di layar, agar anak juga belajar membaca.
- Tombol "Dengarkan lagi" selalu tersedia di setiap soal yang memakai audio.
- Karena suara berbeda tiap perangkat, rancangan ini tidak menjamin aksen yang seragam. Ini diterima untuk tahap prototipe.
- Untuk pengembangan lanjut, audio bisa diganti dengan file rekaman dengan memakai struktur data yang sama (lihat bagian 11).

---

## 10. Penyimpanan Progres

- Data disimpan di **localStorage** perangkat.
- Yang disimpan:
  - status kode masuk
  - avatar dan nama panggilan
  - tingkat yang dipilih
  - progres per game per tingkat (bintang per stage)
  - item avatar yang sudah terbuka
- Tidak ada sinkronisasi antar perangkat. Jika data perangkat dihapus, progres hilang.
- Harus ada tombol "Reset progres" di pengaturan, dengan konfirmasi.

---

## 11. Struktur Data Soal

Setiap soal disimpan sebagai objek dalam file JSON per game.

```json
{
  "id": "G1-T1-0001",
  "game": 1,
  "tier": 1,
  "stage": 1,
  "type": "match_image",
  "prompt": "apple",
  "options": ["apple", "banana", "cat"],
  "answer": "apple",
  "image": "🍎",
  "audio": "apple"
}
```

Penjelasan field:
- `id`: format `G{game}-T{tier}-{nomor}`.
- `game`, `tier`, `stage`: menentukan lokasi soal.
- `type`: jenis tampilan soal (misalnya `match_image`, `spell_letters`, `fill_blank`, `arrange_words`, `listen_choose`, `speak_repeat`).
- `prompt`: teks atau kata utama.
- `options`: pilihan jawaban (kosong untuk tipe susun atau ucapkan).
- `answer`: jawaban benar.
- `image`: emoji atau nama file SVG untuk gambar.
- `audio`: teks yang akan diucapkan (bisa berbeda dengan `prompt`, misalnya kalimat lengkap).

Lokasi file yang disarankan: `data/game01.json` sampai `data/game10.json`.

---

## 12. Struktur Proyek yang Disarankan

```
/
├── index.html          # Halaman utama dan kode masuk
├── css/
│   └── style.css
├── js/
│   ├── app.js          # Routing antar layar
│   ├── access.js       # Kode masuk
│   ├── avatar.js       # Kustomisasi avatar
│   ├── storage.js      # Wrapper localStorage
│   ├── speech.js       # Wrapper speechSynthesis dan SpeechRecognition
│   ├── map.js          # Peta petualangan
│   ├── games/          # Satu file per game (game01.js sampai game10.js)
│   └── stage.js        # Logika stage dan skor
├── assets/
│   ├── avatar/         # SVG tiap item avatar
│   └── images/         # Gambar soal
├── data/               # game01.json sampai game10.json
└── docs/
    └── DESIGN.md       # Dokumen ini
```

Teknologi: HTML, CSS, dan JavaScript murni (vanilla). Tanpa framework dan tanpa build tool, agar mudah di-host secara statis (misalnya GitHub Pages atau Netlify).

---

## 13. Tahapan Pengerjaan

1. **Fondasi**: struktur proyek, halaman utama, kode masuk 3016, penyimpanan lokal.
2. **Avatar**: pilihan gender, kustomisasi berurutan, pratinjau, dan penyimpanan.
3. **Peta dan tingkat**: pilih tingkat, peta 10 game, aturan buka kunci.
4. **Engine stage**: skor, bintang, ringkasan, reward, dan alur salah-benar.
5. **Game 1–10**: implementasi mekanik dengan data contoh (sekitar 5 soal per game).
6. **Audio**: integrasi speech dan mode alternatif untuk game 10.
7. **Konten**: pengisian 1000 soal per game, per tingkat, dalam batch.
8. **Pemolesan**: animasi, responsivitas HP/tablet/desktop, pengujian di perangkat nyata.

Setiap tahap harus selesai dan bisa dijalankan sebelum tahap berikutnya dimulai.

---

## 14. Di Luar Lingkup (Versi Ini)

- Login, akun pengguna, atau backend.
- Sinkronisasi progres antar perangkat.
- Iklan, pembayaran, atau pembelian dalam aplikasi.
- Aplikasi native (Android atau iOS). Versi web dulu.
- Pengamanan kode masuk tingkat server.
- Analitik perilaku anak.

---

## 15. Asumsi dan Keputusan Terbuka

- Kode masuk 3016 adalah gerbang ringan. Jika di masa depan perlu pengamanan, perlu backend.
- Nilai bintang dan jumlah item avatar adalah nilai awal dan bisa berubah.
- Desain karakter final dibuat bertahap, dimulai dari set item awal.
- Konten soal ditulis bertahap, bukan sekaligus.
