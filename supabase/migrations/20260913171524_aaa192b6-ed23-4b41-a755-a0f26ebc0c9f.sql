CREATE OR REPLACE FUNCTION public.ubah_perilaku(_id uuid, _katalog_id uuid, _catatan text DEFAULT ''::text)
RETURNS TABLE(poin integer, air integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user uuid; _poin_lama integer; _air_lama integer;
  _kategori text; _jenis text; _poin_baru integer; _air_baru integer;
  _rasio integer := public.nilai_poin('pohon_air_per_poin', 2);
BEGIN
  SELECT p.user_id, p.poin, p.air INTO _user, _poin_lama, _air_lama
  FROM public.perilaku_siswa p WHERE p.id = _id;
  IF _user IS NULL THEN RAISE EXCEPTION 'Catatan tidak ditemukan'; END IF;

  SELECT k.kategori, k.jenis, k.poin INTO _kategori, _jenis, _poin_baru
  FROM public.katalog_perilaku k WHERE k.id = _katalog_id;
  IF _poin_baru IS NULL THEN RAISE EXCEPTION 'Perilaku tidak ditemukan'; END IF;

  _air_baru := _poin_baru * GREATEST(_rasio, 1);

  UPDATE public.perilaku_siswa
     SET katalog_id = _katalog_id, kategori = _kategori, jenis = _jenis,
         poin = _poin_baru, air = _air_baru, catatan = COALESCE(trim(_catatan), '')
   WHERE id = _id;

  UPDATE public.profiles
     SET koin = GREATEST(0, koin + (_poin_baru - _poin_lama))
   WHERE id = _user;

  UPDATE public.pohon_siswa
     SET air = GREATEST(0, air + (_air_baru - _air_lama)),
         total_air = GREATEST(0, total_air + (_air_baru - _air_lama)),
         updated_at = now()
   WHERE user_id = _user;

  RETURN QUERY SELECT _poin_baru, _air_baru;
END;
$$;

CREATE OR REPLACE FUNCTION public.hapus_perilaku(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _user uuid; _poin integer; _air integer;
BEGIN
  SELECT p.user_id, p.poin, p.air INTO _user, _poin, _air
  FROM public.perilaku_siswa p WHERE p.id = _id;
  IF _user IS NULL THEN RETURN false; END IF;

  DELETE FROM public.perilaku_siswa WHERE id = _id;

  UPDATE public.profiles SET koin = GREATEST(0, koin - _poin) WHERE id = _user;
  UPDATE public.pohon_siswa
     SET air = GREATEST(0, air - _air),
         total_air = GREATEST(0, total_air - _air),
         updated_at = now()
   WHERE user_id = _user;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.ubah_perilaku(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hapus_perilaku(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ubah_perilaku(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.hapus_perilaku(uuid) TO service_role;