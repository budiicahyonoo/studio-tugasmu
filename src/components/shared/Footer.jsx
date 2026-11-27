import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

export default function Footer({
  instagramUrl = "https://www.instagram.com/studiotugasmu19/",
  emailKontak = "halo@studiotugasmu.com",
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#DCE4EB] bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link href="/" className="inline-block rounded-lg">
              <Image
                src="/logo.png"
                width={332}
                height={211}
                alt="Studio Tugasmu"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#526277]">
              Platform bantuan akademik dengan simulasi harga transparan sesuai
              kelompok fakultas dan konfirmasi langsung ke WhatsApp admin.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <a
                href={`mailto:${emailKontak}`}
                className="inline-flex min-h-11 items-center gap-2 font-medium text-[#16324F] hover:text-[#116471]"
              >
                <Mail aria-hidden="true" size={16} className="text-[#167D8D]" />
                <span>{emailKontak}</span>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-semibold text-[#116471] hover:underline"
              >
                Instagram
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-sm font-bold text-[#16324F]">Navigasi</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#526277]">
              <li>
                <Link
                  href="/simulasi"
                  className="inline-flex min-h-11 items-center hover:text-[#116471]"
                >
                  Simulasi Harga
                </Link>
              </li>
              <li>
                <Link
                  href="/layanan"
                  className="inline-flex min-h-11 items-center hover:text-[#116471]"
                >
                  Katalog Layanan
                </Link>
              </li>
              <li>
                <Link
                  href="/turnitin"
                  className="inline-flex min-h-11 items-center hover:text-[#116471]"
                >
                  Cek Turnitin
                </Link>
              </li>
              <li>
                <Link
                  href="/ulasan"
                  className="inline-flex min-h-11 items-center hover:text-[#116471]"
                >
                  Galeri ulasan
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-sm font-bold text-[#16324F]">Informasi</h2>
            <Link
              href="/faq"
              className="inline-flex min-h-11 items-center text-sm hover:text-[#116471]"
            >
              FAQ
            </Link>
            <Link
              href="/tarif"
              className="ml-4 inline-flex min-h-11 items-center text-sm hover:text-[#116471]"
            >
              Tarif
            </Link>
            <ul className="mt-3 space-y-1 text-sm text-[#526277]">
              <li>
                <Link
                  href="/privacy"
                  className="inline-flex min-h-11 items-center hover:text-[#116471]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-flex min-h-11 items-center hover:text-[#116471]"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-[#DCE4EB] pt-6 text-xs text-[#526277] sm:flex-row sm:items-center">
          <span>
            © {currentYear} Studio Tugasmu. Seluruh hak cipta dilindungi.
          </span>
          <span className="font-medium text-[#16324F]">
            Tarif pasti untuk mahasiswa dan siswa
          </span>
        </div>
      </div>
    </footer>
  );
}
