import Navbar from "./Navbar";
import Footer from "./Footer";
export default function PublicShell({ settings, children, wide = false }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>
      <Navbar
        nomorWhatsApp={settings.nomorWhatsApp}
        turnitinAktif={settings.turnitinAktif}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className={
          wide
            ? "flex-1"
            : "mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-16"
        }
      >
        {children}
      </main>
      <Footer
        instagramUrl={settings.instagramUrl}
        emailKontak={settings.emailKontak}
      />
    </div>
  );
}
