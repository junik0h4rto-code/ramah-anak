import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Brain, Coins, Gift, RotateCw, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KUIS } from "@/lib/school-data";
import { putarRoda, statusRoda } from "@/lib/roda.functions";
import { useGamifikasi } from "@/lib/gamifikasi-store";

export const Route = createFileRoute("/_authenticated/belajar/game")({
  head: () => ({
    meta: [
      { title: "Pusat Game - Kuis Trivia dan Roda Keberuntungan" },
      {
        name: "description",
        content:
          "Mainkan kuis trivia dan putar roda keberuntungan di Pusat Game SMPN 26 BANDUNG untuk mengumpulkan Poin Siswa.",
      },
      { property: "og:title", content: "Pusat Game - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Kuis trivia dan roda keberuntungan berhadiah Poin Siswa.",
      },
    ],
  }),
  component: PusatGame,
});

function PusatGame() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <Link
          to="/belajar/kuis"
          className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-play p-6 shadow-pop"
        >
          <div>
            <p className="font-display text-2xl font-extrabold text-accent-foreground">
              Game Kuis Trivia Arcade
            </p>
            <p className="text-sm font-bold text-accent-foreground/80">
              3 nyawa, timer 20 detik, 5 Poin Sekolah per jawaban benar
            </p>
          </div>
          <span className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground">
            Main Sekarang
          </span>
        </Link>
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Link
          to="/toko"
          className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold">Toko Reward Sekolah</p>
              <p className="text-sm font-bold text-muted-foreground">
                Tukar Poin Belajar dengan hadiah nyata
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground">
            Buka Toko
          </span>
        </Link>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <KuisTrivia />
      </div>
      <div className="lg:col-span-2">
        <RodaKeberuntungan />
      </div>
      </div>
    </>
  );
}

function KuisTrivia() {
  const { tambahKoin } = useGamifikasi();
  const [nomor, setNomor] = useState(0);
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [skor, setSkor] = useState(0);
  const [selesai, setSelesai] = useState(false);

  const soal = KUIS[nomor]!;

  function jawab(i: number) {
    if (pilihan !== null) return;
    setPilihan(i);
    const benar = i === soal.jawaban;
    if (benar) {
      setSkor((s) => s + 1);
      tambahKoin(20, "Jawaban kuis benar");
      toast.success("Tepat sekali! +20 Poin Siswa");
    } else {
      toast.error("Belum tepat, coba soal berikutnya!");
    }
  }

  function lanjut() {
    if (nomor + 1 >= KUIS.length) {
      setSelesai(true);
      return;
    }
    setNomor((n) => n + 1);
    setPilihan(null);
  }

  function ulang() {
    setNomor(0);
    setPilihan(null);
    setSkor(0);
    setSelesai(false);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Brain className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold">Kuis Trivia</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            Setiap jawaban benar bernilai 20 Poin Siswa
          </p>
        </div>
      </div>

      {selesai ? (
        <div className="mt-8 rounded-3xl bg-accent-soft p-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-accent-foreground" />
          <p className="mt-3 font-display text-2xl font-extrabold text-accent-foreground">
            Skor kamu {skor} dari {KUIS.length}
          </p>
          <button
            type="button"
            onClick={ulang}
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-extrabold text-primary-foreground"
          >
            Main Lagi
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>
              Soal {nomor + 1} dari {KUIS.length}
            </span>
            <span>Benar: {skor}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${((nomor + 1) / KUIS.length) * 100}%` }}
            />
          </div>

          <p className="mt-5 text-lg font-extrabold leading-snug">{soal.pertanyaan}</p>

          <div className="mt-4 grid gap-2.5">
            {soal.pilihan.map((p, i) => {
              const terpilih = pilihan === i;
              const benar = i === soal.jawaban;
              const tampil =
                pilihan === null
                  ? "border-border bg-card hover:border-accent"
                  : benar
                    ? "border-success bg-success/15"
                    : terpilih
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card opacity-60";
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => jawab(i)}
                  className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-colors ${tampil}`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {pilihan !== null && (
            <button
              type="button"
              onClick={lanjut}
              className="mt-5 w-full rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop"
            >
              {nomor + 1 >= KUIS.length ? "Lihat Hasil" : "Soal Berikutnya"}
            </button>
          )}
        </>
      )}
    </section>
  );
}

const SEKTOR = [
  { label: "+5 Poin", warna: "var(--primary)" },
  { label: "+20 Poin", warna: "var(--accent)" },
  { label: "Zonk", warna: "var(--muted-foreground)" },
  { label: "+50 Poin", warna: "var(--coin)" },
  { label: "Lencana Juara", warna: "var(--accent)" },
  { label: "+2 Poin", warna: "var(--primary)" },
];

const SEGMEN = 360 / SEKTOR.length;

function RodaKeberuntungan() {
  const ambilStatus = useServerFn(statusRoda);
  const spin = useServerFn(putarRoda);
  const [sudut, setSudut] = useState(0);
  const [berputar, setBerputar] = useState(false);
  const [siapPakai, setSiapPakai] = useState(false);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [sisa, setSisa] = useState<number>(3);
  const [hasil, setHasil] = useState<{ label: string; koin: number; lencana: boolean } | null>(null);
  const [dialogTerbuka, setDialogTerbuka] = useState(false);
  const jedaRef = useRef<number | null>(null);

  useEffect(() => {
    let aktif = true;
    ambilStatus({})
      .then((s) => {
        if (!aktif) return;
        setSaldo(s.saldoKoin);
        setSisa(s.sisaPutaran);
      })
      .catch(() => {})
      .finally(() => {
        if (aktif) setSiapPakai(true);
      });
    return () => {
      aktif = false;
      if (jedaRef.current) window.clearTimeout(jedaRef.current);
    };
  }, [ambilStatus]);

  const bisaPutar = siapPakai && !berputar && sisa > 0 && (saldo ?? 0) >= 10;

  async function putar() {
    if (!bisaPutar) return;
    setBerputar(true);
    setHasil(null);
    try {
      const r = await spin({});
      // Putaran penuh beberapa kali, lalu berhenti tepat di tengah sektor hadiah.
      const posisiSektor = 360 - (r.hadiahIndex * SEGMEN + SEGMEN / 2);
      const putaranSekarang = sudut % 360;
      setSudut(sudut + 360 * 5 + ((posisiSektor - putaranSekarang + 360) % 360));
      jedaRef.current = window.setTimeout(() => {
        setSaldo(r.saldoKoin);
        setSisa(r.sisaPutaran);
        setHasil({ label: r.hadiahLabel, koin: r.koinHadiah, lencana: r.lencana });
        setDialogTerbuka(true);
        setBerputar(false);
      }, 3100);
    } catch (e) {
      setBerputar(false);
      toast.error(e instanceof Error ? e.message : "Gagal memutar roda");
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
      <div className="flex items-center justify-between gap-2 text-left">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <RotateCw className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">Roda Keberuntungan</h2>
            <p className="text-xs font-semibold text-muted-foreground">
              Biaya 10 Poin per putaran &middot; sisa hari ini {sisa}/3
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coin px-3 py-1.5 text-sm font-extrabold text-coin-foreground">
          <Coins className="h-4 w-4" />
          {saldo === null ? "..." : saldo.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="relative mx-auto mt-6 h-60 w-60">
        <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[18px] border-x-transparent border-t-destructive drop-shadow" />
        <div
          className="h-full w-full rounded-full border-8 border-primary shadow-pop transition-transform duration-[3000ms] ease-out"
          style={{
            transform: `rotate(${sudut}deg)`,
            background: `conic-gradient(${SEKTOR.map(
              (s, i) => `${s.warna} ${i * SEGMEN}deg ${(i + 1) * SEGMEN}deg`,
            ).join(", ")})`,
          }}
        >
          {SEKTOR.map((s, i) => (
            <span
              key={s.label}
              className="absolute left-1/2 top-1/2 w-20 origin-left text-[10px] font-extrabold leading-tight text-primary-foreground"
              style={{ transform: `rotate(${i * SEGMEN + SEGMEN / 2}deg) translateX(38px)` }}
            >
              {s.label}
            </span>
          ))}
        </div>
        <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card shadow-card">
          <Coins className="h-6 w-6 text-coin-foreground" />
        </div>
      </div>

      <button
        type="button"
        onClick={putar}
        disabled={!bisaPutar}
        className="mt-6 w-full rounded-full bg-gradient-play px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
      >
        {berputar
          ? "Roda Berputar..."
          : sisa <= 0
            ? "Batas 3 Putaran Hari Ini Habis"
            : (saldo ?? 0) < 10
              ? "Poin Belum Cukup (butuh 10)"
              : "PUTAR RODA (-10 Poin)"}
      </button>

      <p className="mt-3 min-h-6 text-sm font-bold text-muted-foreground">
        {sisa <= 0
          ? "Ayo lanjut belajar dulu, roda bisa diputar lagi besok."
          : "Setiap putaran memakai 10 Poin Sekolah."}
      </p>

      <Dialog open={dialogTerbuka} onOpenChange={setDialogTerbuka}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-2xl font-extrabold">
              {hasil?.lencana
                ? "Selamat! Lencana Juara"
                : hasil?.koin
                  ? "Selamat! Kamu Menang"
                  : "Yah, Zonk!"}
            </DialogTitle>
            <DialogDescription className="text-center text-base font-bold text-foreground">
              {hasil?.lencana
                ? "Lencana Juara sudah tersimpan di profilmu."
                : hasil?.koin
                  ? `Kamu mendapat ${hasil.koin} Poin Sekolah.`
                  : "Belum beruntung kali ini, coba lagi ya!"}
            </DialogDescription>
          </DialogHeader>
          <div className="animate-scale-in text-6xl">
            {hasil?.lencana ? "🏅" : hasil?.koin ? "🎉" : "😅"}
          </div>
          <p className="text-sm font-bold text-muted-foreground">
            Saldo poin: {saldo?.toLocaleString("id-ID")} &middot; sisa putaran hari ini {sisa}
          </p>
          <button
            type="button"
            onClick={() => setDialogTerbuka(false)}
            className="mx-auto rounded-full bg-primary px-6 py-2.5 text-sm font-extrabold text-primary-foreground"
          >
            Oke
          </button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

