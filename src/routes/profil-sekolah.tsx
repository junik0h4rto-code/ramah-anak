import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Building2,
  FlaskConical,
  GraduationCap,
  Library,
  Mail,
  MapPin,
  Phone,
  School,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/profil-sekolah")({
  head: () => ({
    meta: [
      { title: "Profil Sekolah - SMPN 26 Bandung" },
      {
        name: "description",
        content:
          "Mengenal SMPN 26 Bandung: sekolah negeri terakreditasi A di Sukajadi dengan 843 siswa, 36 guru, dan Kurikulum Merdeka.",
      },
      { property: "og:title", content: "Profil Sekolah - SMPN 26 Bandung" },
      {
        property: "og:description",
        content: "Sekilas tentang SMPN 26 Bandung: warga sekolah, fasilitas, dan cara belajar kami.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilSekolah,
});

const ANGKA = [
  { label: "Siswa", nilai: "843", ket: "432 putri · 411 putra", icon: Users },
  { label: "Guru", nilai: "36", ket: "sekitar 24 siswa per guru", icon: GraduationCap },
  { label: "Kelas", nilai: "27", ket: "rata-rata 32 siswa per kelas", icon: School },
  { label: "Laboratorium", nilai: "3", ket: "untuk praktik & eksperimen", icon: FlaskConical },
];

const FASILITAS = [
  { icon: Building2, teks: "Lahan sekolah seluas 3.500 m² dengan 27 ruang kelas yang seluruhnya layak pakai." },
  { icon: Library, teks: "Satu perpustakaan sebagai pusat membaca dan mencari referensi." },
  { icon: Wifi, teks: "Internet broadband untuk mendukung pembelajaran digital." },
  { icon: Zap, teks: "Listrik PLN berdaya 7.700 VA menunjang kegiatan belajar." },
];

function ProfilSekolah() {
  return (
    <div>
      <section className="bg-gradient-navy text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-accent-foreground">
            <Award className="h-4 w-4" /> Terakreditasi A
          </span>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Mengenal SMPN 26 Bandung</h1>
          <p className="mt-4 max-w-2xl leading-relaxed opacity-85">
            Kami adalah sekolah menengah pertama negeri yang berada di kawasan Sukajadi, Kota
            Bandung. Dengan akreditasi A, sekolah kami menjadi rumah belajar bagi ratusan remaja
            yang tumbuh bersama guru-guru berpengalaman dalam suasana yang hangat dan ramah.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-extrabold">Warga Sekolah dalam Angka</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ANGKA.map((a) => (
            <div key={a.label} className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <a.icon className="h-6 w-6 text-primary" />
              <p className="mt-3 font-display text-3xl font-extrabold">{a.nilai}</p>
              <p className="font-bold">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.ket}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <BookOpen className="h-5 w-5 text-accent" /> Cara Kami Belajar
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Pembelajaran mengikuti Kurikulum Merdeka dan berlangsung pada pagi hari, lima hari
            dalam sepekan. Hampir seluruh guru kami telah memenuhi kualifikasi akademik (97%) dan
            bersertifikat pendidik (94%), sehingga siswa dibimbing oleh tenaga pengajar yang
            kompeten.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Building2 className="h-5 w-5 text-accent" /> Fasilitas Pendukung
          </h2>
          <ul className="mt-3 grid gap-3">
            {FASILITAS.map((f) => (
              <li key={f.teks} className="flex gap-3 text-sm text-muted-foreground">
                <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {f.teks}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-3xl bg-accent-soft p-6">
          <h2 className="text-xl font-extrabold text-accent-foreground">Identitas & Kontak</h2>
          <div className="mt-4 grid gap-3 text-sm text-accent-foreground sm:grid-cols-2">
            <p className="flex gap-2"><School className="h-4 w-4 shrink-0" /> NPSN 20219408 · Sekolah Negeri</p>
            <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" /> Jl. Sarimanah Blok 23, Sukajadi, Kota Bandung, Jawa Barat</p>
            <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /> (022) 2012277</p>
            <p className="flex gap-2"><Mail className="h-4 w-4 shrink-0" /> smpn26bandung@gmail.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}
