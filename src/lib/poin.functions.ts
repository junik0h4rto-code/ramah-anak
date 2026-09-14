import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export type PengaturanPoin = {
  kunci: string;
  label: string;
  nilai: number;
  deskripsi: string;
  urutan: number;
};

async function pastikanAdmin(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (!(data ?? []).some((r) => r.role === "admin")) {
    throw new Error("Akses ditolak: khusus super admin.");
  }
}

export const listPengaturanPoin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PengaturanPoin[]> => {
    const { data, error } = await context.supabase
      .from("pengaturan_poin")
      .select("kunci, label, nilai, deskripsi, urutan")
      .order("urutan");
    if (error) throw new Error(error.message);
    return (data ?? []) as PengaturanPoin[];
  });

export const simpanPengaturanPoin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        nilai: z
          .array(z.object({ kunci: z.string().min(1), nilai: z.number().int().min(0).max(10000) }))
          .min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const item of data.nilai) {
      const { error } = await supabaseAdmin.rpc("simpan_pengaturan_poin", {
        _kunci: item.kunci,
        _nilai: item.nilai,
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

function buatKunci(label: string) {
  return label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export const tambahPengaturanPoin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        label: z.string().trim().min(2).max(80),
        deskripsi: z.string().trim().max(200).default(""),
        nilai: z.number().int().min(0).max(10000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const kunci = buatKunci(data.label);
    if (!kunci) throw new Error("Nama kategori tidak valid.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: adaKunci } = await supabaseAdmin
      .from("pengaturan_poin")
      .select("kunci")
      .eq("kunci", kunci)
      .maybeSingle();
    if (adaKunci) throw new Error("Kategori poin dengan nama itu sudah ada.");

    const { data: terakhir } = await supabaseAdmin
      .from("pengaturan_poin")
      .select("urutan")
      .order("urutan", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("pengaturan_poin").insert({
      kunci,
      label: data.label,
      deskripsi: data.deskripsi || `Poin untuk ${data.label}.`,
      nilai: data.nilai,
      urutan: ((terakhir?.urutan as number | undefined) ?? 0) + 1,
    });
    if (error) throw new Error(error.message);
    return { kunci };
  });

export const hapusPengaturanPoin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ kunci: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("pengaturan_poin")
      .delete()
      .eq("kunci", data.kunci);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
