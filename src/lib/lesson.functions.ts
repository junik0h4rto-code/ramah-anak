import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { lessonInputSchema, lessonOutputSchema, masalahRancangan } from "./lesson-schema";

export const listRancangan = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("rancangan_pembelajaran").select("*").eq("user_id", context.userId).order("updated_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});
export const simpanRancangan = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid().nullable(), input: lessonInputSchema, hasil: lessonOutputSchema.nullable(), status: z.enum(["draf", "ditinjau"]) }).parse(v))
  .handler(async ({ data, context }) => {
    if (data.status === "ditinjau" && (!data.hasil || masalahRancangan(data.input, data.hasil).length)) throw new Error("Periksa konsistensi rancangan sebelum menandai ditinjau.");
    const row = { judul: data.input.topik, input: data.input, hasil: data.hasil, status: data.status, updated_at: new Date().toISOString() };
    const result = data.id
      ? await context.supabase.from("rancangan_pembelajaran").update(row).eq("id", data.id).eq("user_id", context.userId).select().single()
      : await context.supabase.from("rancangan_pembelajaran").insert({ ...row, user_id: context.userId }).select().single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });
export const hapusRancangan = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("rancangan_pembelajaran").delete().eq("id", data.id).eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
});
export const pulihkanGenerator = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin");
  if (error || !data?.length) throw new Error("Hanya admin dapat membuka kembali akses AI.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("status_ai_generator").delete().eq("id", true);
  if (result.error) throw new Error(result.error.message);
  return { ok: true };
});