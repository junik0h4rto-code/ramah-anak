import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk Akun - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Masuk ke portal SMPN 26 BANDUNG sebagai siswa untuk Ruang Belajar dan Toko Reward, atau sebagai guru/admin untuk Panel Guru.",
      },
      { property: "og:title", content: "Masuk Akun - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Login berbasis peran: akun siswa, guru, dan admin SMPN 26 BANDUNG.",
      },
    ],
  }),
  component: HalamanAuth,
});


function HalamanAuth() {
  const { masuk, pengguna, siap } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);

  useEffect(() => {
    if (siap && pengguna) {
      navigate({
        to: pengguna.peran === "siswa" ? "/belajar" : "/guru",
        replace: true,
      });
    }
  }, [siap, pengguna, navigate]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setGalat("");
    const hasil = await masuk(email, password);
    setMemuat(false);
    if (!hasil.ok) {
      setGalat(hasil.pesan ?? "Gagal masuk.");
      return;
    }
    toast.success("Berhasil masuk");
    navigate({
      to: hasil.peran === "siswa" ? "/belajar" : "/guru",
      replace: true,
    });
  }

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-accent";
  const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 lg:grid-cols-2">
      <section className="rounded-3xl border border-border bg-card p-7 shadow-card">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <GraduationCap className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Masuk Portal Sekolah</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Masukkan email dan password akun sekolahmu. Siswa akan diarahkan ke Dasbor Belajar, guru ke Panel Guru.
        </p>

        <form onSubmit={kirim} className="mt-6 grid gap-4">
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={inputClass}
            />
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
            <LogIn className="h-4 w-4" /> {memuat ? "Memuat..." : "Masuk"}
          </button>

          <div className="rounded-2xl border border-dashed border-border p-4 text-center">
            <p className="text-xs font-semibold text-muted-foreground">Belum punya akun sekolah?</p>
            <Link
              to="/daftar"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-extrabold hover:border-accent"
            >
              <UserPlus className="h-4 w-4" /> Daftar Akun Baru
            </Link>
          </div>
        </form>
      </section>

      <section className="grid content-start gap-4">
        <h2 className="font-display text-xl font-extrabold">Satu Akun, Dua Peran</h2>
        <article className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="font-display text-lg font-extrabold">Siswa</p>
          </div>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Masuk dengan email & password yang terdaftar untuk membuka Dasbor Belajar, Pusat Game, dan Toko Reward.
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="font-display text-lg font-extrabold">Guru / Admin</p>
          </div>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Masuk dengan akun pendidik untuk membuka Panel Guru: kelola nilai, modul belajar, dan Poin Bonus.
          </p>
        </article>
        <p className="rounded-2xl border border-dashed border-border p-4 text-xs font-semibold text-muted-foreground">
          Lupa password atau akun belum terdaftar? Hubungi admin sekolah untuk dibuatkan atau direset.
        </p>
      </section>
    </div>
  );
}
