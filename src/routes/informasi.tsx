import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Info, Megaphone, Newspaper } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatTanggal } from "@/lib/school-data";
import { listBeritaPublic } from "@/lib/berita.functions";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/informasi")({
  head: () => ({
    meta: [
      { title: "Pusat Informasi Sekolah - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Semua pengumuman resmi dan berita SMPN 26 BANDUNG dalam satu halaman, terbuka untuk siswa, wali murid, dan masyarakat tanpa perlu masuk akun.",
      },
      { property: "og:title", content: "Pusat Informasi Sekolah - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Pengumuman resmi dan berita terbaru SMPN 26 BANDUNG dalam satu halaman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["berita-public"],
      queryFn: () => listBeritaPublic(),
    });
  },
  component: InformasiPage,
});

type Filter = "semua" | "pengumuman" | "berita" | "agenda";

const FILTER: { key: Filter; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "pengumuman", label: "Pengumuman" },
  { key: "berita", label: "Berita" },
  { key: "agenda", label: "Kalender Agenda" },
];

function isPengumuman(kategori: string | null) {
  return (kategori || "").toLowerCase() === "pengumuman";
}

function InformasiPage() {
  const { data: semua } = useSuspenseQuery({
    queryKey: ["berita-public"],
    queryFn: () => listBeritaPublic(),
  });
  const [filter, setFilter] = useState<Filter>("semua");

  const jumlah = useMemo(() => {
    const pengumuman = semua.filter((b) => isPengumuman(b.kategori)).length;
    const agenda = semua.filter((b) => Boolean(b.tanggal_kegiatan)).length;
    return { semua: semua.length, pengumuman, berita: semua.length - pengumuman, agenda };
  }, [semua]);

  const daftar = useMemo(() => {
    if (filter === "pengumuman") return semua.filter((b) => isPengumuman(b.kategori));
    if (filter === "berita") return semua.filter((b) => !isPengumuman(b.kategori));
    if (filter === "agenda") {
      return [...semua]
        .filter((b) => Boolean(b.tanggal_kegiatan))
        .sort((a, b) =>
          (a.tanggal_kegiatan ?? "").localeCompare(b.tanggal_kegiatan ?? ""),
        );
    }
    return semua;
  }, [semua, filter]);

  return (
    <div>
      <PageHeader
        icon={Info}
        eyebrow="Informasi Sekolah"
        title="Pusat Informasi Sekolah"
        subtitle="Pengumuman resmi dan berita sekolah dalam satu halaman. Bisa dibaca siapa saja, tanpa perlu masuk akun."
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {FILTER.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                filter === f.key
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{jumlah[f.key]}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {daftar.length === 0 && (
            <p className="rounded-3xl border border-border bg-card p-6 text-center text-sm font-semibold text-muted-foreground shadow-card">
              Belum ada informasi di bagian ini. Kembali lagi nanti.
            </p>
          )}

          {daftar.map((b) => {
            const penting = isPengumuman(b.kategori);
            return (
              <article
                key={b.id}
                className={cn(
                  "rounded-3xl border bg-card p-5 shadow-card sm:p-6",
                  penting ? "border-accent" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-extrabold",
                      penting
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent-soft text-accent-foreground",
                    )}
                  >
                    {penting ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" /> Pengumuman Penting
                      </>
                    ) : (
                      <>
                        <Newspaper className="h-3.5 w-3.5" /> {b.kategori || "Berita"}
                      </>
                    )}
                  </span>
                  <span className="text-muted-foreground">{formatTanggal(b.created_at)}</span>
                  {b.tanggal_kegiatan && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-primary">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Agenda: {formatTanggal(b.tanggal_kegiatan)}
                    </span>
                  )}
                </div>

                {b.gambar_url && (
                  <img
                    src={b.gambar_url}
                    alt={b.judul}
                    loading="lazy"
                    className="mt-3 max-h-80 w-full rounded-2xl object-cover"
                  />
                )}

                <h2 className="mt-3 text-lg font-extrabold sm:text-xl">{b.judul}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {b.isi}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-semibold text-muted-foreground">
          <Megaphone className="h-4 w-4" /> Informasi khusus kelas hanya tampil setelah siswa masuk
          akun.
        </p>
      </div>
    </div>
  );
}
