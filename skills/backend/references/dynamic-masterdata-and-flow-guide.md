# Dynamic Master Data & Unambiguous Flow Guide

Panduan komprehensif untuk mencegah **Data Misconception**, **Logic Flow Gaps**, dan **Hardcoded Master Data** pada pengembangan aplikasi Web & Mobile di seluruh modul/fitur.

---

## 1. Prinsip Utama: Zero Hardcoded Master Data

> 🚫 **DILARANG KERAS MENG-HARDCODE DATA MASTER DI CODEBASE!**

Di lingkungan produksi (*production*), data master seperti **Label, Kategori, Tingkat Prioritas (Priority), Status, Tipe, dan Tag** TIDAK BOLEH dituliskan secara langsung (*hardcoded*) di kode program (misalnya `const PRIORITIES = ['Low', 'Medium', 'High']`).

### Mengapa Hardcoded Tidak Profesional & Berbahaya?
- **Perubahan Butuh Redeploy**: Jika Admin ingin menambah prioritas baru (misal: 'Urgent' atau 'Critical'), developer harus merubah kode, membuat commit, dan melakukan re-deploy ke server.
- **Infleksibilitas**: Admin pengguna aplikasi tidak memiliki kontrol manajemen bisnis atas aplikasi mereka sendiri.
- **Risiko Bug**: Perubahan di frontend/backend secara terpisah bisa menyebabkan ketidakcocokan nilai enum.

### ✅ Solusi: Dynamic Master Data via Database & Admin UI
- **Database Layer**: Buat tabel khusus di database (misal: `Label`, `Priority`, `Category`, `Status`).
- **Backend API**: Sediakan API CRUD lengkap (`GET`, `POST`, `PUT`, `DELETE`) khusus Admin untuk mengelola data master ini.
- **Frontend Admin UI**: Sediakan antarmuka manajemen master data di Admin Panel sehingga Admin dapat menambah, mengedit warna, atau menghapus label/prioritas secara langsung saat aplikasi berjalan (*runtime*).

---

## 2. Pencegahan "Data Misconception" & Logic Flow Gaps

### 🔍 Kasus Masalah (Contoh Misconception)
> **Kasus Trello/Task Management**: User membuat Task baru melalui form input TANPA memilih Label/Kategori. Task tersebut muncul di tampilan "Semua Task". Namun saat user memfilter berdasarkan label tertentu (misal: "Bug"), task tadi tidak muncul. User kemudian mengira task-nya hilang atau sistem error.

### 🛡️ Aturan Desain Logic Flow yang Bebas Misconception

1. **Form Input Eksplisit**:
   - Selalu fasilitasi pemilihan Label/Kategori/Priority pada Form Input.
   - Jika opsional, tetapkan **Default Fallback Value** (misal: `Uncategorized` atau `General`) ATAU tampilkan opsi eksplisit `Tanpa Label (No Label)`.
2. **Sistem Filter & Search yang Transparan**:
   - Filter harus menyediakan opsi khusus untuk menyaring item tanpa kategori, misalnya: `All Labels`, `No Label / Unassigned`, dan `Label Spesifik`.
   - Jangan pernah membiarkan data terisolasi tanpa cara untuk memfilter atau menemukannya kembali.
3. **Indikator Visual yang Jelas**:
   - Tampilkan badge/indicator visual pada item UI yang menunjukkan status kategorinya (misal: badge `Unassigned` dengan warna netral).
4. **Validasi & Warning Matrix**:
   - Berikan petunjuk pada form jika ada field yang akan mempengaruhi pencarian/filtering di masa mendatang.

---

## 3. Penerapan Berdasarkan Role Skill

### 📋 Role PM (`/pm`)
- **PRD Specification**: Dalam setiap PRD, WAJIB memasukkan skema Master Data Management (CRUD Label/Priority/Status) dan menjelaskan default fallback serta logika filtering.
- **User Story & Flow Matrix**: Tuliskan User Story eksplisit untuk pengisian data master dan skenario edge cases (misal: *"Sebagai user, saat saya memfilter task tanpa label..."*).

### ⚙️ Role Backend (`/backend`)
- **Dynamic Database Schema**: Buat tabel relasional untuk master data (`Priority`, `Label`, `Category`) dengan foreign key constraint yang tepat (`ON DELETE SET NULL` atau `ON DELETE RESTRICT`).
- **Admin CRUD API**: Sediakan endpoint `/api/v1/admin/master/*` untuk pengelolaan master data di runtime.
- **Query Filtering Logic**: Pastikan query SQL/Prisma menangani pencarian `NULL`/unassigned (misal: `WHERE label_id IS NULL`).

### 🎨 Role Frontend (`/frontend`)
- **Dynamic Form Controls**: Fetch data master dari API backend untuk mengisi dropdown/select/chip pilihan Label, Priority, atau Category di form input.
- **Admin Master Data Manager**: Buat modul UI Admin untuk tambah/edit/hapus Label, Warna, dan Priority secara visual.
- **Filter UI Options**: Buat komponen Filter yang menyediakan opsi `All`, `Unassigned / No Label`, dan opsi dinamis dari API.

### 🧪 Role QA (`/qa`)
- **Zero Hardcode Audit**: Memverifikasi bahwa tidak ada data master yang di-hardcode di file JS/TS/PHP/HTML.
- **Dynamic CRUD Test**: Menguji penambahan Label/Priority baru dari Admin UI dan memastikan label baru tersebut langsung muncul di form input dan filter dropdown tanpa restart/redeploy.
- **Misconception Testing**: Menguji pembuatan data tanpa label/priority, kemudian memverifikasi perilakunya di filter `All`, filter `No Label`, dan filter `Label Spesifik`.
