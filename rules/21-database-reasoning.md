---
description: Database Reasoning, Schema Evolution & Legacy vs Modern Mapping (transport_system vs sunjaya_dev)
globs: database/**, app/Models/**, app/Repositories/**, *.sql
---

# 21. Database Reasoning & Schema Evolution: Legacy (`sunjaya_dev`) vs Modern (`transport_system`)

Dokumen ini adalah **panduan penalaran basis data (*database reasoning framework*)** bagi AI Agent dan tim pengembang untuk memahami struktur, relasi, evolusi skema, dan transformasi logika bisnis antara database sistem legacy (**`admin-sunjaya-dev`** / `sunjaya_dev`) dengan database sistem operasional modern (**`adminShuttleV3`** / `transport_system`).

---

## 1. Filosofi & Peran Kedua Database

| Aspek | Legacy Database: `sunjaya_dev` | Modern Database: `transport_system` |
| :--- | :--- | :--- |
| **Sistem Pemilik** | `admin-sunjaya-dev` (`C:\Users\ASUS\Documents\Web Dev\sunjaya\Roleback\admin-sunjaya-dev`) | `adminShuttleV3` (Sistem Aktif Saat Ini) |
| **Berkas SQL Dump** | `sunjaya_dev-*.sql` (misal `sunjaya_dev-23-10-2026.sql`) | `transport_system-*.sql` (misal `transport_system-23-10-2026.sql`) |
| **Karakter Arsitektur** | Monolitik legacy (139 tabel), denormalisasi tinggi, multi-bisnis (travel, kargo, rental, charter). | Modular refactored (83 tabel), normalisasi terstruktur, fokus shuttle & travel operasional. |
| **Fungsi Bagi AI** | **Referensi Historis**: Sumber pemahaman alur bisnis lama, rumus tarif, dan komparasi fitur. | **Ground-Truth Mutlak**: Acuan tunggal pembuatan Model Eloquent, FormRequest, Service, dan Migrasi. |
| **Aturan Kueri** | ❌ **DILARANG** mengarahkan kueri aplikasi ke `sunjaya_dev`. | ✅ **Seluruh kode aplikasi** wajib beroperasi pada `transport_system`. |

> [!IMPORTANT]
> **Ground-Truth Rule**: Jangan pernah mengasumsikan kolom di `transport_system` sama persis dengan `sunjaya_dev`. Saat mengembangkan fitur atau mengadopsi modul dari `admin-sunjaya-dev`, AI Agent **WAJIB memeriksa berkas SQL dump `transport_system-*.sql` terbaru** sebagai sumber kebenaran skema fisik.

---

## 2. Matriks Pemetaan Domain: Legacy ➔ Modern

Evolusi dari `sunjaya_dev` ke `transport_system` melibatkan pemecahan tabel monolitik (*decomposition*), penyederhanaan relasi, dan penamaan entitas yang lebih eksplisit:

```
┌─────────────────────────────────────────┐          ┌─────────────────────────────────────────┐
│     LEGACY: sunjaya_dev (139 Tabel)     │          │  MODERN: transport_system (83 Tabel)    │
├─────────────────────────────────────────┤          ├─────────────────────────────────────────┤
│ transactions (monolitik 65+ kolom)      │   ───►   │ ticket_transactions (header transaksi)  │
│ transaction_details                     │   ───►   │ tickets (detail kursi & tiket fisik)    │
│ transaction_temps                       │   ───►   │ ticket_transaction_temps & ticket_temps │
│ (belum ada lock kursi real-time)        │   ───►   │ ticket_seat_locks (seat locking engine) │
│                                         │          │                                         │
│ vouchers (campuran master & serial)     │   ───►   │ vouchers (master batch & aturan)        │
│                                         │   ───►   │ voucher_data (serial unik per kupon)    │
│ promotions (campuran tiket & paket)     │   ───►   │ promotions (khusus tiket penumpang)     │
│                                         │   ───►   │ package_promotions (khusus paket kargo) │
│                                         │          │                                         │
│ layouts & layout_details                │   ───►   │ vehicle_layouts & vehicle_layout_details│
│ regencies, districts, villages (4-level)│   ───►   │ cities & provinces (2-level terfokus)   │
│ super_admin, nrp, active (admins)       │   ───►   │ is_superadmin, employee_id, is_active   │
└─────────────────────────────────────────┘          └─────────────────────────────────────────┘
```

---

### A. Domain 1: Transaksi, Pemesanan & Kasir Tiket (*Ticketing & Booking*)

| Entitas Data | Tabel Legacy (`sunjaya_dev`) | Tabel Modern (`transport_system`) | Transformasi & Penalaran Arsitektur |
| :--- | :--- | :--- | :--- |
| **Header Transaksi** | `transactions` | `ticket_transactions` | Pada legacy, `transactions` menampung tiket travel, paket, rental, dan charter sekaligus dalam 65+ kolom. Pada `transport_system`, `ticket_transactions` difokuskan khusus untuk transaksi tiket penumpang shuttle dengan relasi bersih ke payment gateway dan user. |
| **Detail Tiket/Kursi** | `transaction_details` | `tickets` | Menampung data penumpang per kursi: `ticket_number`, `passenger_name`, `passenger_phone`, `seat_id`, `price`, status check-in, dan boarding pass. |
| **Transaksi Sementara** | `transaction_temps` & `transaction_detail_temps` | `ticket_transaction_temps` & `ticket_temps` | Menampung pemesanan dalam proses (checkout in-progress) sebelum pembayaran terkonfirmasi. |
| **Penguncian Kursi** | *Tidak ada tabel khusus* | `ticket_seat_locks` | Engine penguncian kursi real-time saat kasir atau customer sedang memilih kursi untuk mencegah *double-booking* kursi yang sama. |
| **Riwayat Reschedule** | Kolom `reschedule_data` (JSON teks) | `ticket_reschedule_histories` | Dinormalisasi ke tabel riwayat terpisah untuk audit pergantian jadwal dan selisih tarif. |
| **Riwayat Cetak** | `print_logs` | `transaction_printed_histories` & `print_logs` | Audit riwayat cetak tiket fisik di loket/outlet untuk mencegah duplikasi tiket fisik. |

---

### B. Domain 2: Promosi & Voucher Diskon (*Promotions & Vouchers*)

| Entitas Data | Tabel Legacy (`sunjaya_dev`) | Tabel Modern (`transport_system`) | Transformasi & Penalaran Arsitektur |
| :--- | :--- | :--- | :--- |
| **Master Voucher** | `vouchers` | `vouchers` | Pengaturan master kampanye voucher: `voucher_type` (regular, roundtrip, free), `value`, `value_type` (percent, price, selling_price), `start_periode`, `end_periode`, `usage_quota`, `trips`, dan `days_used`. |
| **Serial Kode Voucher** | *Tercampur di `vouchers`* | `voucher_data` | **Normalisasi Krusial**: Satu master voucher dapat men-generate puluhan/ribuan serial kode unik. Kolom: `voucher_id`, `voucher_code` (unique), `used`, `used_phone`, `expired_date`, `sold`, `created_by`. Dilengkapi fitur *bulk delete* dan *regenerate voucher*. |
| **Voucher Paket Kargo** | *Tidak ada* | `package_vouchers` | Voucher diskon yang khusus dialokasikan untuk layanan pengiriman barang/paket kargo. |
| **Promo Tiket Penumpang** | `promotions` (campuran) | `promotions` | Khusus promosi tiket penumpang: diskon tiket, integrasi slider via `add_to_slider` (`promo_type = 'ticket'`), rute terpilih, dan trip multi-select. |
| **Promo Paket Kargo** | *Tercampur di `promotions`* | `package_promotions` | **Pemisahan Entitas**: Khusus promosi kargo dengan atribut spesifik logistik: `min_weight`, `max_weight`, `promotion_code`, diskon tarif ongkir, diskon freepass, dan integrasi slider via `add_to_slider` (`promo_type = 'package'`). |
| **Banner Promosi** | `sliders` | `sliders` | Tabel banner promosi. Menghubungkan banner dengan promo tiket atau promo paket via kolom `promo_type` (`ticket` atau `package`). |

---

### C. Domain 3: Penjadwalan, Rute & Penetapan Harga (*Schedules & Dynamic Pricing*)

| Entitas Data | Tabel Legacy (`sunjaya_dev`) | Tabel Modern (`transport_system`) | Transformasi & Penalaran Arsitektur |
| :--- | :--- | :--- | :--- |
| **Jadwal Reguler** | `schedules` | `schedules` | Master jadwal operasional: `route_id`, `vehicle_id`, `driver_id`, jam keberangkatan (`departure_time`), estimasi tiba (`arrival_time`), dan status aktif. |
| **Jadwal Tambahan** | `schedule_extras` | `schedule_extras` & `schedule_extra_prices` | Jadwal keberangkatan ekstra/tambahan saat lonjakan penumpang beserta penetapan tarif tambahannya. |
| **Harga per Hari** | `schedule_prices` | `schedule_prices` & `schedule_price_days` | Penetapan tarif dinamis berbasis hari keberangkatan (Senin s.d Minggu) untuk mengakomodasi perbedaan tarif *weekday* vs *weekend*. |
| **Harga per Kursi** | `schedule_price_seats` | `schedule_price_seats` & `schedule_price_seat_details` | Penetapan tarif khusus untuk nomor kursi tertentu (misal kursi baris depan lebih mahal). |
| **Surcharge / Peak Season** | *Tidak terstruktur* | `schedule_price_surcharges` & `schedule_price_surcharge_details` | Biaya tambahan musiman (Hari Raya Idul Fitri, Natal, Tahun Baru) dengan periode berlaku otomatis. |
| **Jadwal Transit** | `schedule_connections` | `route_transits`, `schedule_transits`, `schedule_transit_offs` | Manajemen rute transit multi-outlet: menghubungkan beberapa rute dalam satu perjalanan bersambung. |
| **Buka/Tutup Jadwal** | *Manual edit* | `schedule_offs` & `schedule_opens` | Kontrol otomatis penonaktifan sementara atau pembukaan kembali jadwal pada tanggal tertentu. |

---

### D. Domain 4: Kendaraan & Layout Kursi (*Vehicles & Seat Layouts*)

| Entitas Data | Tabel Legacy (`sunjaya_dev`) | Tabel Modern (`transport_system`) | Transformasi & Penalaran Arsitektur |
| :--- | :--- | :--- | :--- |
| **Layout Denah Kursi** | `layouts` | `vehicle_layouts` | Penamaan diperjelas dari `layouts` menjadi `vehicle_layouts`. Menyimpan dimensi grid denah: `capacity`, `class` (business, executive, dsb), `total_deck`, `cols`, `rows`. |
| **Detail Elemen Kursi** | `layout_details` | `vehicle_layout_details` | Posisi koordinat grid per kursi, tipe elemen (kursi penumpang, supir, pintu, lorong/jalan), nomor label kursi, dan status aktif. |
| **Master Kendaraan** | `vehicles` & `vehicle_lists` | `vehicles` | Penggabungan: `vehicle_lists` di legacy dieliminasi. `vehicles` di `transport_system` langsung memegang nomor polisi, tipe armada, dan foreign key `vehicle_layout_id`. |
| **Kursi Terpakai (View)** | `v_seat_used`, `v_past_seat_used` | `v_seat_used`, `v_past_seat_used` | SQL Views untuk mengecek ketersediaan kursi secara instan tanpa kueri agregasi lambat. |

---

### E. Domain 5: Manajemen Admin & Autentikasi Staf (*Admins & RBAC*)

| Kolom / Konsep | Legacy (`sunjaya_dev.admins`) | Modern (`transport_system.admins`) | Alasan & Dampak Kode |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `super_admin` (`enum('y','n')`) | `is_superadmin` (`enum('y','n')`) | Penamaan kolom diseragamkan dengan konvensi boolean Laravel (`is_...`). |
| **Nomor Pegawai** | `nrp` (`int`) | `employee_id` (`varchar(50)`) | Format ID staf menjadi string alfanumerik fleksibel (bisa menampung kode huruf outlet/cabang). |
| **Status Keaktifan** | `active` (`tinyint unsigned DEFAULT 0`) | `is_active` (`enum('y','n') DEFAULT 'y'`) | Diselaraskan ke enum `y`/`n` konsisten dengan tabel lain di `transport_system`. |
| **Foto Profil** | `image` (`varchar(255)`) | `image` (`varchar(255)`) | Di `transport_system`, foto disimpan ke storage MinIO/lokal via `ProfileService` dan diakses melalui accessor `getImageUrlAttribute()`. |
| **Sesi Login** | `is_logged_in`, `logged_in_at` | `current_session_id`, `admin_login_histories` | Histori login dicatat ke tabel terpisah `admin_login_histories` untuk audit keamanan. |
| **Hak Akses Menu** | `permissions` (`role_id`, `menu_id`) | `permissions` (`role_id`, `menu_id`) | Granular permissions: kolom boolean `create`, `read`, `update`, `delete`. |

---

### F. Domain 6: Pelanggan, Member & Integrasi Mitra OTA (*Users & OTA*)

| Entitas Data | Tabel Legacy (`sunjaya_dev`) | Tabel Modern (`transport_system`) | Transformasi & Penalaran Arsitektur |
| :--- | :--- | :--- | :--- |
| **Pengguna Aplikasi** | `users` (`type: member, customer, ota, user`) | `users` (`type: member, customer, ota`) | Penyeragaman tipe pengguna. Tipe `user` legacy dihilangkan, disatukan ke `customer` atau `member`. |
| **Kredensial Mitra OTA** | Kolom `api_key` langsung di `users` | `ota_credentials` | **Isolasi Keamanan**: Kredensial mitra pihak ketiga (Traveloka, Tiketux, Redbus) dipindahkan ke tabel khusus `ota_credentials` lengkap dengan IP whitelist dan expiry. |
| **Poin & Membership** | `user_points`, `memberships` | `user_points`, `user_point_histories`, `memberships`, `membership_types` | Struktur histori perolehan dan penukaran poin yang terpisah dan terverifikasi. |

---

### G. Domain 7: Wilayah Geografis (*Geographic Locations*)

| Entitas Data | Tabel Legacy (`sunjaya_dev`) | Tabel Modern (`transport_system`) | Transformasi & Penalaran Arsitektur |
| :--- | :--- | :--- | :--- |
| **Provinsi** | `provinces` | `provinces` | Identik (kode provinsi 2 digit). |
| **Kota / Kabupaten** | `regencies` | `cities` | **Penyederhanaan Nama**: Dari `regencies` diubah menjadi `cities` agar lebih umum dan mudah dipahami dalam konteks rute travel antar-kota. |
| **Kecamatan & Kelurahan** | `districts`, `villages` | *Disederhanakan / Dihapus* | Shuttle beroperasi pada titik outlet/pool antar-kota, sehingga ratusan ribu data desa/kelurahan BPS dihapus untuk mengoptimalkan kinerja database. |

---

## 3. Alur 5-Langkah Penalaran AI (*AI Reasoning Protocol*)

Setiap kali AI Agent menerima tugas membuat fitur baru, merevisi logika bisnis, atau mengadopsi modul dari sistem `admin-sunjaya-dev`, AI **WAJIB menjalankan 5 langkah penalaran** berikut:

```
[Langkah 1: Periksa SQL Dump Terbaru]
   ├─ Buka transport_system-*.sql terbaru ➔ Catat nama tabel, tipe data, dan indeks.
   └─ Buka sunjaya_dev-*.sql terbaru ➔ Pelajari konteks awal jika modul berasal dari sistem legacy.
                │
                ▼
[Langkah 2: Cek Pemecahan Entitas (Decomposition Check)]
   ├─ Apakah fitur ini di legacy menggunakan tabel monolitik (misal transactions, vouchers, promotions)?
   └─ Jika YA, identifikasi tabel pecahan modern di transport_system (misal voucher_data, package_promotions).
                │
                ▼
[Langkah 3: Pemetaan Mutasi Kolom & Tipe Data]
   ├─ Periksa apakah nama kolom berubah (misal nrp ➔ employee_id, active ➔ is_active).
   └─ Periksa apakah tipe data berubah (misal tinyint ➔ enum 'y'/'n', JSON array ➔ text/relasi).
                │
                ▼
[Langkah 4: Terapkan Arsitektur 4-Layer Bersih]
   ├─ Model: Definisikan $fillable, $casts, relasi belongsTo/hasMany, dan softDeletes.
   ├─ Repository: Query Eloquent murni, isolasi soft-delete, eliminasi N+1 problem.
   ├─ Service: Logika bisnis, transaksi DB (DB::transaction), return ServiceResult.
   └─ Controller: Validasi FormRequest, delegasi ke Service, return view / JSON.
                │
                ▼
[Langkah 5: Siapkan File Migrasi Schema::create & SQL Manual Permission]
   ├─ Buat file migrasi Schema::create di database/migrations/ (100% presisi dengan dump).
   ├─ JANGAN PERNAH jalankan php artisan migrate di lingkungan dev aktif.
   └─ Sediakan SQL manual phpMyAdmin HANYA jika menu/permission belum terdaftar.
```

---

## 4. Kamus Padanan Cepat (*Quick Lookup Dictionary*)

| Kebutuhan Fitur | Di `admin-sunjaya-dev` (`sunjaya_dev`) | Wajib Digunakan di `adminShuttleV3` (`transport_system`) |
| :--- | :--- | :--- |
| Transaksi Tiket | `transactions` | `ticket_transactions` |
| Detail Penumpang & Kursi | `transaction_details` | `tickets` |
| Master Voucher | `vouchers` | `vouchers` |
| Serial Kode Kupon Voucher | `vouchers` (bercampur) | `voucher_data` |
| Promo Tiket | `promotions` (tipe regular) | `promotions` |
| Promo Paket Kargo | `promotions` (tipe package) | `package_promotions` |
| Layout Denah Kursi | `layouts` | `vehicle_layouts` |
| Koordinat Kursi | `layout_details` | `vehicle_layout_details` |
| Master Kendaraan | `vehicles` + `vehicle_lists` | `vehicles` |
| Master Kota | `regencies` | `cities` |
| Status Aktif Admin | `admins.active` (tinyint) | `admins.is_active` (enum `'y'`,`'n'`) |
| ID Staf / Pegawai | `admins.nrp` (int) | `admins.employee_id` (varchar) |
| Hak Superadmin | `admins.super_admin` | `admins.is_superadmin` |
| Rute Tambahan / Transit | `schedule_connections` | `route_transits` & `schedule_transits` |
| Harga Hari Khusus | `schedule_prices` | `schedule_price_days` |
| Surcharge Musiman | *Tidak ada* | `schedule_price_surcharges` |
