import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export const KATEGORI_RAMAH = ["Religius", "Aman", "Mandiri", "Aktif", "Humanis"] as const;

export type ItemKatalog = {
  id: string;
  kategori: string;
  jenis: string;
  poin: number;
};

async function pastikanGuru(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("guru") && !roles.includes("admin")) {
    throw new Error("Akses ditolak: khusus guru/admin.");
  }
}

export const katalogPerilaku = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ItemKatalog[]> => {
    const { data, error } = await context.supabase
      .from("katalog_perilaku")
      .select("id, kategori, jenis, poin")
      .eq("aktif", true)
      .order("kategori")
      .order("poin", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ItemKatalog[];
  });

export const catatPerilaku = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        katalogId: z.string().uuid(),
        catatan: z.string().trim().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: hasil, error } = await supabaseAdmin.rpc("catat_perilaku", {
      _user_id: data.userId,
      _katalog_id: data.katalogId,
      _oleh: context.userId,
      _catatan: data.catatan ?? "",
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(hasil) ? hasil[0] : hasil;
    return {
      poin: row?.poin ?? 0,
      air: row?.air ?? 0,
      saldoKoin: row?.saldo_koin ?? 0,
      totalAir: row?.total_air ?? 0,
      musim: row?.musim ?? 1,
    };
  });

export const kirimPerilakuMandiri = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        katalogId: z.string().uuid(),
        catatan: z.string().trim().max(200).optional(),
        foto: z.string().min(20).max(1_400_000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: hasil, error } = await supabaseAdmin.rpc("kirim_perilaku_mandiri", {
      _user_id: context.userId,
      _katalog_id: data.katalogId,
      _catatan: data.catatan ?? "",
      _foto: data.foto,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(hasil) ? hasil[0] : hasil;
    return {
      berhasil: row?.berhasil ?? false,
      pesan: row?.pesan ?? "",
      poin: row?.poin ?? 0,
      air: row?.air ?? 0,
      saldoKoin: row?.saldo_koin ?? 0,
      totalAir: row?.total_air ?? 0,
      musim: row?.musim ?? 1,
      sisaKiriman: row?.sisa_kiriman ?? 0,
    };
  });

export const riwayatPerilakuSekolah = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const { data, error } = await context.supabase
      .from("perilaku_siswa")
      .select("id, user_id, katalog_id, catatan, kategori, jenis, poin, created_at")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const { data: profil } = ids.length
      ? await context.supabase.from("profiles").select("id, nama, kelas").in("id", ids)
      : { data: [] as { id: string; nama: string; kelas: string | null }[] };
    const peta = new Map((profil ?? []).map((p) => [p.id, p]));
    return rows.map((r) => ({
      id: r.id,
      nama: peta.get(r.user_id)?.nama ?? "Siswa",
      kelas: peta.get(r.user_id)?.kelas ?? null,
      katalogId: r.katalog_id,
      catatan: r.catatan ?? "",
      kategori: r.kategori,
      jenis: r.jenis,
      poin: r.poin,
      waktu: r.created_at,
    }));
  });

export const ubahPerilaku = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        katalogId: z.string().uuid(),
        catatan: z.string().trim().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("ubah_perilaku", {
      _id: data.id,
      _katalog_id: data.katalogId,
      _catatan: data.catatan ?? "",
    });
    if (error) throw new Error(error.message);
    return { berhasil: true };
  });

export const hapusPerilaku = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanGuru(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("hapus_perilaku", { _id: data.id });
    if (error) throw new Error(error.message);
    return { berhasil: true };
  });

export type StatusPohon = {
  air: number;
  totalAir: number;
  musim: number;
  totalPanen: number;
  saldoKoin: number;
  poinPanen: number;
  sisaKiriman: number;
  riwayat: {
    id: string;
    kategori: string;
    jenis: string;
    poin: number;
    air: number;
    waktu: string;
    foto: string | null;
    sumber: string;
  }[];
  kategori: { kategori: string; jumlah: number; poin: number }[];
};

export const statusPohon = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StatusPohon> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("status_pohon", { _user_id: context.userId });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;

    const { data: riwayat } = await context.supabase
      .from("perilaku_siswa")
      .select("id, kategori, jenis, poin, air, created_at, foto_url, sumber")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);

    const awalHari = new Date();
    awalHari.setHours(0, 0, 0, 0);
    const terkirimHariIni = (riwayat ?? []).filter(
      (r) => r.sumber === "siswa" && new Date(r.created_at) >= awalHari,
    ).length;

    const peta = new Map<string, { kategori: string; jumlah: number; poin: number }>();
    for (const r of riwayat ?? []) {
      const item = peta.get(r.kategori) ?? { kategori: r.kategori, jumlah: 0, poin: 0 };
      item.jumlah += 1;
      item.poin += r.poin;
      peta.set(r.kategori, item);
    }

    return {
      air: row?.air ?? 0,
      totalAir: row?.total_air ?? 0,
      musim: row?.musim ?? 1,
      totalPanen: row?.total_panen ?? 0,
      saldoKoin: row?.saldo_koin ?? 0,
      poinPanen: row?.poin_panen ?? 50,
      sisaKiriman: Math.max(0, 5 - terkirimHariIni),
      riwayat: (riwayat ?? []).map((r) => ({
        id: r.id,
        kategori: r.kategori,
        jenis: r.jenis,
        poin: r.poin,
        air: r.air,
        waktu: r.created_at,
        foto: r.foto_url,
        sumber: r.sumber,
      })),
      kategori: [...peta.values()].sort((a, b) => b.poin - a.poin),
    };
  });

export const panenPohon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("panen_pohon", { _user_id: context.userId });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return {
      berhasil: row?.berhasil ?? false,
      pesan: row?.pesan ?? "",
      poinDidapat: row?.poin_didapat ?? 0,
      saldoKoin: row?.saldo_koin ?? 0,
      air: row?.air ?? 0,
      musim: row?.musim ?? 1,
    };
  });

export const leaderboardPohon = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("leaderboard_pohon", { _batas: 10 });
    if (error) throw new Error(error.message);
    return (data ?? []) as {
      nama: string;
      kelas: string | null;
      total_air: number;
      total_panen: number;
    }[];
  });
