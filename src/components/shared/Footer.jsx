import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#000000] border-t border-[#E5E5E5]/10 pt-16 pb-8 px-6 relative overflow-hidden">
      {/* Efek Glow Emas Tipis di pojok Footer */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FCA311]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 mb-12">
          
          {/* Kolom 1: Logo & Deskripsi (Lebih Lebar) */}
          <div className="md:col-span-5">
            <Link href="/">
              <img src="/logo.png" alt="Studio Tugasmu" className="h-10 mb-6 object-contain" />
            </Link>
            <p className="text-[#E5E5E5]/70 text-sm leading-relaxed mb-6 max-w-md">
              Platform jasa pengerjaan tugas nomor satu. Solusi aman, tepat waktu, dan berkualitas untuk siswa hingga mahasiswa. Kami engineer kesuksesan akademikmu.
            </p>
            <div className="flex items-center gap-3 text-[#E5E5E5]/60 text-sm">
              <MapPin size={16} className="text-[#FCA311]" />
              <span>Jakarta Selatan, Indonesia</span>
            </div>
            <div className="flex items-center gap-3 text-[#E5E5E5]/60 text-sm mt-3">
              <Mail size={16} className="text-[#FCA311]" />
              <span>halo@studiotugasmu.com</span>
            </div>
          </div>

          {/* Kolom 2: Navigasi */}
          <div className="md:col-span-3">
            <h4 className="text-[#FFFFFF] font-bold mb-6 text-lg">Eksplorasi</h4>
            <ul className="space-y-3">
              <li><Link href="#beranda" className="text-[#E5E5E5]/70 hover:text-[#FCA311] transition-colors text-sm">Beranda</Link></li>
              <li><Link href="#layanan" className="text-[#E5E5E5]/70 hover:text-[#FCA311] transition-colors text-sm">Layanan Kami</Link></li>
              <li><Link href="#cara-order" className="text-[#E5E5E5]/70 hover:text-[#FCA311] transition-colors text-sm">Cara Order & Estimasi</Link></li>
              <li><Link href="#portfolio" className="text-[#E5E5E5]/70 hover:text-[#FCA311] transition-colors text-sm">Portfolio Karya</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Legal & Sosmed */}
          <div className="md:col-span-4">
            <h4 className="text-[#FFFFFF] font-bold mb-6 text-lg">Ikuti Kami</h4>
            <p className="text-[#E5E5E5]/70 text-sm mb-6">
              Dapatkan update terbaru, promo, dan insight akademik menarik di sosial media kami.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/studiotugasmu19/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#14213D] p-3 rounded-full text-[#E5E5E5] hover:text-[#000000] hover:bg-[#FCA311] transition-all flex items-center justify-center"
              >
                {/* Kode SVG Custom Instagram */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#14213D] p-3 rounded-full text-[#E5E5E5] hover:text-[#000000] hover:bg-[#FCA311] transition-all flex items-center justify-center"
              >
                {/* Kode SVG Custom LinkedIn */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-[#E5E5E5]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#E5E5E5]/50 text-xs">
            © {currentYear} Studio Tugasmu (by StackPlus Studio). All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-[#E5E5E5]/50">
            <span className="hover:text-[#FCA311] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#FCA311] cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}