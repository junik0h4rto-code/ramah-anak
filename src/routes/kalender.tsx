import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatTanggal } from "@/lib/school-data";
import { listBeritaPublic } from "@/lib/berita.functions";
import { PageHeader } from "@/components/page-header";

const WARNA: Record<string, string> = {
  Akademik: "bg-primary-soft text-primary",
  Ekstrakurikuler: "bg-accent-soft text-accent-foreground",
  Libur: "bg-muted text-muted-foreground",
  Lomba: "bg-coin text-coin-foreground",
  Pengumuman: "bg-accent-soft text-accent-foreground",
  Berita: "bg-primary-soft text-primary",
};

export const Route = createFileRoute("/kalender")({
  head: () => ({
    meta: [
      { title: "Kalender Agenda Sekolah - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Jadwal kegiatan akademik, ekstrakurikuler, lomba, dan hari libur SMPN 26 BANDUNG.",
      },
      { property: "og:title", content: "Kalender Agenda Sekolah - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content:
          "Agenda akademik, ekstrakurikuler, lomba, dan libur sekolah dalam satu halaman.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["berita-public"],
      queryFn: () => listBeritaPublic(),
    });
  },
  component: KalenderPage,
});

function KalenderPage() {
  const { data: berita } = useSuspenseQuery({
    queryKey: ["berita-public"],
    queryFn: () => listBeritaPublic(),
  });

  const agenda = berita
    .filter((b) => !!b.tanggal_kegiatan)
    .map((b) => ({
      id: b.id,
      judul: b.judul,
      tanggal: b.tanggal_kegiatan as string,
      jenis: b.kategori || "Akademik",
    }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const perBulan = agenda.reduce<Record<string, typeof agenda>>((acc, a) => {
    const bulan = new Date(a.tanggal).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    acc[bulan] = [...(acc[bulan] ?? []), a];
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        icon={CalendarDays}
        eyebrow="Informasi Sekolah"
        title="Kalender Agenda Sekolah"
        subtitle="Catat tanggal pentingnya supaya tidak ketinggalan kegiatan seru."
      />
      <div className="mx-auto max-w-4xl px-4 py-12">
        {agenda.length === 0 && (
          <p className="rounded-3xl border border-border bg-card p-6 text-center text-sm font-semibold text-muted-foreground shadow-card">
            Belum ada agenda kegiatan. Guru dapat menambahkannya dari Panel Guru.
          </p>
        )}
        {Object.entries(perBulan).map(([bulan, daftar]) => (
          <section key={bulan} className="mb-10">
            <h2 className="text-xl font-extrabold">{bulan}</h2>
            <ul className="mt-4 grid gap-3">
              {daftar.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-card"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-navy text-primary-foreground">
                    <span className="font-display text-xl font-extrabold leading-none">
                      {new Date(a.tanggal).getDate()}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-extrabold">{a.judul}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          WARNA[a.jenis] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {a.jenis}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTanggal(a.tanggal)}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
