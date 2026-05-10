"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Services({ layananDb = [] }) {
  const dataLaporan = layananDb.filter(item => item.kategori === "Laporan");
  const dataSoal = layananDb.filter(item => item.kategori === "Soal");
  const dataProjek = layananDb.filter(item => item.kategori === "Projek");

  const serviceCategories = [
    {
      kategori: "Laporan & Karya Tulis",
      deskripsi: "Bantuan penulisan akademik yang terstruktur dan bebas plagiarisme.",
      layanan: dataLaporan
    },
    {
      kategori: "Tugas Soal & Analisis",
      deskripsi: "Penyelesaian soal teknis dan analisis data akurat beserta langkahnya.",
      layanan: dataSoal
    },
    {
      kategori: "Paket Projek & Skripsi",
      deskripsi: "Pendampingan penuh untuk projek akhir atau aplikasi dengan konsultasi.",
      layanan: dataProjek
    }
  ];

  return (
    // Background Hitam Pekat
    <section id="layanan" className="py-24 px-6 relative bg-[#000000]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4">Layanan Kami</h2>
          <p className="text-[#E5E5E5]/70 max-w-2xl mx-auto">Kami menyediakan berbagai layanan bantuan pengerjaan tugas untuk mempermudah perjalanan akademikmu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCategories.map((cat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              // Card Glassmorphism Navy dengan Hover Bayangan Emas
              className="bg-[#14213D]/40 backdrop-blur-md border border-[#E5E5E5]/10 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(252,163,17,0.15)] hover:border-[#FCA311]/30 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-[#FCA311] mb-2">{cat.kategori}</h3>
              <p className="text-sm text-[#E5E5E5]/70 mb-6 pb-6 border-b border-[#E5E5E5]/10">{cat.deskripsi}</p>
              
              <ul className="space-y-4">
                {cat.layanan.length === 0 ? (
                  <li className="text-[#E5E5E5]/40 text-sm italic">Belum ada layanan di kategori ini.</li>
                ) : (
                  cat.layanan.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#FCA311] shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-[#FFFFFF] text-sm font-medium">{item.namaLayanan}</h4>
                        <span className="text-xs text-[#E5E5E5]/60">Rp {item.hargaDasar.toLocaleString('id-ID')}</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}