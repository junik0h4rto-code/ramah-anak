import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;
type Peran = Database["public"]["Enums"]["app_role"];

async function pastikanAdmin(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (!(data ?? []).some((r) => r.role === "admin")) {
    throw new Error("Akses ditolak: khusus super admin.");
  }
}

export type ItemAkun = {
  id: string;
  nama: string;
  email: string;
  kelas: string | null;
  mapel: string | null;
  koin: number;
  peran: Peran;
  dibuat: string;
  waliKelas: string | null;
  kelasDiampu: string[];
};

async function simpanPenugasan(
  admin: Client,
  guruId: string,
  nama: string,
  peran: Peran,
  waliKelas: string | undefined,
  kelasDiampu: string[] | undefined,
) {
  await admin.from("guru_kelas").delete().eq("guru_id", guruId);
  await admin.from("kelas_rombel").update({ wali_kelas: "" }).eq("wali_kelas", nama);
  if (peran !== "guru") return;
  const wali = waliKelas?.trim();
  const rows: { guru_id: string; kelas_nama: string; sebagai: string }[] = [];
  if (wali) {
    await admin.from("guru_kelas").delete().eq("kelas_nama", wali).eq("sebagai", "wali");
    rows.push({ guru_id: guruId, kelas_nama: wali, sebagai: "wali" });
    await admin.from("kelas_rombel").update({ wali_kelas: nama }).eq("nama", wali);
  }
  for (const k of new Set((kelasDiampu ?? []).map((x) => x.trim()).filter(Boolean))) {
    rows.push({ guru_id: guruId, kelas_nama: k, sebagai: "pengampu" });
  }
  if (rows.length) {
    const { error } = await admin.from("guru_kelas").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export const listAkun = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ItemAkun[]> => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const [{ data: profil, error }, { data: roles }, { data: tugas }] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("id, nama, email, kelas, mapel, koin, created_at")
        .order("nama"),
      context.supabase.from("user_roles").select("user_id, role"),
      context.supabase.from("guru_kelas").select("guru_id, kelas_nama, sebagai"),
    ]);
    if (error) throw new Error(error.message);
    const peta = new Map<string, Peran>();
    for (const r of roles ?? []) peta.set(r.user_id, r.role);
    return (profil ?? []).map((p) => ({
      id: p.id,
      nama: p.nama,
      email: p.email,
      kelas: p.kelas,
      mapel: p.mapel,
      koin: p.koin ?? 0,
      peran: peta.get(p.id) ?? ("siswa" as Peran),
      dibuat: p.created_at,
      waliKelas: (tugas ?? []).find((t) => t.guru_id === p.id && t.sebagai === "wali")?.kelas_nama ?? null,
      kelasDiampu: (tugas ?? [])
        .filter((t) => t.guru_id === p.id && t.sebagai === "pengampu")
        .map((t) => t.kelas_nama)
        .sort(),
    }));
  });

export const updateAkun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        nama: z.string().trim().min(1, "Nama wajib diisi").max(120),
        kelas: z.string().trim().max(30).optional(),
        mapel: z.string().trim().max(120).optional(),
        peran: z.enum(["siswa", "guru", "admin"]),
        waliKelas: z.string().trim().max(30).optional(),
        kelasDiampu: z.array(z.string().trim().max(30)).max(60).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: errProfil } = await supabaseAdmin
      .from("profiles")
      .update({
        nama: data.nama,
        kelas: data.kelas?.trim() ? data.kelas.trim() : null,
        mapel: data.mapel?.trim() ? data.mapel.trim() : null,
      })
      .eq("id", data.id);
    if (errProfil) throw new Error(errProfil.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id);
    const { error: errRole } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.id, role: data.peran as Peran });
    if (errRole) throw new Error(errRole.message);

    await simpanPenugasan(supabaseAdmin as Client, data.id, data.nama, data.peran as Peran, data.waliKelas, data.kelasDiampu);
    return { ok: true };
  });

export const deleteAkun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    if (data.id === context.userId) throw new Error("Tidak bisa menghapus akun sendiri.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const skemaAkunBaru = z.object({
  nama: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(72),
  peran: z.enum(["siswa", "guru", "admin"]),
  kelas: z.string().trim().max(30).optional(),
  mapel: z.string().trim().max(120).optional(),
  waliKelas: z.string().trim().max(30).optional(),
  kelasDiampu: z.array(z.string().trim().max(30)).max(60).optional(),
});
export type AkunBaru = z.infer<typeof skemaAkunBaru>;

export const tambahAkun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ akun: z.array(skemaAkunBaru).min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    await pastikanAdmin(context.supabase as Client, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const hasil: { email: string; ok: boolean; pesan?: string }[] = [];
    for (const a of data.akun) {
      const { data: u, error } = await supabaseAdmin.auth.admin.createUser({
        email: a.email,
        password: a.password,
        email_confirm: true,
        user_metadata: { nama: a.nama, peran: a.peran },
      });
      if (error || !u.user) {
        hasil.push({ email: a.email, ok: false, pesan: error?.message ?? "Gagal" });
        continue;
      }
      const id = u.user.id;
      await supabaseAdmin.from("profiles").upsert(
        {
          id,
          email: a.email,
          nama: a.nama,
          kelas: a.peran === "siswa" && a.kelas ? a.kelas : null,
          mapel: a.peran !== "siswa" && a.mapel ? a.mapel : null,
        },
        { onConflict: "id" },
      );
      await supabaseAdmin.from("user_roles").delete().eq("user_id", id);
      await supabaseAdmin.from("user_roles").insert({ user_id: id, role: a.peran as Peran });
      try {
        await simpanPenugasan(supabaseAdmin as Client, id, a.nama, a.peran as Peran, a.waliKelas, a.kelasDiampu);
      } catch {
        hasil.push({ email: a.email, ok: true, pesan: "Akun dibuat, tetapi penugasan kelas gagal" });
        continue;
      }
      hasil.push({ email: a.email, ok: true });
    }
    return hasil;
  });
