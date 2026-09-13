// Seeder awal: memastikan akun admin default (dan akun demo) selalu ada
// setelah proyek di-remix / dijalankan di akun baru.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Peran = "admin" | "guru" | "siswa";

type AkunAwal = {
  email: string;
  password: string;
  nama: string;
  peran: Peran;
  kelas?: string | null;
  mapel?: string | null;
  koin?: number;
};

export const AKUN_AWAL: AkunAwal[] = [
  {
    email: "junikoharto77@gmail.com",
    password: "SMPN26@bdg",
    nama: "Super Admin SMPN 26",
    peran: "admin",
    mapel: "Administrator",
  },
  {
    email: "guru@sekolah.sch.id",
    password: "guru123",
    nama: "Guru Demo",
    peran: "guru",
    mapel: "Matematika",
  },
  {
    email: "siswa@sekolah.sch.id",
    password: "siswa123",
    nama: "Siswa Demo",
    peran: "siswa",
    kelas: "7A",
    koin: 100,
  },
];

async function cariUserId(email: string): Promise<string | null> {
  // Auth Admin API belum punya filter by email yang stabil, jadi cek lewat profiles dulu.
  const { data: profil } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (profil?.id) return profil.id;

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function pastikanAkun(akun: AkunAwal) {
  let userId = await cariUserId(akun.email);
  let dibuat = false;

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: akun.email,
      password: akun.password,
      email_confirm: true,
      user_metadata: { nama: akun.nama, peran: akun.peran },
    });
    if (error) {
      // Balapan: user sudah dibuat proses lain.
      userId = await cariUserId(akun.email);
      if (!userId) throw new Error(`${akun.email}: ${error.message}`);
    } else {
      userId = data.user!.id;
      dibuat = true;
    }
  }

  await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      email: akun.email,
      nama: akun.nama,
      kelas: akun.kelas ?? null,
      mapel: akun.mapel ?? null,
      ...(dibuat ? { koin: akun.koin ?? 0 } : {}),
    },
    { onConflict: "id" },
  );

  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: akun.peran }, { onConflict: "user_id,role" });

  return { email: akun.email, userId, dibuat };
}

async function pastikanPengaturan() {
  const { data } = await supabaseAdmin
    .from("pengaturan_sekolah")
    .select("id")
    .eq("id", 1)
    .maybeSingle();
  if (data) return false;
  await supabaseAdmin.from("pengaturan_sekolah").insert({
    id: 1,
    nama_sekolah: "SMPN 26 BANDUNG",
    tagline: "Belajar Seru, Kumpulkan Poin",
    alamat: "Jl. Sarimanah 23, Sarijadi, Bandung",
    telepon: "0895338573512",
    email: "info@smpn26bdg.sch.id",
  });
  return true;
}

let sudahJalan: Promise<{ ok: true; akun: { email: string; dibuat: boolean }[] }> | null = null;

export async function jalankanSeedAwal(paksa = false) {
  if (!paksa && sudahJalan) return sudahJalan;

  const proses = (async () => {
    const hasil: { email: string; dibuat: boolean }[] = [];
    for (const akun of AKUN_AWAL) {
      try {
        const r = await pastikanAkun(akun);
        hasil.push({ email: r.email, dibuat: r.dibuat });
      } catch (e) {
        console.error("[seed] gagal menyiapkan akun", akun.email, e);
      }
    }
    try {
      await pastikanPengaturan();
    } catch (e) {
      console.error("[seed] gagal menyiapkan pengaturan sekolah", e);
    }
    return { ok: true as const, akun: hasil };
  })();

  sudahJalan = proses;
  try {
    return await proses;
  } catch (e) {
    sudahJalan = null;
    throw e;
  }
}
