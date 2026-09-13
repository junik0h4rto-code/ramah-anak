/** Perkecil gambar di browser dan kembalikan sebagai data URL agar ringan disimpan. */
export async function kompresGambar(
  file: File,
  sisiMaks = 1200,
  batasByte = 850_000,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const skala = Math.min(1, sisiMaks / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * skala);
  canvas.height = Math.round(bitmap.height * skala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let mutu = 0.82;
  let hasil = canvas.toDataURL("image/jpeg", mutu);
  while (hasil.length > batasByte && mutu > 0.35) {
    mutu -= 0.12;
    hasil = canvas.toDataURL("image/jpeg", mutu);
  }
  if (hasil.length > batasByte) throw new Error("Foto terlalu besar, coba foto lain.");
  return hasil;
}

/** Ambil koordinat dari tautan Google Maps yang disalin pengguna. */
export function koordinatDariTautanMaps(url: string): { lat: number; lng: number } | null {
  const pola = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /[?&](?:q|query|ll|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /^\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\s*$/,
  ];
  for (const p of pola) {
    const m = url.match(p);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  }
  return null;
}

export function embedPeta(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}
