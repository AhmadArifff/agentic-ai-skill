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

---

## 7. Standar Komponen Input Group (Seamless Pill & Anti-Clipping Datetime)
1. **Seamless Pill Input Group (Prefix/Suffix Rp, Kg, Koli, Hari)**:
   * Saat elemen input group digabungkan dengan field ber-border radius pil (50rem), terapkan selektor CSS terisolasi pada `@push('custom-style')` view terkait:
     ```css
     .input-group > :first-child,
     .input-group > .input-group-text:first-child,
     .input-group > .form-control:first-child {
         border-top-left-radius: 50rem !important;
         border-bottom-left-radius: 50rem !important;
     }
     .input-group > :last-child,
     .input-group > .input-group-text:last-child,
     .input-group > .form-control:last-child {
         border-top-right-radius: 50rem !important;
         border-bottom-right-radius: 50rem !important;
     }
     .input-group > :not(:first-child):not(:last-child) {
         border-radius: 0 !important;
     }
     ```
2. **Pencegahan Teks Waktu Terpotong pada Komponen `<x-input-group-text type="datetime">`**:
   * Kolom input waktu (`HH:mm`) wajib memiliki ruang minimal `min-width: 90px` atau lebar proporsional `45%` di dalam wrapper input-group agar angka menit tidak terpotong (*clipped*).

---

## 8. Standar Edukasi Antarmuka via Icon Info `(i)` & Tooltip Bootstrap
1. **In-App Guidance untuk Fitur Bisnis Kompleks**:
   * Jika ada opsi atau konfigurasi yang berpotensi membingungkan staf (seperti promo tertutup B2B, batas retur, atau batas berat), sertakan icon informasi di samping label form:
     `<i class="las la-info-circle text-primary font-14" data-bs-toggle="tooltip" data-toggle="tooltip" data-placement="top" title="Penjelasan fungsi..."></i>`
2. **Inisialisasi Tooltip**:
   * Setiap view yang memuat icon tooltip wajib menginisialisasi tooltip Bootstrap pada skrip client-side (`$('[data-bs-toggle="tooltip"], [data-toggle="tooltip"]').tooltip();`).
3. **Prinsip Konfigurasi Bisnis vs DataTables**:
   * Pengaturan fitur kebijakan bisnis wajib diletakkan pada Form Tambah & Edit menggunakan kontrol `<select>` yang rapi dengan bantuan icon tooltip, bukan ditumpuk menjadi deretan switch di dalam baris DataTables.

---

## 9. Standar Proteksi Wrapping Rentang Tanggal DataTables (`text-nowrap`) & Kolom Pembuat
1. **Proteksi Pemotongan Kata pada Tanggal (Anti-Hyphenation Break)**:
   * Karakter strip (`-`) pada rentang tanggal seringkali memicu browser memotong teks di tengah angka (misal `06-11-` di atas dan `2026 (23:59)` di bawah).
   * Elemen rentang tanggal/jam pada DataTables WAJIB dilindungi dengan class `text-nowrap`:
     `<span class="text-primary font-11 text-nowrap">${row.periode_range}</span>`
2. **Integrasi Kolom Pembuat & Waktu Pembuatan (Audit Log)**:
   * Informasi nama staf pembuat dan waktu dibuat (`created_at`) disatukan dalam satu sel kolom `DIBUAT OLEH` (nama admin di atas, tanggal pembuatan di bawah) dengan class `text-nowrap`:
     ```html
     <div>
         <span class="text-dark font-11 text-nowrap">${row.admin_name}</span>
         <div class="text-muted font-10 text-nowrap mt-1">${row.created_at}</div>
     </div>
     ```
   * Hal ini menjaga keterbacaan tinggi tanpa membebani tabel dengan pertambahan kolom horizontal baru.

---

## 10. Standar Halaman Profil Akun Staf & Form Password (2 Kartu Bertumpuk)
1. **Layout 2-Kartu Bertumpuk Terpusat (*Centered Stacked Cards*)**:
   * Halaman menggunakan wrapper terpusat (`col-xl-9 col-lg-10 col-md-11 mx-auto`) dengan dua kartu putih tersusun vertikal:
     - **Card 1: Profile Information**:
       - Judul: `Profile Information`, sub-judul: `Perbarui informasi profil akun Anda`.
       - Field: Nama (`name`), Username (`username`), No Handphone (`handphone`), Alamat (`address`).
       - Tombol aksi: `Simpan Profil` di pojok kanan bawah dengan warna merah bata/crimson (`#c82333`).
     - **Card 2: Update Password**:
       - Judul: `Update Password`, sub-judul: `Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.`.
       - Field: Password Saat Ini (`current_password`), Password Baru (`password`), Konfirmasi Password (`password_confirmation`).
       - Tombol aksi: `Simpan Password` di pojok kanan bawah dengan warna merah bata/crimson (`#c82333`).
2. **Integrated Input Group dengan Tombol Intip Password (Eye Icon)**:
   * Field password menggunakan `.input-group` berbentuk kotak dengan sudut radius 4px (`border-radius: 4px !important;`):
     - Input field: `border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important; border-right: none !important;`.
     - Eye toggle span: `border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important; border-top-right-radius: 4px !important; border-bottom-right-radius: 4px !important; border-left: none !important; background-color: #ffffff !important;`.
     - Focus ring: Highlight border biru `#3b82f6` saat grup difokuskan.
3. **Penyelarasan Notifikasi Toast Mengambang (`$.toast`)**:
   * Menjaga antarmuka kartu tetap bersih dan bebas banner statis dengan menggunakan `$.toast` (pojok kanan atas, hijau untuk sukses, merah untuk eror).
   * Evaluasi pesan eror membaca error bag `validateWithBag('updatePassword', ...)` secara berlapis:
     ```php
     $errorMessage = session('error');
     if (!$errorMessage && isset($errors)) {
         if ($errors->updatePassword->any()) {
             $errorMessage = $errors->updatePassword->first();
         } elseif ($errors->any()) {
             $errorMessage = $errors->first();
         }
     }
     ```

---

## 11. Standarisasi Notifikasi Toast & UX Interaksi pada Modul Paket (Tipe Paket, Tarif Paket, dsb.)
1. **Wajib Notifikasi Toast (`toastAlert`) untuk Feedback Status & Form**:
   * Seluruh feedback operasi data (submit modal form tambah/edit, inline edit matriks tarif, toggle status aktif/nonaktif, dan pasca-hapus data) pada seluruh sub-menu modul **PAKET** (`packages/types`, `packages/prices`, dan alur transaksi paket berikutnya) **WAJIB** menggunakan notifikasi Toast: `toastAlert('success', message)` atau `toastAlert('error', message)` (posisi `top-right`).
   * **DILARANG KERAS** memunculkan modal popup SweetAlert di tengah layar (`Swal.fire({ title: 'Berhasil', ... })`) untuk notifikasi sukses, eror submission, atau konfirmasi toggle status.
2. **Instant Toggle Switch (Zero Interruption)**:
   * Pengubahan status aktif/nonaktif melalui switch toggle wajib langsung dieksekusi secara instan dengan AJAX saat diklik tanpa memunculkan dialog/modal konfirmasi SweetAlert.
   * Jika AJAX sukses, tampilkan Toast sukses. Jika AJAX gagal, kembalikan posisi switch (*rollback*) dan tampilkan Toast eror.
3. **Modal Hapus Menggunakan `actionDelete` Terstandarisasi**:
   * Khusus aksi penghapusan data, gunakan helper `actionDelete(endpoint, id)` untuk menampilkan dialog konfirmasi SweetAlert.
   * Setelah pengguna mengonfirmasi dan penghapusan berhasil/gagal, feedback respon **WAJIB** berupa Toast (`toastAlert('success', ...)` / `toastAlert('error', ...)`), bukan modal SweetAlert tambahan.
4. **Pencegahan Eror & Resiliensi Tab Navigasi Tarif Paket**:
   * **Response Contract Integrity**: Seluruh endpoint Controller yang mengembalikan data AJAX (seperti `distances/data`, `matrix`, `weights/data`) **WAJIB** menggunakan helper base controller `$this->respond($result)` atau Response JSON standar Laravel. **DILARANG** memanggil method non-existent seperti `$result->toArray()` pada objek `ServiceResult` (lihat Kasus #17 di `bug-cases.md`).
   * **DataTables Tab Switch Re-render**: Ketika berganti tab pada antarmuka multi-tab (seperti Tab Matriks Rute, Kelompok Berat, Tarif Antar Jemput), panggil `table.columns.adjust().draw()` atau inisialisasi ulang saat tab aktif pertama kali dibuka guna mencegah layout tabel menciut atau gagal AJAX.
   * **Graceful Fallback & Null Safety**: Setiap response AJAX wajib divalidasi ketersediaan datanya (`res.data || []`) dan menangani state kosong secara elegan agar DataTables tidak memicu peringatan `DataTables warning: Ajax error`.

---

## 12. Standar Bahasa UI Ramah Pengguna & Bebas Jargon Teknis (Human-Friendly UI & Anti-Technical Jargon)
1. **Prinsip Bebas Jargon Teknis**:
   * Sistem ini dioperasikan oleh staf admin, agen, dan operator operasional shuttle/paket yang merupakan pengguna awam (non-teknis).
   * **DILARANG KERAS** menggunakan istilah teknis rekayasa software internal pada antarmuka pengguna, seperti kata `database`, `database operasional`, `query`, `tabel`, `record`, `backend`, `endpoint`, atau rincian teknis internal lainnya.
2. **Transformasi Copywriting Teknis ➔ Konteks Bisnis Nyata**:
   * Ganti *"disimpan ke database operasional"* ➔ *"disimpan menjadi harga tarif operasional"* atau *"disimpan ke sistem"*.
   * Ganti *"YA, SIMPAN KE DATABASE"* ➔ *"YA, SIMPAN TARIF OPERASIONAL"* atau *"YA, SIMPAN PERUBAHAN"*.
   * Ganti *"Password (16 Karakter):"* ➔ cukup *"Password :"*.
   * Ganti *"Input disanitasi dari SQL injection"* ➔ cukup *"Karakter khusus tidak diizinkan"*.
3. **Cakupan Seluruh Elemen Tampilan**:
   * Aturan ini berlaku mutlak pada seluruh teks label form, alert panduan (`.alert`), dialog konfirmasi/modal (`.modal-title`, `.modal-body`), tombol aksi (`<button>`), tooltip, placeholder input, serta pesan umpan balik Toast (`toastAlert`).

---

## 13. Standar Komponen Modal & Formulir Terpadu Reusable (Single Source of Truth Modal)
1. **Prinsip Eliminasi Duplikasi Modal (DRY UI Architecture)**:
   * Jika terdapat antarmuka modal dialog atau formulir yang mengelola entitas bisnis yang sama di $\ge 2$ menu (contoh preseden: Modal Atur Rencana Jadwal / Supir / Armada / Biaya Operasional pada menu Penjadwalan `apps/trip-management/plan`, Kirim Paket `apps/package/order/index`, dan Detail Manifest `apps/trip-management/manifest/detail`):
     - **DILARANG KERAS** menulis ulang struktur HTML modal `<div class="modal fade" id="...">` secara inline berulang-ulang di setiap file view.
     - **WAJIB** mengekstraksi modal tersebut menjadi satu file partial view terpadu: `resources/views/apps/[module]/partials/modal-[nama].blade.php`.
     - Setiap view utama cukup menyertakan komponen tersebut dengan direktif Blade: `@include('apps.[module].partials.modal-[nama]')`.
2. **Pola Dual-Mode Binding (Server-Side + Client-Side Hydration)**:
   * Partial modal reusable harus dirancang agar fleksibel dan tangguh digunakan dalam dua mode interaksi:
     - **Mode Server-Side (Hydrated by Blade)**: Membaca variabel Blade yang di-pass controller (misal `$manifest ?? null`). Atribut `value`, `selected`, atau `action` menggunakan conditional fallback aman:
       - `action="{{ isset($manifest) ? route('trip-managements.manifests.update-plan', $manifest->code) : '' }}"`
       - `{{ (isset($manifest) && ($manifest->vehicle_list_id ?? null) == $v->id) ? 'selected' : '' }}`
     - **Mode Client-Side (Hydrated by JavaScript/AJAX)**: Elemen form tetap mempertahankan ID dan name standar (`#plan_tripcode`, `#vehicle_list_id`, `#driver_list_id`, `#e_toll_card_id`, dsb.) agar skrip JavaScript di halaman index (seperti `plan.js` dan `package-order.js`) dapat melakukan populasi data secara dinamis via AJAX (`$('#plan_tripcode').val(...)`) tanpa hambatan.
3. **Manfaat & Proteksi Kualitas (Quality Shield)**:
   * **Zero Code Bloat**: Memangkas ratusan baris kode HTML redundan (~450 baris duplikasi tereliminasi tuntas).
   * **Sinkronisasi Data Otomatis**: Penambahan field baru (seperti rincian 13 item biaya operasional, KM berangkat/sampai) langsung aktif di seluruh menu terkait tanpa risiko ada menu yang tertinggal atau inkonsisten.
   * **Kemudahan Pemeliharaan (*Maintainability*)**: Developer hanya perlu memeriksa dan memelihara 1 berkas sumber terpusat.
   * **Pemeriksaan Wajib di Tahap Review**: AI Agent WAJIB memeriksa ketersediaan komponen modal serupa saat menyusun Review Task agar tidak membuat duplikasi baru.
