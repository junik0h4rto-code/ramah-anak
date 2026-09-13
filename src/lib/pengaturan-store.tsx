import { useQuery } from "@tanstack/react-query";
import { getPengaturanSekolah, PENGATURAN_DEFAULT } from "@/lib/pengaturan.functions";

export const PENGATURAN_QUERY_KEY = ["pengaturan-sekolah"] as const;

/** Pengaturan sekolah (nama, logo, alamat) dari database, dengan fallback default. */
export function usePengaturanSekolah() {
  const { data } = useQuery({
    queryKey: PENGATURAN_QUERY_KEY,
    queryFn: () => getPengaturanSekolah(),
    staleTime: 5 * 60 * 1000,
  });
  return data ?? PENGATURAN_DEFAULT;
}
