import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/lupa-sandi")({
  head: () => ({
    meta: [
      { title: "Lupa Kata Sandi - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Atur ulang kata sandi akun siswa, guru, atau admin SMPN 26 BANDUNG melalui tautan reset yang dikirim ke email terdaftar.",
      },
      { property: "og:title", content: "Lupa Kata Sandi - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Kirim tautan reset kata sandi ke email sekolah yang terdaftar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HalamanLupaSandi,
});

function HalamanLupaSandi() {
  const [email, setEmail] = useState("");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [terkirim, setTerkirim] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    const cek = z.string().trim().email().max(255).safeParse(email);
    if (!cek.success) {
      setGalat("Masukkan email yang valid.");
      return;
    }
    setMemuat(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cek.data.toLowerCase(), {
      redirectTo: `${window.location.origin}/atur-sandi`,
    });
    setMemuat(false);
    if (error) {
      setGalat(error.message);
      return;
    }
    setTerkirim(true);
  }

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-accent";
  const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

  if (terkirim) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
          <MailCheck className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Tautan Reset Terkirim</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Kami mengirim tautan atur ulang kata sandi ke <span className="text-primary">{email}</span>.
          Buka email tersebut, klik tautannya, lalu buat kata sandi baru.
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
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Lupa Kata Sandi</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Masukkan email akun sekolahmu. Kami akan mengirim tautan untuk membuat kata sandi baru.
        </p>

        <form onSubmit={kirim} className="mt-6 grid gap-4">
          <div>
            <label className={labelClass} htmlFor="email">
              Email Terdaftar
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
            <KeyRound className="h-4 w-4" /> {memuat ? "Mengirim..." : "Kirim Tautan Reset"}
          </button>

          <p className="text-center text-xs font-semibold text-muted-foreground">
            Ingat kata sandimu?{" "}
            <Link to="/auth" className="font-extrabold text-primary underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
