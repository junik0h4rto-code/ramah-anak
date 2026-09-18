import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "profil_saya",
  title: "Profil saya",
  description: "Ambil profil pengguna yang sedang masuk: nama, email, kelas/mapel, dan jumlah koin.",
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Belum masuk akun.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nama, email, kelas, mapel, koin")
      .eq("id", ctx.getUserId()!)
      .maybeSingle();
    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError("Profil tidak ditemukan.");

    const profil = {
      id: data.id,
      nama: data.nama,
      email: data.email,
      kelas: data.kelas,
      mapel: data.mapel,
      koin: data.koin,
    };
    return {
      content: [{ type: "text" as const, text: `${profil.nama} (${profil.email}) — koin: ${profil.koin}` }],
      structuredContent: { profil },
    };
  },
});
