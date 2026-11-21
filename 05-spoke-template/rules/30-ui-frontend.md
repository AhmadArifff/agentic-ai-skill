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

---

## 12. Standar Rendering DataTables Sisi Klien (`columns[].render` & XSS Escape)
1. **Wajib Merender Badge, Warna, Link & Tombol di Frontend (Bukan dari JSON Backend)**:
   * Kolom tabel berbasis AJAX DataTables wajib menerima field data mentah/murni dari endpoint `GET` (lihat [`rules/10-architecture.md`](./10-architecture.md) Bagian 5), lalu merangkai badge Bootstrap (`bg-soft-*`), ikon, penataan multi-baris, dan tombol aksi di callback `columns[].render(data, type, row)` pada berkas JS halaman (`public/js/apps/...`).
   * Gunakan `'data': null` pada kolom yang menggabungkan beberapa field mentah dalam 1 sel (misal kode + waktu, penumpang terjual vs kapasitas, tombol aksi dinamis).
2. **Proteksi XSS (`escapeHtml`) Wajib untuk Semua Teks Dinamis**:
   * Setiap string input pengguna/DB (nama supir, nama penumpang, kode rute, plat nomor, catatan) yang disisipkan ke template HTML string di `render()` **WAJIB dilewatkan melalui helper `escapeHtml()`** terlebih dahulu sebelum masuk ke DOM.
3. **Penanganan Error AJAX DataTables yang Elegan**:
   * Matikan alert popup bawaan browser DataTables yang kaku bila diperlukan dengan `$.fn.dataTable.ext.errMode = 'none'` dan tangani `ajax.error` atau event `error.dt` menggunakan `toastAlert('error', ...)` agar pengguna mendapat pesan operasional yang jelas.
4. **Pemangkasan Payload `ajax.data` Server-Side (Anti-`414 URI Too Long`)**:
   * Pada DataTables dengan `serverSide: true` dan jumlah kolom banyak (misal 15-39 kolom), `type: 'GET'` bawaan mengirim array `columns[0..N]` hingga ribuan karakter ke query string yang berisiko ditolak server/WAF dengan `HTTP 414 URI Too Long`.
   * Jika backend tidak memakai sorting/pencarian per-kolom DataTables, pangkas payload di `ajax.data(d)` menjadi field inti saja (`draw`, `start`, `length`, `search: { value }`, dan filter formulir).

---

## 13. Standar Komponen Modal & Popup Portable Lintas-Halaman (Single Source of Truth)
Agar modal popup (contoh: `#modal-plan` *Atur Rencana Jadwal & Biaya Operasional*, `#modal-package-mutation`, dll.) dapat dimuat di tampilan mana saja tanpa tumpang tindih, konflik ID, maupun duplikasi kode, wajib terapkan 4 standar berikut:

1. **Pemusatan Blade Partial + Shared JS Handler (Anti-Duplikasi 2 Lapis)**:
   * **Blade HTML**: Pusatkan ke `resources/views/apps/[domain]/partials/modal-[nama].blade.php` (atau `resources/views/apps/shared/modals/modal-[nama].blade.php` untuk komponen lintas-domain), lalu muat dengan `@include(...)`.
   * **Shared JS Controller (Anti Copy-Paste JS)**: Logika buka modal, binding Select2, kalkulasi biaya, reset form, dan submit AJAX **DILARANG di-copy-paste** ke masing-masing file JS halaman (`plan.js`, `package-order.js`, `manifest-detail.js`). Ekstrak menjadi 1 berkas JS portabel mandiri (misal `public/js/apps/shared/modal-[nama].js` atau `public/js/apps/[domain]/modal-[nama].js`) yang diekspos sebagai modul/namespace dengan callback.
   * **Anti-Duplicate Asset Load**: Sertakan skrip JS komponen cukup satu kali menggunakan `@pushOnce('custom-script')` agar tidak termuat ganda bila beberapa partial saling memanggil.
2. **Isolasi Konteks Halaman Pemanggil (Zero Conflict & Zero CSS Leak)**:
   * **Prefix ID & Selector**: Seluruh elemen internal modal wajib memakai prefix spesifik modal (misal `#modal_plan_date`, `#modal_tripcode`, `#form-modal-plan`) agar tidak pernah bentrok dengan ID milik halaman induk.
   * **Scoped CSS & Z-Index**: Aturan CSS khusus modal (tinggi Select2, z-index, styling input) wajib diawali ID modal (contoh: `#modal-plan .select2-container { z-index: 1060 !important; }`). **DILARANG** menulis selector global tanpa prefix modal agar tampilan halaman induk tidak rusak.
   * **Binding Parent Dropdown & Datepicker**: Select2 wajib mengikat `dropdownParent: $('#modal-[nama] .modal-content')`, dan DateRangePicker mengikat `parentEl: '#modal-[nama]'`.
   * **Idempotent Event & Reset Bersih**: Daftarkan event listener menggunakan pola aman (`.off('...').on(...)`) dan wajib bersihkan state/input pada event `hidden.bs.modal` agar tidak ada sisa data cache saat modal dibuka berulang kali di halaman yang sama.
3. **Dual-Mode Binding & Kemandirian Data Master**:
   * Komponen modal wajib aman terhadap ketiadaan variabel Blade dari controller halaman pemanggil: gunakan fallback aman (`$manifest ?? null`, `$vehicles ?? collect()`) atau dukung *lazy-load AJAX* data dropdown master jika `$vehicles` / `$drivers` belum dikirim oleh controller halaman pemanggil.
   * Modal **tidak boleh meng-hardcode** pemanggilan fungsi refresh halaman tertentu di dalamnya; seluruh efek pasca-simpan diserahkan ke callback `onSuccess(res)` dari halaman pemanggil.
4. **Gerbang Audit Wajib di Seluruh Siklus Kerja (Planning, Development, Fix-Bug & Evaluasi)**:
   * **Planning & Review**: Wajib inventarisasi modal/partial eksisting sebelum mendesain modal baru atau menyambungkan ke halaman baru, serta deklarasikan daftar halaman pemakai (*consumers*).
   * **Development & Fix-Bug**: Setiap perubahan field, validasi, atau perbaikan bug pada modal reusable wajib memastikan **seluruh halaman pemanggil** tetap sinkron dan tidak regresi.
   * **Evaluasi Akhir**: Periksa tidak ada HTML modal duplikat, tidak ada logika JS modal yang disalin-tempel antar modul, tidak ada ID bentrok, dan tidak ada CSS bocor di seluruh halaman pemakai.

---

## 14. Proteksi Input Real-Time & Nilai Ekstrem (Percent 1..100, Leading-Zero, Paste & .input-group Error Placement)

Untuk mencegah kelolosan input ekstrem (contoh: mengetik `60000`, `0`, `050`, atau mem-paste nominal Rupiah ke kolom persentase `%`), setiap form transaksi maupun master data wajib mematuhi 5 standar pertahanan input berikut:

1. **Multi-Event Guard Real-Time (Bukan Hanya `keyup` atau `submit`)**:
   * Pengikatan validasi tidak boleh hanya mengandalkan `keyup` (yang lolos saat *click-right Paste*, *drag-drop*, atau autofill) maupun validasi `submit` semata.
   * Wajib ikat serentak pada event `input`, `paste`, `blur`, dan `change` pada pemilih jenis potongan (`#value_type` / `#type`).
2. **Normalisasi Digit & Anti-Leading-Zero Real-Time**:
   * Bersihkan karakter non-angka dan angka nol di depan (`clean.replace(/^0+(?!$)/, '')`) sehingga `050` langsung ternormalisasi menjadi `50` (atau kosong bila murni karakter tidak valid).
   * Di mode Rupiah (`price` / `selling_price`), format ribuan (`.` titik ribuan) otomatis mengikuti konvensi input harga.
3. **Larangan *Silent Auto-Cap* `60000` ➔ `100%` Saat Pergantian Tipe atau Salah Input**:
   * Saat jenis potongan diubah dari nominal (`Rp`, misal `60.000`) ke persentase (`%`), ataupun ketika pengguna mengetik `60000` / `0` di mode `%`, sistem **DILARANG mengubah diam-diam nilai `60000` menjadi `100`** tanpa tanda error/konfirmasi yang jelas.
   * Mengubah paksa angka besar menjadi `100` secara senyap berisiko fatal secara finansial: staf/kasir yang berniat memberi diskon `Rp 60.000` justru berisiko menyimpan voucher/promo **Diskon 100% (Gratis)** tanpa sadar.
   * Berikan indikator merah instan (`is-invalid`) serta pesan kontekstual yang mengarahkan pengguna: apakah nilai persentase di luar `1..100%` atau jenis potongannya perlu dipindahkan ke `Nominal Potongan (Rp)`.
4. **Kompatibilitas jQuery Validate pada `.input-group` & Input Teks Biasa**:
   * Callback `highlight` dan `unhighlight` WAJIB ikut men-toggle kelas `is-invalid` / `is-valid` pada input/select standar, bukan hanya `.select2-container`.
   * Callback `errorPlacement` WAJIB mengecek `element.closest('.input-group')`: jika elemen berada di dalam `.input-group`, letakkan `.invalid-feedback` **setelah `.closest('.input-group')`** (`error.insertAfter(element.closest('.input-group'))`) agar radius pil `.input-group` tidak patah dan teks error tampil utuh di bawah input.
   * Pada objek `messages` jQuery Validate, hindari mendefinisikan pesan sebagai string tunggal (seperti `value: 'Wajib diisi'`) karena akan menimpa pesan error custom rule (`validPercentRange`). Gunakan format objek per-aturan (misal `value: { required: '...' }`).
5. **Pertahanan Lapis Backend (`FormRequest`) yang Sinkron**:
   * `FormRequest` (`rules()` / `after()`) wajib selalu memvalidasi batas nyata per mode (khusus `percent`: angka valid rentang `1..100`, untuk nominal `>= 0` sesuai kebutuhan bisnis) agar payload langsung dari DevTools/Postman tidak pernah menembus aturan antarmuka.
   * Hindari penghapusan titik sembarangan dengan `dot_replace()` yang berpotensi mengubah pecahan `50.5` menjadi `505` saat tipe `percent`.

---

## 15. Standar Penataan Tombol Modal Footer (Right-Aligned Clustered Action Standard)

Untuk menciptakan konsistensi antarmuka pengguna (*visual alignment*) yang selaras dengan seluruh modul sistem:

1. **Pengelompokan di Pojok Kanan Bawah (`d-flex justify-content-end gap-2`)**:
   * Seluruh footer modal form/konfirmasi **WAJIB** menempatkan tombol-tombolnya berkumpul di pojok kanan bawah menggunakan kelas `modal-footer bg-light py-2 px-3 border-top d-flex justify-content-end gap-2` (atau padding yang proporsional).
   * **DILARANG KERAS** menggunakan `d-flex justify-content-between` yang melempar tombol Tutup/Batal ke ujung kiri dan tombol Simpan ke ujung kanan modal, karena merusak fokus ergonomis pengguna (*eye-tracking & mouse travel distance*).
   * *Pengecualian*: Hanya diperbolehkan jika terdapat kontrol navigasi/tautan tambahan yang sengaja ditempatkan di sisi kiri (misal: link *"Lihat Saldo & Riwayat Supir"* atau *"Cetak Manifest"*).
2. **Urutan Baku Tombol (Action-First, Dismiss-Last)**:
   * **Tombol Aksi Utama (Kiri di dalam kluster)**: Tombol aksi utama (seperti `[SIMPAN]`, `[YA, PROSES...]`, `[SELESAIKAN]`) ditulis pertama agar berada di sebelah kiri dari tombol pembatalan.
   * **Tombol Tutup / Batal (Kanan Luar di dalam kluster)**: Tombol penutup modal (seperti `[Tutup]` atau `[BATAL]`) ditulis setelah tombol aksi utama sehingga berada di posisi paling kanan bawah.
   * Format HTML standar:
     ```html
     <div class="modal-footer bg-light py-2 px-4 border-0 d-flex justify-content-end gap-2">
         <button type="submit" class="btn btn-sm btn-primary rounded-pill fw-bold px-4" id="btn-submit">
             <i class="las la-save me-1 font-16"></i> SIMPAN PERUBAHAN
         </button>
         <button type="button" class="btn btn-sm btn-secondary rounded-pill font-12 px-3" data-bs-dismiss="modal">
             Tutup
         </button>
     </div>
     ```
