import { auth, defineMcp } from "@lovable.dev/mcp-js";
import profilSaya from "./tools/profil-saya";
import daftarModul from "./tools/daftar-modul";
import daftarHadiah from "./tools/daftar-hadiah";
import beritaTerbaru from "./tools/berita-terbaru";
import nilaiSaya from "./tools/nilai-saya";

// Issuer harus host Supabase langsung; project ref adalah satu-satunya nilai
// yang tetap sama setelah publish.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "sekolah-gembira-hub",
  title: "Sekolah Gembira Hub",
  version: "0.1.0",
  instructions:
    "Alat untuk portal sekolah Sekolah Gembira Hub. Gunakan `profil_saya` untuk data akun dan koin, `daftar_modul` untuk modul belajar, `daftar_hadiah` untuk Toko Reward, `berita_terbaru` untuk pengumuman, dan `nilai_saya` untuk nilai siswa. Semua alat berjalan sebagai pengguna yang masuk.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [profilSaya, daftarModul, daftarHadiah, beritaTerbaru, nilaiSaya],
});
