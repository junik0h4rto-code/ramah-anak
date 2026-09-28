CREATE TABLE public.tes_formatif (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  mapel text,
  kelas_target text,
  tautan text NOT NULL,
  keterangan text,
  aktif boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tes_formatif TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tes_formatif TO authenticated;
GRANT ALL ON public.tes_formatif TO service_role;
ALTER TABLE public.tes_formatif ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tes formatif aktif terbaca publik" ON public.tes_formatif FOR SELECT TO anon USING (aktif = true);
CREATE POLICY "Tes formatif terbaca pengguna" ON public.tes_formatif FOR SELECT TO authenticated USING (aktif = true OR private.is_educator(auth.uid()));
CREATE POLICY "Guru tambah tes formatif" ON public.tes_formatif FOR INSERT TO authenticated WITH CHECK (private.is_educator(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Guru ubah tes formatif" ON public.tes_formatif FOR UPDATE TO authenticated USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Guru hapus tes formatif" ON public.tes_formatif FOR DELETE TO authenticated USING (private.is_educator(auth.uid()));

CREATE TABLE public.refleksi_modul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modul_id uuid NOT NULL REFERENCES public.modul(id) ON DELETE CASCADE,
  jawaban_1 text NOT NULL,
  jawaban_2 text NOT NULL,
  jawaban_3 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, modul_id)
);
GRANT SELECT, INSERT, UPDATE ON public.refleksi_modul TO authenticated;
GRANT ALL ON public.refleksi_modul TO service_role;
ALTER TABLE public.refleksi_modul ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Baca refleksi sendiri atau guru" ON public.refleksi_modul FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_educator(auth.uid()));
CREATE POLICY "Tulis refleksi sendiri" ON public.refleksi_modul FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Ubah refleksi sendiri" ON public.refleksi_modul FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());