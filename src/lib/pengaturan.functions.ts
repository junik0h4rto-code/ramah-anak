import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PengaturanSekolah = {
  nama_sekolah: string;
  tagline: string;
  alamat: string;
  telepon: string;
  email: string;
  logo_url: string | null;
  hero_url: string | null;
  npsn: string;
  akreditasi: string;
  kepala_sekolah: string;
  maps_url: string;
  latitude: number | null;
  longitude: number | null;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  whatsapp: string;
};

export const PENGATURAN_DEFAULT: PengaturanSekolah = {
  nama_sekolah: "SMPN 26 BANDUNG",
  tagline: "Belajar Seru, Kumpulkan Poin",
  alamat: "Jl. Sarimanah 23, Bandung",
  telepon: "(022) 2012277",
  email: "",
  logo_url: null,
  hero_url: null,
  npsn: "",
  akreditasi: "",
  kepala_sekolah: "",
  maps_url: "https://www.google.com/maps/place/SMPN+26+Bandung/@-6.8825948,107.5766366,19.45z/data=!4m6!3m5!1s0x2e68e683d3c3921d:0xf3159507a221c93e!8m2!3d-6.8826784!4d107.5774846!16s%2Fg%2F11cjnp5d1d",
  latitude: -6.8826784,
  longitude: 107.5774846,
  instagram: "",
  facebook: "",
  youtube: "",
  tiktok: "",
  whatsapp: "",
};

const teks = (maks: number) => z.string().trim().max(maks).default("");

const pengaturanSchema = z.object({
  nama_sekolah: z.string().trim().min(1, "Nama sekolah wajib diisi").max(120),
  tagline: teks(120),
  alamat: teks(300),
  telepon: teks(40),
  email: teks(120),
  // Logo disimpan sebagai data URL (PNG/JPEG/WebP) yang sudah dikecilkan di browser, maks ~400KB.
  logo_url: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Format logo tidak valid")
    .max(400_000, "Ukuran logo terlalu besar")
    .nullable(),
  // Gambar utama beranda: data URL hasil kompresi di browser atau tautan https.
  hero_url: z
    .string()
    .refine(
      (v) => /^data:image\/(png|jpeg|webp);base64,/.test(v) || /^https:\/\//.test(v),
      "Format gambar beranda tidak valid",
    )
    .max(1_200_000, "Ukuran gambar beranda terlalu besar")
    .nullable(),
  npsn: teks(20),
  akreditasi: teks(40),
  kepala_sekolah: teks(120),
  maps_url: teks(600),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  instagram: teks(200),
  facebook: teks(200),
  youtube: teks(200),
  tiktok: teks(200),
  whatsapp: teks(40),
});

const KOLOM =
  "nama_sekolah, tagline, alamat, telepon, email, logo_url, hero_url, npsn, akreditasi, kepala_sekolah, maps_url, latitude, longitude, instagram, facebook, youtube, tiktok, whatsapp";

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

export const getPengaturanSekolah = createServerFn({ method: "GET" }).handler(
  async (): Promise<PengaturanSekolah> => {
    const supabasePublic = createPublicClient();
    const { data, error } = await supabasePublic
      .from("pengaturan_sekolah")
      .select(KOLOM)
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return PENGATURAN_DEFAULT;
    const row = data as Record<string, unknown>;
    return {
      ...PENGATURAN_DEFAULT,
      ...row,
      latitude: row["latitude"] == null ? null : Number(row["latitude"]),
      longitude: row["longitude"] == null ? null : Number(row["longitude"]),
    } as PengaturanSekolah;
  },
);

export const simpanPengaturanSekolah = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => pengaturanSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("pengaturan_sekolah")
      .update({ ...data, updated_by: context.userId })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
