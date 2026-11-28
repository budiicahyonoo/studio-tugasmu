ALTER TABLE "Pengaturan"
ADD COLUMN "turnitinEstimasiSelesai" TEXT NOT NULL DEFAULT '1x24 jam';

CREATE INDEX "Pembayaran_status_kedaluwarsaPada_idx"
ON "Pembayaran"("status", "kedaluwarsaPada");
