import { prisma } from "../../../lib/prisma";
import { tambahLayanan, hapusLayanan } from "../../../actions/layanan";
import { setujuiUlasan, hapusUlasan } from "../../../actions/ulasan";
import { tambahPortfolio, hapusPortfolio } from "../../../actions/portfolio";
import Link from "next/link";
import { LogOut, Trash2, Plus, LayoutDashboard, CheckCircle, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const daftarLayanan = await prisma.layanan.findMany({ orderBy: { createdAt: "desc" } });
  const daftarUlasan = await prisma.ulasan.findMany({ orderBy: { createdAt: "desc" } });
  const daftarPortfolio = await prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/20 p-3 rounded-xl border border-sky-500/30">
              <LayoutDashboard className="text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-slate-400 text-sm">Kelola Studio Tugasmu secara real-time</p>
            </div>
          </div>
          <Link href="/admin/login" className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/20">
            <LogOut size={18} /> Logout
          </Link>
        </div>

        {/* --- SECTION 1: MANAJEMEN LAYANAN --- */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-1 bg-sky-500 rounded-full"></div>
            <h2 className="text-xl font-bold">Manajemen Harga & Layanan</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Input Layanan */}
            <div className="glass-card p-6 h-fit">
              <h3 className="text-sm font-bold mb-4 text-sky-400 uppercase tracking-wider">Tambah Layanan Baru</h3>
              <form action={tambahLayanan} className="space-y-4">
                <select name="kategori" required className="w-full glass-input [&>option]:bg-slate-900">
                  <option value="Laporan">Laporan & KTI</option>
                  <option value="Soal">Tugas Soal</option>
                  <option value="Projek">Projek & Skripsi</option>
                </select>
                <input type="text" name="namaLayanan" required placeholder="Nama Layanan" className="w-full glass-input" />
                <input type="number" name="hargaDasar" required placeholder="Harga (Rp)" className="w-full glass-input" />
                <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
                  Simpan Layanan
                </button>
              </form>
            </div>

            {/* Tabel Daftar Layanan */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Nama Layanan</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {daftarLayanan.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="px-4 py-3"><span className="bg-sky-500/10 text-sky-400 text-[10px] px-2 py-1 rounded-md border border-sky-500/20">{item.kategori}</span></td>
                        <td className="px-4 py-3 text-white font-medium">{item.namaLayanan}</td>
                        <td className="px-4 py-3 text-right">
                          <form action={hapusLayanan}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: MANAJEMEN PORTFOLIO --- */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
            <h2 className="text-xl font-bold">Manajemen Portfolio Karya</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Input Portfolio - SEKARANG MENGGUNAKAN UPLOAD FILE */}
            <div className="glass-card p-6 h-fit border-emerald-500/20">
              <h3 className="text-sm font-bold mb-4 text-emerald-400 uppercase tracking-wider">Tambah Hasil Karya</h3>
              <form action={tambahPortfolio} className="space-y-4">
                <input type="text" name="judul" required placeholder="Judul Projek" className="w-full glass-input" />
                <select name="kategori" required className="w-full glass-input [&>option]:bg-slate-900">
                  <option value="Laporan">Laporan</option>
                  <option value="Soal">Soal</option>
                  <option value="Projek">Projek</option>
                </select>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 ml-1 uppercase">Pilih File Gambar</label>
                  <input 
                    type="file" 
                    name="imageFile" 
                    accept="image/*" 
                    required 
                    className="w-full glass-input file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer" 
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
                  Upload & Simpan
                </button>
              </form>
            </div>

            {/* Grid Daftar Portfolio */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {daftarPortfolio.map((item) => (
                  <div key={item.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={item.imageUrl} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-800" alt="" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{item.judul}</p>
                        <p className="text-[10px] text-emerald-400 uppercase">{item.kategori}</p>
                      </div>
                    </div>
                    <form action={hapusPortfolio}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: MANAJEMEN ULASAN --- */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
            <h2 className="text-xl font-bold">Moderasi Ulasan Pelanggan</h2>
          </div>
          
          <div className="glass-card p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Pengirim</th>
                    <th className="px-4 py-3">Pesan</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {daftarUlasan.map((review) => (
                    <tr key={review.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{review.nama}</div>
                        <div className="text-[10px] text-sky-400">{review.role}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-400 italic">"{review.teks}"</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${review.status === 'PENDING' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        {review.status === "PENDING" && (
                          <form action={setujuiUlasan}>
                            <input type="hidden" name="id" value={review.id} />
                            <button type="submit" className="text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20"><CheckCircle size={16} /></button>
                          </form>
                        )}
                        <form action={hapusUlasan}>
                          <input type="hidden" name="id" value={review.id} />
                          <button type="submit" className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg border border-red-500/20"><Trash2 size={16} /></button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}