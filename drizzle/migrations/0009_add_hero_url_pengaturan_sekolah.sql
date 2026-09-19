ALTER TABLE public.pengaturan_sekolah ADD COLUMN IF NOT EXISTS hero_url TEXT;
GRANT SELECT (hero_url) ON public.pengaturan_sekolah TO anon;
GRANT SELECT (hero_url) ON public.pengaturan_sekolah TO authenticated;