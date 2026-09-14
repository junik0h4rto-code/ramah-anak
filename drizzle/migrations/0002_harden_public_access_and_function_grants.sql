-- 1) SECURITY DEFINER functions must not be callable by anon/authenticated.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 2) berita: anon may read only safe public columns; no writes.
REVOKE ALL ON TABLE public.berita FROM anon, authenticated;
GRANT SELECT (id, judul, isi, kategori, gambar_url, tanggal_kegiatan, published, kelas_target, created_at, updated_at)
  ON public.berita TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.berita TO authenticated;
GRANT ALL ON public.berita TO service_role;

-- 3) pengaturan_sekolah: anon may read only the columns shown on the public site.
REVOKE ALL ON TABLE public.pengaturan_sekolah FROM anon, authenticated;
GRANT SELECT (id, nama_sekolah, tagline, alamat, telepon, whatsapp, email, website,
              facebook, instagram, tiktok, youtube, maps_url, latitude, longitude,
              kepala_sekolah, npsn, akreditasi, logo_url)
  ON public.pengaturan_sekolah TO anon;
GRANT SELECT, UPDATE ON public.pengaturan_sekolah TO authenticated;
GRANT ALL ON public.pengaturan_sekolah TO service_role;

-- 4) user_roles: read-only for signed-in users, no self role assignment.
REVOKE ALL ON TABLE public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "No self role writes" ON public.user_roles;
CREATE POLICY "Block role writes from clients"
  ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (false);
