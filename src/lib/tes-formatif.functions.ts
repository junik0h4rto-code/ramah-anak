import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listTesFormatif = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("tes_formatif")
    .select("id, judul, mapel, kelas_target, tautan, keterangan, created_at")
    .eq("aktif", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const tautanSchema = z
  .string()
  .trim()
  .url("Tautan harus berupa alamat web lengkap (https://...)")
  .refine((u) => /^https?:\/\//i.test(u), "Tautan harus diawali http:// atau https://");

export const createTesFormatif = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        judul: z.string().trim().min(1, "Judul wajib diisi").max(150),
        mapel: z.string().trim().max(60).optional(),
        kelas_target: z.string().trim().max(400).optional(),
        tautan: tautanSchema,
        keterangan: z.string().trim().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tes_formatif").insert({
      judul: data.judul,
      mapel: data.mapel || null,
      kelas_target: data.kelas_target || null,
      tautan: data.tautan,
      keterangan: data.keterangan || null,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTesFormatif = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tes_formatif").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
