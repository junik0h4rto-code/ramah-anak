import { describe, expect, it } from "vitest";
import { ASUMSI_KONDISI_SEKOLAH, DEFAULT_INPUT, MODEL_PEMBELAJARAN, gabungBagian, lessonInputSchema, lessonOutputSchema, masalahRancangan, pencarianVideo, teksSiswa, type LessonOutput } from "./lesson-schema";
import { dokumenTeks } from "./lesson-export";

const input = { ...DEFAULT_INPUT, mapel: "IPA", topik: "Pencemaran air", karakteristik: "Siswa beragam", sarana: "Buku dan air", konteks: "Sungai di sekitar sekolah" };
function output(): LessonOutput {
  return { ringkasan: "Ringkasan", skenario: "Skenario", media: "Ide media", lkpd: "LKPD tanpa kunci", kunci: "RAHASIA_JAWABAN_GURU", asesmen: "Asesmen", refleksi: "Refleksi", tindakLanjut: "Remedial", materiSiswa: "Bacaan siswa", cp: "Draf Saran AI", tp: "Draf Saran AI", tujuan: [{ id: "TP1", tujuan: "Menganalisis", indikator: "Menjelaskan" }], kegiatan: MODEL_PEMBELAJARAN.PBL.map((tahap) => ({ tahap, menit: 16, guru: "Membimbing", siswa: "Mengamati", tujuanId: ["TP1"] })), peringatan: [] };
}
describe("Rancangan pembelajaran", () => {
  for (const key of ["karakteristik", "sarana", "konteks"] as const) {
    it(`${key} opsional dan memakai asumsi saat kosong`, () => {
      const blank = lessonInputSchema.parse({ ...input, [key]: "   " });
      expect(blank[key]).toBe(ASUMSI_KONDISI_SEKOLAH[key]);
      const omitted = { ...input } as Record<string, unknown>;
      delete omitted[key];
      expect(lessonInputSchema.parse(omitted)[key]).toBe(ASUMSI_KONDISI_SEKOLAH[key]);
      expect(lessonInputSchema.parse({ ...input, [key]: "Kondisi dari guru" })[key]).toBe("Kondisi dari guru");
    });
  }
  it("total durasi persis 80 menit", () => { const h = output(); expect(masalahRancangan(input, h)).toEqual([]); h.kegiatan[0] = { ...h.kegiatan[0], tahap: "Orientasi masalah", menit: 15, guru: "Membimbing", siswa: "Mengamati", tujuanId: ["TP1"] }; expect(masalahRancangan(input, h).some((v) => v.includes("79"))).toBe(true); });
  it("PBL memiliki lima sintaks berbeda", () => { const h = output(); h.kegiatan[0] = { tahap: "Stimulasi", menit: 16, guru: "", siswa: "", tujuanId: ["TP1"] }; expect(masalahRancangan(input, h)).toContain("Sintaks belum ada: Orientasi masalah."); });
  it("TP pada kegiatan harus merujuk tujuan nyata", () => { const h = output(); const first = h.kegiatan[0]; if (!first) throw new Error(); first.tujuanId = ["TP9"]; expect(masalahRancangan(input, h).length).toBeGreaterThan(0); });
  it("pembuatan ulang refleksi tidak mengubah bagian lain", () => { const h = output(); const changed = gabungBagian(h, { ...h, refleksi: "Baru", lkpd: "Tidak boleh berubah" }, "refleksi"); expect(changed.refleksi).toBe("Baru"); expect(changed.lkpd).toBe(h.lkpd); });
  it("materi yang dikirim ke siswa tidak menyertakan bagian kunci", () => { expect(teksSiswa(output())).not.toContain("RAHASIA_JAWABAN_GURU"); });
  it("ekspor siswa tidak menyertakan bagian kunci", () => { expect(dokumenTeks(input, output(), true)).not.toContain("RAHASIA_JAWABAN_GURU"); expect(dokumenTeks(input, output(), false)).toContain("RAHASIA_JAWABAN_GURU"); });
  it("sumber video hanya pencarian belum terverifikasi", () => { const media = pencarianVideo(input); expect(media).toContain("Pencarian Video (belum diverifikasi)"); expect(media).toContain("youtube.com/results?search_query="); expect(media).not.toContain("watch?v="); });
  it("input dan keluaran tidak lengkap ditolak", () => { expect(lessonInputSchema.safeParse({ ...input, topik: "" }).success).toBe(false); expect(lessonOutputSchema.safeParse({ ringkasan: "Saja" }).success).toBe(false); });
});