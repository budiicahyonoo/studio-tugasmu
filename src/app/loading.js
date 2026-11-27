export default function Loading() {
  return (
    <main
      className="flex min-h-[50vh] items-center justify-center bg-[#F7F8FA] px-6 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <p role="status" className="text-sm font-medium text-[#526277]">
        Memuat layanan, karya, dan ulasan.
      </p>
    </main>
  );
}
