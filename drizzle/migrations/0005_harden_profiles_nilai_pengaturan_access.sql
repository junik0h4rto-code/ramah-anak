-- 1) pengaturan_sekolah: hide admin linkage (updated_by) from client reads
REVOKE SELECT ON public.pengaturan_sekolah FROM authenticated;
GRANT SELECT (id, nama_sekolah, tagline, alamat, telepon, whatsapp, email, website,
  facebook, instagram, tiktok, youtube, maps_url, latitude, longitude,
  kepala_sekolah, npsn, akreditasi, logo_url)
  ON public.pengaturan_sekolah TO authenticated;

-- 2) nilai_siswa: no anon access, explicit client write blocks
REVOKE ALL ON public.nilai_siswa FROM anon;
REVOKE ALL ON public.nilai_siswa FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nilai_siswa TO authenticated;
GRANT ALL ON public.nilai_siswa TO service_role;

CREATE POLICY "Block grade inserts from non educators" ON public.nilai_siswa
  AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Block grade updates from non educators" ON public.nilai_siswa
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (private.is_educator(auth.uid()))
  WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Block grade deletes from non educators" ON public.nilai_siswa
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (private.is_educator(auth.uid()));

-- 3) profiles: no client insert/delete at all
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE POLICY "Block profile inserts from clients" ON public.profiles
  AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (false);
CREATE POLICY "Block profile deletes from clients" ON public.profiles
  AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (false);
