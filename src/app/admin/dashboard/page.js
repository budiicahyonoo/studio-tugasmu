import { prisma } from "../../../lib/prisma";
import { tambahLayanan, hapusLayanan } from "../../../actions/layanan";
import { setujuiUlasan, hapusUlasan } from "../../../actions/ulasan";
import { tambahPortfolio, hapusPortfolio } from "../../../actions/portfolio";
import Link from "next/link";
import { LogOut, Trash2, Plus, LayoutDashboard, CheckCircle, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Insight: Mengambil data secara paralel untuk mempercepat loading dashboard
  const [daftarLayanan, daftarUlasan, daftarPortfolio] = await Promise.all([
    prisma.layanan.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.ulasan.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return (
    <main className="min-h-screen bg-[#000000] text-[#FFFFFF] p-6 md:p-12 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#FCA311]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#E5E5E5]/10">
          <div className="flex items-center gap-3">
            <div className="bg-[#FCA311]/15 p-3 rounded-xl border border-[#FCA311]/30">
              <LayoutDashboard className="text-[#FCA311]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-[#E5E5E5]/70 text-sm">Kelola Studio Tugasmu secara real-time</p>
            </div>
          </div>
          <Link href="/admin/login" className="flex items-center gap-2 bg-[#14213D]/60 text-red-400 hover:bg-[#14213D] px-4 py-2 rounded-lg border border-red-500/20">
            <LogOut size={18} /> Logout
          </Link>
        </div>

        {/* SECTION 1: LAYANAN */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-1 bg-[#FCA311] rounded-full"></div>
            <h2 className="text-xl font-bold">Manajemen Harga & Layanan</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#000000] border border-[#FCA311]/10 rounded-2xl p-6 h-fit">
              <h3 className="text-sm font-bold mb-4 text-[#FCA311] uppercase tracking-wider">Tambah Layanan Baru</h3>
              <form action={tambahLayanan} className="space-y-4">
                <select name="kategori" required className="w-full bg-[#14213D]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:ring-0 [&>option]:bg-[#000000]">
                  <option value="Laporan">Laporan & KTI</option>
                  <option value="Soal">Tugas Soal</option>
                  <option value="Projek">Projek & Skripsi</option>
                </select>
                <input type="text" name="namaLayanan" required placeholder="Nama Layanan" className="w-full bg-[#14213D]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:ring-0" />
                <input type="number" name="hargaDasar" required placeholder="Harga (Rp)" className="w-full bg-[#14213D]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:ring-0" />
                <button type="submit" className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] font-bold py-3 rounded-lg shadow-lg transition-all">
                  Simpan Layanan
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-[#000000] border border-[#E5E5E5]/10 rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-[#14213D] border-b border-[#E5E5E5]/10 text-[#E5E5E5]/70">
                    <tr>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Nama Layanan</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]/10">
                    {daftarLayanan.map((item) => (
                      <tr key={item.id} className="hover:bg-[#14213D]/40">
                        <td className="px-4 py-3"><span className="bg-[#FCA311]/10 text-[#FCA311] text-[10px] px-2 py-1 rounded-md border border-[#FCA311]/20">{item.kategori}</span></td>
                        <td className="px-4 py-3 text-[#FFFFFF] font-medium">{item.namaLayanan}</td>
                        <td className="px-4 py-3 text-right">
                          <form action={hapusLayanan}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="text-[#E5E5E5]/60 hover:text-red-400 p-2"><Trash2 size={16} /></button>
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

        {/* SECTION 2: PORTFOLIO */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-1 bg-[#FCA311] rounded-full"></div>
            <h2 className="text-xl font-bold">Manajemen Portfolio Karya</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#000000] border border-[#FCA311]/10 rounded-2xl p-6 h-fit border-[#FCA311]/20">
              <h3 className="text-sm font-bold mb-4 text-[#FCA311] uppercase tracking-wider">Tambah Hasil Karya</h3>
              <form action={tambahPortfolio} className="space-y-4">
                <input type="text" name="judul" required placeholder="Judul Projek" className="w-full bg-[#14213D]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:ring-0" />
                <select name="kategori" required className="w-full bg-[#14213D]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-3 rounded-xl focus:border-[#FCA311]/50 focus:ring-0 [&>option]:bg-[#000000]">
                  <option value="Laporan">Laporan</option>
                  <option value="Soal">Soal</option>
                  <option value="Projek">Projek</option>
                </select>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#E5E5E5]/70 ml-1 uppercase">Pilih File Gambar</label>
                  <input type="file" name="imageFile" accept="image/*" required className="w-full bg-[#14213D]/50 border border-[#E5E5E5]/10 text-[#FFFFFF] px-4 py-2 rounded-xl focus:border-[#FCA311]/50 focus:ring-0 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#FCA311] file:text-[#000000] hover:file:bg-[#FCA311]/80 cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] font-bold py-3 rounded-lg shadow-lg transition-all">
                  Upload & Simpan
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-[#000000] border border-[#E5E5E5]/10 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {daftarPortfolio.map((item) => (
                  <div key={item.id} className="bg-[#14213D]/30 p-3 rounded-xl border border-[#E5E5E5]/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={item.imageUrl} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-[#000000]" alt="" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-[#FFFFFF] truncate">{item.judul}</p>
                        <p className="text-[10px] text-[#FCA311] uppercase">{item.kategori}</p>
                      </div>
                    </div>
                    <form action={hapusPortfolio}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="text-[#E5E5E5]/60 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: ULASAN */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-1 bg-[#FCA311] rounded-full"></div>
            <h2 className="text-xl font-bold">Moderasi Ulasan Pelanggan</h2>
          </div>
          <div className="bg-[#000000] border border-[#E5E5E5]/10 rounded-2xl p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-[#14213D] border-b border-[#E5E5E5]/10 text-[#E5E5E5]/70">
                  <tr>
                    <th className="px-4 py-3">Pengirim</th>
                    <th className="px-4 py-3">Pesan</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]/10">
                  {daftarUlasan.map((review) => (
                    <tr key={review.id} className="hover:bg-[#14213D]/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#FFFFFF]">{review.nama}</div>
                        <div className="text-[10px] text-[#FCA311]">{review.role}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-[#E5E5E5]/80 italic">"{review.teks}"</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${review.status === 'PENDING' ? 'text-[#E5E5E5] border-[#E5E5E5]/30 bg-[#14213D]' : 'text-[#FCA311] border-[#FCA311]/30 bg-[#FCA311]/5'}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        {review.status === "PENDING" && (
                          <form action={setujuiUlasan}>
                            <input type="hidden" name="id" value={review.id} />
                            <button type="submit" className="text-[#FCA311] hover:bg-[#FCA311]/10 p-2 rounded-lg border border-[#FCA311]/20"><CheckCircle size={16} /></button>
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