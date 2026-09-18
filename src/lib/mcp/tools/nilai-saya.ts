import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "nilai_saya",
  title: "Nilai saya",
  description: "Ambil daftar nilai milik pengguna yang sedang masuk (siswa).",
  inputSchema: {
    mapel: z.string().trim().max(60).optional().describe("Filter mata pelajaran."),
    batas: z.number().int().min(1).max(100).optional().describe("Jumlah maksimum baris (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ mapel, batas }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Belum masuk akun.");
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("nilai_siswa")
      .select("id, mapel, jenis, skor, tanggal, catatan")
      .eq("user_id", ctx.getUserId()!)
      .order("tanggal", { ascending: false })
      .limit(batas ?? 30);
    if (mapel) query = query.ilike("mapel", `%${mapel}%`);

    const { data, error } = await query;
    if (error) throw new ToolError(error.message);

    const nilai = (data ?? []).map((n) => ({
      id: n.id,
      mapel: n.mapel,
      jenis: n.jenis,
      skor: n.skor,
      tanggal: n.tanggal,
      catatan: n.catatan,
    }));
    return {
      content: [{ type: "text" as const, text: `${nilai.length} baris nilai.` }],
      structuredContent: { nilai },
    };
  },
});
