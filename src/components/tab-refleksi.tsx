import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRefleksiSiswa } from "@/lib/modul.functions";

const PERTANYAAN = [
  "Apa hal paling penting yang kamu pelajari dari materi ini?",
  "Bagian mana yang masih sulit kamu pahami, dan apa yang akan kamu lakukan untuk memahaminya?",
  "Bagaimana kamu akan menerapkan materi ini dalam kehidupan sehari-hari?",
];
const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent";

export function TabRefleksi() {
  const ambil = useServerFn(listRefleksiSiswa);
  const { data } = useSuspenseQuery({ queryKey: ["refleksi-siswa"], queryFn: () => ambil() });
  const [cari, setCari] = useState("");
  const [modul, setModul] = useState("Semua");
  const [kelas, setKelas] = useState("Semua");

  const daftarModul = useMemo(() => [...new Set(data.map((r) => r.judul))].sort(), [data]);
  const daftarKelas = useMemo(() => [...new Set(data.map((r) => r.kelas ?? "-"))].sort(), [data]);
  const tampil = data.filter(
    (r) =>
      (modul === "Semua" || r.judul === modul) &&
      (kelas === "Semua" || (r.kelas ?? "-") === kelas) &&
      (!cari.trim() || r.nama.toLowerCase().includes(cari.trim().toLowerCase())),
  );

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="mb-1 font-display text-2xl font-extrabold">Jawaban Refleksi Siswa</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Refleksi yang ditulis siswa sebelum menyelesaikan modul.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama siswa..." className={inputClass} />
        <select value={modul} onChange={(e) => setModul(e.target.value)} className={inputClass}>
          <option value="Semua">Semua modul</option>
          {daftarModul.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={kelas} onChange={(e) => setKelas(e.target.value)} className={inputClass}>
          <option value="Semua">Semua kelas</option>
          {daftarKelas.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      <p className="text-sm font-bold text-muted-foreground">{tampil.length} refleksi</p>
      {tampil.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Belum ada jawaban refleksi.
        </p>
      ) : (
        <div className="grid gap-4">
          {tampil.map((r) => (
            <article key={r.id} className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold">
                  {r.nama} <span className="text-sm text-muted-foreground">• {r.kelas ?? "Tanpa kelas"}</span>
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <p className="text-sm font-bold text-primary">{r.judul}{r.mapel ? ` • ${r.mapel}` : ""}</p>
              <ol className="mt-3 grid gap-3">
                {[r.jawaban_1, r.jawaban_2, r.jawaban_3].map((j, i) => (
                  <li key={i} className="rounded-2xl bg-muted p-3">
                    <p className="text-xs font-extrabold uppercase text-muted-foreground">{i + 1}. {PERTANYAAN[i]}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{j}</p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
