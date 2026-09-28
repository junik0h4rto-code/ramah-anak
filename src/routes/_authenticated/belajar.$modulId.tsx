import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Coins, Lightbulb, UserRound } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DynamicIcon } from "@/components/dynamic-icon";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { getModul, klaimKoinModul, simpanRefleksi } from "@/lib/modul.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/belajar/$modulId")({
  head: () => ({
    meta: [
      { title: "Isi Materi Belajar - Ruang Belajar SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Baca isi materi modul pelajaran, kerjakan evaluasi singkat, dan klaim Poin Belajar kamu.",
      },
      { property: "og:title", content: "Isi Materi Belajar - Ruang Belajar" },
      {
        property: "og:description",
        content: "Materi pelajaran SMPN 26 BANDUNG lengkap dengan evaluasi dan hadiah Poin Belajar.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const modul = await context.queryClient.ensureQueryData({
      queryKey: ["modul", params.modulId],
      queryFn: () => getModul({ data: { id: params.modulId } }),
    });
    if (!modul) throw notFound();
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center font-semibold">
      Gagal memuat modul: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-lg font-extrabold">Modul tidak ditemukan.</p>
      <Link to="/belajar" className="mt-3 inline-block text-sm font-bold text-primary hover:underline">
        Kembali ke katalog
      </Link>
    </div>
  ),
  component: DetailModul,
});

function ikonModul(mapel: string | null) {
  const map: Record<string, string> = {
    Matematika: "Calculator",
    IPA: "Leaf",
    IPS: "Landmark",
    "Bahasa Indonesia": "NotebookPen",
    "Bahasa Inggris": "Languages",
    Informatika: "Zap",
    "Basa Sunda": "PenLine",
    "Pendidikan Pancasila": "Flag",
    PJOK: "Volleyball",
    SBdP: "Palette",
  };
  return (mapel && map[mapel]) || "BookOpen";
}

function tanggalIndo(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const PERTANYAAN_REFLEKSI = [
  "Apa hal paling penting yang kamu pelajari dari materi ini?",
  "Bagian mana yang masih sulit kamu pahami, dan apa yang akan kamu lakukan untuk memahaminya?",
  "Bagaimana kamu akan menerapkan materi ini dalam kehidupan sehari-hari?",
];
const MIN_REFLEKSI = 5;

function DetailModul() {
  const { modulId } = Route.useParams();
  const navigate = useNavigate();
  const { data: modul } = useSuspenseQuery({
    queryKey: ["modul", modulId],
    queryFn: () => getModul({ data: { id: modulId } }),
  });
  const { modulSelesai, selesaikanModul } = useGamifikasi();

  const kontenRef = useRef<HTMLDivElement | null>(null);
  const [progres, setProgres] = useState(0);
  const [jawaban, setJawaban] = useState<"benar" | "salah" | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [refleksi, setRefleksi] = useState<string[]>(["", "", ""]);

  const hitungProgres = useCallback(() => {
    const el = kontenRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const lewat = -rect.top;
    const persen = total <= 0 ? 100 : (lewat / total) * 100;
    setProgres((p) => Math.max(p, Math.min(100, Math.max(0, persen))));
  }, []);

  useEffect(() => {
    hitungProgres();
    window.addEventListener("scroll", hitungProgres, { passive: true });
    window.addEventListener("resize", hitungProgres);
    return () => {
      window.removeEventListener("scroll", hitungProgres);
      window.removeEventListener("resize", hitungProgres);
    };
  }, [hitungProgres]);

  if (!modul) return null;

  const koin = modul.koin_reward || 0;
  const sudahSelesai = modulSelesai.includes(modul.id);
  const selesaiBaca = progres >= 98;
  const jawabanBenar = jawaban === "benar";
  const refleksiLengkap = refleksi.every((r) => r.trim().length >= MIN_REFLEKSI);
  const bisaKlaim = selesaiBaca && jawabanBenar && refleksiLengkap && !sudahSelesai && !mengirim;

  async function klaim() {
    if (!modul) return;
    setMengirim(true);
    try {
      await simpanRefleksi({ data: { modul_id: modul.id, jawaban: refleksi.map((r) => r.trim()) } });
      const hasil = await klaimKoinModul({ data: { id: modul.id } });
      selesaikanModul(modul.id, hasil.koinDidapat || koin, modul.judul);
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
      window.setTimeout(() => confetti({ particleCount: 90, spread: 120, origin: { y: 0.5 } }), 300);
      toast.success(`Selamat! +${hasil.koinDidapat || koin} Poin Belajar berhasil ditambahkan ke akunmu!`, {
        description: `Modul "${modul.judul}" selesai kamu pelajari.`,
      });
      window.setTimeout(() => void navigate({ to: "/belajar" }), 1800);
    } catch (e) {
      toast.error("Gagal mengklaim poin", {
        description: e instanceof Error ? e.message : "Coba lagi sebentar.",
      });
      setMengirim(false);
    }
  }

  const poin = (modul.deskripsi || "")
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="pb-20">
      {/* Navbar progres */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            to="/belajar"
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-extrabold text-foreground hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>

          <div className="min-w-[160px] flex-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-200"
                style={{ width: `${progres}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] font-bold text-muted-foreground">
              Kemajuan membaca: {Math.round(progres)}%
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-coin px-3 py-1.5 text-xs font-extrabold text-coin-foreground">
            <Coins className="h-4 w-4" />
            Selesaikan materi ini untuk mendapatkan +{koin} Poin!
          </span>
        </div>
      </div>

      <div ref={kontenRef} className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap gap-2 text-[11px] font-extrabold">
          <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">
            {modul.kelas || "Semua Kelas"}
          </span>
          <span className="rounded-md bg-accent-soft px-2 py-1 text-accent-foreground">
            {modul.mapel || "Umum"}
          </span>
          {modul.kategori && (
            <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">{modul.kategori}</span>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{modul.judul}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-4 w-4" /> Guru Pengajar: Bapak / Ibu Guru {modul.mapel || "Sekolah"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> Dirilis {tanggalIndo(modul.created_at)}
          </span>
        </div>

        <div className="mt-6 grid h-56 place-items-center rounded-3xl bg-accent-soft">
          <DynamicIcon name={ikonModul(modul.mapel)} className="h-24 w-24 text-accent-foreground" />
        </div>

        <article className="mt-8 space-y-5 text-[15px] leading-relaxed text-foreground">
          <p className="text-muted-foreground">
            Selamat datang di materi <strong className="text-foreground">{modul.judul}</strong>. Bacalah
            materi berikut sampai selesai, lalu jawab evaluasi singkat di bagian bawah halaman untuk
            mengklaim Poin Belajar kamu.
          </p>

          {poin.length > 0 && (
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              {poin.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}

          {modul.tautan_tugas && (
            <a
              href={modul.tautan_tugas}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-3xl border-2 border-primary bg-primary/10 p-5 font-extrabold"
            >
              <span>📤 Kumpulkan tugas modul ini</span>
              <span className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">Buka Link</span>
            </a>
          )}

          {modul.konten?.trim() ? (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7">
              <h2 className="mb-4 text-xl font-extrabold">Isi Materi</h2>
              <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
                {modul.konten}
              </div>
            </div>
          ) : (
            poin.length === 0 && (
              <p className="text-muted-foreground">
                Materi ini belum memiliki uraian lengkap. Tanyakan kepada gurumu untuk penjelasan tambahan
                di kelas.
              </p>
            )
          )}

          <p className="text-muted-foreground">
            Pahami setiap poin di atas dengan membaca perlahan. Catat istilah penting di buku tulismu,
            lalu coba jelaskan kembali dengan bahasamu sendiri kepada teman sebangku.
          </p>

          <div className="rounded-2xl border-l-8 border-coin bg-coin/15 p-5">
            <p className="inline-flex items-center gap-2 text-sm font-extrabold text-foreground">
              <Lightbulb className="h-5 w-5 text-coin-foreground" /> Tips &amp; Rangkuman Kunci
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80">
              <li>Materi ini termasuk mata pelajaran {modul.mapel || "umum"} untuk {modul.kelas || "semua kelas"}.</li>
              <li>Ulangi membaca bagian yang belum kamu pahami sebelum mengerjakan evaluasi.</li>
              <li>Menyelesaikan modul ini memberi kamu +{koin} Poin Belajar.</li>
            </ul>
          </div>

          <p className="text-muted-foreground">
            Setelah kamu yakin memahami isi materi, gulir sampai bagian paling bawah dan kerjakan evaluasi
            singkat berikut.
          </p>
        </article>

        {/* Evaluasi singkat */}
        <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-extrabold">Evaluasi Singkat &amp; Refleksi</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Benar atau salah: materi <strong className="text-foreground">{modul.judul}</strong> termasuk
            mata pelajaran <strong className="text-foreground">{modul.mapel || "umum"}</strong> dan memberi
            hadiah {koin} Poin Belajar bila diselesaikan.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["benar", "salah"] as const).map((opsi) => (
              <button
                key={opsi}
                type="button"
                onClick={() => setJawaban(opsi)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-sm font-extrabold capitalize transition-colors",
                  jawaban === opsi
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary",
                )}
              >
                {opsi}
              </button>
            ))}
          </div>

          {jawaban && (
            <p
              className={cn(
                "mt-3 text-sm font-bold",
                jawabanBenar ? "text-primary" : "text-destructive",
              )}
            >
              {jawabanBenar
                ? "Tepat sekali! Kamu memahami materinya."
                : "Belum tepat. Baca ulang rangkuman kunci lalu coba lagi."}
            </p>
          )}

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-base font-extrabold">Refleksi Belajar</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Jawab ketiga pertanyaan refleksi berikut dengan kalimatmu sendiri sebelum menyelesaikan modul.
            </p>
            <div className="mt-4 grid gap-4">
              {PERTANYAAN_REFLEKSI.map((q, i) => (
                <label key={i} className="grid gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {i + 1}. {q}
                  </span>
                  <textarea
                    value={refleksi[i]}
                    onChange={(e) =>
                      setRefleksi((r) => r.map((v, j) => (j === i ? e.target.value : v)))
                    }
                    disabled={sudahSelesai}
                    rows={3}
                    maxLength={2000}
                    placeholder="Tulis jawabanmu di sini..."
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-accent disabled:opacity-60"
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!bisaKlaim}
            onClick={() => void klaim()}
            className={cn(
              "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold transition-opacity",
              sudahSelesai
                ? "bg-muted text-muted-foreground"
                : bisaKlaim
                  ? "bg-accent text-accent-foreground shadow-pop hover:opacity-90"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            {sudahSelesai ? (
              <>
                <Check className="h-4 w-4" /> Sudah Diselesaikan
              </>
            ) : mengirim ? (
              "Memproses..."
            ) : (
              <>
                <Coins className="h-4 w-4" /> Selesai Belajar &amp; Klaim {koin} Poin
              </>
            )}
          </button>

          {!sudahSelesai && !bisaKlaim && (
            <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">
              {!selesaiBaca
                ? "Gulir materi sampai bawah"
                : !jawabanBenar
                  ? "Jawab evaluasi dengan benar"
                  : "Isi ketiga jawaban refleksi"} untuk membuka
              tombol klaim poin.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
