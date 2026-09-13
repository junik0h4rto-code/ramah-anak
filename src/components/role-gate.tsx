import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth, type Peran } from "@/lib/auth-store";

export function RoleGate({ peran, children }: { peran: Peran; children: ReactNode }) {
  const { pengguna, siap, isEducator } = useAuth();

  if (!siap) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm font-semibold text-muted-foreground">
        Memuat...
      </div>
    );
  }

  // Super admin punya akses penuh ke seluruh halaman.
  const bolehAkses =
    pengguna?.peran === "admin"
      ? true
      : peran === "guru"
        ? isEducator
        : pengguna?.peran === peran;

  if (!pengguna || !bolehAkses) {
    const judul = !pengguna ? "Silakan masuk terlebih dahulu" : "Halaman ini bukan untuk peranmu";
    const pesan = !pengguna
      ? `Halaman ini hanya dapat diakses oleh akun ${peran}. Gunakan akun yang terdaftar di halaman masuk.`
      : `Kamu masuk sebagai ${pengguna.peran}. Halaman ini khusus untuk akun ${peran}.`;

    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold">{judul}</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">{pesan}</p>
        <Link
          to="/auth"
          className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop"
        >
          Ke Halaman Masuk
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
