import { createFileRoute } from "@tanstack/react-router";
import { MODUL, KUIS } from "@/lib/konten";
import { useSekolah } from "@/lib/sekolah-store";

export const Route = createFileRoute("/penghargaan")({
  head: () => ({
    meta: [
      { title: "Bintang & Lencana Siswa — Sekolah Gembira" },
      { name: "description", content: "Lihat koleksi bintang dan lencana yang berhasil dikumpulkan dari modul, kuis, dan catatan mood harian." },
      { property: "og:title", content: "Bintang & Lencana Siswa — Sekolah Gembira" },
      { property: "og:description", content: "Koleksi hadiah belajar: bintang, lencana, dan rekap kemajuan siswa." },
    ],
  }),
  component: PenghargaanPage,
});

function PenghargaanPage() {
  const { bintang, lencana, modulSelesai, kuisSelesai, mood, reset } = useSekolah();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">🏅 Bintangku</h1>
      <p className="mt-2 font-semibold text-muted-foreground">Kumpulan hadiah dari semua kegiatan belajarmu.</p>

      <div className="card-fun mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-extrabold text-muted-foreground">Total bintang</p>
          <p className="font-display text-5xl font-extrabold text-primary">⭐ {bintang}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="Modul" value={`${modulSelesai.length}/${MODUL.length}`} />
          <Stat label="Kuis" value={`${kuisSelesai.length}/${KUIS.length}`} />
          <Stat label="Hari mood" value={String(mood.length)} />
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-extrabold">Lencana</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {lencana.map((l) => (
          <div
            key={l.id}
            className={`card-fun p-5 text-center ${l.didapat ? "" : "opacity-55 grayscale"}`}
          >
            <div className="text-5xl" aria-hidden>
              {l.emoji}
            </div>
            <p className="mt-3 text-lg font-extrabold">{l.nama}</p>
            <p className="text-sm font-semibold text-muted-foreground">{l.syarat}</p>
            <p className="mt-2 text-sm font-extrabold text-primary">{l.didapat ? "Didapat!" : "Belum didapat"}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (confirm("Mulai ulang semua bintang dan catatan?")) reset();
        }}
        className="pop mt-10 rounded-full bg-secondary px-5 py-2.5 font-bold text-secondary-foreground"
      >
        Mulai dari awal lagi
      </button>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground">
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-xs font-bold">{label}</p>
    </div>
  );
}
