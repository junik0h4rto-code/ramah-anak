import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const statusCheckin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("riwayat_checkin_7hari", {
      _user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as { tanggal: string; hari_ini: string }[];
    // Hitung "hari ini" (WIB) di server agar tidak bergantung jam perangkat.
    const hariIni =
      rows[0]?.hari_ini ??
      new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
    return { tanggal: rows.map((r) => r.tanggal), hariIni };
  });

export const klaimCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("klaim_checkin_harian", {
      _user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return {
      berhasil: row?.berhasil ?? false,
      pesan: row?.pesan ?? "",
      koinDidapat: row?.koin_didapat ?? 0,
      saldoKoin: row?.saldo_koin ?? 0,
    };
  });

export const listRekomendasi = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("rekomendasi_modul", { _batas: 8 });
    if (error) throw new Error(error.message);
    return (data ?? []) as {
      id: string;
      judul: string;
      mapel: string | null;
      kelas: string | null;
      koin_reward: number;
      cover_url: string | null;
      nama_guru: string;
    }[];
  });
