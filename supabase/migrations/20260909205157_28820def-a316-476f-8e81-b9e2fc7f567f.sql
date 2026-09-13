ALTER TABLE public.perilaku_siswa
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS sumber text NOT NULL DEFAULT 'guru';

CREATE OR REPLACE FUNCTION public.kirim_perilaku_mandiri(
  _user_id uuid,
  _katalog_id uuid,
  _catatan text,
  _foto text
)
RETURNS TABLE(berhasil boolean, pesan text, poin integer, air integer, saldo_koin integer, total_air integer, musim integer, sisa_kiriman integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _kategori text; _jenis text; _poin integer; _airp integer; _saldo integer;
  _rasio integer := public.nilai_poin('pohon_air_per_poin', 2);
  _tair integer; _musim integer; _jml integer; _batas integer := 5;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Pengguna tidak valid';
  END IF;
  IF _foto IS NULL OR length(trim(_foto)) < 20 THEN
    RETURN QUERY SELECT false, 'Foto bukti wajib dilampirkan.', 0, 0, 0, 0, 1, 0;
    RETURN;
  END IF;

  SELECT count(*) INTO _jml FROM public.perilaku_siswa
  WHERE user_id = _user_id AND sumber = 'siswa'
    AND created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta';

  IF _jml >= _batas THEN
    RETURN QUERY SELECT false, 'Kamu sudah mengirim 5 kebaikan hari ini. Coba lagi besok ya!', 0, 0,
      (SELECT koin FROM public.profiles WHERE id = _user_id), 0, 1, 0;
    RETURN;
  END IF;

  SELECT k.kategori, k.jenis, k.poin INTO _kategori, _jenis, _poin
  FROM public.katalog_perilaku k WHERE k.id = _katalog_id AND k.aktif;
  IF _poin IS NULL THEN
    RAISE EXCEPTION 'Perilaku tidak ditemukan';
  END IF;

  _airp := _poin * GREATEST(_rasio, 1);

  UPDATE public.profiles SET koin = koin + _poin WHERE id = _user_id RETURNING koin INTO _saldo;
  IF _saldo IS NULL THEN
    RAISE EXCEPTION 'Profil siswa tidak ditemukan';
  END IF;

  INSERT INTO public.perilaku_siswa (user_id, katalog_id, kategori, jenis, poin, air, catatan, diberikan_oleh, foto_url, sumber)
  VALUES (_user_id, _katalog_id, _kategori, _jenis, _poin, _airp, COALESCE(trim(_catatan), ''), _user_id, _foto, 'siswa');

  INSERT INTO public.pohon_siswa (user_id, air, total_air)
  VALUES (_user_id, _airp, _airp)
  ON CONFLICT (user_id) DO UPDATE
    SET air = public.pohon_siswa.air + _airp,
        total_air = public.pohon_siswa.total_air + _airp,
        updated_at = now()
  RETURNING public.pohon_siswa.air, public.pohon_siswa.total_air, public.pohon_siswa.musim
  INTO _airp, _tair, _musim;

  RETURN QUERY SELECT true, 'Kebaikanmu tercatat!', _poin, _airp, _saldo, _tair, _musim, _batas - _jml - 1;
END;
$$;

REVOKE ALL ON FUNCTION public.kirim_perilaku_mandiri(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;