import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  hapusKatalogPerilaku,
  tambahKatalogPerilaku,
  type ItemKatalog,
} from "@/lib/perilaku.functions";

const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent";
const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

type Baris = { kategori: string; jenis: string; poin: number };

export function KelolaKatalogPerilaku({ katalog }: { katalog: ItemKatalog[] }) {
  const qc = useQueryClient();
  const tambah = useServerFn(tambahKatalogPerilaku);
  const hapus = useServerFn(hapusKatalogPerilaku);
  const fileRef = useRef<HTMLInputElement>(null);

  const kategoriAda = [...new Set(katalog.map((k) => k.kategori))];
  const [kategori, setKategori] = useState("");
  const [kategoriBaru, setKategoriBaru] = useState("");
  const [jenis, setJenis] = useState("");
  const [poin, setPoin] = useState(1);
  const [pratinjau, setPratinjau] = useState<Baris[]>([]);
  const [sibuk, setSibuk] = useState(false);

  async function segarkan() {
    await qc.invalidateQueries({ queryKey: ["panel-katalog-perilaku"] });
  }

  async function kirim(items: Baris[]) {
    setSibuk(true);
    try {
      const h = await tambah({ data: { items } });
      toast.success(
        `${h.ditambah} perilaku ditambahkan${h.dilewati ? `, ${h.dilewati} dilewati (sudah ada)` : ""}.`,
      );
      await segarkan();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
      return false;
    } finally {
      setSibuk(false);
    }
  }

  async function simpanSatu(e: React.FormEvent) {
    e.preventDefault();
    const kat = (kategori === "__baru" ? kategoriBaru : kategori).trim();
    if (!kat || !jenis.trim()) return toast.error("Kategori dan jenis perilaku wajib diisi");
    if (await kirim([{ kategori: kat, jenis: jenis.trim(), poin }])) {
      setJenis("");
      setKategoriBaru("");
      if (kategori === "__baru") setKategori(kat);
    }
  }

  async function unduhTemplate() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([
      ["Kategori", "Jenis Perilaku", "Poin"],
      ["Religius", "Berdoa sebelum belajar", 2],
      ["Mandiri", "Mengerjakan tugas tepat waktu", 3],
    ]);
    ws["!cols"] = [{ wch: 18 }, { wch: 45 }, { wch: 8 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perilaku");
    XLSX.writeFile(wb, "template-perilaku-terpuji.xlsx");
  }

  async function bacaFile(file: File) {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], {
        defval: "",
      });
      const ambil = (r: Record<string, unknown>, kunci: string[]) => {
        const k = Object.keys(r).find((x) => kunci.some((c) => x.toLowerCase().includes(c)));
        return k ? String(r[k]).trim() : "";
      };
      const hasil: Baris[] = rows
        .map((r) => ({
          kategori: ambil(r, ["kategori"]),
          jenis: ambil(r, ["jenis", "perilaku"]),
          poin: Math.round(Number(ambil(r, ["poin", "skor"])) || 1),
        }))
        .filter((b) => b.kategori && b.jenis)
        .map((b) => ({ ...b, poin: Math.min(100, Math.max(1, b.poin)) }));
      if (!hasil.length)
        return toast.error("Tidak ada baris valid. Pastikan kolom: Kategori, Jenis Perilaku, Poin.");
      setPratinjau(hasil);
    } catch {
      toast.error("File tidak bisa dibaca. Gunakan format .xlsx atau .csv");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function hapusItem(k: ItemKatalog) {
    if (!confirm(`Hapus "${k.jenis}" dari katalog? Riwayat lama tetap tersimpan.`)) return;
    try {
      await hapus({ data: { id: k.id } });
      toast.success("Perilaku dihapus dari katalog");
      await segarkan();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-xl font-extrabold">🗂️ Kelola Kategori & Jenis Perilaku</h2>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">
        Tambah satu per satu, atau unggah banyak sekaligus dari file Excel.
      </p>

      <form onSubmit={simpanSatu} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Kategori</label>
          <select className={inputClass} value={kategori} onChange={(e) => setKategori(e.target.value)} required>
            <option value="">Pilih kategori</option>
            {kategoriAda.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
            <option value="__baru">+ Kategori baru…</option>
          </select>
        </div>
        {kategori === "__baru" && (
          <div>
            <label className={labelClass}>Nama kategori baru</label>
            <input className={inputClass} value={kategoriBaru} onChange={(e) => setKategoriBaru(e.target.value)} maxLength={60} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className={labelClass}>Jenis perilaku</label>
          <input className={inputClass} value={jenis} onChange={(e) => setJenis(e.target.value)} maxLength={200} placeholder="Contoh: Membantu teman yang kesulitan" />
        </div>
        <div>
          <label className={labelClass}>Poin</label>
          <input type="number" min={1} max={100} className={inputClass} value={poin} onChange={(e) => setPoin(Number(e.target.value) || 1)} />
        </div>
        <div className="flex items-end">
          <button disabled={sibuk} className="pop rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-40">
            Tambah Perilaku
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-input p-4">
        <p className="font-extrabold">📥 Tambah massal dari Excel</p>
        <p className="text-xs font-semibold text-muted-foreground">
          Kolom: <b>Kategori</b>, <b>Jenis Perilaku</b>, <b>Poin</b> (1–100). Perilaku yang sudah ada otomatis dilewati.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={unduhTemplate} className="pop rounded-full bg-secondary px-4 py-2 text-xs font-extrabold text-secondary-foreground">
            Unduh Template
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="pop rounded-full bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground">
            Pilih File Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && bacaFile(e.target.files[0])} />
        </div>
        {pratinjau.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-extrabold">Pratinjau: {pratinjau.length} baris</p>
            <div className="mt-2 max-h-60 overflow-auto rounded-xl bg-secondary/50">
              <table className="w-full text-left text-xs">
                <thead><tr><th className="p-2">Kategori</th><th className="p-2">Jenis</th><th className="p-2">Poin</th></tr></thead>
                <tbody>
                  {pratinjau.map((b, i) => (
                    <tr key={i} className="border-t border-border"><td className="p-2 font-bold">{b.kategori}</td><td className="p-2">{b.jenis}</td><td className="p-2">{b.poin}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-2">
              <button disabled={sibuk} onClick={async () => { if (await kirim(pratinjau)) setPratinjau([]); }} className="pop rounded-full bg-primary px-5 py-2 text-xs font-extrabold text-primary-foreground disabled:opacity-40">
                Simpan Semua
              </button>
              <button onClick={() => setPratinjau([])} className="pop rounded-full bg-secondary px-5 py-2 text-xs font-bold text-secondary-foreground">Batal</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        {kategoriAda.map((kat) => (
          <div key={kat}>
            <p className="mb-2 text-sm font-extrabold">{kat} ({katalog.filter((k) => k.kategori === kat).length})</p>
            <ul className="grid gap-2">
              {katalog.filter((k) => k.kategori === kat).map((k) => (
                <li key={k.id} className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm">
                  <span className="flex-1 font-semibold">{k.jenis}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-extrabold">{k.poin} poin</span>
                  <button onClick={() => hapusItem(k)} className="text-xs font-extrabold text-destructive">Hapus</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
