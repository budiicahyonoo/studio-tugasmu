"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CreditCard,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  X,
} from "lucide-react";
import { logoutAdmin } from "../../actions/auth";
import { useToast } from "../shared/ToastProvider";
import {
  FakultasPanel,
  LayananPanel,
  KategoriPanel,
  PaketBenefitPanel,
  TarifPanel,
} from "./AdminCatalogPanels";
import {
  PembayaranPanel,
  PengaturanPanel,
  PesananPanel,
  RingkasanPanel,
} from "./AdminOperationsPanels";
import { FaqPanel, GalleryPanel } from "./AdminContentPanels";

const NAV_GROUPS = [
  {
    label: "Operasional",
    items: [
      {
        id: "ringkasan",
        label: "Ringkasan",
        icon: LayoutDashboard,
        desc: "Pantau pesanan baru, pembayaran, dan galeri ulasan.",
      },
      {
        id: "pesanan",
        label: "Pesanan",
        icon: ShoppingBag,
        desc: "Kelola status pesanan dari simulasi harga dan cari riwayat.",
      },
      {
        id: "pembayaran",
        label: "Pembayaran QRIS",
        icon: CreditCard,
        desc: "Verifikasi bukti pembayaran QRIS SeaBank dan unggah hasil PDF Turnitin.",
      },
    ],
  },
  {
    label: "Katalog & Harga",
    items: [
      {
        id: "layanan",
        label: "Layanan",
        icon: Briefcase,
        desc: "Tambah atau kelola daftar layanan Umum, Khusus, dan PKL.",
      },
      {
        id: "kategori",
        label: "Kategori",
        icon: Briefcase,
        desc: "Kelola pengelompokan layanan.",
      },
      {
        id: "tarif",
        label: "Tarif",
        icon: DollarSign,
        desc: "Atur tarif per lembar atau per slide untuk kelompok Soshum dan Saintek.",
      },
      {
        id: "paket",
        label: "Paket & Benefit",
        icon: Package,
        desc: "Kelola cakupan paket tetap, harga per kelompok, dan daftar benefit.",
      },
      {
        id: "fakultas",
        label: "Fakultas",
        icon: GraduationCap,
        desc: "Kelola daftar fakultas dan penempatannya ke kelompok Soshum atau Saintek.",
      },
    ],
  },
  {
    label: "Konten & Sistem",
    items: [
      {
        id: "ulasan",
        label: "Ulasan (galeri)",
        icon: MessageSquare,
        desc: "Unggah foto, isi label, serta atur urutan dan tampilnya.",
      },
      {
        id: "faq",
        label: "FAQ",
        icon: MessageSquare,
        desc: "Kelola pertanyaan, jawaban, tombol, dan urutan.",
      },
      {
        id: "pengaturan",
        label: "Pengaturan",
        icon: Settings,
        desc: "Ubah nomor WhatsApp admin, gambar QRIS, tautan sosial, dan halaman legal.",
      },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export default function AdminDashboardClient({
  adminUser,
  data,
  initialTab = "ringkasan",
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const activeTab = initialTab;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerButtonRef = useRef(null);
  const drawerRef = useRef(null);

  const activeMeta =
    ALL_ITEMS.find((item) => item.id === activeTab) || ALL_ITEMS[0];

  useEffect(() => {
    if (!isDrawerOpen) return;
    const focusable = () =>
      [
        ...drawerRef.current.querySelectorAll(
          "button, a[href], input, select, textarea",
        ),
      ].filter((element) => !element.disabled);
    focusable()[0]?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
        drawerButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  const runAction = async (event, actionFn, successMsg) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (form.dataset.busy) return;
    form.dataset.busy = "true";
    form.inert = true;
    try {
      const res = await actionFn(formData);
      if (res && (res.ok === false || res.success === false)) {
        showToast(res.error || "Aksi gagal dijalankan.", "error");
        return;
      }
      showToast(successMsg, "success");
      router.refresh();
    } catch (error) {
      showToast("Aksi belum berhasil. Periksa koneksi dan coba lagi.", "error");
    } finally {
      delete form.dataset.busy;
      form.inert = false;
    }
  };

  const renderSidebarLinks = (onSelect) => (
    <div className="flex flex-1 flex-col justify-between gap-6">
      <div className="space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 text-xs font-semibold text-[#526277]">
              {group.label}
            </div>
            <div className="mt-1.5 space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      router.push(`/admin/dashboard?tab=${item.id}`);
                      onSelect?.();
                    }}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-[#16324F] font-semibold text-white"
                        : "font-medium text-[#172B40] hover:bg-[#F7F8FA] hover:text-[#116471]"
                    }`}
                  >
                    <Icon aria-hidden="true" size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <form action={logoutAdmin} className="border-t border-[#DCE4EB] pt-4">
        <button
          type="submit"
          className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-[#B42318]/40 px-3 text-sm font-semibold text-[#8F1D14] transition-colors hover:bg-[#FEF3F2]"
        >
          <LogOut aria-hidden="true" size={18} />
          <span>Keluar</span>
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B40]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#DCE4EB] bg-white px-4 py-3 lg:hidden">
        <div className="text-base font-bold text-[#16324F]">
          Admin Studio Tugasmu
        </div>
        <button
          ref={drawerButtonRef}
          type="button"
          aria-label="Buka menu admin"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EB] px-3 text-sm font-semibold text-[#16324F] hover:bg-[#F7F8FA]"
        >
          <Menu aria-hidden="true" size={18} />
          <span>Menu</span>
        </button>
      </header>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu admin"
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-[#172B40]/50"
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu admin"
            className="relative z-10 flex h-full max-w-[90vw] w-72 flex-col overflow-y-auto bg-white p-4 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#DCE4EB] pb-3">
              <span className="font-bold text-[#16324F]">Menu Admin</span>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-[#F7F8FA]"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            {renderSidebarLinks(() => setIsDrawerOpen(false))}
          </aside>
        </div>
      )}

      <div
        inert={isDrawerOpen}
        className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6"
      >
        <aside className="hidden w-64 shrink-0 self-start rounded-2xl border border-[#DCE4EB] bg-white p-4 lg:sticky lg:top-6 lg:flex lg:flex-col">
          <div className="mb-5 border-b border-[#DCE4EB] pb-4">
            <div className="text-lg font-bold text-[#16324F]">
              Dashboard Admin
            </div>
            <p className="text-xs text-[#526277]">
              Masuk sebagai {adminUser.username}
            </p>
          </div>
          {renderSidebarLinks()}
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="rounded-2xl border border-[#DCE4EB] bg-white px-5 py-4">
            <h1 className="text-xl font-bold text-[#16324F] sm:text-2xl">
              {activeMeta.label}
            </h1>
            <p className="mt-1 text-sm text-[#526277]">{activeMeta.desc}</p>
          </div>

          {activeTab === "ringkasan" && <RingkasanPanel data={data} />}
          {activeTab === "pesanan" && (
            <PesananPanel
              pesanan={data.pesanan}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "pembayaran" && (
            <PembayaranPanel
              pembayaran={data.pembayaran}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "layanan" && (
            <LayananPanel
              layanan={data.layanan}
              kategori={data.kategori}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "tarif" && (
            <TarifPanel
              layanan={data.layanan}
              riwayatHarga={data.riwayatHarga}
              paging={data.paging}
              historyPaging={data.historyPaging}
              runAction={runAction}
            />
          )}
          {activeTab === "paket" && (
            <PaketBenefitPanel
              paket={data.paket}
              layananOptions={data.layananOptions}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "fakultas" && (
            <FakultasPanel
              fakultas={data.fakultas}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "kategori" && (
            <KategoriPanel
              kategori={data.kategori}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "ulasan" && (
            <GalleryPanel
              galeri={data.galeri}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "faq" && (
            <FaqPanel
              faq={data.faq}
              paging={data.paging}
              runAction={runAction}
            />
          )}
          {activeTab === "pengaturan" && (
            <PengaturanPanel
              pengaturan={data.pengaturan}
              runAction={runAction}
            />
          )}
        </main>
      </div>
    </div>
  );
}
