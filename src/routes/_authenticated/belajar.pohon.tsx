import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Droplets, Sparkles, Trophy, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  statusPohon,
  panenPohon,
  leaderboardPohon,
  katalogPerilaku,
  kirimPerilakuMandiri,
  type StatusPohon,
  type ItemKatalog,
} from "@/lib/perilaku.functions";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { kompresGambar } from "@/lib/gambar";

export const Route = createFileRoute("/_authenticated/belajar/pohon")({
  head: () => ({
    meta: [
      { title: "Pohon Kebaikan - Tumbuh dari Perilaku Terpuji" },
      {
        name: "description",
        content:
          "Siram Pohon Kebaikanmu lewat perilaku terpuji RAMAH di SMPN 26 BANDUNG, lalu panen buahnya menjadi Poin Siswa.",
      },
      { property: "og:title", content: "Pohon Kebaikan - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Perilaku terpuji menyiram pohonmu. Panen buahnya jadi Poin Siswa.",
      },
    ],
  }),
  component: HalamanPohon,
});

const TAHAP = [
  { min: 0, nama: "Biji Kebaikan", emoji: "🌱", pesan: "Mulai kumpulkan perilaku terpuji." },
  { min: 10, nama: "Tunas Muda", emoji: "🌿", pesan: "Tunasmu mulai tumbuh, lanjutkan!" },
  { min: 35, nama: "Pohon Muda", emoji: "🪴", pesan: "Pohonmu makin rindang." },
  { min: 70, nama: "Pohon Rindang", emoji: "🌳", pesan: "Sedikit lagi berbuah!" },
  { min: 100, nama: "Pohon Berbuah", emoji: "🍎", pesan: "Pohonmu siap dipanen!" },
];

function tahapDari(air: number) {
  return [...TAHAP].reverse().find((t) => air >= t.min) ?? TAHAP[0]!;
}

const WARNA_KATEGORI: Record<string, string> = {
  Religius: "bg-primary/15 text-primary",
  Aman: "bg-success/20 text-success",
  Mandiri: "bg-coin/30 text-coin-foreground",
  Aktif: "bg-accent/25 text-accent-foreground",
  Humanis: "bg-destructive/15 text-destructive",
};

function HalamanPohon() {
  const ambil = useServerFn(statusPohon);
  const panen = useServerFn(panenPohon);
  const ambilPapan = useServerFn(leaderboardPohon);
  const ambilKatalog = useServerFn(katalogPerilaku);
  const kirim = useServerFn(kirimPerilakuMandiri);
  const { muatUlang } = useGamifikasi();

  const [katalog, setKatalog] = useState<ItemKatalog[]>([]);
  const [kategoriPilih, setKategoriPilih] = useState("");
  const [perilakuPilih, setPerilakuPilih] = useState("");
  const [catatan, setCatatan] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoProses, setFotoProses] = useState(false);
  const [kirimProses, setKirimProses] = useState(false);

  const [data, setData] = useState<StatusPohon | null>(null);
  const [papan, setPapan] = useState<
    { nama: string; kelas: string | null; total_air: number; total_panen: number }[]
  >([]);
  const [proses, setProses] = useState(false);
  const [dialog, setDialog] = useState<{ poin: number } | null>(null);

  const segarkan = useCallback(async () => {
    const [s, p] = await Promise.all([ambil({}), ambilPapan({})]);
    setData(s);
    setPapan(p);
  }, [ambil, ambilPapan]);

  useEffect(() => {
    void segarkan().catch(() => {});
    void ambilKatalog({})
      .then(setKatalog)
      .catch(() => {});
  }, [segarkan, ambilKatalog]);

  async function pilihFoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pilih berkas gambar ya (JPG atau PNG).");
      return;
    }
    setFotoProses(true);
    try {
      setFoto(await kompresGambar(file, 900, 300_000));
      toast.success("Foto bukti siap dikirim.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Foto gagal diproses");
    } finally {
      setFotoProses(false);
    }
  }

  async function kirimKebaikan() {
    if (!perilakuPilih || !foto || kirimProses) return;
    setKirimProses(true);
    try {
      const r = await kirim({
        data: { katalogId: perilakuPilih, catatan: catatan.trim() || undefined, foto },
      });
      if (!r.berhasil) {
        toast.error(r.pesan);
      } else {
        toast.success(`Mantap! +${r.poin} Poin dan +${r.air} air. Sisa kiriman ${r.sisaKiriman}.`);
        setPerilakuPilih("");
        setCatatan("");
        setFoto(null);
        await muatUlang();
      }
      await segarkan();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengirim kebaikan");
    } finally {
      setKirimProses(false);
    }
  }


  async function klikPanen() {
    if (!data || proses) return;
    setProses(true);
    try {
      const r = await panen({});
      if (!r.berhasil) {
        toast.error(r.pesan);
      } else {
        setDialog({ poin: r.poinDidapat });
        await muatUlang();
      }
      await segarkan();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memanen pohon");
    } finally {
      setProses(false);
    }
  }

  const air = data?.air ?? 0;
  const tahap = tahapDari(air);
  const persen = Math.min(100, Math.round((air / 100) * 100));
  const siapPanen = air >= 100;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-5">
      <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-card lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-success/20 text-success">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold">Pohon Kebaikan</h1>
              <p className="text-xs font-semibold text-muted-foreground">
                Musim ke-{data?.musim ?? 1} &middot; sudah {data?.totalPanen ?? 0} kali panen
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-extrabold text-primary">
            <Droplets className="h-4 w-4" />
            {air} / 100 air
          </span>
        </div>

        <div
          className={`relative mx-auto mt-6 grid h-56 w-56 place-items-center rounded-full bg-gradient-to-b from-success/15 to-coin/20 ${
            siapPanen ? "animate-pulse" : ""
          }`}
        >
          <span className="text-8xl leading-none">{tahap.emoji}</span>
        </div>

        <p className="mt-4 font-display text-2xl font-extrabold">{tahap.nama}</p>
        <p className="text-sm font-bold text-muted-foreground">{tahap.pesan}</p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all duration-700"
            style={{ width: `${persen}%` }}
          />
        </div>

        <button
          type="button"
          onClick={klikPanen}
          disabled={!siapPanen || proses}
          className="mt-6 w-full rounded-full bg-gradient-play px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
        >
          {proses
            ? "Memanen..."
            : siapPanen
              ? `PANEN BUAH (+${data?.poinPanen ?? 50} Poin)`
              : `Butuh ${100 - air} air lagi untuk panen`}
        </button>

        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Perilaku terpuji dari gurumu maupun kiriman fotomu sendiri menambah Poin sekaligus
          menyiram pohon ini.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-extrabold">Kirim Kebaikanmu Sendiri</h2>
            <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-extrabold text-success">
              Sisa {data?.sisaKiriman ?? 5} kiriman hari ini
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Pilih kategori, pilih perilakunya, lampirkan foto bukti. Poin langsung masuk.
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              aria-label="Kategori RAMAH"
              value={kategoriPilih}
              onChange={(e) => {
                setKategoriPilih(e.target.value);
                setPerilakuPilih("");
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold"
            >
              <option value="">Pilih kategori RAMAH</option>
              {[...new Set(katalog.map((k) => k.kategori))].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <select
              aria-label="Jenis perilaku"
              value={perilakuPilih}
              onChange={(e) => setPerilakuPilih(e.target.value)}
              disabled={!kategoriPilih}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold disabled:opacity-60"
            >
              <option value="">Pilih perilaku</option>
              {katalog
                .filter((k) => k.kategori === kategoriPilih)
                .map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.jenis} (+{k.poin})
                  </option>
                ))}
            </select>
          </div>

          <input
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            maxLength={200}
            placeholder="Catatan singkat (opsional)"
            className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-dashed border-border bg-background px-3 py-2 text-xs font-extrabold">
              {foto ? "Ganti Foto dari Galeri" : "Pilih Foto dari Galeri"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void pilihFoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <label className="cursor-pointer rounded-xl border border-dashed border-border bg-background px-3 py-2 text-xs font-extrabold">
              Ambil Foto Kamera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  void pilihFoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {fotoProses && (
              <span className="text-xs font-bold text-muted-foreground">Memproses foto...</span>
            )}
            {foto && (
              <>
                <img
                  src={foto}
                  alt="Pratinjau foto bukti perilaku terpuji"
                  className="h-20 w-20 rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="text-xs font-bold text-destructive"
                >
                  Hapus Foto
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={kirimKebaikan}
            disabled={!perilakuPilih || !foto || kirimProses || (data?.sisaKiriman ?? 5) <= 0}
            className="mt-4 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
          >
            {kirimProses ? "Mengirim..." : "Kirim & Siram Pohon"}
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:col-span-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Sparkles className="h-5 w-5 text-accent" /> Kebaikan RAMAH-mu
          </h2>
          {(data?.kategori.length ?? 0) === 0 ? (
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              Belum ada catatan perilaku terpuji. Tunjukkan sikap terbaikmu di sekolah ya!
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {data!.kategori.map((k) => (
                <span
                  key={k.kategori}
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                    WARNA_KATEGORI[k.kategori] ?? "bg-muted text-foreground"
                  }`}
                >
                  {k.kategori} &middot; {k.jumlah}x &middot; {k.poin} poin
                </span>
              ))}
            </div>
          )}

          <h3 className="mt-5 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Riwayat Terbaru
          </h3>
          <ul className="mt-2 grid gap-2">
            {(data?.riwayat ?? []).slice(0, 8).map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-2xl bg-muted/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{r.jenis}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {r.kategori} &middot;{" "}
                    {new Date(r.waktu).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-success/20 px-2.5 py-1 text-xs font-extrabold text-success">
                  +{r.poin} poin
                </span>
              </li>
            ))}
            {(data?.riwayat.length ?? 0) === 0 && (
              <li className="text-sm font-semibold text-muted-foreground">Belum ada riwayat.</li>
            )}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Trophy className="h-5 w-5 text-coin-foreground" /> Pohon Terhijau
          </h2>
          <ol className="mt-3 grid gap-2">
            {papan.map((p, i) => (
              <li
                key={`${p.nama}-${i}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-3 py-2 text-sm font-bold"
              >
                <span className="truncate">
                  {i + 1}. {p.nama}
                  {p.kelas ? ` (${p.kelas})` : ""}
                </span>
                <span className="shrink-0 text-primary">{p.total_air} air</span>
              </li>
            ))}
            {papan.length === 0 && (
              <li className="text-sm font-semibold text-muted-foreground">Belum ada data.</li>
            )}
          </ol>
        </section>
      </div>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-2xl font-extrabold">
              Panen Berhasil!
            </DialogTitle>
            <DialogDescription className="text-center text-base font-bold text-foreground">
              Pohon Kebaikanmu berbuah dan kamu mendapat {dialog?.poin ?? 0} Poin.
            </DialogDescription>
          </DialogHeader>
          <div className="animate-scale-in text-6xl">🍎</div>
          <button
            type="button"
            onClick={() => setDialog(null)}
            className="mx-auto rounded-full bg-primary px-6 py-2.5 text-sm font-extrabold text-primary-foreground"
          >
            Tanam Lagi
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
