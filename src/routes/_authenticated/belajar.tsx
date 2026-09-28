import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Coins, Flame, Gamepad2, LayoutGrid, Sprout, Swords } from "lucide-react";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { RoleGate } from "@/components/role-gate";

export const Route = createFileRoute("/_authenticated/belajar")({
  component: () => (
    <RoleGate peran="siswa">
      <BelajarLayout />
    </RoleGate>
  ),
});

function BelajarLayout() {
  const { koin, modulSelesai } = useGamifikasi();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const halamanGame = /^\/belajar\/(game|petualangan|pohon|kuis)(\/|$)/.test(pathname);

  return (
    <div className="bg-muted/40">
      <div className="bg-gradient-play">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-card">
              <Coins className="h-5 w-5 text-coin-foreground" />
              <span className="font-display text-lg font-extrabold tabular-nums text-accent-foreground">
                {koin.toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-bold text-muted-foreground">Poin Belajar</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-bold shadow-card">
              <Flame className="h-4 w-4 text-accent" />
              {modulSelesai.length} modul selesai
            </div>
          </div>



          <nav className="mt-5 flex flex-wrap gap-2">
            {!halamanGame && (
              <Link
                to="/belajar"
                activeOptions={{ exact: true }}
                className="inline-flex items-center gap-2 rounded-full bg-card/70 px-5 py-2.5 text-sm font-extrabold text-accent-foreground transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                <LayoutGrid className="h-4 w-4" /> Katalog Modul
              </Link>
            )}
            {halamanGame && (
              <>
                <Link
                  to="/belajar/game"
                  className="inline-flex items-center gap-2 rounded-full bg-card/70 px-5 py-2.5 text-sm font-extrabold text-accent-foreground transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
                >
                  <Gamepad2 className="h-4 w-4" /> Pusat Game
                </Link>
                <Link
                  to="/belajar/petualangan"
                  className="inline-flex items-center gap-2 rounded-full bg-card/70 px-5 py-2.5 text-sm font-extrabold text-accent-foreground transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
                >
                  <Swords className="h-4 w-4" /> Petualangan
                </Link>
                <Link
                  to="/belajar/pohon"
                  className="inline-flex items-center gap-2 rounded-full bg-card/70 px-5 py-2.5 text-sm font-extrabold text-accent-foreground transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
                >
                  <Sprout className="h-4 w-4" /> Pohon Kebaikan
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
