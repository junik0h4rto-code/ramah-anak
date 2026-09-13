CREATE TYPE public.app_role AS ENUM ('siswa', 'guru', 'admin');
CREATE TYPE public.jenis_nilai AS ENUM ('uh', 'pts', 'pas', 'tugas', 'praktik');
CREATE TYPE public.status_penukaran AS ENUM ('diproses', 'siap_diambil', 'selesai');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nama text NOT NULL,
  kelas text,
  mapel text,
  koin integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_educator(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('guru', 'admin')
  )
$$;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Educators can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));

CREATE TABLE public.lencana_siswa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kode text NOT NULL,
  nama text NOT NULL,
  jumlah integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kode)
);
GRANT SELECT ON public.lencana_siswa TO authenticated;
GRANT ALL ON public.lencana_siswa TO service_role;
ALTER TABLE public.lencana_siswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own badges" ON public.lencana_siswa
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can read all badges" ON public.lencana_siswa
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));
CREATE TRIGGER update_lencana_siswa_updated_at BEFORE UPDATE ON public.lencana_siswa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.checkin_harian (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tanggal date NOT NULL,
  koin integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tanggal)
);
GRANT SELECT ON public.checkin_harian TO authenticated;
GRANT ALL ON public.checkin_harian TO service_role;
ALTER TABLE public.checkin_harian ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own checkins" ON public.checkin_harian
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.roda_putaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hadiah_index integer NOT NULL,
  hadiah_label text NOT NULL,
  koin_bersih integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roda_putaran TO authenticated;
GRANT ALL ON public.roda_putaran TO service_role;
ALTER TABLE public.roda_putaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own spins" ON public.roda_putaran
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.modul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  deskripsi text,
  mapel text,
  kelas text,
  kategori text,
  koin_reward integer NOT NULL DEFAULT 0,
  konten text,
  kuis_pertanyaan text,
  kuis_opsi text[] NOT NULL DEFAULT '{}',
  kuis_jawaban integer NOT NULL DEFAULT 0,
  cover_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modul TO authenticated;
GRANT ALL ON public.modul TO service_role;
ALTER TABLE public.modul ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read modules" ON public.modul
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Educators can manage modules" ON public.modul
  FOR ALL TO authenticated USING (public.is_educator(auth.uid()))
  WITH CHECK (public.is_educator(auth.uid()));
CREATE TRIGGER update_modul_updated_at BEFORE UPDATE ON public.modul
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.modul_selesai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modul_id uuid NOT NULL REFERENCES public.modul(id) ON DELETE CASCADE,
  koin_didapat integer NOT NULL DEFAULT 0,
  selesai_pada timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, modul_id)
);
GRANT SELECT ON public.modul_selesai TO authenticated;
GRANT ALL ON public.modul_selesai TO service_role;
ALTER TABLE public.modul_selesai ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own completions" ON public.modul_selesai
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can read all completions" ON public.modul_selesai
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));

CREATE TABLE public.hadiah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  kategori text NOT NULL DEFAULT 'Umum',
  tipe text NOT NULL DEFAULT 'barang',
  ikon text NOT NULL DEFAULT '🎁',
  harga_koin integer NOT NULL DEFAULT 10,
  stok integer NOT NULL DEFAULT 0,
  gambar_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hadiah TO authenticated;
GRANT ALL ON public.hadiah TO service_role;
ALTER TABLE public.hadiah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read rewards" ON public.hadiah
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rewards" ON public.hadiah
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_hadiah_updated_at BEFORE UPDATE ON public.hadiah
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.penukaran_hadiah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hadiah_id uuid NOT NULL REFERENCES public.hadiah(id) ON DELETE CASCADE,
  jumlah_koin integer NOT NULL,
  kode_voucher text,
  status public.status_penukaran NOT NULL DEFAULT 'diproses',
  ditukar_pada timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.penukaran_hadiah TO authenticated;
GRANT ALL ON public.penukaran_hadiah TO service_role;
ALTER TABLE public.penukaran_hadiah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own redemptions" ON public.penukaran_hadiah
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can read all redemptions" ON public.penukaran_hadiah
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));
CREATE POLICY "Educators can update redemptions" ON public.penukaran_hadiah
  FOR UPDATE TO authenticated USING (public.is_educator(auth.uid()))
  WITH CHECK (public.is_educator(auth.uid()));
CREATE TRIGGER update_penukaran_hadiah_updated_at BEFORE UPDATE ON public.penukaran_hadiah
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.berita (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  isi text NOT NULL,
  kategori text,
  gambar_url text,
  tanggal_kegiatan date,
  published boolean NOT NULL DEFAULT true,
  penulis_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.berita TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.berita TO authenticated;
GRANT ALL ON public.berita TO service_role;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published news" ON public.berita
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Educators can read all news" ON public.berita
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));
CREATE POLICY "Educators can manage news" ON public.berita
  FOR ALL TO authenticated USING (public.is_educator(auth.uid()))
  WITH CHECK (public.is_educator(auth.uid()));
CREATE TRIGGER update_berita_updated_at BEFORE UPDATE ON public.berita
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pengaturan_sekolah (
  id integer PRIMARY KEY DEFAULT 1,
  nama_sekolah text NOT NULL DEFAULT 'Sekolah Gembira',
  tagline text NOT NULL DEFAULT '',
  alamat text NOT NULL DEFAULT '',
  telepon text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  tiktok text NOT NULL DEFAULT '',
  youtube text NOT NULL DEFAULT '',
  maps_url text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  kepala_sekolah text NOT NULL DEFAULT '',
  npsn text NOT NULL DEFAULT '',
  akreditasi text NOT NULL DEFAULT '',
  logo_url text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pengaturan_sekolah_singleton CHECK (id = 1)
);
GRANT SELECT ON public.pengaturan_sekolah TO anon;
GRANT SELECT, UPDATE ON public.pengaturan_sekolah TO authenticated;
GRANT ALL ON public.pengaturan_sekolah TO service_role;
ALTER TABLE public.pengaturan_sekolah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read school settings" ON public.pengaturan_sekolah
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Educators can update school settings" ON public.pengaturan_sekolah
  FOR UPDATE TO authenticated USING (public.is_educator(auth.uid()))
  WITH CHECK (public.is_educator(auth.uid()));
CREATE TRIGGER update_pengaturan_sekolah_updated_at BEFORE UPDATE ON public.pengaturan_sekolah
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.kegiatan_sekolah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kegiatan text NOT NULL,
  tanggal date NOT NULL,
  koin_bonus integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kegiatan_sekolah TO authenticated;
GRANT ALL ON public.kegiatan_sekolah TO service_role;
ALTER TABLE public.kegiatan_sekolah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read events" ON public.kegiatan_sekolah
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Educators can manage events" ON public.kegiatan_sekolah
  FOR ALL TO authenticated USING (public.is_educator(auth.uid()))
  WITH CHECK (public.is_educator(auth.uid()));
CREATE TRIGGER update_kegiatan_sekolah_updated_at BEFORE UPDATE ON public.kegiatan_sekolah
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.koin_bonus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kegiatan text NOT NULL,
  jumlah integer NOT NULL DEFAULT 0,
  diberikan_oleh uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diberikan_pada timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.koin_bonus TO authenticated;
GRANT ALL ON public.koin_bonus TO service_role;
ALTER TABLE public.koin_bonus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own bonuses" ON public.koin_bonus
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can read all bonuses" ON public.koin_bonus
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));

CREATE TABLE public.nilai_siswa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mapel text NOT NULL,
  jenis public.jenis_nilai NOT NULL DEFAULT 'tugas',
  skor integer NOT NULL DEFAULT 0,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  catatan text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nilai_siswa TO authenticated;
GRANT ALL ON public.nilai_siswa TO service_role;
ALTER TABLE public.nilai_siswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own grades" ON public.nilai_siswa
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can manage grades" ON public.nilai_siswa
  FOR ALL TO authenticated USING (public.is_educator(auth.uid()))
  WITH CHECK (public.is_educator(auth.uid()));
CREATE TRIGGER update_nilai_siswa_updated_at BEFORE UPDATE ON public.nilai_siswa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.pastikan_profil_untuk(_uid uuid, _nama text, _peran text DEFAULT 'siswa')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
  _role public.app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Pengguna tidak valid';
  END IF;
  SELECT u.email INTO _email FROM auth.users u WHERE u.id = _uid;
  _role := CASE WHEN _peran IN ('guru', 'admin') THEN _peran::public.app_role ELSE 'siswa'::public.app_role END;

  INSERT INTO public.profiles (id, email, nama)
  VALUES (_uid, COALESCE(_email, ''), COALESCE(NULLIF(trim(_nama), ''), 'Pengguna'))
  ON CONFLICT (id) DO UPDATE SET nama = EXCLUDED.nama, updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.leaderboard_siswa(_batas integer DEFAULT 10)
RETURNS TABLE(nama text, kelas text, koin integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.nama, p.kelas, p.koin
  FROM public.profiles p
  JOIN public.user_roles r ON r.user_id = p.id AND r.role = 'siswa'
  ORDER BY p.koin DESC, p.nama ASC
  LIMIT GREATEST(1, LEAST(_batas, 50))
$$;

CREATE OR REPLACE FUNCTION public.tambah_koin_kuis(_user_id uuid, _jumlah integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _saldo integer;
BEGIN
  IF _user_id IS NULL OR _jumlah IS NULL OR _jumlah < 0 OR _jumlah > 100 THEN
    RAISE EXCEPTION 'Data kuis tidak valid';
  END IF;
  UPDATE public.profiles SET koin = koin + _jumlah WHERE id = _user_id RETURNING koin INTO _saldo;
  IF _saldo IS NULL THEN
    RAISE EXCEPTION 'Profil tidak ditemukan';
  END IF;
  RETURN _saldo;
END;
$$;

CREATE OR REPLACE FUNCTION public.beri_koin_bonus(_user_id uuid, _jumlah integer, _kegiatan text, _oleh uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _saldo integer;
BEGIN
  IF _user_id IS NULL OR _oleh IS NULL OR _jumlah IS NULL OR _jumlah <= 0 OR _jumlah > 10000 THEN
    RAISE EXCEPTION 'Data bonus tidak valid';
  END IF;
  UPDATE public.profiles SET koin = koin + _jumlah WHERE id = _user_id RETURNING koin INTO _saldo;
  IF _saldo IS NULL THEN
    RAISE EXCEPTION 'Profil tidak ditemukan';
  END IF;
  INSERT INTO public.koin_bonus (user_id, kegiatan, jumlah, diberikan_oleh)
  VALUES (_user_id, COALESCE(NULLIF(trim(_kegiatan), ''), 'Bonus'), _jumlah, _oleh);
  RETURN _saldo;
END;
$$;

CREATE OR REPLACE FUNCTION public.selesaikan_modul(_user_id uuid, _modul_id uuid)
RETURNS TABLE(koin_didapat integer, saldo_koin integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _reward integer;
  _saldo integer;
BEGIN
  IF EXISTS (SELECT 1 FROM public.modul_selesai WHERE user_id = _user_id AND modul_id = _modul_id) THEN
    SELECT koin INTO _saldo FROM public.profiles WHERE id = _user_id;
    RETURN QUERY SELECT 0, COALESCE(_saldo, 0);
    RETURN;
  END IF;

  SELECT m.koin_reward INTO _reward FROM public.modul m WHERE m.id = _modul_id;
  IF _reward IS NULL THEN
    RAISE EXCEPTION 'Modul tidak ditemukan';
  END IF;

  INSERT INTO public.modul_selesai (user_id, modul_id, koin_didapat)
  VALUES (_user_id, _modul_id, _reward);

  UPDATE public.profiles SET koin = koin + _reward WHERE id = _user_id RETURNING koin INTO _saldo;
  RETURN QUERY SELECT _reward, COALESCE(_saldo, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.tukar_hadiah(_user_id uuid, _hadiah_id uuid)
RETURNS TABLE(berhasil boolean, pesan text, saldo_koin integer, kode_voucher text, tipe text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _harga integer; _stok integer; _tipe text; _nama text;
  _saldo integer; _kode text;
BEGIN
  SELECT h.harga_koin, h.stok, h.tipe, h.nama INTO _harga, _stok, _tipe, _nama
  FROM public.hadiah h WHERE h.id = _hadiah_id FOR UPDATE;

  IF _harga IS NULL THEN
    RETURN QUERY SELECT false, 'Hadiah tidak ditemukan.'::text, 0, NULL::text, NULL::text;
    RETURN;
  END IF;
  IF _stok <= 0 THEN
    SELECT p.koin INTO _saldo FROM public.profiles p WHERE p.id = _user_id;
    RETURN QUERY SELECT false, 'Stok hadiah habis.'::text, COALESCE(_saldo, 0), NULL::text, _tipe;
    RETURN;
  END IF;

  SELECT p.koin INTO _saldo FROM public.profiles p WHERE p.id = _user_id FOR UPDATE;
  IF _saldo IS NULL THEN
    RAISE EXCEPTION 'Profil tidak ditemukan';
  END IF;
  IF _saldo < _harga THEN
    RETURN QUERY SELECT false, 'Poin kamu belum cukup untuk hadiah ini.'::text, _saldo, NULL::text, _tipe;
    RETURN;
  END IF;

  UPDATE public.profiles SET koin = koin - _harga WHERE id = _user_id RETURNING koin INTO _saldo;
  UPDATE public.hadiah SET stok = stok - 1, updated_at = now() WHERE id = _hadiah_id;

  _kode := CASE WHEN _tipe = 'voucher'
    THEN upper(substr(md5(random()::text || _user_id::text), 1, 8))
    ELSE NULL END;

  INSERT INTO public.penukaran_hadiah (user_id, hadiah_id, jumlah_koin, kode_voucher)
  VALUES (_user_id, _hadiah_id, _harga, _kode);

  RETURN QUERY SELECT true, ('Berhasil menukar ' || _nama || '!')::text, _saldo, _kode, _tipe;
END;
$$;

CREATE OR REPLACE FUNCTION public.rekomendasi_modul(_batas integer DEFAULT 8)
RETURNS TABLE(id uuid, judul text, mapel text, kelas text, koin_reward integer, cover_url text, nama_guru text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, m.judul, m.mapel, m.kelas, m.koin_reward, m.cover_url,
         COALESCE(p.nama, 'Guru') AS nama_guru
  FROM public.modul m
  LEFT JOIN public.profiles p ON p.id = m.created_by
  ORDER BY m.created_at DESC
  LIMIT GREATEST(1, LEAST(_batas, 50))
$$;

CREATE OR REPLACE FUNCTION public.riwayat_checkin_7hari(_user_id uuid)
RETURNS TABLE(tanggal date, hari_ini date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.tanggal, (now() AT TIME ZONE 'Asia/Jakarta')::date AS hari_ini
  FROM public.checkin_harian c
  WHERE c.user_id = _user_id
    AND c.tanggal >= (now() AT TIME ZONE 'Asia/Jakarta')::date - 6
  ORDER BY c.tanggal DESC
$$;