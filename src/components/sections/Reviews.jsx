"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquareQuote } from "lucide-react";
import { tambahUlasan } from "../../actions/ulasan"; // Import Server Action

export default function Reviews({ ulasanDb = [] }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fungsi saat form disubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Panggil fungsi database
    await tambahUlasan(formData);
    
    // Tampilkan pesan sukses
    setIsSubmitted(true);
    e.target.reset(); // Kosongkan form

    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <section id="ulasan" className="py-24 px-6 relative border-t border-white/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <MessageSquareQuote className="text-sky-400" size={36} />
            Ulasan Pelanggan
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Apa kata mereka yang sudah menggunakan jasa kami?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Kolom Kiri: Daftar Ulasan dari Database */}
          <div className="grid grid-cols-1 gap-6">
            {ulasanDb.length === 0 ? (
              <div className="text-slate-500 italic text-center py-10 glass-card">
                Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
              </div>
            ) : (
              ulasanDb.map((review, index) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm italic mb-4">"{review.teks}"</p>
                  <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
                    <span className="text-white font-medium text-sm">{review.nama}</span>
                    <span className="text-sky-400 text-xs">{review.role}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Kolom Kanan: Form Tambah Ulasan */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sticky top-28"
          >
            <h3 className="text-xl font-bold text-white mb-6">Tulis Ulasanmu</h3>
            
            {isSubmitted ? (
              <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 p-4 rounded-xl text-center animate-fade-up">
                <p className="font-medium">Terima kasih atas ulasannya!</p>
                <p className="text-sm mt-1 text-emerald-200">Ulasan Anda telah dikirim dan menunggu persetujuan dari Admin.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Nama</label>
                  <input type="text" name="nama" required className="w-full glass-input" placeholder="Nama Anda" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Status / Pekerjaan</label>
                  <input type="text" name="role" required className="w-full glass-input" placeholder="Contoh: Mahasiswa S1" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Pesan Ulasan</label>
                  <textarea name="teks" required rows="4" className="w-full glass-input resize-none" placeholder="Ceritakan pengalamanmu..."></textarea>
                </div>
                <button type="submit" className="w-full bg-white/10 hover:bg-sky-500 text-white font-semibold py-3 rounded-lg transition-all hover:scale-105 border border-white/10 hover:border-sky-400">
                  Kirim Ulasan
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}