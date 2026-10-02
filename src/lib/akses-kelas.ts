import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

/**
 * Memastikan guru boleh mengakses siswa ini (siswa di kelas wali/ampu).
 * Mengandalkan RLS: profil siswa di luar kelas akses tidak terbaca.
 */
export async function pastikanBolehSiswa(supabase: Client, siswaId: string) {
  const { data } = await supabase.from("profiles").select("id").eq("id", siswaId).maybeSingle();
  if (!data) throw new Error("Siswa ini bukan di kelas yang Anda ampu.");
}

/** Sama seperti di atas, untuk catatan milik siswa (dicari via RLS tabel terkait). */
export async function pastikanBolehCatatan(
  supabase: Client,
  tabel: "perilaku_siswa" | "penukaran_hadiah",
  id: string,
) {
  const { data } = await supabase.from(tabel).select("id").eq("id", id).maybeSingle();
  if (!data) throw new Error("Data ini bukan dari siswa di kelas yang Anda ampu.");
}
