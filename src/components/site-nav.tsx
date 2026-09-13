import { Link, useNavigate } from "@tanstack/react-router";
import { embedPeta } from "@/lib/gambar";

import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Gamepad2,
  Gift,
  Home,
  Megaphone,
  Menu,
  Newspaper,
  ShieldCheck,
  LogIn,
  LogOut,
  UserRound,
  X,
} from "lucide-react";
import { CoinBadge } from "./coin-badge";
import { LogoSekolah } from "./logo-sekolah";
import { useAuth, type Peran } from "@/lib/auth-store";
import { usePengaturanSekolah } from "@/lib/pengaturan-store";

type Item = { to: string; label: string; icon: typeof Home };
type Grup = { label: string; items: Item[]; peran?: Peran };

const SEMUA_GRUP: Grup[] = [
  {
    label: "Informasi Sekolah",
    items: [
      { to: "/", label: "Beranda", icon: Home },
      { to: "/berita", label: "Berita", icon: Newspaper },
      { to: "/pengumuman", label: "Pengumuman", icon: Megaphone },
      { to: "/kalender", label: "Kalender Agenda", icon: CalendarDays },
    ],
  },
  {
    label: "Ruang Belajar",
    peran: "siswa",
    items: [
      { to: "/belajar", label: "Ruang Belajar", icon: BookOpen },
      { to: "/belajar/game", label: "Pusat Game", icon: Gamepad2 },
      { to: "/toko", label: "Toko Reward", icon: Gift },
      { to: "/profil", label: "Profil Saya", icon: UserRound },
    ],
  },
  {
    label: "Area Guru",
    peran: "guru",
    items: [{ to: "/guru", label: "Panel Guru", icon: ShieldCheck }],
  },
];

function grupUntuk(peran: Peran | null, isEducator: boolean): Grup[] {
  return SEMUA_GRUP.filter((g) => {
    if (!g.peran) return true;
    // Super admin fokus mengelola konten: area siswa disembunyikan.
    if (peran === "admin") return g.peran !== "siswa";
    if (g.peran === "guru") return isEducator;
    return g.peran === peran;
  });
}

export function SiteNav() {
  const [buka, setBuka] = useState(false);
  const { pengguna, siap, keluar, isEducator } = useAuth();
  const sekolah = usePengaturanSekolah();
  const navigate = useNavigate();
  const grup = grupUntuk(pengguna?.peran ?? null, isEducator);

  async function handleKeluar() {
    await keluar();
    setBuka(false);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-navy text-primary-foreground shadow-card">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setBuka(false)}>
          <LogoSekolah className="h-10 w-10" />
          <span className="leading-tight">
            <span className="block font-display text-base font-extrabold">{sekolah.nama_sekolah}</span>
            {sekolah.tagline && (
              <span className="block text-[11px] font-semibold opacity-75">{sekolah.tagline}</span>
            )}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {grup.flatMap((g) =>
            g.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" || item.to === "/belajar" }}
                className="rounded-full px-3 py-2 text-sm font-bold text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
              >
                {item.label}
              </Link>
            )),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {pengguna?.peran === "siswa" && <CoinBadge />}
          {siap && pengguna ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-bold">
                <UserRound className="h-4 w-4" />
                <span className="max-w-[9rem] truncate">{pengguna.nama}</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold uppercase text-accent-foreground">
                  {pengguna.peran}
                </span>
              </span>
              <button
                type="button"
                onClick={handleKeluar}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-extrabold hover:bg-primary-foreground/20"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground"
            >
              <LogIn className="h-4 w-4" /> Masuk
            </Link>
          )}
          <button
            type="button"
            aria-label="Buka menu"
            onClick={() => setBuka((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-primary-foreground/10 lg:hidden"
          >
            {buka ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {buka && (
        <div className="border-t border-primary-foreground/15 bg-primary/95 px-4 pb-5 pt-3 lg:hidden">
          {grup.map((g) => (
            <div key={g.label} className="mb-3">
              <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider opacity-60">
                {g.label}
              </p>
              <div className="grid gap-1">
                {g.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setBuka(false)}
                    activeOptions={{ exact: item.to === "/" || item.to === "/belajar" }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-primary-foreground/85 data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {siap && pengguna ? (
            <button
              type="button"
              onClick={handleKeluar}
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl bg-primary-foreground/10 px-3 py-2.5 text-sm font-extrabold"
            >
              <LogOut className="h-4 w-4" /> Keluar ({pengguna.nama})
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setBuka(false)}
              className="mt-1 flex items-center gap-2.5 rounded-xl bg-accent px-3 py-2.5 text-sm font-extrabold text-accent-foreground"
            >
              <LogIn className="h-4 w-4" /> Masuk
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const sekolah = usePengaturanSekolah();
  const tautanSosial = [
    { label: "Instagram", href: sekolah.instagram },
    { label: "Facebook", href: sekolah.facebook },
    { label: "YouTube", href: sekolah.youtube },
    { label: "TikTok", href: sekolah.tiktok },
    {
      label: "WhatsApp",
      href: sekolah.whatsapp
        ? `https://wa.me/${sekolah.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}`
        : "",
    },
  ].filter((s) => s.href);
  return (
    <footer className="mt-16 bg-gradient-navy text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <LogoSekolah className="h-12 w-12" />
            <p className="font-display text-lg font-extrabold">{sekolah.nama_sekolah}</p>
          </div>
          <p className="mt-3 text-sm opacity-75">
            {[sekolah.alamat, sekolah.telepon].filter(Boolean).join(" - ")}
          </p>
          {sekolah.email && <p className="text-sm opacity-75">{sekolah.email}</p>}
        </div>
        <div className="text-sm">
          <p className="font-bold">Identitas & Kontak</p>
          <div className="mt-2 grid gap-1 opacity-75">
            {sekolah.npsn && <span>NPSN: {sekolah.npsn}</span>}
            {sekolah.akreditasi && <span>Akreditasi: {sekolah.akreditasi}</span>}
            {sekolah.kepala_sekolah && <span>Kepala Sekolah: {sekolah.kepala_sekolah}</span>}
            <span>Senin-Jumat 07.00-15.00 WIB</span>
          </div>
          {tautanSosial.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tautanSosial.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-extrabold"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
          <div className="text-sm">
            <p className="font-bold">Tautan Cepat</p>
            <div className="mt-2 grid gap-1 opacity-80">
              <Link to="/berita">Berita Sekolah</Link>
              <Link to="/belajar">Ruang Belajar</Link>
              <Link to="/belajar/game">Pusat Game</Link>
              <a
                href="https://sekolah.data.kemendikdasmen.go.id/profil-sekolah/208B1F06-2DF5-E011-9D07-BB8A37B0B6F3"
                target="_blank"
                rel="noreferrer"
              >
                Profil Sekolah
              </a>
            </div>
          {sekolah.latitude != null && sekolah.longitude != null && (
            <a
              href={`https://www.google.com/maps?q=${sekolah.latitude},${sekolah.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5 text-xs font-extrabold hover:bg-primary-foreground/20"
            >
              Lihat Peta di Google Maps
            </a>
          )}
        </div>
      </div>
      <p className="border-t border-primary-foreground/15 py-4 text-center text-xs opacity-60">
        (c) 2026 {sekolah.nama_sekolah}. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
}
