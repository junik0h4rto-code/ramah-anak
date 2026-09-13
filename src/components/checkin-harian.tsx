import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Check, Coins, Lock, Sparkles, X } from "lucide-react";
import { statusCheckin, klaimCheckin } from "@/lib/checkin.functions";
import { useGamifikasi } from "@/lib/gamifikasi-store";

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function tambahHari(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function CheckinHarian({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { setKoin } = useGamifikasi();
  const [sibuk, setSibuk] = useState(false);
  const [sukses, setSukses] = useState<number | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["checkin"],
    queryFn: () => statusCheckin(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setSukses(null);
      setPesan(null);
    }
  }, [open]);

  if (!open) return null;

  const hariIni = data?.hariIni ?? new Date().toISOString().slice(0, 10);
  const sudah = new Set(data?.tanggal ?? []);
  const tujuhHari = Array.from({ length: 7 }, (_, i) => tambahHari(hariIni, i - 6));
  const sudahHariIni = sudah.has(hariIni);

  async function klaim() {
    if (sibuk || sudahHariIni) return;
    setSibuk(true);
    setPesan(null);
    try {
      const r = await klaimCheckin();
      if (r.berhasil) {
        setKoin(r.saldoKoin);
        setSukses(r.koinDidapat);
      } else {
        setPesan(r.pesan);
      }
      await qc.invalidateQueries({ queryKey: ["checkin"] });
    } catch (e) {
      setPesan(e instanceof Error ? e.message : "Gagal check-in, coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-foreground/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Check-in Harian"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-play px-6 py-5">
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/80 text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent-foreground">
            <CalendarCheck className="h-3.5 w-3.5" /> Check-in Harian
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-accent-foreground">
            Hadir tiap hari, dapat poin gratis!
          </h2>
          <p className="text-sm font-semibold text-accent-foreground/80">
            Klik hari ini untuk klaim <b>+10 Poin</b>.
          </p>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-7 gap-1.5">
            {tujuhHari.map((t) => {
              const isHariIni = t === hariIni;
              const isSudah = sudah.has(t);
              const d = new Date(t + "T00:00:00Z");
              const base =
                "grid justify-items-center gap-1 rounded-2xl border px-1 py-2.5 text-center transition-all";
              const kelas = isSudah
                ? "border-success bg-success/15 text-success"
                : isHariIni
                  ? "border-accent bg-accent text-accent-foreground shadow-pop animate-pulse hover:animate-none hover:-translate-y-0.5"
                  : "border-border bg-muted/50 text-muted-foreground";
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!isHariIni || isSudah || sibuk || isLoading}
                  onClick={klaim}
                  className={`${base} ${kelas} disabled:cursor-default`}
                  aria-label={isHariIni ? "Klaim poin hari ini" : t}
                >
                  <span className="text-[10px] font-bold uppercase">{NAMA_HARI[d.getUTCDay()]}</span>
                  <span className="font-display text-base font-extrabold">{d.getUTCDate()}</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-card/70">
                    {isSudah ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isHariIni ? (
                      <Coins className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {sukses !== null ? (
            <div className="mt-5 grid justify-items-center gap-1 rounded-2xl bg-success/15 px-4 py-5 text-center text-success animate-in zoom-in-75 fade-in duration-500">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground shadow-pop">
                <Sparkles className="h-7 w-7" />
              </span>
              <p className="mt-1 font-display text-2xl font-extrabold">+{sukses} Poin!</p>
              <p className="text-sm font-bold">Check-in berhasil. Sampai jumpa besok!</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={klaim}
              disabled={sudahHariIni || sibuk || isLoading}
              className="mt-5 w-full rounded-full bg-accent px-5 py-3 text-sm font-extrabold text-accent-foreground shadow-pop transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {isLoading
                ? "Memuat..."
                : sudahHariIni
                  ? "Sudah check-in hari ini"
                  : sibuk
                    ? "Mengklaim..."
                    : "Klaim +10 Poin Sekarang"}
            </button>
          )}
          {pesan && <p className="mt-3 text-center text-xs font-bold text-destructive">{pesan}</p>}
          <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground">
            {sudah.size} dari 7 hari terakhir sudah check-in.
          </p>
        </div>
      </div>
    </div>
  );
}
