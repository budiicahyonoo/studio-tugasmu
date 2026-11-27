import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/shared/ToastProvider";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Studio Tugasmu | Simulasi Harga & Bantuan Akademik",
  description:
    "Platform layanan akademik dengan simulasi harga transparan berdasarkan kelompok fakultas Saintek dan Soshum, perapian deskripsi, dan cek Turnitin QRIS.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${plusJakarta.className} min-h-screen bg-[#F7F8FA] text-[#172B40] antialiased`}>
        <ToastProvider>
          <div className="relative z-10 min-h-screen">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
