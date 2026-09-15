-- kelas_rombel: anonim hanya boleh membaca nama kelas & status aktif (bukan wali kelas)
REVOKE ALL ON public.kelas_rombel FROM anon;
GRANT SELECT (nama, aktif) ON public.kelas_rombel TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kelas_rombel TO authenticated;
GRANT ALL ON public.kelas_rombel TO service_role;

-- pengaturan_poin: hanya baca untuk pengguna login; perubahan lewat fungsi server (service role)
REVOKE ALL ON public.pengaturan_poin FROM anon;
REVOKE ALL ON public.pengaturan_poin FROM authenticated;
GRANT SELECT ON public.pengaturan_poin TO authenticated;
GRANT ALL ON public.pengaturan_poin TO service_role;

DROP POLICY IF EXISTS "Tolak insert pengaturan poin dari klien" ON public.pengaturan_poin;
CREATE POLICY "Tolak insert pengaturan poin dari klien"
ON public.pengaturan_poin FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "Tolak update pengaturan poin dari klien" ON public.pengaturan_poin;
CREATE POLICY "Tolak update pengaturan poin dari klien"
ON public.pengaturan_poin FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Tolak hapus pengaturan poin dari klien" ON public.pengaturan_poin;
CREATE POLICY "Tolak hapus pengaturan poin dari klien"
ON public.pengaturan_poin FOR DELETE TO anon, authenticated USING (false);

-- hadiah: tidak ada akses anonim; perubahan tetap dibatasi policy admin
REVOKE ALL ON public.hadiah FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hadiah TO authenticated;
GRANT ALL ON public.hadiah TO service_role;

DROP POLICY IF EXISTS "Tolak insert hadiah non-admin" ON public.hadiah;
CREATE POLICY "Tolak insert hadiah non-admin"
ON public.hadiah FOR INSERT TO authenticated
WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY IF EXISTS "Tolak update hadiah non-admin" ON public.hadiah;
CREATE POLICY "Tolak update hadiah non-admin"
ON public.hadiah FOR UPDATE TO authenticated
USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY IF EXISTS "Tolak hapus hadiah non-admin" ON public.hadiah;
CREATE POLICY "Tolak hapus hadiah non-admin"
ON public.hadiah FOR DELETE TO authenticated
USING (private.is_educator(auth.uid()));