---
description: Frontend UI Standards, Modals, Forms & Mobile Responsiveness (resources/views/**, public/js/**)
globs: resources/views/**, public/js/**
---

# 30. Frontend UI, Form & Modal Standards

Dokumen ini mengatur keseragaman antarmuka sistem `adminShuttleV3` agar memiliki estetika, kerapian, dan interaksi yang selaras dengan sistem acuan `admin-sunjaya`.

---

## 1. Keselarasan Desain dengan `admin-sunjaya`
1. **Typography & Font**:
   * Tabel data utama menggunakan kelas `font-11 text-nowrap`.
   * Label deskriptif kecil menggunakan kelas `font-11 text-muted`.
2. **Kerapian Filter Bar**:
   * Filter form ditempatkan di dalam `<div class="card mb-3"><div class="card-body">`.
   * Form menggunakan kelas grid bootstrap `row align-items-end g-2`.
   * Tombol submit filter menggunakan kelas `btn btn-soft-primary w-100 p-2` dengan icon `<i class="las la-filter me-2"></i>FILTER`.

---

## 2. Penanganan Datepicker pada Modal Form (Anti-Clipping)
Ketika DateRangePicker atau Datepicker diletakkan di dalam Modal Dialog Bootstrap, sering terjadi bug kalender terpotong (*clipped*) atau berada di belakang modal.
* **Solusi Wajib**:
  Tambahkan opsi `parentEl` ke selector modal yang bersangkutan:
  ```javascript
  $("#modal-daterange").daterangepicker({
      parentEl: "#modal-container-id", // Wajib agar kalender me-render di dalam modal DOM
      opens: "center",
      autoUpdateInput: false,
      locale: {
          format: "DD-MM-YYYY",
          separator: " s.d "
      }
  });
  ```

---

## 3. Form Modal Select & Resilient AJAX Submission
1. **Select2 di dalam Modal**:
   * Gunakan `dropdownParent: $('#modalId')` agar dropdown Select2 tidak tertutup backdrop modal:
     ```javascript
     $('#select-outlet').select2({
         dropdownParent: $('#modalForm')
     });
     ```
2. **Handling Form Submission**:
   * Matikan tombol submit dan tampilkan spinner saat AJAX sedang berjalan guna mencegah *double submit*.
   * Validasi error 422 wajib di-mapping ke elemen form terkait dengan menambahkan kelas `.is-invalid` dan menampilkan teks error pada `.invalid-feedback`.

---

## 4. Responsivitas Perangkat Mobile & Tablet
1. **Pencegahan Overflow Layar**:
   * Kartu ringkasan finansial (KPI Cards) menggunakan breakpoint responsif:
     `<div class="col-lg-2 col-md-4 col-sm-6">`.
2. **Tap Target & Form Control**:
   * Input dan dropdown memiliki padding yang nyaman disentuh di layar sentuh (`p-2` atau min-height 38px).
3. **Penyelarasan Kolom Aksi**:
   * Kolom aksi (Edit/Hapus/Detail) menggunakan tombol ringkas berbasis ikon (*icon-only button*) dengan atribut `title` / tooltip agar tidak memakan ruang horizontal tabel.

---

## 5. Standar Bahasa Label UI: Bebas Jargon Teknis (Human-Friendly UI)
1. **DILARANG Menampilkan Detail Teknis Internal ke Antarmuka Pengguna**:
   * Label input, modal popup (SweetAlert), notifikasi toast, dan teks bantuan (*form-text*) **DILARANG** memuat spesifikasi teknis kode atau batasan database yang membingungkan pengguna akhir (user/admin).
   * Contoh detail teknis yang dilarang: panjang karakter internal `(16 Karakter)`, metode generator `(random string 16 karakter acak)`, istilah keamanan database `disanitasi dari karakter injeksi`, tipe data, atau regex.
2. **Gunakan Istilah Umum, Bersih & Profesional**:
   * ❌ *Salah (Teknis/Internal)*: `Password (16 Karakter):`
   * ✅ *Benar (Umum & Human-Friendly)*: `Password :` atau `Password Baru :`
   * ❌ *Salah*: `Sistem akan membuatkan kata sandi baru secara otomatis (random string 16 karakter acak) untuk akun...`
   * ✅ *Benar*: `Sistem akan membuatkan kata sandi baru secara otomatis untuk akun...`
   * ❌ *Salah*: `Nama OTA otomatis dikonversi ke huruf besar dan disanitasi dari karakter injeksi.`
   * ✅ *Benar*: `Format nama OTA otomatis disesuaikan ke huruf besar.`

---

## 6. Standar Header Halaman & Navigasi Breadcrumb
1. **Halaman Index / List Data**:
   * Wajib menggunakan Single Title tegas `<h4 class="page-title">DATA {{ strtoupper($title) }}</h4>` **tanpa breadcrumb**.
   * Dilarang keras menempatkan navigasi breadcrumb di halaman tabel index / daftar data.
2. **Halaman Form Tambah & Edit Data**:
   * Breadcrumb HANYA ADA pada form tambah atau edit, dengan link kembali bergaris bawah:
     `<a href="{{ route('[menu].index') }}"><u>DATA {{ strtoupper($title) }}</u></a>`
   * Menampilkan status mode aktif: `TAMBAH BARU` (mode tambah) atau `EDIT [NAMA DATA]` (mode perbarui).
   * Dilarang menambahkan tombol sekunder seperti "KEMBALI KE DAFTAR" di header samping karena navigasi kembali telah disediakan oleh link breadcrumb.

