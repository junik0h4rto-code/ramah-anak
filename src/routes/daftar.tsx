import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { pastikanProfil } from "@/lib/profil.functions";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Pendaftaran Akun Baru - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Daftarkan akun siswa atau guru SMPN 26 BANDUNG untuk mengakses Ruang Belajar, Pusat Game, Toko Reward, dan Panel Guru.",
      },
      { property: "og:title", content: "Pendaftaran Akun Baru - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Buat akun siswa atau guru SMPN 26 BANDUNG dalam satu langkah mudah.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HalamanDaftar,
});

const skema = z.object({
  nama: z.string().trim().min(3, "Nama lengkap minimal 3 karakter").max(100, "Nama terlalu panjang"),
  email: z.string().trim().email("Email tidak valid").max(255, "Email terlalu panjang"),
  password: z.string().min(6, "Password minimal 6 karakter").max(72, "Password terlalu panjang"),
  peran: z.enum(["siswa", "guru"]),
});

function HalamanDaftar() {
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [peran, setPeran] = useState<"siswa" | "guru">("siswa");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [perluKonfirmasi, setPerluKonfirmasi] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");

    const hasil = skema.safeParse({ nama, email, password, peran });
    if (!hasil.success) {
      setGalat(hasil.error.issues[0]?.message ?? "Data belum lengkap.");
      return;
    }

    setMemuat(true);
    const { data, error } = await supabase.auth.signUp({
      email: hasil.data.email.toLowerCase(),
      password: hasil.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nama: hasil.data.nama, peran: hasil.data.peran },
      },
    });

    if (error) {
      setMemuat(false);
      setGalat(error.message);
      return;
    }

    if (!data.session) {
      // Fallback: langsung masuk bila sesi belum otomatis dibuat.
      const { error: errMasuk } = await supabase.auth.signInWithPassword({
        email: hasil.data.email.toLowerCase(),
        password: hasil.data.password,
      });
      if (errMasuk) {
        setMemuat(false);
        setPerluKonfirmasi(true);
        return;
      }
    }

    try {
      await pastikanProfil({ data: { nama: hasil.data.nama, peran: hasil.data.peran } });
    } catch {
      // Profil akan dilengkapi saat masuk berikutnya jika gagal
    }
    setMemuat(false);

    toast.success("Akun berhasil dibuat");
    navigate({ to: hasil.data.peran === "siswa" ? "/belajar" : "/guru", replace: true });
  }

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-accent";
  const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

  if (perluKonfirmasi) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
          <MailCheck className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Cek Email Kamu</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Kami mengirim tautan konfirmasi ke <span className="text-primary">{email}</span>. Klik tautan
          tersebut untuk mengaktifkan akun, lalu masuk ke portal sekolah.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop"
        >
          Ke Halaman Masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <section className="rounded-3xl border border-border bg-card p-7 shadow-card">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <UserPlus className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Pendaftaran Akun Baru</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Buat akun siswa atau guru SMPN 26 BANDUNG untuk mulai belajar dan mengumpulkan poin.
        </p>

        <form onSubmit={kirim} className="mt-6 grid gap-4">
          <div>
            <label className={labelClass} htmlFor="nama">
              Nama Lengkap
            </label>
            <input
              id="nama"
              value={nama}
              maxLength={100}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Siti Aminah"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">
              Email Sekolah
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@sekolah.sch.id"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter, bebas kombinasi"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="peran">
              Peran Akun
            </label>
            <select
              id="peran"
              value={peran}
              onChange={(e) => setPeran(e.target.value as "siswa" | "guru")}
              className={inputClass}
            >
              <option value="siswa">Siswa</option>
              <option value="guru">Guru</option>
            </select>
          </div>

          {galat && (
            <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive">
              {galat}
            </p>
          )}

          <button
            type="submit"
            disabled={memuat}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" /> {memuat ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>

          <p className="text-center text-xs font-semibold text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/auth" className="font-extrabold text-primary underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
