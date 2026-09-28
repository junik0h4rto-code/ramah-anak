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
  // Daftar rombel tujuan dipisah koma (mis. "VII A, VII B"). Kosong = semua kelas.
  kelas_target: z.string().max(400).nullable().optional(),
});

/** Cocokkan kelas siswa dengan daftar rombel tujuan materi. */
function cocokKelas(target: string | null, kelasSiswa: string | null) {
  const t = (target ?? "").trim();
  if (!t) return true;
  const kelas = (kelasSiswa ?? "").trim().toLowerCase();
  if (!kelas) return false;
  return t
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .some((x) => x === kelas || kelas.startsWith(`${x} `) || kelas === x.replace(/\s+/g, ""));
}

export const listModul = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data, error }, { data: roles }, { data: profil }] = await Promise.all([
      context.supabase.from("modul").select("*").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("profiles").select("kelas").eq("id", context.userId).maybeSingle(),
    ]);
    if (error) throw new Error(error.message);
    const pengajar = (roles ?? []).some((r) => r.role === "guru" || r.role === "admin");
    if (pengajar) return data ?? [];
    return (data ?? []).filter((m) => cocokKelas(m.kelas_target, profil?.kelas ?? null));
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
        kelas_target: data.kelas_target?.trim() ? data.kelas_target.trim() : null,
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
        kelas_target: data.kelas_target?.trim() ? data.kelas_target.trim() : null,
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

export const simpanRefleksi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        modul_id: z.string().uuid(),
        jawaban: z.array(z.string().trim().min(5, "Setiap jawaban refleksi minimal 5 karakter").max(2000)).length(3),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("refleksi_modul").upsert(
      {
        user_id: context.userId,
        modul_id: data.modul_id,
        jawaban_1: data.jawaban[0]!,
        jawaban_2: data.jawaban[1]!,
        jawaban_3: data.jawaban[2]!,
      },
      { onConflict: "user_id,modul_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
