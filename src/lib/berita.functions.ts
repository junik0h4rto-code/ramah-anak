import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const beritaSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  isi: z.string().min(1, "Isi berita wajib diisi"),
  kategori: z.string().optional(),
  tanggal_kegiatan: z.string().optional(),
  published: z.boolean().optional().default(true),
  // Daftar kelas tujuan dipisah koma. Kosong = pengumuman sekolah (semua siswa).
  kelas_target: z.string().max(400).nullable().optional(),
  // Foto disimpan sebagai data URL hasil kompresi di browser (maks ~900KB) atau tautan https.
  gambar_url: z
    .string()
    .max(900_000, "Ukuran foto terlalu besar")
    .refine(
      (v) => /^data:image\/(png|jpeg|webp);base64,/.test(v) || /^https:\/\//.test(v),
      "Format foto tidak valid",
    )
    .nullable()
    .optional(),
});



function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Pengumuman sekolah (tanpa kelas tujuan) — tampil untuk publik. */
export const listBeritaPublic = createServerFn({ method: "GET" }).handler(async () => {
  const supabasePublic = createPublicClient();
  const { data, error } = await supabasePublic
    .from("berita")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).filter((b) => !(b.kelas_target ?? "").trim());
});

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

/** Pengumuman untuk siswa yang login: pengumuman sekolah + pengumuman kelasnya. */
export const listBeritaSiswa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data, error }, { data: profil }] = await Promise.all([
      context.supabase
        .from("berita")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false }),
      context.supabase.from("profiles").select("kelas").eq("id", context.userId).maybeSingle(),
    ]);
    if (error) throw new Error(error.message);
    return (data ?? []).filter((b) => cocokKelas(b.kelas_target, profil?.kelas ?? null));
  });

export const listBeritaEducator = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("berita")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createBerita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => beritaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase
      .from("berita")
      .insert({
        judul: data.judul,
        isi: data.isi,
        kategori: data.kategori ?? null,
        tanggal_kegiatan: data.tanggal_kegiatan ?? null,
        published: data.published,
        gambar_url: data.gambar_url ?? null,
        kelas_target: data.kelas_target?.trim() ? data.kelas_target.trim() : null,
        penulis_id: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateBerita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => beritaSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase
      .from("berita")
      .update({
        judul: data.judul,
        isi: data.isi,
        kategori: data.kategori ?? null,
        tanggal_kegiatan: data.tanggal_kegiatan ?? null,
        published: data.published,
        gambar_url: data.gambar_url ?? null,
        kelas_target: data.kelas_target?.trim() ? data.kelas_target.trim() : null,
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteBerita = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("berita").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
