export interface QuoteBenefit {
  id: string;
  teks: string;
  urutan?: number;
}
export interface QuoteInput {
  layanan?: {
    aktif: boolean;
    nama: string;
    tipeHitung: string;
    estimasiSelesai: string;
    tarif: { kelompok: string; hargaPerUnit: number }[];
    paket: {
      id: string;
      kelompok: string;
      nama: string;
      deskripsi?: string | null;
      harga: number;
      benefit?: QuoteBenefit[];
    }[];
    benefit?: QuoteBenefit[];
  };
  fakultas?: { aktif: boolean; nama: string; kelompok: string };
  jenjang?: string;
  paketId?: string;
  jumlah?: number;
}
export interface WhatsAppOrder {
  kodePesanan?: string | null;
  nama: string;
  fakultasNama: string;
  kelompok: string;
  layananNama: string;
  paketNama?: string | null;
  paketDeskripsi?: string | null;
  tipeHitung: string;
  jumlah?: number | null;
  judul: string;
  deskripsi: string;
  total: number;
  estimasiSelesai: string;
}
