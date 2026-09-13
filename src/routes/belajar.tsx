import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MODUL } from "@/lib/konten";
import { useSekolah } from "@/lib/sekolah-store";

export const Route = createFileRoute("/belajar")({
  head: () => ({
    meta: [
      { title: "Modul Belajar Bergambar — Sekolah Gembira" },
      { name: "description", content: "Modul belajar bergambar untuk anak: berhitung, huruf, hewan, dan warna. Selesaikan modul dan kumpulkan bintang." },
      { property: "og:title", content: "Modul Belajar Bergambar — Sekolah Gembira" },
      { property: "og:description", content: "Belajar berhitung, huruf, hewan, dan warna lewat cerita bergambar yang ceria." },
    ],
  }),
  component: BelajarPage,
});

function BelajarPage() {
  const { modulSelesai, selesaikanModul } = useSekolah();
  const [aktif, setAktif] = useState<string | null>(null);
  const [halaman, setHalaman] = useState(0);

  const modul = MODUL.find((m) => m.id === aktif) ?? null;

  if (modul) {
    const page = modul.halaman[halaman]!;
    const terakhir = halaman === modul.halaman.length - 1;
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => setAktif(null)}
          className="pop mb-4 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground"
        >
          ← Kembali ke daftar modul
        </button>
        <article className="card-fun p-6 text-center sm:p-10">
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {modul.emoji} {modul.judul}
          </h1>
          <div className="my-8 text-6xl sm:text-7xl" aria-hidden>
            {page.gambar}
          </div>
          <p className="mx-auto max-w-md text-lg font-semibold">{page.teks}</p>
          <p className="mt-6 text-sm font-bold text-muted-foreground">
            Halaman {halaman + 1} dari {modul.halaman.length}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              disabled={halaman === 0}
              onClick={() => setHalaman((h) => h - 1)}
              className="pop rounded-full bg-secondary px-5 py-2.5 font-bold text-secondary-foreground disabled:opacity-40"
            >
              Sebelumnya
            </button>
            {terakhir ? (
              <button
                onClick={() => {
                  selesaikanModul(modul.id, modul.bintang);
                  setAktif(null);
                  setHalaman(0);
                }}
                className="pop rounded-full bg-primary px-5 py-2.5 font-extrabold text-primary-foreground"
              >
                Selesai! Ambil ⭐ {modul.bintang}
              </button>
            ) : (
              <button
                onClick={() => setHalaman((h) => h + 1)}
                className="pop rounded-full bg-primary px-5 py-2.5 font-extrabold text-primary-foreground"
              >
                Lanjut →
              </button>
            )}
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">📖 Modul Belajar Bergambar</h1>
      <p className="mt-2 font-semibold text-muted-foreground">
        Pilih satu petualangan belajar. Setiap modul memberi bintang!
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {MODUL.map((m) => {
          const selesai = modulSelesai.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => {
                setAktif(m.id);
                setHalaman(0);
              }}
              className="card-fun pop p-6 text-left"
            >
              <div className={`inline-flex rounded-2xl px-4 py-2 text-3xl ${m.warna}`} aria-hidden>
                {m.emoji}
              </div>
              <h2 className="mt-4 text-xl font-extrabold">{m.judul}</h2>
              <p className="mt-1 font-semibold text-muted-foreground">{m.ringkas}</p>
              <p className="mt-3 text-sm font-extrabold text-primary">
                {selesai ? "✅ Sudah selesai" : `⭐ ${m.bintang} bintang menanti`}
              </p>
            </button>
          );
        })}
      </div>
    </main>
  );
}
