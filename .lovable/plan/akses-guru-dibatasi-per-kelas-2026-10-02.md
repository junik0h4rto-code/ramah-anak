# Akses guru dibatasi per kelas

## Tujuan
- **Wali kelas**: hanya melihat siswa di kelas perwaliannya + kelas yang diampu.
- **Guru mapel**: hanya melihat siswa di kelas yang diampu.
- **Admin**: tetap melihat semua siswa; satu-satunya yang bisa menempatkan siswa ke kelas dan mengatur kelas ampu guru.

## Yang berubah untuk pengguna

**Akun Terdaftar (admin) — form edit akun guru**
- Pilihan "Wali kelas dari" (satu kelas, opsional) diambil dari daftar Kelas & Rombel.
- Pilihan "Kelas yang diampu" (centang banyak kelas).
- Label di daftar akun guru: "Wali 7A · Mengajar 7A, 7B, 8C".
- Template Excel tambah akun massal mendapat kolom opsional `Wali Kelas` dan `Kelas Diampu` (dipisah koma).

**Kelas & Rombel**
- Memindahkan siswa antar kelas dan menambah/menghapus kelas hanya muncul untuk admin. Guru hanya melihat kelasnya sendiri (tanpa tombol ubah).
- Kolom "Wali Kelas" otomatis mengikuti guru yang dipilih di Akun Terdaftar.

**Panel Guru (akun guru)** — data siswa disaring ke kelas yang boleh dilihat:
- Dasbor Statistik & Progres Kelas
- Refleksi Siswa
- Perilaku Terpuji (daftar siswa & riwayat)
- Bonus Kegiatan (pilihan siswa penerima)
- Validasi Hadiah Toko
- Jika guru belum diberi kelas, tampil pesan "Belum ada kelas yang ditugaskan. Hubungi admin."

## Detail teknis
- Tabel baru `guru_kelas` (guru_id, kelas_nama, sebagai: 'wali' | 'pengampu'), unik per (guru_id, kelas_nama, sebagai), maksimal satu 'wali' per kelas. GRANT + RLS: guru baca baris miliknya, admin kelola semua.
- Fungsi security definer `kelas_akses_guru(uid)` mengembalikan daftar nama kelas; `boleh_lihat_siswa(uid, siswa_id)` dipakai di RLS.
- Ganti policy SELECT guru pada `profiles` (siswa), `perilaku_siswa`, `refleksi_modul`, `modul_selesai`, `penukaran_hadiah`, `pohon_siswa`, `nilai_siswa`, `koin_bonus` agar guru (non-admin) hanya melihat siswa di kelas aksesnya. Admin tidak dibatasi.
- Server function (`progresKelas`, `daftarSiswa`, `statistikPanel`, `antreanPenukaran`, `listRefleksiSiswa`, perilaku) ikut menyaring kelas; penulisan (catat perilaku, bonus) menolak siswa di luar kelas akses.
- `setKelasSiswa`, `createKelas/updateKelas/deleteKelas` diubah ke khusus admin.
- `updateAkun` / `tambahAkun` menyimpan penugasan `guru_kelas` dan menyinkronkan `kelas_rombel.wali_kelas`.
