# Panduan Menghubungkan Domain (DNS di Cloudflare) ke Aplikasi Ini

Aplikasi ini tetap di-hosting oleh Lovable. Cloudflare hanya dipakai sebagai
pengelola DNS domain kamu. Jadi domain kamu akan menampilkan aplikasi ini,
dan setiap kali kamu menekan **Publish** di sini, domain ikut ter-update
otomatis (tanpa perlu upload atau deploy manual apa pun).

## Langkah 1 — Publish aplikasi

1. Klik tombol **Publish** di kanan atas.
2. Tunggu ±1 menit sampai alamat `*.lovable.app` bisa dibuka.

Domain tidak akan menampilkan apa pun sebelum aplikasi pernah di-publish.

## Langkah 2 — Tambahkan domain

1. Buka **Project Settings → Project → Domains** (atau **Publish → Add custom domain**).
2. Klik **Connect Domain**, masukkan domain, mis. `smpn26bdg.online`.
3. Ulangi sekali lagi untuk versi `www`, mis. `www.smpn26bdg.online`.
4. Karena DNS-nya di Cloudflare, buka bagian **Advanced** dan centang
   **"Domain uses Cloudflare or a similar proxy"**. Verifikasi akan memakai
   CNAME, yang cocok dengan DNS yang di-proxy Cloudflare.
5. Ikuti instruksi yang muncul; catat record yang diminta.

## Langkah 3 — Isi record di Cloudflare

Di dashboard Cloudflare → domain kamu → **DNS → Records**, tambahkan record
persis seperti yang ditampilkan di layar Lovable.

- Mode proxy (disarankan): record **CNAME** untuk root dan `www` sesuai nilai
  yang Lovable tampilkan.
- Tanpa proxy: record **A** untuk `@` dan `www` ke `185.158.133.1`.
- Plus satu record **TXT** bernama `_lovable` dengan nilai verifikasi dari Lovable.

Penting:
- Hapus record A/CNAME lama untuk `@` dan `www` yang mengarah ke tempat lain.
- Jangan pakai fitur "Redirect Rules"/"Page Rules" untuk root domain.
- Kalau ada record **CAA**, pastikan mengizinkan Let's Encrypt.
- Record email (MX, SPF, DKIM, DMARC) tetap dikelola di Cloudflare, tidak terpengaruh.

## Langkah 4 — Tunggu verifikasi & SSL

Status domain akan berjalan: **Verifying → Setting up → Active**.
Biasanya beberapa menit, maksimal 72 jam. Sertifikat HTTPS dipasang otomatis.

Kalau punya dua domain (root dan `www`), pilih satu sebagai **Primary**;
yang lain otomatis diarahkan ke Primary.

## Cara Update Otomatis Setelah Domain Aktif

Setelah domain **Active**, alurnya:

1. Minta perbaikan/perubahan di chat ini.
2. Klik **Publish** (atau **Update**) satu kali.
3. Domain langsung menyajikan versi terbaru — tidak ada langkah tambahan.

Catatan:
- Perubahan tampilan/halaman butuh klik **Publish** agar naik ke domain.
- Perubahan database, pengaturan, dan server (mis. tambah poin, hadiah, akun)
  berlaku langsung tanpa publish.
- Kalau versi lama masih terlihat: itu cache. Tekan Ctrl/Cmd+Shift+R, atau di
  Cloudflare pilih **Caching → Configuration → Purge Everything**.

## Jika Bermasalah

| Gejala | Penyebab umum | Tindakan |
| --- | --- | --- |
| Status **Verifying** lama | TXT `_lovable` belum benar / masih propagasi | Cek nilai TXT, tunggu, cek di dnschecker.org |
| Status **Failed** | Sertifikat gagal | Perbaiki DNS lalu klik **Retry** |
| Status **Offline** | DNS diubah dan tidak lagi cocok | Kembalikan record sesuai instruksi Lovable |
| Domain buka halaman lain | Ada record lama / redirect rule di Cloudflare | Hapus record & rule lama |
| Domain kosong | Aplikasi belum di-publish | Klik **Publish** |
| Selalu pindah ke domain lain | Ada Primary domain | Domains → ⋯ → **Unset as primary** |

## Support Rutin (checklist singkat)

- Sebelum publish: cek halaman utama, login siswa, dan Panel Guru masih normal.
- Setelah publish: buka domain di HP dan komputer sekali untuk memastikan tampil.
- Sebulan sekali: cek status domain masih **Active** dan aplikasi masih published.
