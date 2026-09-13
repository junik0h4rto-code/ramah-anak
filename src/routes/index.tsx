import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MODUL } from "@/lib/konten";
import { useSekolah } from "@/lib/sekolah-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sekolah Gembira — Belajar Ceria untuk Anak" },
      {
        name: "description",
        content:
          "Platform belajar ramah anak: modul bergambar, kuis edukasi, hadiah bintang dan lencana, serta pelacak mood harian siswa.",
      },
      { property: "og:title", content: "Sekolah Gembira — Belajar Ceria untuk Anak" },
      {
        property: "og:description",
        content: "Modul bergambar, kuis seru, bintang dan lencana, plus catatan mood harian siswa.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { nama, setNama, bintang, modulSelesai, lencana } = useSekolah();
  const [input, setInput] = useState("");
  const didapat = lencana.filter((l) => l.didapat).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="card-fun p-7 text-center sm:p-12">
        <p className="text-6xl" aria-hidden>
          🎈🌈🎒
        </p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
          Selamat datang di <span className="text-primary">Sekolah Gembira</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-muted-foreground">
          Belajar sambil bermain: baca cerita bergambar, jawab kuis seru, kumpulkan bintang, dan ceritakan
          perasaanmu setiap hari.
        </p>

        {nama ? (
          <p className="mt-6 text-xl font-extrabold">Hai, {nama}! Kamu punya ⭐ {bintang} bintang.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) setNama(input.trim());
            }}
            className="mx-auto mt-6 flex max-w-sm flex-wrap justify-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Siapa namamu?"
              aria-label="Nama siswa"
              className="min-w-0 flex-1 rounded-full border-2 border-input bg-background px-4 py-2.5 font-bold outline-none focus:border-primary"
            />
            <button className="pop rounded-full bg-primary px-5 py-2.5 font-extrabold text-primary-foreground">
              Mulai
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/belajar" className="pop rounded-full bg-mint px-6 py-3 font-extrabold text-mint-foreground">
            📖 Mulai Belajar
          </Link>
          <Link to="/kuis" className="pop rounded-full bg-bubble px-6 py-3 font-extrabold text-bubble-foreground">
            🧩 Main Kuis
          </Link>
          <Link to="/mood" className="pop rounded-full bg-sky px-6 py-3 font-extrabold text-sky-foreground">
            🌤️ Catat Mood
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Kartu emoji="⭐" judul={`${bintang} Bintang`} teks="Hadiah dari modul, kuis, dan catatan mood." />
        <Kartu emoji="📚" judul={`${modulSelesai.length}/${MODUL.length} Modul`} teks="Cerita bergambar yang sudah kamu tamatkan." />
        <Kartu emoji="🏅" judul={`${didapat} Lencana`} teks="Lihat koleksimu di halaman Bintangku." />
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-extrabold">Petualangan Hari Ini</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {MODUL.slice(0, 4).map((m) => (
            <Link key={m.id} to="/belajar" className="card-fun pop flex items-center gap-4 p-5">
              <span className={`rounded-2xl px-3 py-2 text-3xl ${m.warna}`} aria-hidden>
                {m.emoji}
              </span>
              <span>
                <span className="block text-lg font-extrabold">{m.judul}</span>
                <span className="block font-semibold text-muted-foreground">{m.ringkas}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Kartu({ emoji, judul, teks }: { emoji: string; judul: string; teks: string }) {
  return (
    <div className="card-fun p-5">
      <p className="text-3xl" aria-hidden>
        {emoji}
      </p>
      <p className="mt-2 text-xl font-extrabold">{judul}</p>
      <p className="font-semibold text-muted-foreground">{teks}</p>
    </div>
  );
}
