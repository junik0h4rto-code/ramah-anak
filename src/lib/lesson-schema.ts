import { z } from "zod";

export const MODEL_PEMBELAJARAN = {
  PBL: ["Orientasi masalah", "Pengorganisasian", "Penyelidikan", "Pengembangan dan penyajian hasil", "Evaluasi proses pemecahan masalah"],
  PjBL: ["Pertanyaan mendasar", "Perencanaan proyek", "Penyusunan jadwal", "Pemantauan proyek", "Pengujian hasil", "Evaluasi pengalaman"],
  Discovery: ["Stimulasi", "Identifikasi masalah", "Pengumpulan data", "Pengolahan data", "Pembuktian", "Generalisasi"],
  Inquiry: ["Orientasi", "Perumusan masalah", "Hipotesis", "Pengumpulan data", "Pengujian hipotesis", "Kesimpulan"],
  Cooperative: ["Penyampaian tujuan", "Penyajian informasi", "Pengorganisasian kelompok", "Pembimbingan kelompok", "Evaluasi", "Penghargaan"],
  Lainnya: [],
} as const;
const teks = z.string().trim().max(3000);
export const lessonInputSchema = z.object({
  jenjang: z.enum(["SD", "SMP", "SMA/SMK"]), kelas: teks.min(1), fase: teks.min(1), mapel: teks.min(1), topik: teks.min(3),
  cp: teks, tp: teks, menit: z.number().int().min(15).max(480), model: z.enum(["PBL", "PjBL", "Discovery", "Inquiry", "Cooperative", "Lainnya"]),
  modelLain: teks, karakteristik: teks.min(5), sarana: teks.min(3), konteks: teks.min(5), metode: teks, preferensi: teks,
}).strict().superRefine((v, ctx) => {
  if (v.model === "Lainnya" && v.modelLain.length < 3) ctx.addIssue({ code: "custom", path: ["modelLain"], message: "Isi nama dan sintaks model lain" });
});
export type LessonInput = z.infer<typeof lessonInputSchema>;
export const BAGIAN = {
  ringkasan: "Ringkasan", skenario: "Skenario Pembelajaran", media: "Media Pembelajaran", lkpd: "LKPD Siswa",
  kunci: "Kunci Jawaban Guru", asesmen: "Asesmen dan Rubrik", refleksi: "Refleksi", tindakLanjut: "Remedial dan Pengayaan",
} as const;
export type Bagian = keyof typeof BAGIAN;
// Flat, strict schema: every field is required, including fields whose text may be empty.
export const lessonOutputSchema = z.object({
  ringkasan: z.string(), skenario: z.string(), media: z.string(), lkpd: z.string(), kunci: z.string(), asesmen: z.string(), refleksi: z.string(), tindakLanjut: z.string(), materiSiswa: z.string(),
  cp: z.string(), tp: z.string(),
  tujuan: z.array(z.object({ id: z.string(), tujuan: z.string(), indikator: z.string() }).strict()),
  kegiatan: z.array(z.object({ tahap: z.string(), menit: z.number(), guru: z.string(), siswa: z.string(), tujuanId: z.array(z.string()) }).strict()),
  peringatan: z.array(z.string()),
}).strict();
export type LessonOutput = z.infer<typeof lessonOutputSchema>;
export function masalahRancangan(input: LessonInput, hasil: LessonOutput): string[] {
  const masalah: string[] = [];
  const total = hasil.kegiatan.reduce((s, k) => s + k.menit, 0);
  if (total !== input.menit) masalah.push(`Total kegiatan ${total} menit, harus ${input.menit} menit.`);
  if (hasil.kegiatan.some((k) => !Number.isInteger(k.menit) || k.menit <= 0)) masalah.push("Durasi setiap kegiatan harus bilangan bulat positif.");
  const ids = new Set(hasil.tujuan.map((t) => t.id));
  if (!ids.size || ids.size !== hasil.tujuan.length) masalah.push("Tujuan harus tersedia dengan ID yang berbeda.");
  if (hasil.kegiatan.some((k) => !k.tujuanId.length || k.tujuanId.some((id) => !ids.has(id)))) masalah.push("Pemetaan kegiatan terhadap tujuan belum lengkap.");
  const tahap = hasil.kegiatan.map((k) => k.tahap.toLowerCase());
  for (const sintaks of MODEL_PEMBELAJARAN[input.model]) {
    if (!tahap.some((t) => t.includes(sintaks.toLowerCase()))) masalah.push(`Sintaks belum ada: ${sintaks}.`);
  }
  for (const [key, label] of Object.entries(BAGIAN)) {
    if (!hasil[key as Bagian].trim()) masalah.push(`Bagian ${label} masih kosong.`);
  }
  if (!hasil.materiSiswa.trim()) masalah.push("Materi bacaan siswa belum tersedia.");
  if (Object.values(hasil).some((v) => typeof v === "string" && v.length > 60000)) masalah.push("Bagian dokumen terlalu panjang.");
  return masalah;
}
export function pencarianVideo(input: LessonInput) {
  return `Pencarian Video (belum diverifikasi)\nhttps://www.youtube.com/results?search_query=${encodeURIComponent(`${input.mapel} ${input.topik} kelas ${input.kelas} ${input.jenjang} bahasa Indonesia`)}\nGuru perlu memeriksa relevansi, bahasa, usia, dan isi video sebelum digunakan.`;
}
export function gabungBagian(lama: LessonOutput, baru: LessonOutput, bagian: Bagian): LessonOutput {
  return { ...lama, [bagian]: baru[bagian], ...(bagian === "skenario" ? { kegiatan: baru.kegiatan } : {}), ...(bagian === "ringkasan" ? { tujuan: baru.tujuan, cp: baru.cp, tp: baru.tp } : {}), ...(bagian === "lkpd" ? { materiSiswa: baru.materiSiswa } : {}) };
}
export function teksSiswa(hasil: LessonOutput) { return `${hasil.materiSiswa}\n\nLKPD SISWA\n${hasil.lkpd}`; }
export const DEFAULT_INPUT: LessonInput = { jenjang: "SMP", kelas: "7", fase: "D", mapel: "", topik: "", cp: "", tp: "", menit: 80, model: "PBL", modelLain: "", karakteristik: "", sarana: "", konteks: "", metode: "", preferensi: "" };