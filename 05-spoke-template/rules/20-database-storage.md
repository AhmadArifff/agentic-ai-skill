# Rule 20: Database & Cloud Storage Integration Standards

> **Database & Storage Protocol**: Pedoman teknis untuk integrasi basis data (Supabase / PostgreSQL / MySQL) dan manajemen media storage pada proyek anak.

---

## 1. Modul Integrasi Supabase (Data Injection & Bucket Storage)

Jika proyek mengadopsi **Supabase** sebagai Backend/Database:

### A. Data Injection & Seeding Otomatis
1. **Idempotent Seed Scripts**: Setiap skrip injeksi data awal (seeding) wajib bersifat idempoten menggunakan `upsert` (`ON CONFLICT DO UPDATE`) berdasarkan primary key atau unique constraint agar tidak menghasilkan duplikasi baris saat dijalankan berulang.
2. **Kepatuhan Tipe & Relasi**: Injeksi data wajib mematuhi relasi foreign key berurutan: buat data induk (tabel users, kategori) sebelum memasukkan data turunan (tabel transaksi, orders).

### B. Otomasi Bucket Storage untuk Aset File
1. **Pemisahan Bucket Berdasarkan Privasi**:
   - `public-assets`: Untuk gambar katalog, thumbnail produk, dan logo publik yang dapat diakses langsung via CDN URL publik.
   - `private-documents`: Untuk bukti transfer bank, KTP, kontrak driver, atau dokumen sensitif yang wajib diakses melalui *Signed URL* bertempo (misal kedaluwarsa dalam 15-60 menit).
2. **Penyimpanan Path di Database**:
   - Kolom database hanya menyimpan path relatif di dalam bucket (contoh: `documents/2026/wth-proof-0012.jpg`), bukan absolute URL dengan query token kedaluwarsa.
   - URL akses di-generate secara dinamis di level Service/Controller saat data dipanggil.
3. **Ukuran & Validasi MIME-Type**:
   - Validasi file wajib dilakukan sebelum upload: batasi ukuran maksimal (misal < 5MB untuk gambar, < 10MB untuk PDF) dan verifikasi Magic Bytes / MIME-type di sisi server.

---

## 2. Modul Relational Database Lokal (MySQL / PostgreSQL / Laravel 4-Layer)

Jika proyek mengadopsi basis data relasional mandiri:
1. **Isolasi Kueri pada Repository**: Dilarang menuliskan raw SQL query atau pemanggilan langsung Eloquent/Prisma di dalam Controller atau UI components. Seluruh kueri wajib berada di dalam Repository interface.
2. **Transactional Safety**: Operasi mutasi multi-tabel (seperti penarikan dana, pembuatan pesanan, atau pembagian komisi) wajib dibungkus dalam transaksi database atomik dengan penanganan rollback otomatis.
3. **Pencegahan N+1 Query**: Wajib menggunakan Eager Loading (`with(['relation'])`) pada setiap kueri daftar data tabular.
