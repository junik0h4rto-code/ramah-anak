import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KUIS } from "@/lib/konten";
import { useSekolah } from "@/lib/sekolah-store";

export const Route = createFileRoute("/kuis")({
  head: () => ({
    meta: [
      { title: "Kuis Edukasi Anak — Sekolah Gembira" },
      { name: "description", content: "Kuis seru untuk anak: berhitung, hewan, dan huruf. Jawab benar dan kumpulkan bintang." },
      { property: "og:title", content: "Kuis Edukasi Anak — Sekolah Gembira" },
      { property: "og:description", content: "Kuis pilihan ganda yang ceria dengan hadiah bintang untuk setiap jawaban benar." },
    ],
  }),
  component: KuisPage,
});

function KuisPage() {
  const { kuisSelesai, selesaikanKuis } = useSekolah();
  const [aktif, setAktif] = useState<string | null>(null);
  const [nomor, setNomor] = useState(0);
  const [pilih, setPilih] = useState<number | null>(null);
  const [benar, setBenar] = useState(0);
  const [selesai, setSelesai] = useState(false);

  const kuis = KUIS.find((k) => k.id === aktif) ?? null;

  function mulai(id: string) {
    setAktif(id);
    setNomor(0);
    setPilih(null);
    setBenar(0);
    setSelesai(false);
  }

  function keluar() {
    setAktif(null);
    setSelesai(false);
  }

  if (kuis && selesai) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="card-fun p-8 text-center">
          <div className="text-6xl" aria-hidden>
            {benar === kuis.soal.length ? "🎉" : "👏"}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">
            Kamu menjawab benar {benar} dari {kuis.soal.length} soal!
          </h1>
          <p className="mt-2 font-semibold text-muted-foreground">Kamu mendapat ⭐ {benar * 2} bintang.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => mulai(kuis.id)} className="pop rounded-full bg-secondary px-5 py-2.5 font-bold text-secondary-foreground">
              Main lagi
            </button>
            <button onClick={keluar} className="pop rounded-full bg-primary px-5 py-2.5 font-extrabold text-primary-foreground">
              Pilih kuis lain
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (kuis) {
    const soal = kuis.soal[nomor]!;
    const terjawab = pilih !== null;
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <button onClick={keluar} className="pop mb-4 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
          ← Kembali
        </button>
        <div className="card-fun p-6 sm:p-8">
          <p className="text-sm font-extrabold text-muted-foreground">
            Soal {nomor + 1} dari {kuis.soal.length}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">{soal.pertanyaan}</h1>
          <div className="mt-6 grid gap-3">
            {soal.pilihan.map((p, i) => {
              const jawabanBenar = i === soal.jawaban;
              const gaya = !terjawab
                ? "bg-secondary text-secondary-foreground"
                : jawabanBenar
                  ? "bg-mint text-mint-foreground"
                  : i === pilih
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground";
              return (
                <button
                  key={p}
                  disabled={terjawab}
                  onClick={() => {
                    setPilih(i);
                    if (jawabanBenar) setBenar((b) => b + 1);
                  }}
                  className={`pop rounded-2xl px-5 py-4 text-left text-lg font-extrabold ${gaya}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          {terjawab && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="font-extrabold">
                {pilih === soal.jawaban ? "🎯 Hebat, benar!" : "💪 Belum tepat, tidak apa-apa!"}
              </p>
              <button
                onClick={() => {
                  if (nomor === kuis.soal.length - 1) {
                    const skor = benar;
                    selesaikanKuis(kuis.id, skor * 2);
                    setSelesai(true);
                  } else {
                    setNomor((n) => n + 1);
                    setPilih(null);
                  }
                }}
                className="pop rounded-full bg-primary px-5 py-2.5 font-extrabold text-primary-foreground"
              >
                {nomor === kuis.soal.length - 1 ? "Lihat hasil" : "Soal berikutnya"}
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold sm:text-4xl">🧩 Kuis Seru</h1>
      <p className="mt-2 font-semibold text-muted-foreground">Setiap jawaban benar bernilai 2 bintang.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {KUIS.map((k) => (
          <button key={k.id} onClick={() => mulai(k.id)} className="card-fun pop p-6 text-left">
            <div className="text-4xl" aria-hidden>
              {k.emoji}
            </div>
            <h2 className="mt-3 text-xl font-extrabold">{k.judul}</h2>
            <p className="mt-1 font-semibold text-muted-foreground">{k.soal.length} soal</p>
            {kuisSelesai.includes(k.id) && <p className="mt-2 text-sm font-extrabold text-primary">✅ Pernah dimainkan</p>}
          </button>
        ))}
      </div>
    </main>
  );
}
