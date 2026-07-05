# Lunas+ 💳

**Nama:** Dylan Chaniago
**NIM:** 221011450511 (ganjil → fokus pemolesan tampilan Desktop, tetap responsif penuh di Mobile)

Aplikasi web simulasi **pembayaran tagihan multi-layanan & pengisian pulsa**, dibangun murni dengan HTML, CSS, dan Vanilla JavaScript (ES6+) — 100% client-side, tanpa backend/API nyata.

Tema visual: *"Buku Kas Digital"* — palet hijau/teal untuk kesan keuangan & kepercayaan, dipadukan dengan tipografi monospace ala buku kas/struk untuk seluruh angka dan kode transaksi.

---

## 🚀 Cara Menjalankan

Tidak perlu instalasi apa pun.

1. Unduh/ekstrak folder proyek ini.
2. Buka file **`index.html`** langsung di browser (double click), **atau**
3. Jalankan local server (disarankan agar semua fitur — termasuk localStorage — berjalan mulus):
   ```bash
   # Python
   python3 -m http.server 8000

   # atau Node.js
   npx serve .
   ```
   Lalu buka `http://localhost:8000`.

Tidak ada dependency build (npm install dsb). Semua library eksternal (Font Awesome, Google Fonts, jsPDF) dimuat via CDN.

---

## 🗂️ Struktur Proyek

```
lunasplus/
├── index.html          # Seluruh markup & section (SPA style)
├── css/
│   └── style.css       # Design tokens, layout, komponen, dark mode, print
├── js/
│   ├── data.js          # Data simulasi (tagihan, SPP, provider, bank, dll)
│   ├── utils.js         # Fungsi bantu: format, storage, toast, validasi
│   └── app.js            # Routing, state, dan seluruh alur interaksi
└── README.md
```

---

## ✅ Daftar Fitur yang Diimplementasikan

### Navigasi & Layout
- SPA style navigation (5 section utama) via sidebar persisten (desktop) & bottom tab bar (mobile)
- Fully responsive: mobile, tablet, desktop (CSS Grid + Flexbox, mobile-first)
- Tema hitam elegan "Onyx Ledger" sebagai default, dengan toggle ke tema terang minimalis
- Halaman login sebagai gerbang akses aplikasi
- Skip-link, semantic HTML, ARIA labels, visible focus state (keyboard navigation)

### 1. Dashboard / Beranda
- Kartu saldo simulasi bergaya "buku kas" (ledger)
- Quick access ke semua kategori layanan
- Promo banner
- Ringkasan transaksi terakhir

### 2. Bayar Tagihan (PLN, PDAM, Internet, Seminar)
- Tab kategori
- Form input ID pelanggan + validasi (regex, panjang karakter, alfanumerik untuk seminar)
- Simulasi loading saat "Cek Tagihan" (`setTimeout` 900–1300ms)
- Card hasil tagihan: nama, alamat/periode, tagihan pokok, denda, total, jatuh tempo
- 3 metode pembayaran wajib:
  - **Virtual Account** — pilih bank (BCA/BNI/Mandiri/BRI), generate nomor VA unik + salin nomor
  - **QRIS** — QR placeholder + countdown 5 menit (otomatis batal jika habis waktu)
  - **Teller/Kasir** — kode pembayaran + daftar lokasi (Alfamart, Indomaret, Kantor Pos, dll)
- Loading state saat memproses pembayaran
- Modal struk/bukti pembayaran, bisa **dicetak** (`window.print()`) atau **diunduh PDF** (jsPDF)
- Transaksi otomatis tersimpan ke localStorage

### 3. Biaya Kuliah / SPP (fitur unggulan)
- Input NIM (validasi 12 digit)
- Tabel cicilan semester (checkbox multi-select, total otomatis terhitung)
- Cicilan yang sudah lunas tidak bisa dipilih ulang
- Pencarian tagihan berdasarkan **kode tagihan** (detail lengkap: kode, deskripsi, NIM, semester, status)
- Alur pembayaran sama seperti tagihan umum (VA/QRIS/Teller)
- Status cicilan otomatis berubah menjadi "Lunas" setelah pembayaran berhasil

### 4. Isi Pulsa & Paket Data
- Grid pilihan 6 provider (Telkomsel, XL, Indosat, Tri, Smartfren, Axis)
- Input nomor HP + validasi (10–13 digit, awalan 08)
- **Deteksi provider otomatis** dari prefix nomor + peringatan jika provider tidak cocok
- Pilihan nominal pulsa cepat atau custom, serta paket data populer
- Preview sebelum bayar → alur pembayaran sama seperti di atas

### 5. Riwayat Transaksi
- Tabel/list seluruh transaksi dari localStorage
- Filter berdasarkan kategori & status
- Tombol hapus semua riwayat (dengan konfirmasi)
- Empty state jika belum ada transaksi

### Fitur Tambahan (nilai plus)
- Halaman Profil (fake login) + reset saldo simulasi
- Halaman Bantuan/FAQ
- Toast notification (sukses/error/info/warning)
- Struk dapat diunduh sebagai PDF bergaya monospace (jsPDF)

### Edge Case yang Ditangani
- NIM tidak terdaftar → toast error
- Nomor pelanggan tagihan tidak ditemukan → toast error
- Cicilan SPP yang sudah lunas tidak dapat dipilih kembali
- Nomor HP tidak valid → error inline di form
- Klik "Bayar Sekarang" tanpa memilih metode → tetap diarahkan memilih metode dulu (tombol bayar hanya muncul setelah metode dipilih)
- QRIS kedaluwarsa otomatis menutup modal & memberi notifikasi
- Hapus riwayat transaksi meminta konfirmasi terlebih dahulu

---

## 🎨 Logo

Logo **Lunas+** berupa monogram centang (melambangkan "lunas"/tuntas bayar) yang menyatu dengan tanda plus (melambangkan nilai tambah/premium), warna emerald di atas latar gelap — konsisten dengan tema aplikasi.

- `assets/favicon.svg` — ikon dengan latar (dipakai sebagai favicon tab browser)
- `assets/logo.svg` — logo lockup (ikon + wordmark) untuk keperluan dokumentasi/presentasi

## 🆕 Penyempurnaan Lanjutan (v5)

- **Kredensial demo ditampilkan langsung** di halaman login (email + kata sandi), lengkap dengan tombol "Isi otomatis" — memudahkan saat demo/presentasi ke dosen tanpa perlu mengetik manual.
- **Saldo simulasi default diubah menjadi Rp10.000.000** (sebelumnya Rp1.500.000), termasuk saat direset lewat halaman Profil.

## 🆕 Penyempurnaan Lanjutan (v4)

- **Badge provider didesain ulang** — lencana Telkomsel/XL/Indosat/Tri/Smartfren/Axis kini bergaya gradient premium dengan warna khas masing-masing operator, bukan lagi kotak polos. *(Catatan: ini bukan logo resmi operator — menghindari reproduksi trademark — melainkan lencana warna+inisial bergaya sendiri yang tetap mudah dikenali.)*
- **Export Riwayat ke CSV** — tombol baru di halaman Riwayat untuk mengunduh transaksi (sesuai filter aktif) sebagai file `.csv` siap dibuka di Excel/Google Sheets.
- **Transisi halaman lebih halus** — animasi masuk yang lebih premium (`cubic-bezier` ease-out) saat berpindah menu maupun saat kartu hasil (cek tagihan, dsb.) muncul.
- **Cetak struk diperbaiki** — struk sekarang selalu tercetak bersih putih/hitam di atas kertas, apa pun tema aplikasi yang sedang aktif (gelap/terang), lengkap dengan logo Lunas+ di bagian atas struk. Lebih hemat tinta dan terlihat profesional.

## 🆕 Redesign Premium (v3)

Redesain besar atas permintaan revisi UI/UX:

- **Tema "Onyx Ledger"** — hitam elegan sebagai tema default (bukan hijau terang seperti versi awal), aksen emerald premium, tanpa unsur emas/silver sama sekali. Tetap ada toggle ke tema terang minimalis sebagai bonus.
- **Layout sidebar (desktop)** — navigasi utama pindah ke sidebar kiri persisten dengan kartu akun & tombol keluar di bagian bawah, gaya dashboard aplikasi premium. Di mobile tetap pakai bottom tab bar yang ringkas.
- **Halaman Login** — gerbang akses sebelum masuk ke aplikasi, dengan validasi, opsi tampilkan/sembunyikan kata sandi, "Ingat saya", dan pesan error yang jelas.
  - Akun demo: `dylan@tech.my.id` / kata sandi sesuai yang diberikan dosen/tim.
  - ⚠️ **Catatan jujur soal keamanan:** ini murni simulasi front-end — kredensial dicek langsung di kode JavaScript milik browser (`js/auth.js`), BUKAN autentikasi server yang aman. Cukup untuk kebutuhan tugas kuliah (gerbang akses demo), tapi jangan pernah dipakai sebagai pola login untuk aplikasi produksi/nyata.
- **Kartu saldo (hero card)** didesain ulang bergaya kartu premium gelap dengan aksen glow emerald.

## 🆕 Penyempurnaan Sebelumnya (v2)

Ditambahkan setelah versi awal untuk memperkuat nilai fungsionalitas, kreativitas, dan kualitas kode:

- **Statistik pengeluaran** (Chart.js) — kartu ringkasan total transaksi, total pengeluaran, kategori terbanyak, plus grafik doughnut proporsi pengeluaran per kategori di halaman Riwayat.
- **QR code asli untuk QRIS** (qrcode.js) — bukan lagi pola placeholder, kini benar-benar bisa dipindai kamera dan berisi ringkasan transaksi.
- **Tagihan terkunci setelah lunas** — PLN/PDAM/Internet/Seminar yang sudah dibayar tidak bisa dibayar ulang dengan ID pelanggan yang sama (sebelumnya hanya berlaku untuk SPP). Status "Lunas" disimpan permanen di localStorage.
- **Dashboard dua kolom di desktop** — quick access & promo di kolom utama, kartu statistik cepat + transaksi terakhir jadi sidebar sticky di layar ≥1024px (fokus polesan Desktop sesuai NIM ganjil), tetap menumpuk rapi satu kolom di mobile.
- **Logika saldo diperbaiki** — saldo simulasi di dashboard kini murni informatif (tidak lagi terpotong otomatis dengan rumus yang tidak masuk akal), karena VA/QRIS/Teller secara konsep adalah pembayaran dari luar dompet.

---

## 🧪 Data Simulasi untuk Uji Coba

**PLN:** `112233445566`, `223344556677`, `334455667788`, `445566778899`, `556677889900`

**PDAM:** `PDAM001122`, `PDAM002233`, `PDAM003344`

**Internet:** `INET5566001`, `INET5566002`, `INET5566003`

**Seminar:** `SEM2026A01`, `SEM2026B02`, `SEM2026C03`

**NIM (Biaya Kuliah):** `202310001234`, `202310005678`, `202410009988`

**Nomor HP contoh (untuk tes deteksi provider):** `081234567890` (Telkomsel), `081712345678` (XL), `085512345678` (Indosat)

---

## 🎨 Sumber Desain

- Font: [Sora](https://fonts.google.com/specimen/Sora) (display), [Inter](https://fonts.google.com/specimen/Inter) (body), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (angka & kode)
- Ikon: [Font Awesome 6](https://fontawesome.com/) via CDN
- Generate PDF: [jsPDF](https://github.com/parallax/jsPDF) via CDN
- Grafik statistik: [Chart.js](https://www.chartjs.org/) via CDN
- QR Code QRIS: [qrcode.js](https://davidshimjs.github.io/qrcodejs/) via CDN

## ⚠️ Catatan

Aplikasi ini **tidak terhubung ke database atau API nyata**. Seluruh data tagihan bersifat dummy/hardcode di `js/data.js`, dan seluruh transaksi hanya simulasi (tidak ada uang sungguhan yang berpindah).

## 📸 Screenshot & Video Demo

_Tambahkan screenshot tampilan desktop & mobile, serta link video demo YouTube di sini setelah pengujian lokal._
