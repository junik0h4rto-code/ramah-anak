import { createServerFn } from "@tanstack/react-start";

/**
 * Dipanggil otomatis saat beranda dimuat. Idempoten: hanya membuat akun
 * admin/demo bila belum ada, dan hanya dijalankan sekali per instance server.
 */
export const pastikanSeedAwal = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { jalankanSeedAwal } = await import("./seed.server");
    await jalankanSeedAwal();
  } catch (e) {
    console.error("[seed] gagal", e);
  }
  return { ok: true };
});
