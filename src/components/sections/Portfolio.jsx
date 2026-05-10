"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export default function Portfolio({ portfolioDb = [] }) {
  return (
    // Background Navy Gelap
    <section id="portfolio" className="py-24 px-6 relative bg-[#14213D] border-t border-b border-[#E5E5E5]/5">
      <div className="container mx-auto max-w-6xl relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4">
            Portfolio <span className="text-[#FCA311]">Karya</span>
          </h2>
          <p className="text-[#E5E5E5]/70 max-w-2xl mx-auto">
            Beberapa hasil karya terbaik yang telah diselesaikan oleh tim kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioDb.length === 0 ? (
            <div className="col-span-full text-center text-[#E5E5E5]/50 italic py-10 bg-[#000000]/40 border border-[#E5E5E5]/10 rounded-2xl">
              Belum ada portfolio yang diunggah.
            </div>
          ) : (
            portfolioDb.map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.1 }} 
                className="bg-[#000000]/40 backdrop-blur-md border border-[#E5E5E5]/10 rounded-2xl group overflow-hidden cursor-pointer hover:-translate-y-2 hover:border-[#FCA311]/50 transition-all duration-500 shadow-lg hover:shadow-[0_8px_30px_rgba(252,163,17,0.15)]"
              >
                <div className="h-48 w-full relative overflow-hidden bg-[#000000]">
                  <img 
                    src={item.imageUrl} 
                    alt={item.judul} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-[#FCA311]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-[#000000]/80 p-3 rounded-full border border-[#FCA311]/30">
                        <ExternalLink className="text-[#FCA311] w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-5 border-t border-[#E5E5E5]/10 bg-[#000000]/20">
                  <span className="text-[10px] font-bold text-[#000000] bg-[#FCA311] px-2 py-1 rounded-md mb-3 inline-block uppercase tracking-wider">
                    {item.kategori}
                  </span>
                  <h3 className="text-[#FFFFFF] font-bold text-lg">{item.judul}</h3>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}