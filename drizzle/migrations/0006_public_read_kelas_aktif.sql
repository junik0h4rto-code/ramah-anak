GRANT SELECT (id, tingkat, rombel, nama, aktif) ON public.kelas_rombel TO anon;

DROP POLICY IF EXISTS "Publik melihat kelas aktif" ON public.kelas_rombel;
CREATE POLICY "Publik melihat kelas aktif"
ON public.kelas_rombel
FOR SELECT
TO anon
USING (aktif);