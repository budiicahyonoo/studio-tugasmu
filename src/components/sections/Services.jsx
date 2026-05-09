"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Services({ layananDb = [] }) {
  // Mengelompokkan data dari database berdasarkan kategorinya
  const dataLaporan = layananDb.filter(item => item.kategori === "Laporan");
  const dataSoal = layananDb.filter(item => item.kategori === "Soal");
  const dataProjek = layananDb.filter(item => item.kategori === "Projek");

  // Struktur untuk mempermudah mapping
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
    <section id="layanan" className="py-24 px-6 relative border-t border-white/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Layanan Kami</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Kami menyediakan berbagai layanan bantuan pengerjaan tugas untuk mempermudah perjalanan akademikmu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCategories.map((cat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="glass-card p-8 hover:scale-[1.02] transition-transform duration-300"
            >
              <h3 className="text-xl font-bold text-sky-400 mb-2">{cat.kategori}</h3>
              <p className="text-sm text-slate-400 mb-6 pb-6 border-b border-white/10">{cat.deskripsi}</p>
              
              <ul className="space-y-4">
                {cat.layanan.length === 0 ? (
                  <li className="text-slate-500 text-sm italic">Belum ada layanan di kategori ini.</li>
                ) : (
                  cat.layanan.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                      <CheckCircle2 className="text-sky-500 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-white text-sm font-medium">{item.namaLayanan}</h4>
                        <span className="text-xs text-slate-400">Rp {item.hargaDasar.toLocaleString('id-ID')}</span>
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