import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-store";

export type HadiahDitukar = { id: string; nama: string; waktu: string; status: string };

type State = {
  koin: number;
  modulSelesai: string[];
  hadiahDitukar: HadiahDitukar[];
};

const AWAL: State = { koin: 0, modulSelesai: [], hadiahDitukar: [] };

type Ctx = State & {
  siap: boolean;
  muatUlang: () => Promise<void>;
  tambahKoin: (jumlah: number, label?: string) => void;
  setKoin: (jumlah: number) => void;
  selesaikanModul: (id: string, koin: number, nama?: string) => void;
};

const GamifikasiContext = createContext<Ctx | null>(null);

export function GamifikasiProvider({ children }: { children: ReactNode }) {
  const { pengguna } = useAuth();
  const userId = pengguna?.id ?? null;
  const [state, setState] = useState<State>(AWAL);
  const [siap, setSiap] = useState(false);

  const muatUlang = useCallback(async () => {
    if (!userId) {
      setState(AWAL);
      setSiap(true);
      return;
    }
    const [{ data: profil }, { data: selesai }, { data: penukaran }] = await Promise.all([
      supabase.from("profiles").select("koin").eq("id", userId).maybeSingle(),
      supabase.from("modul_selesai").select("modul_id").eq("user_id", userId),
      supabase
        .from("penukaran_hadiah")
        .select("id, status, ditukar_pada, hadiah:hadiah_id (nama)")
        .eq("user_id", userId)
        .order("ditukar_pada", { ascending: false }),
    ]);

    setState({
      koin: profil?.koin ?? 0,
      modulSelesai: (selesai ?? []).map((r) => r.modul_id),
      hadiahDitukar: (penukaran ?? []).map((r) => ({
        id: r.id,
        nama:
          (r as unknown as { hadiah: { nama: string } | null }).hadiah?.nama ?? "Hadiah",
        waktu: r.ditukar_pada,
        status: r.status,
      })),
    });
    setSiap(true);
  }, [userId]);

  useEffect(() => {
    void muatUlang();
  }, [muatUlang]);

  const tambahKoin = useCallback((jumlah: number) => {
    setState((s) => ({ ...s, koin: Math.max(0, s.koin + jumlah) }));
  }, []);

  const setKoin = useCallback((jumlah: number) => {
    setState((s) => ({ ...s, koin: jumlah }));
  }, []);

  const selesaikanModul = useCallback((id: string, koin: number) => {
    setState((s) =>
      s.modulSelesai.includes(id)
        ? s
        : { ...s, koin: s.koin + koin, modulSelesai: [...s.modulSelesai, id] },
    );
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ...state, siap, muatUlang, tambahKoin, setKoin, selesaikanModul }),
    [state, siap, muatUlang, tambahKoin, setKoin, selesaikanModul],
  );

  return <GamifikasiContext.Provider value={value}>{children}</GamifikasiContext.Provider>;
}

const FALLBACK: Ctx = {
  ...AWAL,
  siap: false,
  muatUlang: async () => {},
  tambahKoin: () => {},
  setKoin: () => {},
  selesaikanModul: () => {},
};

export function useGamifikasi() {
  return useContext(GamifikasiContext) ?? FALLBACK;
}
