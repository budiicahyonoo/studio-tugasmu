import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
const prisma = new PrismaClient();
const faculties = {
  SAINTEK: [
    "Teknik",
    "Kedokteran",
    "Kedokteran Gigi",
    "Kedokteran Hewan",
    "Farmasi",
    "MIPA (Matematika, Fisika, Biologi, Statistika)",
    "Kesehatan (Keperawatan, Kebidanan, Gizi)",
    "Pertanian",
    "Teknologi Informasi dan Ilmu Komputer",
  ],
  SOSHUM: [
    "Hukum",
    "FKIP (Keguruan dan Ilmu Pendidikan)",
    "Ekonomi dan Bisnis (Akuntansi, Manajemen)",
    "Ilmu Sosial dan Politik",
    "Ilmu Komunikasi",
    "Ilmu Budaya dan Sastra",
    "Psikologi",
    "Hubungan Internasional",
  ],
};
async function main() {
  await prisma.pengaturan.upsert({
    where: { id: "default" },
    update: {},
    create: {
      nomorWhatsApp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
      syaratKetentuan:
        "Harga mengikuti rincian layanan atau paket yang disetujui. Konfirmasi pengerjaan melalui WhatsApp admin. Estimasi dan benefit mengikuti katalog. Pembayaran QRIS untuk Turnitin diperiksa manual oleh admin. Hubungi admin untuk cakupan revisi dan pembatalan sebelum menyetujui pesanan.",
      kebijakanPrivasi:
        "Data formulir digunakan untuk menghitung biaya dan menyimpan pesanan di Neon PostgreSQL. Jika kamu memilih perapian deskripsi, teks dikirim ke Groq atau OpenRouter. File diunggah ke Cloudinary. WhatsApp memproses pesan yang kamu kirim kepada admin. Jangan sertakan data sensitif dalam deskripsi. Hubungi admin untuk permintaan penghapusan data.",
    },
  });
  for (const [index, [id, nama]] of [
    ["UMUM", "Umum"],
    ["KHUSUS", "Khusus"],
    ["PKL", "PKL"],
  ].entries())
    await prisma.kategori.upsert({
      where: { id },
      update: {},
      create: { id, nama, urutan: index },
    });
  let urutan = 0;
  for (const [kelompok, names] of Object.entries(faculties))
    for (const nama of names)
      await prisma.fakultas.upsert({
        where: { nama },
        update: {},
        create: { nama, kelompok, urutan: urutan++ },
      });
  const services = [
    ["Artikel", "UMUM", "PER_LEMBAR"],
    ["Paper", "UMUM", "PER_LEMBAR"],
    ["Makalah", "UMUM", "PER_LEMBAR"],
    ["PPT", "UMUM", "PER_SLIDE"],
    ["Laporan", "UMUM", "PER_PAKET"],
    ["Skripsi", "KHUSUS", "PER_PAKET"],
    ["Thesis", "KHUSUS", "PER_PAKET"],
    ["Projek", "KHUSUS", "PER_PAKET"],
    ["Praktikum", "PKL", "PER_PAKET"],
    ["Laporan PKL", "PKL", "PER_PAKET"],
    ["Observasi", "PKL", "PER_PAKET"],
    ["Cek Turnitin", "UMUM", "PER_PAKET"],
  ];
  for (const [index, [nama, kategori, tipeHitung]] of services.entries()) {
    const service = await prisma.layanan.upsert({
      where: { nama },
      update: {},
      create: {
        nama,
        kategori,
        tipeHitung,
        estimasiSelesai: "1x24 jam",
        urutan: index,
      },
    });
    if (tipeHitung !== "PER_PAKET")
      for (const [kelompok, hargaPerUnit] of [
        ["SOSHUM", 3000],
        ["SAINTEK", 4000],
      ])
        await prisma.tarif.upsert({
          where: { layananId_kelompok: { layananId: service.id, kelompok } },
          update: {},
          create: { layananId: service.id, kelompok, hargaPerUnit },
        });
    if (nama === "Skripsi")
      for (const kelompok of ["SOSHUM", "SAINTEK"])
        for (const [urutan, [nama, harga]] of [
          ["Sempro (Bab 1-3)", 2000000],
          ["Full (Bab 1-5)", 5000000],
        ].entries())
          await prisma.paket.upsert({
            where: {
              layananId_kelompok_nama: {
                layananId: service.id,
                kelompok,
                nama,
              },
            },
            update: {},
            create: { layananId: service.id, kelompok, nama, harga, urutan },
          });
  }
  const faqs = [
    [
      "Bagaimana cara memesan layanan?",
      "Isi data pada Simulasi, pilih layanan dan jumlah atau paket, lalu tinjau harga serta benefit. Setelah menyetujui, buka WhatsApp dan tekan Kirim untuk menghubungi admin.",
      "Buka simulasi",
      "/simulasi",
    ],
    [
      "Mengapa tarif berbeda antar fakultas?",
      "Fakultas dibagi ke kelompok Saintek dan Soshum. Kelompok menentukan tarif per unit atau paket. Pilihan fakultas dan harga terlihat pada simulasi sebelum konfirmasi.",
      "Lihat tarif",
      "/tarif",
    ],
    [
      "Apakah harga Full tambahan dari Sempro?",
      "Tidak. Harga paket Full adalah total untuk cakupan paket tersebut. Periksa cakupan dan benefit yang tercantum sebelum menyetujui.",
      "Periksa paket",
      "/tarif",
    ],
    [
      "Apakah saya harus menggunakan perapian AI?",
      "Tidak. Kamu tetap dapat memesan menggunakan deskripsi asli. Jika memilih perapian, tinjau teks yang dihasilkan dan pilih sendiri versi yang akan dikirim.",
      "Tulis deskripsi tugas",
      "/simulasi",
    ],
  ];
  for (const [
    urutan,
    [pertanyaan, jawaban, labelTombol, tujuanTombol],
  ] of faqs.entries())
    if (!(await prisma.faq.findFirst({ where: { pertanyaan } })))
      await prisma.faq.create({
        data: { pertanyaan, jawaban, labelTombol, tujuanTombol, urutan },
      });
  const username = process.env.ADMIN_SEED_USERNAME?.trim();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (username && password) {
    if (password.length < 12)
      throw new Error(
        "Seed admin requires a password of at least 12 characters.",
      );
    const salt = randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
    await prisma.admin.upsert({
      where: { username },
      update: {},
      create: { username, passwordHash, nama: "Admin Studio Tugasmu" },
    });
  }
  console.log(
    "Seed selesai. Data yang sudah ada tidak diubah. Lengkapi harga paket dan benefit melalui dashboard.",
  );
}
main()
  .catch((error) => {
    console.error("Seed gagal:", error.code || "VALIDATION");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
