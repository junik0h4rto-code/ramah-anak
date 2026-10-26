import { BAGIAN, type LessonInput, type LessonOutput, type Bagian } from "./lesson-schema";

export function dokumenTeks(input: LessonInput, hasil: LessonOutput, siswa: boolean) {
  const keys: Bagian[] = siswa ? ["lkpd", "refleksi"] : Object.keys(BAGIAN) as Bagian[];
  return `${input.topik}\n${input.mapel} · ${input.jenjang} Kelas ${input.kelas} · ${input.menit} menit\n\n${keys.map((k) => `${BAGIAN[k].toUpperCase()}\n${hasil[k]}`).join("\n\n")}`;
}
export function pratinjauCetak(teks: string) {
  const win = window.open("", "_blank");
  if (!win) throw new Error("Izinkan jendela cetak pada browser.");
  win.document.title = "Rancangan Pembelajaran";
  const heading = win.document.createElement("h1"); heading.textContent = "Rancangan Pembelajaran";
  const pre = win.document.createElement("pre"); pre.textContent = teks;
  pre.style.whiteSpace = "pre-wrap"; pre.style.fontFamily = "sans-serif"; pre.style.lineHeight = "1.6";
  win.document.body.append(heading, pre);
  win.focus(); win.print();
}
export async function eksporDocx(teks: string, judul: string) {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const doc = new Document({ sections: [{ children: teks.split("\n").map((line) => new Paragraph({ children: [new TextRun(line)] })) }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${judul.replace(/[^\p{L}\p{N} -]/gu, "").slice(0, 80) || "rancangan"}.docx`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}