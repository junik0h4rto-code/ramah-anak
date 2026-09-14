-- Guru/admin memperbarui status penukaran lewat client terautentikasi; RLS tetap membatasi ke educator.
DROP POLICY IF EXISTS "Block client updates" ON public.penukaran_hadiah;
GRANT UPDATE ON public.penukaran_hadiah TO authenticated;
