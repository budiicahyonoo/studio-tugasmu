"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export default function Portfolio({ portfolioDb = [] }) {
  return (
    <section id="portfolio" className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Portfolio Kami</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Beberapa hasil karya terbaik yang telah diselesaikan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioDb.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 italic py-10 glass-card">
              Belum ada portfolio yang diunggah.
            </div>
          ) : (
            portfolioDb.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="glass-card group overflow-hidden cursor-pointer">
                <div className="h-48 w-full relative overflow-hidden bg-slate-800">
                  <img src={item.imageUrl} alt={item.judul} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-sky-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <ExternalLink className="text-white w-10 h-10" />
                  </div>
                </div>
                <div className="p-5 border-t border-white/10">
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-1 rounded-md mb-2 inline-block">{item.kategori}</span>
                  <h3 className="text-white font-medium mt-2">{item.judul}</h3>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}