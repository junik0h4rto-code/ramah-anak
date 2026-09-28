import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { listModul } from "@/lib/modul.functions";
import { listTesFormatif } from "@/lib/tes-formatif.functions";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Megaphone,
  Monitor,
  Sparkles,
  ClipboardCheck,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/asesmen")({
  head: () => ({
    meta: [
      { title: "Portal Asesmen Digital - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Panduan login dan tata cara ujian CBT resmi SMP Negeri 26 Bandung.",
      },
      { property: "og:title", content: "Portal Asesmen Digital - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content:
          "Panduan login dan tata cara ujian CBT resmi SMP Negeri 26 Bandung.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HalamanAsesmen,
});

function HalamanAsesmen() {
  const [tab, setTab] = useState<"cbt" | "formatif" | "ujian">("cbt");
  return (
    <div className="flex min-h-screen flex-col">
      <section className="bg-gradient-navy text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/12 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide">
            <Sparkles className="h-4 w-4" /> Ujian Resmi Sekolah
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            🎯 Portal Asesmen Digital SMPN 26 Bandung 🎯
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed opacity-85 sm:text-lg">
            Selamat datang di Portal Ujian Resmi SMP Negeri 26 Bandung.
            Persiapkan diri Anda dengan baik, tetap jujur, dan percayalah pada
            kemampuan diri sendiri! ✨
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-14">
        <div className="mb-8 grid grid-cols-3 gap-1 rounded-full border border-border bg-card p-1 shadow-card" role="tablist">
          {([
            ["cbt", "Ujian CBT"],
            ["formatif", "Tes Formatif"],
            ["ujian", "Materi Ujian"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-3 py-2.5 text-xs font-extrabold transition-colors sm:text-sm ${
                tab === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "formatif" && <TesFormatif />}
        {tab === "ujian" && <MateriUjian />}
        {tab === "cbt" && (<>
        <article className="space-y-10">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl">
              <Megaphone className="h-6 w-6 shrink-0 text-accent" />
              📢 Pengumuman Penting
            </h2>
            <ul className="mt-5 grid gap-4">
              <li className="flex gap-3 rounded-2xl bg-accent-soft p-4 text-accent-foreground">
                <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Jadwal Ujian</p>
                  <p className="mt-1 text-sm opacity-90">
                    Pastikan Anda masuk sesuai dengan sesi dan jadwal yang telah
                    ditentukan oleh panitia ujian.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 rounded-2xl bg-primary-soft p-4 text-primary">
                <Monitor className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Perangkat</p>
                  <p className="mt-1 text-sm opacity-90">
                    Gunakan perangkat (Laptop/Chromebook/Smartphone) yang baterainya
                    sudah terisi penuh atau bawa pengisi daya (charger) cadangan.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl">
              <BookOpen className="h-6 w-6 shrink-0 text-primary" />
              📑 Panduan Tata Cara Login Ujian
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Silakan ikuti langkah-langkah berikut sebelum memulai ujian:
            </p>
            <ol className="mt-6 grid gap-5">
              {[
                {
                  title: "Siapkan Kartu Peserta",
                  body: "Pastikan Kartu Login Ujian Anda sudah siap di meja. Harap periksa kembali agar kartu tidak tertukar dengan milik teman.",
                },
                {
                  title: "Gunakan Username & Password Resmi",
                  body: "Masukkan Username dan Password sesuai dengan yang tertera pada kartu ujian Anda. Perhatikan dengan teliti penggunaan huruf besar, huruf kecil, dan angka.",
                },
                {
                  title: "Klik Tombol Masuk & Mulai",
                  body: 'Setelah berhasil masuk, periksa kembali kesesuaian data diri Anda yang muncul di layar, lalu klik tombol "Mulai Ujian" untuk mulai mengerjakan soal.',
                },
              ].map((item, i) => (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-border bg-background p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-destructive sm:text-2xl">
              <AlertCircle className="h-6 w-6 shrink-0" />
              🚨 Tips Selama Ujian
            </h2>
            <ul className="mt-5 grid gap-4">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm leading-relaxed text-foreground">
                  Aplikasi Extraordinary CBT sekolah kita sudah dilengkapi sistem
                  pengaman otomatis. Jika terjadi kendala teknis di tengah ujian,
                  jawaban Anda tidak akan hilang! Tetap tenang dan segera lapor ke
                  Pengawas atau Teknisi ruangan untuk dibantu.
                </p>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm leading-relaxed text-foreground">
                  Jangan mencoba membuka tab browser lain, menutup halaman, atau
                  mencari jawaban di internet selama ujian berlangsung karena sistem
                  dapat mendeteksi aktivitas tersebut sebagai pelanggaran.
                </p>
              </li>
            </ul>
          </section>
        </article>

        <div className="mt-14 text-center">
          <p className="text-base font-bold text-foreground">
            👇 Siap memulai? Klik tombol di bawah ini 👇
          </p>
          <a
            href="https://smpn26bdg.online"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-extrabold text-accent-foreground shadow-pop transition-transform hover:-translate-y-0.5 sm:text-lg"
          >
            Masuk Portal Utama CBT
            <ExternalLink className="h-5 w-5" />
          </a>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <ArrowRight className="h-4 w-4 rotate-180" /> Kembali ke Beranda
            </Link>
          </div>
        </div>
        </>)}
      </main>
    </div>
  );
}

function CalendarIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function TesFormatif() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["tes-formatif"],
    queryFn: () => listTesFormatif(),
  });
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
        <ClipboardCheck className="h-6 w-6 shrink-0 text-accent" /> Tes Formatif
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tes singkat dari guru untuk mengukur pemahamanmu. Klik tombol untuk membuka tes di tab baru.
      </p>
      {isLoading && <p className="mt-5 text-sm text-muted-foreground">Memuat...</p>}
      {!isLoading && data.length === 0 && (
        <p className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center text-sm font-semibold text-muted-foreground">
          Belum ada tes formatif dari guru.
        </p>
      )}
      <ul className="mt-5 grid gap-4">
        {data.map((t) => (
          <li key={t.id} className="rounded-2xl border border-border bg-background p-4">
            <p className="font-bold">{t.judul}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {[t.mapel, t.kelas_target].filter(Boolean).join(" · ") || "Semua kelas"}
            </p>
            {t.keterangan && <p className="mt-2 text-sm text-muted-foreground">{t.keterangan}</p>}
            <a
              href={t.tautan}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-accent-foreground shadow-pop"
            >
              Kerjakan Tes <ExternalLink className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MateriUjian() {
  const { pengguna, siap } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["modul"],
    queryFn: () => listModul(),
    enabled: !!pengguna,
  });
  const ujian = data.filter((m) => (m.kategori ?? "").toLowerCase() === "ujian");
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
        <FileText className="h-6 w-6 shrink-0 text-primary" /> Materi Ujian
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">Konten ujian yang disiapkan guru untuk kelasmu.</p>
      {siap && !pengguna ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground">Masuk akun untuk melihat materi ujian.</p>
          <Link to="/auth" className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-extrabold text-primary-foreground">
            Masuk
          </Link>
        </div>
      ) : isLoading || !siap ? (
        <p className="mt-5 text-sm text-muted-foreground">Memuat...</p>
      ) : ujian.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center text-sm font-semibold text-muted-foreground">
          Belum ada materi ujian.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {ujian.map((m) => (
            <li key={m.id}>
              <Link
                to="/belajar/$modulId"
                params={{ modulId: m.id }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4 hover:border-primary"
              >
                <span>
                  <span className="block font-bold">{m.judul}</span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {m.mapel || "Umum"} · {m.kelas || "Semua kelas"}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
