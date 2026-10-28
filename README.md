# KasKita — Kas Kelas Digital (starter Expo)

Ini adalah proyek awal React Native + Expo yang meniru tampilan hijau/putih dari prototipe KasKita.

## Fitur yang sudah ada di starter
- Dashboard saldo, total pemasukan, total pengeluaran (dihitung otomatis).
- Tambah dan hapus transaksi.
- Data transaksi disimpan lokal di perangkat menggunakan AsyncStorage.
- Daftar anggota untuk kas mingguan dan penanda sudah/belum bayar (status disimpan lokal).

## Belum tersedia
- Login dan peran bendahara/ketua kelas.
- Database online/sinkronisasi antarperangkat.
- Ekspor/impor CSV.
- Edit transaksi.

Jangan gunakan data keuangan nyata bersama sebelum autentikasi, database online, dan pencadangan dirancang serta diuji.

## Build APK dengan Expo EAS
1. Ekstrak ZIP ini.
2. Unggah isi folder proyek ke repository GitHub `kaskita-app` (bukan ZIP sebagai satu file).
3. Hubungkan repository ke alur build Expo/EAS atau jalankan EAS CLI dari lingkungan yang mendukung Node.js.
4. Build profile `preview` di `eas.json` menghasilkan APK internal.

Perintah build setelah proyek berada di lingkungan Node.js:
`npm install`
`npx eas-cli login`
`npx eas-cli build -p android --profile preview`

Pastikan package name `com.kaskita.kaskelas` belum dipakai oleh aplikasi lain yang kamu miliki.
