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
