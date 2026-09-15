-- berita
CREATE POLICY "Restrict news inserts to educators" ON public.berita AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict news updates to educators" ON public.berita AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict news deletes to educators" ON public.berita AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (private.is_educator(auth.uid()));

-- katalog_perilaku
CREATE POLICY "Restrict catalog inserts to educators" ON public.katalog_perilaku AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict catalog updates to educators" ON public.katalog_perilaku AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict catalog deletes to educators" ON public.katalog_perilaku AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (private.is_educator(auth.uid()));

-- kegiatan_sekolah
CREATE POLICY "Restrict event inserts to educators" ON public.kegiatan_sekolah AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict event updates to educators" ON public.kegiatan_sekolah AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict event deletes to educators" ON public.kegiatan_sekolah AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (private.is_educator(auth.uid()));

-- kelas_rombel
CREATE POLICY "Restrict class inserts to educators" ON public.kelas_rombel AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict class updates to educators" ON public.kelas_rombel AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));
CREATE POLICY "Restrict class deletes to educators" ON public.kelas_rombel AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (private.is_educator(auth.uid()));

-- penukaran_hadiah
CREATE POLICY "Restrict redemption updates to educators" ON public.penukaran_hadiah AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (private.is_educator(auth.uid())) WITH CHECK (private.is_educator(auth.uid()));
