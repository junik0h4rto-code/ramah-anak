export type SoalPetualangan = {
  mapel: string;
  tingkat: 1 | 2 | 3;
  pertanyaan: string;
  pilihan: string[];
  jawaban: number;
};

/** Bank soal mock lintas mata pelajaran SMP. Diacak setiap mulai level. */
export const BANK_SOAL: SoalPetualangan[] = [
  // Matematika
  { mapel: "Matematika", tingkat: 1, pertanyaan: "Hasil dari 12 x 8 adalah ...", pilihan: ["86", "96", "104", "108"], jawaban: 1 },
  { mapel: "Matematika", tingkat: 1, pertanyaan: "Keliling persegi dengan sisi 9 cm adalah ...", pilihan: ["18 cm", "27 cm", "36 cm", "81 cm"], jawaban: 2 },
  { mapel: "Matematika", tingkat: 2, pertanyaan: "Nilai x pada 3x - 7 = 20 adalah ...", pilihan: ["7", "8", "9", "10"], jawaban: 2 },
  { mapel: "Matematika", tingkat: 2, pertanyaan: "Rata-rata dari 4, 8, 10, 14 adalah ...", pilihan: ["8", "9", "10", "12"], jawaban: 1 },
  { mapel: "Matematika", tingkat: 3, pertanyaan: "Volume kubus dengan rusuk 6 cm adalah ...", pilihan: ["36 cm³", "108 cm³", "216 cm³", "256 cm³"], jawaban: 2 },
  { mapel: "Matematika", tingkat: 3, pertanyaan: "Jika sisi miring 13 cm dan satu sisi 5 cm, sisi lainnya ...", pilihan: ["8 cm", "10 cm", "11 cm", "12 cm"], jawaban: 3 },

  // IPA
  { mapel: "IPA", tingkat: 1, pertanyaan: "Alat pernapasan utama manusia adalah ...", pilihan: ["Jantung", "Paru-paru", "Lambung", "Hati"], jawaban: 1 },
  { mapel: "IPA", tingkat: 1, pertanyaan: "Perubahan wujud dari cair ke gas disebut ...", pilihan: ["Membeku", "Menguap", "Mengembun", "Menyublim"], jawaban: 1 },
  { mapel: "IPA", tingkat: 2, pertanyaan: "Satuan gaya dalam SI adalah ...", pilihan: ["Joule", "Watt", "Newton", "Pascal"], jawaban: 2 },
  { mapel: "IPA", tingkat: 2, pertanyaan: "Proses tumbuhan membuat makanan disebut ...", pilihan: ["Respirasi", "Fotosintesis", "Transpirasi", "Fermentasi"], jawaban: 1 },
  { mapel: "IPA", tingkat: 3, pertanyaan: "Bagian sel yang mengatur seluruh kegiatan sel adalah ...", pilihan: ["Ribosom", "Mitokondria", "Nukleus", "Vakuola"], jawaban: 2 },
  { mapel: "IPA", tingkat: 3, pertanyaan: "Energi 200 J dalam 5 detik menghasilkan daya ...", pilihan: ["20 W", "40 W", "100 W", "1000 W"], jawaban: 1 },

  // IPS
  { mapel: "IPS", tingkat: 1, pertanyaan: "Ibu kota Provinsi Jawa Barat adalah ...", pilihan: ["Bandung", "Bogor", "Cirebon", "Bekasi"], jawaban: 0 },
  { mapel: "IPS", tingkat: 2, pertanyaan: "Proklamasi Kemerdekaan Indonesia dibacakan pada tahun ...", pilihan: ["1942", "1945", "1949", "1950"], jawaban: 1 },
  { mapel: "IPS", tingkat: 2, pertanyaan: "Gunung tertinggi di Pulau Jawa adalah ...", pilihan: ["Merapi", "Semeru", "Slamet", "Bromo"], jawaban: 1 },
  { mapel: "IPS", tingkat: 3, pertanyaan: "Kegiatan menyalurkan barang dari produsen ke konsumen disebut ...", pilihan: ["Produksi", "Konsumsi", "Distribusi", "Investasi"], jawaban: 2 },

  // Bahasa Indonesia
  { mapel: "Bahasa Indonesia", tingkat: 1, pertanyaan: "Gagasan utama sebuah paragraf disebut ...", pilihan: ["Ide pokok", "Kalimat tanya", "Konjungsi", "Sinonim"], jawaban: 0 },
  { mapel: "Bahasa Indonesia", tingkat: 2, pertanyaan: "Sinonim kata 'rajin' adalah ...", pilihan: ["Malas", "Tekun", "Lalai", "Lambat"], jawaban: 1 },
  { mapel: "Bahasa Indonesia", tingkat: 3, pertanyaan: "Teks yang berisi langkah-langkah membuat sesuatu disebut teks ...", pilihan: ["Deskripsi", "Prosedur", "Berita", "Puisi"], jawaban: 1 },

  // Bahasa Inggris
  { mapel: "Bahasa Inggris", tingkat: 1, pertanyaan: "Arti kata 'treasure' adalah ...", pilihan: ["Peta", "Harta", "Kunci", "Monster"], jawaban: 1 },
  { mapel: "Bahasa Inggris", tingkat: 2, pertanyaan: "She ___ to school every morning.", pilihan: ["go", "goes", "going", "gone"], jawaban: 1 },
  { mapel: "Bahasa Inggris", tingkat: 3, pertanyaan: "Past tense of 'fight' is ...", pilihan: ["fighted", "fought", "fighten", "fighting"], jawaban: 1 },

  // Informatika
  { mapel: "Informatika", tingkat: 1, pertanyaan: "Perangkat untuk memasukkan data ke komputer disebut ...", pilihan: ["Output", "Input", "Proses", "Memori"], jawaban: 1 },
  { mapel: "Informatika", tingkat: 2, pertanyaan: "1 kilobyte setara dengan ...", pilihan: ["8 bit", "1024 byte", "100 byte", "1024 bit"], jawaban: 1 },
  { mapel: "Informatika", tingkat: 3, pertanyaan: "Urutan langkah penyelesaian masalah secara logis disebut ...", pilihan: ["Algoritma", "Hardware", "Browser", "Jaringan"], jawaban: 0 },

  // Bahasa Sunda
  { mapel: "Bahasa Sunda", tingkat: 1, pertanyaan: "Basa Sunda ti kecap 'makan' nyaéta ...", pilihan: ["Dahar", "Ulin", "Calik", "Sare"], jawaban: 0 },
  { mapel: "Bahasa Sunda", tingkat: 2, pertanyaan: "Kecap 'hatur nuhun' hartina ...", pilihan: ["Permisi", "Terima kasih", "Selamat pagi", "Maaf"], jawaban: 1 },
  { mapel: "Bahasa Sunda", tingkat: 3, pertanyaan: "Carita rakyat Sunda ngeunaan Sangkuriang aya patalina jeung ...", pilihan: ["Gunung Tangkuban Parahu", "Situ Patenggang", "Curug Cimahi", "Kawah Putih"], jawaban: 0 },

  // Pendidikan Pancasila
  { mapel: "Pend. Pancasila", tingkat: 1, pertanyaan: "Lambang negara Indonesia adalah ...", pilihan: ["Garuda Pancasila", "Bendera Merah Putih", "Monas", "Bhinneka"], jawaban: 0 },
  { mapel: "Pend. Pancasila", tingkat: 2, pertanyaan: "Sila ketiga Pancasila berbunyi ...", pilihan: ["Kemanusiaan yang adil dan beradab", "Persatuan Indonesia", "Ketuhanan Yang Maha Esa", "Keadilan sosial"], jawaban: 1 },
  { mapel: "Pend. Pancasila", tingkat: 3, pertanyaan: "Musyawarah untuk mencapai kesepakatan bersama disebut ...", pilihan: ["Voting", "Mufakat", "Debat", "Kompetisi"], jawaban: 1 },

  // PJOK
  { mapel: "PJOK", tingkat: 1, pertanyaan: "Jumlah pemain inti dalam satu tim sepak bola adalah ...", pilihan: ["9", "10", "11", "12"], jawaban: 2 },
  { mapel: "PJOK", tingkat: 2, pertanyaan: "Gerakan pemanasan sebelum olahraga bertujuan untuk ...", pilihan: ["Menambah lapar", "Mencegah cedera", "Menurunkan berat", "Menambah tinggi"], jawaban: 1 },
  { mapel: "PJOK", tingkat: 3, pertanyaan: "Induk organisasi bola basket dunia adalah ...", pilihan: ["FIFA", "FIBA", "PBSI", "IAAF"], jawaban: 1 },

  // Seni Budaya
  { mapel: "SBK", tingkat: 1, pertanyaan: "Warna primer terdiri dari merah, kuning, dan ...", pilihan: ["Hijau", "Biru", "Ungu", "Oranye"], jawaban: 1 },
  { mapel: "SBK", tingkat: 2, pertanyaan: "Alat musik angklung berasal dari daerah ...", pilihan: ["Jawa Barat", "Bali", "Papua", "Aceh"], jawaban: 0 },
  { mapel: "SBK", tingkat: 3, pertanyaan: "Tanda untuk menyatakan cepat lambatnya lagu disebut ...", pilihan: ["Tempo", "Birama", "Nada", "Dinamika"], jawaban: 0 },

  // PAI
  { mapel: "PAI", tingkat: 1, pertanyaan: "Jumlah rakaat salat Subuh adalah ...", pilihan: ["2", "3", "4", "5"], jawaban: 0 },
  { mapel: "PAI", tingkat: 2, pertanyaan: "Kitab suci umat Islam adalah ...", pilihan: ["Taurat", "Injil", "Al-Qur'an", "Zabur"], jawaban: 2 },
  { mapel: "PAI", tingkat: 3, pertanyaan: "Perilaku jujur dalam Islam disebut ...", pilihan: ["Amanah", "Sidik", "Tabligh", "Fatanah"], jawaban: 1 },
];

export type Rintangan = {
  jenis: "monster" | "jebakan" | "pintu" | "bos";
  nama: string;
  emoji: string;
  hp: number;
  damage: number;
};

export type Level = {
  nomor: number;
  judul: string;
  latar: string;
  detikJawab: number;
  hadiahKoin: number;
  rintangan: Rintangan[];
};

const NAMA_MONSTER = [
  { nama: "Goblin Rimba", emoji: "👹" },
  { nama: "Kelelawar Gua", emoji: "🦇" },
  { nama: "Golem Batu", emoji: "🗿" },
  { nama: "Ular Pasir", emoji: "🐍" },
];

const NAMA_BOS = [
  { nama: "Naga Penjaga Peti", emoji: "🐲" },
  { nama: "Raja Kalajengking", emoji: "🦂" },
  { nama: "Bayangan Labirin", emoji: "👾" },
];

const LATAR = [
  "Hutan Teka-Teki",
  "Gua Bergema",
  "Kuil Pasir",
  "Reruntuhan Bawah Laut",
  "Menara Bintang",
];

/** Level dibangun dinamis: makin tinggi, HP & damage monster naik, soal makin sulit. */
export function buatLevel(nomor: number): Level {
  const monster: Rintangan[] = [
    {
      jenis: "monster",
      ...NAMA_MONSTER[nomor % NAMA_MONSTER.length]!,
      hp: 40 + nomor * 20,
      damage: 8 + nomor * 2,
    },
    {
      jenis: nomor % 2 === 0 ? "pintu" : "jebakan",
      nama: nomor % 2 === 0 ? "Pintu Batu Terkunci" : "Jebakan Panah Kuno",
      emoji: nomor % 2 === 0 ? "🚪" : "🏹",
      hp: 30 + nomor * 15,
      damage: 10 + nomor * 2,
    },
    {
      jenis: "bos",
      ...NAMA_BOS[nomor % NAMA_BOS.length]!,
      hp: 90 + nomor * 45,
      damage: 12 + nomor * 3,
    },
  ];

  return {
    nomor,
    judul: `Level ${nomor} — Jejak Peti Harta`,
    latar: LATAR[(nomor - 1) % LATAR.length]!,
    detikJawab: Math.max(12, 24 - nomor),
    hadiahKoin: Math.min(100, 20 + nomor * 5),
    rintangan: monster,
  };
}

export function tingkatUntukLevel(nomor: number): 1 | 2 | 3 {
  if (nomor <= 2) return 1;
  if (nomor <= 5) return 2;
  return 3;
}

function acak<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Ambil soal acak sesuai tingkat kesulitan level (tidak pernah sama urutannya). */
export function soalUntukLevel(nomor: number, jumlah: number): SoalPetualangan[] {
  const tingkat = tingkatUntukLevel(nomor);
  const utama = BANK_SOAL.filter((s) => s.tingkat === tingkat);
  const cadangan = BANK_SOAL.filter((s) => s.tingkat !== tingkat);
  const kumpulan = [...acak(utama), ...acak(cadangan)];
  const hasil: SoalPetualangan[] = [];
  for (let i = 0; i < jumlah; i++) {
    const soal = kumpulan[i % kumpulan.length]!;
    hasil.push({ ...soal });
  }
  return hasil;
}

export function kodeRoomBaru() {
  const huruf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => huruf[Math.floor(Math.random() * huruf.length)]).join("");
}
