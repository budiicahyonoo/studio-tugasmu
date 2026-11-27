import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

const DEFAULT_SYARAT = `Syarat dan Ketentuan Layanan Studio Tugasmu (Tugasmu19)

1. Ruang Lingkup Layanan
Studio Tugasmu menyediakan layanan pendampingan penyusunan tugas akademik (Umum, Khusus, dan PKL) serta layanan pengecekan kemiripan dokumen sesuai pesanan yang disetujui melalui simulasi harga.

2. Harga dan Pembayaran
- Seluruh tarif yang tampil pada simulasi merupakan angka pasti sesuai kelompok fakultas (Saintek atau Soshum) dan jenis layanan yang dipilih.
- Tidak ada biaya kilat tersembunyi atau minimal order.
- Pembayaran untuk layanan Cek Turnitin dilakukan melalui QRIS sesuai nominal dan kode pesanan, lalu diverifikasi manual oleh admin.

3. Estimasi Pengerjaan dan Revisi
- Estimasi standar penyelesaian adalah 1x24 jam atau sesuai keterangan pada layanan terkait.
- Revisi dilakukan sesuai cakupan layanan atau paket yang disepakati saat konfirmasi WhatsApp.

4. Kerahasiaan Data
Data pribadi, judul tugas, deskripsi, dan dokumen yang dikirimkan hanya digunakan untuk keperluan pengerjaan pesanan.`;

const DEFAULT_PRIVASI = `Kebijakan Privasi Studio Tugasmu (Tugasmu19)

1. Data yang Dikumpulkan
Kami mengumpulkan nama, fakultas, judul dan deskripsi tugas, serta dokumen yang Anda unggah saat menggunakan simulasi harga, mengirim ulasan, atau mengajukan cek Turnitin.

2. Penggunaan Data
Data digunakan untuk menghitung estimasi biaya, menyimpan pesanan, memproses permintaan perapian deskripsi, dan menghubungkan pesanan Anda ke WhatsApp admin.

3. Pemrosesan AI
Jika Anda memilih fitur perapian deskripsi dengan AI, teks deskripsi dikirim ke penyedia model AI (Groq/OpenRouter) hanya untuk merapikan format penulisan tanpa mengubah isi substansi.

4. Penyimpanan dan Keamanan
Data pesanan disimpan di database terkelola (Neon PostgreSQL) dan file gambar atau dokumen disimpan di Cloudinary. Hubungi admin jika Anda ingin meminta penghapusan data pesanan.`;

async function main() {
  console.log("Memulai seed database Studio Tugasmu...");

  await prisma.pengaturan.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      nomorWhatsApp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6283151195556",
      syaratKetentuan: DEFAULT_SYARAT,
      kebijakanPrivasi: DEFAULT_PRIVASI,
      instagramUrl: "https://www.instagram.com/studiotugasmu19/",
      emailKontak: "halo@studiotugasmu.com",
      calendlyUrl: "https://calendly.com/budicahyono-dev/new-meeting",
    },
  });

  const fakultasList = [
    { nama: "Teknik", kelompok: "SAINTEK", urutan: 1 },
    { nama: "Kedokteran", kelompok: "SAINTEK", urutan: 2 },
    { nama: "Kedokteran Gigi", kelompok: "SAINTEK", urutan: 3 },
    { nama: "Kedokteran Hewan", kelompok: "SAINTEK", urutan: 4 },
    { nama: "Farmasi", kelompok: "SAINTEK", urutan: 5 },
    { nama: "MIPA (Matematika, Fisika, Biologi, Statistika)", kelompok: "SAINTEK", urutan: 6 },
    { nama: "Kesehatan (Keperawatan, Kebidanan, Gizi)", kelompok: "SAINTEK", urutan: 7 },
    { nama: "Pertanian", kelompok: "SAINTEK", urutan: 8 },
    { nama: "Teknologi Informasi dan Ilmu Komputer", kelompok: "SAINTEK", urutan: 9 },
    { nama: "Hukum", kelompok: "SOSHUM", urutan: 10 },
    { nama: "FKIP (Keguruan dan Ilmu Pendidikan)", kelompok: "SOSHUM", urutan: 11 },
    { nama: "Ekonomi dan Bisnis (Akuntansi, Manajemen)", kelompok: "SOSHUM", urutan: 12 },
    { nama: "Ilmu Sosial dan Politik", kelompok: "SOSHUM", urutan: 13 },
    { nama: "Ilmu Komunikasi", kelompok: "SOSHUM", urutan: 14 },
    { nama: "Ilmu Budaya dan Sastra", kelompok: "SOSHUM", urutan: 15 },
    { nama: "Psikologi", kelompok: "SOSHUM", urutan: 16 },
    { nama: "Hubungan Internasional", kelompok: "SOSHUM", urutan: 17 },
  ];

  for (const fak of fakultasList) {
    await prisma.fakultas.upsert({
      where: { nama: fak.nama },
      update: { kelompok: fak.kelompok, urutan: fak.urutan },
      create: fak,
    });
  }

  const layananPerUnit = [
    {
      nama: "Artikel",
      kategori: "UMUM",
      tipeHitung: "PER_LEMBAR",
      urutan: 1,
      deskripsi: "Penulisan artikel ilmiah atau populer sesuai kaidah akademik.",
      tarif: { SOSHUM: 3000, SAINTEK: 4000 },
      benefits: [
        "Struktur artikel lengkap (abstrak, pendahuluan, pembahasan, penutup)",
        "Sitasi dan daftar pustaka rapi",
        "Gratis revisi minor 1x",
      ],
    },
    {
      nama: "Paper",
      kategori: "UMUM",
      tipeHitung: "PER_LEMBAR",
      urutan: 2,
      deskripsi: "Penyusunan paper mata kuliah atau kajian literatur terstruktur.",
      tarif: { SOSHUM: 3000, SAINTEK: 4000 },
      benefits: [
        "Referensi jurnal atau buku relevan",
        "Format penulisan sesuai panduan dosen",
        "Gratis revisi minor 1x",
      ],
    },
    {
      nama: "Makalah",
      kategori: "UMUM",
      tipeHitung: "PER_LEMBAR",
      urutan: 3,
      deskripsi: "Penyusunan makalah lengkap siap dikumpulkan atau dipresentasikan.",
      tarif: { SOSHUM: 3000, SAINTEK: 4000 },
      benefits: [
        "Termasuk halaman sampul, daftar isi, dan daftar pustaka",
        "Bahasa Indonesia atau Inggris sesuai permintaan",
        "Gratis revisi minor 1x",
      ],
    },
    {
      nama: "PPT",
      kategori: "UMUM",
      tipeHitung: "PER_SLIDE",
      urutan: 4,
      deskripsi: "Pembuatan slide presentasi yang ringkas, jelas, dan siap tampil.",
      tarif: { SOSHUM: 3000, SAINTEK: 4000 },
      benefits: [
        "Desain slide bersih dan mudah dibaca audiens",
        "Ringkasan poin utama tanpa teks menumpuk",
        "File PPTX terbuka dan mudah diedit ulang",
      ],
    },
  ];

  for (const item of layananPerUnit) {
    const layanan = await prisma.layanan.upsert({
      where: { nama: item.nama },
      update: {
        kategori: item.kategori,
        tipeHitung: item.tipeHitung,
        urutan: item.urutan,
        deskripsi: item.deskripsi,
      },
      create: {
        nama: item.nama,
        kategori: item.kategori,
        tipeHitung: item.tipeHitung,
        estimasiSelesai: "1x24 jam",
        urutan: item.urutan,
        deskripsi: item.deskripsi,
      },
    });

    for (const kelompok of ["SOSHUM", "SAINTEK"]) {
      await prisma.tarif.upsert({
        where: { layananId_kelompok: { layananId: layanan.id, kelompok } },
        update: {},
        create: {
          layananId: layanan.id,
          kelompok,
          hargaPerUnit: item.tarif[kelompok],
        },
      });
    }

    const existingBenefits = await prisma.benefit.count({ where: { layananId: layanan.id } });
    if (existingBenefits === 0) {
      await prisma.benefit.createMany({
        data: item.benefits.map((teks, idx) => ({
          layananId: layanan.id,
          teks,
          urutan: idx + 1,
        })),
      });
    }
  }

  const layananPaket = [
    {
      nama: "Skripsi",
      kategori: "KHUSUS",
      urutan: 5,
      deskripsi: "Pendampingan penyusunan skripsi mulai tahap seminar proposal hingga sidang akhir.",
      pakets: [
        {
          nama: "Sempro (Bab 1-3)",
          urutan: 1,
          harga: { SOSHUM: 2000000, SAINTEK: 2000000 },
          deskripsi: "Penyusunan Bab 1 sampai Bab 3 siap seminar proposal.",
          benefits: [
            "Penyusunan Bab 1 (Pendahuluan), Bab 2 (Tinjauan Pustaka), dan Bab 3 (Metodologi)",
            "Daftar pustaka dan perapian format kampus",
            "Pendampingan revisi pasca-bimbingan dosen",
          ],
        },
        {
          nama: "Full (Bab 1-5)",
          urutan: 2,
          harga: { SOSHUM: 5000000, SAINTEK: 5000000 },
          deskripsi: "Paket lengkap Bab 1 sampai Bab 5 (harga total, bukan tambahan).",
          benefits: [
            "Penyusunan lengkap Bab 1 sampai Bab 5 beserta kesimpulan",
            "Olah data dan pembahasan hasil penelitian",
            "Pendampingan revisi hingga siap sidang",
          ],
        },
      ],
    },
    {
      nama: "Thesis",
      kategori: "KHUSUS",
      urutan: 6,
      deskripsi: "Pendampingan penyusunan tesis S2 dengan kedalaman analisis akademik.",
      pakets: [
        {
          nama: "Sempro (Bab 1-3)",
          urutan: 1,
          harga: { SOSHUM: 3000000, SAINTEK: 3500000 },
          deskripsi: "Penyusunan proposal tesis Bab 1 sampai Bab 3.",
          benefits: [
            "Kajian literatur jurnal bereputasi",
            "Penyusunan instrumen dan rancangan metodologi",
            "Revisi sesuai arahan pembimbing",
          ],
        },
        {
          nama: "Full (Bab 1-5)",
          urutan: 2,
          harga: { SOSHUM: 7000000, SAINTEK: 8000000 },
          deskripsi: "Paket lengkap tesis Bab 1 sampai Bab 5 (harga total).",
          benefits: [
            "Penyusunan lengkap Bab 1 sampai Bab 5",
            "Analisis dan interpretasi data penelitian",
            "Pendampingan revisi hingga ujian tesis",
          ],
        },
      ],
    },
    {
      nama: "Projek",
      kategori: "KHUSUS",
      urutan: 7,
      deskripsi: "Pembuatan projek tugas kuliah, aplikasi, atau prototipe sesuai spesifikasi.",
      pakets: [
        {
          nama: "Paket Full",
          urutan: 1,
          harga: { SOSHUM: 350000, SAINTEK: 500000 },
          deskripsi: "Pengerjaan projek lengkap beserta dokumentasi penggunaan.",
          benefits: [
            "Source code atau file projek lengkap dan siap dijalankan",
            "Panduan instalasi dan penjelasan alur kerja",
            "Revisi penyesuaian fitur minor",
          ],
        },
      ],
    },
    {
      nama: "Praktikum",
      kategori: "PKL",
      urutan: 8,
      deskripsi: "Penyusunan laporan praktikum lengkap dengan analisis hasil pengamatan.",
      pakets: [
        {
          nama: "Full",
          urutan: 1,
          harga: { SOSHUM: 150000, SAINTEK: 200000 },
          deskripsi: "Satu paket lengkap laporan praktikum.",
          benefits: [
            "Pembahasan teori, prosedur, data pengamatan, dan kesimpulan",
            "Tabel dan grafik dirapikan sesuai format modul",
            "Gratis revisi minor 1x",
          ],
        },
      ],
    },
    {
      nama: "Laporan PKL",
      kategori: "PKL",
      urutan: 9,
      deskripsi: "Penyusunan laporan Praktik Kerja Lapangan (PKL) atau magang.",
      pakets: [
        {
          nama: "Full",
          urutan: 1,
          harga: { SOSHUM: 450000, SAINTEK: 550000 },
          deskripsi: "Satu paket lengkap laporan PKL.",
          benefits: [
            "Profil instansi, kegiatan harian, analisis kasus, dan penutup",
            "Format tata tulis disesuaikan pedoman jurusan",
            "Pendampingan revisi laporan",
          ],
        },
      ],
    },
    {
      nama: "Observasi",
      kategori: "PKL",
      urutan: 10,
      deskripsi: "Penyusunan laporan hasil observasi lapangan atau studi kasus.",
      pakets: [
        {
          nama: "Full",
          urutan: 1,
          harga: { SOSHUM: 200000, SAINTEK: 250000 },
          deskripsi: "Satu paket lengkap laporan observasi.",
          benefits: [
            "Transkrip ringkas, temuan lapangan, dan pembahasan",
            "Lampiran instrumen observasi terstruktur",
            "Gratis revisi minor 1x",
          ],
        },
      ],
    },
  ];

  for (const item of layananPaket) {
    const layanan = await prisma.layanan.upsert({
      where: { nama: item.nama },
      update: {
        kategori: item.kategori,
        tipeHitung: "PER_PAKET",
        urutan: item.urutan,
        deskripsi: item.deskripsi,
      },
      create: {
        nama: item.nama,
        kategori: item.kategori,
        tipeHitung: "PER_PAKET",
        estimasiSelesai: "1x24 jam",
        urutan: item.urutan,
        deskripsi: item.deskripsi,
      },
    });

    for (const pkt of item.pakets) {
      for (const kelompok of ["SOSHUM", "SAINTEK"]) {
        const paket = await prisma.paket.upsert({
          where: {
            layananId_kelompok_nama: {
              layananId: layanan.id,
              kelompok,
              nama: pkt.nama,
            },
          },
          update: {
            urutan: pkt.urutan,
            deskripsi: pkt.deskripsi,
          },
          create: {
            layananId: layanan.id,
            kelompok,
            nama: pkt.nama,
            deskripsi: pkt.deskripsi,
            harga: pkt.harga[kelompok],
            urutan: pkt.urutan,
          },
        });

        const existingBenefits = await prisma.benefit.count({ where: { paketId: paket.id } });
        if (existingBenefits === 0) {
          await prisma.benefit.createMany({
            data: pkt.benefits.map((teks, idx) => ({
              paketId: paket.id,
              teks,
              urutan: idx + 1,
            })),
          });
        }
      }
    }
  }

  const seedUsername = process.env.ADMIN_SEED_USERNAME?.trim();
  const seedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (seedUsername && seedPassword) {
    await prisma.admin.upsert({
      where: { username: seedUsername },
      update: { passwordHash: hashPassword(seedPassword) },
      create: {
        username: seedUsername,
        passwordHash: hashPassword(seedPassword),
        nama: "Admin Tugasmu19",
      },
    });
    console.log(`Akun admin "${seedUsername}" berhasil disiapkan dari environment.`);
  } else {
    console.log(
      "Catatan: ADMIN_SEED_USERNAME / ADMIN_SEED_PASSWORD belum diset di .env, akun admin belum dibuat."
    );
  }

  console.log("Seed database selesai.");
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
