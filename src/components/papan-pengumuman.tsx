import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Megaphone, CalendarDays, ChevronRight } from "lucide-react";
import { listBeritaPublic } from "@/lib/berita.functions";

function formatTanggal(t: string) {
  return new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PapanPengumuman({ batas = 4 }: { batas?: number }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["berita-public"],
    queryFn: () => listBeritaPublic(),
    refetchInterval: 30000,
  });

  const pengumuman = data
    .filter((b) => (b.kategori || "pengumuman").toLowerCase() === "pengumuman")
    .slice(0, batas);

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold leading-tight">Pengumuman Sekolah</h2>
            <p className="text-xs font-semibold text-muted-foreground">Info terbaru dari Bapak/Ibu Guru</p>
          </div>
        </div>
        <Link
          to="/pengumuman"
          className="inline-flex items-center gap-1 text-xs font-extrabold text-accent-foreground hover:underline"
        >
          Lihat semua <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading && (
        <p className="py-4 text-center text-sm font-semibold text-muted-foreground">Memuat pengumuman...</p>
      )}
      {!isLoading && pengumuman.length === 0 && (
        <p className="rounded-2xl bg-muted/60 py-5 text-center text-sm font-semibold text-muted-foreground">
          Belum ada pengumuman baru.
        </p>
      )}

      <ul className="grid gap-3">
        {pengumuman.map((p, i) => (
          <li
            key={p.id}
            className={`rounded-2xl border p-4 ${
              i === 0 ? "border-accent/50 bg-accent-soft/40" : "border-border bg-background"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {i === 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground">
                  Terbaru
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {p.tanggal_kegiatan ? formatTanggal(p.tanggal_kegiatan) : formatTanggal(p.created_at)}
              </span>
            </div>
            {p.gambar_url && (
              <img
                src={p.gambar_url}
                alt={p.judul}
                loading="lazy"
                className="mt-2 h-36 w-full rounded-xl object-cover"
              />
            )}
            <p className="mt-1.5 font-extrabold leading-snug">{p.judul}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm font-medium text-muted-foreground">
              {p.isi}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
