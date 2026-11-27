BEGIN;

-- Preserve category assignments while replacing the fixed enum with managed rows.
ALTER TABLE "Layanan" ALTER COLUMN "kategori" TYPE TEXT USING "kategori"::text;

-- AlterTable
ALTER TABLE "Pesanan" ADD COLUMN     "jenjang" TEXT NOT NULL DEFAULT 'MAHASISWA',
ADD COLUMN     "nomorWhatsApp" TEXT,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "ringkasan" JSONB;

-- AlterTable
ALTER TABLE "Pembayaran" ADD COLUMN     "buktiPublicId" TEXT,
ADD COLUMN     "dokumenPublicId" TEXT,
ADD COLUMN     "hasilPublicId" TEXT;

-- AlterTable
ALTER TABLE "Pengaturan" ADD COLUMN     "jumlahKlienDibantu" INTEGER,
ADD COLUMN     "turnitinAktif" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "turnitinBatasJam" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "turnitinFormat" TEXT NOT NULL DEFAULT 'application/pdf',
ADD COLUMN     "turnitinMaksMb" INTEGER NOT NULL DEFAULT 4;

-- DropEnum
DROP TYPE "KategoriLayanan";

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GaleriUlasan" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "label" TEXT NOT NULL,
    "lebar" INTEGER NOT NULL,
    "tinggi" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "tampil" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GaleriUlasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "labelTombol" TEXT,
    "tujuanTombol" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "tampil" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_nama_key" ON "Kategori"("nama");

-- CreateIndex
CREATE INDEX "GaleriUlasan_label_idx" ON "GaleriUlasan"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Pesanan_requestId_key" ON "Pesanan"("requestId");

-- AddForeignKey
INSERT INTO "Kategori" ("id", "nama", "urutan") VALUES ('UMUM', 'Umum', 1), ('KHUSUS', 'Khusus', 2), ('PKL', 'PKL', 3);
INSERT INTO "Kategori" ("id", "nama") SELECT DISTINCT "kategori", "kategori" FROM "Layanan" WHERE "kategori" NOT IN ('UMUM', 'KHUSUS', 'PKL');
ALTER TABLE "Layanan" ADD CONSTRAINT "Layanan_kategori_fkey" FOREIGN KEY ("kategori") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

