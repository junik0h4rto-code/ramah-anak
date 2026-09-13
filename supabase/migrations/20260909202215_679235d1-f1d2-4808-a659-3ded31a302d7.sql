-- 1. Pengaturan poin
CREATE TABLE public.pengaturan_poin (
  kunci text PRIMARY KEY,
  label text NOT NULL,
  nilai integer NOT NULL DEFAULT 0,
  deskripsi text NOT NULL DEFAULT '',
  urutan integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pengaturan_poin TO authenticated;
GRANT ALL ON public.pengaturan_poin TO service_role;
ALTER TABLE public.pengaturan_poin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read point settings" ON public.pengaturan_poin
  FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_pengaturan_poin_updated_at BEFORE UPDATE ON public.pengaturan_poin
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.pengaturan_poin (kunci, label, nilai, deskripsi, urutan) VALUES
  ('checkin_harian', 'Check-in Harian', 10, 'Poin gratis saat siswa check-in sekali sehari', 1),
  ('kuis_benar', 'Jawaban Kuis Benar', 5, 'Poin per jawaban benar di game kuis', 2),
  ('modul_default', 'Selesai Modul (bawaan)', 50, 'Nilai poin bawaan saat guru membuat modul baru', 3),
  ('roda_biaya', 'Biaya Putar Roda', 10, 'Poin yang dipotong setiap satu putaran roda', 4),
  ('roda_batas', 'Batas Putar Roda / Hari', 3, 'Maksimal putaran roda per siswa per hari', 5),
  ('pohon_panen', 'Panen Pohon Kebaikan', 50, 'Poin bonus saat siswa memanen pohon berbuah', 6),
  ('pohon_air_per_poin', 'Air per Poin Perilaku', 2, 'Jumlah air pohon yang didapat per 1 poin perilaku terpuji', 7);

CREATE OR REPLACE FUNCTION public.nilai_poin(_kunci text, _bawaan integer)
RETURNS integer LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE((SELECT s.nilai FROM public.pengaturan_poin s WHERE s.kunci = _kunci), _bawaan)
$$;

-- 2. Katalog perilaku terpuji
CREATE TABLE public.katalog_perilaku (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategori text NOT NULL,
  jenis text NOT NULL,
  poin integer NOT NULL DEFAULT 1,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kategori, jenis)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.katalog_perilaku TO authenticated;
GRANT ALL ON public.katalog_perilaku TO service_role;
ALTER TABLE public.katalog_perilaku ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read behaviour catalog" ON public.katalog_perilaku
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Educators can manage behaviour catalog" ON public.katalog_perilaku
  FOR ALL TO authenticated USING (public.is_educator(auth.uid())) WITH CHECK (public.is_educator(auth.uid()));
CREATE TRIGGER update_katalog_perilaku_updated_at BEFORE UPDATE ON public.katalog_perilaku
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.katalog_perilaku (kategori, jenis, poin) VALUES
  ('Aktif','Berinisiatif membuat solusi',5),
  ('Aktif','Mewakili Sekolah dalam Kegiatan Lomba atau Pelatihan',5),
  ('Aktif','Menunjukkan kreativitas',3),
  ('Aktif','Berpartisipasi dalam organisasi',3),
  ('Aktif','Menawarkan diri membantu kegiatan',2),
  ('Aktif','Mengikuti kegiatan ekstrakurikuler',2),
  ('Aktif','Berani menyampaikan pendapat',2),
  ('Aktif','Aktif bertanya dalam pembelajaran',1),
  ('Aman','Menjadi penengah dalam konflik',5),
  ('Aman','Membantu mencegah perundungan',3),
  ('Aman','Melaporkan potensi bahaya',3),
  ('Aman','Menjaga keselamatan diri dan orang lain',2),
  ('Aman','Menjaga keamanan fasilitas sekolah',2),
  ('Aman','Menolong teman yang mengalami kesulitan',2),
  ('Humanis','Menjaga perasaan orang lain',3),
  ('Humanis','Menghargai perbedaan',3),
  ('Humanis','Menolong orang lain',2),
  ('Humanis','Menghormati guru dan tenaga kependidikan',2),
  ('Humanis','Mau meminta maaf dan memaafkan',2),
  ('Humanis','Berempati terhadap teman',2),
  ('Humanis','Berkomunikasi dengan sopan',1),
  ('Humanis','Menghargai teman',1),
  ('Mandiri','Mampu mengambil keputusan yang baik',3),
  ('Mandiri','Menunjukkan disiplin dalam kegiatan sekolah',3),
  ('Mandiri','Menjaga kebersihan diri dan lingkungan',2),
  ('Mandiri','Bertanggung jawab terhadap tugas',2),
  ('Mandiri','Menjaga barang pribadi',1),
  ('Religius','Merawat dan Menjaga Kebersihan Tempat Ibadah',5),
  ('Religius','Menjadi teladan dalam akhlak dan sopan santun',5),
  ('Religius','Menunjukkan sikap jujur',3),
  ('Religius','Menghormati perbedaan agama dan keyakinan',3),
  ('Religius','Membaca Al-Qur''an atau kitab suci',2),
  ('Religius','Mengikuti kegiatan keagamaan dengan tertib',2),
  ('Religius','Mencegah Terbuang nya Makanan',2),
  ('Religius','Melaksanakan ibadah dengan kesadaran',2);

-- 3. Catatan perilaku siswa
CREATE TABLE public.perilaku_siswa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  katalog_id uuid REFERENCES public.katalog_perilaku(id) ON DELETE SET NULL,
  kategori text NOT NULL,
  jenis text NOT NULL,
  poin integer NOT NULL DEFAULT 0,
  air integer NOT NULL DEFAULT 0,
  catatan text NOT NULL DEFAULT '',
  diberikan_oleh uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perilaku_siswa TO authenticated;
GRANT ALL ON public.perilaku_siswa TO service_role;
ALTER TABLE public.perilaku_siswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own behaviour records" ON public.perilaku_siswa
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can read all behaviour records" ON public.perilaku_siswa
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));
CREATE INDEX perilaku_siswa_user_idx ON public.perilaku_siswa (user_id, created_at DESC);

-- 4. Pohon Kebaikan
CREATE TABLE public.pohon_siswa (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  air integer NOT NULL DEFAULT 0,
  total_air integer NOT NULL DEFAULT 0,
  musim integer NOT NULL DEFAULT 1,
  total_panen integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pohon_siswa TO authenticated;
GRANT ALL ON public.pohon_siswa TO service_role;
ALTER TABLE public.pohon_siswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own tree" ON public.pohon_siswa
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Educators can read all trees" ON public.pohon_siswa
  FOR SELECT TO authenticated USING (public.is_educator(auth.uid()));
CREATE TRIGGER update_pohon_siswa_updated_at BEFORE UPDATE ON public.pohon_siswa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Fungsi: simpan pengaturan poin (dipanggil server, admin saja)
CREATE OR REPLACE FUNCTION public.simpan_pengaturan_poin(_kunci text, _nilai integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _nilai IS NULL OR _nilai < 0 OR _nilai > 10000 THEN
    RAISE EXCEPTION 'Nilai poin tidak valid';
  END IF;
  UPDATE public.pengaturan_poin SET nilai = _nilai, updated_at = now() WHERE kunci = _kunci;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengaturan tidak ditemukan';
  END IF;
  RETURN _nilai;
END;
$$;
REVOKE ALL ON FUNCTION public.simpan_pengaturan_poin(text, integer) FROM PUBLIC, anon, authenticated;

-- 6. Fungsi: catat perilaku terpuji
CREATE OR REPLACE FUNCTION public.catat_perilaku(_user_id uuid, _katalog_id uuid, _oleh uuid, _catatan text DEFAULT '')
RETURNS TABLE(poin integer, air integer, saldo_koin integer, total_air integer, musim integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _kategori text; _jenis text; _poin integer; _air integer; _saldo integer;
  _rasio integer := public.nilai_poin('pohon_air_per_poin', 2);
  _tair integer; _musim integer;
BEGIN
  IF _user_id IS NULL OR _oleh IS NULL THEN
    RAISE EXCEPTION 'Pengguna tidak valid';
  END IF;
  SELECT k.kategori, k.jenis, k.poin INTO _kategori, _jenis, _poin
  FROM public.katalog_perilaku k WHERE k.id = _katalog_id AND k.aktif;
  IF _poin IS NULL THEN
    RAISE EXCEPTION 'Perilaku tidak ditemukan';
  END IF;

  _air := _poin * GREATEST(_rasio, 1);

  UPDATE public.profiles SET koin = koin + _poin WHERE id = _user_id RETURNING koin INTO _saldo;
  IF _saldo IS NULL THEN
    RAISE EXCEPTION 'Profil siswa tidak ditemukan';
  END IF;

  INSERT INTO public.perilaku_siswa (user_id, katalog_id, kategori, jenis, poin, air, catatan, diberikan_oleh)
  VALUES (_user_id, _katalog_id, _kategori, _jenis, _poin, _air, COALESCE(trim(_catatan), ''), _oleh);

  INSERT INTO public.pohon_siswa (user_id, air, total_air)
  VALUES (_user_id, _air, _air)
  ON CONFLICT (user_id) DO UPDATE
    SET air = public.pohon_siswa.air + _air,
        total_air = public.pohon_siswa.total_air + _air,
        updated_at = now()
  RETURNING public.pohon_siswa.air, public.pohon_siswa.total_air, public.pohon_siswa.musim
  INTO _air, _tair, _musim;

  RETURN QUERY SELECT _poin, _air, _saldo, _tair, _musim;
END;
$$;
REVOKE ALL ON FUNCTION public.catat_perilaku(uuid, uuid, uuid, text) FROM PUBLIC, anon, authenticated;

-- 7. Fungsi: status pohon
CREATE OR REPLACE FUNCTION public.status_pohon(_user_id uuid)
RETURNS TABLE(air integer, total_air integer, musim integer, total_panen integer, saldo_koin integer, poin_panen integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.pohon_siswa (user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
  RETURN QUERY
  SELECT t.air, t.total_air, t.musim, t.total_panen,
         COALESCE((SELECT p.koin FROM public.profiles p WHERE p.id = _user_id), 0),
         public.nilai_poin('pohon_panen', 50)
  FROM public.pohon_siswa t WHERE t.user_id = _user_id;
END;
$$;
REVOKE ALL ON FUNCTION public.status_pohon(uuid) FROM PUBLIC, anon, authenticated;

-- 8. Fungsi: panen pohon (butuh 100 air)
CREATE OR REPLACE FUNCTION public.panen_pohon(_user_id uuid)
RETURNS TABLE(berhasil boolean, pesan text, poin_didapat integer, saldo_koin integer, air integer, musim integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _air integer; _musim integer; _hadiah integer := public.nilai_poin('pohon_panen', 50); _saldo integer;
BEGIN
  INSERT INTO public.pohon_siswa (user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT t.air, t.musim INTO _air, _musim FROM public.pohon_siswa t WHERE t.user_id = _user_id FOR UPDATE;

  IF _air < 100 THEN
    SELECT p.koin INTO _saldo FROM public.profiles p WHERE p.id = _user_id;
    RETURN QUERY SELECT false, 'Pohon belum berbuah. Kumpulkan 100 air dulu.'::text, 0, COALESCE(_saldo,0), _air, _musim;
    RETURN;
  END IF;

  UPDATE public.profiles SET koin = koin + _hadiah WHERE id = _user_id RETURNING koin INTO _saldo;
  UPDATE public.pohon_siswa
    SET air = air - 100, musim = musim + 1, total_panen = total_panen + 1, updated_at = now()
    WHERE user_id = _user_id
    RETURNING public.pohon_siswa.air, public.pohon_siswa.musim INTO _air, _musim;

  INSERT INTO public.lencana_siswa (user_id, kode, nama)
  VALUES (_user_id, 'pohon_kebaikan', 'Lencana Pohon Kebaikan')
  ON CONFLICT (user_id, kode) DO UPDATE SET jumlah = public.lencana_siswa.jumlah + 1, updated_at = now();

  RETURN QUERY SELECT true, 'Panen berhasil!'::text, _hadiah, COALESCE(_saldo,0), _air, _musim;
END;
$$;
REVOKE ALL ON FUNCTION public.panen_pohon(uuid) FROM PUBLIC, anon, authenticated;

-- 9. Papan peringkat pohon
CREATE OR REPLACE FUNCTION public.leaderboard_pohon(_batas integer DEFAULT 10)
RETURNS TABLE(nama text, kelas text, total_air integer, total_panen integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.nama, p.kelas, t.total_air, t.total_panen
  FROM public.pohon_siswa t
  JOIN public.profiles p ON p.id = t.user_id
  JOIN public.user_roles r ON r.user_id = t.user_id AND r.role = 'siswa'
  ORDER BY t.total_air DESC, t.total_panen DESC, p.nama ASC
  LIMIT GREATEST(1, LEAST(_batas, 50))
$$;
REVOKE ALL ON FUNCTION public.leaderboard_pohon(integer) FROM PUBLIC, anon, authenticated;

-- 10. Fungsi lama memakai pengaturan poin
CREATE OR REPLACE FUNCTION public.klaim_checkin_harian(_user_id uuid)
 RETURNS TABLE(berhasil boolean, pesan text, koin_didapat integer, saldo_koin integer)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  _hari date := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  _saldo integer;
  _bonus integer := public.nilai_poin('checkin_harian', 10);
BEGIN
  IF EXISTS (SELECT 1 FROM public.checkin_harian WHERE user_id = _user_id AND tanggal = _hari) THEN
    SELECT koin INTO _saldo FROM public.profiles WHERE id = _user_id;
    RETURN QUERY SELECT false, 'Kamu sudah check-in hari ini.'::text, 0, COALESCE(_saldo, 0);
    RETURN;
  END IF;
  INSERT INTO public.checkin_harian (user_id, tanggal, koin) VALUES (_user_id, _hari, _bonus);
  UPDATE public.profiles SET koin = koin + _bonus WHERE id = _user_id RETURNING koin INTO _saldo;
  RETURN QUERY SELECT true, 'Check-in berhasil!'::text, _bonus, COALESCE(_saldo, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.status_roda(_user_id uuid)
 RETURNS TABLE(sisa_putaran integer, saldo_koin integer)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $function$
  SELECT GREATEST(public.nilai_poin('roda_batas', 3) - (SELECT count(*)::int FROM public.roda_putaran r WHERE r.user_id = _user_id AND r.created_at >= date_trunc('day', now())), 0),
         COALESCE((SELECT p.koin FROM public.profiles p WHERE p.id = _user_id), 0)
$function$;

CREATE OR REPLACE FUNCTION public.putar_roda(_user_id uuid)
 RETURNS TABLE(hadiah_index integer, hadiah_label text, koin_hadiah integer, lencana boolean, saldo_koin integer, sisa_putaran integer)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  _biaya integer := public.nilai_poin('roda_biaya', 10);
  _batas integer := public.nilai_poin('roda_batas', 3);
  _dipakai integer;
  _saldo integer;
  _idx integer;
  _koin integer;
  _label text;
  _lencana boolean := false;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Pengguna tidak valid';
  END IF;

  SELECT count(*) INTO _dipakai FROM public.roda_putaran r
  WHERE r.user_id = _user_id AND r.created_at >= date_trunc('day', now());

  IF _dipakai >= _batas THEN
    RAISE EXCEPTION 'Batas putaran harian sudah tercapai';
  END IF;

  SELECT p.koin INTO _saldo FROM public.profiles p WHERE p.id = _user_id FOR UPDATE;
  IF _saldo IS NULL THEN
    RAISE EXCEPTION 'Profil tidak ditemukan';
  END IF;
  IF _saldo < _biaya THEN
    RAISE EXCEPTION 'Poin tidak cukup untuk memutar roda';
  END IF;

  _idx := floor(random() * 6)::int;

  IF _idx = 0 THEN _koin := 5; _label := '+5 Poin';
  ELSIF _idx = 1 THEN _koin := 20; _label := '+20 Poin';
  ELSIF _idx = 2 THEN _koin := 0; _label := 'Zonk / Coba Lagi';
  ELSIF _idx = 3 THEN _koin := 50; _label := '+50 Poin';
  ELSIF _idx = 4 THEN _koin := 0; _label := 'Lencana Juara'; _lencana := true;
  ELSE _koin := 2; _label := '+2 Poin';
  END IF;

  UPDATE public.profiles SET koin = koin - _biaya + _koin WHERE id = _user_id
  RETURNING koin INTO _saldo;

  IF _lencana THEN
    INSERT INTO public.lencana_siswa (user_id, kode, nama)
    VALUES (_user_id, 'juara', 'Lencana Juara')
    ON CONFLICT (user_id, kode) DO UPDATE SET jumlah = public.lencana_siswa.jumlah + 1, updated_at = now();
  END IF;

  INSERT INTO public.roda_putaran (user_id, hadiah_index, hadiah_label, koin_bersih)
  VALUES (_user_id, _idx, _label, _koin - _biaya);

  RETURN QUERY SELECT _idx, _label, _koin, _lencana, COALESCE(_saldo, 0), GREATEST(_batas - _dipakai - 1, 0);
END;
$function$;
