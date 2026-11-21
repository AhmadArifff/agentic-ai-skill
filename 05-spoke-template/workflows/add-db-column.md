# Workflow: Penambahan Kolom Database (Manual SQL + Migration Sync)

Gunakan alur kerja ini saat ada kebutuhan menambah atau memodifikasi kolom/tabel database.

---

> [!CAUTION]
> **DILARANG KERAS** menjalankan `php artisan migrate` di terminal! Eksekusi migrasi otomatis dilarang demi menjaga keutuhan data produksi.

---

## Langkah 1: Susun Kueri SQL Manual
1. Rancang kueri DDL dengan klausa pengaman:
   ```sql
   ALTER TABLE `nama_tabel` 
   ADD COLUMN `nama_kolom` VARCHAR(100) NULL AFTER `kolom_sebelumnya`;
   ```
2. Sajikan kueri SQL tersebut kepada pengguna di chat agar pengguna dapat menjalankannya secara manual di **phpMyAdmin**.

## Langkah 2: Tunggu Konfirmasi Pengguna
* Jangan melanjutkan penulisan kode model/repository yang mengakses kolom baru tersebut sebelum pengguna mengonfirmasi bahwa query SQL telah sukses dieksekusi di database.

## Langkah 3: Sinkronisasi Berkas Migrasi Laravel (Sebagai Arsip)
1. Buat atau perbarui berkas migration Laravel di `database/migrations/`:
   ```php
   public function up(): void
   {
       Schema::table('nama_tabel', function (Blueprint $table) {
           if (!Schema::hasColumn('nama_tabel', 'nama_kolom')) {
               $table->string('nama_kolom', 100)->nullable()->after('kolom_sebelumnya');
           }
       });
   }

   public function down(): void
   {
       Schema::table('nama_tabel', function (Blueprint $table) {
           if (Schema::hasColumn('nama_tabel', 'nama_kolom')) {
               $table->dropColumn('nama_kolom');
           }
       });
   }
   ```
2. **Ingat**: Berkas ini disimpan murni sebagai riwayat dokumentasi skema kode, **bukan untuk dieksekusi via CLI**.

## Langkah 4: Perbarui Model Eloquent
* Tambahkan nama kolom ke properti `$fillable` (atau pastikan `$guarded = []`).
* Jika bertipe json atau date, tambahkan ke array `$casts`.
