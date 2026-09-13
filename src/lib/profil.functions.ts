import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Membuat profil + role untuk pengguna yang baru mendaftar.
 * Identitas diambil dari sesi terverifikasi (bukan dari input klien).
 */
export const pastikanProfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        nama: z.string().trim().min(1).max(100),
        peran: z.enum(["siswa", "guru"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("pastikan_profil_untuk", {
      _uid: context.userId,
      _nama: data.nama,
      _peran: data.peran,
    });
    if (error) throw new Error("Gagal menyiapkan profil");
    return { ok: true };
  });

/**
 * Papan peringkat siswa berdasarkan koin.
 * Data agregat terbatas (nama, kelas, koin) — hanya untuk pengguna login.
 */
export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("leaderboard_siswa", { _batas: 10 });
    if (error) throw new Error("Gagal memuat leaderboard");
    return (data ?? []) as { nama: string; kelas: string | null; koin: number }[];
  });
