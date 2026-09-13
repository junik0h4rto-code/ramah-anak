export type Berita = {
  id: string;
  judul: string;
  ringkasan: string;
  kategori: string;
  tanggal: string;
};

export type Pengumuman = {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  penting: boolean;
};

export type Agenda = {
  id: string;
  tanggal: string;
  judul: string;
  jenis: "Akademik" | "Ekstrakurikuler" | "Libur" | "Lomba";
};

export type Modul = {
  id: string;
  nama: string;
  mapel: string;
  kelas: string;
  ikon: string;
  koin: number;
  rating: number;
  peserta: number;
  durasi: string;
};

export type Hadiah = {
  id: string;
  nama: string;
  ikon: string;
  harga: number;
  stok: number;
  kategori: "Alat Tulis" | "Kupon Kantin" | "Merchandise";
};

export const BERITA_AWAL: Berita[] = [
  {
    id: "b1",
    judul: "Tim Robotik Sekolah Juara 1 Tingkat Provinsi",
    ringkasan:
      "Lima siswa kelas VII membawa pulang piala emas setelah merakit robot pemilah sampah dalam waktu 90 menit.",
    kategori: "Prestasi",
    tanggal: "2026-08-24",
  },
  {
    id: "b2",
    judul: "Pekan Literasi: 1.200 Buku Dibaca Dalam Sebulan",
    ringkasan:
      "Program Pojok Baca Ceria melampaui target. Siswa paling rajin mendapat bonus 500 Poin Siswa.",
    kategori: "Kegiatan",
    tanggal: "2026-08-18",
  },
  {
    id: "b3",
    judul: "Laboratorium Komputer Baru Resmi Dibuka",
    ringkasan:
      "Tersedia 30 unit komputer untuk mendukung Ruang Belajar digital dan Pusat Game edukatif.",
    kategori: "Fasilitas",
    tanggal: "2026-08-09",
  },
  {
    id: "b4",
    judul: "Sarasehan Orang Tua: Mendampingi Anak Belajar Digital",
    ringkasan:
      "Wali murid belajar cara memantau progres modul dan penggunaan Poin Siswa anak dari rumah.",
    kategori: "Kegiatan",
    tanggal: "2026-08-02",
  },
];

export const PENGUMUMAN: Pengumuman[] = [
  {
    id: "p1",
    judul: "Jadwal Penilaian Tengah Semester",
    isi: "PTS dilaksanakan 14-19 September 2026. Siswa wajib membawa kartu peserta dan alat tulis sendiri.",
    tanggal: "2026-08-28",
    penting: true,
  },
  {
    id: "p2",
    judul: "Pembagian Seragam Olahraga Baru",
    isi: "Seragam dibagikan per kelas mulai Senin di ruang tata usaha pada jam istirahat.",
    tanggal: "2026-08-25",
    penting: false,
  },
  {
    id: "p3",
    judul: "Penukaran Poin Siswa Periode Agustus",
    isi: "Toko Reward buka setiap Rabu dan Jumat. Stok kupon kantin terbatas, tukarkan lebih awal.",
    tanggal: "2026-08-20",
    penting: false,
  },
  {
    id: "p4",
    judul: "Pendaftaran Ekstrakurikuler Semester Ganjil",
    isi: "Pilih maksimal dua ekstrakurikuler melalui wali kelas sebelum 5 September 2026.",
    tanggal: "2026-08-15",
    penting: true,
  },
];

export const AGENDA: Agenda[] = [
  {
    id: "a1",
    tanggal: "2026-09-02",
    judul: "Upacara dan Penghargaan Siswa Berkoin Terbanyak",
    jenis: "Akademik",
  },
  { id: "a2", tanggal: "2026-09-07", judul: "Latihan Pramuka Gabungan", jenis: "Ekstrakurikuler" },
  { id: "a3", tanggal: "2026-09-14", judul: "Penilaian Tengah Semester Dimulai", jenis: "Akademik" },
  { id: "a4", tanggal: "2026-09-20", judul: "Lomba Cerdas Cermat Antar Kelas", jenis: "Lomba" },
  { id: "a5", tanggal: "2026-09-28", judul: "Libur Hari Keluarga Sekolah", jenis: "Libur" },
  { id: "a6", tanggal: "2026-10-05", judul: "Kunjungan Edukasi ke Museum Kota", jenis: "Akademik" },
];

export const MODUL: Modul[] = [
  {
    id: "m1",
    nama: "Petualangan Pecahan",
    mapel: "Matematika",
    kelas: "Kelas 5",
    ikon: "Calculator",
    koin: 120,
    rating: 4.9,
    peserta: 214,
    durasi: "25 menit",
  },
  {
    id: "m2",
    nama: "Rahasia Ekosistem Hutan",
    mapel: "IPA",
    kelas: "Kelas 4",
    ikon: "Leaf",
    koin: 100,
    rating: 4.8,
    peserta: 188,
    durasi: "20 menit",
  },
  {
    id: "m3",
    nama: "Menulis Cerita Seru",
    mapel: "Bahasa Indonesia",
    kelas: "Kelas 5",
    ikon: "PenLine",
    koin: 90,
    rating: 4.7,
    peserta: 301,
    durasi: "18 menit",
  },
  {
    id: "m4",
    nama: "Jelajah Pahlawan Nusantara",
    mapel: "IPS",
    kelas: "Kelas 6",
    ikon: "Landmark",
    koin: 110,
    rating: 4.9,
    peserta: 156,
    durasi: "22 menit",
  },
  {
    id: "m5",
    nama: "Fun English: My Family",
    mapel: "Bahasa Inggris",
    kelas: "Kelas 3",
    ikon: "Languages",
    koin: 80,
    rating: 4.6,
    peserta: 240,
    durasi: "15 menit",
  },
  {
    id: "m6",
    nama: "Perkalian Kilat",
    mapel: "Matematika",
    kelas: "Kelas 3",
    ikon: "Zap",
    koin: 70,
    rating: 4.8,
    peserta: 412,
    durasi: "12 menit",
  },
  {
    id: "m7",
    nama: "Seni Kolase Warna",
    mapel: "SBdP",
    kelas: "Kelas 2",
    ikon: "Palette",
    koin: 60,
    rating: 4.9,
    peserta: 133,
    durasi: "30 menit",
  },
  {
    id: "m8",
    nama: "Hidup Sehat dan Bugar",
    mapel: "PJOK",
    kelas: "Kelas 4",
    ikon: "Volleyball",
    koin: 75,
    rating: 4.7,
    peserta: 197,
    durasi: "16 menit",
  },
];

export const HADIAH: Hadiah[] = [
  { id: "h1", nama: "Pensil Warna 12 Batang", ikon: "Pencil", harga: 250, stok: 12, kategori: "Alat Tulis" },
  { id: "h2", nama: "Buku Tulis Bergaris (3 pcs)", ikon: "NotebookPen", harga: 180, stok: 25, kategori: "Alat Tulis" },
  { id: "h3", nama: "Kupon Susu Kotak Kantin", ikon: "Milk", harga: 120, stok: 40, kategori: "Kupon Kantin" },
  { id: "h4", nama: "Kupon Bakso Kuah Kantin", ikon: "Soup", harga: 300, stok: 15, kategori: "Kupon Kantin" },
  { id: "h5", nama: "Tempat Pensil Maskot Sekolah", ikon: "Backpack", harga: 420, stok: 8, kategori: "Merchandise" },
  { id: "h6", nama: "Penghapus dan Penggaris Set", ikon: "Ruler", harga: 140, stok: 30, kategori: "Alat Tulis" },
  { id: "h7", nama: "Topi Olahraga Sekolah", ikon: "Shirt", harga: 500, stok: 6, kategori: "Merchandise" },
  { id: "h8", nama: "Kupon Es Buah Hari Jumat", ikon: "IceCreamCone", harga: 160, stok: 22, kategori: "Kupon Kantin" },
];

export const KUIS = [
  { pertanyaan: "Hasil dari 1/2 + 1/4 adalah ...", pilihan: ["2/6", "3/4", "1/6", "2/4"], jawaban: 1 },
  {
    pertanyaan: "Ibu kota Provinsi Jawa Barat adalah ...",
    pilihan: ["Semarang", "Surabaya", "Bandung", "Serang"],
    jawaban: 2,
  },
  {
    pertanyaan: "Hewan yang bernapas dengan trakea adalah ...",
    pilihan: ["Ikan", "Belalang", "Kucing", "Katak"],
    jawaban: 1,
  },
  {
    pertanyaan: "Kata baku yang benar adalah ...",
    pilihan: ["Aktifitas", "Aktivitas", "Aktipitas", "Aktivias"],
    jawaban: 1,
  },
  {
    pertanyaan: "Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal ...",
    pilihan: ["17 Agustus 1945", "1 Juni 1945", "28 Oktober 1928", "10 November 1945"],
    jawaban: 0,
  },
];

export const HADIAH_RODA = [10, 25, 50, 5, 75, 15, 100, 30];

export function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type Siswa = {
  id: string;
  nama: string;
  kelas: string;
  nilai: { matematika: number; ipa: number; bahasa: number };
  koin: number;
};

export const SISWA_AWAL: Siswa[] = [
  { id: "s1", nama: "Alya Rahmawati", kelas: "VIII-B", nilai: { matematika: 92, ipa: 88, bahasa: 90 }, koin: 480 },
  { id: "s2", nama: "Bagas Pratama", kelas: "VIII-B", nilai: { matematika: 78, ipa: 84, bahasa: 80 }, koin: 320 },
  { id: "s3", nama: "Citra Maharani", kelas: "VIII-A", nilai: { matematika: 85, ipa: 91, bahasa: 95 }, koin: 410 },
  { id: "s4", nama: "Dimas Nugroho", kelas: "IX-C", nilai: { matematika: 70, ipa: 75, bahasa: 72 }, koin: 210 },
  { id: "s5", nama: "Erika Salsabila", kelas: "IX-A", nilai: { matematika: 96, ipa: 93, bahasa: 89 }, koin: 560 },
  { id: "s6", nama: "Fajar Ramadhan", kelas: "VII-B", nilai: { matematika: 81, ipa: 79, bahasa: 86 }, koin: 275 },
];

export const KEGIATAN_SEKOLAH = [
  "Upacara Bendera",
  "Pramuka",
  "Lomba Cerdas Cermat",
  "Kerja Bakti Sekolah",
  "Pekan Literasi",
  "Ekstrakurikuler Robotik",
  "Pertandingan Olahraga Antar Kelas",
];
