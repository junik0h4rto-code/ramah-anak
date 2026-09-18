import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "berita_terbaru",
  title: "Berita & pengumuman terbaru",
  description: "Ambil berita dan pengumuman sekolah yang sudah dipublikasikan.",
  inputSchema: {
    batas: z.number().int().min(1).max(30).optional().describe("Jumlah maksimum berita (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ batas }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Belum masuk akun.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("berita")
      .select("id, judul, isi, kategori, kelas_target, tanggal_kegiatan, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(batas ?? 10);
    if (error) throw new ToolError(error.message);

    const berita = (data ?? []).map((b) => ({
      id: b.id,
      judul: b.judul,
      isi: b.isi,
      kategori: b.kategori,
      kelas_target: b.kelas_target,
      tanggal_kegiatan: b.tanggal_kegiatan,
      dibuat: b.created_at,
    }));
    return {
      content: [{ type: "text" as const, text: `${berita.length} berita terbaru.` }],
      structuredContent: { berita },
    };
  },
});
