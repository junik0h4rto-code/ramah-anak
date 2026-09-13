import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Megaphone } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatTanggal } from "@/lib/school-data";
import { listBeritaPublic } from "@/lib/berita.functions";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/pengumuman")({
  head: () => ({
    meta: [
      { title: "Pengumuman Resmi - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Pengumuman resmi sekolah: jadwal penilaian, pendaftaran ekstrakurikuler, dan jadwal penukaran Poin Siswa.",
      },
      { property: "og:title", content: "Pengumuman Resmi - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Informasi penting untuk siswa dan wali murid SMPN 26 BANDUNG.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["berita-public"],
      queryFn: () => listBeritaPublic(),
    });
  },
  component: PengumumanPage,
});

function PengumumanPage() {
  const { data: berita } = useSuspenseQuery({
    queryKey: ["berita-public"],
    queryFn: () => listBeritaPublic(),
  });
  const pengumuman = berita.filter(
    (b) => (b.kategori || "").toLowerCase() === "pengumuman",
  );

  return (
    <div>
      <PageHeader
        icon={Megaphone}
        eyebrow="Informasi Sekolah"
        title="Pengumuman Resmi"
        subtitle="Informasi penting dari sekolah untuk siswa dan wali murid."
      />
      <div className="mx-auto grid max-w-4xl gap-4 px-4 py-12">
        {pengumuman.length === 0 && (
          <p className="rounded-3xl border border-border bg-card p-6 text-center text-sm font-semibold text-muted-foreground shadow-card">
            Belum ada pengumuman. Kembali lagi nanti.
          </p>
        )}
        {pengumuman.map((p) => (
          <article
            key={p.id}
            className="rounded-3xl border border-accent bg-card p-6 shadow-card"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-accent-foreground">
                <AlertTriangle className="h-3.5 w-3.5" /> Penting
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {formatTanggal(p.created_at)}
              </span>
            </div>
            {p.gambar_url && (
              <img
                src={p.gambar_url}
                alt={p.judul}
                loading="lazy"
                className="mt-3 max-h-80 w-full rounded-2xl object-cover"
              />
            )}
            <h2 className="mt-3 text-xl font-extrabold">{p.judul}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.isi}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
