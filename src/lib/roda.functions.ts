import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const statusRoda = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("status_roda", { _user_id: context.userId });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return {
      sisaPutaran: row?.sisa_putaran ?? 0,
      saldoKoin: row?.saldo_koin ?? 0,
    };
  });

export const putarRoda = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("putar_roda", { _user_id: context.userId });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    return {
      hadiahIndex: row?.hadiah_index ?? 0,
      hadiahLabel: row?.hadiah_label ?? "",
      koinHadiah: row?.koin_hadiah ?? 0,
      lencana: row?.lencana ?? false,
      saldoKoin: row?.saldo_koin ?? 0,
      sisaPutaran: row?.sisa_putaran ?? 0,
    };
  });
