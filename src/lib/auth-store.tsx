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

export type Peran = "siswa" | "guru" | "admin";

export type Pengguna = {
  id: string;
  email: string;
  nama: string;
  peran: Peran;
  kelas?: string | undefined;
  mapel?: string | undefined;
  koin?: number | undefined;
};

type Ctx = {
  pengguna: Pengguna | null;
  siap: boolean;
  masuk: (email: string, password: string) => Promise<{ ok: boolean; peran?: Peran; pesan?: string }>;
  keluar: () => Promise<void>;
  isEducator: boolean;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [pengguna, setPengguna] = useState<Pengguna | null>(null);
  const [siap, setSiap] = useState(false);

  const muatProfil = useCallback(async (userId: string): Promise<Pengguna | null> => {
    const [{ data: profile, error: errProfile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, email, nama, kelas, mapel, koin").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (errProfile || !profile) {
      setPengguna(null);
      return null;
    }

    const peran = (roles?.[0]?.role as Peran) || "siswa";
    const pengguna: Pengguna = {
      id: profile.id,
      email: profile.email,
      nama: profile.nama,
      peran,
      kelas: profile.kelas ?? undefined,
      mapel: profile.mapel ?? undefined,
      koin: profile.koin ?? 0,
    };
    setPengguna(pengguna);
    return pengguna;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        await muatProfil(session.user.id);
      }
      if (mounted) setSiap(true);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        // Run database reads after the auth callback releases its session lock.
        window.setTimeout(() => {
          if (mounted) void muatProfil(session.user.id);
        }, 0);
      } else {
        setPengguna(null);
        setSiap(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [muatProfil]);

  const masuk = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, pesan: error.message };
    if (!data.user) return { ok: false, pesan: "Gagal masuk." };
    const profile = await muatProfil(data.user.id);
    if (!profile) return { ok: false, pesan: "Profil tidak ditemukan." };
    return { ok: true, peran: profile.peran };
  }, [muatProfil]);

  const keluar = useCallback(async () => {
    await supabase.auth.signOut();
    setPengguna(null);
  }, []);

  const isEducator = useMemo(
    () => pengguna?.peran === "guru" || pengguna?.peran === "admin",
    [pengguna?.peran],
  );

  const value = useMemo<Ctx>(
    () => ({ pengguna, siap, masuk, keluar, isEducator }),
    [pengguna, siap, masuk, keluar, isEducator],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const FALLBACK: Ctx = {
  pengguna: null,
  siap: false,
  masuk: async () => ({ ok: false, pesan: "Sesi belum siap." }),
  keluar: async () => {},
  isEducator: false,
};

export function useAuth() {
  return useContext(AuthContext) ?? FALLBACK;
}
