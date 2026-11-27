# PRD — Tugasmu19

Nov 26, 2026 · @Budi Cahono

Tugasmu19 adalah situs layanan joki tugas untuk siswa dan mahasiswa yang menampilkan harga transparan lewat simulasi otomatis, lalu mengarahkan pelanggan ke WhatsApp atau pembayaran QRIS.

| Parameter | Data Proyek |
| --- | --- |
| **Produk** | Tugasmu19 (pengembangan dari Studio Tugasmu) |
| **Versi PRD** | v0.1 |
| **Status** | Draft, menunggu review pemilik |
| **Pemilik Produk** | Kamu (admin Tugasmu19) |
| **Basis kode** | Next.js, Prisma, PostgreSQL (Neon), Cloudinary |
| **Target Tanggal Rilis** | Belum ditentukan |

## 1. Value & Tujuan Bisnis (Why & Value)

- **Problem Statement**: Calon pelanggan joki tugas harus menanyakan harga satu per satu lewat chat, sehingga prosesnya lambat, harga tidak transparan, dan admin menjawab pertanyaan yang sama berulang kali. Situs saat ini hanya memberi estimasi sederhana (laporan, soal, proyek) tanpa pembedaan tingkat kesulitan fakultas dan tanpa penyimpanan pesanan.
- **Solusi**: Situs dengan katalog layanan lengkap (umum, khusus, PKL) yang tarifnya dibedakan per fakultas, simulasi harga otomatis dengan deskripsi tugas yang dirapikan AI, pengiriman otomatis ke WhatsApp admin, serta layanan cek Turnitin dengan pembayaran QRIS. Semua tarif, paket, dan benefit dikelola admin lewat dashboard.
- **Business Metric (Target Keberhasilan)**:
  - Pelanggan mendapat harga lewat simulasi dalam waktu kurang dari 1 menit, tanpa menunggu balasan admin.
  - 100% tarif, paket, dan benefit dapat diubah admin tanpa mengedit kode.
  - Setiap simulasi yang disetujui tersimpan sebagai pesanan dan terkirim ke WhatsApp admin.

## 2. Karakter Produk & Parameter UI

| Parameter UI | Pilihan Proyek | Catatan / Alasan |
| --- | --- | --- |
| **Karakter Produk** | Marketplace jasa akademik dengan kalkulator harga | Fokus pada kejelasan harga dan kecepatan dari simulasi sampai pesan ke WhatsApp. |
| **Kepadatan Tampilan** | Comfortable di situs publik, Compact di tabel admin | Admin banyak mengelola tabel tarif dan benefit. |
| **Lebar Kontainer Utama** | Standard (1024px) untuk situs publik, Wide (1280px) untuk dashboard admin | Form simulasi dan hasil harga perlu muat dalam satu kolom yang mudah dibaca. |
| **Target Perangkat Utama** | Mobile first, lalu desktop | Siswa dan mahasiswa mayoritas membuka dari HP; minimum lebar 320 px. |
| **Dukungan Dark Mode** | Tidak (hanya Light Mode) | Belum ada kebutuhan bisnis. |
| **Desain Token Wajib** | Font Plus Jakarta Sans, Tailwind CSS 4, target sentuh minimum 44 px, notifikasi lewat toast (tanpa `alert()`) | Mengikuti implementasi yang sudah ada dan aksesibilitas dasar (skip link, label form, focus indicator, reduced motion). |

## 3. Matriks Pengguna & Hak Akses (RBAC)

| Peran (Role) | Deskripsi | Akses Route Frontend | Hak Akses Data Backend |
| --- | --- | --- | --- |
| **ADMIN** | Pemilik dan pengelola Tugasmu19 | `/admin/dashboard/*` (layanan, tarif, paket, benefit, pesanan, ulasan, portofolio, pengaturan) | Full CRUD seluruh entitas, ubah nomor WhatsApp dan syarat ketentuan |
| **PELANGGAN** | Siswa atau mahasiswa yang melakukan simulasi atau cek Turnitin (tanpa akun pada tahap awal) | `/`, `/simulasi`, `/turnitin`, `/layanan`, `/portofolio` | Membuat simulasi, mengirim pesanan, mengunggah dokumen Turnitin, mengirim ulasan (status PENDING) |
| **GUEST** | Pengunjung publik | `/`, `/layanan`, `/portofolio`, `/privacy`, `/terms` | Read-only katalog, tarif, paket, benefit, dan ulasan APPROVED |

## 4. Ruang Lingkup (Scope Boundary)

### In-Scope (Wajib Dikerjakan)

1. **Katalog layanan**: kategori Umum (artikel, paper, makalah, PPT), Khusus (skripsi, thesis, projek), dan PKL (praktikum, laporan PKL, observasi).
2. **Tarif per kelompok fakultas**: fakultas dibagi dua kelompok, Soshum Rp3.000 dan Saintek Rp4.000 per lembar (contoh artikel), dan harga paket juga berbeda per kelompok.
3. **Simulasi harga**: form (nama, fakultas, layanan, judul, deskripsi), deskripsi dirapikan AI, hitung otomatis, hasil berupa harga, estimasi selesai, dan benefit.
4. **Pengiriman ke WhatsApp**: simulasi yang disetujui pelanggan tersimpan sebagai pesanan dan terkirim otomatis ke WhatsApp admin.
5. **Admin CRUD**: kategori, fakultas, layanan, tarif, paket, cakupan paket, benefit, estimasi selesai, dan pengaturan umum (nomor WhatsApp, syarat dan ketentuan).
6. **Cek Turnitin** dengan pembayaran QRIS (tahap kedua).
7. **Fondasi keamanan**: login admin dengan sesi tervalidasi server, validasi input server, kredensial hanya dari environment.

### Out-of-Scope (Fase Berikutnya / Tidak Dikerjakan Sekarang)

- Akun pelanggan dan riwayat pesanan di sisi pelanggan.
- Chat atau pelacakan progres pengerjaan di dalam situs.
- Aplikasi mobile native (iOS dan Android).
- Pembayaran kartu kredit atau transfer bank otomatis (hanya QRIS SeaBank untuk Turnitin, diverifikasi manual oleh admin; belum ada konfirmasi otomatis).

### 4.1 Struktur Navigasi & Modul

**Navbar publik** (kiri ke kanan): Beranda, Simulasi Harga (tombol utama), Layanan (dropdown Umum, Khusus, PKL), Cek Turnitin, Portofolio, Ulasan, dan tombol WhatsApp. Menu Cek Turnitin tampil sebagai "segera hadir" sampai tahap kedua. Footer berisi Privacy Policy, Terms of Service, Instagram, dan email.

| Modul publik | Isi | Tahap |
| --- | --- | --- |
| Beranda | Hero, keunggulan, tombol simulasi, ringkasan layanan, ulasan | 1 |
| Simulasi Harga | Form, hitung otomatis, hasil dengan benefit, kirim ke WhatsApp | 1 |
| Layanan | Katalog per kategori (Umum, Khusus, PKL), paket, benefit, estimasi selesai | 1 |
| Portofolio | Daftar karya | 1 |
| Ulasan | Daftar ulasan APPROVED dan form kirim ulasan | 1 |
| Privacy Policy dan Terms of Service | Halaman legal | 1 |
| Cek Turnitin | Unggah dokumen, bayar QRIS, unduh hasil PDF | 2 |

**Menu sidebar admin**: Ringkasan, Pesanan, Layanan, Tarif, Paket & Benefit, Fakultas, Ulasan, Portofolio, Pengaturan, Pembayaran (tahap 2), dan Keluar.

| Modul admin | Fungsi | Tahap |
| --- | --- | --- |
| Ringkasan | Jumlah pesanan baru dan status terbaru | 1 |
| Pesanan | Daftar pesanan dari simulasi, ubah status, cari dan filter | 1 |
| Layanan | CRUD layanan, kategori, tipe hitungan, estimasi selesai | 1 |
| Tarif | CRUD tarif per layanan per kelompok, dengan riwayat perubahan | 1 |
| Paket & Benefit | CRUD paket, cakupan, harga per kelompok, dan benefit (bisa diurutkan) | 1 |
| Fakultas | CRUD fakultas dan penempatan ke Saintek atau Soshum | 1 |
| Ulasan dan Portofolio | Moderasi ulasan, unggah dan hapus karya | 1 |
| Pengaturan | Nomor WhatsApp, syarat dan ketentuan, kebijakan privasi, tautan sosial | 1 |
| Pembayaran | Daftar pembayaran, lihat bukti bayar, tombol verifikasi | 2 |

## 5. Spesifikasi Fitur & Acceptance Criteria (BDD)

### Model harga

| Jenis layanan | Hitungan | Tarif / harga | Estimasi selesai |
| --- | --- | --- | --- |
| Artikel, paper, makalah | Per lembar | Soshum Rp3.000 per lembar; Saintek Rp4.000 per lembar | 1x24 jam |
| PPT | Per slide | Tarif per slide diisi admin untuk tiap kelompok | 1x24 jam |
| Laporan, praktikum, laporan PKL, observasi | Satu paket Full per jenis, tanpa pilihan cakupan | Harga tetap, berbeda per kelompok, diisi admin | 1x24 jam |
| Skripsi, thesis | Per paket + cakupan: Sempro (Bab 1-3) atau Full (Bab 1-5) | Harga tetap, berbeda per kelompok. Contoh skripsi: Sempro Rp2.000.000 dan Full Rp5.000.000 (harga total, bukan tambahan dari Sempro) | 1x24 jam |
| Projek | Per paket | Harga tetap, berbeda per kelompok, diisi admin | 1x24 jam |

Fakultas dibagi dua kelompok tarif: **Saintek** (contoh: Teknik, Kedokteran) dan **Soshum** (contoh: Hukum, FKIP). Admin menempatkan tiap fakultas ke satu kelompok. Semua harga berupa angka pasti, bukan kisaran. Tidak ada biaya kilat dan tidak ada minimal order. Estimasi selesai semua layanan dan paket 1x24 jam, dan admin dapat mengubahnya. Tarif lama kalkulator (laporan siswa dan mahasiswa, soal, proyek Basic, Pro, Premium) dihapus dan diganti seluruhnya dengan model di atas.

### FR-001: Simulasi Harga Per Lembar / Per Slide

- **Prioritas**: Must Have (P0)
- **Kriteria Pengujian**:
  - *Given* pelanggan memilih layanan Artikel dan fakultas Hukum.
  - *When* halaman menampilkan kolom jumlah lembar.
  - *Then* di samping kolom tertulis "Rp3.000 / lembar" dan estimasi selesai "1x24 jam".
  - *Given* pelanggan mengisi jumlah lembar 15.
  - *When* angka berubah.
  - *Then* total langsung terhitung Rp45.000 tanpa menekan tombol, dalam waktu kurang dari 1 detik.
  - *Given* pelanggan mengganti fakultas ke Teknik.
  - *When* pilihan berubah.
  - *Then* tarif berubah menjadi Rp4.000 per lembar dan total menjadi Rp60.000.

### FR-002: Simulasi Harga Per Paket

- **Prioritas**: Must Have (P0)
- **Kriteria Pengujian**:
  - *Given* pelanggan memilih layanan Skripsi.
  - *When* pelanggan memilih cakupan Sempro (Bab 1-3).
  - *Then* tampil harga Rp2.000.000, estimasi selesai, daftar layanan yang termasuk, dan daftar benefit paket tersebut.
  - *Given* pelanggan mengganti cakupan menjadi Full (Bab 1-5).
  - *When* pilihan berubah.
  - *Then* harga, layanan, dan benefit ikut berubah sesuai data paket Full.

### FR-003: Form Simulasi dan Perapian Deskripsi dengan AI

- **Prioritas**: Must Have (P0)
- **Kriteria Pengujian**:
  - *Given* pelanggan mengisi nama, fakultas, judul tugas, dan deskripsi bebas yang berantakan.
  - *When* pelanggan menekan tombol perbaiki dengan AI.
  - *Then* sistem menampilkan deskripsi yang sudah dirapikan formatnya, dan pelanggan dapat menerima atau mengubahnya kembali.
  - *Given* deskripsi sedang dirapikan AI.
  - *When* hasil AI dihasilkan.
  - *Then* AI hanya merapikan penulisan deskripsi. AI tidak menyarankan atau mengubah jumlah lembar, slide, harga, fakultas, maupun paket.
  - *Given* model AI gratis gagal, mencapai batas pemakaian, atau lambat lebih dari 10 detik.
  - *When* permintaan berakhir.
  - *Then* deskripsi asli tetap dipakai dan simulasi tetap bisa dilanjutkan.

### FR-004: Hasil Simulasi dan Kirim ke WhatsApp

- **Prioritas**: Must Have (P0)
- **Kriteria Pengujian**:
  - *Given* pelanggan menekan Hitung dan melihat hasil (harga, estimasi selesai, benefit).
  - *When* pelanggan menekan tombol setuju.
  - *Then* sistem menyimpan pesanan berstatus BARU, lalu membuka atau mengirim pesan WhatsApp ke nomor admin berisi nama, fakultas, layanan, judul, deskripsi, jumlah atau paket, harga, dan estimasi selesai.
  - *Given* nomor WhatsApp admin diubah di pengaturan.
  - *When* pelanggan menyetujui simulasi berikutnya.
  - *Then* pesan terkirim ke nomor yang baru tanpa perubahan kode.

### FR-005: Admin CRUD Katalog, Tarif, Paket, dan Benefit

- **Prioritas**: Must Have (P0)
- **Kriteria Pengujian**:
  - *Given* admin login dan membuka halaman tarif.
  - *When* admin mengubah tarif artikel kelompok Saintek dari Rp4.000 menjadi Rp4.500 lalu menyimpan.
  - *Then* simulasi berikutnya langsung memakai Rp4.500 dan perubahan tercatat di riwayat.
  - *Given* admin membuka paket Skripsi Sempro.
  - *When* admin menambah, mengubah, mengurutkan, atau menghapus benefit.
  - *Then* daftar benefit di halaman publik mengikuti perubahan tersebut.
  - *Given* pengguna tanpa sesi admin yang valid.
  - *When* mencoba membuka `/admin/dashboard` atau memanggil Server Action admin.
  - *Then* sistem menolak dan mengarahkan ke halaman login.

### FR-006: Cek Turnitin dan Pembayaran QRIS

- **Prioritas**: Should Have (P1), tahap kedua
- **Kriteria Pengujian**:
  - *Given* pelanggan mengunggah dokumen dan memilih layanan cek Turnitin.
  - *When* pelanggan menekan bayar.
  - *Then* sistem membuat pesanan berstatus MENUNGGU\_PEMBAYARAN, lalu menampilkan kode QRIS SeaBank milik admin, nominal yang harus dibayar, dan kode pesanan.
  - *Given* pelanggan sudah membayar lewat QRIS.
  - *When* pelanggan mengunggah bukti pembayaran dan menekan konfirmasi.
  - *Then* pesanan berstatus MENUNGGU\_VERIFIKASI dan admin menerima notifikasi WhatsApp berisi kode pesanan.
  - *Given* admin mencocokkan bukti pembayaran dengan mutasi rekening SeaBank.
  - *When* admin menekan verifikasi di dashboard.
  - *Then* pesanan berstatus DIBAYAR, dokumen diproses untuk pengecekan Turnitin, dan hasilnya diunggah admin sebagai file PDF yang bisa diunduh pelanggan.
  - *Given* pembayaran tidak dikonfirmasi sebelum batas waktu.
  - *When* waktu habis.
  - *Then* pesanan berstatus KEDALUWARSA dan tidak ada dokumen yang diproses.

### FR-007: Ulasan dan Portofolio

- **Prioritas**: Could Have (P2), sudah ada di sistem saat ini
- **Kriteria Pengujian**:
  - *Given* pengunjung mengirim ulasan.
  - *When* ulasan disimpan.
  - *Then* status PENDING dan baru tampil publik setelah admin menyetujui.

## 6. Kebijakan & Rancangan Database

### 6.1 Keputusan Arsitektur Data

- **Konvensi Penamaan**: Default Prisma (model `PascalCase`, field `camelCase`), konsisten dengan skema yang sudah ada.
- **Kebijakan Penghapusan**:
  - Soft delete (`deletedAt`): pesanan, simulasi yang disetujui, pembayaran.
  - Hard delete: benefit, paket, tarif yang salah input (perubahan harga tetap tercatat di riwayat).
- **Isolasi**: Single-tenant (satu database untuk satu bisnis).
- **Nilai Uang dan Waktu**: Uang disimpan sebagai integer Rupiah (`Int`), bukan `Float`. Waktu disimpan `DateTime` UTC.
- **Tidak ditulis mati di kode**: seluruh tarif, paket, benefit, estimasi, dan nomor WhatsApp berasal dari database atau pengaturan.

### 6.2 Entitas Utama

| Entitas | Fungsi | Field utama |
| --- | --- | --- |
| **Fakultas** | Daftar fakultas dan kelompok tarifnya | nama, kelompok (SAINTEK atau SOSHUM), urutan, aktif |
| **Kategori** | Umum, Khusus, PKL | nama, urutan |
| **Layanan** | Jenis layanan (Artikel, PPT, Skripsi, Praktikum, dll.) | nama, kategori, tipeHitung (PER\_LEMBAR, PER\_SLIDE, PER\_PAKET), estimasiSelesai, aktif |
| **Tarif** | Harga per layanan per kelompok (untuk PER\_LEMBAR dan PER\_SLIDE) | layananId, kelompok, hargaPerUnit |
| **Paket** | Pilihan cakupan dan harga tetap per kelompok (Sempro, Full, dll.) | layananId, kelompok, nama, harga, urutan |
| **Benefit** | Daftar layanan dan keuntungan tiap layanan atau paket | layananId atau paketId, teks, urutan |
| **RiwayatHarga** | Catatan perubahan tarif atau harga paket | entitas, nilaiLama, nilaiBaru, diubahOleh, waktu |
| **Pesanan** | Hasil simulasi yang disetujui | nama, fakultasId, layananId, paketId, judul, deskripsiAsli, deskripsiAI, jumlah, total, status |
| **Pembayaran** | Transaksi QRIS (tahap Turnitin) | pesananId, nominal, buktiPembayaranUrl, status, diverifikasiOleh, dibayarPada |
| **Pengaturan** | Konfigurasi umum | nomorWhatsApp, qrisImageUrl, namaRekening, syaratKetentuan, kebijakanPrivasi |
| **Ulasan, Portofolio, Admin** | Sudah ada; Admin diganti menjadi tabel dengan hash password | lihat skema saat ini |

### 6.3 Prisma Schema Preview

```prisma
enum Kelompok { SAINTEK SOSHUM }
enum TipeHitung { PER_LEMBAR PER_SLIDE PER_PAKET }
enum StatusPesanan { BARU DIPROSES SELESAI DIBATALKAN MENUNGGU_PEMBAYARAN MENUNGGU_VERIFIKASI DIBAYAR KEDALUWARSA }

model Fakultas {
  id        String   @id @default(cuid())
  nama      String   @unique
  kelompok  Kelompok
  urutan    Int      @default(0)
  aktif     Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Layanan {
  id              String     @id @default(cuid())
  nama            String
  kategori        String     // UMUM | KHUSUS | PKL
  tipeHitung      TipeHitung
  estimasiSelesai String     @default("1x24 jam")
  aktif           Boolean    @default(true)
  tarif           Tarif[]
  paket           Paket[]
  benefit         Benefit[]
  updatedAt       DateTime   @updatedAt
}

model Tarif {
  id           String   @id @default(cuid())
  layananId    String
  kelompok     Kelompok
  hargaPerUnit Int      // Rupiah bulat, dilarang Float
  layanan      Layanan  @relation(fields: [layananId], references: [id])

  @@unique([layananId, kelompok])
}

model Paket {
  id        String    @id @default(cuid())
  layananId String
  kelompok  Kelompok
  nama      String    // contoh: "Sempro (Bab 1-3)"
  harga     Int       // Rupiah bulat, harga total
  urutan    Int       @default(0)
  layanan   Layanan   @relation(fields: [layananId], references: [id])
  benefit   Benefit[]

  @@unique([layananId, kelompok, nama])
}

model Benefit {
  id        String   @id @default(cuid())
  layananId String?
  paketId   String?
  teks      String
  urutan    Int      @default(0)
  layanan   Layanan? @relation(fields: [layananId], references: [id])
  paket     Paket?   @relation(fields: [paketId], references: [id])
}

model Pesanan {
  id            String        @id @default(cuid())
  nama          String
  fakultasId    String
  layananId     String
  paketId       String?
  judul         String
  deskripsiAsli String
  deskripsiAI   String?
  jumlah        Int?
  total         Int
  status        StatusPesanan @default(BARU)
  deletedAt     DateTime?
  createdAt     DateTime      @default(now())

  @@index([status])
}
```

### 6.4 Seed Awal Fakultas dan Kelompok Tarif

Pengelompokan umum berikut dipakai sebagai data awal. Tiap kampus bisa berbeda, jadi admin dapat menambah fakultas dan memindahkan kelompoknya kapan saja.

| Kelompok | Fakultas atau rumpun (data awal) |
| --- | --- |
| **Saintek** (Rp4.000 per lembar dan per slide) | Teknik, Kedokteran, Kedokteran Gigi, Kedokteran Hewan, Farmasi, MIPA (Matematika, Fisika, Biologi, Statistika), Kesehatan (Keperawatan, Kebidanan, Gizi), Pertanian, Teknologi Informasi dan Ilmu Komputer |
| **Soshum** (Rp3.000 per lembar dan per slide) | Hukum, FKIP (Keguruan dan Ilmu Pendidikan), Ekonomi dan Bisnis (Akuntansi, Manajemen), Ilmu Sosial dan Politik, Ilmu Komunikasi, Ilmu Budaya dan Sastra, Psikologi, Hubungan Internasional |

Sumber pengelompokan umum: [Gramedia](https://www.gramedia.com/best-seller/perbedaan-saintek-dan-soshum). Sumber itu sendiri mencatat beberapa jurusan, misalnya Psikologi dan Ilmu Komputer, dikelompokkan berbeda di tiap universitas, sehingga penempatannya menjadi keputusanmu.

## 7. Integrasi Pihak Ketiga & Environment Variables

### 7.1 Layanan Pihak Ketiga

| Layanan | Provider / Tools | Fungsi | Status |
| --- | --- | --- | --- |
| **Database** | PostgreSQL (Neon) | Menyimpan seluruh data | Skema Prisma sudah ada, database dipindah ke Neon |
| **Penyimpanan gambar** | Cloudinary | Gambar portofolio | Sudah ada |
| **Konsultasi** | WhatsApp, Calendly | Kirim pesanan dan jadwal konsultasi | Sudah ada |
| **PDF** | jsPDF | Invoice estimasi | Sudah ada |
| **AI** | Groq (utama) dengan OpenRouter model gratis (cadangan) | Hanya merapikan format deskripsi tugas | Baru. Free tier tanpa jaminan uptime, jadi wajib ada fallback ke deskripsi asli |
| **QRIS pembayaran** | SeaBank (QRIS buatan sendiri) | Pembayaran Turnitin | Dikonfirmasi pemilik. Tanpa payment gateway, jadi tidak ada konfirmasi otomatis. Cek syarat pembuatan QRIS dan kebijakan kategori usaha |
| **Turnitin** | Belum ada jalur yang pasti | Pengecekan kemiripan dokumen, hasil berupa PDF | Terbuka. Jalur resmi lewat program mitra Turnitin, lihat 11.1 |

### 7.2 Variabel Lingkungan

| Variabel | Sifat | Deskripsi | Contoh Placeholder |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Secret** | Koneksi database Neon (pooled) | `postgresql://...` |
| `DIRECT_URL` | **Secret** | Koneksi langsung Neon untuk migrasi | `postgresql://...` |
| `ADMIN_SESSION_SECRET` | **Secret** | Kunci penanda tangan sesi admin | `isi-acak-panjang` |
| `CLOUDINARY_URL` | **Secret** | Kredensial unggah gambar dan bukti pembayaran | `cloudinary://...` |
| `GROQ_API_KEY` | **Secret** | Kunci API Groq untuk perapian deskripsi | `gsk_...` |
| `OPENROUTER_API_KEY` | **Secret** | Kunci API OpenRouter sebagai cadangan AI | `sk-or-...` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | **Publik** | Nomor WhatsApp admin (cadangan, nilai utama dari Pengaturan) | `62812xxxxxxx` |

Tidak ada variabel payment gateway. Gambar QRIS SeaBank dan nama rekening disimpan di tabel Pengaturan supaya admin bisa menggantinya dari dashboard.

Kredensial admin dan password database tidak boleh ada di source. Password database yang pernah tersimpan di konteks chat harus dirotasi.

## 8. Standar Non-Fungsional (NFR) & Target Infrastruktur

### 8.1 Target Kualitas

- **Keamanan**: Login admin dengan password ter-hash dan sesi bertanda tangan berkadaluwarsa; cookie saja tidak cukup untuk masuk dashboard. Semua Server Action admin memverifikasi sesi. Validasi skema pada setiap input form (admin, simulasi, ulasan). Pembayaran diverifikasi manual oleh admin, dan bukti pembayaran dibatasi tipe dan ukuran filenya. Pembatasan laju (rate limit) pada login dan permintaan AI.
- **Kinerja**: Perhitungan harga tampil kurang dari 1 detik setelah angka diubah (dihitung di sisi klien dari data tarif yang sudah dimuat). Respon perapian AI kurang dari 10 detik, dengan fallback ke deskripsi asli. Halaman daftar admin memakai pagination.
- **Reliability**: Database gagal tidak membuat halaman publik crash. Pesanan tetap bisa dikirim ke WhatsApp bila penyimpanan gagal, dan kegagalan dicatat.
- **Pengujian**: Unit test perhitungan harga (per lembar, per slide, per paket, per fakultas), test Server Action admin, dan test alur simulasi sampai WhatsApp.
- **UI/UX**: Loading state, empty state, dan error state pada setiap halaman data; notifikasi lewat toast; mobile first.

### 8.2 Target Infrastruktur Deployment

| Lapisan | Target Layanan | Konfigurasi Utama |
| --- | --- | --- |
| **Aplikasi web** | Vercel | Next.js App Router, environment variables diset di dashboard |
| **Database** | Neon PostgreSQL | `DATABASE_URL` (pooled) dan `DIRECT_URL` (migrasi) |
| **Penyimpanan gambar** | Cloudinary | Batas unggah 4 MB per gambar |
| **Monitoring** | Log error terstruktur dan health check database | Endpoint pengecekan koneksi |

## 9. Rencana Rilis & Milestone

Tahap pertama adalah simulasi harga dengan admin CRUD. Cek Turnitin dan QRIS menyusul sebagai tahap kedua. Estimasi waktu berikut adalah usulan awal untuk kamu koreksi.

| Milestone | Deliverable | Estimasi | Check Validasi |
| --- | --- | --- | --- |
| **M0: Perbaikan fondasi** | Siapkan koneksi Neon, rotasi password database lama, hapus kredensial dari source, login admin dengan sesi nyata, validasi server | Hari ke-3 | Login dengan sesi palsu ditolak; `npm test` dan `npm run lint` lulus |
| **M1: Database dan seed** | Skema Fakultas, Kategori, Layanan, Tarif, Paket, Benefit, Pesanan, Pengaturan, serta data awal yang menggantikan tarif lama | Hari ke-5 | `npx prisma migrate dev` dan `npx prisma validate` berhasil |
| **M2: Admin CRUD** | Dashboard untuk fakultas, layanan, tarif, paket, benefit, pengaturan, dan pesanan | Hari ke-9 | Semua skenario FR-005 lolos |
| **M3: Simulasi publik** | Form simulasi, hitung otomatis, perapian AI, hasil dengan benefit, kirim ke WhatsApp | Hari ke-13 | Skenario FR-001 sampai FR-004 lolos; `npm run build` lulus |
| **M4: Cek Turnitin dan QRIS** | Unggah dokumen, tampilan QRIS SeaBank, unggah bukti bayar, verifikasi manual admin, hasil cek PDF | Menyusul setelah M3 | Skenario FR-006 lolos dengan pembayaran uji dan verifikasi admin |
| **M5: QA dan produksi** | Halaman Privacy Policy dan Terms of Service, tautan sosial valid, uji perangkat mobile, deploy | Hari ke-16 setelah M3 | Smoke test lulus dan UAT disetujui |

## 10. Kriteria UAT & Serah-Terima

- Pengujian UAT dijalankan di URL staging atau preview yang stabil, bukan database lokal.
- Skenario pengujian mengacu 100% pada Bagian 5 (Acceptance Criteria BDD).
- Pengujian wajib mencakup tampilan mobile (lebar 320 px) dan satu simulasi untuk tiap jenis hitungan: per lembar, per slide, dan per paket.
- Sistem dianggap siap rilis bila: Neon dapat diakses, login admin hanya berhasil dengan kredensial yang diverifikasi aman, cookie saja tidak cukup membuka dashboard, tarif dan benefit bisa diubah admin tanpa edit kode, simulasi yang disetujui sampai ke WhatsApp admin, serta `npm test` dan `npm run lint` lulus.
- Pemilik produk menyetujui hasil UAT secara tertulis (chat atau email) sebelum rilis produksi.

## 11. Keputusan Terbuka & Log Perubahan

### 11.1 Keputusan yang Perlu Kamu Putuskan

| Keputusan | Jawaban pemilik | Dipakai di |
| --- | --- | --- |
| Paket Full skripsi Rp5.000.000 | Harga total, bukan tambahan dari Sempro | Bagian 5 |
| Pengelompokan tarif | Dua kelompok: Saintek Rp4.000 dan Soshum Rp3.000 per lembar (contoh artikel) | Bagian 5, 6 |
| Estimasi selesai | Semua layanan dan paket 1x24 jam | Bagian 5 |
| Paket PKL (praktikum, laporan PKL, observasi) | Satu paket Full, tanpa pilihan Sempro atau Full | Bagian 5 |
| Harga paket per fakultas | Berbeda, mengikuti kelompok Saintek atau Soshum | Bagian 5, 6 |
| Bentuk harga | Angka pasti, tanpa kisaran | Bagian 5 |
| Biaya kilat dan minimal order | Tidak ada | Bagian 5, 6 |
| Peran AI | Hanya merapikan deskripsi yang berantakan, tidak menyarankan jumlah lembar | FR-003 |
| Penyedia AI | Model gratis online | Bagian 7.1 |
| Turnitin | Jalur akses dicari pemilik; hasil diberikan dalam bentuk PDF | FR-006, 7.1 |
| QRIS pembayaran | SeaBank dengan QRIS buatan sendiri, tanpa payment gateway | Bagian 7.1 |
| Tarif lama kalkulator | Diganti seluruhnya | Bagian 5, M1 |
| Database | Neon (bukan Supabase) | Bagian 7, 8, 9 |

**Jawaban lanjutan dan hasil riset** (per 26 November 2026):

| Keputusan | Jawaban / hasil | Dipakai di |
| --- | --- | --- |
| Tarif per slide PPT | Saintek Rp4.000 dan Soshum Rp3.000 per slide | Bagian 5 |
| Nominal harga paket (laporan, PKL, skripsi, thesis, projek) | Diisi admin lewat dashboard per kelompok, tidak ditulis di kode. Seed awal hanya contoh skripsi Sempro Rp2.000.000 dan Full Rp5.000.000 | FR-005, M1 |
| Daftar fakultas | Seed awal tersedia di 6.4, admin dapat menambah atau memindahkan kelompoknya | Bagian 6.4 |
| Penyedia AI | Groq sebagai utama (sekitar 30 permintaan per menit dan 1.000 per hari, tanpa pelatihan dari data pengguna) dan OpenRouter model gratis sebagai cadangan (sekitar 20 per menit dan 50 per hari, naik ke 1.000 per hari dengan top-up $10). Batas ini sering berubah, cek lagi sebelum rilis. Hindari Google AI Studio gratis (data dipakai untuk pelatihan di luar UE) dan Cohere gratis (khusus non-komersial) | Bagian 7.1 |
| Jalur akses Turnitin | Turnitin menawarkan tiga model mitra: Authorized ISV, Technology, dan Reseller, pendaftaran lewat Contact Sales. API tidak terbuka untuk perorangan, dan pengecekan untuk pelanggan umum belum tentu diizinkan lisensinya. Tanyakan langsung ke Turnitin sebelum membangun tahap 2 | FR-006, 7.1 |
| "1-24 jam" | Dikonfirmasi 1x24 jam | Bagian 5 |
| Payment gateway | Diganti: SeaBank dengan QRIS buatan sendiri. Pembayaran diverifikasi manual oleh admin | Bagian 7.1 |

**Masih terbuka:**

- [ ] Jalur akses Turnitin yang sah dan apakah lisensinya mengizinkan layanan cek untuk pelanggan umum (tahap 2 bergantung pada ini).
- [ ] Cek syarat akun SeaBank dan pembuatan QRIS sendiri (jenis QRIS, biaya, dan apakah kategori usaha diizinkan).
- [ ] Verifikasi batas pemakaian terbaru Groq dan OpenRouter saat M3 dikerjakan.

### 11.2 Log Perubahan & Change Request (CR)

Setiap perubahan scope, penambahan entitas, atau perubahan alur bisnis setelah PRD ini disetujui dicatat di sini dengan format: nomor CR, tanggal, kebutuhan, dampak (database, UI, estimasi waktu, biaya), dan status.

*(Belum ada Change Request. Dokumen berada pada draft v0.1.)*

## Sumber

- [Free LLM APIs Compared: Rate Limits, Models, and Real Costs (OpenRouter)](https://openrouter.ai/blog/tutorials/free-llm-apis-compared/): batas pemakaian dan kebijakan data penyedia AI gratis. Penulis sumber mengingatkan angka ini sering berubah.
- [Turnitin technical partners](https://in.turnitin.com/partners/technical-partners): tiga model kemitraan Turnitin. Halaman itu tidak menjelaskan syarat akses API, jadi syaratnya perlu ditanyakan langsung.
- [Perbedaan Saintek dan Soshum (Gramedia)](https://www.gramedia.com/best-seller/perbedaan-saintek-dan-soshum): pengelompokan umum jurusan.
