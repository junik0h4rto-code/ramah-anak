import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "daftar_hadiah",
  title: "Katalog Toko Reward",
  description: "Tampilkan hadiah di Toko Reward beserta harga koin dan stoknya.",
  inputSchema: {
    kategori: z.string().trim().max(60).optional().describe("Filter kategori hadiah."),
    batas: z.number().int().min(1).max(50).optional().describe("Jumlah maksimum hadiah (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ kategori, batas }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Belum masuk akun.");
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("hadiah")
      .select("id, nama, kategori, tipe, harga_koin, stok")
      .order("harga_koin", { ascending: true })
      .limit(batas ?? 30);
    if (kategori) query = query.ilike("kategori", `%${kategori}%`);

    const { data, error } = await query;
    if (error) throw new ToolError(error.message);

    const hadiah = (data ?? []).map((h) => ({
      id: h.id,
      nama: h.nama,
      kategori: h.kategori,
      tipe: h.tipe,
      harga_koin: h.harga_koin,
      stok: h.stok,
    }));
    return {
      content: [{ type: "text" as const, text: `${hadiah.length} hadiah tersedia.` }],
      structuredContent: { hadiah },
    };
  },
});
