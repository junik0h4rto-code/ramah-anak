import { createFileRoute } from "@tanstack/react-router";
import { Newspaper } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatTanggal } from "@/lib/school-data";
import { listBeritaPublic } from "@/lib/berita.functions";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/berita")({
  head: () => ({
    meta: [
      { title: "Berita Sekolah - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Kabar terbaru dari SMPN 26 BANDUNG: prestasi siswa, kegiatan sekolah, dan pengembangan fasilitas belajar.",
      },
      { property: "og:title", content: "Berita Sekolah - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Prestasi, kegiatan, dan kabar fasilitas terbaru SMPN 26 BANDUNG.",
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
  component: BeritaPage,
});

function ringkasan(isi: string, max = 160) {
  return isi.length > max ? isi.slice(0, max).trimEnd() + "..." : isi;
}

function BeritaPage() {
  const { data: berita } = useSuspenseQuery({
    queryKey: ["berita-public"],
    queryFn: () => listBeritaPublic(),
  });

  return (
    <div>
      <PageHeader
        icon={Newspaper}
        eyebrow="Informasi Sekolah"
        title="Berita Sekolah"
        subtitle="Cerita seru tentang prestasi, kegiatan, dan perkembangan sekolah kita."
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 md:grid-cols-2">
        {berita.map((b) => (
          <article
            key={b.id}
            className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent-foreground">
                {b.kategori || "Berita"}
              </span>
              <span className="text-muted-foreground">{formatTanggal(b.created_at)}</span>
            </div>
            <h2 className="mt-3 text-xl font-extrabold">{b.judul}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ringkasan(b.isi)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
