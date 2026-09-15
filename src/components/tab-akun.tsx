import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listAkun, updateAkun, deleteAkun, type ItemAkun } from "@/lib/akun.functions";

const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-accent";
const labelClass = "text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

const PERAN_LABEL: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};

export function TabAkun() {
  const queryClient = useQueryClient();
  const fetchAkun = useServerFn(listAkun);
  const simpanAkun = useServerFn(updateAkun);
  const hapusAkun = useServerFn(deleteAkun);

  const { data: akun, isLoading } = useQuery({
    queryKey: ["admin-akun"],
    queryFn: () => fetchAkun(),
  });

  const [filterPeran, setFilterPeran] = useState<"semua" | "siswa" | "guru" | "admin">("semua");
  const [edit, setEdit] = useState<ItemAkun | null>(null);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const [peran, setPeran] = useState<"siswa" | "guru" | "admin">("siswa");

  const mulaiEdit = (a: ItemAkun) => {
    setEdit(a);
    setNama(a.nama);
    setKelas(a.kelas ?? "");
    setMapel(a.mapel ?? "");
    setPeran(a.peran);
  };

  const mutUpdate = useMutation({
    mutationFn: () =>
      simpanAkun({
        data: { id: edit!.id, nama, kelas, mapel, peran },
      }),
    onSuccess: () => {
      toast.success("Akun berhasil diperbarui");
      setEdit(null);
      queryClient.invalidateQueries({ queryKey: ["admin-akun"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal memperbarui akun"),
  });

  const mutDelete = useMutation({
    mutationFn: (id: string) => hapusAkun({ data: { id } }),
    onSuccess: () => {
      toast.success("Akun dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-akun"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gagal menghapus akun"),
  });

  if (isLoading) {
    return <p className="p-6 text-sm font-semibold text-muted-foreground">Memuat akun…</p>;
  }

  const daftar = akun ?? [];
  const hitung = (p: "siswa" | "guru" | "admin") => daftar.filter((a) => a.peran === p).length;
  const terfilter =
    filterPeran === "semua" ? daftar : daftar.filter((a) => a.peran === filterPeran);

  return (
    <section className="card-fun p-6">
      <h2 className="text-xl font-extrabold">🪪 Akun Terdaftar</h2>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">
        Kelola akun siswa, guru, dan admin.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["semua", `Semua (${daftar.length})`],
            ["siswa", `🎒 Siswa (${hitung("siswa")})`],
            ["guru", `🧑‍🏫 Guru (${hitung("guru")})`],
            ["admin", `🛡️ Admin (${hitung("admin")})`],
          ] as const
        ).map(([nilai, label]) => (
          <button
            key={nilai}
            onClick={() => setFilterPeran(nilai)}
            className={`pop rounded-full px-4 py-2 text-xs font-extrabold ${
              filterPeran === nilai
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {edit && (
        <div className="mt-4 grid gap-3 rounded-2xl border-2 border-dashed border-input p-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="akun-nama">Nama</label>
            <input id="akun-nama" className={inputClass} value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="akun-peran">Peran</label>
            <select
              id="akun-peran"
              className={inputClass}
              value={peran}
              onChange={(e) => setPeran(e.target.value as "siswa" | "guru" | "admin")}
            >
              <option value="siswa">Siswa</option>
              <option value="guru">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {peran === "siswa" ? (
            <div>
              <label className={labelClass} htmlFor="akun-kelas">Kelas</label>
              <input id="akun-kelas" className={inputClass} value={kelas} onChange={(e) => setKelas(e.target.value)} />
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="akun-mapel">Mapel</label>
              <input id="akun-mapel" className={inputClass} value={mapel} onChange={(e) => setMapel(e.target.value)} />
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={() => mutUpdate.mutate()}
              disabled={mutUpdate.isPending || !nama.trim()}
              className="pop rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-40"
            >
              Simpan
            </button>
            <button
              onClick={() => setEdit(null)}
              className="pop rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <ul className="mt-4 grid gap-3">
        {(akun ?? []).map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">
                {a.nama}{" "}
                <span className="text-xs font-bold text-muted-foreground">
                  · {PERAN_LABEL[a.peran] ?? a.peran}
                  {a.kelas ? ` · ${a.kelas}` : ""}
                  {a.mapel ? ` · ${a.mapel}` : ""}
                </span>
              </p>
              <p className="truncate text-sm font-semibold text-muted-foreground">{a.email}</p>
            </div>
            <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold">
              🪙 {a.koin}
            </span>
            <button
              onClick={() => mulaiEdit(a)}
              className="pop rounded-full bg-background px-4 py-2 text-xs font-extrabold"
            >
              Ubah
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Hapus akun ${a.nama}? Tindakan ini tidak bisa dibatalkan.`)) {
                  mutDelete.mutate(a.id);
                }
              }}
              className="pop rounded-full bg-destructive px-4 py-2 text-xs font-extrabold text-destructive-foreground"
            >
              Hapus
            </button>
          </li>
        ))}
        {(akun ?? []).length === 0 && (
          <li className="text-sm font-semibold text-muted-foreground">Belum ada akun.</li>
        )}
      </ul>
    </section>
  );
}
