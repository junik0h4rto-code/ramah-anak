import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import confetti from "canvas-confetti";
import {
  Heart,
  Timer,
  Trophy,
  Coins,
  RotateCw,
  Skull,
  Zap,
  Play,
  ArrowLeft,
  Flame,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { klaimKoinKuis } from "@/lib/kuis.functions";

export const Route = createFileRoute("/_authenticated/belajar/kuis")({
  head: () => ({
    meta: [
      { title: "Game Kuis Trivia - Pusat Game SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Kuis trivia arcade SMPN 26 Bandung: pilih kategori pelajaran, 3 nyawa, timer 20 detik, dan kumpulkan Poin Sekolah dari setiap jawaban benar.",
      },
      { property: "og:title", content: "Game Kuis Trivia - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content:
          "Pilih kategori, jawab 10 soal, kumpulkan combo, dan klaim Poin Sekolah di Pusat Game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameKuisTrivia,
});

type Kategori = "Matematika" | "IPA" | "IPS" | "Bahasa" | "Umum";
type Soal = {
  kategori: Kategori;
  pertanyaan: string;
  pilihan: string[];
  jawaban: number;
  penjelasan: string;
};

const BANK: Soal[] = [
  // Matematika
  {
    kategori: "Matematika",
    pertanyaan: "Hasil dari 15 x 4 - 20 adalah ...",
    pilihan: ["30", "40", "50", "60"],
    jawaban: 1,
    penjelasan: "15 x 4 = 60, lalu 60 - 20 = 40.",
  },
  {
    kategori: "Matematika",
    pertanyaan: "Bilangan prima terkecil adalah ...",
    pilihan: ["0", "1", "2", "3"],
    jawaban: 2,
    penjelasan: "2 adalah bilangan prima terkecil sekaligus satu-satunya yang genap.",
  },
  {
    kategori: "Matematika",
    pertanyaan: "Keliling lingkaran berdiameter 14 cm (π = 22/7) adalah ...",
    pilihan: ["22 cm", "44 cm", "88 cm", "154 cm"],
    jawaban: 1,
    penjelasan: "K = π x d = 22/7 x 14 = 44 cm.",
  },
  {
    kategori: "Matematika",
    pertanyaan: "Nilai x pada persamaan 3x + 6 = 21 adalah ...",
    pilihan: ["3", "5", "7", "9"],
    jawaban: 1,
    penjelasan: "3x = 15 sehingga x = 5.",
  },
  {
    kategori: "Matematika",
    pertanyaan: "FPB dari 24 dan 36 adalah ...",
    pilihan: ["6", "8", "12", "18"],
    jawaban: 2,
    penjelasan: "Faktor persekutuan terbesar 24 dan 36 adalah 12.",
  },
  // IPA
  {
    kategori: "IPA",
    pertanyaan: "Gas yang diserap tumbuhan saat fotosintesis adalah ...",
    pilihan: ["Oksigen", "Karbon dioksida", "Nitrogen", "Hidrogen"],
    jawaban: 1,
    penjelasan: "Tumbuhan menyerap CO2 dan melepaskan oksigen.",
  },
  {
    kategori: "IPA",
    pertanyaan: "Planet yang dijuluki 'Planet Merah' adalah ...",
    pilihan: ["Venus", "Jupiter", "Mars", "Saturnus"],
    jawaban: 2,
    penjelasan: "Permukaan Mars kaya oksida besi sehingga tampak merah.",
  },
  {
    kategori: "IPA",
    pertanyaan: "Alat pernapasan pada ikan adalah ...",
    pilihan: ["Paru-paru", "Insang", "Trakea", "Kulit"],
    jawaban: 1,
    penjelasan: "Ikan bernapas dengan insang untuk menyerap oksigen dari air.",
  },
  {
    kategori: "IPA",
    pertanyaan: "Satuan Internasional untuk gaya adalah ...",
    pilihan: ["Joule", "Watt", "Newton", "Pascal"],
    jawaban: 2,
    penjelasan: "Gaya diukur dalam newton (N).",
  },
  {
    kategori: "IPA",
    pertanyaan: "Perubahan wujud dari padat langsung ke gas disebut ...",
    pilihan: ["Menguap", "Menyublim", "Mengembun", "Membeku"],
    jawaban: 1,
    penjelasan: "Contoh menyublim: kapur barus yang lama-lama habis.",
  },
  // IPS
  {
    kategori: "IPS",
    pertanyaan: "Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal ...",
    pilihan: ["1 Juni 1945", "17 Agustus 1945", "28 Oktober 1928", "10 November 1945"],
    jawaban: 1,
    penjelasan: "Dibacakan Soekarno-Hatta pada 17 Agustus 1945.",
  },
  {
    kategori: "IPS",
    pertanyaan: "Ibu kota Provinsi Jawa Barat adalah ...",
    pilihan: ["Bogor", "Bandung", "Bekasi", "Cirebon"],
    jawaban: 1,
    penjelasan: "Bandung adalah ibu kota Jawa Barat, tempat SMPN 26 berada.",
  },
  {
    kategori: "IPS",
    pertanyaan: "Peristiwa Bandung Lautan Api terjadi pada tahun ...",
    pilihan: ["1945", "1946", "1948", "1949"],
    jawaban: 1,
    penjelasan: "Terjadi pada 24 Maret 1946.",
  },
  {
    kategori: "IPS",
    pertanyaan: "Lambang sila kelima Pancasila adalah ...",
    pilihan: ["Bintang", "Rantai", "Kepala banteng", "Padi dan kapas"],
    jawaban: 3,
    penjelasan: "Padi dan kapas melambangkan keadilan sosial.",
  },
  {
    kategori: "IPS",
    pertanyaan: "Garis khayal yang membagi bumi menjadi utara dan selatan disebut ...",
    pilihan: ["Bujur", "Khatulistiwa", "Meridian", "Tropis"],
    jawaban: 1,
    penjelasan: "Garis khatulistiwa (ekuator) membagi bumi jadi dua belahan.",
  },
  // Bahasa
  {
    kategori: "Bahasa",
    pertanyaan: "Gagasan utama sebuah paragraf disebut ...",
    pilihan: ["Kalimat penjelas", "Ide pokok", "Konjungsi", "Sinonim"],
    jawaban: 1,
    penjelasan: "Ide pokok adalah inti pembahasan dalam satu paragraf.",
  },
  {
    kategori: "Bahasa",
    pertanyaan: "Sinonim kata 'rajin' adalah ...",
    pilihan: ["Malas", "Tekun", "Lambat", "Ceroboh"],
    jawaban: 1,
    penjelasan: "Rajin bersinonim dengan tekun atau giat.",
  },
  {
    kategori: "Bahasa",
    pertanyaan: "Basa Sunda tina kecap 'membaca' nyaeta ...",
    pilihan: ["Nulis", "Maca", "Ngadangu", "Nyarita"],
    jawaban: 1,
    penjelasan: "Maca artinya membaca dalam bahasa Sunda.",
  },
  {
    kategori: "Bahasa",
    pertanyaan: "Kata baku yang benar adalah ...",
    pilihan: ["Aktifitas", "Aktivitas", "Aktipitas", "Aktiviti"],
    jawaban: 1,
    penjelasan: "Bentuk baku menurut KBBI adalah 'aktivitas'.",
  },
  {
    kategori: "Bahasa",
    pertanyaan: "Karangan yang menceritakan pengalaman pribadi disebut ...",
    pilihan: ["Eksposisi", "Narasi", "Argumentasi", "Persuasi"],
    jawaban: 1,
    penjelasan: "Narasi menceritakan rangkaian peristiwa atau pengalaman.",
  },
  // Umum / Informatika & sekolah
  {
    kategori: "Umum",
    pertanyaan: "Perangkat lunak untuk menjelajah internet disebut ...",
    pilihan: ["Browser", "Printer", "Scanner", "Router"],
    jawaban: 0,
    penjelasan: "Contoh browser: Chrome, Firefox, Safari.",
  },
  {
    kategori: "Umum",
    pertanyaan: "Sampah plastik bekas botol minum sebaiknya dibuang ke tempat sampah ...",
    pilihan: ["Organik", "Anorganik", "B3", "Residu"],
    jawaban: 1,
    penjelasan: "Plastik termasuk sampah anorganik yang bisa didaur ulang.",
  },
  {
    kategori: "Umum",
    pertanyaan: "Upacara bendera di sekolah biasanya dilaksanakan setiap hari ...",
    pilihan: ["Senin", "Rabu", "Jumat", "Sabtu"],
    jawaban: 0,
    penjelasan: "Upacara bendera rutin dilaksanakan setiap Senin pagi.",
  },
  {
    kategori: "Umum",
    pertanyaan: "1 GB setara dengan berapa MB?",
    pilihan: ["100 MB", "512 MB", "1024 MB", "2048 MB"],
    jawaban: 2,
    penjelasan: "1 GB = 1024 MB.",
  },
  {
    kategori: "Umum",
    pertanyaan: "Kegiatan menjaga kebersihan kelas bersama-sama disebut ...",
    pilihan: ["Piket", "Ekstrakurikuler", "Remedial", "Studi tur"],
    jawaban: 0,
    penjelasan: "Piket kelas adalah tugas kebersihan bergiliran.",
  },
];

const KATEGORI: { nama: Kategori | "Semua"; emoji: string }[] = [
  { nama: "Semua", emoji: "🎲" },
  { nama: "Matematika", emoji: "➗" },
  { nama: "IPA", emoji: "🔬" },
  { nama: "IPS", emoji: "🌏" },
  { nama: "Bahasa", emoji: "📚" },
  { nama: "Umum", emoji: "💡" },
];

const KOIN_PER_BENAR = 5;
const BONUS_COMBO = 2;
const JUMLAH_SOAL = 8;
const WAKTU = 20;
const HURUF = ["A", "B", "C", "D"];

function acak<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function GameKuisTrivia() {
  const navigate = useNavigate();
  const { tambahKoin } = useGamifikasi();
  const klaim = useServerFn(klaimKoinKuis);

  const [kategori, setKategori] = useState<Kategori | "Semua">("Semua");
  const [soalSet, setSoalSet] = useState<Soal[]>([]);
  const [nomor, setNomor] = useState(0);
  const [nyawa, setNyawa] = useState(3);
  const [benar, setBenar] = useState(0);
  const [koin, setKoin] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMaks, setComboMaks] = useState(0);
  const [sisa, setSisa] = useState(WAKTU);
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [status, setStatus] = useState<"mulai" | "main" | "kalah" | "menang">("mulai");
  const [mengklaim, setMengklaim] = useState(false);
  const [sudahKlaim, setSudahKlaim] = useState(false);
  const terkunci = useRef(false);

  const soal = soalSet[nomor];
  const totalSoal = soalSet.length || JUMLAH_SOAL;

  const jumlahPerKategori = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of BANK) m.set(s.kategori, (m.get(s.kategori) ?? 0) + 1);
    m.set("Semua", BANK.length);
    return m;
  }, []);

  const mulai = useCallback((kat: Kategori | "Semua") => {
    const kolam = kat === "Semua" ? BANK : BANK.filter((s) => s.kategori === kat);
    setKategori(kat);
    setSoalSet(acak(kolam).slice(0, Math.min(JUMLAH_SOAL, kolam.length)));
    setNomor(0);
    setNyawa(3);
    setBenar(0);
    setKoin(0);
    setCombo(0);
    setComboMaks(0);
    setSisa(WAKTU);
    setPilihan(null);
    setSudahKlaim(false);
    setStatus("main");
    terkunci.current = false;
  }, []);

  const lanjut = useCallback(
    (nyawaBaru: number) => {
      window.setTimeout(() => {
        if (nyawaBaru <= 0) {
          setStatus("kalah");
          return;
        }
        if (nomor + 1 >= soalSet.length) {
          setStatus("menang");
          void confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
          return;
        }
        setNomor((n) => n + 1);
        setPilihan(null);
        setSisa(WAKTU);
        terkunci.current = false;
      }, 1800);
    },
    [nomor, soalSet.length],
  );

  const jawab = useCallback(
    (i: number | null) => {
      if (terkunci.current || status !== "main" || !soal) return;
      terkunci.current = true;
      setPilihan(i);
      if (i === soal.jawaban) {
        const comboBaru = combo + 1;
        setCombo(comboBaru);
        setComboMaks((c) => Math.max(c, comboBaru));
        setBenar((b) => b + 1);
        setKoin((k) => k + KOIN_PER_BENAR + (comboBaru >= 3 ? BONUS_COMBO : 0));
        if (comboBaru >= 3) {
          void confetti({
            particleCount: 40,
            spread: 60,
            startVelocity: 25,
            origin: { y: 0.7 },
          });
        }
        lanjut(nyawa);
      } else {
        setCombo(0);
        const nyawaBaru = nyawa - 1;
        setNyawa(nyawaBaru);
        lanjut(nyawaBaru);
      }
    },
    [combo, lanjut, nyawa, soal, status],
  );

  useEffect(() => {
    if (status !== "main" || pilihan !== null) return;
    const t = window.setInterval(() => {
      setSisa((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          jawab(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [jawab, nomor, pilihan, status]);

  async function klaimKoin() {
    if (mengklaim || sudahKlaim || koin <= 0) return;
    setMengklaim(true);
    try {
      await klaim({ data: { jumlah: koin } });
      tambahKoin(koin, `Kuis Trivia ${kategori}`);
      setSudahKlaim(true);
      void confetti({ particleCount: 220, spread: 110, origin: { y: 0.5 } });
      toast.success(`Selamat! +${koin} Poin Sekolah masuk ke kantongmu`);
      window.setTimeout(() => void navigate({ to: "/belajar/game" }), 1200);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengklaim poin");
    } finally {
      setMengklaim(false);
    }
  }

  /* ---------- Layar Mulai ---------- */
  if (status === "mulai") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <button
          type="button"
          onClick={() => void navigate({ to: "/belajar/game" })}
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Pusat Game
        </button>

        <section className="overflow-hidden rounded-3xl border-4 border-accent/30 bg-primary text-primary-foreground shadow-pop">
          <div className="relative px-6 py-10 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-25 [background:radial-gradient(circle_at_50%_0%,var(--color-accent),transparent_60%)]" />
            <p className="relative inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1 text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Panggung Kuis SMPN 26
            </p>
            <h1 className="relative mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              KUIS TRIVIA
              <span className="block text-accent">ARCADE</span>
            </h1>
            <p className="relative mx-auto mt-3 max-w-md text-sm font-semibold text-primary-foreground/80">
              {JUMLAH_SOAL} soal acak, 3 nyawa, {WAKTU} detik per soal. Jawab benar 3 kali beruntun
              untuk bonus combo +{BONUS_COMBO} poin!
            </p>
            <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5">
                <Heart className="h-4 w-4 fill-destructive text-destructive" /> 3 Nyawa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5">
                <Timer className="h-4 w-4" /> {WAKTU} detik
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coin px-3 py-1.5 text-coin-foreground">
                <Coins className="h-4 w-4" /> {KOIN_PER_BENAR} poin / jawaban benar
              </span>
            </div>
          </div>
        </section>

        <h2 className="mt-8 font-display text-lg font-extrabold">Pilih Kategori Soal</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {KATEGORI.map((k) => (
            <button
              key={k.nama}
              type="button"
              onClick={() => setKategori(k.nama)}
              className={`rounded-2xl border-4 p-4 text-left transition-all ${
                kategori === k.nama
                  ? "border-accent bg-accent/10 -translate-y-0.5 shadow-pop"
                  : "border-border bg-card hover:border-accent/50"
              }`}
            >
              <span className="text-2xl">{k.emoji}</span>
              <p className="mt-1 font-display text-base font-extrabold">{k.nama}</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {jumlahPerKategori.get(k.nama) ?? 0} soal tersedia
              </p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => mulai(kategori)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-play px-8 py-4 font-display text-lg font-extrabold text-accent-foreground shadow-pop"
        >
          <Play className="h-5 w-5" /> Mulai Main - {kategori}
        </button>
      </div>
    );
  }

  /* ---------- Game Over ---------- */
  if (status === "kalah") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border-4 border-destructive/40 bg-card p-10 shadow-pop">
          <Skull className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-destructive">
            Wah, Nyawamu Habis!
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Kamu menjawab benar {benar} soal kategori {kategori}, tapi belum ada poin yang bisa
            diklaim. Coba lagi ya!
          </p>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => mulai(kategori)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-extrabold text-primary-foreground shadow-pop"
            >
              <RotateCw className="h-4 w-4" /> Coba Lagi
            </button>
            <button
              type="button"
              onClick={() => setStatus("mulai")}
              className="rounded-full border-2 border-border px-8 py-3 text-sm font-extrabold"
            >
              Ganti Kategori
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Menang ---------- */
  if (status === "menang") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border-4 border-accent/50 bg-card p-10 shadow-pop">
          <Trophy className="mx-auto h-16 w-16 text-accent" />
          <h1 className="mt-4 font-display text-3xl font-extrabold">Hebat! Kuis Selesai</h1>
          <p className="mt-2 text-sm font-bold text-muted-foreground">
            Kategori {kategori} - benar {benar} dari {totalSoal} soal - combo terpanjang {comboMaks}x
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-coin px-6 py-3 font-display text-2xl font-extrabold text-coin-foreground">
            <Coins className="h-6 w-6" /> +{koin} Poin
          </p>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={klaimKoin}
              disabled={mengklaim || sudahKlaim || koin <= 0}
              className="rounded-full bg-gradient-play px-8 py-3.5 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
            >
              {sudahKlaim
                ? "Poin sudah diklaim"
                : mengklaim
                  ? "Memproses..."
                  : "Klaim Poin & Masuk Kantong"}
            </button>
            <button
              type="button"
              onClick={() => setStatus("mulai")}
              className="rounded-full border-2 border-border px-8 py-3 text-sm font-extrabold"
            >
              Main Kategori Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!soal) return null;

  /* ---------- Papan Permainan ---------- */
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-primary px-5 py-4 text-primary-foreground shadow-card">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`h-6 w-6 transition-transform ${
                i < nyawa ? "fill-destructive text-destructive" : "scale-90 text-primary-foreground/25"
              }`}
            />
          ))}
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-lg font-extrabold tabular-nums ${
            sisa <= 5 ? "animate-pulse bg-destructive text-primary-foreground" : "bg-primary-foreground/15"
          }`}
        >
          <Timer className="h-5 w-5" /> {sisa}s
        </div>
        <div className="text-right text-xs font-bold">
          <p className="inline-flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-coin" /> {koin} koin
          </p>
          <p className="opacity-80">
            Soal {nomor + 1} / {totalSoal} - {soal.kategori}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              sisa <= 5 ? "bg-destructive" : "bg-accent"
            }`}
            style={{ width: `${(sisa / WAKTU) * 100}%` }}
          />
        </div>
        {combo >= 2 && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground shadow-pop">
            <Flame className="h-3.5 w-3.5" /> Combo {combo}x
          </span>
        )}
      </div>

      <section className="relative mt-6 overflow-hidden rounded-3xl border-4 border-accent/30 bg-card p-8 text-center shadow-pop">
        <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 opacity-20 [background:radial-gradient(circle,var(--color-accent),transparent_70%)]" />
        <p className="relative inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-accent">
          <Zap className="h-3.5 w-3.5" /> {soal.kategori}
        </p>
        <h1 className="relative mt-3 font-display text-2xl font-extrabold leading-snug">
          {soal.pertanyaan}
        </h1>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {soal.pilihan.map((p, i) => {
          const tepat = i === soal.jawaban;
          const terpilih = pilihan === i;
          const gaya =
            pilihan === null
              ? "border-border bg-card hover:border-accent hover:-translate-y-0.5"
              : tepat
                ? "border-success bg-success/20 scale-[1.02]"
                : terpilih
                  ? "border-destructive bg-destructive/20 animate-[shake_0.4s_ease-in-out]"
                  : "border-border bg-card opacity-40";
          return (
            <button
              key={p}
              type="button"
              onClick={() => jawab(i)}
              className={`flex items-center gap-3 rounded-2xl border-4 px-5 py-5 text-left text-base font-extrabold transition-all ${gaya}`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display ${
                  pilihan !== null && tepat
                    ? "bg-success text-primary-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {HURUF[i]}
              </span>
              {p}
            </button>
          );
        })}
      </div>

      {pilihan !== null && (
        <div
          className={`mt-4 rounded-2xl border-2 p-4 text-sm font-semibold ${
            pilihan === soal.jawaban
              ? "border-success/40 bg-success/10"
              : "border-destructive/40 bg-destructive/10"
          }`}
        >
          <p className="font-extrabold">
            {pilihan === soal.jawaban
              ? `Benar! +${KOIN_PER_BENAR + (combo >= 3 ? BONUS_COMBO : 0)} poin`
              : pilihan === null
                ? "Waktu habis!"
                : "Kurang tepat, nyawa berkurang"}
          </p>
          <p className="mt-1 text-muted-foreground">{soal.penjelasan}</p>
        </div>
      )}
    </div>
  );
}
