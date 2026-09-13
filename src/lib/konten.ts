export type Modul = {
  id: string;
  judul: string;
  emoji: string;
  warna: string;
  ringkas: string;
  halaman: { gambar: string; teks: string }[];
  bintang: number;
};

export const MODUL: Modul[] = [
  {
    id: "berhitung",
    judul: "Petualangan Berhitung",
    emoji: "🔢",
    warna: "bg-sunny text-sunny-foreground",
    ringkas: "Belajar menjumlah dengan buah-buahan.",
    bintang: 5,
    halaman: [
      { gambar: "🍎🍎", teks: "Dua apel merah. Kalau ditambah satu apel lagi jadi berapa?" },
      { gambar: "🍎🍎🍎", teks: "Betul! 2 + 1 = 3 apel. Hore!" },
      { gambar: "🍌🍌🍌🍌", teks: "Empat pisang. Kalau dimakan satu, sisanya 3 pisang." },
    ],
  },
  {
    id: "huruf",
    judul: "Kereta Huruf",
    emoji: "🔤",
    warna: "bg-bubble text-bubble-foreground",
    ringkas: "Mengenal huruf dan suku kata.",
    bintang: 5,
    halaman: [
      { gambar: "🚂 A-B-C", teks: "Kereta huruf berangkat! A, B, C adalah tiga huruf pertama." },
      { gambar: "🐱 KU-CING", teks: "KU + CING = KUCING. Ayo baca pelan-pelan." },
      { gambar: "🌙 BU-LAN", teks: "BU + LAN = BULAN. Kamu hebat!" },
    ],
  },
  {
    id: "hewan",
    judul: "Dunia Hewan",
    emoji: "🦁",
    warna: "bg-mint text-mint-foreground",
    ringkas: "Mengenal hewan dan tempat tinggalnya.",
    bintang: 5,
    halaman: [
      { gambar: "🐘", teks: "Gajah tinggal di hutan dan punya belalai panjang." },
      { gambar: "🐠", teks: "Ikan hidup di air dan bernapas dengan insang." },
      { gambar: "🦜", teks: "Burung punya sayap untuk terbang tinggi." },
    ],
  },
  {
    id: "warna",
    judul: "Pelangi Warna",
    emoji: "🌈",
    warna: "bg-sky text-sky-foreground",
    ringkas: "Mengenal warna dan campurannya.",
    bintang: 5,
    halaman: [
      { gambar: "🔴 + 🟡", teks: "Merah dicampur kuning menjadi oranye 🟠." },
      { gambar: "🔵 + 🟡", teks: "Biru dicampur kuning menjadi hijau 🟢." },
      { gambar: "🌈", teks: "Pelangi punya banyak warna indah!" },
    ],
  },
];

export type Kuis = {
  id: string;
  judul: string;
  emoji: string;
  soal: { pertanyaan: string; pilihan: string[]; jawaban: number }[];
};

export const KUIS: Kuis[] = [
  {
    id: "kuis-berhitung",
    judul: "Kuis Berhitung",
    emoji: "➕",
    soal: [
      { pertanyaan: "2 + 3 = ?", pilihan: ["4", "5", "6"], jawaban: 1 },
      { pertanyaan: "Ada 5 balon, pecah 2. Sisa?", pilihan: ["3", "2", "7"], jawaban: 0 },
      { pertanyaan: "Angka setelah 8 adalah?", pilihan: ["7", "10", "9"], jawaban: 2 },
    ],
  },
  {
    id: "kuis-hewan",
    judul: "Kuis Hewan",
    emoji: "🐾",
    soal: [
      { pertanyaan: "Hewan yang hidup di air?", pilihan: ["Ikan", "Gajah", "Ayam"], jawaban: 0 },
      { pertanyaan: "Hewan yang bisa terbang?", pilihan: ["Kucing", "Burung", "Sapi"], jawaban: 1 },
      { pertanyaan: "Suara kucing adalah?", pilihan: ["Guk guk", "Moo", "Meong"], jawaban: 2 },
    ],
  },
  {
    id: "kuis-huruf",
    judul: "Kuis Huruf",
    emoji: "✏️",
    soal: [
      { pertanyaan: "Huruf pertama kata BUKU?", pilihan: ["B", "K", "U"], jawaban: 0 },
      { pertanyaan: "BU + NGA = ?", pilihan: ["BUNGA", "BANGA", "BUNGO"], jawaban: 0 },
      { pertanyaan: "Berapa huruf vokal: A I U E O?", pilihan: ["3", "5", "7"], jawaban: 1 },
    ],
  },
];

export const MOODS = [
  { emoji: "😄", label: "Senang" },
  { emoji: "🙂", label: "Biasa" },
  { emoji: "😴", label: "Ngantuk" },
  { emoji: "😕", label: "Bingung" },
  { emoji: "😢", label: "Sedih" },
  { emoji: "😡", label: "Marah" },
];
