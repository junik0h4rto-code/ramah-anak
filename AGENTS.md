<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Guru visibility of student data is enforced by RLS via `guru_kelas` (wali/pengampu) and `private.boleh_lihat_siswa`; admin-only for class placement — keeps teachers scoped to their classes even if UI is bypassed.
- The lesson generator lives only in Input Materi: private owner-scoped JSON drafts are separate from published modules, and only reviewed student material/LKPD can be applied to the unchanged publication form.
- Lesson AI uses an authenticated educator-only streaming TanStack server route with request-scoped Responses SDK helpers, atomic usage reservations, and persistent terminal-access pauses; secrets never enter the client.
- Lesson exports are escaped-text print/PDF-via-browser and lazy DOCX generation; student export excludes teacher sections by construction.
