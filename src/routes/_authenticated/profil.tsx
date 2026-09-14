import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  Award,
  BookOpenCheck,
  Coins,
  Crown,
  Gift,
  Medal,
  Ticket,
  Trophy,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { getLeaderboard } from "@/lib/profil.functions";
import { RoleGate } from "@/components/role-gate";
import { cn } from "@/lib/utils";
import { usePengaturanSekolah } from "@/lib/pengaturan-store";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Profil Siswa — SMPN 26 BANDUNG" },
      { name: "description", content: "Dashboard profil siswa: saldo poin, lencana, modul selesai, riwayat penukaran hadiah, dan leaderboard." },
      { property: "og:title", content: "Profil Siswa — SMPN 26 BANDUNG" },
      { property: "og:description", content: "Pantau progres belajar, koin, lencana, dan peringkatmu." },
    ],
  }),
  component: () => (
    <RoleGate peran="siswa">
      <ProfilPage />
    </RoleGate>
  ),
});

function dasborQuery(userId: string) {
  return queryOptions({
    queryKey: ["profil-siswa", userId],
    queryFn: async () => {
      const [profil, lencana, selesai, penukaran] = await Promise.all([
        supabase.from("profiles").select("nama, kelas, koin").eq("id", userId).maybeSingle(),
        supabase.from("lencana_siswa").select("id, kode, nama, jumlah").eq("user_id", userId),
        supabase
          .from("modul_selesai")
          .select("id, koin_didapat, selesai_pada, modul:modul_id (judul, mapel)")
          .eq("user_id", userId)
          .order("selesai_pada", { ascending: false }),
        supabase
          .from("penukaran_hadiah")
          .select("id, jumlah_koin, status, ditukar_pada, kode_voucher, hadiah:hadiah_id (nama)")
          .eq("user_id", userId)
          .order("ditukar_pada", { ascending: false }),
      ]);
      return {
        profil: profil.data,
        lencana: lencana.data ?? [],
        selesai: selesai.data ?? [],
        penukaran: penukaran.data ?? [],
      };
    },
  });
}

const leaderboardQuery = queryOptions({
  queryKey: ["leaderboard-siswa"],
  queryFn: () => getLeaderboard(),
});

const STATUS_LABEL: Record<string, string> = {
  diproses: "Diproses",
  siap_diambil: "Siap Diambil",
  selesai: "Selesai",
};

function ProfilPage() {
  const { pengguna } = useAuth();
  const sekolah = usePengaturanSekolah();
  const userId = pengguna!.id;
  const { data } = useSuspenseQuery(dasborQuery(userId));
  const { data: leaderboard } = useSuspenseQuery(leaderboardQuery);

  const profil = data.profil;
  const totalKoinModul = data.selesai.reduce((a, b) => a + b.koin_didapat, 0);
  const peringkat = leaderboard.findIndex((r) => r.nama === profil?.nama);

  return (
    <div className="bg-muted/40 pb-16">
      {/* Header profil */}
      <div className="bg-gradient-play">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-8">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-card shadow-card">
            <UserRound className="h-8 w-8 text-primary" />
          </span>
          <div className="mr-auto">
            <h1 className="font-display text-2xl font-extrabold text-accent-foreground">
              {profil?.nama ?? pengguna?.nama}
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Siswa{profil?.kelas ? ` • Kelas ${profil.kelas}` : ""} • {sekolah.nama_sekolah}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card px-5 py-3 shadow-card">
            <Coins className="h-6 w-6 text-coin-foreground" />
            <span className="font-display text-2xl font-extrabold tabular-nums text-accent-foreground">
              {(profil?.koin ?? 0).toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-muted-foreground">Poin</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Kartu statistik */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Coins} label="Saldo Poin" nilai={(profil?.koin ?? 0).toLocaleString("id-ID")} />
          <StatCard icon={BookOpenCheck} label="Modul Selesai" nilai={String(data.selesai.length)} />
          <StatCard icon={Award} label="Lencana" nilai={String(data.lencana.length)} />
          <StatCard
            icon={Trophy}
            label="Peringkat"
            nilai={peringkat >= 0 ? `#${peringkat + 1}` : "—"}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Kolom kiri */}
          <div className="grid gap-6 lg:col-span-2">
            {/* Lencana */}
            <section className="rounded-2xl bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                <Award className="h-5 w-5 text-accent" /> Lencana Saya
              </h2>
              {data.lencana.length === 0 ? (
                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  Belum ada lencana. Menangkan lencana dari Roda Inspirasi Kebaikan di Pusat Game!
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.lencana.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-3 rounded-xl bg-accent-soft px-4 py-3"
                    >
                      <Medal className="h-8 w-8 text-accent" />
                      <div>
                        <p className="text-sm font-extrabold">{l.nama}</p>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {l.jumlah > 1 ? `x${l.jumlah}` : l.kode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Modul selesai */}
            <section className="rounded-2xl bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                <BookOpenCheck className="h-5 w-5 text-primary" /> Modul Selesai
              </h2>
              {data.selesai.length === 0 ? (
                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  Belum ada modul yang diselesaikan.{" "}
                  <Link to="/belajar" className="font-extrabold text-primary underline">
                    Mulai belajar
                  </Link>
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {data.selesai.map((m) => {
                    const modul = (m as unknown as { modul: { judul: string; mapel: string | null } | null }).modul;
                    return (
                      <li key={m.id} className="flex items-center gap-3 py-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                          <BookOpenCheck className="h-4 w-4 text-primary" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold">{modul?.judul ?? "Modul"}</p>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {modul?.mapel ?? "Umum"} •{" "}
                            {new Date(m.selesai_pada).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-coin px-2.5 py-1 text-xs font-extrabold text-coin-foreground">
                          +{m.koin_didapat}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {data.selesai.length > 0 && (
                <p className="mt-3 text-xs font-bold text-muted-foreground">
                  Total poin dari modul: {totalKoinModul.toLocaleString("id-ID")}
                </p>
              )}
            </section>

            {/* Riwayat penukaran */}
            <section className="rounded-2xl bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                <Gift className="h-5 w-5 text-accent" /> Riwayat Penukaran Hadiah
              </h2>
              {data.penukaran.length === 0 ? (
                <p className="mt-3 text-sm font-semibold text-muted-foreground">
                  Belum ada penukaran.{" "}
                  <Link to="/toko" className="font-extrabold text-primary underline">
                    Lihat Toko Reward
                  </Link>
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {data.penukaran.map((p) => {
                    const hadiah = (p as unknown as { hadiah: { nama: string } | null }).hadiah;
                    return (
                      <li key={p.id} className="flex items-center gap-3 py-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft">
                          <Ticket className="h-4 w-4 text-accent" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold">{hadiah?.nama ?? "Hadiah"}</p>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {new Date(p.ditukar_pada).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {p.kode_voucher ? ` • Kode: ${p.kode_voucher}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-extrabold text-destructive">
                          -{p.jumlah_koin.toLocaleString("id-ID")}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                            p.status === "selesai"
                              ? "bg-primary/10 text-primary"
                              : p.status === "siap_diambil"
                                ? "bg-coin text-coin-foreground"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Leaderboard */}
          <aside id="leaderboard" className="h-fit scroll-mt-24 rounded-2xl bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
              <Trophy className="h-5 w-5 text-coin-foreground" /> Leaderboard
            </h2>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              10 siswa dengan poin terbanyak
            </p>
            <ul className="mt-4 grid gap-2">
              {leaderboard.map((r, i) => {
                const adalahSaya = r.nama === profil?.nama;
                return (
                  <li
                    key={`${r.nama}-${i}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5",
                      adalahSaya ? "bg-accent-soft ring-2 ring-accent" : "bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold",
                        i === 0
                          ? "bg-coin text-coin-foreground"
                          : i < 3
                            ? "bg-accent text-accent-foreground"
                            : "bg-card text-muted-foreground",
                      )}
                    >
                      {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">
                        {r.nama}
                        {adalahSaya && <span className="ml-1 text-xs text-accent">(Kamu)</span>}
                      </p>
                      {r.kelas && (
                        <p className="text-[11px] font-semibold text-muted-foreground">Kelas {r.kelas}</p>
                      )}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold tabular-nums text-coin-foreground">
                      <Coins className="h-3.5 w-3.5" />
                      {r.koin.toLocaleString("id-ID")}
                    </span>
                  </li>
                );
              })}
              {leaderboard.length === 0 && (
                <li className="text-sm font-semibold text-muted-foreground">Belum ada data peringkat.</li>
              )}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  nilai,
}: {
  icon: typeof Coins;
  label: string;
  nilai: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft">
        <Icon className="h-5 w-5 text-accent" />
      </span>
      <div>
        <p className="font-display text-xl font-extrabold tabular-nums">{nilai}</p>
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
