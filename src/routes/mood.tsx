import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MOODS } from "@/lib/konten";
import { hariIni, useSekolah } from "@/lib/sekolah-store";

export const Route = createFileRoute("/mood")({
  head: () => ({
    meta: [
      { title: "Pelacak Mood Harian Siswa — Sekolah Gembira" },
      { name: "description", content: "Catat perasaan siswa setiap hari dengan emoji dan lihat riwayat mood sepanjang minggu." },
      { property: "og:title", content: "Pelacak Mood Harian Siswa — Sekolah Gembira" },
      { property: "og:description", content: "Catat perasaan hari ini dan lihat riwayat mood anak dengan tampilan yang ramah." },
    ],
  }),
  component: MoodPage,
});

function MoodPage() {
  const { mood, catatMood } = useSekolah();
  const [pilih, setPilih] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [tersimpan, setTersimpan] = useState(false);

  const hariIniEntry = mood.find((m) => m.date === hariIni());

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">🌤️ Mood Hari Ini</h1>
      <p className="mt-2 font-semibold text-muted-foreground">
        Bagaimana perasaanmu hari ini? Bercerita boleh, lho.
      </p>

      <section className="card-fun mt-6 p-6">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => {
                setPilih(m.label);
                setTersimpan(false);
              }}
              className={`pop rounded-2xl px-2 py-4 text-center font-bold ${
                pilih === m.label ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              <span className="block text-3xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="mt-1 block text-xs">{m.label}</span>
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-extrabold" htmlFor="cerita">
          Ceritakan sedikit (boleh kosong)
        </label>
        <textarea
          id="cerita"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Hari ini aku..."
          className="mt-2 w-full rounded-2xl border-2 border-input bg-background p-3 font-semibold outline-none focus:border-primary"
        />

        <button
          disabled={!pilih}
          onClick={() => {
            if (!pilih) return;
            catatMood(pilih, note.trim());
            setNote("");
            setTersimpan(true);
          }}
          className="pop mt-4 rounded-full bg-primary px-6 py-3 font-extrabold text-primary-foreground disabled:opacity-40"
        >
          Simpan mood hari ini
        </button>
        {tersimpan && <p className="mt-3 font-extrabold text-accent-foreground">Tersimpan! Terima kasih sudah bercerita 💛</p>}
        {hariIniEntry && !tersimpan && (
          <p className="mt-3 font-semibold text-muted-foreground">
            Mood tersimpan hari ini: <strong>{hariIniEntry.mood}</strong>
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-extrabold">Riwayat Mood</h2>
        {mood.length === 0 ? (
          <p className="mt-2 font-semibold text-muted-foreground">Belum ada catatan. Mulai hari ini, yuk!</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {mood.map((m) => {
              const emoji = MOODS.find((x) => x.label === m.mood)?.emoji ?? "🙂";
              return (
                <li key={m.date} className="card-fun flex items-start gap-4 p-4">
                  <span className="text-3xl" aria-hidden>
                    {emoji}
                  </span>
                  <div>
                    <p className="font-extrabold">
                      {m.mood} <span className="text-sm font-bold text-muted-foreground">· {m.date}</span>
                    </p>
                    {m.note && <p className="font-semibold text-muted-foreground">{m.note}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
