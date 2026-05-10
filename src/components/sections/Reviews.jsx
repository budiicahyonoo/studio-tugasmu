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
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <section id="ulasan" className="py-24 px-6 relative bg-[#000000]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4 flex items-center justify-center gap-3">
            <MessageSquareQuote className="text-[#FCA311]" size={36} />
            Ulasan Pelanggan
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="grid grid-cols-1 gap-6">
            {ulasanDb.map((review, index) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#14213D]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-all shadow-lg"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? "text-[#FCA311] fill-[#FCA311]" : "text-white/10"} />
                  ))}
                </div>
                <p className="text-[#E5E5E5]/90 text-sm italic mb-4 leading-relaxed">"{review.teks}"</p>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-white font-medium text-sm">{review.nama}</span>
                  <span className="text-[#FCA311] text-xs font-medium">{review.role}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#14213D]/60 backdrop-blur-xl border border-[#FCA311]/20 rounded-2xl p-8 sticky top-28 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">Tulis Ulasanmu</h3>
            {isSubmitted ? (
              <div className="bg-[#FCA311]/20 border border-[#FCA311] text-[#FCA311] p-4 rounded-xl text-center animate-fade-up">
                <p className="font-bold">Terima kasih atas ulasannya!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="nama" required className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none" placeholder="Nama Anda" />
                <input type="text" name="role" required className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none" placeholder="Mahasiswa / Siswa" />
                <textarea name="teks" required rows="4" className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none resize-none" placeholder="Pesan Ulasan"></textarea>
                <button type="submit" className="w-full bg-[#FCA311] text-black font-bold py-3.5 rounded-lg shadow-lg">Kirim Ulasan</button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}