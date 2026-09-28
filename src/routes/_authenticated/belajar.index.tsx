import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Atom,
  BookOpen,
  Calculator,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Code2,
  Flame,
  Gift,
  Languages,
  LifeBuoy,
  Play,
  Search,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { DynamicIcon } from "@/components/dynamic-icon";
import { CheckinHarian } from "@/components/checkin-harian";
import { PapanPengumuman } from "@/components/papan-pengumuman";
import { listModul } from "@/lib/modul.functions";
import { listRekomendasi } from "@/lib/checkin.functions";

export const Route = createFileRoute("/_authenticated/belajar/")({
  head: () => ({
    meta: [
      { title: "Ruang Belajar - Katalog Modul SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Katalog modul pelajaran interaktif SMPN 26 BANDUNG. Selesaikan modul dan kumpulkan Poin Belajar.",
      },
      { property: "og:title", content: "Ruang Belajar - Katalog Modul" },
      {
        property: "og:description",
        content: "Pilih modul pelajaran favoritmu dan raih Poin Belajar setiap kali menuntaskannya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["modul"],
      queryFn: () => listModul(),
    });
  },
  component: KatalogModul,
});

const BANNER = [
  {
    id: "b1",
    judul: "Belajar Tuntas, Poin Mengalir!",
    teks: "Baca materi sampai selesai dan jawab evaluasi untuk mendapatkan Poin Belajar.",
    kelas: "from-accent to-coin",
  },
  {
    id: "b2",
    judul: "Materi Baru Minggu Ini",
    teks: "Modul Informatika & Basa Sunda sudah tersedia untuk semua kelas.",
    kelas: "from-primary to-accent",
  },
  {
    id: "b3",
    judul: "Tukar Poin di Toko Reward",
    teks: "Alat tulis dan kupon kantin menanti Poin Belajar kamu.",
    kelas: "from-coin to-primary",
  },
];

const KATEGORI = [
  { label: "Matematika", filter: "Matematika", icon: Calculator },
  { label: "Bahasa Inggris", filter: "Bahasa Inggris", icon: Languages },
  { label: "Sains", filter: "IPA", icon: Atom },
  { label: "Coding", filter: "Informatika", icon: Code2 },
  { label: "Semua", filter: "Semua", icon: BookOpen },
];

const MAPEL = [
  "Semua",
  "Matematika",
  "IPA",
  "Bahasa Indonesia",
  "IPS",
  "Bahasa Inggris",
  "Informatika",
  "Basa Sunda",
  "Pendidikan Pancasila",
  "SBdP",
  "PJOK",
];

function ikonModul(mapel: string | null) {
  if (!mapel) return "BookOpen";
  const map: Record<string, string> = {
    Matematika: "Calculator",
    IPA: "Leaf",
    IPS: "Landmark",
    "Bahasa Indonesia": "NotebookPen",
    "Bahasa Inggris": "Languages",
    Informatika: "Zap",
    "Basa Sunda": "PenLine",
    "Pendidikan Pancasila": "Landmark",
    PJOK: "Volleyball",
    SBdP: "Palette",
  };
  return map[mapel] || "BookOpen";
}

function useCountdown(detikAwal: number) {
  const [sisa, setSisa] = useState(detikAwal);
  useEffect(() => {
    const t = setInterval(() => setSisa((s) => (s <= 1 ? detikAwal : s - 1)), 1000);
    return () => clearInterval(t);
  }, [detikAwal]);
  const jam = Math.floor(sisa / 3600);
  const menit = Math.floor((sisa % 3600) / 60);
  const detik = sisa % 60;
  return [jam, menit, detik].map((n) => String(n).padStart(2, "0"));
}

type ModulUI = {
  id: string;
  nama: string;
  mapel: string;
  kelas: string;
  ikon: string;
  koin: number;
  rating: number;
  dibaca: number;
  jenis: string;
};

function jenisKonten(k: string | null) {
  const v = (k ?? "").trim().toLowerCase();
  if (v === "latihan") return "Latihan";
  if (v === "ujian") return "Ujian";
  if (v === "proyek") return "Proyek";
  return "Pembelajaran";
}

function KatalogModul() {
  const [filter, setFilter] = useState("Semua");
  const [cari, setCari] = useState("");
  const [jenisTab, setJenisTab] = useState<"Pembelajaran" | "Proyek">("Pembelajaran");
  const [banner, setBanner] = useState(0);
  const [checkinBuka, setCheckinBuka] = useState(false);
  const [bantuanBuka, setBantuanBuka] = useState(false);
  const { koin, modulSelesai } = useGamifikasi();
  const waktu = useCountdown(3 * 3600 + 25 * 60);

  const { data: modulDb } = useSuspenseQuery({
    queryKey: ["modul"],
    queryFn: () => listModul(),
  });
  const { data: rekomendasi = [] } = useQuery({
    queryKey: ["rekomendasi-modul"],
    queryFn: () => listRekomendasi(),
  });

  useEffect(() => {
    const t = setInterval(() => setBanner((b) => (b + 1) % BANNER.length), 5000);
    return () => clearInterval(t);
  }, []);

  const semua: ModulUI[] = useMemo(
    () =>
      modulDb.map((m, i) => ({
        id: m.id,
        nama: m.judul,
        mapel: m.mapel || "Umum",
        kelas: m.kelas || "Semua Kelas",
        ikon: ikonModul(m.mapel),
        koin: m.koin_reward || 0,
        rating: Number((4.5 + ((i * 7) % 5) * 0.1).toFixed(1)),
        dibaca: 60 + ((i * 37) % 240),
        jenis: jenisKonten(m.kategori),
      })),
    [modulDb],
  );

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return semua.filter(
      (m) =>
        m.jenis === jenisTab &&
        (filter === "Semua" || m.mapel === filter) &&
        (!q ||
          m.nama.toLowerCase().includes(q) ||
          m.mapel.toLowerCase().includes(q) ||
          m.kelas.toLowerCase().includes(q)),
    );
  }, [cari, filter, semua, jenisTab]);

  const populer = useMemo(
    () => semua.filter((m) => m.jenis === "Latihan").sort((a, b) => b.koin - a.koin),
    [semua],
  );
  const idKatalog = useMemo(
    () => new Set(semua.filter((m) => m.jenis === "Pembelajaran" || m.jenis === "Proyek").map((m) => m.id)),
    [semua],
  );
  const jumlahJenis = (j: string) => semua.filter((m) => m.jenis === j).length;

  return (
    <div className="pb-12">
      {/* Header + Search */}
      <div className="bg-gradient-play">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-5">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-card">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari materi pelajaran..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
              aria-label="Cari materi pelajaran"
            />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-coin px-4 py-2.5 text-coin-foreground shadow-pop">
            <Coins className="h-6 w-6" />
            <span className="grid leading-none">
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                Poin Belajar Anda
              </span>
              <span className="font-display text-lg font-extrabold tabular-nums">
                {koin.toLocaleString("id-ID")}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Banner carousel */}
        <div className="relative mt-5 overflow-hidden rounded-3xl shadow-card">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${banner * 100}%)` }}
          >
            {BANNER.map((b) => (
              <div
                key={b.id}
                className={`w-full shrink-0 bg-gradient-to-r ${b.kelas} px-6 py-9 sm:px-10 sm:py-12`}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent-foreground">
                  <Zap className="h-3.5 w-3.5" /> Info Ruang Belajar
                </span>
                <h2 className="mt-3 text-2xl font-extrabold text-primary-foreground sm:text-3xl">
                  {b.judul}
                </h2>
                <p className="mt-1.5 max-w-xl text-sm font-semibold text-primary-foreground/90">
                  {b.teks}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label="Banner sebelumnya"
            onClick={() => setBanner((b) => (b - 1 + BANNER.length) % BANNER.length)}
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-card/80 text-foreground shadow-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Banner berikutnya"
            onClick={() => setBanner((b) => (b + 1) % BANNER.length)}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-card/80 text-foreground shadow-card"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {BANNER.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Tampilkan banner ${i + 1}`}
                onClick={() => setBanner(i)}
                className={`h-2 rounded-full transition-all ${
                  i === banner ? "w-6 bg-card" : "w-2 bg-card/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Kategori grid ikon */}
        <div className="mt-6 grid grid-cols-5 gap-3 rounded-3xl border border-border bg-card p-5 shadow-card sm:gap-5">
          {KATEGORI.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => setFilter(k.filter)}
              className="grid justify-items-center gap-2"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-full transition-colors ${
                  filter === k.filter
                    ? "bg-accent text-accent-foreground"
                    : "bg-accent-soft text-accent-foreground"
                }`}
              >
                <k.icon className="h-6 w-6" />
              </span>
              <span className="text-center text-[11px] font-bold leading-tight">{k.label}</span>
            </button>
          ))}
        </div>

        {/* Aksi cepat */}
        <div className="mt-6 grid grid-cols-4 gap-3 rounded-3xl border border-border bg-card p-5 shadow-card">
          <button
            type="button"
            onClick={() => setCheckinBuka(true)}
            className="group grid justify-items-center gap-2"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-accent to-coin text-accent-foreground shadow-pop transition-transform group-hover:-translate-y-0.5">
              <CalendarCheck className="h-6 w-6" />
            </span>
            <span className="text-center text-[11px] font-bold leading-tight">Check-in Harian</span>
          </button>
          <Link to="/toko" className="group grid justify-items-center gap-2">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent-foreground transition-transform group-hover:-translate-y-0.5">
              <Gift className="h-6 w-6" />
            </span>
            <span className="text-center text-[11px] font-bold leading-tight">Toko Hadiah</span>
          </Link>
          <Link to="/profil" hash="leaderboard" className="group grid justify-items-center gap-2">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary transition-transform group-hover:-translate-y-0.5">
              <Trophy className="h-6 w-6" />
            </span>
            <span className="text-center text-[11px] font-bold leading-tight">Papan Peringkat</span>
          </Link>
          <button
            type="button"
            onClick={() => setBantuanBuka(true)}
            className="group grid justify-items-center gap-2"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success transition-transform group-hover:-translate-y-0.5">
              <LifeBuoy className="h-6 w-6" />
            </span>
            <span className="text-center text-[11px] font-bold leading-tight">Bantuan Guru</span>
          </button>
        </div>

        {/* Popup Bantuan Guru */}
        {bantuanBuka && (
          <div
            className="fixed inset-0 z-[60] grid place-items-center bg-foreground/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Pilih nomor WhatsApp guru"
            onClick={() => setBantuanBuka(false)}
          >
            <div
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 shadow-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-center text-lg font-extrabold">Bantuan Guru</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Pilih guru yang ingin dihubungi via WhatsApp.
              </p>
              <div className="mt-5 grid gap-3">
                <a
                  href="https://wa.me/62895338573512?text=Halo%20Bapak/Ibu%20Guru%2C%20saya%20butuh%20bantuan%20di%20Ruang%20Belajar"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setBantuanBuka(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-success px-4 py-3 text-sm font-extrabold text-success-foreground shadow-pop transition-transform hover:-translate-y-0.5"
                >
                  <LifeBuoy className="h-4 w-4" /> 0895-3385-73512
                </a>
                <a
                  href="https://wa.me/6283820204401?text=Halo%20Bapak/Ibu%20Guru%2C%20saya%20butuh%20bantuan%20di%20Ruang%20Belajar"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setBantuanBuka(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-success px-4 py-3 text-sm font-extrabold text-success-foreground shadow-pop transition-transform hover:-translate-y-0.5"
                >
                  <LifeBuoy className="h-4 w-4" /> 0838-2020-4401
                </a>
              </div>
              <button
                type="button"
                onClick={() => setBantuanBuka(false)}
                className="mt-4 w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <CheckinHarian open={checkinBuka} onClose={() => setCheckinBuka(false)} />

        {/* Pengumuman dari guru */}
        <PapanPengumuman />

        {/* Rekomendasi materi */}
        <section className="mt-8">
          <div>
            <h2 className="text-2xl font-extrabold">Rekomendasi Materi Hari Ini</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Materi pilihan terbaru dari guru untuk kamu pelajari.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {rekomendasi.filter((m) => idKatalog.has(m.id)).slice(0, 6).map((m) => (
              <Link
                key={m.id}
                to="/belajar/$modulId"
                params={{ modulId: m.id }}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="relative grid h-32 place-items-center overflow-hidden bg-accent-soft">
                  {m.cover_url ? (
                    <img
                      src={m.cover_url}
                      alt={`Sampul ${m.judul}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <DynamicIcon
                      name={ikonModul(m.mapel)}
                      className="h-12 w-12 text-accent-foreground"
                    />
                  )}
                  <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">
                    {m.mapel || "Materi"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug">{m.judul}</h3>
                  <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">
                    oleh {m.nama_guru}
                  </p>
                  <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-extrabold text-success-foreground">
                    <Coins className="h-3 w-3" /> Dapatkan +{m.koin_reward} Poin
                  </span>
                  <span className="mt-auto pt-3">
                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-extrabold text-accent-foreground shadow-pop">
                      <Play className="h-4 w-4 fill-current" /> Pelajari Sekarang
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Flash sale belajar */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-accent-foreground">
              <Flame className="h-5 w-5 text-accent" /> FLASH BELAJAR
            </h2>
            <span className="text-xs font-bold text-muted-foreground">Berakhir dalam</span>
            <span className="flex gap-1">
              {waktu.map((w, i) => (
                <span
                  key={i}
                  className="rounded-md bg-primary px-2 py-1 font-display text-sm font-extrabold tabular-nums text-primary-foreground"
                >
                  {w}
                </span>
              ))}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Kumpulan latihan soal dari guru untuk mengasah pemahamanmu.
          </p>
          {populer.length === 0 && (
            <p className="mt-4 rounded-2xl border border-dashed border-border p-5 text-center text-sm font-semibold text-muted-foreground">
              Belum ada latihan dari guru.
            </p>
          )}
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {populer.map((m) => (
              <Link
                key={m.id}
                to="/belajar/$modulId"
                params={{ modulId: m.id }}
                className="w-36 shrink-0"
              >
                <span className="grid h-28 place-items-center rounded-2xl bg-accent-soft">
                  <DynamicIcon name={m.ikon} className="h-10 w-10 text-accent-foreground" />
                </span>
                <span className="mt-2 block truncate text-xs font-bold">{m.nama}</span>
                <span className="text-sm font-extrabold text-accent">+{m.koin} Poin</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Filter mapel */}
        <div className="mt-8 flex flex-wrap gap-2">
          {MAPEL.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                filter === m
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:border-accent"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <h2 className="mt-8 text-2xl font-extrabold">Katalog Modul Pelajaran</h2>
        <div className="mt-4 inline-flex rounded-full border border-border bg-card p-1 shadow-card" role="tablist">
          {(["Pembelajaran", "Proyek"] as const).map((j) => (
            <button
              key={j}
              type="button"
              role="tab"
              aria-selected={jenisTab === j}
              onClick={() => setJenisTab(j)}
              className={`rounded-full px-5 py-2 text-sm font-extrabold transition-colors ${
                jenisTab === j ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              {j === "Pembelajaran" ? "📘 Pembelajaran" : "🛠️ Proyek"} ({jumlahJenis(j)})
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {daftar.length} modul {jenisTab.toLowerCase()} tersedia. Setiap modul yang tuntas memberi Poin Belajar.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {daftar.map((m) => {
            const selesai = modulSelesai.includes(m.id);
            return (
              <Link
                key={m.id}
                to="/belajar/$modulId"
                params={{ modulId: m.id }}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="relative grid h-32 place-items-center bg-accent-soft">
                  <DynamicIcon name={m.ikon} className="h-12 w-12 text-accent-foreground" />
                  <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">
                    {m.kelas}
                  </span>
                  {selesai && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-success px-2 py-0.5 text-[10px] font-extrabold text-success-foreground">
                      <Check className="h-3 w-3" /> Tuntas
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug">{m.nama}</h3>
                  <span className="mt-1.5 inline-flex w-fit rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                    {m.mapel}
                  </span>

                  <p className="mt-2 font-display text-lg font-extrabold text-accent">
                    +{m.koin} Poin
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5 text-coin-foreground">
                      <Star className="h-3.5 w-3.5 fill-current" /> {m.rating.toFixed(1)}
                    </span>
                    <span>Terbaca {m.dibaca}x</span>
                  </div>

                  <span className="mt-3 block w-full rounded-full bg-accent px-4 py-2 text-center text-sm font-extrabold text-accent-foreground shadow-pop">
                    {selesai ? "Baca Ulang" : "Mulai Belajar"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {daftar.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm font-semibold text-muted-foreground">
            Modul tidak ditemukan. Coba kata kunci atau kategori lain.
          </p>
        )}
      </div>
    </div>
  );
}
