"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export default function Portfolio({ portfolioDb = [] }) {
  return (
    <section id="portfolio" className="py-24 px-6 relative bg-[#14213D] border-t border-b border-white/5">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4">
            Portfolio <span className="text-[#FCA311]">Karya</span>
          </h2>
          <p className="text-[#E5E5E5]/70 max-w-2xl mx-auto">Hasil karya terbaik yang telah diselesaikan oleh tim kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioDb.map((item, index) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ delay: index * 0.1 }} 
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl group overflow-hidden hover:-translate-y-2 hover:border-[#FCA311]/50 transition-all duration-500 shadow-xl"
            >
              <div className="h-48 w-full relative overflow-hidden bg-black">
                <img src={item.imageUrl} alt={item.judul} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" />
                <div className="absolute inset-0 bg-[#FCA311]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                   <ExternalLink className="text-[#FCA311] w-8 h-8" />
                </div>
              </div>
              <div className="p-5 border-t border-white/10 bg-black/20">
                <span className="text-[10px] font-bold text-black bg-[#FCA311] px-2 py-1 rounded-md mb-3 inline-block uppercase">{item.kategori}</span>
                <h3 className="text-[#FFFFFF] font-bold text-lg">{item.judul}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}