import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "daftar_modul",
  title: "Daftar modul belajar",
  description: "Tampilkan modul belajar yang tersedia, opsional difilter kelas atau mata pelajaran.",
  inputSchema: {
    kelas: z.string().trim().max(30).optional().describe("Filter nama kelas, mis. VII A."),
    mapel: z.string().trim().max(60).optional().describe("Filter mata pelajaran."),
    batas: z.number().int().min(1).max(50).optional().describe("Jumlah maksimum modul (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ kelas, mapel, batas }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Belum masuk akun.");
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("modul")
      .select("id, judul, deskripsi, kategori, mapel, kelas, kelas_target, koin_reward, created_at")
      .order("created_at", { ascending: false })
      .limit(batas ?? 20);
    if (mapel) query = query.ilike("mapel", `%${mapel}%`);
    if (kelas) query = query.or(`kelas.eq.${kelas},kelas_target.ilike.%${kelas}%,kelas_target.is.null`);

    const { data, error } = await query;
    if (error) throw new ToolError(error.message);

    const modul = (data ?? []).map((m) => ({
      id: m.id,
      judul: m.judul,
      deskripsi: m.deskripsi,
      kategori: m.kategori,
      mapel: m.mapel,
      kelas: m.kelas,
      kelas_target: m.kelas_target,
      koin_reward: m.koin_reward,
      dibuat: m.created_at,
    }));
    return {
      content: [{ type: "text" as const, text: `${modul.length} modul ditemukan.` }],
      structuredContent: { modul },
    };
  },
});
