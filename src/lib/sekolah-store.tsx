import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type MoodEntry = { date: string; mood: string; note: string };

export type Progress = {
  nama: string;
  bintang: number;
  modulSelesai: string[];
  kuisSelesai: string[];
  mood: MoodEntry[];
};

const DEFAULT: Progress = {
  nama: "",
  bintang: 0,
  modulSelesai: [],
  kuisSelesai: [],
  mood: [],
};

const KEY = "sekolah-gembira-v1";

type Ctx = Progress & {
  setNama: (n: string) => void;
  tambahBintang: (n: number) => void;
  selesaikanModul: (id: string, bintang: number) => void;
  selesaikanKuis: (id: string, bintang: number) => void;
  catatMood: (mood: string, note: string) => void;
  reset: () => void;
  lencana: { id: string; nama: string; emoji: string; syarat: string; didapat: boolean }[];
};

const StoreContext = createContext<Ctx | null>(null);

export function hariIni() {
  return new Date().toISOString().slice(0, 10);
}

export function SekolahProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Progress>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      /* abaikan */
    }
  }, []);

  const save = useCallback((next: Progress) => {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* abaikan */
    }
  }, []);

  const value = useMemo<Ctx>(() => {
    const lencana = [
      { id: "pemula", nama: "Langkah Pertama", emoji: "🌱", syarat: "Selesaikan 1 modul", didapat: state.modulSelesai.length >= 1 },
      { id: "pembaca", nama: "Si Rajin Baca", emoji: "📚", syarat: "Selesaikan 3 modul", didapat: state.modulSelesai.length >= 3 },
      { id: "juara-kuis", nama: "Juara Kuis", emoji: "🏆", syarat: "Selesaikan 2 kuis", didapat: state.kuisSelesai.length >= 2 },
      { id: "bintang-10", nama: "Pemburu Bintang", emoji: "⭐", syarat: "Kumpulkan 10 bintang", didapat: state.bintang >= 10 },
      { id: "bintang-30", nama: "Bintang Kelas", emoji: "🌟", syarat: "Kumpulkan 30 bintang", didapat: state.bintang >= 30 },
      { id: "hati-ceria", nama: "Hati Ceria", emoji: "💛", syarat: "Catat mood 3 hari", didapat: state.mood.length >= 3 },
    ];

    return {
      ...state,
      lencana,
      setNama: (nama) => save({ ...state, nama }),
      tambahBintang: (n) => save({ ...state, bintang: state.bintang + n }),
      selesaikanModul: (id, bintang) => {
        if (state.modulSelesai.includes(id)) return;
        save({ ...state, modulSelesai: [...state.modulSelesai, id], bintang: state.bintang + bintang });
      },
      selesaikanKuis: (id, bintang) => {
        const sudah = state.kuisSelesai.includes(id);
        save({
          ...state,
          kuisSelesai: sudah ? state.kuisSelesai : [...state.kuisSelesai, id],
          bintang: state.bintang + bintang,
        });
      },
      catatMood: (mood, note) => {
        const tanggal = hariIni();
        const lain = state.mood.filter((m) => m.date !== tanggal);
        const baru = [{ date: tanggal, mood, note }, ...lain].slice(0, 30);
        const bonus = state.mood.some((m) => m.date === tanggal) ? 0 : 2;
        save({ ...state, mood: baru, bintang: state.bintang + bonus });
      },
      reset: () => save(DEFAULT),
    };
  }, [state, save]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSekolah() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useSekolah harus dipakai di dalam SekolahProvider");
  return ctx;
}
