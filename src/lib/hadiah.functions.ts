import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

async function pastikanAdmin(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (!(data ?? []).some((r) => r.role === "admin")) {
    throw new Error("Akses ditolak: khusus super admin.");
  }
}

const hadiahSchema = z.object({
  nama: z.string().trim().min(1, "Nama hadiah wajib diisi").max(120),
  kategori: z.string().trim().min(1, "Kategori wajib dipilih").max(60),
  tipe: z.string().trim().min(1, "Tipe wajib dipilih").max(60),
  ikon: z.string().trim().min(1).max(60),
  harga_koin: z.number().int().min(1).max(100000),
  stok: z.number().int().min(0).max(100000),
});

export const tukarHadiahFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ hadiahId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("tukar_hadiah", {
      _user_id: context.userId,
      _hadiah_id: data.hadiahId,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(result) ? result[0] : result;
    return {
      berhasil: Boolean(row?.berhasil),
      pesan: row?.pesan ?? "Penukaran gagal.",
      saldoKoin: row?.saldo_koin ?? 0,
      kodeVoucher: (row?.kode_voucher as string | null) ?? null,
      tipe: (row?.tipe as string | null) ?? null,
    };
  });

export const listHadiah = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("hadiah")
      .select("id, nama, harga_koin, stok, kategori, ikon, tipe")
      .order("harga_koin");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createHadiah = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => hadiahSchema.parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { error } = await context.supabase
      .from("hadiah")
      .insert({ ...data, created_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateHadiah = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => hadiahSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { id, ...isi } = data;
    const { error } = await context.supabase.from("hadiah").update(isi).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteHadiah = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { error } = await context.supabase.from("hadiah").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
