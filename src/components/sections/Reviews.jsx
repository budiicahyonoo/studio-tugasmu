"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquareQuote } from "lucide-react";
import { tambahUlasan } from "../../actions/ulasan"; 

export default function Reviews({ ulasanDb = [] }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await tambahUlasan(formData);
    setIsSubmitted(true);
    e.target.reset(); 
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    // Background Hitam Pekat
    <section id="ulasan" className="py-24 px-6 relative bg-[#000000]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4 flex items-center justify-center gap-3">
            <MessageSquareQuote className="text-[#FCA311]" size={36} />
            Ulasan Pelanggan
          </h2>
          <p className="text-[#E5E5E5]/70 max-w-2xl mx-auto">Apa kata mereka yang sudah menggunakan jasa kami?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Kolom Kiri */}
          <div className="grid grid-cols-1 gap-6">
            {ulasanDb.length === 0 ? (
              <div className="text-[#E5E5E5]/50 italic text-center py-10 bg-[#14213D]/40 border border-[#E5E5E5]/10 rounded-2xl">
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
                  className="bg-[#14213D]/40 backdrop-blur-md border border-[#E5E5E5]/10 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(252,163,17,0.1)] transition-all"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "text-[#FCA311] fill-[#FCA311]" : "text-[#E5E5E5]/20"} />
                    ))}
                  </div>
                  <p className="text-[#E5E5E5]/90 text-sm italic mb-4 leading-relaxed">"{review.teks}"</p>
                  <div className="flex justify-between items-center border-t border-[#E5E5E5]/10 pt-4 mt-auto">
                    <span className="text-[#FFFFFF] font-medium text-sm">{review.nama}</span>
                    <span className="text-[#FCA311] text-xs font-medium">{review.role}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Kolom Kanan: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#14213D]/60 backdrop-blur-md border border-[#FCA311]/20 rounded-2xl p-8 sticky top-28 shadow-xl"
          >
            <h3 className="text-xl font-bold text-[#FFFFFF] mb-6">Tulis Ulasanmu</h3>
            
            {isSubmitted ? (
              <div className="bg-[#FCA311]/20 border border-[#FCA311] text-[#FCA311] p-4 rounded-xl text-center animate-fade-up">
                <p className="font-bold">Terima kasih atas ulasannya!</p>
                <p className="text-sm mt-1 text-[#E5E5E5]">Ulasan Anda telah dikirim dan menunggu persetujuan dari Admin.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#E5E5E5] mb-2 font-medium">Nama</label>
                  <input type="text" name="nama" required className="w-full bg-[#000000]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none" placeholder="Nama Anda" />
                </div>
                <div>
                  <label className="block text-sm text-[#E5E5E5] mb-2 font-medium">Status / Pekerjaan</label>
                  <input type="text" name="role" required className="w-full bg-[#000000]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none" placeholder="Contoh: Mahasiswa S1" />
                </div>
                <div>
                  <label className="block text-sm text-[#E5E5E5] mb-2 font-medium">Pesan Ulasan</label>
                  <textarea name="teks" required rows="4" className="w-full bg-[#000000]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none resize-none" placeholder="Ceritakan pengalamanmu..."></textarea>
                </div>
                <button type="submit" className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] font-bold py-3.5 rounded-lg transition-all hover:scale-[1.02] shadow-[0_4px_15px_rgba(252,163,17,0.2)]">
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