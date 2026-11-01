# Duitku — Daily Money Tracker

Aplikasi catatan posisi keuangan harian, bukan pencatat transaksi satu per satu.

## Yang diisi setiap hari
- Uang di bank
- Uang tunai di dompet
- Piutang (uang yang orang lain pinjam dari kamu)
- Utang (uang yang harus kamu bayar)

Rumus kekayaan bersih: bank + dompet + piutang - utang.
Satu catatan per tanggal. Menyimpan ulang pada tanggal yang sama akan memperbarui catatan hari itu. Perubahan dibandingkan dengan catatan tanggal sebelumnya.

## Build APK melalui GitHub dari HP
1. Ekstrak ZIP.
2. Buat repository GitHub baru, misalnya `duitku`.
3. Upload seluruh isi folder, termasuk `.github/workflows/build-apk.yml`.
4. Buka Actions dan jalankan workflow **Build Duitku APK** (atau tunggu build otomatis setelah push).
5. Buka workflow run yang berhasil, unduh artifact `Duitku-debug-apk`.
6. Ekstrak ZIP artifact dan instal `app-debug.apk`.

## Data dan privasi
- Data disimpan lokal pada perangkat; tidak memakai akun, server, atau Railway.
- Jika aplikasi dihapus atau data aplikasi dibersihkan, data dapat hilang.
- Gunakan tombol Ekspor backup secara berkala. Simpan file JSON di tempat aman.
- Backup belum dienkripsi; jangan bagikan file backup karena berisi informasi keuangan.

## Catatan
APK debug untuk instalasi pribadi, bukan rilis Play Store.


## Fitur tambahan
- Input nominal otomatis memakai titik pemisah ribuan (contoh 100000 menjadi 100.000).
- Tombol + dan − mengubah nilai Rp1.000 setiap sentuhan.
- Watermark pembuat aplikasi tampil di bagian bawah.
- Pemutar musik memakai file `www/music.mp3`. Untuk mengaktifkan musik, unggah file MP3 milikmu dengan nama persis `music.mp3` ke folder `www` (sejajar dengan `index.html`), lalu build APK kembali. File musik belum disertakan karena menunggu file dari pengguna.

### Musik aplikasi
File musik bawaan pengguna berada di `www/music.mp3`. Tombol **Play** memutar lagu dan tombol **Off** menghentikannya. Untuk mengganti lagu, ganti file tersebut dengan MP3 lain dan beri nama `music.mp3`.


### Musik otomatis
Lagu `www/music.mp3` diputar otomatis dan loop saat aplikasi dibuka. Tombol Off menghentikan musik; saat aplikasi dibuka kembali, pemutaran otomatis dicoba lagi. Build Android mengizinkan autoplay pada WebView. Jika perangkat membatasi autoplay, tekan Play sekali.
