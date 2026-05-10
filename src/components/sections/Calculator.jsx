"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, HelpCircle, Briefcase, Send, Calculator as CalcIcon } from "lucide-react";
import { jsPDF } from "jspdf"; 

export default function Calculator() {
  const [jenjang, setJenjang] = useState("Siswa");
  const [tipe, setTipe] = useState("Laporan");
  
  const [halaman, setHalaman] = useState(1);
  const [urgensi, setUrgensi] = useState("Normal (2 Hari)");
  const [paket, setPaket] = useState("Basic");

  const [totalHarga, setTotalHarga] = useState(0);

  useEffect(() => {
    let harga = 0;
    const baseHarga = jenjang === "Siswa" ? 3000 : 5000;

    if (tipe === "Laporan") {
      harga = baseHarga * halaman;
    } else if (tipe === "Soal") {
      const hargaSoal = jenjang === "Siswa" ? 30000 : 50000;
      harga = urgensi === "Kilat (1 Hari)" ? hargaSoal * 1.25 : hargaSoal;
    } else if (tipe === "Projek") {
      harga = paket === "Basic" ? 150000 : paket === "Pro" ? 350000 : 700000;
    }
    setTotalHarga(harga);
  }, [jenjang, tipe, halaman, urgensi, paket]);

  const handleOrder = () => {
    const rincian = tipe === 'Laporan' ? `${halaman} Halaman` : tipe === 'Soal' ? urgensi : paket;
    const pesanWa = `Halo Admin Studio Tugasmu!\nSaya ingin memesan layanan dengan rincian berikut:\n\n* Jenjang: ${jenjang}\n* Tipe Tugas: ${tipe}\n* Rincian: ${rincian}\n* Estimasi Harga: Rp ${totalHarga.toLocaleString('id-ID')}\n* Kesediaan DP (30%): Rp ${(totalHarga * 0.3).toLocaleString('id-ID')}\n\nMohon informasi ketersediaan slot. Terima kasih!`;
    const encodedPesan = encodeURIComponent(pesanWa);
    const noWa = "6283151195556"; 
    const waUrl = `https://wa.me/${noWa}?text=${encodedPesan}`;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(252, 163, 17); // Warna PDF ke Emas
    doc.text("INVOICE ESTIMASI - STUDIO TUGASMU", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 30);
    doc.text(`Jenjang Pendidikan : ${jenjang}`, 20, 50);
    doc.text(`Tipe Tugas         : ${tipe}`, 20, 60);
    doc.text(`Spesifikasi        : ${rincian}`, 20, 70);
    doc.setFontSize(14);
    doc.text(`Total Estimasi     : Rp ${totalHarga.toLocaleString('id-ID')}`, 20, 90);
    doc.text(`Minimal DP (30%)   : Rp ${(totalHarga * 0.3).toLocaleString('id-ID')}`, 20, 100);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("-------------------------------------------------------------------", 20, 120);
    doc.text("* Ini adalah dokumen estimasi biaya sementara.", 20, 130);
    doc.text("* Pengerjaan dimulai setelah kesepakatan di WhatsApp & pembayaran DP.", 20, 135);
    doc.text("* Pembayaran via: BCA (1234567) / GoPay (081234) a.n Studio Tugasmu", 20, 145);
    doc.save(`Estimasi_Order_StudioTugasmu_${new Date().getTime()}.pdf`);
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1000);
  };

  return (
    // Background Navy Gelap
    <section id="cara-order" className="py-24 px-6 relative bg-[#14213D] border-t border-b border-[#E5E5E5]/5">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-4 flex items-center justify-center gap-3">
            <CalcIcon className="text-[#FCA311]" size={36} />
            Simulasi & Pemesanan
          </h2>
          <p className="text-[#E5E5E5]/70">Hitung estimasi biayamu transparan di depan, lalu pesan via WhatsApp.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Kolom Kiri */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-[#000000]/40 backdrop-blur-md border border-[#E5E5E5]/10 rounded-2xl p-6 md:p-8 shadow-xl"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#E5E5E5] mb-3">Jenjang Pendidikan</label>
              <div className="flex gap-4">
                {["Siswa", "Mahasiswa"].map((item) => (
                  <button key={item} onClick={() => setJenjang(item)} className={`flex-1 py-3 rounded-lg border transition-all ${ jenjang === item ? "bg-[#FCA311]/20 border-[#FCA311] text-[#FCA311]" : "bg-[#14213D]/50 border-[#E5E5E5]/10 text-[#E5E5E5]/70 hover:bg-[#FCA311]/10" }`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#E5E5E5] mb-3">Tipe Tugas</label>
              <div className="grid grid-cols-3 gap-3">
                {[ { id: "Laporan", icon: <FileText size={18} /> }, { id: "Soal", icon: <HelpCircle size={18} /> }, { id: "Projek", icon: <Briefcase size={18} /> } ].map((item) => (
                  <button key={item.id} onClick={() => setTipe(item.id)} className={`flex flex-col items-center justify-center py-4 rounded-lg border transition-all gap-2 ${ tipe === item.id ? "bg-[#FCA311]/20 border-[#FCA311] text-[#FCA311]" : "bg-[#14213D]/50 border-[#E5E5E5]/10 text-[#E5E5E5]/70 hover:bg-[#FCA311]/10" }`}>
                    {item.icon} <span className="text-sm font-medium">{item.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#14213D]/50 rounded-xl border border-[#E5E5E5]/5">
              {tipe === "Laporan" && (
                <div>
                  <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Jumlah Halaman</label>
                  <input type="number" min="1" value={halaman} onChange={(e) => setHalaman(e.target.value)} className="w-full bg-[#000000]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none" />
                  <p className="text-xs text-[#E5E5E5]/50 mt-2">*Tenggat waktu default: Selesai dalam 24 Jam.</p>
                </div>
              )}
              {tipe === "Soal" && (
                <div>
                  <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Kecepatan Pengerjaan</label>
                  <select value={urgensi} onChange={(e) => setUrgensi(e.target.value)} className="w-full bg-[#000000]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none [&>option]:bg-[#14213D]">
                    <option value="Normal (2 Hari)">Normal (2 Hari)</option>
                    <option value="Kilat (1 Hari)">Kilat (1 Hari) - Tambahan 25%</option>
                  </select>
                </div>
              )}
              {tipe === "Projek" && (
                <div>
                  <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Pilih Paket Bundling</label>
                  <select value={paket} onChange={(e) => setPaket(e.target.value)} className="w-full bg-[#000000]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:outline-none [&>option]:bg-[#14213D]">
                    <option value="Basic">Basic (Tugas Sederhana)</option>
                    <option value="Pro">Pro (Aplikasi Menengah / Makalah Lengkap)</option>
                    <option value="Premium">Premium (Skripsi / Projek Akhir)</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>

          {/* Kolom Kanan */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 relative"
          >
            <div className="absolute -inset-1 bg-[#FCA311] rounded-2xl blur opacity-10"></div>
            <div className="relative bg-[#000000]/40 backdrop-blur-md border border-[#FCA311]/20 rounded-2xl p-6 md:p-8 h-full flex flex-col shadow-xl">
              <h3 className="text-xl font-bold text-[#FFFFFF] mb-6 border-b border-[#E5E5E5]/10 pb-4">Ringkasan Pesanan</h3>
              <div className="space-y-4 flex-grow text-sm">
                <div className="flex justify-between"><span className="text-[#E5E5E5]/70">Jenjang</span><span className="text-[#FFFFFF] font-medium">{jenjang}</span></div>
                <div className="flex justify-between"><span className="text-[#E5E5E5]/70">Tipe Tugas</span><span className="text-[#FFFFFF] font-medium">{tipe}</span></div>
                {tipe === "Laporan" && <div className="flex justify-between"><span className="text-[#E5E5E5]/70">Total Halaman</span><span className="text-[#FFFFFF] font-medium">{halaman} Lembar</span></div>}
                {tipe === "Soal" && <div className="flex justify-between"><span className="text-[#E5E5E5]/70">Waktu</span><span className="text-[#FFFFFF] font-medium">{urgensi}</span></div>}
                {tipe === "Projek" && <div className="flex justify-between"><span className="text-[#E5E5E5]/70">Paket</span><span className="text-[#FFFFFF] font-medium">{paket}</span></div>}
                <div className="pt-4 border-t border-[#E5E5E5]/10 mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#E5E5E5]">Estimasi Total</span>
                    <span className="text-2xl font-bold text-[#FCA311]">Rp {totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-[10px] text-[#E5E5E5]/50 text-right">*DP Minimal 30%: Rp {(totalHarga * 0.3).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <button onClick={handleOrder} className="w-full mt-8 bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_4px_15px_rgba(252,163,17,0.3)]">
                <Send size={18} />
                Pesan via WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}