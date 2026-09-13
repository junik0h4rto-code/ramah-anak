CREATE TABLE public.kelas_rombel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tingkat text NOT NULL,
  rombel text NOT NULL,
  nama text NOT NULL,
  wali_kelas text NOT NULL DEFAULT '',
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (nama)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kelas_rombel TO authenticated;
GRANT ALL ON public.kelas_rombel TO service_role;

ALTER TABLE public.kelas_rombel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua pengguna masuk bisa melihat kelas"
ON public.kelas_rombel FOR SELECT TO authenticated USING (true);

CREATE POLICY "Guru dan admin mengelola kelas"
ON public.kelas_rombel FOR ALL TO authenticated
USING (public.is_educator(auth.uid()))
WITH CHECK (public.is_educator(auth.uid()));

CREATE TRIGGER update_kelas_rombel_updated_at
BEFORE UPDATE ON public.kelas_rombel
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.kelas_rombel (tingkat, rombel, nama) VALUES
('VII','A','VII A'),('VII','B','VII B'),('VII','C','VII C'),
('VIII','A','VIII A'),('VIII','B','VIII B'),('VIII','C','VIII C'),
('IX','A','IX A'),('IX','B','IX B'),('IX','C','IX C');