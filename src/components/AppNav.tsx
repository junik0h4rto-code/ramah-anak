import { Link } from "@tanstack/react-router";
import { useSekolah } from "@/lib/sekolah-store";

const LINKS = [
  { to: "/", label: "Beranda", emoji: "🏠" },
  { to: "/belajar", label: "Belajar", emoji: "📖" },
  { to: "/kuis", label: "Kuis", emoji: "🧩" },
  { to: "/mood", label: "Mood", emoji: "🌤️" },
  { to: "/penghargaan", label: "Bintangku", emoji: "🏅" },
] as const;

export function AppNav() {
  const { bintang, nama } = useSekolah();

  return (
    <header className="sticky top-0 z-30 border-b-4 border-primary/15 bg-card/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl font-extrabold text-primary">
          🎈 Sekolah Gembira
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-2 sm:order-2 sm:w-auto">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="pop rounded-full px-3 py-1.5 text-sm font-bold text-foreground/70 hover:bg-secondary"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
            >
              <span aria-hidden>{l.emoji}</span> {l.label}
            </Link>
          ))}
        </nav>
        <div className="order-2 ml-auto flex items-center gap-2 rounded-full bg-sunny px-3 py-1.5 text-sm font-extrabold text-sunny-foreground sm:order-3">
          ⭐ {bintang}
          {nama ? <span className="hidden font-bold sm:inline">· {nama}</span> : null}
        </div>
      </div>
    </header>
  );
}
