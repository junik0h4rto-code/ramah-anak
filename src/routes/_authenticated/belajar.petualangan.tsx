import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import {
  Coins,
  Copy,
  Heart,
  Loader2,
  LogIn,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { klaimKoinKuis } from "@/lib/kuis.functions";
import {
  buatLevel,
  kodeRoomBaru,
  soalUntukLevel,
  type Level,
  type SoalPetualangan,
} from "@/lib/game-petualangan-data";

export const Route = createFileRoute("/_authenticated/belajar/petualangan")({
  head: () => ({
    meta: [
      { title: "Petualangan Harta Karun - Game Edukasi Multiplayer SMP" },
      {
        name: "description",
        content:
          "Game petualangan pencarian harta karun untuk siswa SMP: kalahkan monster dengan menjawab teka-teki mata pelajaran, main bareng teman lewat Room Code.",
      },
      { property: "og:title", content: "Petualangan Harta Karun - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Jawab teka-teki pelajaran, kalahkan monster, dan temukan peti harta bersama teman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HalamanPetualangan,
});

type Pemain = { id: string; nama: string; kelas: string | null };

function HalamanPetualangan() {
  const [room, setRoom] = useState<string | null>(null);
  const [level, setLevel] = useState(1);

  if (!room) {
    return <Lobby onMulai={(kode) => setRoom(kode)} level={level} setLevel={setLevel} />;
  }
  return (
    <Petualangan
      kodeRoom={room}
      level={level}
      keluarRoom={() => setRoom(null)}
      naikLevel={() => setLevel((l) => l + 1)}
    />
  );
}

/* ----------------------------- Lobby Room ----------------------------- */

function Lobby({
  onMulai,
  level,
  setLevel,
}: {
  onMulai: (kode: string) => void;
  level: number;
  setLevel: (n: number) => void;
}) {
  const { pengguna } = useAuth();
  const { koin } = useGamifikasi();
  const [kode, setKode] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-3xl bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent)/0.35),transparent_60%)] p-1">
        <Card className="overflow-hidden border-2 border-primary/30 bg-card/95 shadow-pop">
          <CardHeader className="text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="mx-auto text-5xl"
            >
              🗺️
            </motion.div>
            <CardTitle className="font-display text-2xl font-extrabold sm:text-3xl">
              Petualangan Harta Karun
            </CardTitle>
            <p className="text-sm font-bold text-muted-foreground">
              Lewati rintangan, kalahkan monster, pecahkan teka-teki pelajaran, dan temukan peti
              harta di ujung level.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge className="gap-1.5 rounded-full bg-coin px-4 py-2 text-sm font-extrabold text-coin-foreground">
                <Coins className="h-4 w-4" /> Poin Global: {koin.toLocaleString("id-ID")}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-extrabold">
                Petualang: {pengguna?.nama ?? "Siswa"}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-dashed border-primary/40 p-4">
                <p className="font-display text-lg font-extrabold">Buat Room Baru</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  Kode akan dibuat otomatis, bagikan ke temanmu untuk mabar.
                </p>
                <Button
                  className="mt-3 w-full rounded-full font-extrabold"
                  onClick={() => onMulai(kodeRoomBaru())}
                >
                  <Swords className="mr-1 h-4 w-4" /> Mulai Petualangan
                </Button>
              </div>
              <div className="rounded-2xl border-2 border-dashed border-accent/50 p-4">
                <p className="font-display text-lg font-extrabold">Gabung Room Teman</p>
                <Input
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase().slice(0, 5))}
                  placeholder="KODE ROOM"
                  className="mt-2 text-center font-display text-lg font-extrabold tracking-[0.3em]"
                />
                <Button
                  variant="secondary"
                  className="mt-3 w-full rounded-full font-extrabold"
                  disabled={kode.length < 4}
                  onClick={() => onMulai(kode)}
                >
                  <LogIn className="mr-1 h-4 w-4" /> Gabung
                </Button>
              </div>
            </div>

            <div>
              <p className="text-center text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                Pilih Level Awal
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLevel(n)}
                    className={`h-10 w-10 rounded-2xl text-sm font-extrabold transition-colors ${
                      level === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent-soft"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs font-bold text-muted-foreground">
                Semakin tinggi level: HP &amp; damage monster naik, waktu menjawab makin singkat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* --------------------------- Layar Petualangan --------------------------- */

type Fase = "jelajah" | "soal" | "menang" | "kalah";

function Petualangan({
  kodeRoom,
  level,
  keluarRoom,
  naikLevel,
}: {
  kodeRoom: string;
  level: number;
  keluarRoom: () => void;
  naikLevel: () => void;
}) {
  const { pengguna } = useAuth();
  const { koin, muatUlang } = useGamifikasi();
  const klaim = useServerFn(klaimKoinKuis);

  const konfigurasi: Level = useMemo(() => buatLevel(level), [level]);
  const [indeks, setIndeks] = useState(0);
  const [hpPemain, setHpPemain] = useState(100);
  const [hpMusuh, setHpMusuh] = useState(konfigurasi.rintangan[0]!.hp);
  const [fase, setFase] = useState<Fase>("jelajah");
  const [soalList, setSoalList] = useState<SoalPetualangan[]>(() => soalUntukLevel(level, 12));
  const [soalKe, setSoalKe] = useState(0);
  const [detik, setDetik] = useState(konfigurasi.detikJawab);
  const [efek, setEfek] = useState<"none" | "slash" | "damage">("none");
  const [pemain, setPemain] = useState<Pemain[]>([]);
  const [logCoop, setLogCoop] = useState<string[]>([]);
  const [klaimJalan, setKlaimJalan] = useState(false);

  const musuh = konfigurasi.rintangan[indeks]!;
  const soal = soalList[soalKe % soalList.length]!;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Reset saat level berubah
  useEffect(() => {
    setIndeks(0);
    setHpPemain(100);
    setHpMusuh(buatLevel(level).rintangan[0]!.hp);
    setSoalList(soalUntukLevel(level, 12));
    setSoalKe(0);
    setFase("jelajah");
  }, [level]);

  // Realtime room: presence pemain + broadcast serangan co-op
  useEffect(() => {
    if (!pengguna) return;
    const ch = supabase.channel(`petualangan:${kodeRoom}`, {
      config: { presence: { key: pengguna.id } },
    });
    channelRef.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<{ nama: string; kelas: string | null }>();
      setPemain(
        Object.entries(state).map(([id, metas]) => ({
          id,
          nama: metas[0]?.nama ?? "Petualang",
          kelas: metas[0]?.kelas ?? null,
        })),
      );
    });

    ch.on("broadcast", { event: "serang-bos" }, ({ payload }) => {
      const p = payload as { nama: string; damage: number; dari: string };
      if (p.dari === pengguna.id) return;
      setHpMusuh((hp) => Math.max(0, hp - p.damage));
      setLogCoop((l) => [`${p.nama} menyerang Bos -${p.damage} HP`, ...l].slice(0, 5));
    });

    void ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void ch.track({ nama: pengguna.nama, kelas: pengguna.kelas ?? null });
      }
    });

    return () => {
      void supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [kodeRoom, pengguna]);

  // Timer menjawab
  useEffect(() => {
    if (fase !== "soal") return;
    if (detik <= 0) {
      kenaDamage(musuh.damage);
      lanjutSoal();
      return;
    }
    const t = window.setTimeout(() => setDetik((d) => d - 1), 1000);
    return () => window.clearTimeout(t);
  }, [fase, detik]); // eslint-disable-line react-hooks/exhaustive-deps

  const kenaDamage = useCallback(
    (jumlah: number) => {
      setEfek("damage");
      window.setTimeout(() => setEfek("none"), 500);
      setHpPemain((hp) => {
        const sisa = Math.max(0, hp - jumlah);
        if (sisa === 0) setFase("kalah");
        return sisa;
      });
    },
    [],
  );

  function bukaSoal() {
    setSoalKe((n) => n + 1);
    setDetik(konfigurasi.detikJawab);
    setFase("soal");
  }

  function lanjutSoal() {
    setSoalKe((n) => n + 1);
    setDetik(konfigurasi.detikJawab);
  }

  async function selesaikanLevel() {
    setFase("menang");
    if (klaimJalan) return;
    setKlaimJalan(true);
    try {
      await klaim({ data: { jumlah: konfigurasi.hadiahKoin } });
      await muatUlang();
      toast.success(`Peti harta terbuka! +${konfigurasi.hadiahKoin} Poin Global`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan poin");
    } finally {
      setKlaimJalan(false);
    }
  }

  function jawab(i: number) {
    if (fase !== "soal") return;
    if (i !== soal.jawaban) {
      toast.error("Jawaban salah! Kamu terkena serangan.");
      kenaDamage(musuh.damage);
      lanjutSoal();
      return;
    }

    const damage = 20 + level * 4;
    setEfek("slash");
    window.setTimeout(() => setEfek("none"), 450);

    if (musuh.jenis === "bos") {
      void channelRef.current?.send({
        type: "broadcast",
        event: "serang-bos",
        payload: { nama: pengguna?.nama ?? "Petualang", damage, dari: pengguna?.id ?? "" },
      });
    }

    const sisa = Math.max(0, hpMusuh - damage);
    setHpMusuh(sisa);

    if (sisa > 0) {
      lanjutSoal();
      return;
    }

    // Rintangan tumbang
    if (indeks + 1 >= konfigurasi.rintangan.length) {
      void selesaikanLevel();
      return;
    }
    const berikut = konfigurasi.rintangan[indeks + 1]!;
    setIndeks(indeks + 1);
    setHpMusuh(berikut.hp);
    setFase("jelajah");
    toast.success(`${musuh.nama} tumbang! Jalan berikutnya terbuka.`);
  }

  function ulangLevel() {
    setIndeks(0);
    setHpPemain(100);
    setHpMusuh(konfigurasi.rintangan[0]!.hp);
    setSoalList(soalUntukLevel(level, 12));
    setSoalKe(0);
    setFase("jelajah");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Bar atas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground">
            Level {level}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-extrabold">
            {konfigurasi.latar}
          </Badge>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(kodeRoom);
              toast.success("Kode room disalin");
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-4 py-2 text-sm font-extrabold text-accent-foreground"
          >
            <Copy className="h-4 w-4" /> Room {kodeRoom}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 rounded-full bg-coin px-4 py-2 text-sm font-extrabold text-coin-foreground">
            <Coins className="h-4 w-4" /> {koin.toLocaleString("id-ID")}
          </Badge>
          <Button variant="ghost" className="rounded-full font-extrabold" onClick={keluarRoom}>
            Keluar
          </Button>
        </div>
      </div>

      {/* Daftar pemain (mabar) */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
        <Users className="h-4 w-4" />
        {pemain.length === 0 ? (
          <span>Menghubungkan ke room...</span>
        ) : (
          pemain.map((p) => (
            <span key={p.id} className="rounded-full bg-muted px-3 py-1">
              {p.nama}
              {p.kelas ? ` · ${p.kelas}` : ""}
            </span>
          ))
        )}
      </div>

      {/* Arena */}
      <motion.div
        animate={efek === "damage" ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mt-4 overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-primary/15 via-card to-accent/15 p-5 shadow-card sm:p-8"
      >
        <div className="grid items-center gap-6 sm:grid-cols-3">
          {/* Pemain */}
          <div className="text-center">
            <motion.div
              animate={efek === "slash" ? { x: [0, 30, 0] } : { y: [0, -6, 0] }}
              transition={
                efek === "slash"
                  ? { duration: 0.4 }
                  : { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }
              className="text-5xl sm:text-6xl"
            >
              🧑‍🎓
            </motion.div>
            <p className="mt-2 text-sm font-extrabold">{pengguna?.nama ?? "Petualang"}</p>
            <div className="mt-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              <Progress value={hpPemain} className="h-3" />
              <span className="text-xs font-extrabold tabular-nums">{hpPemain}</span>
            </div>
          </div>

          {/* Efek serangan */}
          <div className="grid place-items-center">
            <AnimatePresence>
              {efek === "slash" && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1.4, opacity: 1, rotate: 20 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="text-4xl"
                >
                  ⚡️
                </motion.div>
              )}
            </AnimatePresence>
            {efek === "none" && <Sparkles className="h-6 w-6 text-accent" />}
          </div>

          {/* Musuh / rintangan */}
          <div className="text-center">
            <motion.div
              animate={efek === "slash" ? { scale: [1, 0.85, 1], rotate: [0, -8, 0] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-5xl sm:text-6xl"
            >
              {musuh.emoji}
            </motion.div>
            <p className="mt-2 text-sm font-extrabold">
              {musuh.nama}
              {musuh.jenis === "bos" && (
                <span className="ml-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-extrabold text-destructive-foreground">
                  BOS
                </span>
              )}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Swords className="h-4 w-4 text-primary" />
              <Progress value={(hpMusuh / musuh.hp) * 100} className="h-3" />
              <span className="text-xs font-extrabold tabular-nums">{hpMusuh}</span>
            </div>
          </div>
        </div>

        {musuh.jenis === "bos" && logCoop.length > 0 && (
          <div className="mt-4 rounded-2xl bg-card/80 p-3 text-xs font-bold text-muted-foreground">
            <p className="mb-1 font-extrabold text-foreground">Serangan Tim (Co-op)</p>
            {logCoop.map((l, i) => (
              <p key={`${l}-${i}`}>• {l}</p>
            ))}
          </div>
        )}
      </motion.div>

      {/* Aksi / Soal */}
      <div className="mt-5">
        {fase === "jelajah" && (
          <Card className="border-2 border-dashed border-accent/50">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <p className="font-display text-lg font-extrabold">
                  {musuh.jenis === "monster"
                    ? "Monster menghalangi jalanmu!"
                    : musuh.jenis === "bos"
                      ? "Bos penjaga peti harta muncul!"
                      : "Rintangan menghalangi jalanmu!"}
                </p>
                <p className="text-sm font-bold text-muted-foreground">
                  Jawab teka-teki pelajaran dengan benar dalam {konfigurasi.detikJawab} detik untuk
                  menyerang.
                </p>
              </div>
              <Button className="rounded-full font-extrabold" onClick={bukaSoal}>
                {musuh.jenis === "monster" || musuh.jenis === "bos" ? "Serang!" : "Pecahkan!"}
              </Button>
            </CardContent>
          </Card>
        )}

        {fase === "soal" && (
          <Card className="border-2 border-primary/40 shadow-pop">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="rounded-full font-extrabold">
                  {soal.mapel}
                </Badge>
                <span
                  className={`text-sm font-extrabold tabular-nums ${detik <= 5 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  ⏱ {detik}s
                </span>
              </div>
              <Progress value={(detik / konfigurasi.detikJawab) * 100} className="h-2" />
              <CardTitle className="pt-2 text-lg font-extrabold leading-snug">
                {soal.pertanyaan}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5 sm:grid-cols-2">
              {soal.pilihan.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => jawab(i)}
                  className="rounded-2xl border-2 border-border bg-card px-4 py-3 text-left text-sm font-bold transition-colors hover:border-primary hover:bg-accent-soft"
                >
                  {p}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {fase === "menang" && (
          <Card className="border-2 border-success/50 text-center">
            <CardContent className="py-8">
              <motion.div
                initial={{ scale: 0.4, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-6xl"
              >
                🏆
              </motion.div>
              <p className="mt-3 font-display text-2xl font-extrabold">Peti Harta Ditemukan!</p>
              <p className="mt-1 text-sm font-bold text-muted-foreground">
                Level {level} selesai · +{konfigurasi.hadiahKoin} Poin Global
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button
                  className="rounded-full font-extrabold"
                  disabled={klaimJalan}
                  onClick={() => {
                    naikLevel();
                  }}
                >
                  {klaimJalan ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trophy className="mr-1 h-4 w-4" />}
                  Lanjut Level {level + 1}
                </Button>
                <Button variant="secondary" className="rounded-full font-extrabold" onClick={ulangLevel}>
                  Ulangi Level
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {fase === "kalah" && (
          <Card className="border-2 border-destructive/50 text-center">
            <CardContent className="py-8">
              <div className="text-6xl">💀</div>
              <p className="mt-3 font-display text-2xl font-extrabold">HP Habis!</p>
              <p className="mt-1 text-sm font-bold text-muted-foreground">
                Belajar dulu sebentar, lalu coba lagi petualanganmu.
              </p>
              <Button className="mt-5 rounded-full font-extrabold" onClick={ulangLevel}>
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
