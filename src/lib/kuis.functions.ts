import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const klaimKoinKuis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ jumlah: z.number().int().min(1).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: saldo, error } = await supabaseAdmin.rpc("tambah_koin_kuis", {
      _user_id: context.userId,
      _jumlah: data.jumlah,
    });
    if (error) throw new Error(error.message);
    return { saldoKoin: (saldo as number) ?? 0 };
  });
