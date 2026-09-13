import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

async function pastikanGuru(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("guru") && !roles.includes("admin")) {
    throw new Error("Akses ditolak: khusus guru/admin.");
  }
}

export const statistikPanel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);

    const [{ data: profil }, { count: totalModul }, { data: antrean }, { data: roles }] =
      await Promise.all([
        context.supabase.from("profiles").select("id, koin"),
        context.supabase.from("modul").select("id", { count: "exact", head: true }),
        context.supabase.from("penukaran_hadiah").select("id").neq("status", "selesai"),
        context.supabase.from("user_roles").select("user_id, role").eq("role", "siswa"),
      ]);

    const idSiswa = new Set((roles ?? []).map((r) => r.user_id));
    const siswa = (profil ?? []).filter((p) => idSiswa.has(p.id));

    return {
      totalSiswa: siswa.length,
      totalModul: totalModul ?? 0,
      koinBeredar: siswa.reduce((acc, p) => acc + (p.koin ?? 0), 0),
      antreanHadiah: (antrean ?? []).length,
    };
  });

export const daftarSiswa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const [{ data: profil, error }, { data: roles }] = await Promise.all([
      context.supabase.from("profiles").select("id, nama, email, kelas, koin").order("nama"),
      context.supabase.from("user_roles").select("user_id, role").eq("role", "siswa"),
    ]);
    if (error) throw new Error(error.message);
    const idSiswa = new Set((roles ?? []).map((r) => r.user_id));
    return (profil ?? []).filter((p) => idSiswa.has(p.id));
  });

export const kirimKoinBonus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        kegiatan: z.string().trim().min(1, "Nama kegiatan wajib diisi").max(120),
        jumlah: z.number().int().min(1).max(1000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: saldo, error } = await supabaseAdmin.rpc("beri_koin_bonus", {
      _user_id: data.userId,
      _jumlah: data.jumlah,
      _kegiatan: data.kegiatan,
      _oleh: context.userId,
    });
    if (error) throw new Error(error.message);
    return { saldoKoin: (saldo as number) ?? 0 };
  });

export const antreanPenukaran = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const { data, error } = await context.supabase
      .from("penukaran_hadiah")
      .select("id, user_id, jumlah_koin, status, kode_voucher, ditukar_pada, hadiah:hadiah_id (nama, tipe)")
      .order("ditukar_pada", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const { data: profil } = ids.length
      ? await context.supabase.from("profiles").select("id, nama, kelas").in("id", ids)
      : { data: [] as { id: string; nama: string; kelas: string | null }[] };
    const peta = new Map((profil ?? []).map((p) => [p.id, p]));

    return rows.map((r) => ({
      id: r.id,
      namaSiswa: peta.get(r.user_id)?.nama ?? "Siswa",
      kelas: peta.get(r.user_id)?.kelas ?? null,
      namaHadiah: (r.hadiah as { nama?: string } | null)?.nama ?? "Hadiah",
      tipe: (r.hadiah as { tipe?: string } | null)?.tipe ?? null,
      kodeVoucher: r.kode_voucher,
      jumlahKoin: r.jumlah_koin,
      status: r.status,
      ditukarPada: r.ditukar_pada,
    }));
  });

export const selesaikanPenukaran = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const { error } = await context.supabase
      .from("penukaran_hadiah")
      .update({ status: "selesai" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type ProgresKelas = {
  kelas: string;
  waliKelas: string;
  jumlahSiswa: number;
  modulSelesai: number;
  lencana: number;
  koin: number;
};

export const progresKelas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProgresKelas[]> => {
    await pastikanGuru(context.supabase as Client, context.userId);

    const [{ data: roles }, { data: profil }, { data: selesai }, { data: lencana }, { data: rombel }] =
      await Promise.all([
        context.supabase.from("user_roles").select("user_id, role").eq("role", "siswa"),
        context.supabase.from("profiles").select("id, kelas, koin"),
        context.supabase.from("modul_selesai").select("user_id"),
        context.supabase.from("lencana_siswa").select("user_id, jumlah"),
        context.supabase.from("kelas_rombel").select("nama, wali_kelas, aktif"),
      ]);

    const idSiswa = new Set((roles ?? []).map((r) => r.user_id));
    const kelasDari = new Map<string, string>();
    const peta = new Map<string, ProgresKelas>();

    for (const k of rombel ?? []) {
      if (!k.aktif) continue;
      peta.set(k.nama, {
        kelas: k.nama,
        waliKelas: k.wali_kelas ?? "",
        jumlahSiswa: 0,
        modulSelesai: 0,
        lencana: 0,
        koin: 0,
      });
    }

    for (const p of profil ?? []) {
      if (!idSiswa.has(p.id)) continue;
      const kelas = (p.kelas ?? "").trim() || "Belum diisi";
      kelasDari.set(p.id, kelas);
      const row =
        peta.get(kelas) ??
        { kelas, waliKelas: "", jumlahSiswa: 0, modulSelesai: 0, lencana: 0, koin: 0 };
      row.jumlahSiswa += 1;
      row.koin += p.koin ?? 0;
      peta.set(kelas, row);
    }

    for (const s of selesai ?? []) {
      const kelas = kelasDari.get(s.user_id);
      if (kelas && peta.has(kelas)) peta.get(kelas)!.modulSelesai += 1;
    }
    for (const l of lencana ?? []) {
      const kelas = kelasDari.get(l.user_id);
      if (kelas && peta.has(kelas)) peta.get(kelas)!.lencana += l.jumlah ?? 1;
    }

    return [...peta.values()].sort((a, b) => a.kelas.localeCompare(b.kelas, "id"));
  });

