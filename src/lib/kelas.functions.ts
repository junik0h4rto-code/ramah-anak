import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

async function pastikanAdmin(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("admin")) {
    throw new Error("Akses ditolak: khusus admin.");
  }
}

const kelasSchema = z.object({
  tingkat: z.string().trim().min(1, "Tingkat wajib dipilih").max(10),
  rombel: z.string().trim().min(1, "Rombel wajib diisi").max(20),
  waliKelas: z.string().trim().max(120).optional(),
  aktif: z.boolean().optional(),
});

export type ItemKelas = {
  id: string;
  tingkat: string;
  rombel: string;
  nama: string;
  waliKelas: string;
  aktif: boolean;
  jumlahSiswa: number;
};

export const listKelas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ItemKelas[]> => {
    const [{ data, error }, { data: profil }, { data: roles }] = await Promise.all([
      context.supabase.from("kelas_rombel").select("*").order("nama"),
      context.supabase.from("profiles").select("id, kelas"),
      context.supabase.from("user_roles").select("user_id, role").eq("role", "siswa"),
    ]);
    if (error) throw new Error(error.message);
    const { kelasAkses } = await import("@/lib/admin.functions");
    const akses = await kelasAkses(context.supabase as Client, context.userId);
    const idSiswa = new Set((roles ?? []).map((r) => r.user_id));
    const hitung = new Map<string, number>();
    for (const p of profil ?? []) {
      if (!idSiswa.has(p.id)) continue;
      const k = (p.kelas ?? "").trim();
      if (!k) continue;
      hitung.set(k, (hitung.get(k) ?? 0) + 1);
    }
    return (data ?? []).filter((k) => !akses || akses.has(k.nama)).map((k) => ({
      id: k.id,
      tingkat: k.tingkat,
      rombel: k.rombel,
      nama: k.nama,
      waliKelas: k.wali_kelas,
      aktif: k.aktif,
      jumlahSiswa: hitung.get(k.nama) ?? 0,
    }));
  });

export const createKelas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => kelasSchema.parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const nama = `${data.tingkat} ${data.rombel}`.trim();
    const { error } = await context.supabase.from("kelas_rombel").insert({
      tingkat: data.tingkat,
      rombel: data.rombel,
      nama,
      wali_kelas: data.waliKelas ?? "",
      aktif: data.aktif ?? true,
    });
    if (error) throw new Error(error.message);
    return { ok: true, nama };
  });

export const updateKelas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => kelasSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const nama = `${data.tingkat} ${data.rombel}`.trim();
    const { error } = await context.supabase
      .from("kelas_rombel")
      .update({
        tingkat: data.tingkat,
        rombel: data.rombel,
        nama,
        wali_kelas: data.waliKelas ?? "",
        aktif: data.aktif ?? true,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, nama };
  });

export const deleteKelas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { error } = await context.supabase.from("kelas_rombel").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setKelasSiswa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), kelas: z.string().trim().max(30) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ kelas: data.kelas || null })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
