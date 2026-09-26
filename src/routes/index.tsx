import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  Coins,
  Gamepad2,
  Megaphone,
  School,
  Sparkles,
  Trophy,
} from "lucide-react";
import heroAsset from "@/assets/BG_smpn26.jpg.asset.json";
const heroImage = heroAsset.url;
import { AGENDA, PENGUMUMAN, formatTanggal } from "@/lib/school-data";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { usePengaturanSekolah } from "@/lib/pengaturan-store";
import { listBeritaPublic } from "@/lib/berita.functions";
import { pastikanSeedAwal } from "@/lib/seed.functions";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SMPN 26 BANDUNG - Sekolah Ceria Berbasis Gamifikasi" },
      {
        name: "description",
        content:
          "Beranda resmi SMPN 26 BANDUNG: berita, pengumuman, kalender agenda, Ruang Belajar gamifikasi, dan Toko Reward Poin Siswa.",
      },
      { property: "og:title", content: "SMPN 26 BANDUNG - Sekolah Ceria Berbasis Gamifikasi" },
      {
        property: "og:description",
        content:
          "Belajar seru, kumpulkan Poin Siswa, dan tukarkan hadiah di Toko Reward sekolah.",
      },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    void pastikanSeedAwal().catch(() => undefined);
    await context.queryClient.ensureQueryData({
      queryKey: ["berita-public"],
      queryFn: () => listBeritaPublic(),
    });
  },
  component: Beranda,
});

function ringkasan(isi: string, max = 120) {
  return isi.length > max ? isi.slice(0, max).trimEnd() + "..." : isi;
}

type KartuJelajahi =
  | { to: "/informasi" | "/belajar" | "/belajar/game" | "/profil-sekolah"; judul: string; teks: string; icon: LucideIcon }
  | { href: string; judul: string; teks: string; icon: LucideIcon };

const KARTU_JELAJAHI: KartuJelajahi[] = [
  {
    to: "/informasi",
    judul: "Informasi Sekolah",
    teks: "Pengumuman dan berita sekolah dalam satu halaman.",
    icon: Megaphone,
  },
  {
    to: "/belajar",
    judul: "Ruang Belajar",
    teks: "Katalog modul pelajaran bergaya toko online.",
    icon: Coins,
  },
  {
    to: "/belajar/game",
    judul: "Pusat Game",
    teks: "Kuis trivia dan roda keberuntungan berhadiah poin.",
    icon: Gamepad2,
  },
  {
    to: "/profil-sekolah",
    judul: "Profil Sekolah",
    teks: "Kenali warga sekolah, fasilitas, dan cara belajar di SMPN 26 BANDUNG.",
    icon: School,
  },
];

function Beranda() {
  const { data: berita } = useSuspenseQuery({
    queryKey: ["berita-public"],
    queryFn: () => listBeritaPublic(),
  });
  const { koin } = useGamifikasi();
  const sekolah = usePengaturanSekolah();
  const beritaTerbaru = berita.slice(0, 3);

  return (
    <div>
      <section className="bg-gradient-navy text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1fr_0.45fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-accent-foreground">
              <Sparkles className="h-4 w-4" /> Sekolah Digital Ramah Anak
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Belajar Jadi Petualangan, Prestasi Jadi Kebiasaan
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed opacity-85">
              SMPN 26 BANDUNG menggabungkan informasi sekolah yang lengkap dengan aplikasi
              pembelajaran berbasis gamifikasi. Selesaikan modul, kumpulkan Poin Siswa, lalu
              tukarkan dengan hadiah nyata.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/belajar"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop transition-transform hover:-translate-y-0.5"
              >
                Masuk Ruang Belajar <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pengumuman"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary-foreground/30 px-6 py-3 text-sm font-extrabold transition-colors hover:bg-primary-foreground/10"
              >
                Lihat Pengumuman
              </Link>
              <Link
                to="/asesmen"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-extrabold text-primary shadow-pop transition-transform hover:-translate-y-0.5"
              >
                Mulai Asesmen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4">
              {[
                { label: "Siswa Aktif", nilai: "612" },
                { label: "Modul Digital", nilai: "48" },
                { label: "Poin Kamu", nilai: koin.toLocaleString("id-ID") },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-primary-foreground/10 px-4 py-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wide opacity-70">
                    {s.label}
                  </dt>
                  <dd className="font-display text-2xl font-extrabold">{s.nilai}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-pop lg:max-w-sm">
            <img
              src={sekolah.hero_url || heroImage}
              alt={`Gedung dan halaman ${sekolah.nama_sekolah}`}
              width={800}
              height={504}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Jelajahi Sekolah Kami</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Empat area utama untuk siswa, guru, dan orang tua.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {KARTU_JELAJAHI.map((k) =>
            "href" in k ? (
              <a
                key={k.href}
                href={k.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-3xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
                  <k.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{k.judul}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{k.teks}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Buka <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            ) : (
              <Link
                key={k.to}
                to={k.to}
                className="group rounded-3xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
                  <k.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{k.judul}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{k.teks}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Buka <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-extrabold">Berita Terbaru</h2>
            <Link to="/berita" className="text-sm font-bold text-primary hover:underline">
              Semua berita
            </Link>
          </div>
          <div className="mt-5 grid gap-4">
            {beritaTerbaru.map((b) => (
              <article
                key={b.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary">
                    {b.kategori || "Berita"}
                  </span>
                  <span className="text-muted-foreground">{formatTanggal(b.created_at)}</span>
                </div>
                <h3 className="mt-2.5 text-lg font-extrabold">{b.judul}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{ringkasan(b.isi)}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <CalendarDays className="h-5 w-5 text-accent" /> Agenda Terdekat
            </h2>
            <ul className="mt-4 grid gap-3">
              {AGENDA.slice(0, 4).map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-xs font-extrabold leading-none text-primary-foreground">
                    {new Date(a.tanggal).getDate()}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{a.judul}</span>
                    <span className="text-xs text-muted-foreground">{a.jenis}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/kalender"
              className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
            >
              Lihat kalender lengkap
            </Link>
          </div>

          <div className="rounded-3xl bg-accent-soft p-5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-accent-foreground">
              <Trophy className="h-5 w-5" /> Pengumuman Penting
            </h2>
            <ul className="mt-3 grid gap-2.5">
              {PENGUMUMAN.filter((p) => p.penting).map((p) => (
                <li key={p.id} className="text-sm font-semibold text-accent-foreground/90">
                  {p.judul}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
