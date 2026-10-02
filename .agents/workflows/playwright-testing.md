# SOP: Pengujian Otomasi Browser Playwright (On-Demand User Request Only)

Dokumen ini memuat standar operasional pelaksanaan pengujian browser menggunakan **Playwright** pada sistem **adminShuttleV3**.

---

## 🚨 1. Syarat Mutlak Pengaktifan (*Activation Gate*)
* **HANYA DIGUNAKAN ATAS PERMINTAAN EKSPLISIT PENGGUNA**:
  - Playwright **TIDAK BOLEH** dijalankan secara otomatis atau inisiatif mandiri oleh AI.
  - AI hanya boleh mengaktifkan tool Playwright jika pengguna secara spesifik meminta (contoh: *"tolong tes pakai playwright"*, *"coba cek tampilan halaman ini dengan playwright"*, *"verifikasi alur form dengan playwright"*).

---

## 🔐 2. Kredensial Otentikasi Resmi
Saat pengujian Playwright diminta, gunakan akun otentikasi Superadmin berikut:
* **URL Login**: `http://localhost:8000/login` (atau port dev server aktif)
* **Username**: `superahmad`
* **Password**: `password123`

---

## 📋 3. Alur Kerja Pengujian Playwright

```
┌────────────────────────────────────────────────────────┐
│ 1. Pengguna Meminta Pengujian Browser via Chat         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 2. Cek Server Lokal (Pastikan php artisan serve aktif) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 3. Akses Halaman Login & Isi Kredensial               │
│    Username: superahmad | Password: password123        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 4. Verifikasi Navigasi Dashboard & Buka Halaman Target │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 5. Inspeksi Visual, Form, DataTables, & Console Error │
│    - Cek apakah tabel/data ter-render sempurna         │
│    - Cek anti-clipping pada datepicker / modal         │
│    - Pantau adanya error 404/500 di console/network    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 6. Tutup Sesi Browser & Laporkan Hasil ke Pengguna     │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ 4. Checklist Verifikasi Saat Sesi Playwright
1. **Console Error**: Pastikan tidak ada `Uncaught TypeError`, file `.js` gagal load, atau response API `500 Internal Server Error`.
2. **DataTables AJAX**: Pastikan data terisi, pagination dan search berfungsi, serta kalkulasi total pada `tfoot` terhitung.
3. **Form & Modal**: Pastikan modal terbuka sempurna, tidak ada dropdown/datepicker yang terpotong tepi layar (*clipping*).
4. **Keamanan Mutasi**: Dilarang mengeksekusi penghapusan data permanen (*hard delete*) pada data operasional riil selama pengujian.
