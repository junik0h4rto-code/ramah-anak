import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Copy, Download, LoaderCircle, Plus, Printer, RotateCcw, Save, Sparkles, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { BAGIAN, DEFAULT_INPUT, lessonInputSchema, lessonOutputSchema, masalahRancangan, teksSiswa, type Bagian, type LessonInput, type LessonOutput } from "@/lib/lesson-schema";
import { listRancangan, simpanRancangan, hapusRancangan, pulihkanGenerator } from "@/lib/lesson.functions";
import { dokumenTeks, eksporDocx, pratinjauCetak } from "@/lib/lesson-export";

type Props = { onApply: (input: LessonInput, text: string) => void };
export function LessonGenerator({ onApply }: Props) {
  const { pengguna } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<LessonInput>(DEFAULT_INPUT);
  const [hasil, setHasil] = useState<LessonOutput | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [bagian, setBagian] = useState<Bagian>("ringkasan");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [partial, setPartial] = useState("");
  const [studentExport, setStudentExport] = useState(true);
  const abort = useRef<AbortController | null>(null);
  const save = useServerFn(simpanRancangan);
  const remove = useServerFn(hapusRancangan);
  const resume = useServerFn(pulihkanGenerator);
  const drafts = useQuery({ queryKey: ["rancangan-pembelajaran", pengguna?.id], queryFn: () => listRancangan(), enabled: open });
  const warnings = hasil ? masalahRancangan(input, hasil) : [];
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (dirty || busy) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    const click = (e: MouseEvent) => { if ((dirty || busy) && (e.target as Element)?.closest?.("a") && !confirm("Perubahan belum disimpan. Tinggalkan halaman?")) { e.preventDefault(); e.stopPropagation(); } };
    document.addEventListener("click", click, true);
    return () => { window.removeEventListener("beforeunload", handler); document.removeEventListener("click", click, true); };
  }, [dirty, busy]);
  useEffect(() => () => abort.current?.abort(), []);
  function update<K extends keyof LessonInput>(key: K, value: LessonInput[K]) { setInput((p) => ({ ...p, [key]: value })); setDirty(true); setReviewed(false); }
  function discard() { return !dirty || confirm("Abaikan perubahan yang belum disimpan?"); }
  async function generate(section: Bagian | null = null) {
    const valid = lessonInputSchema.safeParse(input);
    if (!valid.success) { setError(valid.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n")); return; }
    if (hasil && !section && !confirm("Ganti seluruh hasil saat ini?")) return;
    setBusy(true); setError(""); setPartial(""); setReasoning("");
    const controller = new AbortController(); abort.current = controller;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Silakan masuk kembali.");
      const response = await fetch("/api/lesson-generator", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ input: valid.data, hasil: section ? hasil : null, bagian: section }), signal: controller.signal });
      if (!response.ok) { const e = await response.json() as { message?: string }; throw new Error(e.message || "Generator tidak tersedia."); }
      const reader = response.body?.getReader(); if (!reader) throw new Error("Respons generator kosong.");
      const decoder = new TextDecoder(); let buffer = ""; let complete = false;
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { type: string; text?: string; message?: string; hasil?: unknown };
          if (event.type === "error") throw new Error(event.message || "Pembuatan gagal.");
          if (event.type === "progress") setPartial((p) => (p + (event.text || "")).slice(-100000));
          if (event.type === "reasoning") setReasoning((p) => (p + (event.text || "")).slice(-10000));
          if (event.type === "result") { setHasil(lessonOutputSchema.parse(event.hasil)); setDirty(true); setReviewed(false); complete = true; }
        }
        if (done) break;
      }
      if (!complete) throw new Error("Respons terputus sebelum rancangan lengkap. Input tetap tersedia.");
      toast.success(section ? "Bagian diperbarui; bagian lain tetap." : "Rancangan siap ditinjau.");
    } catch (e) { setError(controller.signal.aborted ? "Pembuatan dihentikan. Hasil sebelumnya tetap tersedia." : e instanceof Error ? e.message : "Pembuatan gagal."); }
    finally { setBusy(false); abort.current = null; }
  }
  async function persist(final: boolean) {
    const v = lessonInputSchema.safeParse(input);
    if (!v.success) { setError(v.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n")); return; }
    setSaving(true);
    try { const row = await save({ data: { id, input: v.data, hasil, status: final ? "ditinjau" : "draf" } }); setId(row.id); setDirty(false); await drafts.refetch(); toast.success(final ? "Rancangan ditinjau tersimpan." : "Draf tersimpan."); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan."); }
    finally { setSaving(false); }
  }
  const fields: { key: Exclude<keyof LessonInput, "jenjang" | "model" | "menit">; label: string; required?: boolean; multiline?: boolean }[] = [
    { key: "kelas", label: "Kelas", required: true }, { key: "fase", label: "Fase", required: true }, { key: "mapel", label: "Mata pelajaran", required: true }, { key: "topik", label: "Materi / topik", required: true },
    { key: "cp", label: "Capaian Pembelajaran (CP)", multiline: true }, { key: "tp", label: "Tujuan Pembelajaran (TP)", multiline: true },
    { key: "karakteristik", label: "Karakteristik siswa dan pengetahuan awal (opsional)", multiline: true }, { key: "sarana", label: "Sarana dan prasarana (opsional)", multiline: true }, { key: "konteks", label: "Konteks nyata lingkungan siswa (opsional)", multiline: true },
    { key: "metode", label: "Pendekatan / metode tambahan" }, { key: "preferensi", label: "Preferensi media dan format output" }, ...(input.model === "Lainnya" ? [{ key: "modelLain" as const, label: "Nama dan sintaks model lain", required: true }] : []),
  ];
  return <section className="border-y border-border py-5">
    <Button type="button" variant="outline" className="h-auto w-full justify-between whitespace-normal px-4 py-3 text-left" onClick={() => { if (!open || discard()) setOpen(!open); }}><span className="flex items-center gap-2"><Sparkles /> Generator Pembelajaran Mendalam</span><span>{open ? "−" : "+"}</span></Button>
    {open && <div className="mt-5 grid min-w-0 gap-6">
      <div className="flex flex-wrap items-center gap-2"><h2 className="mr-auto text-lg font-extrabold">Rancangan Pembelajaran</h2><Button variant="outline" disabled={busy} onClick={() => { if (discard()) { setInput(DEFAULT_INPUT); setHasil(null); setId(null); setDirty(false); setError(""); setReviewed(false); } }}><Plus /> Baru</Button></div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void generate(); }}>
        <label className="grid gap-1 text-sm font-bold">Jenjang pendidikan<select disabled={busy} value={input.jenjang} onChange={(e) => update("jenjang", e.target.value as LessonInput["jenjang"])} className="h-10 rounded-md border border-input bg-background px-3">{["SD", "SMP", "SMA/SMK"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-bold">Model pembelajaran<select disabled={busy} value={input.model} onChange={(e) => update("model", e.target.value as LessonInput["model"])} className="h-10 rounded-md border border-input bg-background px-3">{Object.entries({ PBL: "Problem Based Learning (PBL)", PjBL: "Project Based Learning (PjBL)", Discovery: "Discovery Learning", Inquiry: "Inquiry Learning", Cooperative: "Cooperative Learning", Lainnya: "Model lain" }).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        {fields.map((f) => <label key={f.key} className="grid min-w-0 gap-1 text-sm font-bold">{f.label}{f.required && " *"}{f.multiline ? <Textarea required={f.required} disabled={busy} value={input[f.key]} placeholder={["karakteristik", "sarana", "konteks"].includes(f.key) ? "Perkiraan umum SMPN 26 Bandung jika kosong — belum terverifikasi, perlu ditinjau guru." : undefined} maxLength={3000} rows={3} onChange={(e) => update(f.key, e.target.value)} /> : <Input required={f.required} disabled={busy} value={input[f.key]} maxLength={3000} onChange={(e) => update(f.key, e.target.value)} />}</label>)}
        <label className="grid gap-1 text-sm font-bold">Alokasi waktu (menit)<Input type="number" min={15} max={480} step={1} required disabled={busy} value={input.menit} onChange={(e) => update("menit", Number(e.target.value))} /></label>
        <div className="flex flex-wrap items-end gap-2"><Button type="submit" disabled={busy || saving}><Sparkles /> Buat Rancangan</Button>{busy && <Button type="button" variant="outline" onClick={() => abort.current?.abort()}><Square /> Hentikan</Button>}</div>
        {(!input.cp || !input.tp) && <p className="text-xs text-muted-foreground sm:col-span-2">CP/TP yang belum diisi akan menjadi Draf Saran AI, bukan dokumen kurikulum terverifikasi.</p>}
      </form>
      {error && <div role="alert" className="whitespace-pre-wrap rounded-md border border-destructive p-3 text-sm text-destructive">{error}{pengguna?.peran === "admin" && <Button className="mt-3" variant="outline" disabled={busy} onClick={async () => { try { await resume(); setError(""); toast.success("Akses dibuka kembali. Mulai pembuatan baru setelah masalah layanan ditangani."); } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal membuka akses."); } }}><RotateCcw /> Buka Kembali Akses AI</Button>}</div>}
      {busy && <div role="status" className="grid gap-2 border-l-4 border-primary pl-3"><span className="flex items-center gap-2 font-bold"><LoaderCircle className="animate-spin" /> Menyusun rancangan…</span>{reasoning && <details><summary className="text-sm">Catatan penyusunan AI</summary><p className="whitespace-pre-wrap text-sm text-muted-foreground">{reasoning}</p></details>}{partial && <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">{partial}</pre>}</div>}
      {hasil && <div className="grid min-w-0 gap-4">
        <div role="tablist" aria-label="Bagian rancangan" className="flex flex-wrap gap-2">{Object.entries(BAGIAN).map(([k, l]) => <Button type="button" role="tab" aria-selected={bagian === k} key={k} variant={bagian === k ? "default" : "outline"} onClick={() => setBagian(k as Bagian)}>{l}</Button>)}</div>
        <div className="flex flex-wrap items-center gap-2"><h3 className="mr-auto font-bold">{BAGIAN[bagian]}</h3><Button variant="outline" disabled={busy} onClick={() => void generate(bagian)}><RotateCcw /> Buat Ulang Bagian</Button></div>
        {bagian === "ringkasan" && (!input.cp || !input.tp) && <div className="text-sm font-bold text-accent-foreground">Draf Saran AI — CP: {hasil.cp} · TP: {hasil.tp}</div>}
        <Textarea aria-label={`Edit ${BAGIAN[bagian]}`} rows={16} maxLength={60000} disabled={busy} value={hasil[bagian]} onChange={(e) => { setHasil({ ...hasil, [bagian]: e.target.value }); setDirty(true); setReviewed(false); }} className="leading-relaxed" />
        {bagian === "skenario" && <div className="grid gap-2"><p className="text-sm font-bold">Durasi kegiatan — total {hasil.kegiatan.reduce((s, k) => s + k.menit, 0)} / {input.menit} menit</p>{hasil.kegiatan.map((k, i) => <label key={i} className="flex items-center gap-3 text-sm"><span className="min-w-0 flex-1">{k.tahap} · {k.tujuanId.join(", ")}</span><Input type="number" min={1} step={1} className="w-24" aria-label={`Menit ${k.tahap}`} value={k.menit} onChange={(e) => { setHasil({ ...hasil, kegiatan: hasil.kegiatan.map((v, j) => j === i ? { ...v, menit: Number(e.target.value) } : v) }); setDirty(true); setReviewed(false); }} /></label>)}</div>}
        {bagian === "lkpd" && <label className="grid gap-2 text-sm font-bold">Materi bacaan siswa<Textarea aria-label="Materi bacaan siswa" rows={8} maxLength={60000} value={hasil.materiSiswa} onChange={(e) => { setHasil({ ...hasil, materiSiswa: e.target.value }); setDirty(true); setReviewed(false); }} /></label>}
        {bagian === "media" && <Button asChild variant="outline" className="w-fit"><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${input.mapel} ${input.topik} kelas ${input.kelas}`)}`} target="_blank" rel="noopener noreferrer">Pencarian Video ↗</a></Button>}
        {(warnings.length > 0 || hasil.peringatan.length > 0) && <div className="rounded-md border border-border bg-muted p-3 text-sm"><p className="font-bold">Perlu ditinjau guru</p><ul className="list-disc pl-5">{[...warnings, ...hasil.peringatan].map((w, i) => <li key={i}>{w}</li>)}</ul></div>}
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />Saya sudah memeriksa CP/TP, keselarasan soal, sumber, dan memastikan materi/LKPD siswa tidak memuat kunci jawaban guru.</label>
        <div className="flex flex-wrap gap-2"><Button disabled={saving || busy} onClick={() => void persist(false)}><Save /> Simpan Draf</Button><Button variant="outline" disabled={!reviewed || warnings.length > 0 || busy || saving} onClick={() => void persist(true)}><Save /> Simpan Hasil Ditinjau</Button><Button variant="outline" disabled={!reviewed || warnings.length > 0 || busy} onClick={() => onApply(input, teksSiswa(hasil))}><BookOpen /> Gunakan di Form Materi</Button><Button variant="outline" disabled={busy} onClick={() => { if (discard()) { setId(null); setInput({ ...input, topik: `${input.topik} (Salinan)` }); setDirty(true); setReviewed(false); } }}><Copy /> Duplikasi</Button></div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={studentExport} onChange={(e) => setStudentExport(e.target.checked)} />Dokumen siswa saja (tanpa kunci guru)</label><Button variant="outline" disabled={busy} onClick={() => { try { pratinjauCetak(dokumenTeks(input, hasil, studentExport)); } catch (e) { toast.error(e instanceof Error ? e.message : "Cetak gagal."); } }}><Printer /> Cetak / Simpan PDF</Button><Button variant="outline" disabled={busy} onClick={() => void eksporDocx(dokumenTeks(input, hasil, studentExport), input.topik).catch(() => toast.error("Ekspor DOCX gagal."))}><Download /> DOCX</Button></div>
      </div>}
      {!hasil && <Button className="w-fit" disabled={saving || busy} onClick={() => void persist(false)}><Save /> Simpan Input sebagai Draf</Button>}
      <div className="border-t border-border pt-4"><h3 className="mb-3 font-bold">Rancangan Tersimpan {dirty && <span className="text-xs text-muted-foreground">· Perubahan belum disimpan</span>}</h3>{drafts.isLoading && <p>Memuat rancangan…</p>}{drafts.error && <p role="alert">Gagal memuat rancangan.</p>}{!drafts.isLoading && !drafts.data?.length && <p className="text-sm text-muted-foreground">Belum ada rancangan tersimpan.</p>}{drafts.data?.map((r) => <div key={r.id} className="flex flex-wrap items-center gap-2 border-b border-border py-3"><span className="min-w-0 flex-1 break-words text-sm font-bold">{r.judul} <span className="font-normal text-muted-foreground">· {r.status}</span></span><Button variant="outline" disabled={busy} onClick={() => { if (!discard()) return; const v = lessonInputSchema.safeParse(r.input); const h = r.hasil ? lessonOutputSchema.safeParse(r.hasil) : null; if (!v.success || (h && !h.success)) { setError("Draf tidak sesuai format."); return; } setInput(v.data); setHasil(h?.success ? h.data : null); setId(r.id); setDirty(false); setReviewed(r.status === "ditinjau"); setError(""); }}><BookOpen /> Buka</Button><Button variant="ghost" size="icon" title="Hapus rancangan" aria-label={`Hapus rancangan ${r.judul}`} disabled={busy} onClick={async () => { if (!confirm("Hapus rancangan ini?")) return; try { await remove({ data: { id: r.id } }); if (id === r.id) { setId(null); setDirty(true); } await drafts.refetch(); } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal menghapus."); } }}><Trash2 /></Button></div>)}</div>
    </div>}
  </section>;
}