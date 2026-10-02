CREATE TABLE public.guru_kelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_id uuid NOT NULL,
  kelas_nama text NOT NULL,
  sebagai text NOT NULL DEFAULT 'pengampu' CHECK (sebagai IN ('wali','pengampu')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guru_id, kelas_nama, sebagai)
);
CREATE UNIQUE INDEX guru_kelas_satu_wali ON public.guru_kelas (kelas_nama) WHERE sebagai = 'wali';
GRANT SELECT ON public.guru_kelas TO authenticated;
GRANT ALL ON public.guru_kelas TO service_role;
ALTER TABLE public.guru_kelas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.is_admin(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION private.boleh_lihat_siswa(_uid uuid, _siswa uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_admin(_uid) OR (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'guru')
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.guru_kelas g ON g.guru_id = _uid AND g.kelas_nama = p.kelas
      WHERE p.id = _siswa
    )
  )
$$;

CREATE OR REPLACE FUNCTION private.profil_bukan_siswa(_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _id AND role IN ('guru','admin'))
$$;

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid), private.boleh_lihat_siswa(uuid, uuid), private.profil_bukan_siswa(uuid) TO authenticated;

CREATE POLICY "Guru baca penugasan sendiri, admin semua" ON public.guru_kelas
  FOR SELECT TO authenticated USING (guru_id = auth.uid() OR private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Educators can read all profiles" ON public.profiles;
CREATE POLICY "Guru baca profil sesuai kelas" ON public.profiles FOR SELECT TO authenticated
  USING (private.is_educator(auth.uid()) AND (private.profil_bukan_siswa(id) OR private.boleh_lihat_siswa(auth.uid(), id)));

DROP POLICY IF EXISTS "Educators can read all bonuses" ON public.koin_bonus;
CREATE POLICY "Guru baca bonus sesuai kelas" ON public.koin_bonus FOR SELECT TO authenticated
  USING (private.boleh_lihat_siswa(auth.uid(), user_id));
DROP POLICY IF EXISTS "Educators can read all badges" ON public.lencana_siswa;
CREATE POLICY "Guru baca lencana sesuai kelas" ON public.lencana_siswa FOR SELECT TO authenticated
  USING (private.boleh_lihat_siswa(auth.uid(), user_id));
DROP POLICY IF EXISTS "Educators can read all completions" ON public.modul_selesai;
CREATE POLICY "Guru baca modul selesai sesuai kelas" ON public.modul_selesai FOR SELECT TO authenticated
  USING (private.boleh_lihat_siswa(auth.uid(), user_id));
DROP POLICY IF EXISTS "Educators can manage grades" ON public.nilai_siswa;
CREATE POLICY "Guru kelola nilai sesuai kelas" ON public.nilai_siswa FOR ALL TO authenticated
  USING (private.boleh_lihat_siswa(auth.uid(), user_id))
  WITH CHECK (private.boleh_lihat_siswa(auth.uid(), user_id));
DROP POLICY IF EXISTS "Educators can read all redemptions" ON public.penukaran_hadiah;
CREATE POLICY "Guru baca penukaran sesuai kelas" ON public.penukaran_hadiah FOR SELECT TO authenticated
  USING (private.boleh_lihat_siswa(auth.uid(), user_id));
DROP POLICY IF EXISTS "Educators can read all behaviour records" ON public.perilaku_siswa;
CREATE POLICY "Guru baca perilaku sesuai kelas" ON public.perilaku_siswa FOR SELECT TO authenticated
  USING (private.boleh_lihat_siswa(auth.uid(), user_id));
DROP POLICY IF EXISTS "Educators can read all trees" ON public.pohon_siswa;
CREATE POLICY "Guru baca pohon sesuai kelas" ON public.pohon_siswa FOR SELECT TO authenticated
  USING (private.boleh_lihat_siswa(auth.uid(), user_id));
DROP POLICY IF EXISTS "Baca refleksi sendiri atau guru" ON public.refleksi_modul;
CREATE POLICY "Baca refleksi sendiri atau guru kelas" ON public.refleksi_modul FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.boleh_lihat_siswa(auth.uid(), user_id));