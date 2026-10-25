import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/lesson-generator")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleLessonGenerator } = await import("@/lib/lesson-generator.server");
    return handleLessonGenerator(request);
  } } },
});