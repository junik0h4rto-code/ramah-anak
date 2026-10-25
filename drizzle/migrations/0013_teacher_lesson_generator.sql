CREATE TABLE public.rancangan_pembelajaran (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 judul text NOT NULL, input jsonb NOT NULL DEFAULT '{}'::jsonb, hasil jsonb, status text NOT NULL DEFAULT 'draf' CHECK(status IN ('draf','ditinjau')), versi integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.rancangan_pembelajaran TO authenticated;
GRANT ALL ON public.rancangan_pembelajaran TO service_role;
ALTER TABLE public.rancangan_pembelajaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guru mengelola rancangan sendiri" ON public.rancangan_pembelajaran FOR ALL TO authenticated USING(user_id=auth.uid() AND private.is_educator(auth.uid())) WITH CHECK(user_id=auth.uid() AND private.is_educator(auth.uid()));
CREATE INDEX ON public.rancangan_pembelajaran(user_id,updated_at DESC);
CREATE TABLE public.permintaan_generator (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'memproses', pesan text);
GRANT SELECT,INSERT,UPDATE ON public.permintaan_generator TO authenticated;
GRANT ALL ON public.permintaan_generator TO service_role;
ALTER TABLE public.permintaan_generator ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guru melihat permintaan sendiri" ON public.permintaan_generator FOR SELECT TO authenticated USING(user_id=auth.uid() AND private.is_educator(auth.uid()));
CREATE INDEX ON public.permintaan_generator(user_id,created_at DESC);
CREATE TABLE public.status_ai_generator (id boolean PRIMARY KEY DEFAULT true CHECK(id), status integer NOT NULL, pesan text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.status_ai_generator TO service_role;
ALTER TABLE public.status_ai_generator ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.reservasi_generator() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); rid uuid;
BEGIN
 IF uid IS NULL OR NOT private.is_educator(uid) THEN RAISE EXCEPTION 'Hanya guru atau admin'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text, 0));
 IF EXISTS(SELECT 1 FROM public.permintaan_generator WHERE user_id=uid AND created_at>now()-interval '1 minute') THEN RAISE EXCEPTION 'Tunggu satu menit sebelum membuat rancangan berikutnya'; END IF;
 IF (SELECT count(*) FROM public.permintaan_generator WHERE user_id=uid AND created_at>now()-interval '24 hours')>=20 THEN RAISE EXCEPTION 'Batas 20 pembuatan per hari tercapai'; END IF;
 INSERT INTO public.permintaan_generator(user_id) VALUES(uid) RETURNING id INTO rid;
 RETURN rid;
END $$;
REVOKE ALL ON FUNCTION public.reservasi_generator() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reservasi_generator() TO authenticated,service_role;