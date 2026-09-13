import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Coins, Gift, PackageCheck, Ticket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { tukarHadiahFn } from "@/lib/hadiah.functions";
import { useGamifikasi } from "@/lib/gamifikasi-store";
import { useAuth } from "@/lib/auth-store";
import { DynamicIcon } from "@/components/dynamic-icon";
import { RoleGate } from "@/components/role-gate";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/toko")({
  head: () => ({
    meta: [
      { title: "Toko Reward Sekolah - Tukar Poin Belajar" },
      {
        name: "description",
        content:
          "Tukarkan Poin Belajar dengan kupon kantin, alat tulis, dan hadiah spesial di Toko Reward Sekolah SMPN 26 BANDUNG.",
      },
      { property: "og:title", content: "Toko Reward Sekolah - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Kupon kantin, alat tulis, dan hadiah spesial menanti Poin Belajar kamu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RoleGate peran="siswa">
      <TokoReward />
    </RoleGate>
  ),
});

const KATEGORI = ["Semua", "Alat Tulis", "Kupon Kantin", "Kupon Spesial", "Merchandise"];

type Hadiah = {
  id: string;
  nama: string;
  harga_koin: number;
  stok: number;
  kategori: string;
  ikon: string;
  tipe: string;
};

const LABEL_STATUS: Record<string, string> = {
  diproses: "Belum Diambil",
  siap_diambil: "Siap Diambil",
  selesai: "Sudah Diambil",
};

function TokoReward() {
  const { koin, setKoin, muatUlang } = useGamifikasi();
  const { pengguna } = useAuth();
  const [kategori, setKategori] = useState("Semua");
  const [proses, setProses] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState<Hadiah | null>(null);
  const [sukses, setSukses] = useState<{
    nama: string;
    tipe: string;
    kode: string | null;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: hadiahDb = [] } = useQuery<Hadiah[]>({
    queryKey: ["hadiah"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hadiah")
        .select("id, nama, harga_koin, stok, kategori, ikon, tipe")
        .order("harga_koin", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Hadiah[];
    },
  });

  const { data: riwayat = [] } = useQuery({
    queryKey: ["riwayat-penukaran", pengguna?.id],
    enabled: Boolean(pengguna?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("penukaran_hadiah")
        .select("id, jumlah_koin, status, kode_voucher, ditukar_pada, hadiah:hadiah_id (nama, tipe)")
        .order("ditukar_pada", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Array<{
        id: string;
        jumlah_koin: number;
        status: string;
        kode_voucher: string | null;
        ditukar_pada: string;
        hadiah: { nama: string; tipe: string } | null;
      }>;
    },
  });

  const daftar =
    kategori === "Semua" ? hadiahDb : hadiahDb.filter((h) => h.kategori === kategori);

  async function tukar(h: Hadiah) {
    setProses(true);
    try {
      const hasil = await tukarHadiahFn({ data: { hadiahId: h.id } });
      if (hasil.berhasil) {
        setKoin(hasil.saldoKoin);
        setKonfirmasi(null);
        setSukses({ nama: h.nama, tipe: hasil.tipe ?? h.tipe, kode: hasil.kodeVoucher });
        await Promise.all([
          muatUlang(),
          queryClient.invalidateQueries({ queryKey: ["hadiah"] }),
          queryClient.invalidateQueries({ queryKey: ["riwayat-penukaran"] }),
        ]);
      } else {
        toast.error(hasil.pesan);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Penukaran gagal.");
    } finally {
      setProses(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={Gift}
        eyebrow="Toko Reward Sekolah"
        title="Tukar Poin Belajar, Bawa Pulang Hadiah"
        subtitle="Poin Belajar hasil menyelesaikan modul dan bermain di Pusat Game bisa ditukar dengan hadiah nyata."
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-accent-soft p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-coin text-coin-foreground shadow-card">
              <Coins className="h-9 w-9" />
            </span>
            <div>
              <p className="text-sm font-bold text-accent-foreground/80">
                Hai, {pengguna?.nama ?? "Siswa"}
              </p>
              <p className="text-xs font-bold uppercase tracking-wide text-accent-foreground/70">
                Poin Belajar Anda
              </p>
              <p className="font-display text-4xl font-extrabold leading-tight text-accent-foreground">
                {koin.toLocaleString("id-ID")}
                <span className="ml-2 text-base font-bold">poin</span>
              </p>
            </div>
          </div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-accent-foreground">
            <PackageCheck className="h-4 w-4" /> {riwayat.length} hadiah sudah ditukar
          </p>
        </section>

        <div className="mt-7 flex flex-wrap gap-2">
          {KATEGORI.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                kategori === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {daftar.map((h) => {
            const cukup = koin >= h.harga_koin;
            const bisa = cukup && h.stok > 0;
            return (
              <article
                key={h.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-shadow hover:shadow-lg"
              >
                <div className="grid h-36 place-items-center bg-primary-soft">
                  <DynamicIcon name={h.ikon} className="h-14 w-14 text-primary" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {h.tipe}
                  </p>
                  <h2 className="mt-1 text-base font-extrabold leading-snug">{h.nama}</h2>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    Stok: {h.stok} buah
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-accent">
                    <Coins className="h-4 w-4" />
                    <span className="font-display text-xl font-extrabold">{h.harga_koin} Poin</span>
                  </div>
                  <button
                    type="button"
                    disabled={!bisa}
                    onClick={() => setKonfirmasi(h)}
                    className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-opacity hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
                  >
                    {h.stok <= 0 ? "Stok Habis" : cukup ? "Tukarkan Hadiah" : "Poin Tidak Cukup"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-extrabold">Riwayat Tukar Poin</h2>
          {riwayat.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm font-semibold text-muted-foreground">
              Belum ada hadiah yang kamu tukarkan. Kumpulkan poin dari modul dan Pusat Game!
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-primary-soft text-xs font-bold uppercase tracking-wide text-primary">
                  <tr>
                    <th className="px-4 py-3">Hadiah</th>
                    <th className="px-4 py-3">Poin</th>
                    <th className="px-4 py-3">Kode Voucher</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3 font-bold">{r.hadiah?.nama ?? "Hadiah"}</td>
                      <td className="px-4 py-3 font-semibold text-accent">{r.jumlah_koin}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold">
                        {r.kode_voucher ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                        {new Date(r.ditukar_pada).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                          {LABEL_STATUS[r.status] ?? r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog open={Boolean(konfirmasi)} onOpenChange={(o) => !o && setKonfirmasi(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penukaran</DialogTitle>
            <DialogDescription>
              Apakah kamu yakin ingin menukarkan {konfirmasi?.nama} seharga{" "}
              {konfirmasi?.harga_koin} Poin?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setKonfirmasi(null)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-bold"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={proses}
              onClick={() => konfirmasi && void tukar(konfirmasi)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
            >
              {proses ? "Memproses..." : "Ya, Tukarkan"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(sukses)} onOpenChange={(o) => !o && setSukses(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Penukaran Berhasil!
            </DialogTitle>
            <DialogDescription>{sukses?.nama} sudah menjadi milikmu.</DialogDescription>
          </DialogHeader>
          {sukses?.kode ? (
            <div className="rounded-2xl bg-accent-soft p-5 text-center">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent-foreground/70">
                <Ticket className="h-4 w-4" /> Kode Voucher Unik
              </p>
              <p className="mt-2 font-mono text-2xl font-extrabold tracking-widest text-accent-foreground">
                {sukses.kode}
              </p>
              <p className="mt-2 text-xs font-semibold text-accent-foreground/80">
                Tunjukkan kode ini ke petugas kantin/guru untuk menggunakan kuponmu.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-primary-soft p-5 text-sm font-semibold text-primary">
              Silakan ambil hadiah fisikmu ke Ruang Guru/Pusat Sumber Belajar dengan menunjukkan
              halaman ini.
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setSukses(null)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              Selesai
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
