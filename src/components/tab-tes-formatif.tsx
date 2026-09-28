import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createTesFormatif,
  deleteTesFormatif,
  listTesFormatif,
} from "@/lib/tes-formatif.functions";

const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent";
const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

export function TabTesFormatif() {
  const qc = useQueryClient();
  const { data: daftar } = useSuspenseQuery({
    queryKey: ["tes-formatif"],
    queryFn: () => listTesFormatif(),
  });
  const buat = useServerFn(createTesFormatif);
  const hapus = useServerFn(deleteTesFormatif);
  const [simpan, setSimpan] = useState(false);
  const [form, setForm] = useState({ judul: "", mapel: "", kelas_target: "", tautan: "", keterangan: "" });

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setSimpan(true);
    try {
      await buat({ data: form });
      toast.success("Tes formatif ditambahkan ke Portal Asesmen");
      setForm({ judul: "", mapel: "", kelas_target: "", tautan: "", keterangan: "" });
      await qc.invalidateQueries({ queryKey: ["tes-formatif"] });
    } catch (err) {
      const pesan = err instanceof Error ? err.message : "Gagal menyimpan";
      toast.error(pesan.includes("Tautan") ? "Tautan harus alamat web lengkap (https://...)" : pesan);
    } finally {
      setSimpan(false);
    }
  }

  async function hapusTes(id: string) {
    if (!confirm("Hapus tes formatif ini?")) return;
    try {
      await hapus({ data: { id } });
      toast.success("Tes formatif dihapus");
      await qc.invalidateQueries({ queryKey: ["tes-formatif"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={kirim} className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-xl font-extrabold">Tambah Tes Formatif</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tempel tautan ujian (Google Form, Quizizz, dll). Tes akan tampil di tab Tes Formatif pada Portal Asesmen.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 sm:col-span-2">
            <span className={labelClass}>Judul Tes</span>
            <input required className={inputClass} value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Tes Formatif Bab 2 - Pecahan" />
          </label>
          <label className="grid gap-1.5 sm:col-span-2">
            <span className={labelClass}>Tautan Ujian</span>
            <input required type="url" className={inputClass} value={form.tautan} onChange={(e) => setForm({ ...form, tautan: e.target.value })} placeholder="https://forms.gle/..." />
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Mata Pelajaran</span>
            <input className={inputClass} value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} placeholder="Matematika" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelClass}>Kelas (opsional)</span>
            <input className={inputClass} value={form.kelas_target} onChange={(e) => setForm({ ...form, kelas_target: e.target.value })} placeholder="VII A, VII B" />
          </label>
          <label className="grid gap-1.5 sm:col-span-2">
            <span className={labelClass}>Keterangan (opsional)</span>
            <textarea rows={2} className={inputClass} value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} placeholder="Dikerjakan paling lambat Jumat, 20 menit." />
          </label>
        </div>
        <button type="submit" disabled={simpan} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60">
          <Plus className="h-4 w-4" /> {simpan ? "Menyimpan..." : "Tambah Tes"}
        </button>
      </form>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-lg font-extrabold">Daftar Tes Formatif ({daftar.length})</h3>
        <ul className="mt-4 grid gap-3">
          {daftar.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background p-4">
              <Link2 className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{t.judul}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[t.mapel, t.kelas_target].filter(Boolean).join(" · ") || "Semua kelas"} — {t.tautan}
                </p>
              </div>
              <a href={t.tautan} target="_blank" rel="noreferrer" className="rounded-full bg-muted p-2" aria-label="Buka tautan">
                <ExternalLink className="h-4 w-4" />
              </a>
              <button type="button" onClick={() => void hapusTes(t.id)} className="rounded-full bg-destructive/10 p-2 text-destructive" aria-label="Hapus">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {daftar.length === 0 && <p className="text-sm text-muted-foreground">Belum ada tes formatif.</p>}
        </ul>
      </div>
    </div>
  );
}
