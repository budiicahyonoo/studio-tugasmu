"use client";

import { useState } from "react";
import { FileText, HelpCircle, Briefcase, Send, Calculator as CalcIcon } from "lucide-react";
import { jsPDF } from "jspdf"; 
import { calculateEstimate } from "../../lib/calculateEstimate";

export default function Calculator() {
  const [jenjang, setJenjang] = useState("Siswa");
  const [tipe, setTipe] = useState("Laporan");
  
  const [halaman, setHalaman] = useState(1);
  const [urgensi, setUrgensi] = useState("Normal (2 Hari)");
  const [paket, setPaket] = useState("Basic");

  const totalHarga = calculateEstimate({ jenjang, tipe, halaman, urgensi, paket });

  const handleOrder = () => {
    const rincian = tipe === 'Laporan' ? `${halaman} Halaman` : tipe === 'Soal' ? urgensi : paket;
    const pesanWa = `Halo Admin Studio Tugasmu!\nSaya ingin memesan layanan dengan rincian berikut:\n\n* Jenjang: ${jenjang}\n* Tipe Tugas: ${tipe}\n* Rincian: ${rincian}\n* Estimasi Harga: Rp ${totalHarga.toLocaleString('id-ID')}\n* Kesediaan DP (30%): Rp ${(totalHarga * 0.3).toLocaleString('id-ID')}\n\nMohon informasi ketersediaan slot. Terima kasih!`;
    const encodedPesan = encodeURIComponent(pesanWa);
    const noWa = "6283151195556"; 
    const waUrl = `https://wa.me/${noWa}?text=${encodedPesan}`;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(23, 105, 170);
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
    doc.save(`Estimasi_Order_StudioTugasmu_${new Date().getTime()}.pdf`);
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1000);
  };

  return (
    <section id="cara-order" className="relative border-y border-[#D7E0EB] bg-[#F4F8FC] px-5 py-20 sm:px-6 md:py-24">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="mb-4 flex items-center justify-center gap-3 text-3xl font-bold text-[#15243B] md:text-4xl">
            <CalcIcon aria-hidden="true" className="text-[#1769AA]" size={32} />
            Simulasi biaya
          </h2>
          <p className="text-[#44546A]">Pilih kebutuhan tugas untuk melihat estimasi biaya, lalu lanjutkan konsultasi melalui WhatsApp.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 rounded-2xl border border-[#D7E0EB] bg-white/80 p-6 shadow-xl backdrop-blur-md md:p-8">
            <fieldset className="mb-6">
              <legend className="mb-3 text-sm font-medium text-[#15243B]">Jenjang pendidikan</legend>
              <div className="flex flex-wrap gap-3">
                {["Siswa", "Mahasiswa"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={jenjang === item}
                    onClick={() => setJenjang(item)}
                    className={`min-h-11 flex-1 rounded-lg border px-4 py-3 transition-colors active:bg-[#D9EAF7] ${jenjang === item ? "border-[#1769AA] bg-[#EAF3FA] font-semibold text-[#12588F]" : "border-[#66758A] bg-white text-[#44546A] hover:bg-[#F4F8FC]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-6">
              <legend className="mb-3 text-sm font-medium text-[#15243B]">Tipe tugas</legend>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[{ id: "Laporan", icon: <FileText aria-hidden="true" size={18} /> }, { id: "Soal", icon: <HelpCircle aria-hidden="true" size={18} /> }, { id: "Projek", icon: <Briefcase aria-hidden="true" size={18} /> }].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={tipe === item.id}
                    onClick={() => setTipe(item.id)}
                    className={`flex min-h-16 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 transition-colors active:bg-[#D9EAF7] ${tipe === item.id ? "border-[#1769AA] bg-[#EAF3FA] text-[#12588F]" : "border-[#66758A] bg-white text-[#44546A] hover:bg-[#F4F8FC]"}`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.id}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="rounded-xl border border-[#D7E0EB] bg-[#F4F8FC] p-5">
              {tipe === "Laporan" && (
                <div>
                  <label htmlFor="jumlah-halaman" className="mb-2 block text-sm font-medium text-[#15243B]">Jumlah halaman</label>
                  <input id="jumlah-halaman" type="number" min="1" value={halaman} onChange={(e) => setHalaman(e.target.value)} className="w-full rounded-lg border border-[#66758A] bg-white px-4 py-3 text-[#15243B] focus:border-[#7152B8] focus:outline-none" />
                </div>
              )}
              {tipe === "Soal" && (
                <div>
                  <label htmlFor="kecepatan-pengerjaan" className="mb-2 block text-sm font-medium text-[#15243B]">Kecepatan pengerjaan</label>
                  <select id="kecepatan-pengerjaan" value={urgensi} onChange={(e) => setUrgensi(e.target.value)} className="w-full rounded-lg border border-[#66758A] bg-white px-4 py-3 text-[#15243B] focus:border-[#7152B8] focus:outline-none">
                    <option value="Normal (2 Hari)">Normal (2 Hari)</option>
                    <option value="Kilat (1 Hari)">Kilat (1 Hari) - Tambahan 25%</option>
                  </select>
                </div>
              )}
              {tipe === "Projek" && (
                <div>
                  <label htmlFor="paket-projek" className="mb-2 block text-sm font-medium text-[#15243B]">Pilih paket</label>
                  <select id="paket-projek" value={paket} onChange={(e) => setPaket(e.target.value)} className="w-full rounded-lg border border-[#66758A] bg-white px-4 py-3 text-[#15243B] focus:border-[#7152B8] focus:outline-none">
                    <option value="Basic">Basic (Tugas Sederhana)</option>
                    <option value="Pro">Pro (Aplikasi Menengah / Makalah Lengkap)</option>
                    <option value="Premium">Premium (Skripsi / Projek Akhir)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="relative lg:col-span-2">
            <div className="absolute -inset-1 rounded-2xl bg-[#1769AA] opacity-10 blur"></div>
            <div className="relative flex h-full flex-col rounded-2xl border border-[#1769AA]/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-8">
              <h3 className="mb-6 border-b border-[#D7E0EB] pb-4 text-xl font-bold text-[#15243B]">Ringkasan pesanan</h3>
              <div className="space-y-4 flex-grow text-sm">
                <div className="flex justify-between gap-4"><span className="text-[#44546A]">Jenjang</span><span className="font-medium text-[#15243B]">{jenjang}</span></div>
                <div className="flex justify-between gap-4"><span className="text-[#44546A]">Tipe tugas</span><span className="font-medium text-[#15243B]">{tipe}</span></div>
                <div className="mt-4 border-t border-[#D7E0EB] pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#15243B]">Estimasi total</span>
                    <span className="text-xl font-bold text-[#1769AA] sm:text-2xl">Rp {totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleOrder} className="mt-8 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1769AA] py-4 font-bold text-white shadow-lg transition-colors hover:bg-[#12588F] active:bg-[#0D4777]">
                <Send aria-hidden="true" size={18} />
                Pesan via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}