import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Gamepad2, Sprout, Store, User, WifiOff } from "lucide-react";
import { useAuth } from "@/lib/auth-store";

const MENU = [
  { to: "/belajar", label: "Belajar", icon: BookOpen },
  { to: "/belajar/game", label: "Game", icon: Gamepad2 },
  { to: "/belajar/pohon", label: "Pohon", icon: Sprout },
  { to: "/toko", label: "Toko", icon: Store },
  { to: "/profil", label: "Profil", icon: User },
] as const;

/** Penanda saat perangkat kehilangan sinyal. */
export function PenandaOffline() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const perbarui = () => setOffline(!navigator.onLine);
    perbarui();
    window.addEventListener("online", perbarui);
    window.addEventListener("offline", perbarui);
    return () => {
      window.removeEventListener("online", perbarui);
      window.removeEventListener("offline", perbarui);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-xs font-extrabold text-destructive-foreground">
      <WifiOff className="h-4 w-4" /> Kamu sedang offline — halaman yang pernah dibuka tetap bisa
      dibaca.
    </div>
  );
}

/** Navigasi bawah ala aplikasi HP, hanya untuk siswa di layar kecil. */
export function NavigasiBawah() {
  const { pengguna } = useAuth();
  if (!pengguna || pengguna.peran !== "siswa") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {MENU.map((m) => (
          <li key={m.to}>
            <Link
              to={m.to}
              activeOptions={{ exact: m.to === "/belajar" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-extrabold text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <m.icon className="h-5 w-5" />
              {m.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
