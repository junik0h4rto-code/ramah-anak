import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
};

type AuthDetails = {
  client?: { name?: string } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("authorization_id tidak ditemukan");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-xl font-extrabold">Permintaan tidak dapat dimuat</h1>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const nama = details?.client?.name ?? "Aplikasi";

  async function putuskan(setuju: boolean) {
    setBusy(true);
    setGalat(null);
    const api = oauthApi();
    const { data, error } = setuju
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setGalat(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setGalat("Server tidak mengirim alamat pengalihan.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
        <h1 className="font-display text-2xl font-extrabold">Hubungkan {nama}</h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {nama} akan dapat membaca data portal sekolah sebagai akun Anda.
        </p>
        {galat && (
          <p role="alert" className="mt-4 rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive">
            {galat}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            disabled={busy}
            onClick={() => putuskan(true)}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-extrabold text-accent-foreground shadow-pop disabled:opacity-60"
          >
            Izinkan
          </button>
          <button
            disabled={busy}
            onClick={() => putuskan(false)}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-extrabold disabled:opacity-60"
          >
            Tolak
          </button>
        </div>
      </div>
    </main>
  );
}
