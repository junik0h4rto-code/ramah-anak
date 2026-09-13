import { createFileRoute } from "@tanstack/react-router";

async function jalankan() {
  const { jalankanSeedAwal } = await import("@/lib/seed.server");
  const hasil = await jalankanSeedAwal(true);
  return new Response(JSON.stringify(hasil), {
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/setup-admin")({
  server: {
    handlers: {
      GET: () => jalankan(),
      POST: () => jalankan(),
    },
  },
});
