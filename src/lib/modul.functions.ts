import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const modulSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().optional(),
  mapel: z.string().min(1, "Mata pelajaran wajib dipilih"),
  kelas: z.string().min(1, "Kelas wajib dipilih"),
  kategori: z.string().optional(),
  koin_reward: z.number().int().min(0, "Poin hadiah minimal 0"),
  konten: z.string().optional(),
  kuis_pertanyaan: z.string().optional(),
  kuis_opsi: z.array(z.string()).optional(),
  kuis_jawaban: z.number().int().min(0).max(3).optional(),
});

export const listModul = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("modul")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createModul = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => modulSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase
      .from("modul")
      .insert({
        judul: data.judul,
        deskripsi: data.deskripsi ?? null,
        mapel: data.mapel,
        kelas: data.kelas,
        kategori: data.kategori ?? null,
        koin_reward: data.koin_reward,
        konten: data.konten ?? null,
        kuis_pertanyaan: data.kuis_pertanyaan ?? null,
        kuis_opsi: data.kuis_opsi ?? [],
        kuis_jawaban: data.kuis_jawaban ?? 0,
        created_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateModul = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => modulSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase
      .from("modul")
      .update({
        judul: data.judul,
        deskripsi: data.deskripsi ?? null,
        mapel: data.mapel,
        kelas: data.kelas,
        kategori: data.kategori ?? null,
        koin_reward: data.koin_reward,
        konten: data.konten ?? null,
        kuis_pertanyaan: data.kuis_pertanyaan ?? null,
        kuis_opsi: data.kuis_opsi ?? [],
        kuis_jawaban: data.kuis_jawaban ?? 0,
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteModul = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("modul").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getModul = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase
      .from("modul")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return result;
  });

export const klaimKoinModul = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("selesaikan_modul", {
      _user_id: context.userId,
      _modul_id: data.id,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(result) ? result[0] : result;
    return {
      koinDidapat: row?.koin_didapat ?? 0,
      saldoKoin: row?.saldo_koin ?? 0,
    };
  });
