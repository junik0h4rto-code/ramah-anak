-- 1. Pindahkan fungsi pemeriksa peran ke schema internal (tidak diekspos ke API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION private.is_educator(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('guru','admin')) $$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_educator(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_educator(uuid) TO authenticated, service_role;

-- 2. Tulis ulang seluruh policy agar memakai fungsi internal
DROP POLICY "Educators can manage news" ON public.berita;
DROP POLICY "Educators can read all news" ON public.berita;
CREATE POLICY "Educators can manage news" ON public.berita FOR ALL TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Educators can read all news" ON public.berita FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

DROP POLICY "Admins can manage rewards" ON public.hadiah;
CREATE POLICY "Admins can manage rewards" ON public.hadiah FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Educators can manage behaviour catalog" ON public.katalog_perilaku;
CREATE POLICY "Educators can manage behaviour catalog" ON public.katalog_perilaku FOR ALL TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY "Educators can manage events" ON public.kegiatan_sekolah;
CREATE POLICY "Educators can manage events" ON public.kegiatan_sekolah FOR ALL TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY "Guru dan admin mengelola kelas" ON public.kelas_rombel;
CREATE POLICY "Guru dan admin mengelola kelas" ON public.kelas_rombel FOR ALL TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all bonuses" ON public.koin_bonus;
CREATE POLICY "Educators can read all bonuses" ON public.koin_bonus FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all badges" ON public.lencana_siswa;
CREATE POLICY "Educators can read all badges" ON public.lencana_siswa FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

DROP POLICY "Educators can manage modules" ON public.modul;
CREATE POLICY "Educators can manage modules" ON public.modul FOR ALL TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all completions" ON public.modul_selesai;
CREATE POLICY "Educators can read all completions" ON public.modul_selesai FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

DROP POLICY "Educators can manage grades" ON public.nilai_siswa;
CREATE POLICY "Educators can manage grades" ON public.nilai_siswa FOR ALL TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY "Educators can update school settings" ON public.pengaturan_sekolah;
CREATE POLICY "Educators can update school settings" ON public.pengaturan_sekolah FOR UPDATE TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all redemptions" ON public.penukaran_hadiah;
DROP POLICY "Educators can update redemptions" ON public.penukaran_hadiah;
CREATE POLICY "Educators can read all redemptions" ON public.penukaran_hadiah FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));
CREATE POLICY "Educators can update redemptions" ON public.penukaran_hadiah FOR UPDATE TO authenticated
  USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all behaviour records" ON public.perilaku_siswa;
CREATE POLICY "Educators can read all behaviour records" ON public.perilaku_siswa FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all trees" ON public.pohon_siswa;
CREATE POLICY "Educators can read all trees" ON public.pohon_siswa FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all profiles" ON public.profiles;
CREATE POLICY "Educators can read all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

DROP POLICY "Educators can read all roles" ON public.user_roles;
CREATE POLICY "Educators can read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()));

-- 3. Hapus fungsi lama yang bisa dipanggil langsung lewat API
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_educator(uuid);

-- 4. Cabut hak akses berlebihan, lalu berikan seperlunya saja
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- Tabel yang dikelola guru/admin
GRANT INSERT, UPDATE, DELETE ON public.berita, public.hadiah, public.katalog_perilaku,
  public.kegiatan_sekolah, public.kelas_rombel, public.modul, public.nilai_siswa TO authenticated;
GRANT UPDATE ON public.penukaran_hadiah TO authenticated;
GRANT UPDATE ON public.pengaturan_sekolah TO authenticated;

-- Profil: pengguna hanya boleh mengubah data dirinya, bukan poinnya
GRANT UPDATE (nama, kelas, mapel) ON public.profiles TO authenticated;

-- Informasi sekolah untuk umum (tanpa kolom internal updated_by)
GRANT SELECT (id, nama_sekolah, tagline, alamat, telepon, whatsapp, email, website,
  facebook, instagram, tiktok, youtube, maps_url, latitude, longitude, kepala_sekolah,
  npsn, akreditasi, logo_url) ON public.pengaturan_sekolah TO anon;
GRANT SELECT ON public.berita TO anon;