import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/atur-sandi")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Buat Kata Sandi Baru - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Buat kata sandi baru untuk akun portal SMPN 26 BANDUNG setelah membuka tautan reset dari email sekolah.",
      },
      { property: "og:title", content: "Buat Kata Sandi Baru - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Selesaikan proses atur ulang kata sandi akun portal sekolah.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HalamanAturSandi,
});

function HalamanAturSandi() {
  const navigate = useNavigate();
  const [sandi, setSandi] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [galat, setGalat] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [sesiSiap, setSesiSiap] = useState(false);

  useEffect(() => {
    let aktif = true;
    supabase.auth.getSession().then(({ data }) => {
      if (aktif) setSesiSiap(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (aktif && session) setSesiSiap(true);
    });
    return () => {
      aktif = false;
      subscription.unsubscribe();
    };
  }, []);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    if (sandi.length < 6) {
      setGalat("Kata sandi minimal 6 karakter.");
      return;
    }
    if (sandi !== ulangi) {
      setGalat("Ulangi kata sandi belum sama.");
      return;
    }
    setMemuat(true);
    const { error } = await supabase.auth.updateUser({ password: sandi });
    setMemuat(false);
    if (error) {
      setGalat(error.message);
      return;
    }
    toast.success("Kata sandi berhasil diperbarui");
    navigate({ to: "/auth", replace: true });
  }

  const inputClass =
    "mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-accent";
  const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <section className="rounded-3xl border border-border bg-card p-7 shadow-card">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Buat Kata Sandi Baru</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Masukkan kata sandi baru untuk akunmu, lalu gunakan kata sandi ini saat masuk berikutnya.
        </p>

        {!sesiSiap && (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-4 text-xs font-semibold text-muted-foreground">
            Halaman ini hanya bisa dipakai dari tautan reset di email. Jika tautan sudah kedaluwarsa,{" "}
            <Link to="/lupa-sandi" className="font-extrabold text-primary underline">
              minta tautan baru
            </Link>
            .
          </p>
        )}

        <form onSubmit={kirim} className="mt-6 grid gap-4">
          <div>
            <label className={labelClass} htmlFor="sandi">
              Kata Sandi Baru
            </label>
            <input
              id="sandi"
              type="password"
              autoComplete="new-password"
              value={sandi}
              onChange={(e) => setSandi(e.target.value)}
              placeholder="Minimal 6 karakter"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ulangi">
              Ulangi Kata Sandi
            </label>
            <input
              id="ulangi"
              type="password"
              autoComplete="new-password"
              value={ulangi}
              onChange={(e) => setUlangi(e.target.value)}
              placeholder="Tulis ulang kata sandi baru"
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
            disabled={memuat || !sesiSiap}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
          >
            <LockKeyhole className="h-4 w-4" /> {memuat ? "Menyimpan..." : "Simpan Kata Sandi"}
          </button>
        </form>
      </section>
    </div>
  );
}
