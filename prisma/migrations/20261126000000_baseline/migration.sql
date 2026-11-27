-- CreateEnum
CREATE TYPE "Kelompok" AS ENUM ('SAINTEK', 'SOSHUM');

-- CreateEnum
CREATE TYPE "KategoriLayanan" AS ENUM ('UMUM', 'KHUSUS', 'PKL');

-- CreateEnum
CREATE TYPE "TipeHitung" AS ENUM ('PER_LEMBAR', 'PER_SLIDE', 'PER_PAKET');

-- CreateEnum
CREATE TYPE "StatusPesanan" AS ENUM ('BARU', 'DIPROSES', 'SELESAI', 'DIBATALKAN', 'MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI', 'DIBAYAR', 'KEDALUWARSA');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI', 'DIBAYAR', 'DITOLAK', 'KEDALUWARSA');

-- CreateEnum
CREATE TYPE "StatusUlasan" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Fakultas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelompok" "Kelompok" NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" "KategoriLayanan" NOT NULL,
    "tipeHitung" "TipeHitung" NOT NULL,
    "estimasiSelesai" TEXT NOT NULL DEFAULT '1x24 jam',
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarif" (
    "id" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "kelompok" "Kelompok" NOT NULL,
    "hargaPerUnit" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "kelompok" "Kelompok" NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "harga" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" TEXT NOT NULL,
    "layananId" TEXT,
    "paketId" TEXT,
    "teks" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatHarga" (
    "id" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "referensiId" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "nilaiLama" INTEGER NOT NULL,
    "nilaiBaru" INTEGER NOT NULL,
    "diubahOleh" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatHarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesanan" (
    "id" TEXT NOT NULL,
    "kodePesanan" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "fakultasId" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "paketId" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsiAsli" TEXT NOT NULL,
    "deskripsiAI" TEXT,
    "jumlah" INTEGER,
    "total" INTEGER NOT NULL,
    "status" "StatusPesanan" NOT NULL DEFAULT 'BARU',
    "catatanAdmin" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL,
    "pesananId" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "dokumenUrl" TEXT,
    "dokumenNama" TEXT,
    "buktiPembayaranUrl" TEXT,
    "hasilPdfUrl" TEXT,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    "diverifikasiOleh" TEXT,
    "dibayarPada" TIMESTAMP(3),
    "kedaluwarsaPada" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nomorWhatsApp" TEXT NOT NULL DEFAULT '6283151195556',
    "qrisImageUrl" TEXT,
    "namaRekening" TEXT,
    "syaratKetentuan" TEXT NOT NULL DEFAULT '',
    "kebijakanPrivasi" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/studiotugasmu19/',
    "emailKontak" TEXT NOT NULL DEFAULT 'halo@studiotugasmu.com',
    "calendlyUrl" TEXT NOT NULL DEFAULT 'https://calendly.com/budicahyono-dev/new-meeting',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nama" TEXT NOT NULL DEFAULT 'Admin Tugasmu19',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ulasan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "teks" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "status" "StatusUlasan" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ulasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fakultas_nama_key" ON "Fakultas"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Layanan_nama_key" ON "Layanan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Tarif_layananId_kelompok_key" ON "Tarif"("layananId", "kelompok");

-- CreateIndex
CREATE UNIQUE INDEX "Paket_layananId_kelompok_nama_key" ON "Paket"("layananId", "kelompok", "nama");

-- CreateIndex
CREATE INDEX "RiwayatHarga_waktu_idx" ON "RiwayatHarga"("waktu");

-- CreateIndex
CREATE UNIQUE INDEX "Pesanan_kodePesanan_key" ON "Pesanan"("kodePesanan");

-- CreateIndex
CREATE INDEX "Pesanan_status_idx" ON "Pesanan"("status");

-- CreateIndex
CREATE INDEX "Pesanan_deletedAt_idx" ON "Pesanan"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_pesananId_key" ON "Pembayaran"("pesananId");

-- CreateIndex
CREATE INDEX "Pembayaran_status_idx" ON "Pembayaran"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- AddForeignKey
ALTER TABLE "Tarif" ADD CONSTRAINT "Tarif_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paket" ADD CONSTRAINT "Paket_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "Paket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_fakultasId_fkey" FOREIGN KEY ("fakultasId") REFERENCES "Fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "Paket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_pesananId_fkey" FOREIGN KEY ("pesananId") REFERENCES "Pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

