import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState, useEffect, useRef } from "react";
import { useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpen,
  Megaphone,
  Save,
  Trash2,
  Pencil,
  X,
  LayoutDashboard,
  Users,
  Coins,
  Gift,
  CheckCircle2,
  Sparkles,
  Settings,
  Upload,
  ImageIcon,
  MapPin,
  Share2,
  IdCard,
  SlidersHorizontal,
  Sprout,
  School,
  Plus,

} from "lucide-react";
import { toast } from "sonner";
import { RoleGate } from "@/components/role-gate";
import { LogoSekolah } from "@/components/logo-sekolah";
import { kompresGambar, koordinatDariTautanMaps, embedPeta } from "@/lib/gambar";
import { usePengaturanSekolah, PENGATURAN_QUERY_KEY } from "@/lib/pengaturan-store";
import {
  getPengaturanSekolah,
  simpanPengaturanSekolah,
  type PengaturanSekolah,
} from "@/lib/pengaturan.functions";
import { listModul, createModul, updateModul, deleteModul } from "@/lib/modul.functions";
import { listAkun, updateAkun, deleteAkun } from "@/lib/akun.functions";
import { TabAkun } from "@/components/tab-akun";
import { TabTesFormatif } from "@/components/tab-tes-formatif";
import { TabRefleksi } from "@/components/tab-refleksi";
import { LessonGenerator } from "@/components/lesson-generator";
import {
  listBeritaEducator,
  createBerita,
  updateBerita,
  deleteBerita,
} from "@/lib/berita.functions";
import {
  statistikPanel,
  daftarSiswa,
  kirimKoinBonus,
  antreanPenukaran,
  selesaikanPenukaran,
  progresKelas,

  kelasSaya,
} from "@/lib/admin.functions";
import { useAuth } from "@/lib/auth-store";
import { KelolaKatalogPerilaku } from "@/components/kelola-katalog-perilaku";
import {
  listPengaturanPoin,
  simpanPengaturanPoin,
  tambahPengaturanPoin,
  hapusPengaturanPoin,
} from "@/lib/poin.functions";
import {
  katalogPerilaku,
  catatPerilaku,
  riwayatPerilakuSekolah,
  ubahPerilaku,
  hapusPerilaku,
} from "@/lib/perilaku.functions";
import {
  listKelas,
  createKelas,
  updateKelas,
  deleteKelas,
  setKelasSiswa,
  type ItemKelas,
} from "@/lib/kelas.functions";
import {
  listHadiah,
  createHadiah,
  updateHadiah,
  deleteHadiah,
} from "@/lib/hadiah.functions";


export const Route = createFileRoute("/_authenticated/guru")({
  head: () => ({
    meta: [
      { title: "Panel Guru - SMPN 26 BANDUNG" },
      {
        name: "description",
        content:
          "Dasbor guru SMPN 26 BANDUNG: statistik siswa, input materi belajar, bonus poin kegiatan, dan validasi hadiah toko.",
      },
      { property: "og:title", content: "Panel Guru - SMPN 26 BANDUNG" },
      {
        property: "og:description",
        content: "Kelola modul belajar, poin siswa, dan penukaran hadiah secara dinamis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HalamanGuru,
});

const MAPEL = [
  "Matematika",
  "IPA",
  "IPS",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Pendidikan Agama",
  "Pendidikan Pancasila",
  "Basa Sunda",
  "Informatika",
  "PJOK",
  "Seni Budaya",
];
const KELAS = ["VII", "VIII", "IX"];
const KATEGORI_MODUL = ["Pembelajaran", "Latihan", "Proyek", "Ujian"];

type TabId =
  | "dasbor"
  | "kelas"
  | "materi"
  | "tes-formatif"
  | "refleksi"
  | "pengumuman"
  | "pengumuman-sekolah"
  | "akun"
  | "bonus"
  | "perilaku"
  | "validasi"
  | "hadiah"
  | "poin"
  | "pengaturan";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard; adminSaja?: boolean }[] = [
  { id: "dasbor", label: "Dasbor Statistik", icon: LayoutDashboard },
  { id: "kelas", label: "Kelas & Rombel", icon: School },
  { id: "materi", label: "Input Materi Belajar", icon: BookOpen },
  { id: "tes-formatif", label: "Tes Formatif", icon: CheckCircle2 },
  { id: "refleksi", label: "Refleksi Siswa", icon: BookOpen },
  { id: "pengumuman", label: "Pengumuman Kelas", icon: Megaphone },
  { id: "pengumuman-sekolah", label: "Pengumuman Sekolah", icon: Megaphone, adminSaja: true },
  { id: "bonus", label: "Bonus Kegiatan Sekolah", icon: Sparkles },
  { id: "perilaku", label: "Perilaku Terpuji", icon: Sprout },
  { id: "validasi", label: "Validasi Hadiah Toko", icon: Gift },
  { id: "hadiah", label: "Kelola Hadiah Toko", icon: Gift, adminSaja: true },
  { id: "poin", label: "Kelola Poin", icon: SlidersHorizontal, adminSaja: true },
  { id: "akun", label: "Akun Terdaftar", icon: IdCard, adminSaja: true },
  { id: "pengaturan", label: "Pengaturan Sekolah", icon: Settings, adminSaja: true },
];


const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent";
const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

function HalamanGuru() {
  const [tab, setTab] = useState<TabId>("dasbor");
  const sekolah = usePengaturanSekolah();
  const { pengguna } = useAuth();
  const isAdmin = pengguna?.peran === "admin";
  const tabTampil = TABS.filter((t) => !t.adminSaja || isAdmin);

  return (
    <RoleGate peran="guru">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl bg-primary p-5 text-primary-foreground shadow-card lg:sticky lg:top-24">
            <div className="mb-6 flex items-center gap-3">
              <LogoSekolah className="h-11 w-11 rounded-2xl" />
              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold leading-tight">Panel Guru</p>
                <p className="truncate text-xs font-semibold opacity-80">{sekolah.nama_sekolah}</p>
              </div>
            </div>
            <nav className="grid gap-1.5">
              {tabTampil.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                    tab === t.id
                      ? "bg-accent text-accent-foreground shadow-pop"
                      : "text-primary-foreground/85 hover:bg-primary-foreground/10"
                  }`}
                >
                  <t.icon className="h-4 w-4 shrink-0" /> {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="min-w-0">
            {!isAdmin && <InfoKelasGuru />}
            <Suspense
              fallback={
                <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm font-extrabold text-muted-foreground shadow-card">
                  Memuat data...
                </div>
              }
            >
              {tab === "dasbor" && <TabDasbor />}
              {tab === "kelas" && <TabKelas />}
              {tab === "materi" && <TabMateri />}
              {tab === "tes-formatif" && <TabTesFormatif />}
              {tab === "refleksi" && <TabRefleksi />}
              {tab === "pengumuman" && <TabPengumuman mode="kelas" />}
              {tab === "pengumuman-sekolah" && isAdmin && <TabPengumuman mode="sekolah" />}
              {tab === "akun" && isAdmin && <TabAkun />}
              {tab === "bonus" && <TabBonus />}
              {tab === "perilaku" && <TabPerilaku />}
              {tab === "poin" && isAdmin && <TabPoin />}
              {tab === "validasi" && <TabValidasi />}
              {tab === "hadiah" && isAdmin && <TabHadiah />}
              {tab === "pengaturan" && <TabPengaturan />}

            </Suspense>
          </section>
        </div>
      </main>
    </RoleGate>
  );
}

function Kartu({
  judul,
  nilai,
  icon: Icon,
}: {
  judul: string;
  nilai: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-3xl font-extrabold">{nilai.toLocaleString("id-ID")}</p>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        {judul}
      </p>
    </div>
  );
}

function InfoKelasGuru() {
  const ambil = useServerFn(kelasSaya);
  const { data } = useQuery({ queryKey: ["kelas-saya"], queryFn: () => ambil() });
  if (!data || data.semua) return null;
  return (
    <div className="mb-4 rounded-2xl border border-dashed border-border bg-card p-4 text-sm font-semibold text-muted-foreground">
      {data.kelas.length
        ? `Anda melihat data siswa kelas: ${data.kelas.join(", ")}.`
        : "Belum ada kelas yang ditugaskan. Hubungi admin."}
    </div>
  );
}

function TabDasbor() {
  const { data } = useSuspenseQuery({
    queryKey: ["panel-statistik"],
    queryFn: () => statistikPanel(),
    refetchInterval: 15000,
  });
  const { data: kelas } = useSuspenseQuery({
    queryKey: ["panel-progres-kelas"],
    queryFn: () => progresKelas(),
    refetchInterval: 30000,
  });

  const [pilihKelas, setPilihKelas] = useState("semua");
  const kelasTampil =
    pilihKelas === "semua" ? kelas : kelas.filter((k) => k.kelas === pilihKelas);

  const total = kelasTampil.reduce(
    (a, k) => ({
      siswa: a.siswa + k.jumlahSiswa,
      modul: a.modul + k.modulSelesai,
      lencana: a.lencana + k.lencana,
      koin: a.koin + k.koin,
    }),
    { siswa: 0, modul: 0, lencana: 0, koin: 0 },
  );
  const n = (v: number) => v.toLocaleString("id-ID");

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold">Dasbor Statistik</h1>
      <p className="mb-6 text-sm font-semibold text-muted-foreground">
        Ringkasan aktivitas siswa dan konten belajar secara langsung dari database.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kartu judul="Total Siswa Aktif" nilai={data.totalSiswa} icon={Users} />
        <Kartu judul="Total Modul Belajar" nilai={data.totalModul} icon={BookOpen} />
        <Kartu judul="Poin Beredar di Siswa" nilai={data.koinBeredar} icon={Coins} />
        <Kartu judul="Antrean Hadiah Belum Diambil" nilai={data.antreanHadiah} icon={Gift} />
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-soft text-accent-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold">Progres Siswa per Kelas</h2>
            <p className="text-xs font-semibold text-muted-foreground">
              Jumlah siswa, modul yang diselesaikan, lencana, dan poin terkumpul.
            </p>
          </div>
          <select
            value={pilihKelas}
            onChange={(e) => setPilihKelas(e.target.value)}
            className="ml-auto rounded-2xl border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
            aria-label="Pilih kelas"
          >
            <option value="semua">Semua Kelas</option>
            {kelas.map((k) => (
              <option key={k.kelas} value={k.kelas}>
                Kelas {k.kelas}
              </option>
            ))}
          </select>
        </div>

        {kelasTampil.length === 0 ? (
          <p className="rounded-2xl bg-muted/50 p-6 text-center text-sm font-extrabold text-muted-foreground">
            Belum ada data siswa.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className={`pb-2 ${labelClass}`}>Kelas</th>
                  <th className={`pb-2 ${labelClass}`}>Wali Kelas</th>
                  <th className={`pb-2 text-right ${labelClass}`}>Siswa</th>
                  <th className={`pb-2 text-right ${labelClass}`}>Modul Selesai</th>
                  <th className={`pb-2 text-right ${labelClass}`}>Lencana</th>
                  <th className={`pb-2 text-right ${labelClass}`}>Poin</th>
                </tr>
              </thead>
              <tbody>
                {kelasTampil.map((k) => (
                  <tr key={k.kelas} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-extrabold">{k.kelas}</td>
                    <td className="py-3 font-semibold text-muted-foreground">
                      {k.waliKelas || "-"}
                    </td>
                    <td className="py-3 text-right font-semibold">{n(k.jumlahSiswa)}</td>
                    <td className="py-3 text-right font-semibold">{n(k.modulSelesai)}</td>
                    <td className="py-3 text-right font-semibold">{n(k.lencana)}</td>
                    <td className="py-3 text-right font-extrabold text-accent-foreground">
                      {n(k.koin)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td className="py-3 font-extrabold" colSpan={2}>
                    Total
                  </td>
                  <td className="py-3 text-right font-extrabold">{n(total.siswa)}</td>
                  <td className="py-3 text-right font-extrabold">{n(total.modul)}</td>
                  <td className="py-3 text-right font-extrabold">{n(total.lencana)}</td>
                  <td className="py-3 text-right font-extrabold">{n(total.koin)}</td>
                </tr>
              </tfoot>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}


/** Pemilih kelas tujuan (rombel spesifik, mis. VII A dan VII B). */
function PilihKelasTarget({
  nilai,
  onChange,
  labelSemua = "Semua kelas",
}: {
  nilai: string[];
  onChange: (v: string[]) => void;
  labelSemua?: string;
}) {
  const { data: kelas } = useSuspenseQuery({
    queryKey: ["panel-kelas"],
    queryFn: () => listKelas(),
  });
  const aktif = kelas.filter((k) => k.aktif);

  function toggle(nama: string) {
    onChange(nilai.includes(nama) ? nilai.filter((n) => n !== nama) : [...nilai, nama]);
  }

  return (
    <div className="grid gap-3">
      {KELAS.map((t) => {
        const rombel = aktif.filter((k) => k.tingkat === t);
        if (rombel.length === 0) return null;
        const semuaDipilih = rombel.every((k) => nilai.includes(k.nama));
        return (
          <div key={t} className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onChange(
                  semuaDipilih
                    ? nilai.filter((n) => !rombel.some((k) => k.nama === n))
                    : [...new Set([...nilai, ...rombel.map((k) => k.nama)])],
                )
              }
              className="rounded-full border border-border px-3 py-1.5 text-xs font-extrabold text-muted-foreground"
            >
              Kelas {t} {semuaDipilih ? "(batal)" : "(semua)"}
            </button>
            {rombel.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => toggle(k.nama)}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                  nilai.includes(k.nama)
                    ? "bg-accent text-accent-foreground shadow-pop"
                    : "border border-input text-muted-foreground"
                }`}
              >
                {k.nama}
              </button>
            ))}
          </div>
        );
      })}
      {aktif.length === 0 && (
        <p className="text-xs font-semibold text-muted-foreground">
          Belum ada kelas aktif. Tambahkan di tab Kelas &amp; Rombel.
        </p>
      )}
      <p className="text-xs font-semibold text-muted-foreground">
        {nilai.length === 0 ? labelSemua : `Tujuan: ${nilai.join(", ")}`}
      </p>
    </div>
  );
}

function TabMateri() {
  const qc = useQueryClient();
  const { data: modulList } = useSuspenseQuery({ queryKey: ["modul"], queryFn: () => listModul() });

  const buatModul = useServerFn(createModul);
  const ubahModul = useServerFn(updateModul);
  const hapusModul = useServerFn(deleteModul);

  const [editingModul, setEditingModul] = useState<string | null>(null);
  const [simpan, setSimpan] = useState(false);
  const [kelasTarget, setKelasTarget] = useState<string[]>([]);
  const [modulForm, setModulForm] = useState({
    judul: "",
    kategori: "",
    deskripsi: "",
    mapel: "",
    kelas: "",
    koin_reward: 0,
    konten: "",
    kuis_pertanyaan: "",
    opsi: ["", "", "", ""],
    kuis_jawaban: 0,
    tautan_tugas: "",
  });

  function resetModul() {
    setEditingModul(null);
    setKelasTarget([]);
    setModulForm({
      judul: "",
      kategori: "",
      deskripsi: "",
      mapel: "",
      kelas: "",
      koin_reward: 0,
      konten: "",
      kuis_pertanyaan: "",
      opsi: ["", "", "", ""],
      kuis_jawaban: 0,
      tautan_tugas: "",
    });
  }

  async function submitModul(e: React.FormEvent) {
    e.preventDefault();
    setSimpan(true);
    const payload = {
      judul: modulForm.judul,
      kategori: modulForm.kategori,
      deskripsi: modulForm.deskripsi,
      mapel: modulForm.mapel,
      kelas: modulForm.kelas,
      koin_reward: Number(modulForm.koin_reward) || 0,
      konten: modulForm.konten,
      kuis_pertanyaan: modulForm.kuis_pertanyaan,
      kuis_opsi: modulForm.opsi.filter((o) => o.trim().length > 0),
      kuis_jawaban: modulForm.kuis_jawaban,
      tautan_tugas: modulForm.tautan_tugas.trim() || null,
      kelas_target: kelasTarget.length > 0 ? kelasTarget.join(", ") : null,
    };
    try {
      if (editingModul) {
        await ubahModul({ data: { ...payload, id: editingModul } });
        toast.success("Materi berhasil diperbarui");
      } else {
        await buatModul({ data: payload });
        toast.success("Materi dipublikasikan ke katalog siswa");
      }
      resetModul();
      await qc.invalidateQueries({ queryKey: ["modul"] });
      await qc.invalidateQueries({ queryKey: ["panel-statistik"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan materi");
    } finally {
      setSimpan(false);
    }
  }

  async function removeModul(id: string) {
    if (!confirm("Hapus materi ini?")) return;
    try {
      await hapusModul({ data: { id } });
      toast.success("Materi dihapus");
      await qc.invalidateQueries({ queryKey: ["modul"] });
      await qc.invalidateQueries({ queryKey: ["panel-statistik"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus materi");
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Input Materi Belajar</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Modul yang disimpan langsung tampil di katalog Ruang Belajar siswa.
        </p>
      </div>

      <LessonGenerator onApply={(input, text) => {
        setModulForm((form) => ({ ...form, judul: input.topik, mapel: input.mapel, kelas: input.kelas, kategori: form.kategori || (input.model === "PjBL" ? "Proyek" : "Pembelajaran"), konten: text }));
        toast.success("Materi dan LKPD siswa dimasukkan ke form. Periksa lalu publikasikan seperti biasa.");
      }} />

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">
          {editingModul ? "Edit Materi Belajar" : "Tambah Materi Belajar"}
        </h2>
        <form onSubmit={submitModul} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Judul Modul</label>
              <input
                value={modulForm.judul}
                onChange={(e) => setModulForm({ ...modulForm, judul: e.target.value })}
                placeholder="Contoh: Pecahan Dasar"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Kategori Pelajaran</label>
              <select
                value={modulForm.mapel}
                onChange={(e) => setModulForm({ ...modulForm, mapel: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Pilih mata pelajaran</option>
                {MAPEL.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Jenis Konten</label>
              <select
                value={modulForm.kategori}
                onChange={(e) => setModulForm({ ...modulForm, kategori: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Pilih jenis</option>
                {KATEGORI_MODUL.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                Pembelajaran &amp; Proyek → Ruang Belajar · Latihan → Flash Belajar · Ujian → Portal Asesmen
              </p>
            </div>
            <div>
              <label className={labelClass}>Kelas</label>
              <select
                value={modulForm.kelas}
                onChange={(e) => setModulForm({ ...modulForm, kelas: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Pilih kelas</option>
                {KELAS.map((k) => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border p-4">
            <label className={labelClass}>Kelas Tujuan (rombel spesifik)</label>
            <p className="mb-3 mt-1 text-xs font-semibold text-muted-foreground">
              Pilih rombel yang boleh melihat materi ini, misalnya VII A dan VII B. Jika tidak
              dipilih, materi tampil untuk semua kelas.
            </p>
            <PilihKelasTarget
              nilai={kelasTarget}
              onChange={setKelasTarget}
              labelSemua="Tujuan: semua kelas"
            />
          </div>

          <div>
            <label className={labelClass}>Deskripsi Singkat</label>
            <input
              value={modulForm.deskripsi}
              onChange={(e) => setModulForm({ ...modulForm, deskripsi: e.target.value })}
              placeholder="Ringkasan satu kalimat untuk kartu modul"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Isi Teks Materi</label>
            <textarea
              value={modulForm.konten}
              onChange={(e) => setModulForm({ ...modulForm, konten: e.target.value })}
              rows={6}
              placeholder="Tulis materi lengkap yang akan dibaca siswa..."
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label className={labelClass}>Link Pengumpulan Tugas (opsional)</label>
            <input
              type="url"
              value={modulForm.tautan_tugas}
              onChange={(e) => setModulForm({ ...modulForm, tautan_tugas: e.target.value })}
              placeholder="https://forms.gle/... atau Google Classroom/Drive"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Untuk materi Pembelajaran atau Proyek. Link tampil di tab Pengumpulan Tugas pada Ruang Belajar siswa.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-border p-4">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-accent-foreground">
              Pertanyaan Kuis Kunci
            </p>
            <div className="grid gap-3">
              <input
                value={modulForm.kuis_pertanyaan}
                onChange={(e) => setModulForm({ ...modulForm, kuis_pertanyaan: e.target.value })}
                placeholder="Tulis pertanyaan evaluasi singkat"
                className={inputClass}
              />
              <div className="grid gap-3 md:grid-cols-2">
                {modulForm.opsi.map((opsi, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="jawaban-benar"
                      checked={modulForm.kuis_jawaban === i}
                      onChange={() => setModulForm({ ...modulForm, kuis_jawaban: i })}
                      className="h-4 w-4 accent-[hsl(var(--accent))]"
                    />
                    <input
                      value={opsi}
                      onChange={(e) => {
                        const opsiBaru = [...modulForm.opsi];
                        opsiBaru[i] = e.target.value;
                        setModulForm({ ...modulForm, opsi: opsiBaru });
                      }}
                      placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                Pilih lingkaran di sebelah kiri untuk menandai jawaban yang benar.
              </p>
            </div>
          </div>

          <div className="md:w-56">
            <label className={labelClass}>Jumlah Hadiah Poin</label>
            <input
              type="number"
              min={0}
              value={modulForm.koin_reward}
              onChange={(e) =>
                setModulForm({ ...modulForm, koin_reward: Number(e.target.value) || 0 })
              }
              className={inputClass}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={simpan}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {simpan ? "Menyimpan..." : "Simpan & Publikasikan"}
            </button>
            {editingModul && (
              <button
                type="button"
                onClick={resetModul}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-extrabold"
              >
                <X className="h-4 w-4" /> Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">Daftar Materi</h2>
        <div className="grid gap-3">
          {modulList.length === 0 && (
            <p className="text-sm font-semibold text-muted-foreground">Belum ada materi.</p>
          )}
          {modulList.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
            >
              <div>
                <p className="font-extrabold">{m.judul}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {m.mapel} • Kelas {m.kelas} • {m.koin_reward} koin
                  {m.kelas_target ? ` • Tujuan: ${m.kelas_target}` : " • Semua kelas"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingModul(m.id);
                    setModulForm({
                      judul: m.judul,
                      kategori: m.kategori ?? "",
                      deskripsi: m.deskripsi ?? "",
                      mapel: m.mapel ?? "",
                      kelas: m.kelas ?? "",
                      koin_reward: m.koin_reward ?? 0,
                      konten: m.konten ?? "",
                      kuis_pertanyaan: m.kuis_pertanyaan ?? "",
                      opsi: [0, 1, 2, 3].map((i) => m.kuis_opsi?.[i] ?? ""),
                      kuis_jawaban: m.kuis_jawaban ?? 0,
                      tautan_tugas: m.tautan_tugas ?? "",
                    });
                    setKelasTarget(
                      (m.kelas_target ?? "")
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    );
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border"
                  aria-label="Edit materi"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeModul(m.id)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/40 text-destructive"
                  aria-label="Hapus materi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

const KATEGORI_PENGUMUMAN = ["Pengumuman", "Berita", "Agenda"];

function TabPengumuman({ mode }: { mode: "kelas" | "sekolah" }) {
  const modeKelas = mode === "kelas";
  const qc = useQueryClient();
  const { data: beritaList } = useSuspenseQuery({
    queryKey: ["berita-educator"],
    queryFn: () => listBeritaEducator(),
  });
  const buatBerita = useServerFn(createBerita);
  const ubahBerita = useServerFn(updateBerita);
  const hapusBerita = useServerFn(deleteBerita);

  const kosong = {
    judul: "",
    isi: "",
    kategori: "Pengumuman",
    tanggal_kegiatan: "",
    published: true,
    gambar_url: null as string | null,
  };
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(kosong);
  const [simpan, setSimpan] = useState(false);
  const [kelasTarget, setKelasTarget] = useState<string[]>([]);
  const fotoRef = useRef<HTMLInputElement>(null);

  function reset() {
    setEditing(null);
    setForm(kosong);
    setKelasTarget([]);
  }

  async function pilihFoto(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG/JPG/WebP).");
      return;
    }
    try {
      const dataUrl = await kompresGambar(file);
      setForm((f) => ({ ...f, gambar_url: dataUrl }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat foto.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSimpan(true);
    const payload = {
      ...form,
      tanggal_kegiatan: form.tanggal_kegiatan || undefined,
      kelas_target: modeKelas && kelasTarget.length > 0 ? kelasTarget.join(", ") : null,
    };
    try {
      if (editing) {
        await ubahBerita({ data: { ...payload, id: editing } });
        toast.success("Pengumuman berhasil diperbarui");
      } else {
        await buatBerita({ data: payload });
        toast.success(
          form.published
            ? "Pengumuman terkirim dan tampil di dashboard siswa"
            : "Pengumuman disimpan sebagai draf",
        );
      }
      reset();
      await qc.invalidateQueries({ queryKey: ["berita-educator"] });
      await qc.invalidateQueries({ queryKey: ["berita-public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pengumuman");
    } finally {
      setSimpan(false);
    }
  }

  async function togglePublish(b: (typeof beritaList)[number]) {
    try {
      await ubahBerita({
        data: {
          id: b.id,
          judul: b.judul,
          isi: b.isi,
          kategori: b.kategori ?? undefined,
          tanggal_kegiatan: b.tanggal_kegiatan ?? undefined,
          gambar_url: b.gambar_url ?? null,
          kelas_target: b.kelas_target ?? null,
          published: !b.published,
        },
      });
      toast.success(!b.published ? "Pengumuman ditayangkan" : "Pengumuman disembunyikan");
      await qc.invalidateQueries({ queryKey: ["berita-educator"] });
      await qc.invalidateQueries({ queryKey: ["berita-public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus pengumuman ini?")) return;
    try {
      await hapusBerita({ data: { id } });
      toast.success("Pengumuman dihapus");
      await qc.invalidateQueries({ queryKey: ["berita-educator"] });
      await qc.invalidateQueries({ queryKey: ["berita-public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus pengumuman");
    }
  }

  const tayang = beritaList.filter((b) => b.published).length;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Pengumuman Sekolah</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Pengumuman yang ditayangkan langsung muncul di dashboard Ruang Belajar siswa dan halaman
          Pengumuman publik. {tayang} tayang dari {beritaList.length} total.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-extrabold">
          <Megaphone className="h-5 w-5" /> {editing ? "Edit Pengumuman" : "Kirim Pengumuman Baru"}
        </h2>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className={labelClass}>Judul Pengumuman</label>
            <input
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className={inputClass}
              placeholder="Contoh: Jadwal Penilaian Tengah Semester"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Kategori</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className={inputClass}
              >
                {KATEGORI_PENGUMUMAN.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tanggal Kegiatan (opsional)</label>
              <input
                type="date"
                value={form.tanggal_kegiatan}
                onChange={(e) => setForm({ ...form, tanggal_kegiatan: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          {modeKelas && (
            <div className="rounded-2xl border border-dashed border-border p-4">
              <label className={labelClass}>Kelas Tujuan</label>
              <p className="mb-3 mt-1 text-xs font-semibold text-muted-foreground">
                Pilih rombel penerima, misalnya VII A dan VII B. Jika tidak dipilih, pengumuman
                dikirim ke semua siswa.
              </p>
              <PilihKelasTarget
                nilai={kelasTarget}
                onChange={setKelasTarget}
                labelSemua="Tujuan: semua siswa"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Isi Pengumuman</label>
            <textarea
              value={form.isi}
              onChange={(e) => setForm({ ...form, isi: e.target.value })}
              rows={5}
              className={`${inputClass} resize-y`}
              placeholder="Tulis isi pengumuman untuk siswa..."
              required
            />
          </div>
          <div>
            <label className={labelClass}>Foto Pengumuman (opsional)</label>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="grid h-28 w-40 place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
                {form.gambar_url ? (
                  <img
                    src={form.gambar_url}
                    alt="Pratinjau foto pengumuman"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="grid gap-2">
                <input
                  ref={fotoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void pilihFoto(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fotoRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
                >
                  <Upload className="h-4 w-4" /> Unggah Foto
                </button>
                {form.gambar_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gambar_url: null })}
                    className="inline-flex items-center gap-2 rounded-full border border-input px-4 py-2.5 text-sm font-extrabold text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus Foto
                  </button>
                )}
                <p className="max-w-xs text-xs font-semibold text-muted-foreground">
                  PNG/JPG/WebP. Foto otomatis dikecilkan agar cepat dibuka siswa.
                </p>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Tayangkan sekarang ke dashboard siswa
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={simpan}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
            >
              <Save className="h-4 w-4" />{" "}
              {simpan ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Kirim Pengumuman"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-extrabold"
              >
                <X className="h-4 w-4" /> Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">Daftar Pengumuman</h2>
        {beritaList.length === 0 && (
          <p className="py-6 text-center text-sm font-semibold text-muted-foreground">
            Belum ada pengumuman. Kirim pengumuman pertama di atas.
          </p>
        )}
        <div className="grid gap-3">
          {beritaList.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border p-4"
            >
              {b.gambar_url && (
                <img
                  src={b.gambar_url}
                  alt=""
                  className="h-16 w-24 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                    {b.kategori || "Pengumuman"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                      b.published
                        ? "bg-primary/10 text-primary"
                        : "bg-accent-soft text-accent-foreground"
                    }`}
                  >
                    {b.published ? "Tayang" : "Draf"}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {b.tanggal_kegiatan ?? new Date(b.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className="mt-1 font-extrabold">{b.judul}</p>
                <p className="line-clamp-2 text-sm font-medium text-muted-foreground">{b.isi}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(b)}
                  className="rounded-xl border border-border px-3 text-xs font-extrabold"
                >
                  {b.published ? "Sembunyikan" : "Tayangkan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(b.id);
                    setForm({
                      judul: b.judul,
                      isi: b.isi,
                      kategori: b.kategori || "Pengumuman",
                      tanggal_kegiatan: b.tanggal_kegiatan ?? "",
                      published: b.published ?? true,
                      gambar_url: b.gambar_url ?? null,
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border"
                  aria-label="Edit pengumuman"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/40 text-destructive"
                  aria-label="Hapus pengumuman"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TabBonus() {
  const qc = useQueryClient();
  const { data: siswa } = useSuspenseQuery({
    queryKey: ["panel-siswa"],
    queryFn: () => daftarSiswa(),
  });
  const kirim = useServerFn(kirimKoinBonus);
  const [form, setForm] = useState({ userId: "", kegiatan: "", jumlah: 10 });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const hasil = await kirim({
        data: {
          userId: form.userId,
          kegiatan: form.kegiatan,
          jumlah: Number(form.jumlah) || 0,
        },
      });
      toast.success(`Poin bonus terkirim. Saldo siswa kini ${hasil.saldoKoin} poin.`);
      setForm({ userId: "", kegiatan: "", jumlah: 10 });
      await qc.invalidateQueries({ queryKey: ["panel-siswa"] });
      await qc.invalidateQueries({ queryKey: ["panel-statistik"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim poin bonus");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Bonus Kegiatan Sekolah</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Berikan poin apresiasi atas ekstrakurikuler, juara lomba, atau kepengurusan OSIS.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className={labelClass}>Cari Nama Siswa</label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Pilih siswa</option>
              {siswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} {s.kelas ? `- Kelas ${s.kelas}` : ""} ({s.koin} koin)
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div>
              <label className={labelClass}>Nama Kegiatan / Prestasi</label>
              <input
                value={form.kegiatan}
                onChange={(e) => setForm({ ...form, kegiatan: e.target.value })}
                placeholder="Contoh: Juara 1 Lomba Cerdas Cermat"
                maxLength={120}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Jumlah Poin Bonus</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={form.jumlah}
                onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) || 0 })}
                className={inputClass}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
          >
            <Coins className="h-4 w-4" /> {loading ? "Mengirim..." : "Kirim Poin Bonus"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">Saldo Poin Siswa</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Nama</th>
                <th className="py-2 pr-4">Kelas</th>
                <th className="py-2">Poin</th>
              </tr>
            </thead>
            <tbody>
              {siswa.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2.5 pr-4 font-semibold">{s.nama}</td>
                  <td className="py-2.5 pr-4 font-semibold text-muted-foreground">
                    {s.kelas ?? "-"}
                  </td>
                  <td className="py-2.5 font-extrabold text-accent-foreground">{s.koin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TabValidasi() {
  const qc = useQueryClient();
  const { data: antrean } = useSuspenseQuery({
    queryKey: ["panel-penukaran"],
    queryFn: () => antreanPenukaran(),
    refetchInterval: 15000,
  });
  const selesaikan = useServerFn(selesaikanPenukaran);
  const [prosesId, setProsesId] = useState<string | null>(null);

  async function tandaiSelesai(id: string) {
    setProsesId(id);
    try {
      await selesaikan({ data: { id } });
      toast.success("Hadiah ditandai sudah diserahkan");
      await qc.invalidateQueries({ queryKey: ["panel-penukaran"] });
      await qc.invalidateQueries({ queryKey: ["panel-statistik"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui status");
    } finally {
      setProsesId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Validasi Hadiah Toko</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Antrean siswa yang menukarkan poin dan menunggu hadiah diserahkan.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Nama Siswa</th>
                <th className="py-2 pr-4">Hadiah Diklaim</th>
                <th className="py-2 pr-4">Kode Voucher</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {antrean.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center font-semibold text-muted-foreground">
                    Belum ada penukaran hadiah.
                  </td>
                </tr>
              )}
              {antrean.map((r) => {
                const selesai = r.status === "selesai";
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-3 pr-4 font-extrabold">
                      {r.namaSiswa}
                      {r.kelas ? (
                        <span className="ml-1 text-xs font-semibold text-muted-foreground">
                          ({r.kelas})
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 font-semibold">{r.namaHadiah}</td>
                    <td className="py-3 pr-4 font-mono text-xs font-bold">
                      {r.kodeVoucher ?? "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                          selesai
                            ? "bg-primary/10 text-primary"
                            : "bg-accent-soft text-accent-foreground"
                        }`}
                      >
                        {selesai ? "Sudah Diambil" : "Belum Diambil"}
                      </span>
                    </td>
                    <td className="py-3">
                      {selesai ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4" /> Selesai
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => tandaiSelesai(r.id)}
                          disabled={prosesId === r.id}
                          className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />{" "}
                          {prosesId === r.id ? "Memproses..." : "Selesai Diserahkan"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TabPengaturan() {
  const qc = useQueryClient();
  const { data: awal } = useSuspenseQuery({
    queryKey: PENGATURAN_QUERY_KEY,
    queryFn: () => getPengaturanSekolah(),
  });
  const simpan = useServerFn(simpanPengaturanSekolah);
  const [form, setForm] = useState<PengaturanSekolah>(awal);
  const [proses, setProses] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(awal), [awal]);

  async function pilihLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG/JPG/WebP).");
      return;
    }
    // Kecilkan logo ke maks 256px agar ringan dan disimpan sebagai gambar tersemat.
    const bitmap = await createImageBitmap(file);
    const skala = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * skala);
    canvas.height = Math.round(bitmap.height * skala);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    if (dataUrl.length > 400_000) {
      toast.error("Logo terlalu rumit/besar. Gunakan gambar yang lebih sederhana.");
      return;
    }
    setForm((f) => ({ ...f, logo_url: dataUrl }));
  }

  async function pilihHero(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG/JPG/WebP).");
      return;
    }
    try {
      const dataUrl = await kompresGambar(file, 1400, 900_000);
      setForm((f) => ({ ...f, hero_url: dataUrl }));
      toast.success("Gambar beranda siap. Tekan Simpan Pengaturan.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses gambar.");
    }
  }

  function terapkanTautanMaps(url: string) {
    const titik = koordinatDariTautanMaps(url);
    if (!titik) {
      toast.error("Koordinat tidak ditemukan. Salin tautan lengkap dari Google Maps.");
      return;
    }
    setForm((f) => ({ ...f, maps_url: url, latitude: titik.lat, longitude: titik.lng }));
    toast.success("Lokasi diambil dari Google Maps.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_sekolah.trim()) {
      toast.error("Nama sekolah wajib diisi.");
      return;
    }
    setProses(true);
    try {
      await simpan({ data: form });
      await qc.invalidateQueries({ queryKey: PENGATURAN_QUERY_KEY });
      toast.success("Pengaturan sekolah tersimpan. Tampilan diperbarui.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pengaturan.");
    } finally {
      setProses(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold">Pengaturan Sekolah</h1>
      <p className="mb-6 text-sm font-semibold text-muted-foreground">
        Nama, logo, dan alamat di sini tampil di menu atas, dashboard siswa, panel guru, dan footer.
      </p>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-card">
          <div>
            <label className={labelClass}>Nama Sekolah</label>
            <input
              className={inputClass}
              value={form.nama_sekolah}
              onChange={(e) => setForm({ ...form, nama_sekolah: e.target.value })}
              placeholder="SMPN 26 BANDUNG"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Tagline / Moto</label>
            <input
              className={inputClass}
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Belajar Seru, Kumpulkan Poin"
            />
          </div>
          <div>
            <label className={labelClass}>Alamat</label>
            <textarea
              className={`${inputClass} min-h-24`}
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              placeholder="Jl. Sarimanah 23, Bandung"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Telepon</label>
              <input
                className={inputClass}
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                placeholder="(022) 2012277"
              />
            </div>
            <div>
              <label className={labelClass}>Email Sekolah</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@smpn26bdg.sch.id"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>NPSN</label>
              <input
                className={inputClass}
                value={form.npsn}
                onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                placeholder="20219283"
              />
            </div>
            <div>
              <label className={labelClass}>Akreditasi</label>
              <input
                className={inputClass}
                value={form.akreditasi}
                onChange={(e) => setForm({ ...form, akreditasi: e.target.value })}
                placeholder="A"
              />
            </div>
            <div>
              <label className={labelClass}>Kepala Sekolah</label>
              <input
                className={inputClass}
                value={form.kepala_sekolah}
                onChange={(e) => setForm({ ...form, kepala_sekolah: e.target.value })}
                placeholder="Nama kepala sekolah"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="mb-3 flex items-center gap-2 font-display text-base font-extrabold">
              <MapPin className="h-4 w-4" /> Lokasi Sekolah
            </p>
            <label className={labelClass}>Tautan Google Maps</label>
            <div className="flex flex-wrap gap-2">
              <input
                className={`${inputClass} min-w-[220px] flex-1`}
                value={form.maps_url}
                onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
                onBlur={(e) => e.target.value && terapkanTautanMaps(e.target.value)}
                placeholder="Tempel tautan dari Google Maps (Bagikan > Salin tautan)"
              />
              <button
                type="button"
                onClick={() => terapkanTautanMaps(form.maps_url)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
              >
                <MapPin className="h-4 w-4" /> Ambil Lokasi
              </button>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Lintang (latitude)</label>
                <input
                  className={inputClass}
                  value={form.latitude ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="-6.8845"
                />
              </div>
              <div>
                <label className={labelClass}>Bujur (longitude)</label>
                <input
                  className={inputClass}
                  value={form.longitude ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="107.5731"
                />
              </div>
            </div>
            {form.latitude != null && form.longitude != null && (
              <iframe
                title="Peta lokasi sekolah"
                src={embedPeta(form.latitude, form.longitude)}
                className="mt-3 h-56 w-full rounded-2xl border border-border"
                loading="lazy"
              />
            )}
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="mb-3 flex items-center gap-2 font-display text-base font-extrabold">
              <Share2 className="h-4 w-4" /> Media Sosial
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["instagram", "Instagram", "https://instagram.com/smpn26bdg"],
                  ["facebook", "Facebook", "https://facebook.com/smpn26bdg"],
                  ["youtube", "YouTube", "https://youtube.com/@smpn26bdg"],
                  ["tiktok", "TikTok", "https://tiktok.com/@smpn26bdg"],
                  ["whatsapp", "WhatsApp", "0895338573512"],
                ] as const
              ).map(([kunci, label, contoh]) => (
                <div key={kunci}>
                  <label className={labelClass}>{label}</label>
                  <input
                    className={inputClass}
                    value={form[kunci]}
                    onChange={(e) => setForm({ ...form, [kunci]: e.target.value })}
                    placeholder={contoh}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={proses}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {proses ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <p className={labelClass}>Logo Sekolah</p>
          <div className="mt-3 grid place-items-center rounded-2xl bg-muted p-6">
            {form.logo_url ? (
              <img
                src={form.logo_url}
                alt="Pratinjau logo sekolah"
                className="h-32 w-32 object-contain"
              />
            ) : (
              <span className="grid h-32 w-32 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <ImageIcon className="h-12 w-12" />
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void pilihLogo(f);
              e.target.value = "";
            }}
          />
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              <Upload className="h-4 w-4" /> Unggah Logo
            </button>
            {form.logo_url && (
              <button
                type="button"
                onClick={() => setForm({ ...form, logo_url: null })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-input px-4 py-2.5 text-sm font-extrabold text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" /> Hapus Logo
              </button>
            )}
          </div>
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            PNG/JPG/WebP, disarankan persegi. Logo otomatis dikecilkan agar ringan.
          </p>

          <p className={`${labelClass} mt-6`}>Gambar Beranda</p>
          <div className="mt-3 overflow-hidden rounded-2xl bg-muted">
            {form.hero_url ? (
              <img
                src={form.hero_url}
                alt="Pratinjau gambar beranda"
                className="h-40 w-full object-cover"
              />
            ) : (
              <span className="grid h-40 w-full place-items-center text-muted-foreground">
                <ImageIcon className="h-10 w-10" />
              </span>
            )}
          </div>
          <input
            ref={heroRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void pilihHero(f);
              e.target.value = "";
            }}
          />
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => heroRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              <Upload className="h-4 w-4" /> Unggah Gambar Beranda
            </button>
            {form.hero_url && (
              <button
                type="button"
                onClick={() => setForm({ ...form, hero_url: null })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-input px-4 py-2.5 text-sm font-extrabold text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" /> Kembalikan Gambar Bawaan
              </button>
            )}
          </div>
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            Gambar ini tampil di halaman depan. Disarankan mendatar (landscape); otomatis
            dikecilkan agar ringan.
          </p>

          <p className={`${labelClass} mt-6`}>Pratinjau Menu Atas</p>
          <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-gradient-navy p-3 text-primary-foreground">
            <LogoSekolah className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block font-display text-base font-extrabold">
                {form.nama_sekolah || "Nama Sekolah"}
              </span>
              <span className="block text-[11px] font-semibold opacity-75">{form.tagline}</span>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

function TabPerilaku() {
  const qc = useQueryClient();
  const { pengguna: penggunaAktif } = useAuth();
  const bolehKelolaKatalog = penggunaAktif?.peran === "admin";
  const { data: siswa } = useSuspenseQuery({
    queryKey: ["panel-siswa"],
    queryFn: () => daftarSiswa(),
  });
  const { data: katalog } = useSuspenseQuery({
    queryKey: ["panel-katalog-perilaku"],
    queryFn: () => katalogPerilaku(),
  });
  const { data: riwayat } = useSuspenseQuery({
    queryKey: ["panel-riwayat-perilaku"],
    queryFn: () => riwayatPerilakuSekolah(),
    refetchInterval: 20000,
  });
  const catat = useServerFn(catatPerilaku);
  const ubahCatatan = useServerFn(ubahPerilaku);
  const hapusCatatan = useServerFn(hapusPerilaku);

  const [form, setForm] = useState({ userId: "", kategori: "", katalogId: "", catatan: "" });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ katalogId: "", catatan: "" });

  async function segarkanPerilaku() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["panel-riwayat-perilaku"] }),
      qc.invalidateQueries({ queryKey: ["panel-siswa"] }),
      qc.invalidateQueries({ queryKey: ["panel-statistik"] }),
    ]);
  }

  async function simpanEdit(id: string) {
    try {
      await ubahCatatan({ data: { id, katalogId: editForm.katalogId, catatan: editForm.catatan } });
      toast.success("Catatan perilaku diperbarui. Poin siswa ikut disesuaikan.");
      setEditId(null);
      await segarkanPerilaku();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui catatan");
    }
  }

  async function hapusCatatanPerilaku(id: string, nama: string) {
    if (!confirm(`Hapus catatan perilaku milik ${nama}? Poin yang diberikan akan ditarik kembali.`))
      return;
    try {
      await hapusCatatan({ data: { id } });
      toast.success("Catatan perilaku dihapus.");
      if (editId === id) setEditId(null);
      await segarkanPerilaku();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus catatan");
    }
  }

  const kategoriList = [...new Set(katalog.map((k) => k.kategori))];
  const jenisList = katalog.filter((k) => k.kategori === form.kategori);
  const terpilih = katalog.find((k) => k.id === form.katalogId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const hasil = await catat({
        data: { userId: form.userId, katalogId: form.katalogId, catatan: form.catatan },
      });
      toast.success(
        `Tercatat! Siswa mendapat ${hasil.poin} poin dan ${hasil.air} air untuk Pohon Kebaikan.`,
      );
      setForm({ userId: "", kategori: "", katalogId: "", catatan: "" });
      await qc.invalidateQueries({ queryKey: ["panel-riwayat-perilaku"] });
      await qc.invalidateQueries({ queryKey: ["panel-siswa"] });
      await qc.invalidateQueries({ queryKey: ["panel-statistik"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mencatat perilaku");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Perilaku Terpuji (RAMAH)</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Catat perilaku terpuji siswa. Poin langsung masuk ke saldo siswa dan menyiram Pohon
          Kebaikannya.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className={labelClass}>Nama Siswa</label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Pilih siswa</option>
              {siswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} {s.kelas ? `- Kelas ${s.kelas}` : ""} ({s.koin} poin)
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Kategori RAMAH</label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value, katalogId: "" })}
                className={inputClass}
                required
              >
                <option value="">Pilih kategori</option>
                {kategoriList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Jenis Perilaku</label>
              <select
                value={form.katalogId}
                onChange={(e) => setForm({ ...form, katalogId: e.target.value })}
                className={inputClass}
                required
                disabled={!form.kategori}
              >
                <option value="">Pilih perilaku</option>
                {jenisList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.jenis} ({k.poin} poin)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Catatan (opsional)</label>
            <input
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Contoh: membantu teman yang jatuh di lapangan"
              maxLength={200}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
          >
            <Sprout className="h-4 w-4" />
            {loading
              ? "Menyimpan..."
              : terpilih
                ? `Catat & Beri ${terpilih.poin} Poin`
                : "Catat Perilaku Terpuji"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">Catatan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Siswa</th>
                <th className="py-2 pr-4">Kategori</th>
                <th className="py-2 pr-4">Perilaku</th>
                <th className="py-2 pr-4">Poin</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((r) =>
                editId === r.id ? (
                  <tr key={r.id} className="border-t border-border bg-muted/40">
                    <td className="py-2.5 pr-4 font-semibold">
                      {r.nama}
                      {r.kelas ? ` (${r.kelas})` : ""}
                    </td>
                    <td colSpan={2} className="py-2.5 pr-4">
                      <div className="grid gap-2 md:grid-cols-2">
                        <select
                          value={editForm.katalogId}
                          onChange={(e) => setEditForm({ ...editForm, katalogId: e.target.value })}
                          className={inputClass}
                        >
                          {katalog.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.kategori} - {k.jenis} (+{k.poin})
                            </option>
                          ))}
                        </select>
                        <input
                          value={editForm.catatan}
                          onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })}
                          placeholder="Catatan"
                          maxLength={200}
                          className={inputClass}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 pr-4" />
                    <td className="py-2.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => simpanEdit(r.id)}
                          className="rounded-full bg-accent px-3 py-1.5 text-xs font-extrabold text-accent-foreground"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-extrabold"
                        >
                          Batal
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2.5 pr-4 font-semibold">
                      {r.nama}
                      {r.kelas ? ` (${r.kelas})` : ""}
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-muted-foreground">{r.kategori}</td>
                    <td className="py-2.5 pr-4 font-semibold">{r.jenis}</td>
                    <td className="py-2.5 pr-4 font-extrabold text-accent-foreground">+{r.poin}</td>
                    <td className="py-2.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(r.id);
                            setEditForm({ katalogId: r.katalogId ?? "", catatan: r.catatan ?? "" });
                          }}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-extrabold"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => hapusCatatanPerilaku(r.id, r.nama)}
                          className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-extrabold text-destructive"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
              {riwayat.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center font-semibold text-muted-foreground">
                    Belum ada catatan perilaku terpuji.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {bolehKelolaKatalog && <KelolaKatalogPerilaku katalog={katalog} />}
    </div>
  );
}

function TabPoin() {
  const qc = useQueryClient();
  const { data: pengaturan } = useSuspenseQuery({
    queryKey: ["panel-pengaturan-poin"],
    queryFn: () => listPengaturanPoin(),
  });
  const simpan = useServerFn(simpanPengaturanPoin);
  const tambah = useServerFn(tambahPengaturanPoin);
  const hapus = useServerFn(hapusPengaturanPoin);
  const [nilai, setNilai] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [baru, setBaru] = useState({ label: "", deskripsi: "", nilai: 10 });
  const [menambah, setMenambah] = useState(false);

  async function tambahKategori(e: React.FormEvent) {
    e.preventDefault();
    setMenambah(true);
    try {
      await tambah({
        data: {
          label: baru.label.trim(),
          deskripsi: baru.deskripsi.trim(),
          nilai: Number(baru.nilai) || 0,
        },
      });
      toast.success("Kategori poin ditambahkan.");
      setBaru({ label: "", deskripsi: "", nilai: 10 });
      await qc.invalidateQueries({ queryKey: ["panel-pengaturan-poin"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah kategori poin");
    } finally {
      setMenambah(false);
    }
  }

  async function hapusKategori(kunci: string, label: string) {
    if (!window.confirm(`Hapus kategori poin "${label}"?`)) return;
    try {
      await hapus({ data: { kunci } });
      toast.success("Kategori poin dihapus.");
      await qc.invalidateQueries({ queryKey: ["panel-pengaturan-poin"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kategori poin");
    }
  }

  useEffect(() => {
    setNilai(Object.fromEntries(pengaturan.map((p) => [p.kunci, p.nilai])));
  }, [pengaturan]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await simpan({
        data: {
          nilai: pengaturan.map((p) => ({
            kunci: p.kunci,
            nilai: Number(nilai[p.kunci] ?? p.nilai) || 0,
          })),
        },
      });
      toast.success("Pengaturan poin tersimpan.");
      await qc.invalidateQueries({ queryKey: ["panel-pengaturan-poin"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pengaturan poin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Kelola Poin</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Atur berapa poin yang didapat siswa dari tiap kegiatan. Perubahan langsung berlaku untuk
          semua siswa.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <form onSubmit={submit} className="grid gap-4">
          {pengaturan.map((p) => (
            <div
              key={p.kunci}
              className="grid items-center gap-3 rounded-2xl bg-muted/50 p-4 md:grid-cols-[1fr_160px_auto]"
            >
              <div>
                <p className="text-sm font-extrabold">{p.label}</p>
                <p className="text-xs font-semibold text-muted-foreground">{p.deskripsi}</p>
              </div>
              <input
                type="number"
                min={0}
                max={10000}
                value={nilai[p.kunci] ?? p.nilai}
                onChange={(e) => setNilai({ ...nilai, [p.kunci]: Number(e.target.value) || 0 })}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => hapusKategori(p.kunci, p.label)}
                className="justify-self-start rounded-full bg-destructive px-4 py-2 text-xs font-extrabold text-destructive-foreground"
              >
                Hapus
              </button>
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {loading ? "Menyimpan..." : "Simpan Pengaturan Poin"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-1 text-lg font-extrabold">Tambah Kategori Poin</h2>
        <p className="mb-4 text-sm font-semibold text-muted-foreground">
          Contoh: Jawaban Kuis Benar, Selesai Modul, Piket Kelas.
        </p>
        <form onSubmit={tambahKategori} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]">
          <input
            className={inputClass}
            placeholder="Nama kategori"
            value={baru.label}
            onChange={(e) => setBaru({ ...baru, label: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Keterangan (opsional)"
            value={baru.deskripsi}
            onChange={(e) => setBaru({ ...baru, deskripsi: e.target.value })}
          />
          <input
            className={inputClass}
            type="number"
            min={0}
            max={10000}
            value={baru.nilai}
            onChange={(e) => setBaru({ ...baru, nilai: Number(e.target.value) || 0 })}
            required
          />
          <button
            type="submit"
            disabled={menambah || baru.label.trim().length < 2}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-pop disabled:opacity-60"
          >
            {menambah ? "Menambah..." : "Tambah"}
          </button>
        </form>
      </section>
    </div>
  );
}

function TabKelas() {
  const qc = useQueryClient();
  const { pengguna } = useAuth();
  const bolehKelola = pengguna?.peran === "admin";
  const [pilihTingkat, setPilihTingkat] = useState("semua");
  const { data: kelas } = useSuspenseQuery({
    queryKey: ["panel-kelas"],
    queryFn: () => listKelas(),
  });
  const kelasTampil =
    pilihTingkat === "semua" ? kelas : kelas.filter((k) => k.tingkat === pilihTingkat);
  const { data: siswa } = useSuspenseQuery({
    queryKey: ["panel-siswa"],
    queryFn: () => daftarSiswa(),
  });

  const buat = useServerFn(createKelas);
  const ubah = useServerFn(updateKelas);
  const hapus = useServerFn(deleteKelas);
  const pindahkan = useServerFn(setKelasSiswa);

  const [editing, setEditing] = useState<ItemKelas | null>(null);
  const [form, setForm] = useState({ tingkat: "VII", rombel: "", waliKelas: "", aktif: true });
  const [loading, setLoading] = useState(false);

  function reset() {
    setEditing(null);
    setForm({ tingkat: "VII", rombel: "", waliKelas: "", aktif: true });
  }

  async function segarkan() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["panel-kelas"] }),
      qc.invalidateQueries({ queryKey: ["panel-progres-kelas"] }),
      qc.invalidateQueries({ queryKey: ["panel-siswa"] }),
    ]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await ubah({ data: { id: editing.id, ...form } });
        toast.success("Kelas diperbarui");
      } else {
        await buat({ data: form });
        toast.success("Kelas baru ditambahkan");
      }
      reset();
      await segarkan();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan kelas");
    } finally {
      setLoading(false);
    }
  }

  async function hapusKelas(k: ItemKelas) {
    if (!confirm(`Hapus kelas ${k.nama}?`)) return;
    try {
      await hapus({ data: { id: k.id } });
      toast.success("Kelas dihapus");
      if (editing?.id === k.id) reset();
      await segarkan();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kelas");
    }
  }

  async function ubahKelasSiswa(userId: string, nilai: string) {
    try {
      await pindahkan({ data: { userId, kelas: nilai } });
      toast.success("Kelas siswa diperbarui");
      await segarkan();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan siswa");
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Kelas &amp; Rombel</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Atur daftar kelas dan rombongan belajar, lalu tempatkan siswa. Data ini langsung dipakai
          di Dasbor Progres per Kelas.
        </p>
      </div>

      {(bolehKelola || editing) && (
      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">
          {editing ? `Ubah Kelas ${editing.nama}` : "Tambah Kelas Baru"}
        </h2>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-[120px_1fr_1fr_auto] md:items-end">
          <div>
            <label className={labelClass}>Tingkat</label>
            <select
              value={form.tingkat}
              onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
              className={inputClass}
              required
            >
              {KELAS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rombel</label>
            <input
              value={form.rombel}
              onChange={(e) => setForm({ ...form, rombel: e.target.value })}
              placeholder="Contoh: A"
              maxLength={20}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Wali Kelas</label>
            <input
              value={form.waliKelas}
              onChange={(e) => setForm({ ...form, waliKelas: e.target.value })}
              placeholder="Nama wali kelas"
              maxLength={120}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {loading ? "Menyimpan..." : editing ? "Simpan" : "Tambah"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-extrabold"
              >
                <X className="h-4 w-4" /> Batal
              </button>
            )}
          </div>
        </form>
      </section>
      )}

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-extrabold">Daftar Kelas</h2>
          <select
            value={pilihTingkat}
            onChange={(e) => setPilihTingkat(e.target.value)}
            className="ml-auto rounded-2xl border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
            aria-label="Pilih tingkat"
          >
            <option value="semua">Semua Tingkat</option>
            {KELAS.map((k) => (
              <option key={k} value={k}>
                Tingkat {k}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Kelas</th>
                <th className="py-2 pr-4">Wali Kelas</th>
                <th className="py-2 pr-4">Jumlah Siswa</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kelasTampil.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center font-semibold text-muted-foreground">
                    Belum ada kelas.
                  </td>
                </tr>
              )}
              {kelasTampil.map((k) => (
                <tr key={k.id} className="border-t border-border">
                  <td className="py-2.5 pr-4 font-extrabold">{k.nama}</td>
                  <td className="py-2.5 pr-4 font-semibold text-muted-foreground">
                    {k.waliKelas || "-"}
                  </td>
                  <td className="py-2.5 pr-4 font-semibold">{k.jumlahSiswa}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                        k.aktif ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {k.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {bolehKelola && <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(k);
                          setForm({
                            tingkat: k.tingkat,
                            rombel: k.rombel,
                            waliKelas: k.waliKelas,
                            aktif: k.aktif,
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-extrabold"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => hapusKelas(k)}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-extrabold text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">Penempatan Siswa</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Nama Siswa</th>
                <th className="py-2">Kelas</th>
              </tr>
            </thead>
            <tbody>
              {siswa.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-6 text-center font-semibold text-muted-foreground">
                    Belum ada siswa terdaftar.
                  </td>
                </tr>
              )}
              {siswa.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2.5 pr-4 font-semibold">{s.nama}</td>
                  <td className="py-2.5">
                    {!bolehKelola ? (
                      <span className="font-semibold">{s.kelas || "Belum ditempatkan"}</span>
                    ) : (
                    <select
                      value={kelas.some((k) => k.nama === s.kelas) ? (s.kelas ?? "") : ""}
                      onChange={(e) => ubahKelasSiswa(s.id, e.target.value)}
                      className="rounded-2xl border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
                    >
                      <option value="">Belum ditempatkan</option>
                      {kelas.map((k) => (
                        <option key={k.id} value={k.nama}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const KATEGORI_HADIAH = ["Alat Tulis", "Kupon Kantin", "Kupon Spesial", "Merchandise"];
const TIPE_HADIAH = ["Barang Fisik", "Kupon Digital"];

function TabHadiah() {
  const qc = useQueryClient();
  const { data: hadiah } = useSuspenseQuery({
    queryKey: ["panel-hadiah"],
    queryFn: () => listHadiah(),
  });
  const buat = useServerFn(createHadiah);
  const ubah = useServerFn(updateHadiah);
  const hapus = useServerFn(deleteHadiah);

  const kosong = {
    nama: "",
    kategori: KATEGORI_HADIAH[0],
    tipe: TIPE_HADIAH[0],
    ikon: "Gift",
    harga_koin: 100,
    stok: 10,
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(kosong);
  const [loading, setLoading] = useState(false);

  async function segarkan() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["panel-hadiah"] }),
      qc.invalidateQueries({ queryKey: ["hadiah"] }),
    ]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await ubah({ data: { id: editingId, ...form } });
        toast.success("Hadiah diperbarui");
      } else {
        await buat({ data: form });
        toast.success("Hadiah baru ditambahkan");
      }
      setEditingId(null);
      setForm(kosong);
      await segarkan();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan hadiah");
    } finally {
      setLoading(false);
    }
  }

  async function hapusHadiah(id: string, nama: string) {
    if (!confirm(`Hapus hadiah ${nama}?`)) return;
    try {
      await hapus({ data: { id } });
      toast.success("Hadiah dihapus");
      await segarkan();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus hadiah");
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Kelola Hadiah Toko</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Tambah, ubah, atau hapus hadiah yang tampil di Toko Reward siswa.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">
          {editingId ? "Ubah Hadiah" : "Tambah Hadiah"}
        </h2>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Nama Hadiah</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className={inputClass}
              maxLength={120}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Kategori</label>
            <select
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className={inputClass}
            >
              {KATEGORI_HADIAH.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipe</label>
            <select
              value={form.tipe}
              onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              className={inputClass}
            >
              {TIPE_HADIAH.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Harga (Poin)</label>
            <input
              type="number"
              min={1}
              value={form.harga_koin}
              onChange={(e) => setForm({ ...form, harga_koin: Number(e.target.value) || 0 })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Stok</label>
            <input
              type="number"
              min={0}
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: Number(e.target.value) || 0 })}
              className={inputClass}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Nama Ikon (Lucide)</label>
            <input
              value={form.ikon}
              onChange={(e) => setForm({ ...form, ikon: e.target.value })}
              placeholder="Contoh: Gift, Ticket, Shirt"
              className={inputClass}
              required
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {loading ? "Menyimpan..." : "Simpan Hadiah"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(kosong);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-extrabold"
              >
                <X className="h-4 w-4" /> Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-extrabold">Daftar Hadiah</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Nama</th>
                <th className="py-2 pr-4">Kategori</th>
                <th className="py-2 pr-4">Poin</th>
                <th className="py-2 pr-4">Stok</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {hadiah.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center font-semibold text-muted-foreground">
                    Belum ada hadiah.
                  </td>
                </tr>
              )}
              {hadiah.map((h) => (
                <tr key={h.id} className="border-t border-border">
                  <td className="py-2.5 pr-4 font-extrabold">{h.nama}</td>
                  <td className="py-2.5 pr-4 font-semibold text-muted-foreground">{h.kategori}</td>
                  <td className="py-2.5 pr-4 font-extrabold text-accent-foreground">
                    {h.harga_koin}
                  </td>
                  <td className="py-2.5 pr-4 font-semibold">{h.stok}</td>
                  <td className="py-2.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(h.id);
                          setForm({
                            nama: h.nama,
                            kategori: h.kategori,
                            tipe: h.tipe,
                            ikon: h.ikon,
                            harga_koin: h.harga_koin,
                            stok: h.stok,
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-extrabold"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => hapusHadiah(h.id, h.nama)}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-extrabold text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
