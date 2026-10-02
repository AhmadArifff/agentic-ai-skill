---
description: Security, RBAC Authorization & Credential Governance
globs: app/Http/Controllers/**, app/Services/**, app/Repositories/**
---

# 40. Security & RBAC Governance

Dokumen ini mengatur standar keamanan aplikasi, otorisasi berbasis peran (Role-Based Access Control / RBAC), sanitasi input, dan tata kelola kredensial rahasia.

---

## 1. Otorisasi RBAC Tanpa Celah (Zero-Bypass RBAC)
1. **Pemeriksaan Izin di Setiap Method Controller**:
   * Setiap controller yang mewakili menu wajib mengecek izin sebelum memproses request:
     ```php
     // Menampilkan halaman / data
     $this->permission('read');

     // Menambah data baru
     $this->permission('create');

     // Mengubah data
     $this->permission('update');

     // Menghapus data
     $this->permission('delete');
     ```
2. **Korelasi Menu URL**:
   * Properti `$this->parent_url` di constructor controller harus sama persis dengan kolom `link` di tabel `menus` (misal: `'settlement-packages/index'`).

---

## 2. Tata Kelola Kredensial & Integrasi Pihak Ketiga (OTA System)
1. **Generasi Kredensial Acak**:
   * **DILARANG** melakukan hardcode kredensial, username default (seperti `admin123`), atau password plain text.
   * Akun integrasi agen/OTA wajib menggunakan username acak terstandar dan password yang digenerate acak menggunakan fungsi kriptografi (`Str::random()`, `bcrypt()`).
2. **Penanganan Kasus Softdelete & Restore**:
   * Jika data akun OTA yang berstatus softdelete didaftarkan kembali, sistem harus me-restore akun tersebut dan **men-generate ulang username serta password** yang baru secara otomatis.

---

## 3. Sanitasi Input & Pencegahan Injeksi (OWASP Top 10)
1. **SQL Injection**:
   * Selalu gunakan parameter binding PDO (`?` atau `:named`) saat menggunakan raw query:
     ```php
     // ✅ BENAR:
     $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_method_data, '$.code')) = ?", [$code]);

     // ❌ SALAH (Rentan SQL Injection):
     $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_method_data, '$.code')) = '$code'");
     ```
2. **Cross-Site Scripting (XSS)**:
   * Data output pada Blade wajib menggunakan kurung kurawal ganda `{{ $var }}` yang otomatis di-escape oleh engine Blade.
   * Hindari `{!! $var !!}` kecuali untuk konten HTML yang telah diverifikasi aman.
3. **Form Request Validation**:
   * Seluruh mutasi data (`POST`, `PUT`, `PATCH`) wajib melewati `FormRequest` khusus dengan aturan validasi ketat sebelum masuk ke Controller.
