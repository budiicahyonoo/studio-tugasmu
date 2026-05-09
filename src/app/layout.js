import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Studio Tugasmu | Jasa Joki Tugas Profesional",
  description: "Platform joki tugas terpercaya, aman, dan cepat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${plusJakarta.className} bg-slate-950 text-slate-50 antialiased relative min-h-screen overflow-x-hidden`}>
        {/* Efek Soft Blue Glow di Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] -z-10 animate-float pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        {children}
      </body>
    </html>
  );
}