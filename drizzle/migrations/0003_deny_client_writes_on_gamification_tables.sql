-- Semua penulisan pada tabel gamifikasi hanya boleh lewat fungsi server (SECURITY DEFINER).
-- Cabut hak tulis dari client roles dan tambahkan policy penolakan eksplisit.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'checkin_harian','koin_bonus','modul_selesai','penukaran_hadiah',
    'perilaku_siswa','pohon_siswa','roda_putaran'
  ]
  LOOP
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated', t);
    EXECUTE format('REVOKE SELECT ON public.%I FROM anon', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);

    EXECUTE format('DROP POLICY IF EXISTS "Block client inserts" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Block client updates" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Block client deletes" ON public.%I', t);

    EXECUTE format('CREATE POLICY "Block client inserts" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (false)', t);
    EXECUTE format('CREATE POLICY "Block client updates" ON public.%I FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false)', t);
    EXECUTE format('CREATE POLICY "Block client deletes" ON public.%I FOR DELETE TO anon, authenticated USING (false)', t);
  END LOOP;
END $$;
