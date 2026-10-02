import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { tambahAkun, type AkunBaru } from "@/lib/akun.functions";

const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent";
const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

type Peran = "siswa" | "guru" | "admin";

function normPeran(v: unknown): Peran {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "guru" || s === "admin" ? s : "siswa";
}

export function TambahAkun() {
  const qc = useQueryClient();
  const kirim = useServerFn(tambahAkun);
  const fileRef = useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [peran, setPeran] = useState<Peran>("siswa");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const [pratinjau, setPratinjau] = useState<AkunBaru[]>([]);
  const [proses, setProses] = useState(false);

  const jalankan = async (akun: AkunBaru[]) => {
    setProses(true);
    try {
      const hasil = await kirim({ data: { akun } });
      const ok = hasil.filter((h) => h.ok).length;
      const gagal = hasil.filter((h) => !h.ok);
      if (ok) toast.success(`${ok} akun berhasil dibuat`);
      if (gagal.length)
        toast.error(`${gagal.length} gagal: ${gagal.slice(0, 3).map((g) => `${g.email} (${g.pesan})`).join(", ")}`);
      qc.invalidateQueries({ queryKey: ["admin-akun"] });
      return ok > 0;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat akun");
      return false;
    } finally {
      setProses(false);
    }
  };

  const simpanSatu = async (): Promise<void> => {
    if (password.length < 6) { toast.error("Kata sandi minimal 6 karakter"); return; }
    const ok = await jalankan([
      { nama, email, password, peran, kelas: kelas || undefined, mapel: mapel || undefined },
    ]);
    if (ok) {
      setNama(""); setEmail(""); setPassword(""); setKelas(""); setMapel("");
    }
  };

  const unduhTemplate = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet([
      { Nama: "Budi Santoso", Email: "budi@contoh.sch.id", Password: "rahasia123", Peran: "siswa", Kelas: "7A", Mapel: "", "Wali Kelas": "", "Kelas Diampu": "" },
      { Nama: "Ibu Sari", Email: "sari@contoh.sch.id", Password: "rahasia123", Peran: "guru", Kelas: "", Mapel: "IPA", "Wali Kelas": "7A", "Kelas Diampu": "7A, 7B, 8C" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Akun");
    XLSX.writeFile(wb, "template-akun.xlsx");
  };

  const bacaFile = async (file: File) => {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]!]!);
      const ambil = (r: Record<string, unknown>, k: string) => {
        const key = Object.keys(r).find((x) => x.trim().toLowerCase() === k);
        return key ? String(r[key] ?? "").trim() : "";
      };
      const daftar: AkunBaru[] = rows
        .map((r) => ({
          nama: ambil(r, "nama"),
          email: ambil(r, "email").toLowerCase(),
          password: ambil(r, "password") || ambil(r, "kata sandi"),
          peran: normPeran(ambil(r, "peran")),
          kelas: ambil(r, "kelas") || undefined,
          mapel: ambil(r, "mapel") || undefined,
          waliKelas: ambil(r, "wali kelas") || undefined,
          kelasDiampu: ambil(r, "kelas diampu").split(",").map((x) => x.trim()).filter(Boolean),
        }))
        .filter((a) => a.nama && a.email.includes("@") && a.password.length >= 6);
      if (!daftar.length) toast.error("Tidak ada baris valid (cek Nama, Email, Password min. 6 karakter)");
      else if (daftar.length < rows.length) toast.warning(`${rows.length - daftar.length} baris dilewati karena tidak lengkap`);
      setPratinjau(daftar);
    } catch {
      toast.error("File tidak bisa dibaca. Gunakan format .xlsx atau .csv");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <section className="card-fun mb-6 p-6">
      <h2 className="text-xl font-extrabold">➕ Tambah Akun</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="ta-nama">Nama</label>
          <input id="ta-nama" className={inputClass} value={nama} onChange={(e) => setNama(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ta-email">Email</label>
          <input id="ta-email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ta-pass">Kata sandi</label>
          <input id="ta-pass" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 karakter" />
        </div>
        <div>
          <label className={labelClass} htmlFor="ta-peran">Peran</label>
          <select id="ta-peran" className={inputClass} value={peran} onChange={(e) => setPeran(e.target.value as Peran)}>
            <option value="siswa">Siswa</option>
            <option value="guru">Guru</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {peran === "siswa" ? (
          <div>
            <label className={labelClass} htmlFor="ta-kelas">Kelas</label>
            <input id="ta-kelas" className={inputClass} value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="mis. 7A" />
          </div>
        ) : (
          <div>
            <label className={labelClass} htmlFor="ta-mapel">Mapel</label>
            <input id="ta-mapel" className={inputClass} value={mapel} onChange={(e) => setMapel(e.target.value)} />
          </div>
        )}
        <div className="flex items-end">
          <button
            onClick={simpanSatu}
            disabled={proses || !nama.trim() || !email.trim() || !password}
            className="pop rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-40"
          >
            Tambah Akun
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-input p-4">
        <p className="font-extrabold">📥 Tambah masal dari Excel</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Kolom: Nama, Email, Password, Peran (siswa/guru/admin), Kelas, Mapel, Wali Kelas, Kelas Diampu (untuk guru, pisahkan dengan koma).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={unduhTemplate} className="pop rounded-full bg-secondary px-4 py-2 text-xs font-extrabold text-secondary-foreground">
            Unduh Template
          </button>
          <button onClick={() => fileRef.current?.click()} className="pop rounded-full bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground">
            Pilih File Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && bacaFile(e.target.files[0])} />
        </div>
        {pratinjau.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-extrabold">Pratinjau ({pratinjau.length} akun)</p>
            <ul className="mt-2 max-h-64 overflow-auto rounded-xl bg-secondary/60 p-3 text-sm font-semibold">
              {pratinjau.map((a, i) => (
                <li key={i} className="truncate">
                  {a.nama} · {a.email} · {a.peran}{a.kelas ? ` · ${a.kelas}` : ""}{a.mapel ? ` · ${a.mapel}` : ""}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                disabled={proses}
                onClick={async () => { if (await jalankan(pratinjau)) setPratinjau([]); }}
                className="pop rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-40"
              >
                {proses ? "Menyimpan…" : "Simpan Semua"}
              </button>
              <button onClick={() => setPratinjau([])} className="pop rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground">
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
