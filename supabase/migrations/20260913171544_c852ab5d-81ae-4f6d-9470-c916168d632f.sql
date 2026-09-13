ALTER TABLE public.berita ADD COLUMN IF NOT EXISTS kelas_target text;
COMMENT ON COLUMN public.berita.kelas_target IS 'Daftar kelas tujuan dipisah koma. NULL/kosong = pengumuman sekolah (semua).';